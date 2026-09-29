<?php

namespace App\Models;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Usuarios extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = true;
    protected $table = 'usuarios';

    /**
     * `es_admin`, `is_tester` y `ultima_vez_visto` quedan FUERA del mass
     * assignment de forma deliberada: son campos de privilegios/estado que
     * solo deben cambiar por asignación explícita y comprobada.
     *
     * Incluirlos aquí permitía que cualquier petición que pasara por
     * `->update($request->validated())` se auto-concediera admin.
     */
    protected $fillable = ['nick', 'password', 'email', 'avatar', 'banner', 'color', 'locale'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        // Sin 'password' => 'hashed': los controladores ya aplican
        // Hash::make explícito (store/update/social). El cast causaba
        // doble hash y ningún login pasaba Hash::check.
        return [
            'email_verified_at' => 'datetime',
            'es_admin' => 'boolean',
            'is_tester' => 'boolean',
            'avatar' => 'string',
            'banner' => 'string',
            'color' => 'string',
        ];
    }

    /**
     * Summary of comentarios
     */
    public function comentarios()
    {
        return $this->belongsToMany(
            Partidas::class,
            "comentarios_usuario_partida",
            'usuario_id',
            'partida_id'
        )->withPivot('comentario', 'created_at', 'updated_at');
    }

    /**
     * Relación con partidas en la que un usuario tiene muchas partidas y una partida pertenece a un usuario
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Partidas, Usuarios>
     */
    public function tiene_jugadas()
    {
        return $this->hasMany(Partidas::class, 'usuario_id');
    }

    /*
     *   Relación con los logros.
     */
    public function logros()
    {
        return $this->belongsToMany(Logros::class, "usuarios_logros", 'usuario_id', 'logro_id')->withPivot('id', 'progreso', 'obtenido', 'created_at', 'updated_at');
    }

    public function reportesBug()
    {
        return $this->hasMany(ReporteBug::class, 'usuario_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'usuario_id');
    }

    // Probablemente, innecesaria xD
    public function notificacionesPendientes()
    {
        return $this->hasMany(Notificacion::class, 'usuario_id')
            ->where('vista', false);
    }
}
