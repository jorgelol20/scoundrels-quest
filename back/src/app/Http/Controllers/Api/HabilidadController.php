<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Http\Requests\Habilidades\StoreHabilidadRequest;
use App\Http\Requests\Habilidades\UpdateHabilidadRequest;
use App\Http\Resources\HabilidadResource;
use Illuminate\Http\Request;

class HabilidadController extends Controller
{
    public function index()
    {
        return HabilidadResource::collection(Habilidad::all());
    }

    public function store(StoreHabilidadRequest $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $habilidad = Habilidad::create($request->validated());
        return (new HabilidadResource($habilidad))->response()->setStatusCode(201);
    }

    public function show($id)
    {
        return new HabilidadResource(Habilidad::findOrFail($id));
    }

    public function update(UpdateHabilidadRequest $request, $id)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $habilidad = Habilidad::findOrFail($id);
        $habilidad->update($request->validated());

        return new HabilidadResource($habilidad);
    }

    public function destroy($id, Request $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        Habilidad::findOrFail($id)->delete();
        return response()->json(['message' => __('api.habilidad_deleted')]);
    }

    /**
     * Defensa en profundidad: las rutas ya exigen ['auth:sanctum', 'admin'],
     * pero el controlador no confía solo en eso (mismo patrón que
     * Carta/Personajes/Modificadores).
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
