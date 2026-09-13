<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimoniResource extends JsonResource
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
            'nama' => $this->nama,
            'pesanan' => $this->pesanan,
            'acara' => $this->acara,
            'lokasi' => $this->lokasi,
            'tanggal_acara' => $this->tanggal_acara,
            'visibility' => $this->visibility?->value ?? 'private',
            'rating' => $this->rating ?? 5,
            'paket_id' => $this->paket_id,
            'paket' => $this->whenLoaded('paket', fn () => [
                'id' => $this->paket->id,
                'nama_paket' => $this->paket->nama_paket,
                'thumbnail' => $this->paket->thumbnail,
                'harga_per_porsi' => $this->paket->harga_per_porsi,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
