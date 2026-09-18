<?php

namespace App\Http\Controllers;

use App\Exceptions\PostHogIntegrationException;
use App\Services\PostHogAnalyticsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VisitorsController extends Controller
{
    /**
     * Total site visitors (proxied from PostHog).
     *
     * Success: 200 { data: { totalPengunjung, source: posthog } }.
     * Failure (misconfig, PostHog 4xx/5xx, timeout, bad shape):
     * 502/503 with an error envelope — never 200+0 — so TanStack
     * Query fires isError and the card shows "Data analitik tidak
     * tersedia" instead of false data. Failures are never cached;
     * local env bypasses the cache for immediate debugging.
     */
    public function index()
    {
        $service = PostHogAnalyticsService::fromConfig();

        if (! $service->isConfigured()) {
            Log::warning('PostHog visitors query skipped: missing PAT or project ID');

            $body = [
                'message' => 'Analytics service unavailable (PostHog not configured).',
                'data' => ['totalPengunjung' => null, 'source' => 'fallback'],
            ];
            if (app()->isLocal()) {
                $body['debug'] = ['key_prefix' => $service->keyPrefix()];
            }

            return response()->json($body, 503);
        }

        if (app()->isLocal()) {
            try {
                $total = $service->totalVisitors();
            } catch (PostHogIntegrationException $e) {
                // Local only: surface the upstream diagnostics in the
                // Network tab so the failure is debuggable from the browser.
                return response()->json([
                    'message' => $e->getMessage(),
                    'debug' => $e->context,
                    'data' => ['totalPengunjung' => null, 'source' => 'error'],
                ], 502);
            }

            return response()->json([
                'data' => ['totalPengunjung' => $total, 'source' => 'posthog'],
            ]);
        }

        $cacheKey = 'visitors_reports:total';

        if (Cache::has($cacheKey)) {
            return response()->json([
                'data' => ['totalPengunjung' => (int) Cache::get($cacheKey), 'source' => 'posthog'],
            ]);
        }

        try {
            $total = $service->totalVisitors();
        } catch (PostHogIntegrationException $e) {
            // Never cache failures — a transient 401/timeout must not pin 0.
            return response()->json([
                'message' => $e->getMessage(),
                'data' => ['totalPengunjung' => null, 'source' => 'error'],
            ], 502);
        }

        Cache::put($cacheKey, (int) $total, 300);

        return response()->json([
            'data' => ['totalPengunjung' => (int) $total, 'source' => 'posthog'],
        ]);
    }
}
