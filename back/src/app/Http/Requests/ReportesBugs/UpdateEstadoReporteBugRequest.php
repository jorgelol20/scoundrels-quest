<?php

namespace App\Http\Requests\ReportesBugs;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEstadoReporteBugRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) auth()->user()?->es_admin;
    }

    public function rules(): array
    {
        return [
            'estado' => [
                'required',
                'string',
                'in:abierto,en_revision,solucionado,descartado,duplicado'
            ],
            'severidad' => [
                'sometimes',
                'string',
                'in:baja,media,alta,critica'
            ],
        ];
    }

    public function messages()
    {
        return [
            'estado.required' => __('api.reporte_estado_required'),
            'estado.in' => __('api.reporte_estado_in'),
            'severidad.in' => __('api.reporte_severidad_in'),
        ];
    }
}