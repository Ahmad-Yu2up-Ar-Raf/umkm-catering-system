<?php

namespace App\Models;

use App\Enums\TestimoniVisibilityEnum;
use Database\Factories\TestimoniFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'nama',
    'pesanan',
    'acara',
    'lokasi',
    'tanggal_acara',
    'visibility',
    'rating',
    'paket_id',
])]
class Testimoni extends Model
{
    /** @use HasFactory<TestimoniFactory> */
    use HasFactory;

    /**
     * The table associated with the model (singular, per repo convention).
     */
    protected $table = 'testimoni';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visibility' => TestimoniVisibilityEnum::class,
            'rating' => 'integer',
        ];
    }

    /**
     * The package this testimonial refers to.
     */
    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }

    /**
     * Free-text search across the testimonial columns.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama', 'like', "%{$search}%")
                ->orWhere('pesanan', 'like', "%{$search}%")
                ->orWhere('acara', 'like', "%{$search}%")
                ->orWhere('lokasi', 'like', "%{$search}%");
        });
    }
}
