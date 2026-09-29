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
                'in:visual,jugabilidad,rendimiento,error,usuario,otro'
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
            'descripcion.required' => __('api.reporte_descripcion_required'),
            'descripcion.string' => __('api.reporte_descripcion_string'),
            'descripcion.max' => __('api.reporte_descripcion_max'),
            'logs_partida.string' => __('api.reporte_logs_string'),
            'tipo.required' => __('api.reporte_tipo_required'),
            'tipo.in' => __('api.reporte_tipo_in'),
            'severidad.in' => __('api.reporte_severidad_in'),
            'plataforma.string' => __('api.reporte_plataforma_string'),
            'plataforma.max' => __('api.reporte_plataforma_max'),
            'screenshot.image' => __('api.reporte_screenshot_image'),
            'screenshot.mimes' => __('api.reporte_screenshot_mimes'),
            'screenshot.max' => __('api.reporte_screenshot_max'),
        ];
    }
}