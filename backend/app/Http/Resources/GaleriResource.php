<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GaleriResource extends JsonResource
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
            'nama_acara' => $this->nama_acara,
            'kategori_acara' => $this->kategori_acara?->value ?? 'Lainnya',
            'deskripsi_acara' => $this->deskripsi_acara,
            'gambar_acara' => $this->gambar_acara,
            'thumbnail' => $this->thumbnail,
            'images' => $this->images ?? [],
            'tanggal_acara' => $this->tanggal_acara,
            'lokasi' => $this->lokasi,
            'jumlah_tamu' => $this->jumlah_tamu,
            'is_featured' => $this->is_featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
