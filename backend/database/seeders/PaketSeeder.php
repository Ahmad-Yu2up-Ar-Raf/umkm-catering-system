<?php

namespace Database\Seeders;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class PaketSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Per-folder image upload limits for product photography.
     *
     * Tweak these two constants to control how many images are uploaded to
     * Cloudinary (and stored in `paket_images`) per product folder:
     *
     * - MIN_IMAGES_PER_FOLDER: folders with fewer images than this are skipped
     *   (a warning is printed). A product needs at least its thumbnail.
     * - MAX_IMAGES_PER_FOLDER: folders with more images are truncated to the
     *   first N (sorted by filename).
     *
     * The thumbnail is always the 1st uploaded image and also the first
     * `paket_images` record, so the frontend gallery/carousel starts natively
     * on the product's thumbnail.
     */
    public const MIN_IMAGES_PER_FOLDER = 2;

    public const MAX_IMAGES_PER_FOLDER = 3;

    /** Cloudinary folder namespace owned by this project. */
    private const CLOUDINARY_PREFIX = 'catering-nusantara/products';

    /**
     * The 5 real client packages (source: `backend/docs/database-seeders.md`
     * — the client's "Analisa Kebutuhan User" sheet). Names, menus,
     * descriptions and PRICES are verbatim. Tumpeng Mini rule:
     * harga_per_porsi = 25.000, min_order = 10 (per-package semantics).
     *
     * Keyed by the product folder slug under
     * `frontend/public/assets/images/products/`.
     *
     * @var array<string, array<string, mixed>>
     */
    private const ORIGINALS = [
        'paket-nasi-box-hemat' => [
            'nama_paket' => 'Paket Nasi Box Hemat',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Kantor,
            'menu_utama' => ['Ayam Goreng', 'Tempe Orek', 'Sayur Sop'],
            'menu_tambahan' => ['Kerupuk'],
            'fasilitas_termasuk' => ['Nasi putih', 'Air mineral gelas'],
            'catatan_alergen' => 'Ayam segar harian, tanpa MSG tambahan',
            'jenis_kemasan' => 'Box kertas food grade',
            'min_order' => 20,
            'harga_per_porsi' => 22000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Menu harian ekonomis untuk kebutuhan kantor/rapat, praktis dan mengenyangkan',
            'is_best_seller' => true,
        ],
        'paket-prasmanan-nikahan' => [
            'nama_paket' => 'Paket Prasmanan Pernikahan',
            'kategori_paket' => PaketKategoriEnum::Prasmanan,
            'kategori_acara' => KategoriAcaraEnum::Pernikahan,
            'menu_utama' => ['Rendang', 'Ayam Bakar', 'Ikan Asam Manis', 'Sayur Lodeh'],
            'menu_tambahan' => ['Puding', 'Es Buah'],
            'fasilitas_termasuk' => ['Nasi putih', 'Kerupuk', 'Sambal', 'Buah potong'],
            'catatan_alergen' => 'Daging sapi & ayam pilihan, disesuaikan permintaan halal/alergen',
            'jenis_kemasan' => 'Chafing dish + alat saji lengkap',
            'min_order' => 100,
            'harga_per_porsi' => 45000,
            'kapasitas_produksi' => 1000,
            'deskripsi' => 'Paket lengkap untuk resepsi pernikahan, termasuk penataan meja prasmanan',
            'is_best_seller' => true,
        ],
        'paket-snack-box-arisan' => [
            'nama_paket' => 'Paket Snack Box Arisan',
            'kategori_paket' => PaketKategoriEnum::Snack,
            'kategori_acara' => KategoriAcaraEnum::Arisan,
            'menu_utama' => ['Kue Basah'],
            'menu_tambahan' => ['Risoles', 'Lumpia', 'Kue Lapis', 'Pastel'],
            'fasilitas_termasuk' => ['Air mineral botol kecil'],
            'catatan_alergen' => 'Bahan segar, digoreng mendadak (bukan stok beku)',
            'jenis_kemasan' => 'Box mika/kardus kecil',
            'min_order' => 15,
            'harga_per_porsi' => 18000,
            'kapasitas_produksi' => 200,
            'deskripsi' => 'Cocok untuk acara santai seperti arisan atau pengajian, isi 4 jenis kue basah',
            'is_best_seller' => false,
        ],
        'paket-tumpeng-mini' => [
            'nama_paket' => 'Paket Tumpeng Mini',
            'kategori_paket' => PaketKategoriEnum::Tumpeng,
            'kategori_acara' => KategoriAcaraEnum::UlangTahun,
            'menu_utama' => ['Ayam Suwir', 'Telur Balado', 'Tempe Kering'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi kuning', 'Sambal goreng ati'],
            'catatan_alergen' => 'Tanpa pengawet, dimasak hari yang sama',
            'jenis_kemasan' => 'Tampah + daun pisang',
            'min_order' => 10,
            'harga_per_porsi' => 25000,
            'kapasitas_produksi' => 20,
            'deskripsi' => 'Tumpeng ukuran mini untuk perayaan kecil di rumah/kantor, tampilan tetap menarik. Harga Rp250.000 per paket (10 porsi).',
            'is_best_seller' => true,
        ],
        'paket-prasmanan-korporat' => [
            'nama_paket' => 'Paket Prasmanan Korporat',
            'kategori_paket' => PaketKategoriEnum::Prasmanan,
            'kategori_acara' => KategoriAcaraEnum::Kantor,
            'menu_utama' => ['Chicken Cordon Bleu', 'Beef Teriyaki', 'Capcay'],
            'menu_tambahan' => ['Puding Coklat'],
            'fasilitas_termasuk' => ['Nasi putih/goreng', 'Air mineral gelas'],
            'catatan_alergen' => 'Menu fusion, bisa request vegetarian',
            'jenis_kemasan' => 'Chafing dish + alat saji lengkap',
            'min_order' => 50,
            'harga_per_porsi' => 55000,
            'kapasitas_produksi' => 500,
            'deskripsi' => 'Menu lebih modern untuk gathering/seminar perusahaan, tampilan lebih formal',
            'is_best_seller' => false,
        ],
    ];

    /**
     * The other 10 product folders — hand-curated inference from each folder
     * name and its photography (no spec sheet exists yet). Names, menus,
     * descriptions and prices are logical for a Bogor catering business
     * (gold/premium > silver tiering). Replace with real client data once a
     * spec sheet arrives. Tumpeng follows the per-package pricing rule.
     *
     * @var array<string, array<string, mixed>>
     */
    private const INFERRED = [
        'paket-gold-ayam-bakar' => [
            'nama_paket' => 'Paket Gold Ayam Bakar',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Putih', 'Ayam Bakar Bumbu Rujak', 'Sambal Goreng Ati', 'Tumis Kangkung'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif premium'],
            'jenis_kemasan' => 'Box premium food grade',
            'min_order' => 10,
            'harga_per_porsi' => 28000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Nasi box premium dengan ayam bakar bumbu rujak, cocok untuk acara formal maupun santai',
            'is_best_seller' => false,
        ],
        'paket-gold-ayam-serundeng' => [
            'nama_paket' => 'Paket Gold Ayam Serundeng',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Putih', 'Ayam Serundeng', 'Sambal Terasi', 'Perkedel Kentang'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif premium'],
            'jenis_kemasan' => 'Box premium food grade',
            'min_order' => 10,
            'harga_per_porsi' => 27000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Ayam serundeng gurih dengan kelapa parut, lauk kaya rasa dan andalan keluarga',
            'is_best_seller' => false,
        ],
        'paket-gold-ayam-teriyaki' => [
            'nama_paket' => 'Paket Gold Ayam Teriyaki',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Kantor,
            'menu_utama' => ['Nasi Putih', 'Ayam Teriyaki', 'Capcay', 'Telur Dadar'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif premium'],
            'jenis_kemasan' => 'Box premium food grade',
            'min_order' => 10,
            'harga_per_porsi' => 29000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Ayam teriyaki dengan saus manis gurih bercita rasa modern, pilihan pas untuk meeting kantor',
            'is_best_seller' => false,
        ],
        'paket-gold-chicken-pop' => [
            'nama_paket' => 'Paket Gold Chicken Pop',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Putih', 'Chicken Pop', 'Sambal Matah', 'Sayur Capcay'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif premium'],
            'jenis_kemasan' => 'Box premium food grade',
            'min_order' => 10,
            'harga_per_porsi' => 26000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Chicken pop renyah dengan sambal matah khas Bali, favorit untuk gathering',
            'is_best_seller' => false,
        ],
        'paket-kebuli' => [
            'nama_paket' => 'Paket Nasi Kebuli',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Kebuli', 'Ayam Goreng', 'Acar Timun', 'Sambal Kecap'],
            'menu_tambahan' => ['Kerupuk', 'Emping'],
            'fasilitas_termasuk' => ['Nasi kebuli', 'Sendok & garpu', 'Kemasan box food grade'],
            'jenis_kemasan' => 'Box karton food grade',
            'min_order' => 15,
            'harga_per_porsi' => 30000,
            'kapasitas_produksi' => 200,
            'deskripsi' => 'Nasi kebuli harum rempah khas Timur Tengah, pilihan istimewa untuk acara spesial',
            'is_best_seller' => false,
        ],
        'paket-nasi-pasundan-ayam-suwir-serundeng' => [
            'nama_paket' => 'Paket Nasi Pasundan Ayam Suwir Serundeng',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Putih', 'Ayam Suwir Serundeng', 'Sambal Dadak', 'Lalapan'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan box food grade'],
            'jenis_kemasan' => 'Box karton food grade',
            'min_order' => 10,
            'harga_per_porsi' => 24000,
            'kapasitas_produksi' => 250,
            'deskripsi' => 'Khas Sunda dengan ayam suwir serundeng dan sambal dadak segar yang menggugah selera',
            'is_best_seller' => false,
        ],
        'paket-premium-chicken-salted-egg' => [
            'nama_paket' => 'Paket Premium Chicken Salted Egg',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Kantor,
            'menu_utama' => ['Nasi Putih', 'Chicken Salted Egg', 'Sayur Cah Brokoli', 'Telur Rebus'],
            'menu_tambahan' => ['Kerupuk', 'Acar'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif premium'],
            'jenis_kemasan' => 'Box premium food grade',
            'min_order' => 10,
            'harga_per_porsi' => 35000,
            'kapasitas_produksi' => 250,
            'deskripsi' => 'Ayam goreng premium dengan saus telur asin, menu modern untuk acara korporat',
            'is_best_seller' => false,
        ],
        'paket-silver-ayam-bakar' => [
            'nama_paket' => 'Paket Silver Ayam Bakar',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Putih', 'Ayam Bakar', 'Sambal Kecap', 'Lalapan'],
            'menu_tambahan' => ['Kerupuk'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan box food grade'],
            'jenis_kemasan' => 'Box karton food grade',
            'min_order' => 10,
            'harga_per_porsi' => 17000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Ayam bakar bumbu rumahan, harian istimewa dengan harga terjangkau',
            'is_best_seller' => false,
        ],
        'paket-silver-ayam-lada-hitam' => [
            'nama_paket' => 'Paket Silver Ayam Lada Hitam',
            'kategori_paket' => PaketKategoriEnum::NasiBox,
            'kategori_acara' => KategoriAcaraEnum::Kantor,
            'menu_utama' => ['Nasi Putih', 'Ayam Lada Hitam', 'Sayur Buncis', 'Telur Dadar'],
            'menu_tambahan' => ['Kerupuk'],
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan box food grade'],
            'jenis_kemasan' => 'Box karton food grade',
            'min_order' => 10,
            'harga_per_porsi' => 18000,
            'kapasitas_produksi' => 300,
            'deskripsi' => 'Ayam lada hitam yang gurih sederhana, tetap terasa premium',
            'is_best_seller' => false,
        ],
        'paket-tumpeng' => [
            'nama_paket' => 'Paket Tumpeng',
            'kategori_paket' => PaketKategoriEnum::Tumpeng,
            'kategori_acara' => KategoriAcaraEnum::Umum,
            'menu_utama' => ['Nasi Kuning', 'Ayam Goreng', 'Urap Sayur', 'Tempe Kering', 'Telur Balado'],
            'menu_tambahan' => ['Kerupuk', 'Acar', 'Sambal'],
            'fasilitas_termasuk' => ['Tampah + daun pisang', 'Hiasan lengkap'],
            'jenis_kemasan' => 'Tampah + daun pisang',
            'min_order' => 15,
            'harga_per_porsi' => 45000,
            'kapasitas_produksi' => 50,
            'deskripsi' => 'Tumpeng ukuran besar untuk syukuran dan hajatan, tampil meriah dengan lauk lengkap. Harga Rp675.000 per paket (15 porsi).',
            'is_best_seller' => false,
        ],
    ];

    /**
     * Seed one `paket` record per product folder under
     * `frontend/public/assets/images/products` (exactly 15 folders):
     *
     * 1. Purge the Cloudinary `catering-nusantara/products/` namespace
     *    (clean slate — no stale assets or duplicates).
     * 2. Upload 2–3 images per folder (max 3, all files used up to the cap).
     * 3. `thumbnail` = 1st upload's secure_url; all uploads → `paket_images`.
     * 4. Data is the exact client spec for the 5 main packages and the
     *    hand-curated inference for the other 10 — no Faker.
     *
     * Idempotent: updateOrCreate on nama_paket, paket_images wiped per paket.
     */
    public function run(): void
    {
        $root = base_path('../frontend/public/assets/images/products');

        if (! is_dir($root)) {
            throw new \RuntimeException("Product images directory not found: {$root}");
        }

        $this->purgeCloudinaryAssets();

        foreach ($this->productFolders($root) as $slug) {
            $folderPath = $root.DIRECTORY_SEPARATOR.$slug;
            $images = $this->imagePaths($folderPath);

            if ($images->count() < self::MIN_IMAGES_PER_FOLDER) {
                $this->command?->warn('  skip '.$slug.': needs at least '.self::MIN_IMAGES_PER_FOLDER.' images, found '.$images->count());

                continue;
            }

            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $urls = $images->map(
                fn (string $path): string => $this->uploadToCloudinary($path, $slug)
            )->values();

            $data = $this->paketData($slug);
            $data['kategori_paket'] = $data['kategori_paket']->value;
            $data['kategori_acara'] = $data['kategori_acara']->value;
            $data['thumbnail'] = $urls->first();

            $paket = Paket::updateOrCreate(['nama_paket' => $data['nama_paket']], $data);

            // Gallery = uploaded URLs in order; the 1st is the thumbnail, so the
            // frontend carousel natively starts on the product's thumbnail.
            $paket->images()->delete();
            $urls->each(fn (string $url) => $paket->images()->create([
                'image_url' => $url,
            ]));

            $this->command?->info("  seeded {$slug} -> {$data['nama_paket']} ({$urls->count()} image(s))");
        }
    }

    /**
     * Delete every asset previously uploaded under this project's Cloudinary
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
     * Product folders under the images root, sorted by name.
     *
     * @return array<int, string>
     */
    private function productFolders(string $root): array
    {
        return collect(glob($root.'/*', GLOB_ONLYDIR))
            ->map(fn (string $dir): string => basename($dir))
            ->sort()
            ->values()
            ->all();
    }

    /**
     * Image files in a folder (`.jpg/.jpeg/.png/.webp`), sorted by name,
     * capped at MAX_IMAGES_PER_FOLDER. Folders with exactly
     * MIN_IMAGES_PER_FOLDER images yield all of them.
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
            ->slice(0, self::MAX_IMAGES_PER_FOLDER);
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

    /**
     * Record for a product folder. Only the 15 known folders are accepted —
     * a new folder fails loudly until its data is curated (no Faker).
     *
     * @return array<string, mixed>
     */
    private function paketData(string $slug): array
    {
        if (isset(self::ORIGINALS[$slug])) {
            return self::ORIGINALS[$slug];
        }

        if (isset(self::INFERRED[$slug])) {
            return self::INFERRED[$slug];
        }

        throw new \RuntimeException(
            "No seed data defined for folder '{$slug}'. Add it to ORIGINALS or INFERRED in PaketSeeder."
        );
    }
}
