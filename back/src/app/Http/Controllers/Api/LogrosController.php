<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LogroResource;
use Illuminate\Http\Request;
use App\Models\Logros;

class LogrosController extends Controller
{
    public function index()
    {
        return LogroResource::collection(Logros::all());
    }

    public function show($id)
    {
        return new LogroResource(Logros::findOrFail($id));
    }
}
