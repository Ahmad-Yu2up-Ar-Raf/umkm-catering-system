<?php

namespace App\Models;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use Database\Factories\PaketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'nama_paket',
    'kategori_paket',
    'kategori_acara',
    'menu_utama',
    'menu_tambahan',
    'fasilitas_termasuk',
    'catatan_alergen',
    'jenis_kemasan',
    'min_order',
    'harga_per_porsi',
    'kapasitas_produksi',
    'deskripsi',
    'thumbnail',
    'is_best_seller',
])]
class Paket extends Model
{
    /** @use HasFactory<PaketFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'paket';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kategori_paket' => PaketKategoriEnum::class,
            'kategori_acara' => KategoriAcaraEnum::class,
            'menu_utama' => 'array',
            'menu_tambahan' => 'array',
            'fasilitas_termasuk' => 'array',
            'min_order' => 'integer',
            'harga_per_porsi' => 'decimal:2',
            'kapasitas_produksi' => 'integer',
            'is_best_seller' => 'boolean',
            'jenis_kemasan' => 'string',
        ];
    }

    /**
     * Scope a query to best-seller packages.
     */
    public function scopeBestSeller($query)
    {
        return $query->where('is_best_seller', true);
    }

    //  public function scopeForWebsite(Builder $q): Builder
    //     {
    //         // Ubah 'asc' menjadi 'desc' di sini 👇
    //         return $q->withCount('antrian as total_kunjungan')->orderBy('updated_at', 'asc');
    //     }

    /**
     * Get the orders for the package.
     */
    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class);
    }

    /**
     * Get the gallery images for the package.
     */
    public function images(): HasMany
    {
        return $this->hasMany(PaketImage::class);
    }
}
