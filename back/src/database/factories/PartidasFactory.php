<?php

namespace Database\Factories;

use App\Models\Partidas;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Partidas>
 */
class PartidasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'usuario_id' => null,
            'personaje_id' => null,
            'tiempo' => null,
            'victoria' => null,
            'rondas' => null,
            'oro_obtenido' => null,
            'vida_curada' => null,
            'enemigos_enfrentados' => null,
        ];
    }
}
