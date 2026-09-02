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
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado debe ser: abierto, en revisión, solucionado, descartado o duplicado.',
            'severidad.in' => 'La severidad debe ser: baja, media, alta o crítica.',
        ];
    }
}