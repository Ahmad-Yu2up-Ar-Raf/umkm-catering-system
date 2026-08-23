<?php

namespace App\Http\Requests\Admin\Galeri;

use App\Enums\GaleriKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GaleriStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_acara' => ['required', 'string', 'max:255'],
            'kategori_acara' => ['required', Rule::enum(GaleriKategoriEnum::class)],
            'deskripsi_acara' => ['nullable', 'string'],
            'tanggal_acara' => ['nullable', 'date'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'jumlah_tamu' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'thumbnail' => ['required', 'string', 'max:2048'],
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['required', 'url', 'max:2048'],
        ];
    }
}