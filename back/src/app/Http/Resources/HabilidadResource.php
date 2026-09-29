<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabilidadResource extends JsonResource
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
            'efectos' => $this->efectos,
            'coste_oro' => $this->coste_oro,
            'usos_por_ronda' => $this->usos_por_ronda,
            '_meta' => ['locale' => app()->getLocale()],
        ];
    }
}
