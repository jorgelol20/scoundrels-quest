<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartaController;
use App\Http\Controllers\Api\ComentarioReporteBugController as ComentarioReporteBugApiController;
use App\Http\Controllers\Api\NotificacionController as NotificacionApiController;
use App\Http\Controllers\Api\ReporteBugController as ReporteBugApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuariosController as UsuarioApiController;
use App\Http\Controllers\Api\HabilidadController as HabilidadApiController;
use App\Http\Controllers\Api\PartidasController as PartidasApiController;
use App\Http\Controllers\Api\ModificadoresController as ModificadoresApiController;
use App\Http\Controllers\Api\PersonajesController as PersonajesApiController;
use App\Http\Controllers\Api\LogrosController as LogrosApiController;

# Registro y logeo
// Limitados por IP+email / IP para frenar fuerza bruta y altas automatizadas.
Route::post('/signup', [UsuarioApiController::class, 'store'])->middleware('throttle:signup');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas protegidas por Sanctum. 'locale' corre DESPUÉS de auth para que
// SetLocale pueda leer $request->user()->locale (como middleware global api
// corría antes que auth y user() siempre era null).
Route::middleware(['auth:sanctum', 'locale'])->group(function () {

    // Cierre de sesión: revoca el token actual.
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Rutas para obtener el perfil
    Route::get('/perfil', [AuthController::class, 'me']);

    // Fase 0 i18n: locale persistido del usuario
    Route::put('/user/locale', [UsuarioApiController::class, 'updateLocale']);

    // Rutas de jugadores activos
    Route::post('/usuarios/ping', [UsuarioApiController::class, 'ping']);
    Route::get('/jugadores-activos', [UsuarioApiController::class, 'cuentaActiva']);

    // Rutas para eliminar fotos (uso administrativo)
    Route::delete('/usuarios/eliminar-foto/{nick}', [UsuarioApiController::class, 'borrarFotoPerfil'])->middleware('admin');
    Route::delete('/usuarios/eliminar-banner/{nick}', [UsuarioApiController::class, 'borrarBannerPerfil'])->middleware('admin');

    // Rutas de comentarios
    Route::delete('/usuarios/comentario/{id}', [UsuarioApiController::class, 'destroyComentario'])
        ->middleware('admin')
        ->name('api.usuarios.comentario.eliminar');
    Route::put('/usuarios/comentario/{id}', [UsuarioApiController::class, 'updateComentario'])->name('api.usuarios.comentario.actualizar');

    //Rutas de reportes bugs
    Route::apiResource('reportes-bugs', ReporteBugApiController::class)->parameter('reportes-bugs', 'reporte_bug');
    Route::patch('/reportes-bugs/{reporte_bug}/estado', [ReporteBugApiController::class, 'updateEstado']);
    Route::apiResource('reportes-bugs.comentarios', ComentarioReporteBugApiController::class)
        ->parameters([
            'reportes-bugs' => 'reporte_bug',
            'comentarios' => 'comentario',
        ]);

    // Controlador Usuarios.
    Route::apiResource('/usuarios', UsuarioApiController::class)->names('api.usuarios');
    // Alias: el front envía el perfil por POST (no PUT). Mismo controlador y
    // mismas comprobaciones de propiedad. El `where` reserva los segmentos
    // que ya usan rutas literales (p. ej. `comentario`), para que este comodín
    // no las capture.
    Route::match(['post'], '/usuarios/{usuario}', [UsuarioApiController::class, 'update'])
        ->where('usuario', '^(?!comentario$|search$)[^/]+$')
        ->name('api.usuarios.update.post');
    Route::get('/usuarios/search/{search}', [UsuarioApiController::class, 'search'])->name('api.usuarios.search');

    // Concesión/revocación de roles. Exclusiva de administradores.
    Route::patch('/usuarios/{usuario}/rol', [UsuarioApiController::class, 'updateRol'])
        ->middleware('admin')
        ->name('api.usuarios.rol');

    //Rutas logros
    Route::post('/nuevo-logro', [UsuarioApiController::class, 'registrarLogro'])->name('api.usuarios.logro');

    Route::get('/notificaciones', [NotificacionApiController::class, 'index'])->name('api.notificaciones');
    // Marcar vista una notificacion
    Route::patch('/notificacion/{id}/vista', [NotificacionApiController::class, 'marcarVista'])
        ->name('api.notificaciones.vista');

    Route::patch('/notificaciones/vista', [NotificacionApiController::class, 'marcarTodasVistas'])
        ->name('api.notificaciones.todas.vista');

});

