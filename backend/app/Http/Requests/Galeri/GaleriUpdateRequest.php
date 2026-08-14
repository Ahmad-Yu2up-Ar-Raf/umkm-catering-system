<?php

namespace App\Http\Requests\Galeri;

use App\Enums\GaleriKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GaleriUpdateRequest extends FormRequest
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
            'nama_acara' => ['sometimes', 'required', 'string', 'max:255'],
            'kategori_acara' => ['sometimes', Rule::enum(GaleriKategoriEnum::class)],
            'deskripsi_acara' => ['sometimes', 'nullable', 'string'],
            'gambar_acara' => ['sometimes', 'required', 'string', 'max:2048'],
            'tanggal_acara' => ['sometimes', 'nullable', 'date'],
            'lokasi' => ['sometimes', 'nullable', 'string', 'max:255'],
            'jumlah_tamu' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
