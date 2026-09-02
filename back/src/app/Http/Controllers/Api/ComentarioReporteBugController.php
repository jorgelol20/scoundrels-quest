<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportesBugs\StoreComentarioReporteBugRequest;
use App\Http\Requests\ReportesBugs\UpdateComentarioReporteBugRequest;
use App\Models\ComentarioReporteBug;
use App\Models\ReporteBug;
use Illuminate\Http\Request;

class ComentarioReporteBugController extends Controller
{
    public function index(Request $request, ReporteBug $reporte_bug)
    {
        if ($request->user()->id !== $reporte_bug->usuario_id && !$request->user()->es_admin) {
            abort(403, 'No tienes permiso para ver estos comentarios.');
        }

        return response()->json(
            $reporte_bug->comentarios()->with('usuario')->latest()->get()
        );
    }

    public function store(StoreComentarioReporteBugRequest $request, ReporteBug $reporte_bug)
    {
        $comentario = $reporte_bug->comentarios()->create([
            'usuario_id' => $request->user()->id,
            'comentario' => $request->validated('comentario'),
        ]);

        return response()->json($comentario->load('usuario'), 201);
    }

    public function update(UpdateComentarioReporteBugRequest $request, ReporteBug $reporte_bug, ComentarioReporteBug $comentario)
    {
        $this->comprobarPertenencia($reporte_bug, $comentario);

        $comentario->update($request->validated());

        return response()->json($comentario->fresh());
    }

    public function destroy(Request $request, ReporteBug $reporte_bug, ComentarioReporteBug $comentario)
    {
        $this->comprobarPertenencia($reporte_bug, $comentario);

        if ($request->user()->id !== $comentario->usuario_id && !$request->user()->es_admin) {
            abort(403, 'No tienes permiso para eliminar este comentario.');
        }

        $comentario->delete();

        return response()->json(null, 204);
    }
    private function comprobarPertenencia(ReporteBug $reporte_bug, ComentarioReporteBug $comentario): void
    {
        if ($comentario->reporte_id !== $reporte_bug->id) {
            abort(404, 'Comentario no encontrado en este reporte.');
        }
    }
}