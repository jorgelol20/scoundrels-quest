<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModificadorResource extends JsonResource
{
    /** Sin envoltura "data": el front espera arrays/objetos planos. */
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->tr('nombre'),
            'descripcion' => $this->tr('descripcion'),
            'imagen' => $this->imagen,
            'nivel' => $this->nivel,
            'activo' => $this->activo,
            'efectos' => $this->efectos,
            '_meta' => ['locale' => app()->getLocale()],
        ];
    }
}
