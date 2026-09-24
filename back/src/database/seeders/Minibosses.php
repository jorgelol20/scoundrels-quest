<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Carta as ModelCarta;

class Minibosses extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // El funcionamiento de las cartas de miniboss cambia respecto a las cartas.
        // El valor en el efecto representará su valor (daño).
        $minibossesData = [
            //Reina Slime
            [
                'palo' => 'Miniboss',
                'valor' => 1,
                'especial' => true,
                'efectos' => [['name' => 'sticky', 'value' => 16, 'description' => 'Cada vez que el jugador ataque a la reina slime, esta en vez de ser derrotada, se le bajará su valor a la mitad y creará 2 slimes con valor igual al suyo entre 2 y se barajará en la baraja. La reina slime será derrotada al tener de valor 2.']]
            ],

            //Araña gigante
            [
                'palo' => 'Miniboss',
                'valor' => 2,
                'especial' => true,
                'efectos' => [['name' => 'spider_web', 'value' => 6, 'description' => 'Al atacar a una de sus partes, esta se eliminará y no podrás huir por 3 turnos.']]
            ],

            // Chamán demoniaco
            [
                'palo' => 'Miniboss',
                'valor' => 3,
                'especial' => true,
                'efectos' => [['name' => 'chaos_force', 'value' => null, 'description' => 'Su valor varía dependiendo la cantidad de monstruos restantes en la ronda. Cada 5 manos, vuelve a aparecer. Este será eliminado inmediatamente al atacarlo']]
            ],
            // Reina de los ladrones
            [
                'palo' => 'Miniboss',
                'valor' => 4,
                'especial' => true,
                'efectos' => [['name' => 'last_pillage', 'value' => 12, 'description' => 'Al ser derrotada esta carta, quitará un 25% del dinero actual y elimina la carta de arma usada para eliminarla del jugador. Esta carta siempre aparecerá en la última mano de la ronda.']]
            ],
            // Rey hada
            [
                'palo' => 'Miniboss',
                'valor' => 5,
                'especial' => true,
                'efectos' => [['name' => 'supplies', 'value' => 30, 'description' => 'Cada vez que te curas con cartas de curación, le baja 2 de vida máxima hasta un mínimo de 2 vida.']]
            ],
            // Guantes
            [
                'palo' => 'Miniboss',
                'valor' => 6,
                'especial' => true,
                'efectos' => [['name' => 'hairballs', 'value' => 9, 'description' => 'Cada vez que huyes de una mano, guantes añadirá una carta de bola de pelo con valor 0 y un efecto aleatorio. Esta carta siempre aparecerá en la última mano de la ronda.']]
            ],
            // Bola de pelo de guantes
            [
                'palo' => 'Miniboss',
                'valor' => 7,
                'especial' => true,
                'efectos' => [['name' => 'hairball', 'value' => 0, 'description' => 'Carta que invoca guantes cuando el usuario huye']]
            ],
            // Mimico
            [
                'palo' => 'Miniboss',
                'valor' => 8,
                'especial' => true,
                'efectos' => [['name' => 'mimicry', 'value' => 16, 'description' => 'Se hace pasar por una carta de curación aleatorio. Esta tendrá diferencias con las que podrás darte cuenta que es el mímico.']]
            ],
            
        ];

        foreach($minibossesData as $miniboss){
            ModelCarta::updateOrCreate(
            [
                'palo' => $miniboss['palo'],
                'valor' => $miniboss['valor'],
            ],
            [
                'imagen' => config('app.backend_url') . "/storage/cartas/miniboss/{$miniboss['valor']}{$miniboss['palo']}.webp",
                'activa' => true,
                'especial' => $miniboss['especial'],
                'efectos' => $miniboss['efectos'],
            ]
        );
        }
        
    }
}