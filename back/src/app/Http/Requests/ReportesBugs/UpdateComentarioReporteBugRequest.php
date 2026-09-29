<?php

namespace App\Http\Requests\ReportesBugs;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComentarioReporteBugRequest extends FormRequest
{
    public function authorize(): bool
    {
        $comentario = $this->route('comentario');

        // Solo el autor del comentario (o admin) puede editarlo
        return auth()->id() === $comentario->usuario_id || auth()->user()?->es_admin;
    }

    public function rules(): array
    {
        return [
            'comentario' => 'required|string|max:250',
        ];
    }

    public function messages()
    {
        return [
            'comentario.required' => __('api.reporte_comentario_required'),
            'comentario.string' => __('api.reporte_comentario_string'),
            'comentario.max' => __('api.reporte_comentario_max'),
        ];
    }
}