// Rutas de creación con limitante de 5 peticiones por minuto y autenticación por Sanctum
Route::middleware(['auth:sanctum', 'throttle:5,1'])->group(function () {
    // Rutas de comentarios
    Route::post('/usuarios/comentario/', [UsuarioApiController::class, 'storeComentario'])->name('api.usuarios.comentario');
});

// Rankings
// Lectura pública. No deben incluir `email` en la proyección (PII).
Route::get('/ranking-victorias', [UsuarioApiController::class, 'ranking_victorias'])->name('api.usuarios.ranking-victorias');
Route::get('/ranking-rondas', [UsuarioApiController::class, 'ranking_rondas'])->name('api.usuarios.ranking-rondas');
Route::get('/ranking-partidas', [PartidasApiController::class, 'ranking_partidas'])->name('api.partidas.ranking-partidas');

/*
|--------------------------------------------------------------------------
| Contenido del juego
|--------------------------------------------------------------------------
| Lectura pública (el juego la necesita sin sesión) y escritura restringida
| a administradores. Antes, `store`/`update`/`destroy` de estos recursos no
| tenían ni autenticación ni control de rol: cualquier anónimo podía borrar
| o modificar el contenido del juego.
*/

// Controlador Partidas.
Route::apiResource('/partidas', PartidasApiController::class)
    ->only(['index', 'show'])
    ->names('api.partidas');
// Registrar partida: exige sesión y la identidad se toma del token.
Route::post('/partidas', [PartidasApiController::class, 'store'])
    ->middleware('auth:sanctum')
    ->name('api.partidas.store');
Route::apiResource('/partidas', PartidasApiController::class)
    ->only(['update', 'destroy'])
    ->middleware(['auth:sanctum', 'admin'])
    ->names('api.partidas');

// Controlador Modificadores.
Route::apiResource('/modificadores', ModificadoresApiController::class)
    ->only(['index', 'show'])
    ->names('api.modificadores');
Route::apiResource('/modificadores', ModificadoresApiController::class)
    ->only(['store', 'update', 'destroy'])
    ->middleware(['auth:sanctum', 'admin'])
    ->names('api.modificadores');

// Controlador Personajes.
Route::apiResource('/personajes', PersonajesApiController::class)
    ->only(['index', 'show'])
    ->names('api.personajes');
Route::apiResource('/personajes', PersonajesApiController::class)
    ->only(['store', 'update', 'destroy'])
    ->middleware(['auth:sanctum', 'admin'])
    ->names('api.personajes');

// Controlador Cartas.
Route::apiResource('/cartas', CartaController::class)
    ->only(['index', 'show'])
    ->names('api.cartas');
Route::apiResource('/cartas', CartaController::class)
    ->only(['store', 'update', 'destroy'])
    ->middleware(['auth:sanctum', 'admin'])
    ->names('api.cartas');

// Controlador Habilidades: mismo patrón que el resto de contenido del juego
// (lectura pública, escritura solo admin autenticado).
Route::apiResource('/habilidades', HabilidadApiController::class)
    ->only(['index', 'show'])
    ->names('api.habilidades');
Route::apiResource('/habilidades', HabilidadApiController::class)
    ->only(['store', 'update', 'destroy'])
    ->middleware(['auth:sanctum', 'admin'])
    ->names('api.habilidades');

// Controlador Logros (solo lectura: el controlador no expone escritura).
Route::apiResource('/logros', LogrosApiController::class)
    ->only(['index', 'show'])
    ->names('api.logros');

//Inicio de sesión con Google
// Bajo middleware 'web' para que Socialite pueda validar el parámetro `state`
// contra la sesión (protección frente a login CSRF).
Route::middleware(['web', 'throttle:oauth'])->group(function () {
    Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
});

//Inicio de sesión con X
Route::middleware(['web', 'throttle:oauth'])->group(function () {
    Route::get('/auth/x/redirect', [AuthController::class, 'redirectToX']);
    Route::get('/auth/x/callback', [AuthController::class, 'handleXCallback']);
});
