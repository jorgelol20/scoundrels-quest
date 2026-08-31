<?php

namespace Database\Factories;

use App\Models\Logros;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Logros>
 */
class LogrosFactory extends Factory
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
            'icono' => null,
        ];
    }
}
