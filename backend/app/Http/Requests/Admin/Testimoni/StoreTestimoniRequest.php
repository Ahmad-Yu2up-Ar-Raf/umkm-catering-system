<?php

namespace App\Http\Requests\Admin\Testimoni;

use App\Enums\TestimoniVisibilityEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTestimoniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            'pesanan' => ['required', 'string', 'max:2000'],
            'acara' => ['required', 'string', 'max:255'],
            'lokasi' => ['required', 'string', 'max:255'],
            'tanggal_acara' => ['nullable', 'date'],
            // Optional — omitted keys fall through to the DB default ('private').
            'visibility' => ['sometimes', Rule::enum(TestimoniVisibilityEnum::class)],
            // Optional — omitted keys fall through to the DB default (5).
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'paket_id' => ['required', 'integer', 'exists:paket,id'],
        ];
    }
}
