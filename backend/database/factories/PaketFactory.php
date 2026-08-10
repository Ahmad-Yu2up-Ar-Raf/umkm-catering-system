<?php

namespace Database\Factories;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Paket>
 */
class PaketFactory extends Factory
{
    /**
     * The current model being faked.
     *
     * @var class-string<Paket>
     */
    protected $model = Paket::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_paket' => fake()->unique()->words(3, true),
            'kategori_paket' => fake()->randomElement(PaketKategoriEnum::class)->value,
            'kategori_acara' => fake()->randomElement(KategoriAcaraEnum::class)->value,
            'menu_utama' => fake()->unique()->words(3),
            'menu_tambahan' => fake()->words(2),
            'fasilitas_termasuk' => fake()->words(2),
            'catatan_alergen' => fake()->sentence(),
            'jenis_kemasan' => fake()->randomElement(['Mika', 'Kardus', 'Piring']),
            'min_order' => 1,
            'harga_per_porsi' => fake()->numberBetween(15000, 60000),
            'kapasitas_produksi' => fake()->numberBetween(20, 1000),
            'deskripsi' => fake()->paragraph(),
            'thumbnail' => fake()->imageUrl(),
            'is_best_seller' => false,
        ];
    }

    /**
     * Tumpeng Mini: priced per package via harga_per_porsi * min_order.
     * NEVER store Rp250.000 raw in harga_per_porsi.
     */
    public function tumpengMini(): static
    {
        return $this->state(fn (array $attributes) => [
            'nama_paket' => 'Tumpeng Mini',
            'kategori_paket' => PaketKategoriEnum::Tumpeng->value,
            'kategori_acara' => KategoriAcaraEnum::Umum->value,
            'harga_per_porsi' => 25000,
            'min_order' => 10,
        ]);
    }

    /**
     * Mark the package as a best seller.
     */
    public function bestSeller(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_best_seller' => true,
        ]);
    }
}
