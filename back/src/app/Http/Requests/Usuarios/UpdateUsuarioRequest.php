<?php

namespace App\Http\Requests\Usuarios;

use App\Models\Usuarios;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        // Los administradores pueden editar cualquier perfil.
        if ($user->es_admin) {
            return true;
        }

        // El resto solo puede editar el suyo. Sin esta comprobación, cualquier
        // usuario autenticado podía cambiar la contraseña o el email de otro
        // (IDOR con toma de control de cuentas).
        $targetNick = $this->route('usuario');

        return is_string($targetNick) && $targetNick !== '' && $user->nick === $targetNick;
    }

    public function rules(): array
    {
        // El tercer segmento de `unique` es la clave primaria que se EXCLUYE
        // de la comprobación. El parámetro de ruta es el nick, no el id, así
        // que hay que resolver el id real: si no, un usuario que reenvíe su
        // propio nick/email recibiría un falso "ya está en uso".
        $id = $this->idObjetivo();

        return [
            'nick' => 'sometimes|string|max:30|unique:usuarios,nick,' . $id,
            'email' => [
                'sometimes',
                'email',
                'unique:usuarios,email,' . $id,
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                // Al menos una mayúscula, una minúscula, un número y un caracter especial
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@$!%*?&]).+$/',
            ],
            // `es_admin` e `is_tester` NO se validan aquí a propósito: permitirían
            // que el valor llegue a `->update($request->validated())` y se aplicara.
            // La escalada de privilegios se hace exclusivamente vía
            // PATCH /usuarios/{usuario}/rol, protegido por el middleware 'admin'.
            'avatar' => 'sometimes|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
            'banner' => 'sometimes|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
            'color' => [
                'sometimes',
                'string',
                'regex:/^#?([a-fA-F0-9]{3}){1,2}$/'
            ],
        ];
    }

    /**
     * Clave primaria del usuario que se está editando.
     */
    private function idObjetivo(): int
    {
        $usuario = Usuarios::where('nick', $this->route('usuario'))->first();

        return $usuario?->id ?? 0;
    }

    public function messages()
    {
        return [
            'password.regex' => __('api.user_password_regex'),
            'password.required' => __('api.user_password_required'),
            'password.min' => __('api.user_password_min'),
            'password.string' => __('api.user_password_string'),
            'nick.max' => __('api.user_nick_max'),
            'nick.string' => __('api.user_nick_string'),
            'nick.unique' => __('api.user_nick_unique'),
            'email.email' => __('api.user_email_email'),
            'email.unique' => __('api.user_email_unique'),
            'email.regex' => __('api.user_email_regex'),
            'avatar.image' => __('api.user_avatar_image'),
            'avatar.mimes' => __('api.user_avatar_mimes'),
            'avatar.max' => __('api.user_avatar_max'),
            'banner.image' => __('api.user_banner_image'),
            'banner.mimes' => __('api.user_banner_mimes'),
            'banner.max' => __('api.user_banner_max'),
            'color.regex' => __('api.user_color_regex'),
        ];
    }
}
