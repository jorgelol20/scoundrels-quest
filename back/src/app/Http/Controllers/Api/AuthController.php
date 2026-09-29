<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use App\Notifications\RegistroNotificacionUsuario;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Notification;

class AuthController extends Controller
{
    /**
     * Función para iniciar sesión 'Normalmente'
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $usuario = Usuarios::where('email', $request->email)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            // Mismo mensaje y coste aproximado tanto si el email existe como
            // si no, para no filtrar qué correos están registrados.
            throw ValidationException::withMessages([
                'email' => [__('api.invalid_credentials')],
            ]);
        }

        $usuario = $usuario->load(['comentarios', 'tiene_jugadas', 'logros']);
        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token' => $token
        ]);
    }

    /**
     * Función para cerrar sesión
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => __('api.logout_ok')
        ]);
    }

    public function me(Request $request)
    {
        $usuario = $request->user();
        $usuario = $usuario->load(['comentarios', 'tiene_jugadas', 'logros', 'notificaciones']);
        return response()->json($usuario);
    }

    //Inicio de sesión con Google
    public function redirectToGoogle()
    {
        // Con estado (no stateless): Socialite valida el parámetro `state`
        // contra la sesión, lo que bloquea el login CSRF.
        return Socialite::driver('google')->scopes(['openid', 'email', 'profile'])->redirect();
    }

    public function handleGoogleCallback()
    {
        $usuario_google = Socialite::driver('google')->user();

        // Sin email verificado no se crea ni se vincula ninguna cuenta: de lo
        // contrario el proveedor podría vincularse a una cuenta ajena.
        $email = $usuario_google->getEmail();
        $verificado = (bool) ($usuario_google->user['email_verified'] ?? false);

        if (empty($email) || ! $verificado) {
            return redirect(config('app.frontend_url') . '/auth/error?reason=email_not_verified');
        }

        $user = Usuarios::where('email', $email)->first();

        if (!$user) {
            $user = Usuarios::create([
                'nick' => $this->generarNickUnico($usuario_google->getNickname() ?? explode('@', $email)[0]),
                'email' => $email,
                'password' => Hash::make(Str::random(64)),
                'avatar' => $usuario_google->getAvatar(),
            ]);
        }

        if ($user->wasRecentlyCreated) {
            $this->enviarMailRegistro($user);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->redirigirConToken($token);
    }

    // Inicio de sesión con Twitter (X)
    public function redirectToX()
    {
        return Socialite::driver('twitter-oauth-2')->redirect();
    }

    public function handleXCallback()
    {
        $xUser = Socialite::driver('twitter-oauth-2')->user();

        $email = $xUser->getEmail();

        // X no siempre devuelve el email (depende de los scopes concedidos).
        // Antes se fabricaba uno sintético "{id}@twitter.com", lo que creaba
        // identidades falsas y podía vincular la cuenta equivocada.
        if (empty($email)) {
            return redirect(config('app.frontend_url') . '/auth/error?reason=email_required');
        }

        $user = Usuarios::where('email', $email)->first();

        if (!$user) {
            $user = Usuarios::create([
                'nick' => $this->generarNickUnico($xUser->getNickname() ?? explode('@', $email)[0]),
                'email' => $email,
                'password' => Hash::make(Str::random(64)),
                'avatar' => $xUser->getAvatar(),
            ]);
        }

        if ($user->wasRecentlyCreated) {
            $this->enviarMailRegistro($user);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->redirigirConToken($token);
    }

    /**
     * Devuelve el token en el FRAGMENTO de la URL (#token=...) en lugar del
     * query string. El fragmento no viaja en la petición HTTP: no aparece en
     * logs del servidor, cabeceras Referer ni cabeceras History del navegador.
     */
    private function redirigirConToken(string $token)
    {
        return redirect(config('app.frontend_url') . '/auth/callback#token=' . urlencode($token));
    }

    /**
     * Garantiza que el nick del proveedor no colisiona con uno existente.
     */
    private function generarNickUnico(string $base): string
    {
        $base = Str::limit(preg_replace('/[^\pL\pN._-]/u', '', $base) ?: 'jugador', 24, '');

        if ($base === '') {
            $base = 'jugador';
        }

        $nick = $base;
        $i = 1;

        while (Usuarios::where('nick', $nick)->exists()) {
            $i++;
            $nick = Str::limit($base, 24, '') . $i;
        }

        return $nick;
    }

    /**
     * El mail nunca debe tumbar el registro/login (p. ej. SMTP 550).
     */
    private function enviarMailRegistro(Usuarios $usuario): void
    {
        try {
            Notification::route('mail', $usuario->email)->notify(new RegistroNotificacionUsuario($usuario));
        } catch (Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de registro', [
                'email' => $usuario->email,
                'error' => $mailError->getMessage(),
            ]);
        }
    }
}
