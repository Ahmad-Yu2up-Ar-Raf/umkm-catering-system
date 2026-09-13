<?php

use App\Models\Paket;
use App\Models\Testimoni;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function testimoniPayload(array $overrides = []): array
{
    $paketId = $overrides['paket_id'] ?? Paket::factory()->create()->id;
    unset($overrides['paket_id']);

    return array_merge([
        'nama' => 'Ibu Ratna',
        'pesanan' => 'Nasi Box Hemat × 150',
        'acara' => 'Arisan',
        'lokasi' => 'Taman Sari, Bogor',
        'paket_id' => $paketId,
        'rating' => 5,
    ], $overrides);
}

test('admin testimoni index requires authentication', function () {
    $this->getJson('/api/v1/admin/testimoni')->assertUnauthorized();
});

test('admin index returns paginated testimoni with flat envelope', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    Testimoni::factory()->count(12)->create(['paket_id' => $paket->id]);

    $response = $this->getJson('/api/v1/admin/testimoni');

    $response->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('message', 'Data retrieved successfully')
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.pagination.total', 12)
        ->assertJsonPath('meta.pagination.perPage', 10);
});

test('admin index supports search across nama/pesanan/acara/lokasi', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    Testimoni::factory()->create(['paket_id' => $paket->id, 'nama' => 'Ibu Ratna Unik']);
    Testimoni::factory()->count(3)->create(['paket_id' => $paket->id]);

    $this->getJson('/api/v1/admin/testimoni?search=Unik')
        ->assertOk()
        ->assertJsonPath('meta.pagination.total', 1)
        ->assertJsonPath('data.0.nama', 'Ibu Ratna Unik');
});

test('admin can create a testimoni item', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload())
        ->assertCreated()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.nama', 'Ibu Ratna');

    $this->assertDatabaseHas('testimoni', ['nama' => 'Ibu Ratna']);
});

test('store rejects missing required fields', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['nama' => null]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('nama');
});

test('store rejects unknown paket_id', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['paket_id' => 999999]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('paket_id');
});

test('admin can show a single testimoni item with paket relation', function () {
    Sanctum::actingAs(User::factory()->create());

    $testimoni = Testimoni::factory()->create();

    $this->getJson("/api/v1/admin/testimoni/{$testimoni->id}")
        ->assertOk()
        ->assertJsonPath('data.nama', $testimoni->nama)
        ->assertJsonPath('data.paket_id', $testimoni->paket_id);
});

test('store defaults visibility to private when omitted', function () {
    Sanctum::actingAs(User::factory()->create());

    $payload = testimoniPayload();
    unset($payload['visibility']);

    $this->postJson('/api/v1/admin/testimoni', $payload)
        ->assertCreated()
        ->assertJsonPath('data.visibility', 'private');
});

test('store accepts public visibility and rejects invalid values', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['visibility' => 'public']))
        ->assertCreated()
        ->assertJsonPath('data.visibility', 'public');

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['visibility' => 'archived']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('visibility');
});

test('admin index filters by visibility', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    Testimoni::factory()->create(['paket_id' => $paket->id, 'visibility' => 'public']);
    Testimoni::factory()->count(2)->create(['paket_id' => $paket->id, 'visibility' => 'private']);

    $this->getJson('/api/v1/admin/testimoni?visibility[]=public')
        ->assertOk()
        ->assertJsonPath('meta.pagination.total', 1)
        ->assertJsonPath('data.0.visibility', 'public');

    // Invalid values are dropped, never 500.
    $this->getJson('/api/v1/admin/testimoni?visibility[]=bogus')
        ->assertOk()
        ->assertJsonPath('meta.pagination.total', 3);
});

test('store rejects out-of-range ratings', function () {
    Sanctum::actingAs(User::factory()->create());

    foreach ([0, 6] as $bad) {
        $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['rating' => $bad]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rating');
    }

    $this->postJson('/api/v1/admin/testimoni', testimoniPayload(['rating' => 4]))
        ->assertCreated()
        ->assertJsonPath('data.rating', 4);
});

test('admin index sorts by rating', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    Testimoni::factory()->create(['paket_id' => $paket->id, 'rating' => 3]);
    Testimoni::factory()->create(['paket_id' => $paket->id, 'rating' => 5]);

    $this->getJson('/api/v1/admin/testimoni?sort_by=rating&sort_dir=desc')
        ->assertOk()
        ->assertJsonPath('data.0.rating', 5);
});

