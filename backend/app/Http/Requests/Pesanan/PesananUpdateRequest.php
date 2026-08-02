<?php

namespace App\Http\Requests\Pesanan;

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
            'catatan' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
