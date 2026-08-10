<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PesananResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nomor_struk' => $this->nomor_struk,
            'nama_pemesan' => $this->nama_pemesan,
            'no_telepon' => $this->no_telepon,
            'paket_id' => $this->paket_id,
            'paket' => PaketResource::make($this->whenLoaded('paket')),
            'jumlah_paket' => $this->jumlah_paket,
            'harga_paket_satuan' => $this->harga_paket_satuan,
            'detail_tambahan' => $this->detail_tambahan,
            'biaya_tambahan' => $this->biaya_tambahan,
            'catatan' => $this->catatan,
            'total_harga' => $this->total_harga,
            'status_pesanan' => $this->status_pesanan?->value ?? $this->status_pesanan,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
