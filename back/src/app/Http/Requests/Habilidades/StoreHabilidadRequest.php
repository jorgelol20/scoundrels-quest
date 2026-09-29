<?php

namespace App\Http\Requests\Habilidades;

use Illuminate\Foundation\Http\FormRequest;

class StoreHabilidadRequest extends FormRequest
{
    /**
     * Como en el resto de recursos de contenido (Carta/Personajes/
     * Modificadores): la autorización la aplica el middleware
     * ['auth:sanctum', 'admin'] de las rutas más la comprobación esAdmin()
     * del controlador; aquí siempre true para index/show públicos.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:300',
            'codigo' => 'sometimes|string|max:50',
            'efectos' => 'sometimes|nullable|array',
            'coste_oro' => 'sometimes|nullable|integer|min:0',
            'usos_por_ronda' => 'sometimes|nullable|integer|min:0',
            'translations' => 'sometimes|nullable|array',
        ];
    }
}
