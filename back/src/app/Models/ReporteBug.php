<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReporteBug extends Model
{
    protected $table = 'reportes_bugs';

    protected $fillable = [
        'usuario_id',
        'titulo',
        'descripcion',
        'logs_partida',
        'tipo',
        'severidad',
        'estado',
        'plataforma',
        'screenshot_url',
    ];

    protected static function booted()
    {
        static::creating(function (ReporteBug $reporte) {
            $reporte->titulo = self::generarTitulo($reporte);
        });
    }

    protected static function generarTitulo(ReporteBug $reporte): string
    {
        $tipo = ucfirst($reporte->tipo);
        $fecha = now()->format('d-m-Y H:i');

        $usuario = $reporte->usuario?->nick
            ?? "Usuario#{$reporte->usuario_id}";

        return "{$tipo} - {$fecha} - {$usuario}";
    }

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'usuario_id');
    }

    public function comentarios()
    {
        return $this->hasMany(ComentarioReporteBug::class, 'reporte_id');
    }
}