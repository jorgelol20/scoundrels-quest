<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logros extends Model
{
    protected $table = 'logros';

    public $timestamps = false;

    protected $fillable = ['nombre','descripcion','icono'];

    /**
     * Indica la relación con usuarios siendo una intermedia donde un logro puede ser obtenido por muchos usuarios y un usuario puede obtener muchos logros.
     */
    public function obtenido_por()
    {
        return $this->belongsToMany(Usuarios::class, "usuarios_logros", 'logro_id', 'usuario_id')->withPivot('id','progreso','obtenido', 'created_at', 'updated_at');
    }
}
