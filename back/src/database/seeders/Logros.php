<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Logros as ModelLogros;

class Logros extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $logrosData = [
            [
                'nombre' => 'Bienvenido a Scoundrel',
                'descripcion' => 'Juega tu primera partida.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'La primera de muchas...',
                'descripcion' => 'Pierde tu primera partida.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => '¿De verdad lo lograste?',
                'descripcion' => 'Gana tu primera partida.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Apostador nato',
                'descripcion' => 'Gana tu primera partida con `El Apostador`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Archimago',
                'descripcion' => 'Gana tu primera partida con `El Mago`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Alto Elfo',
                'descripcion' => 'Gana tu primera partida con `El Elfo`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Inquisidor',
                'descripcion' => 'Gana tu primera partida con `El Paladín`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Gran Guerrero',
                'descripcion' => 'Gana tu primera partida con `El Guerrero`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Orgullo del Rey',
                'descripcion' => 'Gana tu primera partida con `El Herrero`.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Ludópata',
                'descripcion' => 'Usa la habilidad de `El Apostador` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Arcanólogo',
                'descripcion' => 'Usa la habilidad de `El Mago` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Tirador Preciso',
                'descripcion' => 'Usa la habilidad de `El Elfo` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Devoción Sagrada',
                'descripcion' => 'Usa la habilidad de `El Paladín` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Guerrero Rugiente',
                'descripcion' => 'Usa la habilidad de `El Guerrero` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Maestro de Armas',
                'descripcion' => 'Usa la habilidad de `El Herrero` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100
            ],
            [
                'nombre' => 'Textura gelatinosa',
                'descripcion' => 'Consume el Cubo de Slime',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Jugador supremo',
                'descripcion' => 'Llega a la ronda 20.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
            [
                'nombre' => 'Coleccionista de leyendas',
                'descripcion' => 'Compra todas las Armas Especiales en una partida.',
                'icono' => '/storage/logros/',
                'meta' => null
            ],
        ];

        foreach ($logrosData as $data) {
            ModelLogros::updateOrCreate(
                ['nombre' => $data['nombre']],
                [
                    'descripcion' => $data['descripcion'],
                    'icono' => config('app.backend_url') . $data['icono'],
                    'meta' => $data['meta']
                ]
            );
        }
    }
}
