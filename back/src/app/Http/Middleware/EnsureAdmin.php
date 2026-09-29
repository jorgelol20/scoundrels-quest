<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a usuarios con el flag `es_admin`.
 *
 * Se aplica a las rutas de escritura del contenido del juego (cartas,
 * personajes, modificadores) y a las rutas de edición/borrado de partidas,
 * usuarios y comentarios.
 *
 * Nota: el middleware solo cubre la autenticación/autorización. Los
 * controladores siguen manteniendo sus propias comprobaciones como
 * defensa en profundidad.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->es_admin) {
            return response()->json([
                'message' => __('api.forbidden'),
            ], 403);
        }

        return $next($request);
    }
}
