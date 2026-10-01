<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Partidas;
use App\Models\Usuarios;
use App\Http\Requests\Usuarios\StoreUsuarioRequest;
use App\Http\Requests\Usuarios\UpdateUsuarioRequest;
use App\Http\Requests\Usuarios\StoreComentarioRequest;
use App\Http\Requests\Usuarios\UpdateComentarioRequest;
use App\Models\Logros;
use App\Notifications\RegistroNotificacionUsuario;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Hash;
use Notification;

class UsuariosController extends Controller
{
    public function index()
    {
        $usuarios = Usuarios::select('id', 'es_admin', 'is_tester', 'nick', 'avatar','banner', 'color', 'created_at', 'ultima_vez_visto')
            ->withCount([
                'tiene_jugadas as total_victorias' => function ($query) {
                    $query->where('victoria', true);
                },
                'tiene_jugadas as total_derrotas' => function ($query) {
                    $query->where('victoria', false);
                },
                'logros',
                'tiene_jugadas'

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
            'banner' => config('app.backend_url') . "/storage/banner.webp",
            'color' => $request->color
        ]);
        $token = $usuario->createToken('auth_token')->plainTextToken;
        // El mail no puede tumbar el registro (p. ej. email con typo -> SMTP 550).
        try {
            Notification::route('mail', $usuario->email)->notify(new RegistroNotificacionUsuario($usuario));
        } catch (\Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de registro', ['email' => $usuario->email, 'error' => $mailError->getMessage()]);
        }
        return response()->json([
            "usuario" => $usuario,
            "access_token" => $token,
        ], 201);
    }

    public function show(Request $request, string $nick)
    {
        $usuario = Usuarios::select('id', 'nick', 'es_admin', 'is_tester', 'avatar','banner', 'color', 'created_at', 'ultima_vez_visto')->where('nick', '=', $nick)->get();
        // Los reportes de bug solo los ve su autor o un admin: no exponerlos
        // en el perfil público de otro usuario.
        $viewer = $request->user();
        $puedeVerReportes = $viewer && ($viewer->es_admin || $usuario->contains('id', $viewer->id));
        $with = [
            'tiene_jugadas' => function ($query) {
                $query->with(['modificadores', 'personaje'])
                    ->withCount('comentarios');
            },
            'logros',
        ];
        if ($puedeVerReportes) {
            $with[] = 'reportesBug';
        }
        $usuario->load($with);
        return response()->json(['usuario' => $usuario]);
    }

    // Buscar usuarios por coincidencia en el nick
    public function search(string $search)
    {
        // Se escapan los comodines de LIKE para que el usuario no pueda
        // forzar un escaneo de tabla completa ('%', '_', '\').
        $termino = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $search);
        $termino = mb_substr($termino, 0, 30);

        $usuarios = Usuarios::select('id', 'nick', 'es_admin', 'is_tester', 'avatar', 'banner', 'color')
            ->where('nick', 'LIKE', '%' . $termino . '%')
            ->limit(3)
            ->get();

