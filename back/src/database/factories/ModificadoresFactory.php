<?php

namespace Database\Factories;

use App\Models\Modificadores;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Modificadores>
 */
class ModificadoresFactory extends Factory
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
            'descripcion' => $this->faker->sentence(),
            'imagen' => null,
            'nivel' => 0,
            'activo' => true,
            'efectos' => json_encode([]),
        ];
    }
}
