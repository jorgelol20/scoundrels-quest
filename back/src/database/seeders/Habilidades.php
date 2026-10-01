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
                'nombre_en' => 'War Cry',
                'descripcion_en' => 'Swap the 2 frontmost enemies for the next 2 cards in the deck. Additionally, while at half health or less, you deal 50% more damage. Using this ability counts as `Escaping`.',
                'icono' => '/storage/habilidades/GritoGuerra.webp',
                'codigo' => 'guerrero',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => null,
            ],
            [
                'nombre' => 'Vitalismo',
                'descripcion' => 'Obtienes más vida base y la capacidad de curarte 5 de vida cada ronda.',
                'nombre_en' => 'Vitality',
                'descripcion_en' => 'Gain more base health and the ability to heal 5 health each round.',
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
                'nombre_en' => 'Brambles',
                'descripcion_en' => 'Once per round, you can lower the value of the two frontmost cards by 5. Additionally, it allows you to escape 1 more time.',
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
                'descripcion' => 'Permite ver las dos siguientes manos siempre que quieras y barajar el mazo 1 vez por ronda.',
                'nombre_en' => 'Arcane Sight',
                'descripcion_en' => 'Allows you to see the next two hands whenever you want and shuffle the deck once per round.',
                'icono' => '/storage/habilidades/VisionArcana.webp',
                'codigo' => 'mago',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Apuesta Ciega',
                'descripcion' => 'Gastas 25 de oro por un efecto aleatorio. Suerte, vas a necesitarla...',
                'nombre_en' => 'Blind Bet',
                'descripcion_en' => 'Spend 25 gold for a random effect. You\'ll need luck...',
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
                'nombre_en' => 'Emergency Forge',
                'descripcion_en' => 'Allows you to create a random weapon once per round (it is not kept in the deck). Additionally, you deal 1 more damage with weapons.',
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
                'nombre_en' => 'Bounty Hunter',
                'descripcion_en' => 'Apply the `loot` modifier to two enemies in the current hand. Additionally, you unlock shop quests.',
                'icono' => '/storage/habilidades/Cazarrecompensas.webp',
                'codigo' => 'cazador',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Sacrificio de sangre',
                'descripcion' => 'Sacrificar un 25% de la vida actual por 5 de daño extra en la siguiente acción. Las curaciones dejan de tener efecto y obtienes robo de vida, cambiando las limitaciones de robo de vida de 3 a 10.',
                'nombre_en' => 'Blood Sacrifice',
                'descripcion_en' => 'Sacrifice 25% of your current health for 5 extra damage on your next action. Healing no longer works and you gain life steal, changing the life steal cap from 3 to 10.',
                'icono' => '/storage/habilidades/PactoDeSangre.webp',
                'codigo' => 'vampiro',
                'efectos' => [['name' => 'life_steal', 'value' => 3]],
                'coste_oro' => null,
                'usos_por_ronda' => null,
            ],
            [
                'nombre' => 'Domesticación',
                'descripcion' => 'El siguiente enemigo al que derrotes, se volverá tu arma. Cuando tengas un enemigo como arma, harás 1 más de daño y los efectos que este tenga se activarán cada vez que ataques.',
                'nombre_en' => 'Taming',
                'descripcion_en' => 'The next enemy you defeat becomes your weapon. While you wield an enemy as a weapon, you deal 1 more damage and its effects trigger every time you attack.',
                'icono' => '/storage/habilidades/Domesticacion.webp',
                'codigo' => 'domador',
                'efectos' => [['name' => 'tamer_dmg', 'value' => 1]],
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Toque espectral',
                'descripcion' => 'Permite bajar el daño recibido en 3 durante 3 manos contando la mano activa. Además, eres inmune a cualquier efecto de carta enemiga.',
                'nombre_en' => 'Spectral Touch',
                'descripcion_en' => 'Reduce incoming damage by 3 for 3 hands, starting with the current one. You are also immune to any enemy card effect.',
                'icono' => '/storage/habilidades/ToqueEspectral.webp',
                'codigo' => 'espectro',
                'efectos' => null,
                'coste_oro' => null,
                'usos_por_ronda' => 1,
            ],
            [
                'nombre' => 'Alquimia Básica',
                'descripcion' => 'Crea una pócima con efectos únicos que te ayudarán en la expedición. Las curaciones otorgan más poder de curación o daño.',
                'nombre_en' => 'Basic Alchemy',
                'descripcion_en' => 'Brews a one-of-a-kind tonic for the expedition. Healing also sharpens her craft — stronger mends or a sharper edge.',
                'icono' => '/storage/habilidades/AlquimiaBasica.webp',
                'codigo' => 'alquimista',
                'efectos' => null,
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
                    'translations' => [
                        'es' => [
                            'nombre' => $data['nombre'],
                            'descripcion' => $data['descripcion'],
                        ],
                        'en' => [
                            'nombre' => $data['nombre_en'],
                            'descripcion' => $data['descripcion_en'],
                        ],
                    ],
                ]
            );
        }
    }
}
