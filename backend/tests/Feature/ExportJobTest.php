<?php

use App\Jobs\GenerateExportJob;
use Illuminate\Support\Facades\Cache;

test('image modules always queue while text modules do not', function () {
    expect(GenerateExportJob::hasImages('paket'))->toBeTrue()
        ->and(GenerateExportJob::hasImages('galeri'))->toBeTrue()
        ->and(GenerateExportJob::hasImages('pesanan'))->toBeFalse()
        ->and(GenerateExportJob::hasImages('testimoni'))->toBeFalse();
});

test('export job budgets stay inside the worker lifespan', function () {
    $job = new GenerateExportJob('probe-token', 'paket');

    // Worker --timeout=1000 with retry_after=1100: job must finish first.
    expect($job->timeout)->toBeLessThan(1000)
        ->and($job->tries)->toBe(1)
        ->and(GenerateExportJob::TEXT_SYNC_THRESHOLD)->toBe(2000)
        // Visual embeds restored with 80px micro-thumbs: worst case 200 rows
        // × 6 thumbs ≈ 10MB zip on disk, ~70MB resident — far under the 512M
        // worker limit (see the constant's memory math). Above the cap the
        // streaming HYPERLINK path keeps large datasets O(1).
        ->and(GenerateExportJob::IMAGE_EMBED_MAX_ROWS)->toBe(200);
});

test('queue reservation outlives the longest job', function () {
    // queue-jobs rule: retry_after must exceed worker --timeout (1000), or a
    // still-running job gets released for double-pickup. The default protects
    // deploys (e.g. HF Space) that omit DB_QUEUE_RETRY_AFTER.
    expect((int) config('queue.connections.database.retry_after'))->toBeGreaterThanOrEqual(1000);
});

test('failed job surfaces a terminal failed status for polling', function () {
    $job = new GenerateExportJob('failing-token', 'galeri');
    $job->failed(new \RuntimeException('boom'));

    expect(Cache::get('exports:failing-token')['status'])->toBe('failed')
        ->and(Cache::get('exports:failing-token')['message'])->toBe('boom');
});

test('thumbnail rewrite targets micro-thumbs and passes the rest through', function () {
    $job = new GenerateExportJob('probe-token', 'paket');
    $method = new \ReflectionMethod(GenerateExportJob::class, 'thumbnailUrl');

    $rewritten = $method->invoke($job, 'https://res.cloudinary.com/demo/image/upload/v123/a.jpg');
    expect($rewritten)->toContain('w_80,h_80,c_fill,g_auto,q_auto:low,f_jpg');

    // Already-transformed and non-Cloudinary URLs pass through untouched.
    expect($method->invoke($job, $rewritten))->toBe($rewritten)
        ->and($method->invoke($job, 'https://example.com/a.jpg'))->toBe('https://example.com/a.jpg');
});
