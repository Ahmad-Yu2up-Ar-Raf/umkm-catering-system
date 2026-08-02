<?php

namespace Database\Factories;

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
            'deskripsi_acara' => fake()->paragraph(),
            'gambar_acara' => fake()->imageUrl(),
            'tanggal_acara' => fake()->date(),
        ];
    }
}
