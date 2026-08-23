<?php

namespace App\Jobs;

use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Log;

/**
 * Best-effort Cloudinary cleanup for assets orphaned by a paket deletion or
 * image replacement.
 *
 * Dispatched with `dispatchSync()` from PaketController — runs inline in the
 * request lifecycle (no queue worker needed locally) and NEVER throws: every
 * failure is logged and swallowed so the DB deletion response stays 200 OK.
 */
class PurgeCloudinaryAssets
{
    /**
     * @param  list<string>  $urls  canonical Cloudinary URLs
     */
    public function __construct(public array $urls) {}

    public function handle(): void
    {
        try {
            Log::info('CLOUDINARY JOB STARTED', ['urls' => $this->urls]);

            if ($this->urls === []) {
                Log::info('CLOUDINARY JOB SKIPPED: no urls');

                return;
            }

            $cloudinary = CloudinaryService::fromConfig();

            if (! $cloudinary->isConfigured()) {
                Log::critical('PurgeCloudinaryAssets aborted: credentials not configured', [
                    'urls' => $this->urls,
                ]);

                return;
            }

            $deleted = $cloudinary->destroyMany($this->urls);
            Log::info('CLOUDINARY JOB RESULT', [
                'requested' => count($this->urls),
                'deleted' => $deleted,
            ]);

            if ($deleted < count($this->urls)) {
                Log::warning('PurgeCloudinaryAssets incomplete', [
                    'requested' => count($this->urls),
                    'deleted' => $deleted,
                    'urls' => $this->urls,
                ]);
            } else {
                Log::info('PurgeCloudinaryAssets completed', [
                    'deleted' => $deleted,
                ]);
            }
        } catch (\Throwable $e) {
            // Never rethrow: cleanup failure must not crash the HTTP request.
            Log::error('FATAL CLOUDINARY JOB CRASH', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'urls' => $this->urls,
            ]);
        }
    }
}
