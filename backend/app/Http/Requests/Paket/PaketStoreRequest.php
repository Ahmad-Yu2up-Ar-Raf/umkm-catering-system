<?php

namespace App\Http\Requests\Paket;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaketStoreRequest extends FormRequest
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
            'nama_paket' => ['required', 'string', 'max:255'],
            'kategori_paket' => ['required', Rule::enum(PaketKategoriEnum::class)],
            'kategori_acara' => ['nullable', Rule::enum(KategoriAcaraEnum::class)],
            'menu_utama' => ['required', 'array', 'min:1'],
            'menu_utama.*' => ['string', 'max:255'],
            'menu_tambahan' => ['nullable', 'array'],
            'menu_tambahan.*' => ['string', 'max:255'],
            'fasilitas_termasuk' => ['nullable', 'array'],
            'fasilitas_termasuk.*' => ['string', 'max:255'],
            'catatan_alergen' => ['nullable', 'string'],
            'jenis_kemasan' => ['nullable', 'string', 'max:255'],
            'min_order' => ['nullable', 'integer', 'min:1'],
            'harga_per_porsi' => ['required', 'numeric', 'min:0'],
            'kapasitas_produksi' => ['nullable', 'integer', 'min:1'],
            'deskripsi' => ['nullable', 'string'],
            'gambar' => ['nullable', 'string', 'max:2048'],
            'is_best_seller' => ['nullable', 'boolean'],
        ];
    }
}