test('admin can bulk-update visibility', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    $ids = Testimoni::factory()->count(3)->create(['paket_id' => $paket->id, 'visibility' => 'private'])->pluck('id')->all();

    $this->postJson('/api/v1/admin/testimoni/bulk-update', ['ids' => $ids, 'field' => 'visibility', 'value' => 'public'])
        ->assertOk()
        ->assertJsonPath('status', true);

    foreach ($ids as $id) {
        $this->assertDatabaseHas('testimoni', ['id' => $id, 'visibility' => 'public']);
    }

    $this->postJson('/api/v1/admin/testimoni/bulk-update', ['ids' => $ids, 'field' => 'visibility', 'value' => 'archived'])
        ->assertStatus(422);
});

test('admin can update a testimoni item', function () {
    Sanctum::actingAs(User::factory()->create());

    $testimoni = Testimoni::factory()->create();

    $this->putJson("/api/v1/admin/testimoni/{$testimoni->id}", ['lokasi' => 'Sentul, Bogor'])
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.lokasi', 'Sentul, Bogor');

    $this->assertDatabaseHas('testimoni', ['id' => $testimoni->id, 'lokasi' => 'Sentul, Bogor']);
});

test('admin can delete a testimoni item', function () {
    Sanctum::actingAs(User::factory()->create());

    $testimoni = Testimoni::factory()->create();

    $this->deleteJson("/api/v1/admin/testimoni/{$testimoni->id}")
        ->assertOk()
        ->assertJsonPath('status', true);

    $this->assertDatabaseMissing('testimoni', ['id' => $testimoni->id]);
});

test('paket with testimoni cannot be deleted (409)', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    Testimoni::factory()->create(['paket_id' => $paket->id]);

    $this->deleteJson("/api/v1/admin/paket/{$paket->id}")
        ->assertConflict()
        ->assertJsonPath('status', false);

    $this->assertDatabaseHas('paket', ['id' => $paket->id]);
});

test('public by-paket returns only public reviews of that paket', function () {
    $paket = Paket::factory()->create();
    $other = Paket::factory()->create();
    $shown = Testimoni::factory()->create(['paket_id' => $paket->id, 'visibility' => 'public']);
    Testimoni::factory()->create(['paket_id' => $paket->id, 'visibility' => 'private']);
    Testimoni::factory()->create(['paket_id' => $other->id, 'visibility' => 'public']);

    $this->getJson("/api/v1/testimoni/paket/{$paket->id}")
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $shown->id);
});

test('anonymous prose can submit a review but never self-publish', function () {
    $paket = Paket::factory()->create();

    // No auth — and even a forged visibility=public is forced to private.
    $this->postJson('/api/v1/testimoni', [
        'nama' => 'Tamu Anonim',
        'pesanan' => 'Rasanya seperti masakan rumah.',
        'acara' => 'Arisan',
        'lokasi' => 'Bogor',
        'tanggal_acara' => '2026-08-17',
        'rating' => 5,
        'paket_id' => $paket->id,
        'visibility' => 'public',
    ])
        ->assertCreated()
        ->assertJsonPath('data.visibility', 'private');

    $this->assertDatabaseHas('testimoni', ['nama' => 'Tamu Anonim', 'visibility' => 'private']);
});

test('public store rejects unknown paket and out-of-range rating', function () {
    $this->postJson('/api/v1/testimoni', [
        'nama' => 'X',
        'pesanan' => 'Y',
        'paket_id' => 999999,
    ])->assertUnprocessable()->assertJsonValidationErrors('paket_id');

    $paket = Paket::factory()->create();
    $this->postJson('/api/v1/testimoni', [
        'nama' => 'X',
        'pesanan' => 'Y',
        'paket_id' => $paket->id,
        'rating' => 6,
    ])->assertUnprocessable()->assertJsonValidationErrors('rating');
});

test('admin can bulk-delete testimoni items', function () {
    Sanctum::actingAs(User::factory()->create());

    $paket = Paket::factory()->create();
    $ids = Testimoni::factory()->count(3)->create(['paket_id' => $paket->id])->pluck('id')->all();

    $this->postJson('/api/v1/admin/testimoni/bulk-delete', ['ids' => $ids])
        ->assertOk()
        ->assertJsonPath('status', true);

    foreach ($ids as $id) {
        $this->assertDatabaseMissing('testimoni', ['id' => $id]);
    }
});
