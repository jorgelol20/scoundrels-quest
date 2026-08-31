<?php

namespace App\Http\Requests\Personajes;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePersonajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|string|max:30',
            'descripcion' => 'sometimes|string|max:300',
            'imagen' => 'nullable|image|max:2048',
            'habilidad_id' => 'sometimes|exists:habilidades,id'
        ];
    }
}
