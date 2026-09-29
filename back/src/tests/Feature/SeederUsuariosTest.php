<?php

namespace Tests\Feature;

use Database\Seeders\Usuarios as UsuariosSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * El seeder concede el rol de administrador mediante asignación explícita,
 * ya que `es_admin` está fuera de `$fillable` de forma deliberada.
 */
class SeederUsuariosTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_seeder_marca_los_cuentas_de_prueba_como_admin(): void
    {
        $this->seed(UsuariosSeeder::class);

        $this->assertDatabaseHas('usuarios', ['nick' => 'admin', 'es_admin' => true]);
        $this->assertDatabaseHas('usuarios', ['nick' => 'jorge', 'es_admin' => true]);
    }
}
