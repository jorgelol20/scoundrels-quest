<?php

namespace App\Http\Requests\Partidas;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartidaRequest extends FormRequest
{
    /**
     * La edición de partidas es una operación de administración:
     * la ruta está protegida por el middleware 'admin'.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->es_admin;
    }

    public function rules(): array
    {
        return [
            'usuario_id' => 'sometimes|integer|exists:usuarios,id',
            'personaje_id' => 'sometimes|integer|exists:personajes,id',
            'tiempo' => 'sometimes|integer|min:0|max:86400',
            'victoria' => 'sometimes|boolean',
            'rondas' => 'sometimes|integer|min:0|max:500',
            'modificadores' => 'sometimes|array|max:50',
            'modificadores.*' => 'integer|exists:modificadores,id',
            'oro_obtenido' => 'sometimes|integer|min:0|max:1000000',
            'vida_curada' => 'sometimes|integer|min:0|max:1000000',
            'enemigos_enfrentados' => 'sometimes|integer|min:0|max:1000000',
        ];
    }
}
