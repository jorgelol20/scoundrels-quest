<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personajes;
use App\Http\Requests\Personajes\StorePersonajeRequest;
use App\Http\Requests\Personajes\UpdatePersonajeRequest;
use Illuminate\Http\Request;

class PersonajesController extends Controller
{
    public function index()
    {   
        $personajes = Personajes::with('habilidadPersonaje')->select('id', 'nombre', 'descripcion', 'imagen', 'activo', 'habilidad_id')->get();
        return response()->json($personajes);
    }

    public function store(StorePersonajeRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('personajes');
            $data['imagen'] = $path;
        }

        $personaje = Personajes::create($data);

        return response()->json($personaje, 201);
    }

    public function show($id)
    {
        return response()->json(Personajes::findOrFail($id));
    }

    public function update(UpdatePersonajeRequest $request, $id)
    {
        $personaje = Personajes::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('personajes');
            $data['imagen'] = $path;
        }

        $personaje->update($data);

        return response()->json($personaje);
    }

    public function destroy($id)
    {
        Personajes::findOrFail($id)->delete();
        return response()->json(['message' => 'Personaje eliminado']);
    }
}
