<?php

namespace Database\Factories;

use App\Models\Personajes;
use App\Models\Habilidad; // Importamos el modelo Habilidad
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Personajes>
 */
class PersonajesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre'      => $this->faker->name(),
            'descripcion' => $this->faker->sentence(10),
            'imagen'      => null,
            'activo'      => true,
            'habilidad_id'   => Habilidad::factory(), 
        ];
    }
}