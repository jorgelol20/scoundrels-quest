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
        $personajesData = [
            [
                'id' => 1,
                'nombre' => 'Guerrero',
                'descripcion' => 'Nació por su madre, morirá luchando en batalla. Infunde tanto terror en sus enemigos que les hace huir despavoridos.',
                'activo' => true,
                'habilidad_id' => 1
            ],
            [
                'id' => 2,
                'nombre' => 'Paladin',
                'descripcion' => 'Acogido en un convento cuando era niño y guiado por la fe, ahora es todo un adulto. Su voluntad hacia Dios es tan fuerte que, en batalla, le proporciona vitalidad suficiente para defender a sus compañeros',
                'activo' => true,
                'habilidad_id' => 2
            ],
            [
                'id' => 3,
                'nombre' => 'Elfo',
                'descripcion' => 'Criado en la espesura salvaje y conocedor de cada secreto del bosque, se ha convertido en un maestro de la guerra de guerrillas y el uso de trampas para debilitar a sus enemigos.',
                'activo' => true,
                'habilidad_id' => 3
            ],
            [
                'id' => 4,
                'nombre' => 'Mago',
                'descripcion' => 'Estudioso de los grimorios antiguos desde su juventud y consagrado a descifrar los misterios de la magia arcana permitiendole anticiparse a los eventos futuros.',
                'activo' => true,
                'habilidad_id' => 4
            ],
            [
                'id' => 5,
                'nombre' => 'Apostador',
                'descripcion' => 'Ciego de fé (y las cataratas) este clérigo pasa sus días apostando en la tasca. No siempre sale bien parado...',
                'activo' => true,
                'habilidad_id' => 5
            ],
            [
                'id' => 6,
                'nombre' => 'Herrero',
                'descripcion' => 'Nació porque su madre lo parió, y desde entonces no ha dejado de golpear cosas con un martillo. Forjó espadas, armaduras y, según él, “una sartén que podría matar a un dragón”.',
                'activo' => true,
                'habilidad_id' => 6
            ],
            [
                'id' => 7,
                'nombre' => 'Cazarrecompensas',
                'descripcion' => '',
                'activo' => false,
                'habilidad_id' => 7
            ],
            [
                'id' => 8,
                'nombre' => 'Vampiro',
                'descripcion' => 'Caminante de la noche, sofisticado y culto, cuya compostura oculta a un depredador implacable. Se alimenta de la sangre de sus enemigos para revitalizarse y desatar la verdadera ferocidad que aguarda tras sus modales de caballero.',
                'activo' => true,
                'habilidad_id' => 8
            ],
            [
                'id' => 9,
                'nombre' => 'Domador',
                'descripcion' => 'Criado con lobos y entrenado por la naturaleza. Es capaz de apaciguar hasta las más temibles bestias para que luchen por él.',
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
                ]);
        }
    }
}
