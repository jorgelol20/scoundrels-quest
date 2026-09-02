<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partidas;
use App\Models\Usuarios;
use App\Http\Requests\Usuarios\StoreUsuarioRequest;
use App\Http\Requests\Usuarios\UpdateUsuarioRequest;
use App\Models\Logros;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Hash;

class UsuariosController extends Controller
{
    public function index()
    {
        $usuarios = Usuarios::select('id', 'es_admin' ,'nick', 'avatar', 'color', 'created_at', 'ultima_vez_visto')
            ->withCount([
                'tiene_jugadas as total_victorias' => function ($query) {
                    $query->where('victoria', true);
                },
                'tiene_jugadas as total_derrotas' => function ($query) {
                    $query->where('victoria', false);
                },
                'logros'
            ])
            ->get();
        return response()->json(['usuario' => $usuarios]);
    }

    public function store(StoreUsuarioRequest $request)
    {
        $archivoPath = null;
        if ($request->hasFile('avatar')) {
            $archivoPath = $request->file('avatar')->store('usuarios');
            if (!str_contains($archivoPath, 'googleusercontent.com')) {
                $archivoPath = Storage::url($archivoPath);
            }
        }
        if ($archivoPath == null) {
            $archivoPath = config('app.backend_url') . "/storage/personajes/Guerrero.webp";
        }
        $usuario = Usuarios::create([
            'nick' => $request->nick,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $archivoPath,
            'color' => $request->color
        ]);
        $token = $usuario->createToken('auth_token')->plainTextToken;
        return response()->json([
            "usuario" => $usuario,
            "access_token" => $token,
        ], 201);
    }

    public function show(string $nick)
    {
        $usuario = Usuarios::select('id', 'nick', 'es_admin', 'avatar', 'color', 'created_at', 'ultima_vez_visto')->where('nick', '=', $nick)->get();
        $usuario->load([
        'tiene_jugadas' => function ($query) {
            $query->with(['modificadores', 'personaje'])
                  ->withCount('comentarios');
        },
        'logros',
    ]);
        return response()->json(['usuario' => $usuario], 201);
    }

    // Buscar usuarios por coincidencia en el nick
    public function search(string $search)
    {
        $usuarios = Usuarios::select('id', 'nick', 'email', 'es_admin', 'avatar', 'color', 'created_at', 'ultima_vez_visto')->where('nick', 'LIKE', '%' . $search . '%')->limit(3)->get();
        return response()->json(['usuarios' => $usuarios], 201);
    }

