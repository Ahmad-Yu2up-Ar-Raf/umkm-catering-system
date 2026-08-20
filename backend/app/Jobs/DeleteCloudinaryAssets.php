<?php

namespace App\Jobs;

use App\Services\CloudinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Best-effort Cloudinary cleanup for paket images removed during an update or
 * a delete. Dispatched with `afterResponse()` so the API response reaches the
 * client immediately — the (potentially slow) storage work never blocks the
 * HTTP request. The default queue connection (`sync`) runs it post-response
 * in the same process; with a worker configured on production it runs truly
 * async. Either way the response is never held hostage by Cloudinary latency.
 */
class DeleteCloudinaryAssets implements ShouldQueue
{
    use Queueable;

    /**
     * @param  list<string>  $urls  canonical Cloudinary URLs (or public ids)
     */
    public function __construct(public array $urls) {}

    public function handle(CloudinaryService $cloudinary): void
    {
        $cloudinary->destroyMany($this->urls);
    }
}
