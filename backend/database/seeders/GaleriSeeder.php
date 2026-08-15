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
     * Records per category (7 categories × 30 = 210 gallery entries) so the
     * paginated API + infinite scroll have real volume to page over.
     */
    public const RECORDS_PER_CATEGORY = 30;

    /** Staging cap per category folder (the shared image pool). */
    public const MAX_IMAGES_PER_CATEGORY = 10;

    private const MIN_IMAGES_PER_CATEGORY = 2;

    /** Cloudinary folder namespace owned by this project's gallery. */
    private const CLOUDINARY_PREFIX = 'catering-nusantara/galeri';

    /** Editorial copy templates — appetizing, food-forward, generic. */
    private const DESCRIPTIONS = [
        'Sajian hangat yang menggugah selera untuk momen istimewa.',
        'Aneka hidangan Nusantara tersaji rapi dan penuh kehangatan.',
        'Porsi pas dan lauk pilihan untuk setiap tamu undangan.',
        'Resep andalan yang diracik dengan bahan segar setiap hari.',
        'Prasmanan lengkap yang menyatukan semua dalam satu meja.',
        'Tampilan menggoda, rasa yang tidak mengecewakan.',
        'Hidangan disiapkan dengan standar kebersihan tertinggi.',
    ];

    /** Category config — label, enum (null = "Lainnya"), featured event copy. */
    private const CATEGORIES = [
        ['label' => 'Pernikahan', 'enum' => GaleriKategoriEnum::Pernikahan, 'featured' => 'Resepsi pernikahan yang anggun', 'featuredDesc' => 'Tata meja resepsi yang hangat dan elegan untuk hari spesial.'],
        ['label' => 'Korporat', 'enum' => GaleriKategoriEnum::Korporat, 'featured' => 'Gathering korporat berkelas', 'featuredDesc' => 'Prasmanan untuk acara gathering perusahaan.'],
        ['label' => 'Tumpeng & Syukuran', 'enum' => GaleriKategoriEnum::TumpengSyukuran, 'featured' => 'Tumpeng syukuran keluarga', 'featuredDesc' => 'Tumpeng nasi kuning khas untuk momen syukuran.'],
        ['label' => 'Perayaan', 'enum' => GaleriKategoriEnum::Perayaan, 'featured' => 'Tumpeng mini ulang tahun', 'featuredDesc' => 'Tumpeng mini yang pas untuk merayakan hari istimewa.'],
        ['label' => 'Hampers', 'enum' => GaleriKategoriEnum::Hampers, 'featured' => 'Bingkisan istimewa untuk berbagi', 'featuredDesc' => 'Bingkisan istimewa yang siap dibagikan.'],
        ['label' => 'Di Balik Dapur', 'enum' => GaleriKategoriEnum::DiBalikDapur, 'featured' => 'Penyajian yang telaten', 'featuredDesc' => 'Ketelatenan tim dalam menyajikan setiap hidangan.'],
        ['label' => 'Lainnya', 'enum' => null, 'featured' => 'Hidangan spesial yang berbeda', 'featuredDesc' => 'Sajian istimewa di luar kategori biasa.'],
    ];

    private const LOCALES = ['Bogor', 'Jakarta', 'Depok', 'Bekasi', 'Bandung', 'Tangerang'];

    /**
     * Seed the gallery: purge Cloudinary, DELETE existing demo rows, upload
     * the staged image pool once, then generate RECORDS_PER_CATEGORY per
     * category reusing that pool of URLs at random (the user-requested
     * strategy — one upload round, 200+ records). Idempotent: rows are wiped
     * at the start of every run.
     */
    public function run(): void
    {
        $root = base_path('../frontend/public/assets/images/galeri');

        if (! is_dir($root)) {
            throw new \RuntimeException("Galeri images directory not found: {$root}");
        }

        $this->purgeCloudinaryAssets();
        Galeri::query()->delete();

        $pool = [];
        foreach ($this->categoryFolders($root) as $slug) {
            $folderPath = $root.DIRECTORY_SEPARATOR.$slug;
            $images = $this->imagePaths($folderPath);
            if ($images->isEmpty()) {
                continue;
            }
            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $urls = $images->map(fn (string $path): ?string => $this->uploadToCloudinary($path, $slug))->filter()->values();
            $pool = array_merge($pool, $urls->all());
        }

        if (count($pool) < self::MIN_IMAGES_PER_CATEGORY) {
            throw new \RuntimeException('Image pool too small for seeding: '.count($pool));
        }

        $total = 0;
        $now = now();
        foreach (self::CATEGORIES as $category) {
            $label = $category['label'];
            for ($i = 1; $i <= self::RECORDS_PER_CATEGORY; $i++) {
                $isFeatured = $i === 1;
                $row = [
                    'nama_acara' => $isFeatured
                        ? $category['featured']
                        : "{$label} #{$i}",
                    'kategori_acara' => $category['enum']?->value, // null = Lainnya
                    'deskripsi_acara' => $isFeatured
                        ? $category['featuredDesc']
                        : self::DESCRIPTIONS[$i % count(self::DESCRIPTIONS)],
                    'gambar_acara' => $pool[array_rand($pool)],
                    // Every event carries real display metadata — venue and
                    // guest count are NEVER null (Hampers / Di Balik Dapur
                    // included), so cards and the Featured band never show a
                    // bare "—" placeholder.
                    'tanggal_acara' => $now->subDays($i * 7 + array_search($label, array_column(self::CATEGORIES, 'label')))
                        ->toDateString(),
                    'lokasi' => self::LOCALES[($i + array_search($label, array_column(self::CATEGORIES, 'label'))) % count(self::LOCALES)],
                    'jumlah_tamu' => random_int(20, 320),
                    'is_featured' => $isFeatured,
                ];

                Galeri::updateOrCreate(['nama_acara' => $row['nama_acara']], $row);
                $total++;
            }
            $this->command?->info("  seeded {$label} (".self::RECORDS_PER_CATEGORY.' event(s))');
        }

        $this->command?->info("  DONE — {$total} gallery rows from a ".count($pool).' image pool');
    }

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

    /** @return array<int, string> */
    private function categoryFolders(string $root): array
    {
        return collect(glob($root.'/*', GLOB_ONLYDIR))
            ->map(fn (string $dir): string => basename($dir))
            ->filter(fn (string $name): bool => ! str_starts_with($name, '.'))
            ->sort()
            ->values()
            ->all();
    }

    /** @return Collection<int, string> */
    private function imagePaths(string $folder): Collection
    {
        return collect(glob($folder.'/*'))
            ->filter(fn (string $path): bool => is_file($path) && preg_match('/\.(jpe?g|png|webp)$/i', $path) === 1)
            ->sort()
            ->values()
            ->slice(0, self::MAX_IMAGES_PER_CATEGORY);
    }

    private function uploadToCloudinary(string $path, string $folder): ?string
    {
        $endpoint = 'https://api.cloudinary.com/v1_1/'.env('CLOUDINARY_CLOUD_NAME').'/image/upload';
        $lastError = null;

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                $response = Http::timeout(120)->connectTimeout(60)
                    ->withBasicAuth(env('CLOUDINARY_API_KEY'), env('CLOUDINARY_API_SECRET'))
                    ->attach('file', fopen($path, 'r'), basename($path))
                    ->post($endpoint, ['folder' => self::CLOUDINARY_PREFIX.'/'.$folder]);

                if ($response->successful()) {
                    return $response->json('secure_url');
                }

                $lastError = 'HTTP '.$response->status().': '.substr($response->body(), 0, 200);
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }

            if ($attempt < 3) {
                $this->command?->warn("  retry {$path} (attempt {$attempt}): {$lastError}");
                usleep(1000000 * $attempt); // 1s, then 2s backoff
            }
        }

        // ponytail: single-file upload failure must not abort the seed;
        // the run reuses the pool, so skipped images are fine.
        $this->command?->warn("  SKIP {$path}: {$lastError}");

        return null;
    }
}
