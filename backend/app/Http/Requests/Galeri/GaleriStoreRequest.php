<?php

namespace App\Http\Requests\Galeri;

use App\Enums\GaleriKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GaleriStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string|Rule>>
     */
    public function rules(): array
    {
        return [
            'nama_acara' => ['required', 'string', 'max:255'],
            'kategori_acara' => ['sometimes', Rule::enum(GaleriKategoriEnum::class)],
            'deskripsi_acara' => ['nullable', 'string'],
            'gambar_acara' => ['required', 'string', 'max:2048'],
            'tanggal_acara' => ['nullable', 'date'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'jumlah_tamu' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }
}
