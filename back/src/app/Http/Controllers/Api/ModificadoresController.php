<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Modificadores;
use App\Http\Requests\Modificadores\StoreModificadorRequest;
use App\Http\Requests\Modificadores\UpdateModificadorRequest;
use App\Http\Resources\ModificadorResource;
use Illuminate\Http\Request;

class ModificadoresController extends Controller
{
    public function index()
    {
        return ModificadorResource::collection(Modificadores::all());
    }

    public function store(StoreModificadorRequest $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('modificadores');
            $data['imagen'] = $path;
        }

        $modificador = Modificadores::create($data);
        return (new ModificadorResource($modificador))->response()->setStatusCode(201);
    }

    //Obtener info de un modificador
    public function show($id)
    {
        return new ModificadorResource(Modificadores::findOrFail($id));
    }

    //Actualizar info de un modificador
    public function update(UpdateModificadorRequest $request, $id)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $modificador = Modificadores::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('modificadores');
            $data['imagen'] = $path;
        }

        $modificador->update($data);

        return new ModificadorResource($modificador);
    }

    public function destroy($id, Request $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        Modificadores::findOrFail($id)->delete();
        return response()->json(['message' => __('api.modificador_deleted')]);
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
