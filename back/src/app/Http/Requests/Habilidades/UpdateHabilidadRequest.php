<?php

namespace App\Http\Requests\Habilidades;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHabilidadRequest extends FormRequest
{
    /**
     * Ver StoreHabilidadRequest: autoriza el middleware 'admin' de rutas.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'sometimes|nullable|string|max:300',
            'codigo' => 'sometimes|string|max:50',
            'efectos' => 'sometimes|nullable|array',
            'coste_oro' => 'sometimes|nullable|integer|min:0',
            'usos_por_ronda' => 'sometimes|nullable|integer|min:0',
            'translations' => 'sometimes|nullable|array',
        ];
    }
}
