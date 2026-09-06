<?php

namespace App\Services;

use App\Events\PesananCreated;
use App\Models\Paket;
use App\Models\Pesanan;
use Illuminate\Validation\ValidationException;

class PesananService
{
    public function __construct(
        private HargaService $harga,
        private StrukService $struk,
    ) {}

    /**
     * Create an order: enforce business rules, snapshot the price, compute
     * total_harga server-side, and generate nomor_struk.
     *
     * @param  array<string, mixed>  $validated
     */
    public function createOrder(array $validated, Paket $paket): Pesanan
    {
        if (! $this->harga->memenuhiMinOrder($paket, $validated['jumlah_paket'])) {
            throw ValidationException::withMessages([
                'jumlah_paket' => "Minimum order for this package is {$paket->min_order} portions.",
            ]);
        }

        if (! $this->harga->dalamKapasitas($paket, $validated['jumlah_paket'])) {
            throw ValidationException::withMessages([
                'jumlah_paket' => 'Quantity exceeds production capacity.',
            ]);
        }

        // Price snapshot — never re-query paket.harga_per_porsi on read.
        $hargaSatuan = (float) $paket->harga_per_porsi;

        $pesanan = new Pesanan($validated);
        $pesanan->harga_paket_satuan = $hargaSatuan;
        $pesanan->total_harga = $this->harga->totalHarga(
            $validated['jumlah_paket'],
            $hargaSatuan,
            (float) ($validated['biaya_tambahan'] ?? 0),
        );
        $pesanan->nomor_struk = $this->struk->generate();
        $pesanan->save();

        // Broadcast to private admin channel (Reverb) — ShouldBroadcastNow = sync, no queue
        // No toOthers() — public guest has no socket ID, must reach all admins
        try {
            broadcast(new PesananCreated($pesanan));
        } catch (\Throwable $e) {
            report($e);
        }

        return $pesanan;
    }

    /**
     * Update order-level fields (status, catatan). Financials are immutable.
     *
     * @param  array<string, mixed>  $validated
     */
    public function updatePesanan(Pesanan $pesanan, array $validated): Pesanan
    {
        $pesanan->update($validated);

        return $pesanan;
    }
}
