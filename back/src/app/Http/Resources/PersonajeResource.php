<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonajeResource extends JsonResource
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
            'activo' => $this->activo,
            'habilidad_id' => $this->habilidad_id,
            // Clave en snake_case: es el formato que serializaba Eloquent y
            // que espera el front (characterInfo.habilidad_personaje).
            'habilidad_personaje' => new HabilidadResource($this->whenLoaded('habilidadPersonaje')),
            '_meta' => ['locale' => app()->getLocale()],
        ];
    }
}
