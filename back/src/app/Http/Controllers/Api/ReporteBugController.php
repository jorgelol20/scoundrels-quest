<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportesBugs\StoreReporteBugRequest;
use App\Http\Requests\ReportesBugs\UpdateReporteBugRequest;
use App\Http\Requests\ReportesBugs\UpdateEstadoReporteBugRequest;
use App\Models\ReporteBug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            abort(403, 'No tienes permiso para ver este reporte.');
        }

        return response()->json(
            $reporte_bug->load(['usuario', 'comentarios.usuario'])
        );
    }

    public function store(StoreReporteBugRequest $request)
    {
        $data = $request->validated();
        $data['usuario_id'] = $request->user()->id;

        $archivoPath = "";
        if ($request->hasFile('screenshot')) {
            $archivoPath = $request->file('screenshot')->store('reportes_bugs');
            $archivoPath = Storage::url($archivoPath);
        }
        $data['screenshot_url'] = $archivoPath;

        $reporte = ReporteBug::create($data);

        return response()->json($reporte, 201);
    }

    public function update(UpdateReporteBugRequest $request, ReporteBug $reporte_bug)
    {
        $data = $request->validated();

        // if ($request->hasFile('screenshot')) {
        //     if ($reporte_bug->screenshot_url) {
        //         Storage::disk('public')->delete($reporte_bug->screenshot_url);
        //     }
        //     $data['screenshot_url'] = $request->file('screenshot')
        //         ->store('reportes_bugs/screenshots', 'public');
        // }

        $reporte_bug->update($data);

        return response()->json($reporte_bug->fresh());
    }

    public function updateEstado(UpdateEstadoReporteBugRequest $request, ReporteBug $reporte_bug)
    {
        $reporte_bug->update($request->validated());

        return response()->json($reporte_bug->fresh());
    }

    public function destroy(Request $request, ReporteBug $reporte_bug)
    {
        if ($request->user()->id !== $reporte_bug->usuario_id && !$request->user()->es_admin) {
            abort(403, 'No tienes permiso para eliminar este reporte.');
        }

        if ($reporte_bug->screenshot_url) {
            Storage::disk('public')->delete($reporte_bug->screenshot_url);
        }

        $reporte_bug->delete();

        return response()->json(null, 204);
    }
}