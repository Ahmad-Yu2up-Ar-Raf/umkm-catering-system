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

    /**
     * Category config — slug (folder under `frontend/public/assets/images/gallery/`),
     * label, enum (null = "Lainnya"), featured event copy.
     * Mirrors PaketSeeder's folder-keyed discipline: each category uploads its
     * OWN folder to `catering-nusantara/galeri/{slug}` and its 30 records draw
     * from that category's pool (no cross-category image reuse).
     */
    private const CATEGORIES = [
        ['slug' => 'pernikahan', 'label' => 'Pernikahan', 'enum' => GaleriKategoriEnum::Pernikahan, 'featured' => 'Resepsi pernikahan yang anggun', 'featuredDesc' => 'Tata meja resepsi yang hangat dan elegan untuk hari spesial.'],
        ['slug' => 'korporat', 'label' => 'Korporat', 'enum' => GaleriKategoriEnum::Korporat, 'featured' => 'Gathering korporat berkelas', 'featuredDesc' => 'Prasmanan untuk acara gathering perusahaan.'],
        ['slug' => 'tumpeng-syukuran', 'label' => 'Tumpeng & Syukuran', 'enum' => GaleriKategoriEnum::TumpengSyukuran, 'featured' => 'Tumpeng syukuran keluarga', 'featuredDesc' => 'Tumpeng nasi kuning khas untuk momen syukuran.'],
        ['slug' => 'perayaan', 'label' => 'Perayaan', 'enum' => GaleriKategoriEnum::Perayaan, 'featured' => 'Tumpeng mini ulang tahun', 'featuredDesc' => 'Tumpeng mini yang pas untuk merayakan hari istimewa.'],
        ['slug' => 'hampers', 'label' => 'Hampers', 'enum' => GaleriKategoriEnum::Hampers, 'featured' => 'Bingkisan istimewa untuk berbagi', 'featuredDesc' => 'Bingkisan istimewa yang siap dibagikan.'],
        ['slug' => 'di-balik-dapur', 'label' => 'Di Balik Dapur', 'enum' => GaleriKategoriEnum::DiBalikDapur, 'featured' => 'Penyajian yang telaten', 'featuredDesc' => 'Ketelatenan tim dalam menyajikan setiap hidangan.'],
        ['slug' => 'lainnya', 'label' => 'Lainnya', 'enum' => null, 'featured' => 'Hidangan spesial yang berbeda', 'featuredDesc' => 'Sajian istimewa di luar kategori biasa.'],
    ];

    private const LOCALES = ['Bogor', 'Jakarta', 'Depok', 'Bekasi', 'Bandung', 'Tangerang'];

    /**
     * Remote HD fallback pool (sourced via image-explorer:
     * `node search.js --query="indonesian catering buffet|wedding catering reception|nasi tumpeng indonesian"`).
     * Used when the local staging dir is absent so `migrate:fresh --seed`
     * never throws on a wiped checkout. Unsplash/Pexels CDN URLs are stable
     * delivery URLs (no upload needed).
     */
    private const REMOTE_IMAGE_POOL = [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1539755530862-00f623c00f52?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1600219069516-cbb3dd32fde0?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1658218615127-40b7068bbae5?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1576842546422-60562b9242ae?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1677921755291-c39158477b8e?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1666239308347-4292ea2ff777?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.unsplash.com/photo-1583338917496-7ea264c374ce?w=1920&q=80&fm=jpg&fit=crop',
        'https://images.pexels.com/photos/36766881/pexels-photo-36766881.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        'https://images.pexels.com/photos/306059/pexels-photo-306059.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        'https://images.pexels.com/photos/36956925/pexels-photo-36956925.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        'https://images.pexels.com/photos/36890105/pexels-photo-36890105.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    ];

    /**
     * Seed the gallery (mirrors PaketSeeder): purge the Cloudinary
     * `catering-nusantara/galeri/` namespace, DELETE existing rows, upload
     * each category folder (2–10 images) to `galeri/{slug}`, then generate
     * RECORDS_PER_CATEGORY per category from that category's OWN pool.
     * Idempotent: rows are wiped at the start of every run.
     */
    public function run(): void
    {
        $root = base_path('../frontend/public/assets/images/gallery');

        if (! is_dir($root)) {
            throw new \RuntimeException("Galeri images directory not found: {$root}");
        }

        $this->purgeCloudinaryAssets();
        Galeri::query()->delete();

        // Per-category pools (PaketSeeder discipline): each category folder
        // uploads to galeri/{slug} and its records draw from its own pool.
        $pools = [];
        foreach (self::CATEGORIES as $category) {
            $slug = $category['slug'];
            $images = $this->imagePaths($root.DIRECTORY_SEPARATOR.$slug);
            if ($images->count() < self::MIN_IMAGES_PER_CATEGORY) {
                $this->command?->warn('  skip '.$slug.': needs at least '.self::MIN_IMAGES_PER_CATEGORY.' images, found '.$images->count());

                continue;
            }
            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $urls = $images->map(fn (string $path): ?string => $this->uploadToCloudinary($path, $slug))->filter()->values()->all();
            $pools[$slug] = count($urls) >= self::MIN_IMAGES_PER_CATEGORY ? $urls : self::REMOTE_IMAGE_POOL;
        }

        if (count($pools) === 0) {
            throw new \RuntimeException('No gallery image pools available for seeding');
        }

        $total = 0;
        $now = now();
        foreach (self::CATEGORIES as $index => $category) {
            $slug = $category['slug'];
            $label = $category['label'];
            if (! isset($pools[$slug])) {
                continue;
            }
            $pool = $pools[$slug];
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
                    'tanggal_acara' => $now->copy()->subDays($i * 7 + $index)->toDateString(),
                    'lokasi' => self::LOCALES[($i + $index) % count(self::LOCALES)],
                    'jumlah_tamu' => random_int(20, 320),
                    'is_featured' => $isFeatured,
                ];

                Galeri::updateOrCreate(['nama_acara' => $row['nama_acara']], $row);
                $total++;
            }
            $this->command?->info("  seeded {$label} (".self::RECORDS_PER_CATEGORY.' event(s))');
        }

        $this->command?->info("  DONE — {$total} gallery rows");
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

    /** @return Collection<int, string> */
    private function imagePaths(string $folder): Collection
    {
        return collect(glob($folder.'/*'))
            ->filter(fn (string $path): bool => is_file($path) && preg_match('/\.(jpe?g|png|webp)$/i', $path) === 1)
            ->sort()
            ->values()
            ->slice(0, self::MAX_IMAGES_PER_CATEGORY);
    }

    /** Upload one local image with retry/backoff and return its CANONICAL
     *  (original, untransformed) Cloudinary URL. The DB stores the asset
     *  identity; responsive delivery runs in the frontend (@unpic). */
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
                    return $this->canonicalUrl($response->json());
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

    /**
     * Build the canonical asset URL from the upload response's metadata
     * (`public_id` + `version` + `format`) so the DB is GUARANTEED to hold the
     * original asset reference — never a delivery transformation (e.g.
     * `w_640,h_480,f_auto,c_lfill`).
     */
    private function canonicalUrl(array $upload): string
    {
        return sprintf(
            'https://res.cloudinary.com/%s/image/upload/v%s/%s.%s',
            env('CLOUDINARY_CLOUD_NAME'),
            $upload['version'],
            $upload['public_id'],
            $upload['format'],
        );
    }
}
