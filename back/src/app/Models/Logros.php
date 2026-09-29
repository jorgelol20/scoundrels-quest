<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasTranslations;

class Logros extends Model
{
    use HasTranslations;

    protected $table = 'logros';

    public $timestamps = false;

    protected $fillable = ['nombre','descripcion','icono','codigo','meta','translations'];

    protected function casts(): array
    {
        return [
            'translations' => 'array',
        ];
    }

    /**
     * Indica la relación con usuarios siendo una intermedia donde un logro puede ser obtenido por muchos usuarios y un usuario puede obtener muchos logros.
     */
    public function obtenido_por()
    {
        return $this->belongsToMany(Usuarios::class, "usuarios_logros", 'logro_id', 'usuario_id')->withPivot('id','progreso','obtenido', 'created_at', 'updated_at');
    }
}
