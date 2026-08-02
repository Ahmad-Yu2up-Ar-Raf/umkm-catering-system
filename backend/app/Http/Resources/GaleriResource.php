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
            'deskripsi_acara' => $this->deskripsi_acara,
            'gambar_acara' => $this->gambar_acara,
            'tanggal_acara' => $this->tanggal_acara,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
