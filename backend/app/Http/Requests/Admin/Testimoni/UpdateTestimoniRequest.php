<?php

namespace App\Http\Requests\Admin\Testimoni;

use App\Enums\TestimoniVisibilityEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTestimoniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'pesanan' => ['sometimes', 'required', 'string', 'max:2000'],
            'acara' => ['sometimes', 'required', 'string', 'max:255'],
            'lokasi' => ['sometimes', 'required', 'string', 'max:255'],
            'tanggal_acara' => ['sometimes', 'nullable', 'date'],
            'visibility' => ['sometimes', Rule::enum(TestimoniVisibilityEnum::class)],
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'paket_id' => ['sometimes', 'required', 'integer', 'exists:paket,id'],
        ];
    }
}
