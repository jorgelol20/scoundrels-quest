<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Partidas as ModelPartidas;
use App\Models\Usuarios;
use App\Models\Modificadores;

class Partidas extends Seeder
{
    public function run(): void
    {

    // $partida1 = ModelPartidas::factory()->create([
    //         'usuario_id' => 1,
    //         'personaje_id' => 1,
    //         'tiempo' => 45,
    //         'victoria' => false,
    //         'rondas' => 1,
    //         'oro_obtenido' => 50,
    //         'vida_curada' => 12,
    //         'enemigos_enfrentados' => 14
    //     ]);

    //     // Añadir modificadores
    //     $partida1->modificadores()->attach([3]);


    //     $partida2 = ModelPartidas::factory()->create([
    //         'usuario_id' => 1,
    //         'personaje_id' => 2,
    //         'tiempo' => 4140,
    //         'victoria' => true,
    //         'rondas' => 10,
    //         'oro_obtenido' => 4200,
    //         'vida_curada' => 252,
    //         'enemigos_enfrentados' => 500
    //     ]);

    //     // Añadir modificadores
    //     $partida2->modificadores()->attach([3]);
    //     $partida2->modificadores()->attach([2]);
    //     $partida2->modificadores()->attach([5]);
    //     $partida2->modificadores()->attach([7]);
    //     $partida2->modificadores()->attach([1]);
    //     $partida2->modificadores()->attach([4]);
    //     $partida2->modificadores()->attach([6]);
    //     $partida2->modificadores()->attach([8]);
    //     $partida2->modificadores()->attach([9]);
    }
}