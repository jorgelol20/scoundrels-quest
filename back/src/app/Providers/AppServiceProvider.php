<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Los Resources de contenido (cartas, personajes, ...) devuelven
        // arrays/objetos planos sin envoltura "data": es el formato que
        // espera el front (ver front/src/hooks/use*.js).
        JsonResource::withoutWrapping();

        $this->configureRateLimiting();
    }

    /**
     * Limitadores de peticiones.
     *
     * Sin ellos, /login es susceptible a fuerza bruta y /signup a la
     * creación masiva automatizada de cuentas.
     */
    protected function configureRateLimiting(): void
    {
        // Login: 5 intentos por minuto y por combinación IP+email.
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email');

            return [
                Limit::perMinute(5)->by($request->ip().'|'.mb_strtolower($email)),
                Limit::perMinute(20)->by($request->ip()),
            ];
        });

        // Registro: 3 cuentas nuevas por hora y por IP.
        RateLimiter::for('signup', function (Request $request) {
            return [
                Limit::perHour(3)->by($request->ip()),
                Limit::perDay(10)->by($request->ip()),
            ];
        });

        // Callbacks OAuth: 10 por minuto y por IP.
        RateLimiter::for('oauth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
