<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
     * Destroy many images from canonical URLs or public ids.
     *
     * Uses the ADMIN API bulk delete (`DELETE /resources/image/upload` with
     * `public_ids[]`) authenticated via HTTP Basic auth (api_key:api_secret)
     * — the SAME proven mechanism as `purgeByPrefix` and PaketSeeder. The
     * signed Upload-API `/image/destroy` endpoint was tried before and
     * silently 401'd; do not go back to it.
     *
     * Never throws. Every failure is logged with status + body + ids so
     * orphans are diagnosable in storage/logs/laravel.log.
     */
    public function destroyMany(array $urlsOrIds): int
    {
        Log::info('CLOUDINARY destroyMany CALLED', ['input' => $urlsOrIds]);

        if (! $this->isConfigured()) {
            logger()->warning('Cloudinary destroy skipped: credentials not configured');

            return 0;
        }

        $publicIds = $this->resolvePublicIds($urlsOrIds);
        Log::info('CLOUDINARY RESOLVED PUBLIC IDS', ['public_ids' => $publicIds]);

        if ($publicIds === []) {
            logger()->warning('Cloudinary destroy skipped: no public_ids resolved', [
                'input' => array_values(array_filter($urlsOrIds)),
            ]);

            return 0;
        }

        $endpoint = 'https://api.cloudinary.com/v1_1/'.$this->cloudName.'/resources/image/upload';
        $deleted = 0;

        // Admin API caps public_ids at 100 per call.
        foreach (array_chunk($publicIds, 100) as $chunk) {
            try {
                $urlWithQuery = $endpoint.'?'.http_build_query(['public_ids' => $chunk]);
                Log::info('CLOUDINARY DELETE REQUEST', ['endpoint' => $urlWithQuery, 'chunk' => $chunk]);

                $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                    // Hard bounds so a blackholed Cloudinary connection can
                    // NEVER pin the (single-worker) PHP process — the whole
                    // request queue hangs while this socket is open.
                    ->connectTimeout(3)
                    ->timeout(8)
                    ->delete($urlWithQuery);

                Log::info('CLOUDINARY DELETE RESPONSE', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                if ($response->ok()) {
                    // Response body: {"deleted": {"<id>": "deleted"|"not_found"}}
                    // Count ONLY genuine deletions — "not_found" keys would
                    // otherwise mask wrong-ID regressions in the logs.
                    $map = (array) $response->json('deleted');
                    $reallyDeleted = count(array_filter($map, fn ($v) => $v === 'deleted'));
                    $notFound = count($map) - $reallyDeleted;
                    $deleted += $reallyDeleted;

                    if ($notFound > 0) {
                        logger()->info('Cloudinary delete: some ids not found (already gone)', [
                            'not_found_count' => $notFound,
                            'public_ids' => $chunk,
                        ]);
                    }
                } else {
                    logger()->error('Cloudinary admin delete failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'public_ids' => $chunk,
                    ]);
                }
            } catch (\Throwable $e) {
                logger()->error('Cloudinary admin delete exception', [
                    'error' => $e->getMessage(),
                    'public_ids' => $chunk,
                ]);
            }
        }

        return $deleted;
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
                ->connectTimeout(3)
                ->timeout(8)
                ->delete($endpoint, ['prefix' => rtrim($prefix, '/').'/'] + ($next !== null ? ['next_cursor' => $next] : []));

            if ($response->failed()) {
                break;
            }

            $removed += collect((array) $response->json('deleted'))->count();
            $next = $response->json('next_cursor');
        } while ($next);

        return $removed;
    }

    /** Known image extensions eligible for stripping off a canonical URL. */
    private const IMAGE_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tif', 'tiff', 'bmp',
    ];

    /**
     * Extract the Cloudinary public_id (folder path included) from a
     * canonical URL — using ONLY str* functions.
     *
     * ponytail: preg_* was removed deliberately. The previous regex emitted
     * "Unknown modifier ']'" on the production host (ErrorException caught
     * upstream), silently killing every deletion. Plain string parsing is
     * deterministic and cannot fail this way.
     */
    public function extractPublicIdFromUrl(string $url): ?string
    {
        Log::info('EXTRACT PUBLIC ID INPUT', ['url' => $url]);

        // Strip query string / fragment: cut at the first '?' or '#'.
        $cut = strpbrk($url, '?#');
        if ($cut !== false) {
            $url = substr($url, 0, -strlen($cut));
        }

        // https://res.cloudinary.com/<cloud>/image/upload/v<ts>/<folder>/<file>.<ext>
        $marker = '/upload/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            Log::warning('EXTRACT PUBLIC ID FAILED: /upload/ marker not found', ['url' => $url]);
            return null;
        }

        $publicId = substr($url, $pos + strlen($marker));

        // Drop a leading version segment ("v1234567890/") when present.
        if (str_starts_with($publicId, 'v')) {
            $slash = strpos($publicId, '/');
            if ($slash !== false && ctype_digit(substr($publicId, 1, $slash - 1))) {
                $publicId = substr($publicId, $slash + 1);
            }
        }

        // Strip the extension ONLY when it is a known image extension —
        // Cloudinary public_ids may contain dots ("foto.v2.jpg").
        $dot = strrpos($publicId, '.');
        if ($dot !== false) {
            $ext = strtolower(substr($publicId, $dot + 1));
            if (in_array($ext, self::IMAGE_EXTENSIONS, true)) {
                $publicId = substr($publicId, 0, $dot);
            }
        }

        $result = $publicId === '' ? null : $publicId;
        Log::info('EXTRACT PUBLIC ID RESULT', ['url' => $url, 'public_id' => $result]);

        return $result;
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
