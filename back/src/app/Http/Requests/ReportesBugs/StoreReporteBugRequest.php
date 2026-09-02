<?php

namespace App\Http\Requests\ReportesBugs;

use Illuminate\Foundation\Http\FormRequest;

class StoreReporteBugRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descripcion' => 'required|string|max:2000',
            'logs_partida' => 'sometimes|nullable|string',
            'tipo' => [
                'required',
                'string',
                'in:visual,jugabilidad,rendimiento,error,otro'
            ],
            'severidad' => [
                'sometimes',
                'string',
                'in:baja,media,alta,critica'
            ],
            'plataforma' => 'sometimes|nullable|string|max:100',
            'screenshot' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:4096',
        ];
    }

    public function messages()
    {
        return [
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción no puede estar vacía.',
            'descripcion.max' => 'La descripción no puede superar los 2000 carácteres.',
            'logs_partida.string' => 'Los logs de la partida no son válidos.',
            'tipo.required' => 'El tipo de reporte es obligatorio.',
            'tipo.in' => 'El tipo debe ser: visual, jugabilidad, rendimiento, error u otro.',
            'severidad.in' => 'La severidad debe ser: baja, media, alta o crítica.',
            'plataforma.string' => 'La plataforma no es válida.',
            'plataforma.max' => 'La plataforma no puede superar los 100 carácteres.',
            'screenshot.image' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
            'screenshot.mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
            'screenshot.max' => 'Tamaño máximo de la captura: 4MB',
        ];
    }
}