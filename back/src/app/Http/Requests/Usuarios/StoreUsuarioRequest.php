<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nick' => 'required|string|unique:usuarios,nick|max:30',
            'email' => [
                'required',
                'unique:usuarios,email,',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                // Al menos una mayúscula, una minúscula, un número y un caracter especial
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@$!%*?&]).+$/',
            ],
            'avatar' => 'sometimes|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
            'color' => [
                'sometimes',
                'string',
                'regex:/^#?([a-fA-F0-9]{3}){1,2}$/'
            ]
        ];
    }
    public function messages()
    {
        return [
            'nick.required' => 'El nick es obligatorio.',
            'nick.max' => 'El nick no puede superar los 30 carácteres.',
            'nick.string' => 'El nick no puede estar vacío.',
            'nick.unique' => 'Este nick ya está en uso.',
            'password.regex' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
            'password.string' => 'La contraseña no puede estar vacía.',
            'email.email' => 'El correo introducido no es válido.',
            'email.required' => 'El correo es obligatorio.',
            'email.unique' => 'Este correo ya está en uso.',
            'email.regex' => 'El correo no tiene un formato válido.',
            'avatar.image' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
            'avatar.mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
            'avatar.max' => 'Tamaño máximo de la imagen: 2MB',
            'color.regex' => 'El formato del color debe ser hexadecimal',
        ];
    }
}
