<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ComentarioReporteBug extends Model
{
    protected $table = 'comentarios_reportes_bugs';

    protected $fillable = ['usuario_id', 'reporte_id', 'comentario'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class);
    }

    public function reporte()
    {
        return $this->belongsTo(ReporteBug::class, 'reporte_id');
    }
}
