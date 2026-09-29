<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\HasTranslations;

/**
 * Summary of Modificadores
 */
class Modificadores extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasTranslations;

    public $timestamps = false;
    protected $table = 'modificadores';
    protected $fillable = ['nombre','descripcion','imagen','efectos','activo','nivel','translations'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<array, string>
     */
    protected function casts(): array
    {
        return [
            'efectos' => 'array',
            'activo' => 'boolean',
            'translations' => 'array',
        ];
    }

    //Partidas en las que es usado el modificador
    public function es_jugado()
    {
        return $this->belongsToMany(
            Partidas::class,
            "partidas_modificadores",
            'modificador_id',
            'partida_id'
        );
    }

}
