<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => [
                'sometimes',
                'string',
                'min:8',
                // Al menos una mayúscula, una minúscula, un número y un caracter especial
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@$!%*?&]).+$/',
            ],
            'es_admin' => 'sometimes|boolean',
            'avatar' => 'sometimes|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
            'color' => [
                'sometimes',
                'string',
                'regex:/^#?([a-fA-F0-9]{3}){1,2}$/'
            ],
        ];
    }
    public function messages()
    {
        return [
            'password.regex' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
            'password.string' => 'La contraseña no puede estar vacía.',
            'avatar.image' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
            'avatar.mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
            'avatar.max' => 'Tamaño máximo de la imagen: 2MB',
            'color.regex' => 'El formato del color debe ser hexadecimal',
        ];
    }
}
