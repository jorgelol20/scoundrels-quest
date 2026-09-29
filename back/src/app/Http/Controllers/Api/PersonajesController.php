<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personajes;
use App\Http\Requests\Personajes\StorePersonajeRequest;
use App\Http\Requests\Personajes\UpdatePersonajeRequest;
use App\Http\Resources\PersonajeResource;
use Illuminate\Http\Request;

class PersonajesController extends Controller
{
    public function index()
    {   
        $personajes = Personajes::with('habilidadPersonaje')->
        select('id', 'nombre', 'descripcion', 'imagen', 'activo', 'habilidad_id', 'translations')
        ->where('activo', true)
        ->get();
        return PersonajeResource::collection($personajes);
    }

    public function store(StorePersonajeRequest $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('personajes');
            $data['imagen'] = $path;
        }

        $personaje = Personajes::create($data);

        return (new PersonajeResource($personaje))->response()->setStatusCode(201);
    }

    //Obtener info de un personaje
    public function show($id)
    {
        return new PersonajeResource(Personajes::with('habilidadPersonaje')->findOrFail($id));
    }

    //Actualizar info de un personaje
    public function update(UpdatePersonajeRequest $request, $id)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $personaje = Personajes::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('personajes');
            $data['imagen'] = $path;
        }

        $personaje->update($data);

        return new PersonajeResource($personaje);
    }

    public function destroy($id, Request $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        Personajes::findOrFail($id)->delete();
        return response()->json(['message' => __('api.personaje_deleted')]);
    }

    /**
     * Defensa en profundidad: las rutas ya exigen el middleware 'admin',
     * pero el controlador no confía solo en eso.
     */
    private function esAdmin(Request $request): bool
    {
        return (bool) $request->user()?->es_admin;
    }

    private function prohibido()
    {
        return response()->json(['message' => __('api.forbidden')], 403);
    }
}
