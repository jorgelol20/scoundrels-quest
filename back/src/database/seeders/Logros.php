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
                'meta' => null,
                'codigo' => '1_bienvenido'
            ],
            [
                'nombre' => 'La primera de muchas...',
                'descripcion' => 'Pierde tu primera partida.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => '2_derrota'
            ],
            [
                'nombre' => '¿De verdad lo lograste?',
                'descripcion' => 'Gana tu primera partida.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria'
            ],
            [
                'nombre' => 'Apostador nato',
                'descripcion' => 'Gana tu primera partida con `El Apostador`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_apostador'
            ],
            [
                'nombre' => 'Archimago',
                'descripcion' => 'Gana tu primera partida con `El Mago`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_mago'
            ],
            [
                'nombre' => 'Alto Elfo',
                'descripcion' => 'Gana tu primera partida con `El Elfo`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_elfo'
            ],
            [
                'nombre' => 'Inquisidor',
                'descripcion' => 'Gana tu primera partida con `El Paladín`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_paladin'
            ],
            [
                'nombre' => 'Gran Guerrero',
                'descripcion' => 'Gana tu primera partida con `El Guerrero`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_guerrero'
            ],
            [
                'nombre' => 'Oficial de Forja',
                'descripcion' => 'Gana tu primera partida con `El Herrero`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_herrero'
            ],
            [
                'nombre' => 'Criatura Superior',
                'descripcion' => 'Gana tu primera partida con `El Vampiro`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'victoria_vampiro'
            ],
            [
                'nombre' => 'Ludópata',
                'descripcion' => 'Usa la habilidad de `El Apostador` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_apostador'
            ],
            [
                'nombre' => 'Arcanólogo',
                'descripcion' => 'Usa la habilidad de `El Mago` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_mago'
            ],
            [
                'nombre' => 'Tirador Preciso',
                'descripcion' => 'Usa la habilidad de `El Elfo` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_elfo'
            ],
            [
                'nombre' => 'Devoción Sagrada',
                'descripcion' => 'Usa la habilidad de `El Paladín` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_paladin'
            ],
            [
                'nombre' => 'Guerrero Rugiente',
                'descripcion' => 'Usa la habilidad de `El Guerrero` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_guerrero'
            ],
            [
                'nombre' => 'Maestro de Armas',
                'descripcion' => 'Usa la habilidad de `El Herrero` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_herrero'
            ],
            [
                'nombre' => 'Conde sanguinario',
                'descripcion' => 'Usa la habilidad de `El Vampiro` 100 veces.',
                'icono' => '/storage/logros/',
                'meta' => 100,
                'codigo' => 'habilidad_vampiro'
            ],
            [
                'nombre' => 'Textura gelatinosa',
                'descripcion' => 'Consume el Cubo de Slime',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'gelatina'
            ],
            [
                'nombre' => 'Jugador supremo',
                'descripcion' => 'Llega a la ronda 20.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'ronda_20'
            ],
            [
                'nombre' => 'Coleccionista de leyendas',
                'descripcion' => 'Compra todas las Armas Especiales en una partida.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'todas_armas'
            ],
            [
                'nombre' => 'Chupa cabras',
                'descripcion' => 'Obtén más de 1500 de curación con el robo de vida usando `El Vampiro`.',
                'icono' => '/storage/logros/',
                'meta' => 1500,
                'codigo' => 'chupacabras'
            ],
            [
                'nombre' => 'Obra maestra',
                'descripcion' => 'Consigue una arma legendaria usando la habilidad de `El Herrero`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'obra_maestra'
            ],
            [
                'nombre' => 'Muro impenetrable',
                'descripcion' => 'Consigue 60 o mas de vida máxima con `El Paladín`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'muro_impenetrable'
            ],
            [
                'nombre' => 'Al límite',
                'descripcion' => 'Consigue pasar de ronda con un 25% de vida o menos.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'al_limite'
            ],
            [
                'nombre' => 'let_it_ride',
                'descripcion' => 'Consigue el `jackpot` usando la habilidad de `El Apostador`.',
                'icono' => '/storage/logros/',
                'meta' => null,
                'codigo' => 'let_it_ride'
            ],
        ];

        foreach ($logrosData as $data) {
            ModelLogros::updateOrCreate(
                ['nombre' => $data['nombre']],
                [
                    'descripcion' => $data['descripcion'],
                    'icono' => config('app.backend_url') . $data['icono'],
                    'meta' => $data['meta'],
                    'codigo' => $data['codigo']
                ]
            );
        }
    }
}
