<?php

namespace Tests\Feature;

use App\Models\Carta;
use App\Models\Habilidad;
use App\Models\Modificadores;
use App\Models\Partidas;
use App\Models\Personajes;
use App\Models\Usuarios;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * El contenido del juego no puede modificarse ni borrarse sin ser admin.
 *
 * Antes, `cartas`, `personajes`, `modificadores` y la escritura de `partidas`
 * estaban expuestos sin autenticación ni control de rol: cualquier anónimo
 * podía borrar el contenido del juego.
 */
class ContenidoJuegoAutorizacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Registros mínimos para respetar las claves ajenas.
        $habilidad = Habilidad::create(['nombre' => 'Golpe']);
        $this->personaje = Personajes::create([
            'nombre' => 'Guerrero',
            'activo' => true,
            'habilidad_id' => $habilidad->id,
        ]);
        $this->modificador = Modificadores::create([
            'nombre' => 'Fuego',
            'efectos' => ['danio' => 2],
        ]);
        $this->carta = Carta::create([
            'palo' => 'Espada',
            'valor' => 3,
            'activa' => true,
        ]);
    }

    private mixed $personaje;
    private mixed $modificador;
    private mixed $carta;

    private function admin(): Usuarios
    {
        $u = Usuarios::create([
            'nick' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('HZnQ_1705'),
        ]);
        $u->es_admin = true;
        $u->save();

        return $u->fresh();
    }

    private function usuario(string $nick = 'jorge'): Usuarios
    {
        return Usuarios::create([
            'nick' => $nick,
            'email' => $nick . '@example.com',
            'password' => Hash::make('HZnQ_1705'),
        ]);
    }

    private function partidaDe(Usuarios $u): Partidas
    {
        return Partidas::create(array_merge($this->partidaValida(), ['usuario_id' => $u->id]));
    }

    #[DataProvider('rutasDeEscritura')]
    public function test_anonimo_no_puede_crear_contenido(string $ruta): void
    {
        $this->postJson($ruta, $this->cuerpoDe($ruta))->assertStatus(403);
    }

    #[DataProvider('rutasDeEscritura')]
    public function test_usuario_normal_no_puede_crear_contenido(string $ruta): void
    {
        $this->actingAs($this->usuario())
            ->postJson($ruta, $this->cuerpoDe($ruta))
            ->assertStatus(403);
    }

    #[DataProvider('rutasDeBorrado')]
    public function test_anonimo_no_puede_borrar_contenido(string $ruta, string $tabla, string $clave): void
    {
        $this->deleteJson($this->resolver($ruta, $clave))->assertStatus(403);
    }

    #[DataProvider('rutasDeBorrado')]
    public function test_usuario_normal_no_puede_borrar_contenido(string $ruta, string $tabla, string $clave): void
    {
        $this->actingAs($this->usuario())
            ->deleteJson($this->resolver($ruta, $clave))
            ->assertStatus(403);
    }

    #[DataProvider('rutasDeBorrado')]
    public function test_el_admin_si_puede_borrar_contenido(string $ruta, string $tabla, string $clave): void
    {
        $modelo = $this->{$clave};

        $this->actingAs($this->admin())
            ->deleteJson(str_replace('{id}', (string) $modelo->id, $ruta))
            ->assertOk();

        $this->assertDatabaseMissing($tabla, ['id' => $modelo->id]);
    }

    public function test_el_admin_si_puede_crear_un_modificador(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/modificadores', [
                'nombre' => 'Hielo',
                'descripcion' => 'Congela',
                'efectos' => ['danio' => 1],
                'nivel' => 2,
                'activo' => true,
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('modificadores', ['nombre' => 'Hielo']);
    }

    public function test_el_admin_si_puede_actualizar_una_carta(): void
    {
        $this->actingAs($this->admin())
            ->putJson('/api/cartas/' . $this->carta->id, ['valor' => 9])
            ->assertOk();

        $this->assertSame(9, Carta::find($this->carta->id)->valor);
    }

    public function test_la_lectura_del_juego_sigue_siendo_publica(): void
    {
        $this->getJson('/api/cartas')->assertOk();
        $this->getJson('/api/personajes')->assertOk();
        $this->getJson('/api/modificadores')->assertOk();
        $this->getJson('/api/logros')->assertOk();
        $this->getJson('/api/partidas')->assertOk();
    }

    public function test_registrar_una_partida_exige_sesion(): void
    {
        $this->postJson('/api/partidas', $this->partidaValida())->assertStatus(401);
    }

    public function test_la_identidad_de_la_partida_se_toma_del_token_y_no_del_cuerpo(): void
    {
        $atacante = $this->usuario('atacante');
        $victima = $this->usuario('victima');

        $cuerpo = array_merge($this->partidaValida(), [
            'usuario_id' => $victima->id, // intento de suplantación
        ]);

        $this->actingAs($atacante)->postJson('/api/partidas', $cuerpo)->assertStatus(201);

        $this->assertDatabaseHas('partidas', ['usuario_id' => $atacante->id]);
        $this->assertDatabaseMissing('partidas', ['usuario_id' => $victima->id]);
    }

    #[DataProvider('statisticasInvalidas')]
    public function test_las_estadisticas_de_la_partida_estan_acotadas(array $exceso): void
    {
        $this->actingAs($this->usuario())
            ->postJson('/api/partidas', array_merge($this->partidaValida(), $exceso))
            ->assertStatus(422);
    }

    public function test_editar_una_partida_exige_admin(): void
    {
        $partida = $this->partidaDe($this->usuario('duenyo'));

        $this->actingAs($this->usuario('otro'))
            ->putJson('/api/partidas/' . $partida->id, ['rondas' => 20])
            ->assertStatus(403);

        $this->actingAs($this->admin())
            ->putJson('/api/partidas/' . $partida->id, ['rondas' => 20])
            ->assertOk();

        $this->assertSame(20, $partida->fresh()->rondas);
    }

    public function test_el_alias_post_de_usuarios_no_roba_la_ruta_de_comentarios(): void
    {
        // Si el comodín {usuario} capturara 'comentario', esta ruta se
        // desviaría hacia update() y la validación fallaría.
        $this->actingAs($this->usuario())
            ->postJson('/api/usuarios/comentario', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['partida_id', 'comentario']);
    }

    public static function rutasDeEscritura(): array
    {
        return [
            'carta' => ['/api/cartas'],
            'personaje' => ['/api/personajes'],
            'modificador' => ['/api/modificadores'],
        ];
    }

    public static function rutasDeBorrado(): array
    {
        return [
            'carta' => ['/api/cartas/{id}', 'cartas', 'carta'],
            'personaje' => ['/api/personajes/{id}', 'personajes', 'personaje'],
            'modificador' => ['/api/modificadores/{id}', 'modificadores', 'modificador'],
        ];
    }

    public static function statisticasInvalidas(): array
    {
        return [
            'rondas enormes' => [['rondas' => 999999]],
            'oro negativo' => [['oro_obtenido' => -500]],
            'tiempo desmedido' => [['tiempo' => 99999999]],
        ];
    }

    private function resolver(string $ruta, string $clave): string
    {
        return str_replace('{id}', (string) $this->{$clave}->id, $ruta);
    }

    private function cuerpoDe(string $ruta): array
    {
        return match ($ruta) {
            '/api/cartas' => ['palo' => ' basto', 'valor' => 1, 'activa' => true],
            '/api/personajes' => ['nombre' => 'Mago', 'activo' => true, 'habilidad_id' => 1],
            '/api/modificadores' => ['nombre' => 'Viento', 'efectos' => ['x' => 1]],
            default => [],
        };
    }

    private function partidaValida(): array
    {
        return [
            'personaje_id' => $this->personaje->id,
            'tiempo' => 120,
            'victoria' => true,
            'rondas' => 4,
            'oro_obtenido' => 30,
            'vida_curada' => 12,
            'enemigos_enfrentados' => 18,
            'modificadores' => [],
        ];
    }
}
