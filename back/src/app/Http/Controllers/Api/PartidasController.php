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
        $limit = min((int) $limit, 100);
        $partidas = Partidas::select('id', 'created_at', 'usuario_id', 'personaje_id', 'tiempo', 'victoria', 'rondas', 'oro_obtenido', 'vida_curada', 'enemigos_enfrentados')
        ->with(
            [
                'modificadores:imagen,nivel,nombre,descripcion', 
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
        $partida = Partidas::create($request->validated());
        $partida->modificadores()->attach($request->modificadores);
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
        $partida->update($request->validated());

        return response()->json($partida, 201);
    }

    public function destroy($id)
    {
        Partidas::findOrFail($id)->delete();
        return response()->json(['message' => 'Partida eliminada'], 201);
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