        return response()->json(['usuarios' => $usuarios]);
    }

    // Actualizar info de un usuario
    public function update(UpdateUsuarioRequest $request, $nick)
    {
        $usuario = Usuarios::where('nick', $nick)->firstOrFail();
        $data = $request->validated();

        // Defensa en profundidad: aunque la validación ya impide que estos
        // campos viajen en el body, se eliminan siempre antes de persistir.
        // `es_admin`/`is_tester` solo se conceden vía updateRol(), que exige
        // el middleware 'admin'.
        unset($data['es_admin'], $data['is_tester'], $data['id'], $data['ultima_vez_visto']);

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
        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('usuarios');
            $data['banner'] = Storage::url($path);
        } else {
            unset($data['banner']);
        }

        $usuario->update($data);
        return response()->json($usuario);
    }

    /**
     * Concede o revoca los roles (es_admin / is_tester) de un usuario.
     *
     * Ruta protegida por el middleware 'admin': solo un administrador
     * autenticado puede invocarla. Se separó de `update()` precisamente
     * porque antes los roles viajaban en el mismo cuerpo que el perfil y
     * `$request->validated()` los aplicaba sin comprobar nada.
     */
    public function updateRol(Request $request, $nick)
    {
        $data = $request->validate([
            'es_admin' => 'required|boolean',
            'is_tester' => 'sometimes|boolean',
        ]);

        $usuario = Usuarios::where('nick', $nick)->firstOrFail();

        // Asignación explícita: estos campos están fuera de $fillable.
        $usuario->es_admin = filter_var($data['es_admin'], FILTER_VALIDATE_BOOLEAN);
        if (array_key_exists('is_tester', $data)) {
            $usuario->is_tester = filter_var($data['is_tester'], FILTER_VALIDATE_BOOLEAN);
        }
        $usuario->save();

        return response()->json($usuario);
    }

    // Función para eliminar ÚNICAMENTE la foto de perfil
    // La solicitud solo se efectuará si el usuario que la realiza es admin.
    public function borrarFotoPerfil(Request $request, $nick)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => __('api.forbidden')
            ], 403);
        }
        $usuario = Usuarios::where('nick', $nick)->firstOrFail();
        $archivoPath = config('app.backend_url') . "/storage/personajes/Guerrero.webp";
        $usuario->update(
            [
                'avatar' => $archivoPath
            ]
        );

        return response()->json([
            'message' => __('api.usuario_avatar_deleted'),
            'usuario' => $usuario->fresh(),
        ]);
    }

    // Función para eliminar ÚNICAMENTE el banner del perfil
    // La solicitud solo se efectuará si el usuario que la realiza es admin.
    public function borrarBannerPerfil(Request $request, $nick)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => __('api.forbidden')
            ], 403);
        }
        $usuario = Usuarios::where('nick', $nick)->firstOrFail();
        $archivoPath = config('app.backend_url') . "/storage/banner.webp";
        $usuario->update(
            [
                'banner' => $archivoPath
            ]
        );

        return response()->json([
            'message' => __('api.usuario_banner_deleted'),
            'usuario' => $usuario->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => __('api.forbidden')
            ], 403);
        }
        // El parámetro de ruta de apiResource es el nick (string), no el id.
        Usuarios::where('nick', $id)->firstOrFail()->delete();
        return response()->json(['message' => __('api.usuario_deleted')]);
    }

    // Función para guardar un comentario
    public function storeComentario(StoreComentarioRequest $request)
    {
        $partida = Partidas::findOrFail($request->validated('partida_id'));
        $usuarioId = $request->user()->id;

        $partida->comentarios()->syncWithoutDetaching([
            $usuarioId => [
                'comentario' => $request->validated('comentario'),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // No se notifica al propio autor.
        if ($partida->usuario_id !== $usuarioId) {
            (new NotificacionController())->store(
                usuario_id: $partida->usuario_id,
                tipo: 'comentario',
                descripcion: __('api.notif_partida_comentario', ['id' => $partida->id]),
                partida_id: $partida->id,
            );
        }

        return response()->json(['message' => __('api.comentario_added')]);
    }

    //Función para actualizar un comentario
    public function updateComentario(UpdateComentarioRequest $request, $id)
    {
        $usuarioId = $request->user()->id;
        $comentario = DB::table('comentarios_usuario_partida')
            ->where('id', $id)
            ->where('usuario_id', $usuarioId)   // el autor real, no el del body
            ->first();

        if (!$comentario) {
            return response()->json(['message' => __('api.forbidden')], 403);
        }

        $partida = Partidas::findOrFail($request->validated('partida_id'));

        // El comentario debe pertenecer a la partida indicada en el body.
        if ((int) $comentario->partida_id !== (int) $partida->id) {
            return response()->json(['message' => __('api.forbidden')], 403);
        }

        $partida->comentarios()->updateExistingPivot($usuarioId, [
            'comentario' => $request->validated('comentario'),
            'updated_at' => now()
        ]);

        return response()->json(['message' => __('api.comentario_updated')]);
    }

    // Función para eliminar un comentario
    // La solicitud solo se efectuará si el usuario que la realiza es admin.
    public function destroyComentario(Request $request, $id)
    {
        if (!$request->user()->es_admin) {
            return response()->json([
                'message' => __('api.forbidden')
            ], 403);
        }
        $existe = DB::table('comentarios_usuario_partida')->where('id', $id)->first();
        if (!$existe) {
            return response()->json(['message' => __('api.comentario_not_found')], 404);
        }
        DB::table('comentarios_usuario_partida')->where('id', $id)->delete();
        // No se notifica a un autor inexistente.
        if ($existe->usuario_id) {
            Notificacion::create([
                'usuario_id'  => $existe->usuario_id,
                'tipo'        => 'comentario',
                'descripcion' => __('api.notif_comentario_deleted'),
                'reporte_id'  => null,
                'partida_id'  => $existe->partida_id,
            ]);
        }
        return response()->json([
            'status' => 'success',
            'message' => __('api.comentario_deleted')
        ]);
    }

    // Función para obtener el ranking de usuarios por victoria
    public function ranking_victorias()
    {
        // Sin `email`: estas rutas son públicas y filtrar el correo expondría
        // la dirección de todos los usuarios a cualquier visitante anónimo.
        //
        // El filtro se hace con `has()` sobre la relación y no con `having()`:
        // `having` sin `groupBy` es inválido en SQLite y en MySQL descarta
        // todas las filas, dejando el ranking siempre vacío.
        $usuarios = Usuarios::select('id', 'nick', 'avatar', 'color', 'es_admin', 'is_tester')
            ->withCount([
                'tiene_jugadas as total_victorias' => function ($query) {
                    $query->where('victoria', true);
                },
                'tiene_jugadas as total_derrotas' => function ($query) {
                    $query->where('victoria', false);
                },
                'tiene_jugadas'
            ])
            ->whereHas('tiene_jugadas', fn ($q) => $q->where('victoria', true))
            ->orderBy('total_victorias', 'desc')
            ->get();
        return response()->json(['usuarios' => $usuarios]);
    }

    // Función para obtener el ranking de usuarios por record de rondas
    public function ranking_rondas()
    {
        // Sin `email` (ruta pública). Ver ranking_victorias().
        $usuarios = Usuarios::select('id', 'nick', 'avatar', 'color', 'es_admin', 'is_tester')
            ->withMax('tiene_jugadas as record_rondas', 'rondas')
            ->withCount([
                'tiene_jugadas as total_partidas'
            ])
            ->has('tiene_jugadas', '>=', 1)
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

    // Fase 0 i18n: persiste el locale del usuario ('es' | 'en').
    public function updateLocale(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|string|in:es,en',
        ]);

        $user = $request->user();
        $user->locale = $validated['locale'];
        $user->save();

        return response()->json([
            'locale' => $user->locale,
            'message' => __('api.locale_ok'),
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
            'logro_codigo' => 'required|string|exists:logros,codigo',
            'incremento' => 'nullable|integer|min:1',
        ]);

        $logro = Logros::where('codigo', $request->logro_codigo)->firstOrFail();
        $usuarioId = $request->user()->id;

        // Logro sin meta
        if (is_null($logro->meta)) {
            $logro->obtenido_por()->syncWithoutDetaching([
                $usuarioId => ['obtenido' => true]
            ]);

            return response()->json([
                'message' => __('api.logro_registered'),
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
            'message' => $obtenido ? __('api.logro_completed') : __('api.progreso_updated'),
            'progreso' => $nuevoProgreso,
            'meta' => $logro->meta,
            'obtenido' => $obtenido,
        ]);
    }
}

