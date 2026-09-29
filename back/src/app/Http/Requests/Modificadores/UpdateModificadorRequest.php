<?php

namespace App\Http\Requests\Modificadores;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModificadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'sometimes|nullable|string|max:300',
            'imagen' => 'nullable|image|max:2048',
            'efectos' => 'sometimes|array',
            'nivel' => 'sometimes|integer|min:1',
            'activo' => 'sometimes|boolean',
            'translations' => 'sometimes|nullable|array',
        ];
    }
}
