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
     * Seed the gallery 1-to-1 (PaketSeeder upload discipline): purge the
     * Cloudinary `catering-nusantara/galeri/` namespace, DELETE existing rows,
     * then walk each category folder SEQUENTIALLY (01.jpg, 02.jpg, ...),
     * upload each file to `galeri/{slug}`, and create exactly ONE row per
     * uploaded URL with its `.attribution` sidecar credit. No URL is reused.
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

        // 1-to-1 sequential seeding: each file uploads to galeri/{slug}
        // and yields exactly ONE row. $usedUrls guards against any
        // duplicate URL ever landing on two rows.
        $total = 0;
        $now = now();
        $usedUrls = [];
        foreach (self::CATEGORIES as $index => $category) {
            $slug = $category['slug'];
            $label = $category['label'];
            $folder = $root.DIRECTORY_SEPARATOR.$slug;
            $images = $this->imagePaths($folder);
            if ($images->isEmpty()) {
                $this->command?->warn("  skip {$slug}: no images found");

                continue;
            }
            $credits = $this->attributionSidecars($folder);
            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $n = 0;
            foreach ($images as $pos => $path) {
                $url = $this->uploadToCloudinary($path, $slug);
                if ($url === null || isset($usedUrls[$url])) {
                    continue;
                }
                $usedUrls[$url] = true;
                $n++;
                $isFeatured = $n === 1;
                $credit = $credits[$pos] ?? [];
                $row = [
                    'nama_acara' => $isFeatured
                        ? $category['featured']
                        : "{$label} #{$n}",
                    'kategori_acara' => $category['enum']?->value, // null = Lainnya
                    'deskripsi_acara' => $isFeatured
                        ? $category['featuredDesc']
                        : self::DESCRIPTIONS[$n % count(self::DESCRIPTIONS)],
                    'gambar_acara' => $url,
                    'photographer' => $credit['photographer'] ?? null,
                    'attribution_url' => $credit['attributionUrl'] ?? null,
                    'license' => $credit['license'] ?? null,
                    // Every event carries real display metadata — venue and
                    // guest count are NEVER null (Hampers / Di Balik Dapur
                    // included), so cards and the Featured band never show a
                    // bare "—" placeholder.
                    'tanggal_acara' => $now->copy()->subDays($n * 7 + $index)->toDateString(),
                    'lokasi' => self::LOCALES[($n + $index) % count(self::LOCALES)],
                    'jumlah_tamu' => random_int(20, 320),
                    'is_featured' => $isFeatured,
                ];

                Galeri::updateOrCreate(['nama_acara' => $row['nama_acara']], $row);
                $total++;
            }
            $this->command?->info("  seeded {$label} ({$n} event(s), 1 row per asset)");
        }

        $this->command?->info("  DONE — {$total} gallery rows, ".count($usedUrls).' unique assets');
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
        // Every image file seeds exactly one row (1-to-1) — no cap, no reuse.
        return collect(glob($folder.'/*'))
            ->filter(fn (string $path): bool => is_file($path) && preg_match('/\.(jpe?g|png|webp)$/i', $path) === 1)
            ->sort()
            ->values();
    }

    /**
     * Attribution sidecars restored from the historical commit:
     * `{folder}/.attribution/*.attribution.json`, sorted by filename.
     * Position $pos maps to the $pos-th image (extras ignored).
     *
     * @return array<int, array{photographer?: string, attributionUrl?: string, license?: string}>
     */
    private function attributionSidecars(string $folder): array
    {
        $files = collect(glob($folder.'/.attribution/*.attribution.json') ?: [])->sort()->values();
        $out = [];
        foreach ($files as $file) {
            try {
                $data = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
                $out[] = is_array($data) ? $data : [];
            } catch (\Throwable $e) {
                $out[] = [];
            }
        }

        return $out;
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
