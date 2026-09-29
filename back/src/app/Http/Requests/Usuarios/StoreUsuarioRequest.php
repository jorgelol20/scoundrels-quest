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
                'email',
                'unique:usuarios,email',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'required',
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
            'nick.required' => __('api.user_nick_required'),
            'nick.max' => __('api.user_nick_max'),
            'nick.string' => __('api.user_nick_string'),
            'nick.unique' => __('api.user_nick_unique'),
            'password.regex' => __('api.user_password_regex'),
            'password.required' => __('api.user_password_required'),
            'password.min' => __('api.user_password_min'),
            'password.string' => __('api.user_password_string'),
            'email.email' => __('api.user_email_email'),
            'email.required' => __('api.user_email_required'),
            'email.unique' => __('api.user_email_unique'),
            'email.regex' => __('api.user_email_regex'),
            'avatar.image' => __('api.user_avatar_image'),
            'avatar.mimes' => __('api.user_avatar_mimes'),
            'avatar.max' => __('api.user_avatar_max'),
            'color.regex' => __('api.user_color_regex'),
        ];
    }
}
