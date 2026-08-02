<?php

use App\Models\Galeri;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function galeriPayload(array $overrides = []): array
{
    return array_merge([
        'nama_acara' => 'Pernikahan Rizky & Sari',
        'deskripsi_acara' => 'Prasmanan 300 porsi di gedung Bogor.',
        'gambar_acara' => 'https://example.com/acara.jpg',
        'tanggal_acara' => '2026-06-20',
    ], $overrides);
}

test('public index returns paginated galeri with envelope', function () {
    Galeri::factory()->count(15)->create();

    $response = $this->getJson('/api/v1/galeri');

    $response->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('message', 'Data retrieved successfully')
        ->assertJsonCount(12, 'data.data');
});

test('admin show requires authentication', function () {
    $galeri = Galeri::factory()->create();

    $this->getJson("/api/v1/admin/galeri/{$galeri->id}")->assertUnauthorized();
});

test('admin can show a single galeri item', function () {
    Sanctum::actingAs(User::factory()->create());

    $galeri = Galeri::factory()->create();

    $this->getJson("/api/v1/admin/galeri/{$galeri->id}")
        ->assertOk()
        ->assertJsonPath('data.nama_acara', $galeri->nama_acara);
});

test('admin store requires authentication', function () {
    $this->postJson('/api/v1/admin/galeri', galeriPayload())->assertUnauthorized();
});

test('admin can create a galeri item', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/galeri', galeriPayload())
        ->assertCreated()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.nama_acara', 'Pernikahan Rizky & Sari');

    $this->assertDatabaseHas('galeri', ['nama_acara' => 'Pernikahan Rizky & Sari']);
});

test('store rejects missing gambar_acara', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/galeri', galeriPayload(['gambar_acara' => null]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('gambar_acara');
});

test('galeri update is not exposed on the admin resource', function () {
    Sanctum::actingAs(User::factory()->create());

    $galeri = Galeri::factory()->create();

    $this->putJson("/api/v1/admin/galeri/{$galeri->id}", ['nama_acara' => 'Baru'])
        ->assertMethodNotAllowed();
});

test('admin can delete a galeri item', function () {
    Sanctum::actingAs(User::factory()->create());

    $galeri = Galeri::factory()->create();

    $this->deleteJson("/api/v1/admin/galeri/{$galeri->id}")
        ->assertOk()
        ->assertJsonPath('status', true);

    $this->assertDatabaseMissing('galeri', ['id' => $galeri->id]);
});
