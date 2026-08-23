<?php

namespace App\Models;

use App\Enums\GaleriKategoriEnum;
use Database\Factories\GaleriFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'nama_acara',
    'kategori_acara',
    'deskripsi_acara',
    'gambar_acara',
    'thumbnail',
    'images',
    'tanggal_acara',
    'lokasi',
    'jumlah_tamu',
    'is_featured',
])]
class Galeri extends Model
{
    /** @use HasFactory<GaleriFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'galeri';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_acara' => 'date',
            'kategori_acara' => GaleriKategoriEnum::class,
            'jumlah_tamu' => 'integer',
            'is_featured' => 'boolean',
            'images' => 'array',
        ];
    }

    /**
     * Signature events for the gallery hero (is_featured = true).
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Filter by event category.
     */
    public function scopeKategori(Builder $query, GaleriKategoriEnum $kategori): Builder
    {
        return $query->where('kategori_acara', $kategori);
    }
}
