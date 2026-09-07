<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    public $timestamps = true;

    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id',
        'reporte_id',
        'partida_id',
        'descripcion',
        'tipo',
        'vista',
    ];

    protected $casts = [
        'vista'      => 'boolean',
        'tipo'       => 'string',
        'reporte_id' => 'integer',
        'partida_id' => 'integer',
    ];

    // ─── Relaciones ───────────────────────────────────────────

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'usuario_id');
    }

    public function reporte()
    {
        return $this->belongsTo(ReporteBug::class, 'reporte_id');
    }

    public function partida()
    {
        return $this->belongsTo(Partidas::class, 'partida_id');
    }
}