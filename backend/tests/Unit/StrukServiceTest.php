<?php

use App\Models\Pesanan;
use App\Services\StrukService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('struk format is STR-YYYYMMDD-XXXX', function () {
    $struk = new StrukService;

    expect($struk->generate())->toMatch('/^STR-\d{8}-\d{4}$/');
});

test('struk counter increments sequentially within a day', function () {
    $struk = new StrukService;
    $tanggal = CarbonImmutable::parse('2026-08-01');
    Pesanan::factory()->create(['nomor_struk' => 'STR-20260801-0001']);

    expect($struk->generate($tanggal))->toBe('STR-20260801-0002');
});

test('struk counter resets on a new day', function () {
    $struk = new StrukService;
    Pesanan::factory()->create(['nomor_struk' => 'STR-20260801-0007']);

    expect($struk->generate(CarbonImmutable::parse('2026-08-02')))->toBe('STR-20260802-0001');
});
