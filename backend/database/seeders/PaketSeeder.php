<?php

namespace Database\Seeders;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use App\Models\PaketImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class PaketSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * The 5 real client packages, keyed by their product folder slug under
     * `frontend/public/assets/images/products/` (source: "Analisa Kebutuhan
     * User" sheet). Kept verbatim from the previous seeder — only the
     * `gambar` URL is dropped: the thumbnail now comes from the uploaded
     * Cloudinary asset. Tumpeng Mini rule: harga_per_porsi = 25.000,
     * min_order = 10 (per-package semantics).
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
     * Seed paket + paket_images from the local product photography folders,
     * uploading each product's images to Cloudinary via the native Http client.
     *
     * - Scans `frontend/public/assets/images/products` (one folder per product).
     * - Cross-references `menu-data.ts` for display names/descriptions.
     * - Takes at most 2 image files (.jpg/.png/.webp) per folder.
     * - 1st uploaded secure_url -> paket.thumbnail; both -> paket_images.
     * - Idempotent: updateOrCreate on nama_paket, paket_images wiped per paket.
     */
    public function run(): void
    {
        $root = base_path('../frontend/public/assets/images/products');

        if (! is_dir($root)) {
            throw new \RuntimeException("Product images directory not found: {$root}");
        }

        $menuMap = $this->menuMap();

        foreach ($this->productFolders($root) as $slug) {
            $folderPath = $root.DIRECTORY_SEPARATOR.$slug;
            $images = $this->imagePaths($folderPath);

            if ($images->isEmpty()) {
                $this->command?->warn("  skip {$slug}: no .jpg/.png/.webp image found");

                continue;
            }

            $this->command?->info("  upload {$slug} ({$images->count()} image(s))...");
            $urls = $images->map(
                fn (string $path): string => $this->uploadToCloudinary($path, $slug)
            );

            $data = $this->paketData($slug, $menuMap[$slug] ?? null);
            $data['kategori_paket'] = $data['kategori_paket']->value;
            $data['kategori_acara'] = $data['kategori_acara']->value;
            $data['thumbnail'] = $urls->first();

            $paket = Paket::updateOrCreate(['nama_paket' => $data['nama_paket']], $data);

            PaketImage::where('paket_id', $paket->id)->delete();
            $urls->each(fn (string $url) => PaketImage::create([
                'paket_id' => $paket->id,
                'image_url' => $url,
            ]));

            $this->command?->info("  seeded {$slug} -> {$data['nama_paket']} ({$urls->count()} image(s))");
        }
    }

    /**
     * Product folders found under the images root, sorted by name.
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
     * First 2 image files (.jpg/.jpeg/.png/.webp) in a folder, sorted by name.
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
            ->slice(0, 2);
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
                'folder' => 'catering-nusantara/products/'.$folder,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Cloudinary upload failed for '.$path.': '.$response->body());
        }

        return $response->json('secure_url');
    }

    /**
     * Build the record for one product folder: the original client data when
     * the slug matches an existing package, otherwise Faker mock data
     * enriched with the menu-data.ts title/description.
     *
     * @return array<string, mixed>
     */
    private function paketData(string $slug, ?array $menu): array
    {
        if (isset(self::ORIGINALS[$slug])) {
            return self::ORIGINALS[$slug];
        }

        $nama = $menu['title'] ?? ucwords(str_replace(['-', '_'], ' ', $slug));
        $menuUtama = ['Nasi Putih', 'Ayam Goreng', 'Rendang Sapi', 'Sambal Goreng Ati', 'Telur Balado', 'Ayam Suwir', 'Tumis Kangkung', 'Sop Ayam', 'Udang Saus Padang', 'Tempe Orek'];
        $menuTambahan = ['Kerupuk', 'Acar', 'Sambal', 'Pisang Goreng', 'Es Teh Manis'];

        return [
            'nama_paket' => $nama,
            'kategori_paket' => fake()->randomElement(PaketKategoriEnum::cases()),
            'kategori_acara' => fake()->randomElement(KategoriAcaraEnum::cases()),
            'menu_utama' => fake()->randomElements($menuUtama, 4),
            'menu_tambahan' => fake()->randomElements($menuTambahan, 2),
            'fasilitas_termasuk' => ['Nasi putih', 'Sendok & garpu', 'Kemasan eksklusif', 'Free ongkir area Bogor'],
            'catatan_alergen' => fake()->optional(0.4)->sentence(5),
            'jenis_kemasan' => fake()->randomElement(['Box karton food grade', 'Dulang aluminium', 'Piring keramik', 'Box mika']),
            'min_order' => fake()->randomElement([10, 15, 20, 50, 100]),
            'harga_per_porsi' => fake()->randomElement([15000, 18000, 25000, 35000, 45000, 55000]),
            'kapasitas_produksi' => fake()->numberBetween(50, 1000),
            'deskripsi' => $menu['description'] ?? fake()->sentence(8),
            'is_best_seller' => fake()->boolean(15),
        ];
    }

    /**
     * Parse `menu-data.ts` into [product folder slug => metadata], deriving the
     * slug from each entry's imagePath directory (works with or without the
     * `ai-generated/` intermediate segment).
     *
     * @return array<string, array{id: string, title: ?string, description: ?string, imagePath: ?string}>
     */
    private function menuMap(): array
    {
        $path = base_path('../frontend/src/components/ui/core/block/home/pilihan-menu/menu-data.ts');

        if (! file_exists($path)) {
            return [];
        }

        $source = (string) file_get_contents($path);
        preg_match_all('/\{([^{}]*)\}/s', $source, $blocks);

        $map = [];
        foreach ($blocks[1] as $block) {
            if (preg_match('/id:\s*"([^"]+)"/', $block, $id) !== 1) {
                continue;
            }

            $title = preg_match('/title:\s*"([^"]+)"/', $block, $t) === 1 ? $t[1] : null;
            $description = preg_match('/description:\s*"([^"]+)"/', $block, $d) === 1 ? $d[1] : null;
            $imagePath = preg_match('/imagePath:\s*\n?\s*"([^"]+)"/', $block, $i) === 1 ? $i[1] : null;

            $folder = $imagePath !== null ? basename(dirname($imagePath)) : null;
            if ($folder === null || in_array($folder, ['.', '/', ''], true)) {
                continue;
            }

            $map[$folder] = [
                'id' => $id[1],
                'title' => $title,
                'description' => $description,
                'imagePath' => $imagePath,
            ];
        }

        return $map;
    }
}
