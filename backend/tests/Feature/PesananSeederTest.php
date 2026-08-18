<?php

use App\Models\Paket;
use App\Models\Pesanan;
use Database\Seeders\PesananSeeder;

test('PesananSeeder maths are exact and best sellers out-sell regular packages', function () {
    Paket::factory()->create(['nama_paket' => 'Best Seller Satu', 'is_best_seller' => true, 'min_order' => 10, 'harga_per_porsi' => 25000, 'kapasitas_produksi' => 100]);
    Paket::factory()->create(['nama_paket' => 'Best Seller Dua', 'is_best_seller' => true, 'min_order' => 5, 'harga_per_porsi' => 30000, 'kapasitas_produksi' => 200]);
    Paket::factory()->create(['nama_paket' => 'Paket Reguler', 'is_best_seller' => false, 'min_order' => 1, 'harga_per_porsi' => 18000, 'kapasitas_produksi' => 100]);

    $this->seed(PesananSeeder::class);

    expect(Pesanan::count())->toBeGreaterThan(0);

    // Money invariant + struk format on every generated order.
    Pesanan::get()->each(function (Pesanan $pesanan) {
        expect((float) $pesanan->total_harga)
            ->toBe($pesanan->jumlah_paket * (float) $pesanan->harga_paket_satuan + (float) $pesanan->biaya_tambahan);

        expect($pesanan->nomor_struk)->toMatch('/^STR-\d{8}-\d{4}$/');
    });

    // Volume ranges: best sellers 30-50 orders, regular packages 3-10.
    Paket::where('is_best_seller', true)->get()->each(function (Paket $paket) {
        expect($paket->pesanan()->count())->toBeBetween(30, 50);
    });

    Paket::where('is_best_seller', false)->get()->each(function (Paket $paket) {
        expect($paket->pesanan()->count())->toBeBetween(3, 10);
    });
});
