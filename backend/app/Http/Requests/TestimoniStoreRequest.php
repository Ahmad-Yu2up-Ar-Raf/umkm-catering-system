<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Public (anonymous) testimonial submission. Deliberately excludes
 * `visibility` — the controller forces 'private' (moderation queue),
 * so a malicious payload can never self-publish.
 */
class TestimoniStoreRequest extends FormRequest
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
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'paket_id' => ['required', 'integer', 'exists:paket,id'],
        ];
    }
}
