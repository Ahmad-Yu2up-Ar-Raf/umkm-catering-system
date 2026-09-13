<?php

namespace Database\Factories;

use App\Models\Paket;
use App\Models\Testimoni;
use Faker\Factory as Faker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimoni>
 */
class TestimoniFactory extends Factory
{
    /**
     * The current model being faked.
     *
     * @var class-string<Testimoni>
     */
    protected $model = Testimoni::class;

    /**
     * Define the model's default state.
     *
     * Names/places use the id_ID locale (global default is en_US —
     * see config/app.php). Image URLs are locale-independent.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = Faker::create('id_ID');

        return [
            'nama' => $faker->name(),
            'pesanan' => $faker->randomElement([
                'Nasi Box Hemat',
                'Prasmanan Pernikahan',
                'Snack Box Arisan',
                'Tumpeng Mini',
                'Prasmanan Korporat',
            ]).' × '.$faker->numberBetween(20, 300),
            'acara' => $faker->randomElement([
                'Pernikahan',
                'Kantor',
                'Ulang Tahun',
                'Arisan',
                'Syukuran',
                'Hampers',
            ]),
            'tanggal_acara' => $faker->boolean(70)
                ? $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d')
                : null,
            'lokasi' => $faker->randomElement([
                'Taman Sari',
                'Cibinong',
                'Sentul',
                'Cileungsi',
                'Depok',
                'Bogor Kota',
            ]).', Bogor',
            // Weighted toward private (the DB default).
            'visibility' => $faker->randomElement(['private', 'private', 'public']),
            // Weighted toward 5 stars, matching real-world review skew.
            'rating' => $faker->randomElement([5, 5, 5, 4, 4, 3]),
            'paket_id' => Paket::factory(),
        ];
    }
}
