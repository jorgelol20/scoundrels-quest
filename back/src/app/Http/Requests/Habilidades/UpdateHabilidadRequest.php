<?php

namespace App\Http\Requests\Habilidades;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHabilidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'sometimes|string|max:300'
        ];
    }
}
