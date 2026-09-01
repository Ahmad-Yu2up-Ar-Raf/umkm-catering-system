<?php

namespace App\Http\Requests\Pesanan;

use App\Enums\MetodePembayaranEnum;
use App\Enums\StatusPesananEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PesananStoreRequest extends FormRequest
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
     * total_harga and nomor_struk are intentionally absent — they are
     * SERVER-COMPUTED only.
     *
     * @return array<string, array<int, string|Rule>>
     */
    public function rules(): array
    {
        return [
            'nama_pemesan' => ['required', 'string', 'max:255'],
            'no_telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['nullable', 'string', 'max:1000'],
            'paket_id' => ['required', 'integer', Rule::exists('paket', 'id')],
            'jumlah_paket' => ['required', 'integer', 'min:1'],
            'tanggal_acara' => ['required', 'date', 'after_or_equal:today'],
            'status_pesanan' => ['sometimes', 'required', Rule::enum(StatusPesananEnum::class)],
            'metode_pembayaran' => ['sometimes', 'required', Rule::enum(MetodePembayaranEnum::class)],
            'detail_tambahan' => ['nullable', 'array'],
            'detail_tambahan.*' => ['string', 'max:255'],
            'menu_tambahan' => ['nullable', 'array'],
            'menu_tambahan.*' => ['string', 'max:255'],
            'biaya_tambahan' => ['nullable', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string'],
        ];
    }
}
