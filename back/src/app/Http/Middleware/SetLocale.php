<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resuelve el locale de la petición (Fase 0 i18n).
 *
 * Precedencia: locale del usuario autenticado (si la columna `locale`
 * existe y es válida) > cabecera `Accept-Language` > fallback 'es'.
 * Expone el locale efectivo en la cabecera `Content-Language`.
 */
class SetLocale
{
    public const SUPPORTED = ['es', 'en'];

    public const FALLBACK = 'es';

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->parseAcceptLanguage($request->header('Accept-Language'));

        $user = $request->user();
        if ($user && isset($user->locale) && in_array($user->locale, self::SUPPORTED, true)) {
            $locale = $user->locale;
        }

        App::setLocale($locale);

        /** @var \Illuminate\Http\Response $response */
        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    private function parseAcceptLanguage(?string $header): string
    {
        if (! is_string($header) || $header === '') {
            return self::FALLBACK;
        }

        $primary = strtolower(trim(explode(',', $header)[0] ?? ''));
        $primary = explode(';', $primary)[0];
        $primary = explode('-', trim($primary))[0];

        return in_array($primary, self::SUPPORTED, true) ? $primary : self::FALLBACK;
    }
}
