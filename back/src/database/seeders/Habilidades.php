<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Habilidad as ModelHabilidad;

class Habilidades extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $habilidadesData = [
            [
                'nombre' => 'Grito de guerra',
                'descripcion' => 'Cambias a los 2 primeros enemigos del frente por las 2 siguientes cartas en la baraja. Además, estás a mitad de vida o menos, obtienes un 50% más de daño. Usar la habilidad cuenta como `Escapar`.',
                'icono' => '/storage/habilidades/GritoGuerra.webp',
                'codigo' => 'guerrero',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => null,
            ],
            [
                'nombre' => 'Vitalismo',
                'descripcion' => 'Obtienes más vida base y la capacidad de curarte 5 de vida cada ronda.',
                'icono' => '/storage/habilidades/Vitalismo.webp',
                'codigo' => 'paladin',
                'efectos' => [
                    ['name' => 'max_hp', 'value' => 5],
                ],
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Abrojos',
                'descripcion' => 'Una vez por ronda, puedes bajar el valor en 5 a las dos últimas cartas del frente. Además, te permite huir 1 más.',
                'icono' => '/storage/habilidades/Abrojos.webp',
                'codigo' => 'elfo',
                'efectos' => [
                    ['name' => 'max_scapes', 'value' => 1],
                ],
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Visión arcana',
                'descripcion' => 'Permite ver el palo de las 4 siguientes cartas siempre que quieras y barajar el mazo 1 vez por ronda.',
                'icono' => '/storage/habilidades/VisionArcana.webp',
                'codigo' => 'mago',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Apuesta Ciega',
                'descripcion' => 'Gastas 25 de oro por un efecto aleatorio. Suerte, vas a necesitarla...',
                'icono' => '/storage/habilidades/ApuestaCiega.webp',
                'codigo' => 'apostador',
                'efectos' => [
                    ['name' => 'extra_gold_inicial', 'value' => 50],
                ],
                'coste_oro' => 25,
                'usos_por_ronda' => null,
            ],
            [
                'nombre' => 'Forja de Emergencia',
                'descripcion' => 'Permite crear un arma aleatoria una vez por ronda (No se guarda en el mazo). Además, ganas 1 más de daño con armas.',
                'icono' => '/storage/habilidades/ForjaDeEmergencia.webp',
                'codigo' => 'herrero',
                'efectos' => [
                    ['name' => 'blacksmith_dmg', 'value' => 1],
                ],
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Cazarecompensas',
                'descripcion' => 'Aplica el modificador `botín` a dos enemigos de la mano actual. Además, desbloqueas las misiones en tienda.',
                'icono' => '/storage/habilidades/Cazarrecompensas.webp',
                'codigo' => 'cazador',
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
        ];

        foreach ($habilidadesData as $data) {
            ModelHabilidad::updateOrCreate(
                ['nombre' => $data['nombre']],
                [
                    'descripcion' => $data['descripcion'],
                    'icono' => config('app.backend_url') . $data['icono'],
                    'codigo' => $data['codigo'],
                    'efectos' => $data['efectos'],
                    'coste_oro' => $data['coste_oro'],
                    'usos_por_ronda' => $data['usos_por_ronda'],
                ]
            );
        }
    }
}