<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Summary of Habilidad
 */
class Habilidad extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'habilidades';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'codigo',
        'efectos',
        'coste_oro',
        'usos_por_ronda'
    ];

    protected $casts = [
       'efectos' => 'array',
    ];

    // Relación: una habilidad tiene muchos personajes
    public function personajes()
    {
        return $this->hasMany(Personajes::class, 'habilidad_id', 'id');
    }
}
