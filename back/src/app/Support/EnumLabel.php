<?php

namespace App\Support;

/**
 * Helper para obtener la etiqueta traducida de un valor de enum.
 *
 * Los textos viven en lang/{es,en}/enums.php con la forma
 * ['tipo' => [...], 'severidad' => [...], 'estado' => [...]].
 *
 * No se usa en los controladores: el frontend ya traduce las etiquetas.
 * Pensado para futuros usos en backend (p. ej. emails, logs legibles).
 */
class EnumLabel
{
    /**
     * Devuelve la etiqueta traducida para un enum/valor dados.
     *
     * @param string $enum  Nombre del grupo ('tipo', 'severidad', 'estado').
     * @param string $value Valor del enum ('visual', 'alta', 'abierto', ...).
     * @return string Etiqueta en el locale activo (app()->getLocale()).
     */
    public static function get(string $enum, string $value): string
    {
        return __("enums.$enum.$value");
    }
}
