<?php

namespace Database\Factories;

use App\Models\Carta;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Carta>
 */
class CartaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'palo' => fake()->name(),
            'valor' => fake()->numberBetween(2,14),
            'imagen' => null,
            'activa' => True,
            'especial' => False,
            'efectos' => null
        ];
    }
}
