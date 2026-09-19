<?php

namespace Database\Seeders;

use App\Models\Paket;
use App\Models\Testimoni;
use Carbon\CarbonImmutable;
use Database\Factories\TestimoniFactory;
use Faker\Factory as Faker;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestimoniSeeder extends Seeder
{
    use WithoutModelEvents;

    /** Testimonials per package (min..max) — guarantees >= 10 public rows. */
    private const COUNT_PER_PAKET = [10, 12];

    /**
     * Seed realistic Indonesian testimonials. Loops over ALL existing paket
     * and generates 10–12 public, strictly positive rows per package —
     * never a random integer paket_id.
     */
    public function run(): void
    {
        // Clean slate — re-running replaces, never stacks dummy rows.
        // delete() (not truncate) is FK-safe on Neon without CASCADE.
        $cleared = Testimoni::query()->delete();
        $this->command?->warn("  cleared {$cleared} existing testimoni(s)");

        $faker = Faker::create('id_ID');

        $pakets = Paket::query()->orderBy('id')->get();
        $this->command?->info('  seeding testimoni for '.$pakets->count().' package(s)...');

        foreach ($pakets as $paket) {
            $this->seedForPaket($faker, $paket);
        }

        $this->command?->info('  testimoni seeded: '.Testimoni::count().' row(s)');
    }

    /**
     * Create 10–12 public testimonials for one package, scattering the
     * creation date over the last 6 months. Rating strictly 4–5, with
     * prose correlated: 5 stars → enthusiastic, 4 stars → positive + note.
     */
    private function seedForPaket(\Faker\Generator $faker, Paket $paket): void
    {
        $count = $faker->numberBetween(self::COUNT_PER_PAKET[0], self::COUNT_PER_PAKET[1]);

        for ($i = 0; $i < $count; $i++) {
            $qty = $faker->numberBetween(max(1, (int) $paket->min_order), 300);
            $rating = $faker->randomElement([5, 5, 5, 5, 4]);
            $ulasan = $rating === 5
                ? $faker->randomElement(TestimoniFactory::ULASAN_5)
                : $faker->randomElement(TestimoniFactory::ULASAN_4);

            $testimoni = Testimoni::query()->create([
                'nama' => $faker->name(),
                'pesanan' => "{$paket->nama_paket} × {$qty} — {$ulasan}",
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
                'visibility' => 'public',
                'rating' => $rating,
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
