<?php

namespace App\Models;

use App\Enums\KategoriAcaraEnum;
use Database\Factories\GaleriFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'nama_acara',
    'deskripsi_acara',
    'gambar_acara',
    'tanggal_acara',
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
            'kategori_acara' => KategoriAcaraEnum::class,
        ];
    }
}
