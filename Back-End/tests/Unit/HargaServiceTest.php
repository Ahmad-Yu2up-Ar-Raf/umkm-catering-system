<?php

use App\Models\Paket;
use App\Services\HargaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('total harga is jumlah * harga satuan + biaya tambahan', function () {
    $service = new HargaService;

    expect($service->totalHarga(20, 25000, 5000))->toBe(505000.0);
});

test('tumpeng mini subtotal prices per package via min_order', function () {
    $paket = Paket::factory()->tumpengMini()->create();

    $service = new HargaService;

    expect($service->subtotalPaket($paket, 10))->toBe(250000.0);
    expect($service->subtotalPaket($paket, 20))->toBe(500000.0);
});

test('tumpeng mini enforces a minimum order of 10 portions', function () {
    $paket = Paket::factory()->tumpengMini()->create();

    $service = new HargaService;

    expect($service->memenuhiMinOrder($paket, 10))->toBeTrue();
    expect($service->memenuhiMinOrder($paket, 9))->toBeFalse();
});
