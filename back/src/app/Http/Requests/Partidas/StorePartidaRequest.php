<?php

namespace App\Http\Requests\Partidas;

use Illuminate\Foundation\Http\FormRequest;

class StorePartidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La partida se registra siempre a nombre del usuario autenticado:
        // `usuario_id` ya no se acepta desde el cuerpo de la petición.
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'personaje_id' => 'required|integer|exists:personajes,id',
            'tiempo' => 'required|integer|min:0|max:86400',
            'victoria' => 'required|boolean',
            'rondas' => 'required|integer|min:0|max:500',
            'modificadores' => 'nullable|array|max:50',
            'modificadores.*' => 'integer|exists:modificadores,id',
            'oro_obtenido' => 'required|integer|min:0|max:1000000',
            'vida_curada' => 'required|integer|min:0|max:1000000',
            'enemigos_enfrentados' => 'required|integer|min:0|max:1000000',
        ];
    }
}
