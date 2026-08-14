<?php

namespace Database\Seeders;

use App\Enums\GaleriKategoriEnum;
use App\Models\Galeri;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class GaleriSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Per-category image limits for gallery staging under
     * `frontend/public/assets/images/galeri/<slug>/`. Doubled (v2) so the
     * paginated /galeri API + infinite scroll have real volume to page over.
     */
    public const MIN_IMAGES_PER_CATEGORY = 2;

    public const MAX_IMAGES_PER_CATEGORY = 10;

    /** Cloudinary folder namespace owned by this project's gallery. */
    private const CLOUDINARY_PREFIX = 'catering-nusantara/galeri';

    /**
     * Curated (demo) gallery events, keyed by the category folder slug.
     * One entry per staged image, zipped positionally in upload order. v2 is
     * FOOD-FOCUSED (close-up plating, buffet, tumpeng, hampers — the appetizing
     * catering story) and doubled across all seven categories; `lainnya` rows
     * carry `kategori_acara => null` (NULL category = "Lainnya").
     *
     * @var array<string, array<int, array<string, mixed>>>
     */
    private const ORIGINALS = [
        'pernikahan' => [
            ['nama_acara' => 'Resepsi pernikahan yang anggun', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Tata meja resepsi yang hangat dan elegan untuk hari spesial.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 300, 'is_featured' => true],
            ['nama_acara' => 'Prasmanan resepsi di malam hari', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Sajian prasmanan hangat untuk resepsi malam.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 250, 'is_featured' => false],
            ['nama_acara' => 'Perjamuan panjang keluarga', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Meja perjamuan panjang yang penuh kehangatan.', 'lokasi' => 'Depok', 'jumlah_tamu' => 180, 'is_featured' => false],
            ['nama_acara' => 'Detail dekorasi resepsi', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Sentuhan dekorasi yang melengkapi sajian.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 150, 'is_featured' => false],
            ['nama_acara' => 'Momen kebersamaan setelah ijab', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Hidangan spesial yang menyatukan tamu undangan.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 220, 'is_featured' => false],
            ['nama_acara' => 'Sajian prasmanan dengan hidangan khas', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Aneka hidangan Nusantara tersaji hangat di meja prasmanan.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 280, 'is_featured' => false],
            ['nama_acara' => 'Lauk khas yang menggugah selera', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Pilihan lauk khas yang menggugah selera untuk resepsi.', 'lokasi' => 'Bandung', 'jumlah_tamu' => 240, 'is_featured' => false],
            ['nama_acara' => 'Hidangan pembuka untuk tamu', 'kategori_acara' => GaleriKategoriEnum::Pernikahan, 'deskripsi_acara' => 'Hidangan pembuka dan utama yang disiapkan penuh cinta.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 200, 'is_featured' => false],
        ],
        'korporat' => [
            ['nama_acara' => 'Gathering korporat berkelas', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Prasmanan untuk acara gathering perusahaan.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 200, 'is_featured' => true],
            ['nama_acara' => 'Lunch box rapat dan training', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Lunch box praktis untuk rapat dan training.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 80, 'is_featured' => false],
            ['nama_acara' => 'Buffet acara kantor', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Buffet hangat untuk acara kantor.', 'lokasi' => 'Depok', 'jumlah_tamu' => 120, 'is_featured' => false],
            ['nama_acara' => 'Coffee break dan snack', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Menu coffee break untuk seminar dan meeting.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 90, 'is_featured' => false],
            ['nama_acara' => 'Perayaan akhir tahun kantor', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Sajian istimewa untuk perayaan tahunan.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 150, 'is_featured' => false],
            ['nama_acara' => 'Prasmanan hangat gathering', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Sajian hangat untuk acara gathering perusahaan.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 180, 'is_featured' => false],
            ['nama_acara' => 'Nasi box istimewa untuk acara', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Nasi box dengan lauk pilihan untuk kegiatan korporat.', 'lokasi' => 'Tangerang', 'jumlah_tamu' => 120, 'is_featured' => false],
            ['nama_acara' => 'Gourmet buffet presentasi', 'kategori_acara' => GaleriKategoriEnum::Korporat, 'deskripsi_acara' => 'Plating buffet yang rapi dan menggugah selera.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 160, 'is_featured' => false],
        ],
        'tumpeng-syukuran' => [
            ['nama_acara' => 'Tumpeng syukuran keluarga', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng nasi kuning khas untuk momen syukuran.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 60, 'is_featured' => true],
            ['nama_acara' => 'Tumpeng panjang dengan lauk lengkap', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng dengan lauk pauk pendamping yang lengkap.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 75, 'is_featured' => false],
            ['nama_acara' => 'Syukuran rumah baru', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Perayaan syukuran rumah dengan hidangan tumpeng.', 'lokasi' => 'Depok', 'jumlah_tamu' => 50, 'is_featured' => false],
            ['nama_acara' => 'Tumpeng ulang tahun kantor', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng untuk perayaan ulang tahun kantor.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 40, 'is_featured' => false],
            ['nama_acara' => 'Syukuran kelahiran', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Syukuran menyambut buah hati.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 45, 'is_featured' => false],
            ['nama_acara' => 'Tumpeng lengkap dengan lauk', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng dengan sederet lauk pendamping yang menggiurkan.', 'lokasi' => 'Depok', 'jumlah_tamu' => 70, 'is_featured' => false],
            ['nama_acara' => 'Tumpeng untuk hajatan keluarga', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng sebagai pusat perayaan keluarga.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 65, 'is_featured' => false],
            ['nama_acara' => 'Tumpeng mini untuk syukuran', 'kategori_acara' => GaleriKategoriEnum::TumpengSyukuran, 'deskripsi_acara' => 'Tumpeng skala kecil untuk perayaan sederhana.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 40, 'is_featured' => false],
        ],
        'perayaan' => [
            ['nama_acara' => 'Tumpeng mini ulang tahun', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Tumpeng mini yang pas untuk merayakan hari istimewa.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 30, 'is_featured' => true],
            ['nama_acara' => 'Perayaan kecil bersama keluarga', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Momen hangat bersama keluarga dan sahabat.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 25, 'is_featured' => false],
            ['nama_acara' => 'Snack box arisan', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Snack box praktis untuk acara arisan.', 'lokasi' => 'Depok', 'jumlah_tamu' => 20, 'is_featured' => false],
            ['nama_acara' => 'Perayaan santai di rumah', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Hidangan sederhana yang hangat.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 15, 'is_featured' => false],
            ['nama_acara' => 'Momen perayaan komunitas', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Kebersamaan komunitas dalam sebuah perayaan.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 35, 'is_featured' => false],
            ['nama_acara' => 'Tumpeng mini untuk ulang tahun kedua', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Tumpeng mini yang meriah untuk hari spesial.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 30, 'is_featured' => false],
            ['nama_acara' => 'Prasmanan snack untuk pesta', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Aneka snack menggugah untuk jamuan pesta.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 35, 'is_featured' => false],
            ['nama_acara' => 'Nasi kotak untuk perayaan', 'kategori_acara' => GaleriKategoriEnum::Perayaan, 'deskripsi_acara' => 'Nasi kotak praktis untuk perayaan bersama.', 'lokasi' => 'Depok', 'jumlah_tamu' => 25, 'is_featured' => false],
        ],
        'hampers' => [
            ['nama_acara' => 'Bingkisan istimewa untuk berbagi', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Bingkisan istimewa yang siap dibagikan.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => null, 'is_featured' => true],
            ['nama_acara' => 'Hampers hari raya', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Paket hampers untuk merayakan hari raya bersama.', 'lokasi' => 'Bogor', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Hampers snack premium', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Snack pilihan dalam kemasan premium.', 'lokasi' => 'Depok', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Bingkisan snack box', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Snack box untuk diberikan sebagai bingkisan.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Hampers untuk klien', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Bingkisan apresiasi untuk klien dan mitra.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Hampers makanan premium', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Aneka hidangan dalam kemasan hampers premium.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Snack box untuk bingkisan', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Snack pilihan sebagai bingkisan berkesan.', 'lokasi' => 'Bandung', 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Hampers dessert siap saji', 'kategori_acara' => GaleriKategoriEnum::Hampers, 'deskripsi_acara' => 'Dessert manis dalam kemasan siap berbagi.', 'lokasi' => 'Bogor', 'jumlah_tamu' => null, 'is_featured' => false],
        ],
        'di-balik-dapur' => [
            ['nama_acara' => 'Penyajian yang telaten', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Ketelatenan tim dalam menyajikan setiap hidangan.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => true],
            ['nama_acara' => 'Persiapan hidangan di dapur', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Proses persiapan dengan bahan-bahan segar.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Detail plating hidangan', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Sentuhan akhir pada setiap penyajian.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Memasak menu andalan', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Masakan dimasak dengan sepenuh hati.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Tim yang menyiapkan dengan hati', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Kebersamaan tim di balik setiap perayaan.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Menyiapkan bumbu segar', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Bumbu segar diracik dengan telaten.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Plating hidangan utama', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Setiap hidangan diplating dengan detail.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Bahan-bahan pilihan di dapur', 'kategori_acara' => GaleriKategoriEnum::DiBalikDapur, 'deskripsi_acara' => 'Bahan pilihan disiapkan dengan penuh perhatian.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
        ],
        'lainnya' => [
            ['nama_acara' => 'Hidangan spesial yang berbeda', 'kategori_acara' => null, 'deskripsi_acara' => 'Sajian istimewa di luar kategori biasa.', 'lokasi' => 'Jakarta', 'jumlah_tamu' => 50, 'is_featured' => false],
            ['nama_acara' => 'Sajian unik untuk momen unik', 'kategori_acara' => null, 'deskripsi_acara' => 'Hidangan khas untuk perayaan elegan.', 'lokasi' => null, 'jumlah_tamu' => null, 'is_featured' => false],
            ['nama_acara' => 'Plating kreatif yang memukau', 'kategori_acara' => null, 'deskripsi_acara' => 'Kreasi plating yang penuh kejutan.', 'lokasi' => 'Bogor', 'jumlah_tamu' => 40, 'is_featured' => false],
            ['nama_acara' => 'Bingkisan dan sajian kebersamaan', 'kategori_acara' => null, 'deskripsi_acara' => 'Nasi kotak dan camilan untuk kebersamaan.', 'lokasi' => 'Depok', 'jumlah_tamu' => 30, 'is_featured' => false],
            ['nama_acara' => 'Sajian hangat untuk keluarga besar', 'kategori_acara' => null, 'deskripsi_acara' => 'Hidangan hangat untuk kumpul keluarga.', 'lokasi' => 'Bekasi', 'jumlah_tamu' => 45, 'is_featured' => false],
        ],
    ];

    /**
     * Seed the gallery: purge the Cloudinary `catering-nusantara/galeri/`
     * namespace, upload every staged image per category, then upsert one
     * Galeri row per image zipped against the curated ORIGINALS metadata.
     */
    public function run(): void
    {
        $root = base_path('../frontend/public/assets/images/galeri');

        if (! is_dir($root)) {
            throw new \RuntimeException("Galeri images directory not found: {$root}");
        }

        $this->purgeCloudinaryAssets();

        foreach ($this->categoryFolders($root) as $slug) {
            $folderPath = $root.DIRECTORY_SEPARATOR.$slug;
            $images = $this->imagePaths($folderPath);

            if ($images->count() < self::MIN_IMAGES_PER_CATEGORY) {
                $this->command?->warn('  skip '.$slug.': needs at least '.self::MIN_IMAGES_PER_CATEGORY.' images, found '.$images->count());

                continue;
            }

            $curated = self::ORIGINALS[$slug] ?? null;
            if ($curated === null) {
                throw new \RuntimeException("No seed data defined for category '{$slug}'. Add it to GaleriSeeder::ORIGINALS.");
            }

            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $urls = $images->map(
                fn (string $path): string => $this->uploadToCloudinary($path, $slug)
            )->values();

            if ($urls->count() !== count($curated)) {
                throw new \RuntimeException("Category '{$slug}' has {$urls->count()} uploads but ".count($curated).' curated rows.');
            }

            foreach ($curated as $i => $row) {
                // NULL-safe: `lainnya` rows carry kategori_acara = null.
                $row['kategori_acara'] = $row['kategori_acara']?->value;
                $row['gambar_acara'] = $urls[$i];
                $row['is_featured'] = $row['is_featured'] ?? false;

                Galeri::updateOrCreate(['nama_acara' => $row['nama_acara']], $row);
            }

            $this->command?->info("  seeded {$slug} ({$urls->count()} event(s))");
        }
    }

    /**
     * Delete every asset previously uploaded under the gallery Cloudinary
     * prefix (Admin API `delete resources by prefix`, paginated via
     * `next_cursor`).
     */
    private function purgeCloudinaryAssets(): void
    {
        $prefix = self::CLOUDINARY_PREFIX.'/';
        $url = 'https://api.cloudinary.com/v1_1/'.env('CLOUDINARY_CLOUD_NAME').'/resources/image/upload';
        $next = null;
        $removed = 0;

        do {
            $response = Http::withBasicAuth(env('CLOUDINARY_API_KEY'), env('CLOUDINARY_API_SECRET'))
                ->delete($url, ['prefix' => $prefix] + ($next !== null ? ['next_cursor' => $next] : []));

            if ($response->failed()) {
                throw new \RuntimeException('Cloudinary purge failed: '.$response->body());
            }

            $removed += count((array) ($response->json('deleted') ?? []));
            $next = $response->json('next_cursor');
        } while ($next);

        $this->command?->info("  purged {$prefix} ({$removed} asset(s) removed)");
    }

    /**
     * Category folders under the galeri images root, sorted by name.
     *
     * @return array<int, string>
     */
    private function categoryFolders(string $root): array
    {
        return collect(glob($root.'/*', GLOB_ONLYDIR))
            ->map(fn (string $dir): string => basename($dir))
            ->filter(fn (string $name): bool => ! str_starts_with($name, '.'))
            ->sort()
            ->values()
            ->all();
    }

    /**
     * Image files in a category folder (`.jpg/.jpeg/.png/.webp`), sorted by
     * name (01.jpg … 08.jpg), capped at MAX_IMAGES_PER_CATEGORY.
     *
     * @return Collection<int, string>
     */
    private function imagePaths(string $folder): Collection
    {
        return collect(glob($folder.'/*'))
            ->filter(
                fn (string $path): bool => is_file($path)
                    && preg_match('/\.(jpe?g|png|webp)$/i', $path) === 1
            )
            ->sort()
            ->values()
            ->slice(0, self::MAX_IMAGES_PER_CATEGORY);
    }

    /**
     * Upload a local image to Cloudinary using the native Http client
     * (Basic Auth — no SDK required) and return the secure URL.
     */
    private function uploadToCloudinary(string $path, string $folder): string
    {
        $response = Http::withBasicAuth(env('CLOUDINARY_API_KEY'), env('CLOUDINARY_API_SECRET'))
            ->attach('file', fopen($path, 'r'), basename($path))
            ->post('https://api.cloudinary.com/v1_1/'.env('CLOUDINARY_CLOUD_NAME').'/image/upload', [
                'folder' => self::CLOUDINARY_PREFIX.'/'.$folder,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Cloudinary upload failed for '.$path.': '.$response->body());
        }

        return $response->json('secure_url');
    }
}
