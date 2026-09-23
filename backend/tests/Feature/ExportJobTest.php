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
        ->and(GenerateExportJob::IMAGE_EMBED_MAX_ROWS)->toBe(200);
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
    expect($rewritten)->toContain('w_400,h_400,c_fit,q_auto:good,f_jpg');

    // Already-transformed and non-Cloudinary URLs pass through untouched.
    expect($method->invoke($job, $rewritten))->toBe($rewritten)
        ->and($method->invoke($job, 'https://example.com/a.jpg'))->toBe('https://example.com/a.jpg');
});
