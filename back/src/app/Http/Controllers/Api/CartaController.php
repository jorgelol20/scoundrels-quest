<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carta;
use App\Http\Requests\Cartas\StoreCartaRequest;
use App\Http\Requests\Cartas\UpdateCartaRequest;
use App\Http\Resources\CartaResource;
use Illuminate\Http\Request;

class CartaController extends Controller
{   
    //Obtener todas las cartas
    public function index()
    {
        return CartaResource::collection(Carta::all());
    }

    // Guardar una Carta
    public function store(StoreCartaRequest $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('cartas');
            $data['imagen'] = $path;
        }

        $carta = Carta::create($data);

        return (new CartaResource($carta))->response()->setStatusCode(201);
    }

    //Obtener info de una carta
    public function show($id)
    {
        return new CartaResource(Carta::findOrFail($id));
    }

    //Actualizar info de una carta
    public function update(UpdateCartaRequest $request, $id)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        $carta = Carta::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('cartas');
            $data['imagen'] = $path;
        }

        $carta->update($data);

        return new CartaResource($carta);
    }

    // Eliminar una carta
    public function destroy($id, Request $request)
    {
        if (!$this->esAdmin($request)) {
            return $this->prohibido();
        }

        Carta::findOrFail($id)->delete();
        return response()->json(['message' => __('api.carta_deleted')]);
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
