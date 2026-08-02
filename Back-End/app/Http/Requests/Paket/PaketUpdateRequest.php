<?php

namespace App\Http\Requests\Paket;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaketUpdateRequest extends FormRequest
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
     * @return array<string, array<int, string|Rule|Rule[]>>
     */
    public function rules(): array
    {
        return [
            'nama_paket' => ['sometimes', 'required', 'string', 'max:255'],
            'kategori_paket' => ['sometimes', 'required', Rule::enum(PaketKategoriEnum::class)],
            'kategori_acara' => ['sometimes', 'nullable', Rule::enum(KategoriAcaraEnum::class)],
            'menu_utama' => ['sometimes', 'required', 'array', 'min:1'],
            'menu_utama.*' => ['string', 'max:255'],
            'menu_tambahan' => ['sometimes', 'nullable', 'array'],
            'menu_tambahan.*' => ['string', 'max:255'],
            'fasilitas_termasuk' => ['sometimes', 'nullable', 'array'],
            'fasilitas_termasuk.*' => ['string', 'max:255'],
            'catatan_alergen' => ['sometimes', 'nullable', 'string'],
            'jenis_kemasan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'min_order' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'harga_per_porsi' => ['sometimes', 'required', 'numeric', 'min:0'],
            'kapasitas_produksi' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'deskripsi' => ['sometimes', 'nullable', 'string'],
            'gambar' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'is_best_seller' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
