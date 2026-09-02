<?php

namespace App\Http\Requests\ReportesBugs;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioReporteBugRequest extends FormRequest
{
    public function authorize(): bool
    {
        $reporte = $this->route('reporte_bug');

        // Solo puede comentar el dueño del reporte o un admin
        return auth()->id() === $reporte->usuario_id || auth()->user()?->es_admin;
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
            'comentario.required' => 'El comentario no puede estar vacío.',
            'comentario.string' => 'El comentario no es válido.',
            'comentario.max' => 'El comentario no puede superar los 250 carácteres.',
        ];
    }
}