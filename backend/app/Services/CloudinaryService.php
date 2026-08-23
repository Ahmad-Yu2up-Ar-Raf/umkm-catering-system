<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

/**
 * Thin Cloudinary REST client — proven patterns copied from PaketSeeder:
 * Basic Auth (api_key / api_secret), no SDK, canonical URLs stored in the DB.
 *
 * - `signedParams` — signs a direct browser upload (secret never leaves the
 *   backend; bytes go straight to Cloudinary, never through Laravel).
 * - `destroyMany` / `purgeByPrefix` — async, pooled, best-effort cleanup.
 */
class CloudinaryService
{
    public function __construct(
        private readonly string $cloudName,
        private readonly string $apiKey,
        private readonly string $apiSecret,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            config('cloudinary.cloud_name', ''),
            config('cloudinary.api_key', ''),
            config('cloudinary.api_secret', ''),
        );
    }

    public function isConfigured(): bool
    {
        return $this->cloudName !== '' && $this->apiKey !== '' && $this->apiSecret !== '';
    }

    /**
     * Signed params for a direct client upload — the browser posts the file to
     * Cloudinary with these. Folder lives under the project's canonical
     * `catering-nusantara/products` prefix (matches PaketSeeder).
     *
     * @param  array<string, int|string>  $extra
     * @return array{signature: string, timestamp: int, apiKey: string, cloudName: string, folder: string}
     */
    public function signedParams(string $folder, array $extra = []): array
    {
        $timestamp = now()->timestamp;
        $params = array_merge(['timestamp' => $timestamp, 'folder' => $folder], $extra);

        ksort($params);

        $toSign = collect($params)
            ->map(fn (int|string $v, string $k) => "{$k}={$v}")
            ->implode('&');

        return [
            'signature' => hash('sha1', $toSign . $this->apiSecret),
            'timestamp' => $timestamp,
            'apiKey' => $this->apiKey,
            'cloudName' => $this->cloudName,
            'folder' => $folder,
        ];
    }

    /**
     * Destroy many images from canonical URLs or public ids — batched,
     * concurrent (Http::pool), best-effort. Never throws; a failed delete
     * leaves an orphan asset but never breaks the HTTP request.
     */
    public function destroyMany(array $urlsOrIds, int $concurrency = 5): int
    {
        if (! $this->isConfigured()) {
            logger()->warning('Cloudinary destroy skipped: credentials not configured');

            return 0;
        }

        $publicIds = $this->resolvePublicIds($urlsOrIds);
        if ($publicIds === []) {
            return 0;
        }

        $timestamp = now()->timestamp;

        try {
            $responses = Http::pool(fn (Pool $pool) => collect($publicIds)
                ->map(fn (string $id) => $pool
                    ->asForm()
                    ->withBasicAuth($this->apiKey, $this->apiSecret)
                    ->post('https://api.cloudinary.com/v1_1/'.$this->cloudName.'/image/destroy', [
                        'public_id' => $id,
                        'timestamp' => $timestamp,
                    ]))
                ->all());

            $failed = collect($responses)
                ->filter(fn ($r) => ! ($r instanceof \Illuminate\Http\Client\Response && $r->ok()))
                ->isNotEmpty();

            if ($failed) {
                logger()->warning('Cloudinary destroy: some assets failed to delete', [
                    'requested' => $publicIds,
                ]);
            }

            return collect($responses)
                ->filter(fn ($r) => $r instanceof \Illuminate\Http\Client\Response && $r->ok())
                ->count();
        } catch (ConnectionException $e) {
            logger()->warning('Cloudinary destroy: connection failure', [
                'error' => $e->getMessage(),
                'requested' => $publicIds,
            ]);

            return 0; // network blip — assets are orphaned, not corrupted
        }
    }

    /**
     * Admin API delete-by-prefix (paginated via next_cursor) — the same purge
     * the seeder uses for a clean slate. Use for folder-level cleanup.
     */
    public function purgeByPrefix(string $prefix): int
    {
        if (! $this->isConfigured()) {
            return 0;
        }

        $endpoint = 'https://api.cloudinary.com/v1_1/'.$this->cloudName.'/resources/image/upload';
        $next = null;
        $removed = 0;

        do {
            $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                ->delete($endpoint, ['prefix' => rtrim($prefix, '/').'/'] + ($next !== null ? ['next_cursor' => $next] : []));

            if ($response->failed()) {
                break;
            }

            $removed += collect((array) $response->json('deleted'))->count();
            $next = $response->json('next_cursor');
        } while ($next);

        return $removed;
    }

    /** Extract the Cloudinary public_id (with folder path) from a canonical URL. */
    public function extractPublicIdFromUrl(string $url): ?string
    {
        // Strip query string / fragment before matching.
        $url = preg_replace('#[?#].*$#', '', $url) ?? $url;

        // https://res.cloudinary.com/<cloud>/image/upload/v<ts>/<folder>/<file>.<ext>
        // The extension is only stripped when it is a KNOWN image extension —
        // Cloudinary public_ids may contain dots ("foto.v2.jpg"), so a greedy
        // strip would mangle them and destroy() would hit a nonexistent id.
        if (! preg_match('#/upload/(?:v\d+/)?(.+?)(?:\.(?:jpe?g|png|webp|gif|avif|tiff?|bmp))?$#i', $url, $match)) {
            return null;
        }

        $publicId = $match[1];

        return $publicId === '' ? null : $publicId;
    }

    /**
     * @return list<string>
     */
    private function resolvePublicIds(array $urlsOrIds): array
    {
        $resolved = [];

        foreach (array_unique(array_filter($urlsOrIds)) as $value) {
            $publicId = str_contains($value, '://')
                ? $this->extractPublicIdFromUrl($value)
                : $value;

            if ($publicId !== null && ! in_array($publicId, $resolved, true)) {
                $resolved[] = $publicId;
            }
        }

        return $resolved;
    }
}
