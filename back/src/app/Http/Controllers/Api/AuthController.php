<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use App\Notifications\RegistroNotificacionUsuario;
use Auth;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Notification;
use Str;
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
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
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
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function me(Request $request)
    {
        $usuario = $request->user();
        $usuario = $usuario->load(['comentarios', 'tiene_jugadas', 'logros']);
        return response()->json($usuario);
    }

    //Inicio de sesión con Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        $usuario_google = Socialite::driver('google')->stateless()->user();
        $user = Usuarios::firstOrCreate(
            ['email' => $usuario_google->getEmail()],
            [
                'nick' => $usuario_google->getNickname() ?? explode('@', $usuario_google->getEmail())[0],
                'password' => Hash::make(Str::random(64)),
                'avatar' => $usuario_google->getAvatar(),
            ]
        );

        if ($user->wasRecentlyCreated) {
            Notification::route('mail', $user->email)->notify(new RegistroNotificacionUsuario($user));
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return redirect(config('app.frontend_url') . "/auth/callback?token={$token}");
    }

    // Inicio de sesión con Twitter (X)
    public function redirectToX()
    {
        return Socialite::driver('twitter-oauth-2')->redirect();
    }

    public function handleXCallback()
    {
        $xUser = Socialite::driver('twitter-oauth-2')->stateless()->user();

        $user = Usuarios::firstOrCreate(
            ['email' => $xUser->getEmail() ?? $xUser->getId() . '@twitter.com'],
            [
                'nick' => $xUser->getNickname(),
                'password' => Hash::make(Str::random(64)),
                'avatar' => $xUser->getAvatar(),
            ]
        );

        if ($user->wasRecentlyCreated) {
            Notification::route('mail', $user->email)->notify(new RegistroNotificacionUsuario($user));
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect(config('app.frontend_url') . "/auth/callback?token={$token}");
    }
}
