<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'partida_id' => 'required|integer|exists:partidas,id',
            'comentario' => 'required|string|min:1|max:1000',
        ];
    }
}
