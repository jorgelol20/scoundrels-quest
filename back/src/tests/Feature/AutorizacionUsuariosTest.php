<?php

namespace Tests\Feature;

use App\Models\Usuarios;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Regresiones de seguridad sobre la autorización de usuarios.
 *
 * Cubre los hallazgos:
 *  - escalada de privilegios a es_admin/is_teter vía mass assignment
 *  - IDOR en la edición del perfil de terceros (robo de cuentas)
 *  - IDOR en la edición de comentarios de otro usuario
 *  - comentarios sin validar
 *  - fuga de emails en los rankings públicos
 *  - ausencia de rate limiting en /login
 */
class AutorizacionUsuariosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Personaje mínimo para respetar la FK de partidas.
        $habilidad = \App\Models\Habilidad::create(['nombre' => 'Golpe']);
        $this->personaje = \App\Models\Personajes::create([
            'nombre' => 'Guerrero',
            'activo' => true,
            'habilidad_id' => $habilidad->id,
        ]);
    }

    private mixed $personaje;

    private function partidaDe(Usuarios $u): \App\Models\Partidas
    {
        return \App\Models\Partidas::create([
            'usuario_id' => $u->id,
            'personaje_id' => $this->personaje->id,
            'tiempo' => 100,
            'victoria' => true,
            'rondas' => 5,
            'oro_obtenido' => 10,
            'vida_curada' => 2,
            'enemigos_enfrentados' => 8,
        ]);
    }

    private function usuario(string $nick = 'jorge', array $extra = []): Usuarios
    {
        return Usuarios::create(array_merge([
            'nick' => $nick,
            'email' => $nick . '@example.com',
            'password' => Hash::make('HZnQ_1705'),
        ], $extra));
    }

    public function test_usuario_normal_no_puede_concederse_el_rol_admin(): void
    {
        $atacante = $this->usuario('atacante');

        $this->actingAs($atacante)
            ->putJson('/api/usuarios/atacante', [
                'color' => '#ff0000',
                'es_admin' => true,
            ])
            ->assertOk();

        $this->assertFalse(
            $atacante->fresh()->es_admin,
            'Un usuario no autenticado como admin conseguiu escalarse a admin.'
        );
    }

    public function test_es_admin_tampoco_se_persiste_al_editar_otro_perfil(): void
    {
        $atacante = $this->usuario('atacante');
        $victima = $this->usuario('victima');

        $this->actingAs($atacante)
            ->putJson('/api/usuarios/victima', [
                'es_admin' => true,
                'is_tester' => true,
            ])
            ->assertStatus(403);

        $this->assertFalse($victima->fresh()->es_admin);
        $this->assertFalse($victima->fresh()->is_tester);
    }

    public function test_no_se_puede_editar_el_perfil_de_otro_usuario(): void
    {
        $atacante = $this->usuario('atacante');
        $victima = $this->usuario('victima');
        $passwordOriginal = $victima->password;

        $this->actingAs($atacante)
            ->putJson('/api/usuarios/victima', [
                'password' => 'Nu3vo_Passw0rd!',
            ])
            ->assertStatus(403);

        $this->assertSame(
            $passwordOriginal,
            $victima->fresh()->password,
            'La contraseña de la víctima cambió: IDOR de toma de control de cuentas.'
        );
    }

    public function test_alias_post_para_editar_perfil_tambien_respeta_la_propiedad(): void
    {
        $atacante = $this->usuario('atacante');
        $victima = $this->usuario('victima');
        $passwordOriginal = $victima->password;

        // El front envía el perfil por POST, no por PUT.
        $this->actingAs($atacante)
            ->postJson('/api/usuarios/victima', [
                'password' => 'Nu3vo_Passw0rd!',
                'es_admin' => true,
            ])
            ->assertStatus(403);

        $this->assertSame($passwordOriginal, $victima->fresh()->password);
        $this->assertFalse($victima->fresh()->es_admin);
    }

    public function test_reenviar_el_propio_nick_y_email_no_choca_con_unique(): void
    {
        $usuario = $this->usuario('jorge');

        // El perfil se reenvía con todos sus campos, incluidos los que no cambian.
        $this->actingAs($usuario)
            ->putJson('/api/usuarios/jorge', [
                'nick' => 'jorge',
                'email' => 'jorge@example.com',
                'color' => '#0000ff',
            ])
            ->assertOk();

        $this->assertSame('jorge', $usuario->fresh()->nick);
        $this->assertSame('#0000ff', $usuario->fresh()->color);
    }

    public function test_no_se_puede_adoptar_el_nick_de_otro_usuario(): void
    {
        $atacante = $this->usuario('atacante');
        $this->usuario('victima');

        $this->actingAs($atacante)
            ->putJson('/api/usuarios/atacante', ['nick' => 'victima'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nick']);
    }

    public function test_el_propietario_si_puede_editar_su_perfil(): void
    {
        $usuario = $this->usuario('jorge');

        $this->actingAs($usuario)
            ->putJson('/api/usuarios/jorge', ['color' => '#00ff00'])
            ->assertOk();

        $this->assertSame('#00ff00', $usuario->fresh()->color);
    }

    public function test_un_admin_puede_gestionar_roles_por_la_ruta_dedicada(): void
    {
        $admin = $this->usuario('admin');
        $admin->es_admin = true;
        $admin->save();

        $objetivo = $this->usuario('objetivo');

        $this->actingAs($admin)
            ->patchJson('/api/usuarios/objetivo/rol', ['es_admin' => true])
            ->assertOk();

        $this->assertTrue($objetivo->fresh()->es_admin);
    }

    public function test_un_usuario_normal_no_puede_gestionar_roles(): void
    {
        $atacante = $this->usuario('atacante');
        $victima = $this->usuario('victima');

        $this->actingAs($atacante)
            ->patchJson('/api/usuarios/victima/rol', ['es_admin' => true])
            ->assertStatus(403);

        $this->assertFalse($victima->fresh()->es_admin);
    }

    public function test_no_se_puede_editar_el_comentario_de_otro_usuario(): void
    {
        $atacante = $this->usuario('atacante');
        $duenyo = $this->usuario('duenyo');

        $partida = $this->partidaDe($duenyo);

        $partida->comentarios()->attach($duenyo->id, [
            'comentario' => 'Comentario original del dueño',
        ]);

        $comentarioId = \DB::table('comentarios_usuario_partida')
            ->where('usuario_id', $duenyo->id)
            ->value('id');

        // El atacante envía SU propio usuario_id junto al partida_id de la víctima.
        $this->actingAs($atacante)
            ->putJson('/api/usuarios/comentario/' . $comentarioId, [
                'partida_id' => $partida->id,
                'usuario_id' => $atacante->id,
                'comentario' => 'Comentario inyectado por el atacante',
            ])
            ->assertStatus(403);

        $this->assertSame(
            'Comentario original del dueño',
            \DB::table('comentarios_usuario_partida')->where('id', $comentarioId)->value('comentario')
        );
    }

    public function test_crear_comentario_exige_texto_valido(): void
    {
        $usuario = $this->usuario('jorge');

        $partida = $this->partidaDe($usuario);

        // Comentario vacío: antes se persistía sin validar.
        $this->actingAs($usuario)
            ->postJson('/api/usuarios/comentario', [
                'partida_id' => $partida->id,
                'comentario' => '',
            ])
            ->assertStatus(422);

        // Excede el máximo permitido.
        $this->actingAs($usuario)
            ->postJson('/api/usuarios/comentario', [
                'partida_id' => $partida->id,
                'comentario' => str_repeat('a', 1001),
            ])
            ->assertStatus(422);
    }

    public function test_los_rankings_publicos_no_exponen_el_email(): void
    {
        $this->usuario('visible');

        foreach (['/api/ranking-victorias', '/api/ranking-rondas'] as $ruta) {
            $respuesta = $this->getJson($ruta)->assertOk();

            $this->assertStringNotContainsString(
                'visible@example.com',
                $respuesta->getContent(),
                "El endpoint público {$ruta} filtró emails."
            );
        }
    }

    public function test_el_login_esta_limitado_por_tasa(): void
    {
        $this->usuario('jorge');

        // 5 intentos/min por IP+email: el 6º debe ser rechazado.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'jorge@example.com',
                'password' => 'Incorrecta1!',
            ])->assertStatus(422);
        }

        $this->postJson('/api/login', [
            'email' => 'jorge@example.com',
            'password' => 'Incorrecta1!',
        ])->assertStatus(429);
    }
}
