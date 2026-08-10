<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'paket_id',
    'image_url',
])]
class PaketImage extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'paket_images';

    /**
     * Get the package that owns the image.
     */
    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }
}
