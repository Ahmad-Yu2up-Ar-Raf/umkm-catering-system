<?php

namespace Database\Factories;

use App\Enums\GaleriKategoriEnum;
use App\Models\Galeri;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Galeri>
 */
class GaleriFactory extends Factory
{
    /**
     * The current model being faked.
     *
     * @var class-string<Galeri>
     */
    protected $model = Galeri::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_acara' => fake()->words(3, true),
            'kategori_acara' => fake()->randomElement(GaleriKategoriEnum::cases())->value,
            'deskripsi_acara' => fake()->paragraph(),
            'gambar_acara' => fake()->imageUrl(),
            'photographer' => fake()->name(),
            'attribution_url' => fake()->url(),
            'license' => 'Pexels License',
            'tanggal_acara' => fake()->date(),
            'lokasi' => fake()->city(),
            'jumlah_tamu' => fake()->numberBetween(20, 320),
            'is_featured' => false,
        ];
    }
}
