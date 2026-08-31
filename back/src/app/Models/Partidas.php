<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Summary of Partidas
 */
class Partidas extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
   
    public $timestamps = true;
    protected $table = 'partidas';
    protected $fillable = ['usuario_id','personaje_id','tiempo','victoria', 'rondas', 'oro_obtenido', 'vida_curada', 'enemigos_enfrentados'];

    public function casts(): array {
        return [
            'victoria'=>'boolean'
        ];
    }

    //Relación del jugador al que pertenece la partida
    public function jugador()
    {
        return $this->belongsTo(Usuarios::class,'usuario_id', 'id');
    }

    // Relación del personaje usado en la partida
    public function personaje()
    {
        return $this->belongsTo(Personajes::class);
    }

    //Comentarios
    public function comentarios(){
        return $this->belongsToMany(Usuarios::class, "comentarios_usuario_partida", 'partida_id', 'usuario_id')->withPivot('id','comentario','created_at', 'updated_at');
    }

    /*
    * Relación con la tabla intermedia con modificadores.
    */
    public function modificadores(){
        return $this->belongsToMany(Modificadores::class, "partidas_modificadores", 'partida_id', 'modificador_id');
    }
    
}
