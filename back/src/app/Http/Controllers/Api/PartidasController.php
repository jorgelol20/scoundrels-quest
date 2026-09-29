<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partidas;
use App\Http\Requests\Partidas\StorePartidaRequest;
use App\Http\Requests\Partidas\UpdatePartidaRequest;
use Illuminate\Http\Request;

class PartidasController extends Controller
{
    public function index($limit = 10)
    {
        $limit = min(max((int) $limit, 1), 100);
        $partidas = Partidas::select('id', 'created_at', 'usuario_id', 'personaje_id', 'tiempo', 'victoria', 'rondas', 'oro_obtenido', 'vida_curada', 'enemigos_enfrentados')
        ->with(
            [
                'modificadores:id,imagen,nivel,nombre,descripcion', 
                'jugador:id,nick,es_admin,color,avatar', 
                'personaje'
            ]
        )
        ->withCount([
            'comentarios'
        ])
        ->latest()
        ->limit($limit)
        ->get();
        $totalJugadas = Partidas::count();
        return response()->json([
            'partidas' => $partidas,
            'total_jugadas' => $totalJugadas
        ], 200);
    }

    public function store(StorePartidaRequest $request)
    {
        $data = $request->validated();

        // La identidad se toma SIEMPRE del token, nunca del cuerpo.
        $data['usuario_id'] = $request->user()->id;

        $partida = Partidas::create($data);
        $partida->modificadores()->sync($request->validated('modificadores', []));
        $partida->load('modificadores');
        return response()->json($partida, 201);
    }

    public function show($id)
    {
        $partida = Partidas::with(['comentarios', 'modificadores', 'jugador', 'personaje'])->findOrFail($id);
        return response()->json($partida, 200);
    }

    public function update(UpdatePartidaRequest $request, $id)
    {
        $partida = Partidas::findOrFail($id);
        $data = $request->validated();

        // `modificadores` es una relación pivote, no una columna.
        $modificadores = $data['modificadores'] ?? null;
        unset($data['modificadores']);

        $partida->update($data);

        if ($modificadores !== null) {
            $partida->modificadores()->sync($modificadores);
        }

        return response()->json($partida->fresh(), 200);
    }

    public function destroy($id)
    {
        Partidas::findOrFail($id)->delete();
        return response()->json(['message' => __('api.partida_deleted')]);
    }

    public function ranking_partidas()
    {
        $partidas = Partidas::select(
            'id',
            'created_at',
            'usuario_id',
            'personaje_id',
            'tiempo',
            'victoria',
            'rondas',
            'oro_obtenido',
            'vida_curada',
            'enemigos_enfrentados'
        )
            ->orderBy('rondas', 'desc')
            ->orderBy('enemigos_enfrentados', 'desc')
            ->limit(10)
            ->get();

        $partidas->load(['comentarios', 'modificadores', 'jugador', 'personaje']);

        return response()->json($partidas, 200);
    }
}
