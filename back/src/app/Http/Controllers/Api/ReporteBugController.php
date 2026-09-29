<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportesBugs\StoreReporteBugRequest;
use App\Http\Requests\ReportesBugs\UpdateReporteBugRequest;
use App\Http\Requests\ReportesBugs\UpdateEstadoReporteBugRequest;
use App\Models\Notificacion;
use App\Models\ReporteBug;
use App\Notifications\CambioEstadoReporteBugNotificacionUsuario;
use App\Notifications\NuevoReporteBugNotificacion;
use App\Notifications\NuevoReporteBugNotificacionUsuario;
use App\Models\Usuarios;
use App\Services\DiscordReporteBugService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Notification;

class ReporteBugController extends Controller
{

    public function index(Request $request)
    {
        $query = ReporteBug::with('usuario')->latest();

        if (!$request->user()->es_admin) {
            $query->where('usuario_id', $request->user()->id);
        }

        // Filtros opcionales vía query params
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }
        if ($request->filled('tipo')) {
            $query->where('tipo', $request->input('tipo'));
        }

        return response()->json(
            $query->paginate(20)
        );
    }

    public function show(Request $request, ReporteBug $reporte_bug)
    {
        if ($request->user()->id !== $reporte_bug->usuario_id && !$request->user()->es_admin) {
            abort(403, __('api.forbidden_reporte_view'));
        }

        return response()->json(
            $reporte_bug->load(['usuario', 'comentarios.usuario'])
        );
    }

    public function store(StoreReporteBugRequest $request)
    {
        $data = $request->validated();
        $usuario = $request->user();

        $data['usuario_id'] = $usuario->id;

        $data['severidad'] = $data['severidad'] ?? 'media';

        $archivoPath = "";
        if ($request->hasFile('screenshot')) {
            $archivoPath = $request->file('screenshot')->store('reportes_bugs');
            $archivoPath = Storage::url($archivoPath);
        }
        $data['screenshot_url'] = $archivoPath;

        $reporte = ReporteBug::create($data);
        // El mail nunca tumba la petición (p. ej. SMTP 550): patrón de AuthController.
        try {
            Notification::route('mail', 'soporte@scoundrels-quest.com')->notify(new NuevoReporteBugNotificacion($reporte));
        } catch (\Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de nuevo reporte a soporte', ['reporte_id' => $reporte->id, 'error' => $mailError->getMessage()]);
        }
        try {
            Notification::route('mail', $usuario->email)->notify(new NuevoReporteBugNotificacionUsuario($reporte));
        } catch (\Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de nuevo reporte al usuario', ['email' => $usuario->email, 'error' => $mailError->getMessage()]);
        }
        (new NotificacionController)->store(
            usuario_id: $usuario->id,
            tipo: 'reporte',
            descripcion: __('api.notif_reporte_created'),
            reporte_id: $reporte->id,
        );

        $discordService = new DiscordReporteBugService($reporte);
        $discordService->send();

        return response()->json($reporte, 201);
    }

    public function update(UpdateReporteBugRequest $request, ReporteBug $reporte_bug)
    {
        $data = $request->validated();

        $reporte_bug->update($data);

        $usuario = $reporte_bug->usuario;

        try {
            Notification::route('mail', $usuario->email)->notify(new CambioEstadoReporteBugNotificacionUsuario($reporte_bug));
        } catch (\Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de actualización de reporte', ['reporte_id' => $reporte_bug->id, 'error' => $mailError->getMessage()]);
        }
        (new NotificacionController())->store(
            usuario_id: $usuario->id,
            tipo: 'reporte',
            descripcion: __('api.notif_reporte_updated'),
            reporte_id: $reporte_bug->id,
        );
        return response()->json($reporte_bug->fresh());
    }

    public function updateEstado(UpdateEstadoReporteBugRequest $request, ReporteBug $reporte_bug)
    {
        $reporte_bug->update($request->validated());

        $usuario = $reporte_bug->usuario;
        try {
            Notification::route('mail', $usuario->email)->notify(new CambioEstadoReporteBugNotificacionUsuario($reporte_bug));
        } catch (\Exception $mailError) {
            \Log::warning('No se pudo enviar el mail de cambio de estado de reporte', ['reporte_id' => $reporte_bug->id, 'error' => $mailError->getMessage()]);
        }

        (new NotificacionController)->store(
            usuario_id: $usuario->id,
            tipo: 'reporte',
            descripcion: __('api.notif_reporte_estado'),
            reporte_id: $reporte_bug->id,
        );

        return response()->json($reporte_bug->fresh());
    }

    public function destroy(Request $request, ReporteBug $reporte_bug)
    {
        if ($request->user()->id !== $reporte_bug->usuario_id && !$request->user()->es_admin) {
            abort(403, __('api.forbidden_reporte_delete'));
        }

        if ($reporte_bug->screenshot_url) {
            $this->borrarScreenshot($reporte_bug->screenshot_url);
        }

        $reporte_bug->delete();

        return response()->json(null, 204);
    }

    /**
     * `Storage::delete()` espera una ruta RELATIVA al disk, pero el valor
     * guardado es una URL absoluta (`Storage::url()`). Se recorta el prefijo
     * antes de borrar para no apuntar a una ruta inválida.
     */
    private function borrarScreenshot(string $url): void
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        // Elimina el prefijo del disk público, p. ej. "/storage/".
        $base = parse_url(Storage::url(''), PHP_URL_PATH) ?: '/storage/';
        if (str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }

        $path = ltrim($path, '/');

        if ($path !== '' && ! str_contains($path, '..')) {
            Storage::disk('public')->delete($path);
        }
    }
}