<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\HasTranslations;

/**
 * Summary of Habilidad
 */
class Habilidad extends Model
{
    use HasFactory, HasTranslations;

    public $timestamps = false;

    protected $table = 'habilidades';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'codigo',
        'efectos',
        'coste_oro',
        'usos_por_ronda',
        'translations',
    ];

    protected $casts = [
       'efectos' => 'array',
       'translations' => 'array',
    ];

    // Relación: una habilidad tiene muchos personajes
    public function personajes()
    {
        return $this->hasMany(Personajes::class, 'habilidad_id', 'id');
    }
}
