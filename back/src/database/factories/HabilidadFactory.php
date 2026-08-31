<?php

namespace Database\Factories;

use App\Models\Habilidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Habilidad>
 */
class HabilidadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->word(),
            'descripcion' => $this->faker->sentence(12),
            'icono' => $this->faker->text(200)
        ];
    }
}