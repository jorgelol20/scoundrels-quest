<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Carta as ModelCarta;

class Cartas extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $palos = ['Pica', 'Corazon', 'Diamante', 'Trebol'];
        $valores = [
            '2' => 'Dos',
            '3' => 'Tres',
            '4' => 'Cuatro',
            '5' => 'Cinco',
            '6' => 'Seis',
            '7' => 'Siete',
            '8' => 'Ocho',
            '9' => 'Nueve',
            '10' => 'Diez',
            '11' => 'Sota',
            '12' => 'Reina',
            '13' => 'Rey',
            '14' => 'As'
        ];

        foreach ($palos as $palo) {
            foreach ($valores as $num => $nombre) {
                // 1. Verificamos si es una carta especial
                $esEspecial = $num > 10 && in_array($palo, ['Diamante', 'Corazon']);
                $efectos = null;

                // 2. Si es especial, buscamos su efecto único
                if ($esEspecial) {
                    $idCarta = "{$num}-{$palo}";
                    $arrayEfectos = match ($idCarta) {
                        '11-Corazon' => [['name' => 'restore_ability', 'value' => true, 'description' => 'Restaura la habilidad de tu personaje pero no te cura nada.'], ['name' => 'heal', 'value' => 0]],
                        '12-Corazon' => [['name' => 'progresive_heal', 'value' => 3, 'description' => 'Te cura 10 de daño y te cura 3 de vida cada ronda durante 3 rondas.'], ['name'=>'progresive_heal_turns', 'value'=>3]],
                        '13-Corazon' => [['name' => 'dmg_reduction', 'value' => 10, 'description' => 'Reduce en 10 el siguiente ataque que fueras a sufrir.']],
                        '14-Corazon' => [['name' => 'heal_roulete', 'value' => true, 'description' => 'Te cura 100 de vida, pero hay una probabilidad del 25% de hacer el efecto contrario.']],

                        '11-Diamante' => [['name' => 'invincibility_turns', 'value' => 1, 'description' => 'El primer ataque que recibes con esta arma te hace 0 de daño.']],
                        '12-Diamante' => [['name' => 'revive', 'value' => true, 'description' => 'Si fueras a atacar a un enemigo y fueras a morir, te deja a 1 de vida.'], ['name' => 'revive_health', 'value' => 1]],
                        '13-Diamante' => [['name' => 'health_steal', 'value' => 1, 'description' => 'Robas 1 de vida a los enemigos derrotados con esta arma.']],
                        '14-Diamante' => [['name' => 'weapon_dmg', 'value' => 14, 'description' => '¡La poderosa excalibur! No hay enemigo que sea rival para esta arma.']],

                        default => [] // Por si acaso no coincide ninguna
                    };

                    // Lo codificamos tal y como lo necesitas para tu base de datos
                    $efectos = json_encode($arrayEfectos);
                }

                // 3. Un único create para todo
                ModelCarta::factory()->create([
                    'palo' => $palo,
                    'valor' => $num,
                    'imagen' => config('app.backend_url') . "/storage/cartas/{$nombre}{$palo}.webp",
                    'activa' => true,
                    'especial' => $esEspecial,
                    'efectos' => $efectos,
                ]);
            }
        }
    }
}
