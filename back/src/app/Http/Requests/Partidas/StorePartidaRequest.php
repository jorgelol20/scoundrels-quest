<?php

namespace App\Http\Requests\Partidas;

use Illuminate\Foundation\Http\FormRequest;

class StorePartidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'usuario_id' => 'required|exists:usuarios,id',
            'personaje_id' => 'required|exists:personajes,id',
            'tiempo' => 'required|integer',
            'victoria' => 'required|boolean',
            'rondas' => 'required|integer',
            'modificadores' => 'required|array',
            'oro_obtenido' => 'required|integer',
            'vida_curada' => 'required|integer',
            'enemigos_enfrentados' => 'required|integer',
        ];
    }
}
