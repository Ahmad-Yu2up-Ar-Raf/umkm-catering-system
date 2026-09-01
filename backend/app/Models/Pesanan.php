<?php

namespace App\Models;

use App\Enums\MetodePembayaranEnum;
use App\Enums\StatusPesananEnum;
use Database\Factories\PesananFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Order record. total_harga, nomor_struk and harga_paket_satuan are
 * SERVER-COMPUTED and deliberately excluded from $fillable — they can only
 * be set explicitly through PesananService.
 */
#[Fillable([
    'nama_pemesan',
    'no_telepon',
    'alamat',
    'paket_id',
    'jumlah_paket',
    'tanggal_acara',
    'detail_tambahan',
    'menu_tambahan',
    'biaya_tambahan',
    'catatan',
    'status_pesanan',
    'metode_pembayaran',
])]
class Pesanan extends Model
{
    /** @use HasFactory<PesananFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'pesanan';

    /**
     * The model's default values for attributes.
     *
     * @var array<string, string>
     */
    protected $attributes = [
        'status_pesanan' => 'pending',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'detail_tambahan' => 'array',
            'menu_tambahan' => 'array',
            'jumlah_paket' => 'integer',
            'harga_paket_satuan' => 'decimal:2',
            'biaya_tambahan' => 'decimal:2',
            'total_harga' => 'decimal:2',
            'status_pesanan' => StatusPesananEnum::class,
            'metode_pembayaran' => MetodePembayaranEnum::class,
            'tanggal_acara' => 'date:Y-m-d',
        ];
    }

    /**
     * Get the package this order belongs to.
     */
    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }
}
