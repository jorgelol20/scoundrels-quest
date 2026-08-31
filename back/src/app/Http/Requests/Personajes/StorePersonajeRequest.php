<?php

namespace App\Http\Requests\Personajes;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:30',
            'descripcion' => 'nullable|string|max:300',
            'imagen' => 'nullable|image|max:2048',
            'habilidad_id' => 'required|exists:habilidades,id'
        ];
    }
}
