<?php

namespace App\Http\Requests\Partidas;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'usuario_id' => 'sometimes|exists:usuarios,id',
            'personaje_id' => 'sometimes|exists:personajes,id',
            'tiempo' => 'sometimes|integer',
            'victoria' => 'sometimes|boolean',
            'rondas' => 'sometimes|integer',
            'modificadores' => 'sometimes|array',
            'oro_obtenido' => 'sometimes|integer',
            'vida_curada' => 'sometimes|integer',
            'enemigos_enfrentados' => 'sometimes|integer',
        ];
    }
}