    // Actualizar info de un usuario
    public function update(UpdateUsuarioRequest $request, $nick)
    {
        $usuario = Usuarios::where('nick', $nick)->firstOrFail();
        $data = $request->validated();
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('usuarios');
            $data['avatar'] = Storage::url($path);
        } elseif (isset($data['avatar']) && str_contains($data['avatar'], 'googleusercontent.com')) {
        } else {
            unset($data['avatar']);
        }
        if ($request->has('es_admin')) {
            $currentUser = $request->user();
            if ($currentUser && $currentUser->es_admin) {
                $data['es_admin'] = filter_var($request->input('es_admin'), FILTER_VALIDATE_BOOLEAN);
            }
        }
        $usuario->update($data);
        return response()->json($usuario);
    }

    // Función para eliminar ÚNICAMENTE la foto de perfil
    // La solicitud solo se efectuará si el usuario que la realiza es admin.
    public function borrarFotoPerfil(Request $request, $nick)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => 'No tienes los permisos necesarios para acceder a este recurso.'
            ], 403);
        }
        $usuario = Usuarios::where('nick', $nick)->firstOrFail();
        $archivoPath = config('app.backend_url') . "/storage/personajes/Guerrero.webp";
        $usuario->update(
            [
                'avatar' => $archivoPath
            ]
        );

    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => 'No tienes los permisos necesarios para acceder a este recurso.'
            ], 403);
        }
        Usuarios::findOrFail($id)->delete();
        return response()->json(['message' => 'Usuario eliminado'], 201);
    }

    // Función para guardar un comentario
    public function storeComentario(Request $request)
    {
        $partida = Partidas::findOrFail($request->partida_id);
        $usuarioId = $request->user()->id;
        $partida->comentarios()->attach($usuarioId, [
            'comentario' => $request->comentario,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Comentario añadido con éxito']);
    }

    //Función para actualizar un comentario
    public function updateComentario(Request $request)
    {
        if ($request->user()->id !== $request->usuario_id) {
            return response()->json([
                'message' => 'No tienes los permisos necesarios para acceder a este recurso.'
            ], 403);
        }
        $partida = Partidas::findOrFail($request->partida_id);
        $usuarioId = $request->usuario_id;

        // updateExistingPivot busca por la FK del usuario y actualiza los campos extra
        $partida->comentarios()->updateExistingPivot($usuarioId, [
            'comentario' => $request->comentario,
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Comentario actualizado con éxito']);
    }

    // Función para eliminar un comentario
    // La solicitud solo se efectuará si el usuario que la realiza es admin.
    public function destroyComentario(Request $request, $id)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => 'No tienes los permisos necesarios para acceder a este recurso.'
            ], 403);
        }
        $existe = DB::table('comentarios_usuario_partida')->where('id', $id)->first();
        if (!$existe) {
            return response()->json(['message' => 'El comentario no existe'], 404);
        }
        DB::table('comentarios_usuario_partida')->where('id', $id)->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Comentario eliminado correctamente'
        ]);
    }

    // Función para obtener el ranking de usuarios por victoria
    public function ranking_victorias()
    {
        $usuarios = Usuarios::select('id', 'nick', 'email', 'avatar', 'color', 'created_at', 'es_admin', 'ultima_vez_visto')
            ->withCount([
                'tiene_jugadas as total_victorias' => function ($query) {
                    $query->where('victoria', true);
                },
                'tiene_jugadas as total_derrotas' => function ($query) {
                    $query->where('victoria', false);
                },
                'tiene_jugadas'
            ])
            ->having('total_victorias', '>', 0)
            ->orderBy('total_victorias', 'desc')
            ->get();
        return response()->json(['usuarios' => $usuarios]);
    }

    // Función para obtener el ranking de usuarios por record de rondas
    public function ranking_rondas()
    {
        $usuarios = Usuarios::select('id', 'nick', 'email', 'avatar', 'color', 'created_at', 'es_admin', 'ultima_vez_visto')
            ->withMax('tiene_jugadas as record_rondas', 'rondas')
            ->withCount([
                'tiene_jugadas as total_partidas'
            ])
            ->having('total_partidas', '>', 0)
            ->orderBy('record_rondas', 'desc')
            ->get();

        return response()->json(['usuarios' => $usuarios]);
    }

    // Función para realizar 'ping' y actualizar la última vez visto
    public function ping(Request $request)
    {
        $user = $request->user();

        $user->ultima_vez_visto = now();
        $user->save();

        return response()->json([
            'status' => 'alive',
            'fecha_guardada' => $user->ultima_vez_visto
        ]);
    }


    // Función para obtener el número de usuarios cuya última vez vista haya sido hace menos de 1 minuto.
    public function cuentaActiva()
    {
        $umbral = now()->subSeconds(60)->toDateTimeString();
        $conteo = Usuarios::where('ultima_vez_visto', '>=', $umbral)->count();
        return response()->json(['active_users' => $conteo]);
    }

    //Función para registrar un logro por su ID
    public function registrarLogro(Request $request)
    {
        $request->validate([
            'logro_id' => 'required|integer|exists:logros,id',
            'incremento' => 'nullable|integer|min:1',
        ]);

        $logro = Logros::findOrFail($request->logro_id);
        $usuarioId = $request->user()->id;

        // Logro sin meta
        if (is_null($logro->meta)) {
            $logro->obtenido_por()->syncWithoutDetaching([
                $usuarioId => ['obtenido' => true]
            ]);

            return response()->json([
                'message' => 'Logro registrado.',
                'obtenido' => true,
            ]);
        }

        // Logro con meta -> Verificar o crear el registro inicial
        $pivot = $logro->obtenido_por()->wherePivot('usuario_id', $usuarioId)->first();

        if (!$pivot) {
            // Primera vez: vinculamos al usuario con progreso 0
            $logro->obtenido_por()->attach($usuarioId, [
                'progreso' => 0,
                'obtenido' => false
            ]);
            $progresoActual = 0;
        } else {
            // Si ya existe: extraemos el progreso guardado
            $progresoActual = (int) $pivot->pivot->progreso;
        }

        // Calcular el nuevo progreso
        $incremento = (int) $request->input('incremento', 1);
        $nuevoProgreso = min($progresoActual + $incremento, (int) $logro->meta);
        $obtenido = $nuevoProgreso >= (int) $logro->meta;

        // Actualizar explícitamente la fila existente
        $logro->obtenido_por()->updateExistingPivot($usuarioId, [
            'progreso' => $nuevoProgreso,
            'obtenido' => $obtenido,
        ]);

        return response()->json([
            'message' => $obtenido ? 'Logro completado.' : 'Progreso actualizado.',
            'progreso' => $nuevoProgreso,
            'meta' => $logro->meta,
            'obtenido' => $obtenido,
        ]);
    }
}

