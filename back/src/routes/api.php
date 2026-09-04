<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartaController;
use App\Http\Controllers\Api\ComentarioReporteBugController as ComentarioReporteBugApiController;
use App\Http\Controllers\Api\ReporteBugController as ReporteBugApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuariosController as UsuarioApiController;
use App\Http\Controllers\Api\PartidasController as PartidasApiController;
use App\Http\Controllers\Api\ModificadoresController as ModificadoresApiController;
use App\Http\Controllers\Api\PersonajesController as PersonajesApiController;
use App\Http\Controllers\Api\LogrosController as LogrosApiController;

# Registro y logeo
Route::post('/signup', [UsuarioApiController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Rutas para obtener el perfil
    Route::get('/perfil', [AuthController::class, 'me']);

    // Rutas de jugadores activos
    Route::post('/usuarios/ping', [UsuarioApiController::class, 'ping']);
    Route::get('/jugadores-activos', [UsuarioApiController::class, 'cuentaActiva']);

    // Rutas para eliminar fotos
    Route::delete('/usuarios/eliminar-foto/{nick}', [UsuarioApiController::class, 'borrarFotoPerfil']);

    // Rutas de comentarios
    Route::delete('/usuarios/comentario/{id}', [UsuarioApiController::class, 'destroyComentario'])->name('api.usuarios.comentario.eliminar');
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
    Route::get('/usuarios/search/{search}', [UsuarioApiController::class, 'search'])->name('api.usuarios.search');
});

// Rutas de creación con limitante de 5 peticiones por minuto y autenticación por Sanctum
Route::middleware(['auth:sanctum', 'throttle:5,1'])->group(function () {
    // Rutas de comentarios
    Route::post('/usuarios/comentario/', [UsuarioApiController::class, 'storeComentario'])->name('api.usuarios.comentario');

    //Rutas logros
    Route::post('/nuevo-logro', [UsuarioApiController::class, 'registrarLogro'])->name('api.usuarios.logro');
});






// Rankings
Route::get('/ranking-victorias', [UsuarioApiController::class, 'ranking_victorias'])->name('api.usuarios.ranking-victorias');
Route::get('/ranking-rondas', [UsuarioApiController::class, 'ranking_rondas'])->name('api.usuarios.ranking-rondas');
Route::get('/ranking-partidas', [PartidasApiController::class, 'ranking_partidas'])->name('api.partidas.ranking-partidas');

// Controlador Partidas.
Route::apiResource('/partidas', PartidasApiController::class)->names('api.partidas');


// Controlador Modificadores.
Route::apiResource('/modificadores', ModificadoresApiController::class)->names('api.modificadores');

// Controlador Personajes.
Route::apiResource('/personajes', PersonajesApiController::class)->names('api.personajes');

// Controlador Cartas.
Route::apiResource('/cartas', CartaController::class)->names('api.cartas');

// Controlador Logros.
Route::apiResource('/logros', LogrosApiController::class)->names('api.logros');

//Inicio de sesión con Google
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

//Inicio de sesión con X
Route::middleware(['web'])->group(function () {
    Route::get('/auth/x/redirect', [AuthController::class, 'redirectToX']);
    Route::get('/auth/x/callback', [AuthController::class, 'handleXCallback']);
});