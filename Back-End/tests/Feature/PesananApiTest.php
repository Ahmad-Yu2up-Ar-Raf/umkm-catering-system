<?php

use App\Enums\StatusPesananEnum;
use App\Models\Paket;
use App\Models\Pesanan;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function pesananPayload(array $overrides = []): array
{
    return array_merge([
        'nama_pemesan' => 'Budi Santoso',
        'no_telepon' => '081234567890',
        'paket_id' => 1,
        'jumlah_paket' => 20,
        'detail_tambahan' => ['Extra sambal', 'Sendok'],
        'biaya_tambahan' => 5000,
        'catatan' => 'Antar jam 10 pagi.',
    ], $overrides);
}

test('store requires authentication', function () {
    $paket = Paket::factory()->create();

    $this->postJson('/api/v1/admin/pesanan', pesananPayload(['paket_id' => $paket->id]))
        ->assertUnauthorized();
});

test('store computes total_harga server-side and generates nomor_struk', function () {
    Sanctum::actingAs(User::factory()->create());
    $paket = Paket::factory()->create(['harga_per_porsi' => 25000]);

    $response = $this->postJson('/api/v1/admin/pesanan', pesananPayload([
        'paket_id' => $paket->id,
        'jumlah_paket' => 20,
        'biaya_tambahan' => 5000,
    ]));

    $response->assertCreated()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.harga_paket_satuan', '25000.00')
        ->assertJsonPath('data.total_harga', '505000.00')
        ->assertJsonPath('data.status_pesanan', 'pending');

    $this->assertDatabaseHas('pesanan', [
        'paket_id' => $paket->id,
        'harga_paket_satuan' => 25000.00,
        'total_harga' => 505000.00,
        'status_pesanan' => 'pending',
    ]);

    expect(Pesanan::first()->nomor_struk)->toMatch('/^STR-\d{8}-\d{4}$/');
});

test('ignores client-supplied total_harga and nomor_struk', function () {
    Sanctum::actingAs(User::factory()->create());
    $paket = Paket::factory()->create(['harga_per_porsi' => 10000]);

    $this->postJson('/api/v1/admin/pesanan', pesananPayload([
        'paket_id' => $paket->id,
        'jumlah_paket' => 10,
        'biaya_tambahan' => 0,
        'total_harga' => 1,
        'nomor_struk' => 'STR-HACK-9999',
    ]))->assertCreated();

    $pesanan = Pesanan::first();

    expect($pesanan->total_harga)->toBe('100000.00');
    expect($pesanan->nomor_struk)->not->toBe('STR-HACK-9999');
    expect($pesanan->nomor_struk)->toMatch('/^STR-\d{8}-\d{4}$/');
});

test('price snapshot is immutable after later price changes', function () {
    Sanctum::actingAs(User::factory()->create());
    $paket = Paket::factory()->create(['harga_per_porsi' => 20000]);

    $this->postJson('/api/v1/admin/pesanan', pesananPayload([
        'paket_id' => $paket->id,
        'jumlah_paket' => 10,
        'biaya_tambahan' => 0,
    ]))->assertCreated();

    $paket->update(['harga_per_porsi' => 30000]);

    $pesanan = Pesanan::first();

    expect($pesanan->harga_paket_satuan)->toBe('20000.00');
    expect($pesanan->total_harga)->toBe('200000.00');
});

test('rejects orders below the package min_order (Tumpeng Mini)', function () {
    Sanctum::actingAs(User::factory()->create());
    $paket = Paket::factory()->tumpengMini()->create();

    $this->postJson('/api/v1/admin/pesanan', pesananPayload([
        'paket_id' => $paket->id,
        'jumlah_paket' => 9,
    ]))->assertUnprocessable()
        ->assertJsonValidationErrors('jumlah_paket');

    $this->assertDatabaseCount('pesanan', 0);
});

test('rejects orders exceeding production capacity', function () {
    Sanctum::actingAs(User::factory()->create());
    $paket = Paket::factory()->create(['kapasitas_produksi' => 100]);

    $this->postJson('/api/v1/admin/pesanan', pesananPayload([
        'paket_id' => $paket->id,
        'jumlah_paket' => 150,
    ]))->assertUnprocessable()
        ->assertJsonValidationErrors('jumlah_paket');
});

test('rejects an invalid paket_id', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/pesanan', pesananPayload(['paket_id' => 999]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('paket_id');
});

test('index requires authentication', function () {
    $this->getJson('/api/v1/admin/pesanan')->assertUnauthorized();
});

test('index returns paginated orders with paket loaded', function () {
    Sanctum::actingAs(User::factory()->create());
    Pesanan::factory()->count(3)->create();

    $this->getJson('/api/v1/admin/pesanan')
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonCount(3, 'data.data')
        ->assertJsonStructure([
            'data' => ['data' => [['nomor_struk', 'total_harga', 'paket']]],
        ]);
});

test('show requires authentication', function () {
    $pesanan = Pesanan::factory()->create();

    $this->getJson("/api/v1/admin/pesanan/{$pesanan->id}")->assertUnauthorized();
});

test('show returns a single order', function () {
    Sanctum::actingAs(User::factory()->create());
    $pesanan = Pesanan::factory()->create();

    $this->getJson("/api/v1/admin/pesanan/{$pesanan->id}")
        ->assertOk()
        ->assertJsonPath('data.nomor_struk', $pesanan->nomor_struk);
});

test('update changes the order status', function () {
    Sanctum::actingAs(User::factory()->create());
    $pesanan = Pesanan::factory()->create();

    $this->putJson("/api/v1/admin/pesanan/{$pesanan->id}", [
        'status_pesanan' => StatusPesananEnum::Confirmed->value,
    ])->assertOk()
        ->assertJsonPath('data.status_pesanan', 'confirmed');

    expect($pesanan->fresh()->status_pesanan)->toBe(StatusPesananEnum::Confirmed);
});

test('update rejects an invalid status', function () {
    Sanctum::actingAs(User::factory()->create());
    $pesanan = Pesanan::factory()->create();

    $this->putJson("/api/v1/admin/pesanan/{$pesanan->id}", [
        'status_pesanan' => 'shipped',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('status_pesanan');
});

test('update cannot tamper with financial fields', function () {
    Sanctum::actingAs(User::factory()->create());
    $pesanan = Pesanan::factory()->create();

    $this->putJson("/api/v1/admin/pesanan/{$pesanan->id}", [
        'status_pesanan' => StatusPesananEnum::Completed->value,
        'total_harga' => 1,
        'nomor_struk' => 'STR-HACK-9999',
    ])->assertOk()
        ->assertJsonPath('data.total_harga', $pesanan->total_harga);

    expect($pesanan->fresh()->nomor_struk)->toBe($pesanan->nomor_struk);
});

test('struk endpoint requires authentication', function () {
    $pesanan = Pesanan::factory()->create();

    $this->getJson("/api/v1/admin/pesanan/{$pesanan->id}/struk")->assertUnauthorized();
});

test('struk endpoint returns the struk payload', function () {
    Sanctum::actingAs(User::factory()->create());
    $pesanan = Pesanan::factory()->create();

    $this->getJson("/api/v1/admin/pesanan/{$pesanan->id}/struk")
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.nomor_struk', $pesanan->nomor_struk)
        ->assertJsonStructure(['data' => ['nomor_struk', 'total_harga', 'paket']]);
});
