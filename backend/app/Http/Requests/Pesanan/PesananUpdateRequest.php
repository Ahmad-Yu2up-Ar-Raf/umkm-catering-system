<?php

namespace App\Http\Requests\Pesanan;

use App\Enums\MetodePembayaranEnum;
use App\Enums\StatusPesananEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PesananUpdateRequest extends FormRequest
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
     * Financials (total_harga, nomor_struk, harga_paket_satuan) are immutable.
     *
     * @return array<string, array<int, string|Rule>>
     */
    public function rules(): array
    {
        return [
            'status_pesanan' => ['sometimes', 'required', Rule::enum(StatusPesananEnum::class)],
            'metode_pembayaran' => ['sometimes', 'required', Rule::enum(MetodePembayaranEnum::class)],
            'tanggal_acara' => ['sometimes', 'required', 'date', 'after_or_equal:today'],
            'alamat' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'biaya_tambahan' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'detail_tambahan' => ['sometimes', 'nullable', 'array'],
            'detail_tambahan.*' => ['string', 'max:255'],
            'menu_tambahan' => ['sometimes', 'nullable', 'array'],
            'menu_tambahan.*' => ['string', 'max:255'],
            'catatan' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
