<?php

use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function paketPayload(array $overrides = []): array
{
    return array_merge([
        'nama_paket' => 'Paket Nasi Box Kantor',
        'kategori_paket' => PaketKategoriEnum::NasiBox->value,
        'kategori_acara' => 'Kantor',
        'menu_utama' => ['Ayam Geprek', 'Nasi Putih', 'Sambal'],
        'menu_tambahan' => ['Es Teh', 'Kerupuk'],
        'fasilitas_termasuk' => ['Free ongkir', 'Kemasan mika'],
        'catatan_alergen' => 'Mengandung kacang',
        'jenis_kemasan' => 'Mika',
        'min_order' => 5,
        'harga_per_porsi' => 25000,
        'kapasitas_produksi' => 500,
        'deskripsi' => 'Paket hemat untuk acara kantor.',
        'gambar' => 'https://example.com/paket.jpg',
        'is_best_seller' => true,
    ], $overrides);
}

test('public index returns paginated paket with envelope', function () {
    Paket::factory()->count(15)->create();

    $response = $this->getJson('/api/v1/paket');

    $response->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('message', 'Data retrieved successfully')
        ->assertJsonCount(12, 'data.data');
});

test('public show returns a single paket', function () {
    $paket = Paket::factory()->create();

    $this->getJson("/api/v1/paket/{$paket->id}")
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.nama_paket', $paket->nama_paket)
        ->assertJsonPath('data.menu_utama', $paket->menu_utama);
});

test('best-seller route returns only best-seller paket', function () {
    Paket::factory()->count(3)->create();
    Paket::factory()->bestSeller()->count(2)->create();

    $response = $this->getJson('/api/v1/paket/best-seller');

    $response->assertOk()
        ->assertJsonCount(2, 'data');

    foreach ($response->json('data') as $item) {
        expect($item['is_best_seller'])->toBeTrue();
    }
});

test('admin store requires authentication', function () {
    $this->postJson('/api/v1/admin/paket', paketPayload())->assertUnauthorized();
});

test('admin can create a paket with JSON arrays', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/paket', paketPayload())
        ->assertCreated()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.nama_paket', 'Paket Nasi Box Kantor');

    $this->assertDatabaseHas('paket', [
        'nama_paket' => 'Paket Nasi Box Kantor',
        'kategori_paket' => 'Nasi Box',
        'harga_per_porsi' => 25000,
    ]);
});

test('store rejects invalid kategori_paket', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/paket', paketPayload(['kategori_paket' => 'Mewah']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('kategori_paket');
});

test('store rejects empty menu_utama', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/paket', paketPayload(['menu_utama' => []]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('menu_utama');
});

test('store rejects non-string menu_utama items', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/paket', paketPayload(['menu_utama' => ['valid', 123]]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('menu_utama.1');
});

test('store rejects missing harga_per_porsi', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/paket', paketPayload(['harga_per_porsi' => null]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('harga_per_porsi');
});

test('admin can update a paket partially', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create(['nama_paket' => 'Lama']);

    $this->putJson("/api/v1/admin/paket/{$paket->id}", [
        'nama_paket' => 'Baru',
    ])->assertOk()
        ->assertJsonPath('data.nama_paket', 'Baru');

    expect($paket->fresh()->nama_paket)->toBe('Baru');
});

test('admin can delete a paket', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();

    $this->deleteJson("/api/v1/admin/paket/{$paket->id}")
        ->assertOk()
        ->assertJsonPath('status', true);

    $this->assertDatabaseMissing('paket', ['id' => $paket->id]);
});
