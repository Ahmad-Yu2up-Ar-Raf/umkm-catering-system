<?php

namespace Database\Seeders;

use App\Models\Paket;
use App\Models\Testimoni;
use Carbon\CarbonImmutable;
use Faker\Factory as Faker;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestimoniSeeder extends Seeder
{
    use WithoutModelEvents;

    /** Testimonials per best-seller package (min..max). */
    private const BEST_SELLER_COUNT = [4, 8];

    /**
     * Testimonials per regular package (min..max). Minimum is 2 so that
     * EVERY package gets at least one public + one private testimonial
     * (see seedForPaket visibility assignment).
     */
    private const REGULAR_COUNT = [2, 4];

    /**
     * Seed realistic Indonesian testimonials. Loops over ALL existing paket
     * (best-sellers first, then regulars) and generates at least 2–3 rows
     * per package — never a random integer paket_id.
     */
    public function run(): void
    {
        // Clean slate — re-running replaces, never stacks dummy rows.
        $cleared = Testimoni::query()->delete();
        $this->command?->warn("  cleared {$cleared} existing testimoni(s)");

        $faker = Faker::create('id_ID');

        $bestSellers = Paket::where('is_best_seller', true)->get();
        $this->command?->info('  seeding testimoni for '.$bestSellers->count().' best-seller package(s)...');

        foreach ($bestSellers as $paket) {
            $this->seedForPaket($faker, $paket, self::BEST_SELLER_COUNT);
        }

        $regular = Paket::where('is_best_seller', false)->get();
        $this->command?->info('  seeding testimoni for '.$regular->count().' regular package(s)...');

        foreach ($regular as $paket) {
            $this->seedForPaket($faker, $paket, self::REGULAR_COUNT);
        }

        $this->command?->info('  testimoni seeded: '.Testimoni::count().' row(s)');
    }

    /**
     * Create $range[0..1] testimonials for one package, scattering the
     * creation date over the last 6 months.
     *
     * Visibility mix is deterministic per package: the first row is public,
     * the second is private, the rest are random (private-weighted) — so
     * every package always has both visibilities represented.
     */
    private function seedForPaket(\Faker\Generator $faker, Paket $paket, array $range): void
    {
        $count = max(2, $faker->numberBetween($range[0], $range[1]));

        for ($i = 0; $i < $count; $i++) {
            $qty = $faker->numberBetween(max(1, (int) $paket->min_order), 300);

            $visibility = match (true) {
                $i === 0 => 'public',
                $i === 1 => 'private',
                default => $faker->randomElement(['private', 'private', 'public']),
            };

            $testimoni = Testimoni::query()->create([
                'nama' => $faker->name(),
                'pesanan' => "{$paket->nama_paket} × {$qty}",
                'acara' => $faker->randomElement([
                    'Pernikahan',
                    'Kantor',
                    'Ulang Tahun',
                    'Arisan',
                    'Syukuran',
                ]),
                'lokasi' => $faker->randomElement([
                    'Taman Sari',
                    'Cibinong',
                    'Sentul',
                    'Cileungsi',
                    'Depok',
                    'Bogor Kota',
                ]).', Bogor',
                'tanggal_acara' => $faker->boolean(70)
                    ? $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d')
                    : null,
                'visibility' => $visibility,
                'rating' => $faker->randomElement([5, 5, 5, 4, 4, 3]),
                'paket_id' => $paket->id,
            ]);

            $saat = CarbonImmutable::now()->subMonths(6)
                ->addMinutes($faker->numberBetween(0, 6 * 30 * 24 * 60));

            $testimoni->timestamps = false;
            $testimoni->created_at = $saat;
            $testimoni->updated_at = $saat;
            $testimoni->save();
        }
    }
}
