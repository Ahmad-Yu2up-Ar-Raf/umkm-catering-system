<?php

namespace App\Services;

use App\Exceptions\PostHogIntegrationException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Read-only PostHog Query API client (server-side proxy).
 *
 * The Personal API Key never leaves the backend — the React frontend
 * calls `GET /api/v1/admin/visitors`, never PostHog directly.
 *
 * Transparency over resiliency: every failure mode throws
 * PostHogIntegrationException (never a silent 0), so the controller
 * can map it to a 5xx and the dashboard shows an error state
 * instead of false data.
 */
class PostHogAnalyticsService
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $projectId,
        private readonly string $host,
        private readonly int $timeout,
        private readonly string $targetDomain = 'cateringnusantara.vercel.app',
    ) {}

    public static function fromConfig(): self
    {
        $config = config('posthog');

        return new self(
            (string) ($config['api_key'] ?? ''),
            (string) ($config['project_id'] ?? '605827'),
            rtrim((string) ($config['host'] ?? 'https://us.posthog.com'), '/'),
            (int) ($config['timeout'] ?? 3),
            (string) ($config['target_domain'] ?? 'cateringnusantara.vercel.app'),
        );
    }

    public function isConfigured(): bool
    {
        return $this->apiKey !== '' && $this->projectId !== '';
    }

    /**
     * Key family for diagnostics — prefix only, never the key itself.
     * The Query API requires a Personal API Key (phx_...); a Project
     * Key (phc_...) is a client-side capture token and 401s here.
     */
    public function keyPrefix(): string
    {
        if ($this->apiKey === '') {
            return 'missing';
        }
        if (str_starts_with($this->apiKey, 'phx_')) {
            return 'phx_';
        }
        if (str_starts_with($this->apiKey, 'phc_')) {
            return 'phc_';
        }

        return 'other';
    }

    /**
     * Unique production-domain visitors (distinct_id on $pageview events,
     * trailing 30 days, filtered to properties.$host = target domain).
     *
     * The host filter is load-bearing: local dev, LAN, and Vercel preview
     * $pageviews land in the same PostHog project, and without it they
     * inflate the KPI (environment pollution).
     *
     * @throws PostHogIntegrationException on misconfig, HTTP failure,
     *         transport exception, or unexpected response shape.
     */
    public function totalVisitors(): int
    {
        if (! $this->isConfigured()) {
            Log::warning('PostHog visitors query skipped: missing PAT or project ID');

            throw new PostHogIntegrationException('PostHog is not configured (missing PAT or project ID).');
        }

        if ($this->keyPrefix() !== 'phx_') {
            Log::warning('PostHog Query API requires a Personal API Key (phx_...), but a Project Key (phc_...) was provided.');

            throw new PostHogIntegrationException(
                'PostHog Query API requires a Personal API Key (phx_...), but a Project Key (phc_...) was provided.',
                ['key_prefix' => $this->keyPrefix()],
            );
        }

        // Single-quoted segments: $pageview/$host stay literal (no PHP
        // interpolation), and the domain is concatenated in — never sharing
        // a quoting context with the HogQL identifiers.
        $domain = str_replace("'", "\\'", $this->targetDomain);
        $hogql = 'SELECT count(DISTINCT distinct_id) AS total FROM events '
            . 'WHERE event = \'$pageview\' '
            . 'AND properties.$host = \''.$domain.'\' '
            . 'AND timestamp >= now() - INTERVAL 30 DAY';

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->post("{$this->host}/api/projects/{$this->projectId}/query/", [
                    'query' => [
                        'kind' => 'HogQLQuery',
                        // ponytail: counts distinct visitors, not raw pageviews,
                        // so reloads by one person don't inflate the KPI.
                        // 30-day bound: an unbounded full-events scan makes
                        // PostHog time out as event volume grows.
                        'query' => $hogql,
                    ],
                ]);
        } catch (\Throwable $e) {
            Log::warning('PostHog visitors query exception', [
                'message' => $e->getMessage(),
            ]);

            throw new PostHogIntegrationException('PostHog request failed: '.$e->getMessage(), [], $e);
        }

        if (! $response->successful()) {
            Log::warning('PostHog visitors query failed', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new PostHogIntegrationException(
                "PostHog API error (HTTP {$response->status()}).",
                ['status' => $response->status(), 'body' => $response->json()],
            );
        }

        $payload = $response->json();
        $total = Arr::get($payload, 'results.0.0');

        // Strict: only a numeric results[0][0] is a genuine count.
        // null/missing/assoc/empty means a broken contract, not zero.
        if (! is_numeric($total)) {
            Log::warning('PostHog visitors query unexpected shape', [
                'body' => $payload,
            ]);

            throw new PostHogIntegrationException(
                'PostHog returned an unexpected response shape.',
                ['body' => $payload],
            );
        }

        return (int) $total;
    }
}
