<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 1. Confiar en Caddy como Proxy Inverso
        // Esto es vital para que Laravel detecte correctamente el protocolo HTTPS
        // y la dirección IP real del usuario.
        $middleware->trustProxies(at: [
            '127.0.0.1',
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16' // Rangos comunes de redes internas de Docker
        ]);

        // 2. Fase 0 i18n: SetLocale NO va como middleware global api porque
        // corre antes que auth:sanctum y $request->user() siempre sería null
        // (el override por user.locale nunca se aplicaría). Se registra como
        // alias y se aplica en rutas DESPUÉS de auth:sanctum.
        // 3. Alias 'admin': solo usuarios con es_admin. Se aplica a las rutas de
        //    escritura del contenido del juego y a las de edición/borrado.
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'locale' => \App\Http\Middleware\SetLocale::class,
        ]);

        // 4. Si prefieres configurar CORS aquí en lugar de en el archivo config/cors.php
        // (Opcional, pero muy útil en Laravel 11)
        /*
        $middleware->validateCsrfTokens(except: [
            'api/*' // Laravel ya excluye las rutas API por defecto, pero es bueno recordarlo
        ]);
        */
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
