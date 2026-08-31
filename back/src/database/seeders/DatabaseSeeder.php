<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\Cartas;
use Database\Seeders\Personajes;
use Database\Seeders\Habilidades;
use Database\Seeders\Modificadores;
use Database\Seeders\Usuarios;
use Database\Seeders\Partidas;
use Database\Seeders\Logros;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
           'email' => 'test@example.com',
        ]);
        $this->call(Cartas::class);
        $this->call(Habilidades::class);
        $this->call(Personajes::class);
        $this->call(Usuarios::class);
        $this->call(Modificadores::class);
        $this->call(Partidas::class);
        $this->call(Logros::class);
       
    }
}
