<?php

namespace App\Http\Requests\Galeri;

use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'nama_acara' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi_acara' => ['sometimes', 'nullable', 'string'],
            'gambar_acara' => ['sometimes', 'required', 'string', 'max:2048'],
            'tanggal_acara' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
