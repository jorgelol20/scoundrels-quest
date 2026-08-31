<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * Modelo para la representación de una carta
 */
class Carta extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'cartas';

    protected $fillable = [
        'palo',
        'valor',
        'imagen',
        'activa',
        'especial',
        'efectos',
    ];
    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
            'especial' => 'boolean',
            'efectos' => 'array',
        ];
    }
}
