<?php

namespace App\Http\Requests\Galeri;

use Illuminate\Foundation\Http\FormRequest;

class GaleriStoreRequest extends FormRequest
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
            'nama_acara' => ['required', 'string', 'max:255'],
            'deskripsi_acara' => ['nullable', 'string'],
            'gambar_acara' => ['required', 'string', 'max:2048'],
            'tanggal_acara' => ['nullable', 'date'],
        ];
    }
}
