<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Modificadores;
use App\Http\Requests\Modificadores\StoreModificadorRequest;
use App\Http\Requests\Modificadores\UpdateModificadorRequest;
use Illuminate\Http\Request;

class ModificadoresController extends Controller
{
    public function index()
    {
        return response()->json(Modificadores::all());
    }

    public function store(StoreModificadorRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('modificadores');
            $data['imagen'] = $path;
        }

        $modificador = Modificadores::create($data);
        return response()->json($modificador, 201);
    }

    public function show($id)
    {
        return response()->json(Modificadores::findOrFail($id));
    }

    public function update(UpdateModificadorRequest $request, $id)
    {
        $modificador = Modificadores::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('modificadores');
            $data['imagen'] = $path;
        }

        $modificador->update($data);

        return response()->json($modificador);
    }

    public function destroy($id)
    {
        Modificadores::findOrFail($id)->delete();
        return response()->json(['message' => 'Modificador eliminado']);
    }
}
