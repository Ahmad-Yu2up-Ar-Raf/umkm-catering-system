<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaketResource extends JsonResource
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
            'nama_paket' => $this->nama_paket,
            'kategori_paket' => $this->kategori_paket?->value ?? $this->kategori_paket,
            'kategori_acara' => $this->kategori_acara?->value ?? $this->kategori_acara,
            'menu_utama' => $this->menu_utama,
            'menu_tambahan' => $this->menu_tambahan,
            'fasilitas_termasuk' => $this->fasilitas_termasuk,
            'catatan_alergen' => $this->catatan_alergen,
            'jenis_kemasan' => $this->jenis_kemasan,
            'min_order' => $this->min_order,
            'harga_per_porsi' => $this->harga_per_porsi,
            'kapasitas_produksi' => $this->kapasitas_produksi,
            'deskripsi' => $this->deskripsi,
            'thumbnail' => $this->thumbnail,
            'images' => $this->whenLoaded('images', fn () => $this->images->pluck('image_url')),
            'pesanan_count' => $this->whenCounted('pesanan'),
            'testimoni_count' => $this->whenCounted('testimoni'),
            'rating_avg' => isset($this->rating_avg) && $this->rating_avg !== null
                ? round((float) $this->rating_avg, 1)
                : null,
            'is_best_seller' => $this->is_best_seller,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
