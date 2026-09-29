<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartaResource extends JsonResource
{
    /** Sin envoltura "data": el front espera arrays/objetos planos. */
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // `palo` es un CÓDIGO estable (Pica/Corazon/Diamante/Trebol/Miniboss):
            // la lógica del front (filtros de mazo, iconos, efectos) compara
            // contra estos valores, así que nunca se traduce. Para mostrar
            // se usa `palo_label`.
            'palo' => $this->getAttribute('palo'),
            'palo_label' => $this->tr('palo'),
            'valor' => $this->valor,
            'imagen' => $this->imagen,
            'activa' => $this->activa,
            'especial' => $this->especial,
            'efectos' => $this->translatedEfectos(),
            '_meta' => ['locale' => app()->getLocale()],
        ];
    }

    /**
     * Efectos con `description` en el locale actual (name/value intactos).
     * Sin traducción disponible se conserva la descripción legacy.
     */
    protected function translatedEfectos(): ?array
    {
        $efectos = $this->efectos;
        if ($efectos === null) {
            return null;
        }
        if (is_string($efectos)) {
            $efectos = json_decode($efectos, true) ?? [];
        }

        return collect($efectos)->map(function ($efecto) {
            if (isset($efecto['name'], $efecto['description'])) {
                $trad = $this->resource->trEfecto($efecto['name']);
                if ($trad !== null) {
                    $efecto['description'] = $trad;
                }
            }
            return $efecto;
        })->all();
    }
}
