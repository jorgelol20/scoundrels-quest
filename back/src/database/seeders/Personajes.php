<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Personajes as ModelPersonajes;

class Personajes extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sanea la fila huérfana de seeders antiguos (nombre 'Cazador' en vez
        // de 'Cazarrecompensas'): mismo patrón de limpieza que Logros.
        ModelPersonajes::where('nombre', 'Cazador')->delete();

        $personajesData = [
            [
                'id' => 1,
                'nombre' => 'Guerrero',
                'descripcion' => 'Nació por su madre, morirá luchando en batalla. Infunde tanto terror en sus enemigos que les hace huir despavoridos.',
                'nombre_en' => 'Warrior',
                'descripcion_en' => 'Born of his mother, he will die fighting in battle. He strikes such terror into his enemies that they flee in panic.',
                'activo' => true,
                'habilidad_id' => 1
            ],
            [
                'id' => 2,
                'nombre' => 'Paladin',
                'descripcion' => 'Acogido en un convento cuando era niño y guiado por la fe, ahora es todo un adulto. Su voluntad hacia Dios es tan fuerte que, en batalla, le proporciona vitalidad suficiente para defender a sus compañeros',
                'nombre_en' => 'Paladin',
                'descripcion_en' => 'Taken in by a convent as a child and guided by faith, he is now a grown man. His will toward God is so strong that, in battle, it grants him enough vitality to defend his companions.',
                'activo' => true,
                'habilidad_id' => 2
            ],
            [
                'id' => 3,
                'nombre' => 'Elfo',
                'descripcion' => 'Criado en la espesura salvaje y conocedor de cada secreto del bosque, se ha convertido en un maestro de la guerra de guerrillas y el uso de trampas para debilitar a sus enemigos.',
                'nombre_en' => 'Elf',
                'descripcion_en' => 'Raised in the wild thicket and knowing every secret of the forest, he has become a master of guerrilla warfare and the use of traps to weaken his enemies.',
                'activo' => true,
                'habilidad_id' => 3
            ],
            [
                'id' => 4,
                'nombre' => 'Mago',
                'descripcion' => 'Estudioso de los grimorios antiguos desde su juventud y consagrado a descifrar los misterios de la magia arcana permitiendole anticiparse a los eventos futuros.',
                'nombre_en' => 'Mage',
                'descripcion_en' => 'A student of ancient grimoires since his youth, devoted to unraveling the mysteries of arcane magic, allowing him to foresee future events.',
                'activo' => true,
                'habilidad_id' => 4
            ],
            [
                'id' => 5,
                'nombre' => 'Apostador',
                'descripcion' => 'Ciego de fé (y las cataratas) este clérigo pasa sus días apostando en la tasca. No siempre sale bien parado...',
                'nombre_en' => 'Gambler',
                'descripcion_en' => 'Blind with faith (and cataracts), this cleric spends his days gambling at the tavern. Things don\'t always go well for him...',
                'activo' => true,
                'habilidad_id' => 5
            ],
            [
                'id' => 6,
                'nombre' => 'Herrero',
                'descripcion' => 'Nació porque su madre lo parió, y desde entonces no ha dejado de golpear cosas con un martillo. Forjó espadas, armaduras y, según él, "una sartén que podría matar a un dragón".',
                'nombre_en' => 'Blacksmith',
                'descripcion_en' => 'He was born because his mother gave birth to him, and since then he hasn\'t stopped hitting things with a hammer. He forged swords, armor, and, according to him, "a frying pan that could kill a dragon".',
                'activo' => true,
                'habilidad_id' => 6
            ],
            [
                'id' => 7,
                'nombre' => 'Cazarrecompensas',
                'descripcion' => 'Hace lo que sea por dinero. Golpea ancianas, saquea aldeas, roba a niños... PERO, no le haría nunca daño a un gatito, salvo que le paguen el doble.',
                'nombre_en' => 'Bounty Hunter',
                'descripcion_en' => 'He\'ll do anything for money. Beats up old women, plunders villages, steals from children... BUT he would never hurt a little kitten, unless they pay him double.',
                'activo' => true,
                'habilidad_id' => 7
            ],
            [
                'id' => 8,
                'nombre' => 'Vampiro',
                'descripcion' => 'Caminante de la noche, sofisticado y culto, cuya compostura oculta a un depredador implacable. Se alimenta de la sangre de sus enemigos para revitalizarse y desatar la verdadera ferocidad que aguarda tras sus modales de caballero.',
                'nombre_en' => 'Vampire',
                'descripcion_en' => 'A walker of the night, sophisticated and cultured, whose composure hides a relentless predator. He feeds on the blood of his enemies to revitalize himself and unleash the true ferocity that lurks behind his gentlemanly manners.',
                'activo' => true,
                'habilidad_id' => 8
            ],
            [
                'id' => 9,
                'nombre' => 'Domador',
                'descripcion' => 'Criado con lobos y entrenado por la naturaleza. Es capaz de apaciguar hasta las más temibles bestias para que luchen por él.',
                'nombre_en' => 'Tamer',
                'descripcion_en' => 'Raised with wolves and trained by nature itself. He can soothe even the most fearsome beasts into fighting for him.',
                'activo' => true,
                'habilidad_id' => 9
            ],

        ];

        foreach ($personajesData as $data) {
            ModelPersonajes::updateOrCreate(
                ['nombre' => $data['nombre']],
                [
                    'descripcion' => $data['descripcion'],
                    'imagen' => config('app.backend_url')."/storage/personajes/{$data['nombre']}.webp",
                    'activo' => $data['activo'],
                    'habilidad_id' => $data['habilidad_id'],
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
                ]);
        }
    }
}
