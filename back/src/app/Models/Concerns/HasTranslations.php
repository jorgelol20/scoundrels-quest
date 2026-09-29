<?php

namespace App\Models\Concerns;

/**
 * Trait para entidades editoriales con contenido traducible.
 *
 * La columna `translations` es un JSON con la estructura:
 * {"es": {"nombre": "...", "descripcion": "..."}, "en": {"nombre": "...", ...}}
 *
 * `tr()` devuelve el campo en el locale actual, con fallback a 'es'
 * y, en última instancia, a la columna legacy (nombre/descripcion/palo).
 */
trait HasTranslations
{
    /**
     * Devuelve el valor traducible de un campo según el locale actual.
     *
     * @param  string  $field  Campo traducible (nombre, descripcion, palo...)
     * @param  string|null  $locale  Locale forzado; por defecto app()->getLocale()
     */
    public function tr(string $field, ?string $locale = null): string
    {
        $locale = $locale ?: app()->getLocale();

        $map = $this->getAttribute('translations');
        if (is_string($map)) {
            $map = json_decode($map, true);
        }

        $value = $map[$locale][$field] ?? $map['es'][$field] ?? null;

        // Fallback a la columna legacy si no hay traducción
        return $value ?? $this->getAttribute($field) ?? '';
    }

    /**
     * Descripción de un efecto anidado (p. ej. cartas `efectos[].description`)
     * según el locale actual.
     *
     * Lee `translations.{locale}.efectos.{name}` con fallback a
     * `translations.es.efectos.{name}`. Devuelve null si no hay traducción
     * para que el llamador conserve la descripción legacy de la columna.
     *
     * @param  string  $name  Nombre técnico del efecto (restore_ability, sticky...)
     * @param  string|null  $locale  Locale forzado; por defecto app()->getLocale()
     */
    public function trEfecto(string $name, ?string $locale = null): ?string
    {
        $locale = $locale ?: app()->getLocale();

        $map = $this->getAttribute('translations');
        if (is_string($map)) {
            $map = json_decode($map, true);
        }

        return $map[$locale]['efectos'][$name]
            ?? $map['es']['efectos'][$name]
            ?? null;
    }
}
