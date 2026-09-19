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

    /** 5-star catering prose (enthusiastic, specific). */
    public const ULASAN_5 = [
        'Makanan untuk pernikahan kami luar biasa, tamu sampai tambah berkali-kali',
        'Nasi kotak datang tepat waktu dan masih hangat, rasanya enak semua',
        'Penyajian prasmanan rapi sekali, rasa cocok untuk acara kantor kami',
        'Tumpeng mininya cantik dan gurih, anak-anak sampai orang tua suka',
        'Ayam bakar dan rendangnya empuk, bumbunya meresap banget',
        'Pelayanan ramah, food stall-nya cepat dan tidak antre lama',
        'Paket snack box-nya segar, kue dan kopinya pas untuk arisan',
        'Dekorasi dessert table-nya cantik, foto-foto jadi bagus',
        'Porsi pas dan mengenyangkan, tidak ada tamu yang kehabisan',
        'Sambal dan lalapannya segar, pelengkapnya lengkap banget',
        'Tim datang lebih awal, setup rapi tanpa merepotkan tuan rumah',
        'Rasa konsisten enak dari pembuka sampai penutup, highly recommended',
    ];

    /** 4-star catering prose (positive with mild note). */
    public const ULASAN_4 = [
        'Rasanya enak, pengiriman sedikit mundur tapi masih layak disajikan hangat',
        'Secara umum memuaskan, lauknya gurih meski porsinya bisa sedikit ditambah',
        'Penyajian bagus untuk acara syukuran, es buahnya segar sekali',
        'Nasi kotaknya lezat, kemasannya rapi cocok untuk rapat kantor',
        'Menu tambahannya variatif, sate dan sopnya jadi favorit tamu',
        'Pelayanan baik, hanya parkir tim agak jauh tapi setup tetap tepat waktu',
    ];

    /**
     * Define the model's default state.
     *
     * NOTE: `testimoni` has no dedicated review-text column, so catering
     * prose lives inside `pesanan` (TEXT, max 2000 at validation layer)
     * as "{menu} × {qty} — {ulasan}". Keeps order info searchable via
     * scopeSearch without a schema change.
     *
     * Names/places use the id_ID locale (global default is en_US —
     * see config/app.php).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = Faker::create('id_ID');
        $rating = $faker->randomElement([5, 5, 5, 5, 4]);

        return [
            'nama' => $faker->name(),
            'pesanan' => $faker->randomElement([
                'Nasi Box Hemat',
                'Prasmanan Pernikahan',
                'Snack Box Arisan',
                'Tumpeng Mini',
                'Prasmanan Korporat',
            ]).' × '.$faker->numberBetween(20, 300).' — '.($rating === 5
                ? $faker->randomElement(self::ULASAN_5)
                : $faker->randomElement(self::ULASAN_4)),
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
            // Seeder-oriented default: always public, strictly 4–5 stars.
            'visibility' => 'public',
            'rating' => $rating,
            'paket_id' => Paket::factory(),
        ];
    }
}
