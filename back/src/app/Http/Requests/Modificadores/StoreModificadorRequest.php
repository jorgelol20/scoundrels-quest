<?php

namespace App\Http\Requests\Modificadores;

use Illuminate\Foundation\Http\FormRequest;

class StoreModificadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:300',
            'imagen' => 'nullable|image|max:2048',
            'efectos' => 'required|array'
        ];
    }
}
