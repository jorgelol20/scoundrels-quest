<?php

namespace App\Http\Requests\ReportesBugs;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReporteBugRequest extends FormRequest
{
    public function authorize(): bool
    {
        $reporte = $this->route('reporte_bug'); // ajusta el nombre del parámetro de ruta si es distinto

        // Solo el dueño del reporte (o un admin) puede editarlo
        return auth()->id() === $reporte->usuario_id || auth()->user()?->es_admin;
    }

    public function rules(): array
    {
        return [
            'descripcion' => 'sometimes|string|max:2000',
            'logs_partida' => 'sometimes|nullable|string',
            'tipo' => [
                'sometimes',
                'string',
                'in:visual,jugabilidad,rendimiento,error,otro'
            ],
            'plataforma' => 'sometimes|nullable|string|max:100',
            'screenshot' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:4096',
        ];
    }

    public function messages()
    {
        return [
            'descripcion.string' => 'La descripción no puede estar vacía.',
            'descripcion.max' => 'La descripción no puede superar los 2000 carácteres.',
            'logs_partida.string' => 'Los logs de la partida no son válidos.',
            'tipo.in' => 'El tipo debe ser: visual, jugabilidad, rendimiento, error u otro.',
            'plataforma.string' => 'La plataforma no es válida.',
            'plataforma.max' => 'La plataforma no puede superar los 100 carácteres.',
            'screenshot.image' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
            'screenshot.mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
            'screenshot.max' => 'Tamaño máximo de la captura: 4MB',
        ];
    }
}