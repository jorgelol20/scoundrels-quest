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
                'in:visual,jugabilidad,rendimiento,error,usuario,otro'
            ],
            'plataforma' => 'sometimes|nullable|string|max:100',
            'screenshot' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:4096',
        ];
    }

    public function messages()
    {
        return [
            'descripcion.string' => __('api.reporte_descripcion_string'),
            'descripcion.max' => __('api.reporte_descripcion_max'),
            'logs_partida.string' => __('api.reporte_logs_string'),
            'tipo.in' => __('api.reporte_tipo_in'),
            'plataforma.string' => __('api.reporte_plataforma_string'),
            'plataforma.max' => __('api.reporte_plataforma_max'),
            'screenshot.image' => __('api.reporte_screenshot_image'),
            'screenshot.mimes' => __('api.reporte_screenshot_mimes'),
            'screenshot.max' => __('api.reporte_screenshot_max'),
        ];
    }
}