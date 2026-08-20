<?php

namespace App\Http\Requests\Cloudinary;

use Illuminate\Foundation\Http\FormRequest;

class CloudinaryDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'urls' => ['required', 'array', 'max:100'],
            'urls.*' => ['required', 'string', 'max:2048'],
        ];
    }
}
