<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogroResource extends JsonResource
{
    /** Sin envoltura "data": el front espera arrays/objetos planos. */
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->tr('nombre'),
            'descripcion' => $this->tr('descripcion'),
            'icono' => $this->icono,
            'codigo' => $this->codigo,
            'meta' => $this->meta,
            '_meta' => ['locale' => app()->getLocale()],
        ];
    }
}
