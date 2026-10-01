<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\HasTranslations;

class Personajes extends Model
{
    use HasFactory, HasTranslations;

    public $timestamps = false;
    protected $table = 'personajes';
    protected $fillable = ['nombre', 'descripcion', 'imagen', 'activo', 'habilidad_id', 'translations'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'translations' => 'array',
        ];
    }

    // Partidas en las que es usado el personaje
    public function es_jugado()
    {
        return $this->belongsToMany(Partidas::class);
    }

    // Relación: un personaje pertenece a una habilidad
    public function habilidadPersonaje()
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id', 'id');
    }

}
