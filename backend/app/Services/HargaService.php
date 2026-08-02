<?php

namespace App\Services;

use App\Models\Paket;

class HargaService
{
    /**
     * total_harga = (jumlah_paket * harga_paket_satuan) + biaya_tambahan.
     */
    public function totalHarga(int $jumlahPaket, float $hargaSatuan, float $biayaTambahan = 0): float
    {
        return ($jumlahPaket * $hargaSatuan) + $biayaTambahan;
    }

    /**
     * Subtotal before additional costs, using the package's per-portion price.
     * Tumpeng Mini is handled by harga_per_porsi=25000 + min_order=10, so
     * 10 portions = Rp250.000 (one package).
     */
    public function subtotalPaket(Paket $paket, int $jumlahPaket): float
    {
        return $jumlahPaket * (float) $paket->harga_per_porsi;
    }

    /**
     * Whether the requested quantity meets the package's minimum order.
     */
    public function memenuhiMinOrder(Paket $paket, int $jumlahPaket): bool
    {
        return $jumlahPaket >= $paket->min_order;
    }

    /**
     * Whether the requested quantity fits within production capacity.
     */
    public function dalamKapasitas(Paket $paket, int $jumlahPaket): bool
    {
        return $paket->kapasitas_produksi === null || $jumlahPaket <= $paket->kapasitas_produksi;
    }
}
