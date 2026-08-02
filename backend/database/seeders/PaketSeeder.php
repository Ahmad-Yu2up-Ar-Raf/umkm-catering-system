<?php

namespace Database\Seeders;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PaketSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the paket table with the 5 real client packages
     * (source: "Analisa Kebutuhan User" sheet).
     *
     * Idempotent: updateOrCreate keyed on nama_paket — safe to re-run.
     * JSON arrays passed as native PHP arrays (model casts handle encoding).
     * Tumpeng Mini rule: harga_per_porsi = 25.000, min_order = 10 (per-package semantics).
     *
     * @return array<int, array<string, mixed>>
     */
    private function paket(): array
    {
        return [
            [
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
                'gambar' => 'https://images.unsplash.com/photo-1666239308347-4292ea2ff777?w=1920&q=80&fm=jpg&fit=crop',
                'is_best_seller' => true,
                'created_at' => Carbon::create(2019, 1, 1),
            ],
            [
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
                'gambar' => 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80&fm=jpg&fit=crop',
                'is_best_seller' => true,
                'created_at' => Carbon::create(2019, 3, 1),
            ],
            [
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
                'gambar' => 'https://images.unsplash.com/photo-1738225734433-9fb17ed770a4?w=1920&q=80&fm=jpg&fit=crop',
                'is_best_seller' => false,
                'created_at' => Carbon::create(2020, 6, 1),
            ],
            [
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
                'gambar' => 'https://images.pexels.com/photos/36956925/pexels-photo-36956925.jpeg?auto=compress&cs=tinysrgb&w=1600',
                'is_best_seller' => true,
                'created_at' => Carbon::create(2021, 2, 1),
            ],
            [
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
                'gambar' => 'https://images.pexels.com/photos/34321370/pexels-photo-34321370.jpeg?auto=compress&cs=tinysrgb&w=1600',
                'is_best_seller' => false,
                'created_at' => Carbon::create(2022, 9, 1),
            ],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->paket() as $data) {
            // Enums must be persisted as their backing string value.
            $data['kategori_paket'] = $data['kategori_paket']->value;
            $data['kategori_acara'] = $data['kategori_acara']->value;

            Paket::updateOrCreate(
                ['nama_paket' => $data['nama_paket']],
                $data,
            );
        }
    }
}
