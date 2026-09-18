<?php

namespace App\Http\Requests\Admin\Galeri;

use App\Enums\GaleriKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GaleriUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_acara' => ['sometimes', 'required', 'string', 'max:255'],
            'kategori_acara' => ['sometimes', Rule::enum(GaleriKategoriEnum::class)],
            'deskripsi_acara' => ['sometimes', 'nullable', 'string'],
            'tanggal_acara' => ['sometimes', 'nullable', 'date'],
            'lokasi' => ['sometimes', 'nullable', 'string', 'max:255'],
            'jumlah_tamu' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'nullable', 'boolean'],
            'gambar_acara' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'thumbnail' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'images' => ['sometimes', 'nullable', 'array', 'min:1', 'max:10'],
            'images.*' => ['url', 'max:2048'],
            'photographer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'attribution_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'license' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}