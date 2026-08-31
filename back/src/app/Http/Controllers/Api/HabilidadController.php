<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Http\Requests\Habilidades\StoreHabilidadRequest;
use App\Http\Requests\Habilidades\UpdateHabilidadRequest;
use Illuminate\Http\Request;

class HabilidadController extends Controller
{
    public function index()
    {
        return response()->json(Habilidad::all());
    }

    public function store(StoreHabilidadRequest $request)
    {
        $habilidad = Habilidad::create($request->validated());
        return response()->json($habilidad, 201);
    }

    public function show($id)
    {
        return response()->json(Habilidad::findOrFail($id));
    }

    public function update(UpdateHabilidadRequest $request, $id)
    {
        $habilidad = Habilidad::findOrFail($id);
        $habilidad->update($request->validated());

        return response()->json($habilidad);
    }

    public function destroy($id)
    {
        Habilidad::findOrFail($id)->delete();
        return response()->json(['message' => 'Habilidad eliminada']);
    }
}
