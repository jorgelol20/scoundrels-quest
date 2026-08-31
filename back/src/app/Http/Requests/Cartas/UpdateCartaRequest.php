<?php

namespace App\Http\Requests\Cartas;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'palo' => 'sometimes|string|max:50',
            'valor' => 'sometimes|integer',
            'imagen' => 'nullable|image|max:2048'
        ];
    }
}
