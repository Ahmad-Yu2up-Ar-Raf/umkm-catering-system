<?php

use App\Jobs\GenerateExportJob;
use App\Models\Galeri;
use App\Models\Paket;
use Illuminate\Support\Facades\Cache;

test('export builders emit text-only columns starting at the header row', function () {
    foreach (['paket', 'galeri', 'pesanan', 'testimoni'] as $module) {
        $job = new GenerateExportJob('probe-token', $module);
        $method = new \ReflectionMethod(GenerateExportJob::class, 'build');
        [$headers, $widths, $query, $mapper] = $method->invoke($job);

        // 4-tuple: no image payload element; headers/widths stay aligned.
        expect(count($headers))->toBe(count($widths))
            ->and($mapper)->toBeCallable()
            ->and($query)->toBeInstanceOf(\Illuminate\Database\Eloquent\Builder::class);

        // No image columns anywhere: no headers, no HYPERLINK formulas.
        foreach ($headers as $header) {
            expect($header)->not->toMatch('/gambar|foto|galeri|thumbnail|preview/i');
        }
    }
});

test('paket mapper emits 13 text values with no image payloads', function () {
    $job = new GenerateExportJob('probe-token', 'paket');
    $method = new \ReflectionMethod(GenerateExportJob::class, 'build');
    [, , , $mapper] = $method->invoke($job);

    // Direct assignment (models define no $fillable; mass assignment would throw).
    $paket = new Paket();
    $paket->nama_paket = 'Paket Test';
    $values = $mapper($paket);

    expect($values)->toHaveCount(13)
        ->and($values[0])->toBe('Paket Test');

    foreach ($values as $cell) {
        expect((string) $cell)->not->toContain('=HYPERLINK');
    }
});

test('galeri mapper emits 8 text values with no image payloads', function () {
    $job = new GenerateExportJob('probe-token', 'galeri');
    $method = new \ReflectionMethod(GenerateExportJob::class, 'build');
    [, , , $mapper] = $method->invoke($job);

    $galeri = new Galeri();
    $galeri->nama_acara = 'Acara Test';
    $values = $mapper($galeri);

    expect($values)->toHaveCount(8)
        ->and($values[0])->toBe('Acara Test');

    foreach ($values as $cell) {
        expect((string) $cell)->not->toContain('=HYPERLINK');
    }
});

test('export job budgets stay inside the worker lifespan', function () {
    $job = new GenerateExportJob('probe-token', 'paket');

    // Worker --timeout=1000 with retry_after=1100: job must finish first.
    // All modules are text-only streaming, so small datasets build inline.
    expect($job->timeout)->toBeLessThan(1000)
        ->and($job->tries)->toBe(1)
        ->and(GenerateExportJob::TEXT_SYNC_THRESHOLD)->toBe(2000);
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
