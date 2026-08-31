<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carta;
use App\Http\Requests\Cartas\StoreCartaRequest;
use App\Http\Requests\Cartas\UpdateCartaRequest;
use Illuminate\Http\Request;

class CartaController extends Controller
{   
    //Obtener todas las cartas
    public function index()
    {
        return response()->json(Carta::all());
    }

    // Guardar una Carta
    public function store(StoreCartaRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('cartas');
            $data['imagen'] = $path;
        }

        $carta = Carta::create($data);

        return response()->json($carta, 201);
    }

    //Obtener info de una carta
    public function show($id)
    {
        return response()->json(Carta::findOrFail($id));
    }

    //Actualizar info de una carta
    public function update(UpdateCartaRequest $request, $id)
    {
        $carta = Carta::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('cartas');
            $data['imagen'] = $path;
        }

        $carta->update($data);

        return response()->json($carta);
    }

    // Eliminar una carta
    public function destroy($id)
    {
        Carta::findOrFail($id)->delete();
        return response()->json(['message' => 'Carta eliminada']);
    }
}
