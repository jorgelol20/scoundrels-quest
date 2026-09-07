<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notificacion;

class NotificacionController extends Controller
{
    /**
     * Devuelve las notificaciones no vistas del usuario autenticado.
     */
    public function index()
    {
        $notificaciones = Notificacion::where('usuario_id', auth()->id())
            //->where('vista', false)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($notificaciones);
    }

    /**
     * Crea una notificación. Llamado internamente desde otros controladores.
     */
    public function store(int $usuario_id, string $tipo, string $descripcion, ?int $reporte_id = null, ?int $partida_id = null)
    {
        $query = Notificacion::where('usuario_id', $usuario_id)
            ->where('tipo', $tipo);

        $reporte_id !== null
            ? $query->where('reporte_id', $reporte_id)
            : $query->whereNull('reporte_id');

        $partida_id !== null
            ? $query->where('partida_id', $partida_id)
            : $query->whereNull('partida_id');

        $notificacion = $query->first();

        if ($notificacion) {
            $notificacion->update([
                'descripcion' => $descripcion,
                'vista' => false,
            ]);
        } else {
            $notificacion = Notificacion::create([
                'usuario_id' => $usuario_id,
                'tipo' => $tipo,
                'descripcion' => $descripcion,
                'reporte_id' => $reporte_id,
                'partida_id' => $partida_id,
            ]);
        }

        return $notificacion;
    }

    /**
     * Marca una notificacion como vista.
     * Solo afecta a las notificaciones del usuario autenticado.
     */
    public function marcarVista($id)
    {
        Notificacion::where('id', $id)
            ->where('usuario_id', auth()->id())
            ->update(['vista' => true]);

        return response()->json(['message' => 'Notificación marcada como vista.']);
    }

    public function marcarTodasVistas()
    {
        Notificacion::where('usuario_id', auth()->id())
            ->where('vista', false)
            ->update(['vista' => true]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como vistas.']);
    }
}