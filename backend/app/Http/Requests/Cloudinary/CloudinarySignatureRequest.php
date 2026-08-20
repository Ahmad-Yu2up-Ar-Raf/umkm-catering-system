<?php

namespace App\Http\Requests\Cloudinary;

use App\Enums\PaketKategoriEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CloudinarySignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|Rule>>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', Rule::enum(PaketKategoriEnum::class)],
        ];
    }
}
