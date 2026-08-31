<?php

namespace App\Http\Requests\Cartas;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'palo' => 'required|string|max:50',
            'valor' => 'required|integer',
            'imagen' => 'nullable|image|max:2048'
        ];
    }
}
