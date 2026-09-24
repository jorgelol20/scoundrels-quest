# Documento técnico: Migración de la lógica de `GamePage` al backend

**Repositorio:** `scoundrels-quest`
**Fecha:** 23/09/2026
**Alcance:** `front/src/components/pages/GamePage.jsx` (2.928 líneas) → API Laravel en `back/src`
**Estado:** Propuesta técnica (no implementada)

---

## 1. Resumen ejecutivo

Hoy **toda la simulación de partida vive en el navegador**. `GamePage.jsx` mantiene en `useState`/`useRef` la vida, el oro, el mazo, la mano, el arma, los efectos de combate, los minibosses, los modificadores y los dados (`Math.random()`), y solo "habla" con el backend al finalizar para guardar estadísticas (`POST /api/partidas`) o para registrar logros (`POST /api/nuevo-logro`). El backend Laravel es, en la práctica, un **servidor de catálogo + de resultados**: no simula turnos, no valida combate y no tiene estado de partida en curso.

Consecuencias actuales:

- Cualquier cliente puede manipular `gold`, `health`, `rounds` o los rolls desde la consola del navegador y subir una partida trufada a los rankings.
- Los logros se disparan desde el cliente sin validación de condiciones.
- La lógica de negocio (2.900 líneas) no es testeable: no hay forma de escribir un test de combate sin renderizar React + Konva.
- Corregir una regla obliga a redesplegar el frontend y a aceptar que clientes con JS antiguo sigan jugando con la regla vieja.

**Objetivo:** convertir el backend en **autoritativo de partida** (estado + acciones), dejando al frontend como capa de presentación: render Konva, drag & drop, animaciones, sonidos, layout y navegación.

**Enfoque elegido:** servidor autoritativo síncrono sobre HTTP/REST (el backend ya existe, es Laravel + Sanctum + MySQL y no hay capa realtime instalada), con transición incremental en 5 fases. No se propone WebSockets en una primera iteración: el juego es por turnos y una petición/acción (≈100-200 ms) es aceptable.

---

## 2. Estado actual (hallazgos verificados)

### 2.1 Frontend

| Aspecto | Detalle |
|---|---|
| Componente | `front/src/components/pages/GamePage.jsx`, envuelto en un `try/catch` global (L289/L2867) |
| Estado | ~60 `useState` + ~90 `useRef` con lógica de negocio (buffs, debuffs, minibosses, modificadores) |
| Contexto | `front/src/context/MatchProvider.jsx` compone mazo, personaje, modificadores y logros |
| API | `front/src/api/api.js` (axios, `VITE_BACKEND_URL`), interceptor de request con Bearer token; **sin interceptor de respuesta** |
| Datos | React Query v5: `useMatch`, `useCard`, `useCharacter`, `useModifier`, `useAchievements`, `useUser`, `useReportBugs` |
| Render | Konva / react-konva (`Stage`, `Layer`, `Card`), drag & drop con hit-test contra `WEAPON_ZONE` |
| RNG | `Math.random()` + `lodash.shuffle` en el cliente |
| Persistencia | Solo al final: `endGame()` → `POST /partidas`; `updateActualGame()` → `PUT /partidas/{id}` |
| localStorage | Ninguno propio (solo `auth_token`, ajustes de audio/logos vía `SettingsProvider`) |

### 2.2 Backend

| Aspecto | Detalle |
|---|---|
| Stack | PHP 8.3 + Laravel 13 + Sanctum + MySQL 8 (Docker: `caddy`, `php`, `scheduler`, `db`) |
| Controladores | 11 en `app/Http/Controllers/Api/` |
| Validación | FormRequests por recurso (`app/Http/Requests/<Recurso>/`) |
| Lógica de juego | **Ninguna simulación.** Solo CRUD de catálogo y registro de resultados |
| Realtime | **Inexistente** (`.env` declara `BROADCAST_CONNECTION=reverb` pero Reverb no está instalado) |
| Transacciones | Cero usos de `DB::transaction` en todo el repo |
| Presencia | Falsa: `POST /usuarios/ping` + `GET /jugadores-activos` (polling) |
| Errores | Sin envelope estándar ni handler de excepciones (`bootstrap/app.php:33-35` vacío) |

### 2.3 Endpoints implicados hoy

```
POST   /api/partidas            ← fin de partida (payload del cliente)
PUT    /api/partidas/{id}       ← partida continuada
POST   /api/nuevo-logro         ← logro disparado por el cliente
POST   /api/reportes-bugs       ← reporte con snapshot de estado
GET    /api/cartas|personajes|modificadores|logros   ← catálogos
```

### 2.4 Anomalías detectadas (bloquean o condicionan la migración)

1. `GamePage.jsx:1878` — `shuffleDeck()` sin argumento en `handleDeleteHalf` → `lodash.shuffle(undefined)`.
2. `GamePage.jsx:1838` — falta `await` a `getWeapon(power)` en `setModifierWeapon` (se pasa una `Promise` a `processCardAction`).
3. `GamePage.jsx:74` / `1171` — condición `!isGambler || (isVampire && health > 5)` sospechosa en recuperación de habilidad.
4. Doble `endGame` protegido por `gameSavedRef` en 4 sitios (L300, L2161, L2271, L2343): persistencia frágil.
5. `useUser.js` llama a `getNotificaciones()` (L275, L284) y `requestMatch()` (L214, L240) que **no existen**.
6. CRUD de `partidas`, `cartas`, `modificadores`, `personajes` y `logros` **son públicos con escritura** (`routes/api.php:84-97`).
7. `LogrosController` está registrado como `apiResource` completo pero solo implementa `index`/`show`.

Estos bugs deben corregirse **antes o durante** la fase 1, porque la migración traslada exactamente esas rutas.

---

## 3. Principios de diseño

1. **El servidor manda.** El cliente envía *intenciones* (`playCard`, `scape`, `useAbility`, `buy`), nunca resultados. El servidor responde con el estado resultante o con un error.
2. **El cliente no calcula, interpola.** Aplica el estado recibido y anima la transición. Si hay desfase, gana el servidor.
3. **Un estado, una fuente de verdad.** El estado de partida vive en una fila (JSON versionado), no en `useState` de React.
4. **Idempotencia y secuencia.** Cada acción lleva `seq` (número de secuencia); el servidor descarta acciones fuera de orden o repetidas.
5. **RNG del servidor, verificable.** Semilla por partida almacenada; los rolls se derivan de ella (permite replays/auditoría futuros).
6. **Migración incremental.** Cada fase deja el juego funcionando; nunca se rompe el loop completo a mitad de camino.
7. **Convenciones del repo.** Nombres en español, PHPDoc en backend, JSDoc en frontend, FormRequests, rutas en `routes/api.php` con `auth:sanctum`, ramas `feature/*` desde `develope`.

---

## 4. Arquitectura propuesta

```
┌────────────────────────── FRONT (React) ──────────────────────────┐
│ GamePage.jsx (presentación)                                      │
│   · Konva, drag&drop, animaciones, sonidos, layout, tooltips      │
│   · Envía intenciones: useGameAction().playCard(cardKey)          │
│   · Suscribe estado:   useGameState(matchId)  → react-query       │
│ MatchProvider (solo composición de catálogos y auth)              │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTPS + Bearer (Sanctum)
┌───────────────────────────────▼───────────────────────────────────┐
│ BACKEND (Laravel)                                                 │
│                                                                   │
│  routes/api.php                                                   │
│    POST /api/partidas-en-curso        → crear partida             │
│    POST /api/partidas-en-curso/{id}/acciones → acción atómica     │
│    GET  /api/partidas-en-curso/{id}    → snapshot (resync)        │
│    POST /api/partidas-en-curso/{id}/finalizar → cierre y ranking  │
│                                                                   │
│  Http/Controllers/Api/PartidaEnCursoController  (delgado)         │
│  Http/Requests/PartidasEnCurso/*               (validación)       │
│  app/Services/Engine/                       ← TODA la regla      │
│      MatchState.php        value object del estado                │
│      MatchRepository.php   carga/guarda con bloqueo FOR UPDATE     │
│      CombatResolver.php    daño, crítico, lifesteal, revive       │
│      CardEffectResolver.php  20 efectos de carta                  │
│      ModifierResolver.php  ~35 efectos de modificadores           │
│      AbilityResolver.php   8 habilidades + passivas               │
│      MinibossResolver.php  7 minibosses                           │
│      TurnTicker.php        veneno, anticura, progresivo...        │
│      RoundManager.php      fin de ronda, tienda, interés, victoria│
│      DeckBuilder.php       mazo inicial + enemigos por ronda      │
│      RngService.php        semilla por partida, rolls ordenados   │
│      EventLog.php          log de acciones (auditoría/replay)     │
│                                                                   │
│  Models: PartidaEnCurso (+ tablas de eventos)                     │
│  Kernel: transacción + lock + validación de secuencia             │
└───────────────────────────────────────────────────────────────────┘
```

### 4.1 ¿Por qué HTTP y no WebSockets?

- El backend no tiene ninguna capa realtime (ni Reverb, ni Pusher, ni Octane).
- El juego es por turnos sin reloj compartido: no hay latencia competitiva que mitigar.
- REST + react-query da reintentos, caché y resync (`GET` snapshot) gratis.
- **Umbral de decisión:** si en el futuro se añade multijugador o tiempo real, sustituir el endpoint de acciones por Laravel Reverb manteniendo intactos los *Resolvers* (la capa de dominio no cambia, solo el transporte).

---

## 5. Modelo de datos

### 5.1 Tabla `partidas_en_curso`

```php
// back/src/database/migrations/2026_09_24_000000_create_partidas_en_curso_table.php
Schema::create('partidas_en_curso', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
    $table->foreignId('personaje_id')->constrained('personajes');
    $table->foreignId('partida_id')->nullable()->constrained('partidas')->nullOnDelete();
    $table->string('estado', 20)->default('activa'); // activa | victoria | derrota | abandonada
    $table->unsignedInteger('seq')->default(0);           // secuencia de acciones
    $table->unsignedBigInteger('rng_seed');
    $table->unsignedBigInteger('rng_cursor')->default(0); // posición en la secuencia
    $table->json('estado_juego');                         // snapshot completo (ver 5.2)
    $table->timestamp('iniciada_at')->useCurrent();
    $table->timestamp('finalizada_at')->nullable();
    $table->timestamps();

    $table->unique(['usuario_id', 'estado']); // 1 partida activa por usuario
    $table->index('estado');
});
```

> El `unique` evita el clásico "dos pestañas jugando a la vez". Si se permite múltiples partidas, sustituir por un índice simple y validar en `MatchRepository`.

### 5.2 Shape de `estado_juego` (JSON)

Refleja 1:1 el estado que hoy vive en `GamePage`, **sin** lo puramente visual:

```jsonc
{
  "version": 1,
  "ronda": 4,
  "max_rondas": 10,
  "continuada": false,
  "vida": 17,
  "vida_max": 25,
  "oro": 42,
  "enemigos_derrotados": 13,
  "mano": [ /* ids internos de carta: {uid, carta_id, valor, palo, efectos, bloqueada} */ ],
  "mazo":  [ /* ... */ ],
  "descartes": [ /* ... */ ],
  "arma": { "uid": "...", "carta_id": 12, "valor": 7 },
  "abatidos": [ /* slainMonsters */ ],
  "habilidad_disponible": true,
  "huidas_restantes": 1,
  "racha": 3,
  "efectos": {                     // fusiona refs de buffs/debuffs (L179-236)
    "dano_extra": 0,
    "dano_permanente": 2,
    "multiplicador_dano": 1.0,
    "reduccion_dano": 0,
    "robo_vida": 0,
    "veneno_turnos": 0,
    "anticura_turnos": 0,
    "curacion_progresiva": { "cantidad": 0, "turnos": 0 },
    "invencibilidad_turnos": 0,
    "revivir": null,
    "romper_arma": false,
    "sello_turnos": 0,
    "robo_almas_turnos": 0,
    "regenerador": { "turnos": 0, "cantidad": 0, "meta": 5 }
  },
  "modificadores_activos": [12, 31],
  "compras_tienda": { "14": 2 },   // boughtCards: precio ×1.25 por compra
  "miniboss": { "tipo": "arana", "partes_restantes": 5, "telarana_turnos": 2 },
  "stats": { "oro_ganado": 60, "vida_curada": 14, "cartas_jugadas": 31, "tiempo_s": 0 },
  "logros_pendientes": []
}
```

**No se persiste** (ya no es estado): zonas Konva, geometría (`DUNGEON_ZONE`, `WEAPON_ZONE`), `layout`, `tooltip`, animaciones, `canBeClicked`, refs DOM, sonidos.

### 5.3 Tabla `partidas_en_curso_eventos` (opcional pero recomendada)

```php
Schema::create('partidas_en_curso_eventos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('partida_en_curso_id')->constrained()->cascadeOnDelete();
    $table->unsignedInteger('seq');
    $table->string('accion', 40);      // playCard | scape | useAbility | buy | startRound
    $table->json('entrada');           // payload de la intención
    $table->json('resultado');         // diff/estado resultante
    $table->json('rolls');             // RNG consumido: auditable
    $table->timestamps();
    $table->unique(['partida_en_curso_id', 'seq']);
});
```

Usos: resincronización del cliente, depuración de bugs (rellena el reporte de bugs con datos reales), y base futura para replays.

### 5.4 Impacto en `partidas` (tabla de resultados existente)

Se mantiene igual. Al finalizar, `PartidaEnCurso` copia sus stats calculados **por el servidor** a `partidas` (o crea la fila directamente), conservando compatibilidad con rankings, comentarios y notificaciones.

---

## 6. API propuesta

### 6.1 Rutas

```php
// routes/api.php — dentro del grupo auth:sanctum
Route::prefix('partidas-en-curso')->group(function () {
    Route::post('/', [PartidaEnCursoController::class, 'store']);               // crear
    Route::get('/activa', [PartidaEnCursoController::class, 'activa']);         // reanudar
    Route::get('/{partida_en_curso}', [PartidaEnCursoController::class, 'show']); // snapshot
    Route::post('/{partida_en_curso}/acciones', [PartidaEnCursoController::class, 'accion']);
    Route::post('/{partida_en_curso}/tienda',    [PartidaEnCursoController::class, 'tienda']);
    Route::post('/{partida_en_curso}/finalizar', [PartidaEnCursoController::class, 'finalizar']);
});
```

### 6.2 Contratos

**Crear partida** — `POST /api/partidas-en-curso`

```jsonc
// request
{ "personaje_id": 3, "modificador_ids": [12, 31] }
// 201 response
{
  "id": 87,
  "seq": 0,
  "estado": { ...shape 5.2... },
  "catalogo": { "cartas": [...], "personajes": [...], "modificadores": [...] }
}
```

**Ejecutar una acción** — `POST /api/partidas-en-curso/{id}/acciones`

```jsonc
// request (intención, jamás resultado)
{ "seq": 14, "accion": "playCard", "payload": { "uid_carta": "c-3f2a" } }
{ "seq": 15, "accion": "scape" }
{ "seq": 16, "accion": "useAbility" }
{ "seq": 17, "accion": "startRound" }
{ "seq": 18, "accion": "continueAfterVictory" }

// 200 response
{
  "seq": 15,
  "estado": { ...nuevo estado... },
  "eventos": [                       // lo que el cliente debe animar
    { "tipo": "danio", "valor": 6, "destino": "jugador" },
    { "tipo": "muere_enemigo", "uid": "c-9b11", "oro": 5 },
    { "tipo": "logro", "codigo": "habilidad_guerrero" }
  ],
  "fin": null                        // | "victoria" | "derrota"
}

// 409 (fuera de orden) / 422 (intención inválida: sin huidas, oro insuficiente, carta no en mano)
// 410 (partida ya finalizada)
```

**Tienda** — `POST .../tienda` (separamos compra y cierre de ronda porque hoy la tienda es un componente con lógica propia: `GameShop.jsx`, precios con `boughtCards`, `refund`, `membership`, `amego`).

```jsonc
{ "accion": "comprar", "uid_carta": "..." }
{ "accion": "cerrar" }   // → devuelve la nueva ronda ya barajada
```

**Finalizar** — `POST .../finalizar` → crea `partidas`, dispara logros validados, devuelve `{ partida_id, logros: [...] }`.

### 6.3 Convención de respuestas

El repo no tiene envelope estándar. Para la API nueva se propone uno explícito (y solo para esta API, para no romper los endpoints existentes):

```jsonc
{ "ok": true,  "data": { ... } }
{ "ok": false, "error": { "code": "SIN_HUIDAS", "message": "No quedan huidas..." } }
```

Códigos: `200` acción aplicada · `201` creación · `403` no es tu partida · `404` inexistente · `409` `seq` fuera de orden o partida activa duplicada · `410` partida finalizada · `422` intención inválida (FormRequest) · `429` throttle anti-burst.

---

## 7. Reparto de responsabilidades (mapa de migración)

### 7.1 Migra al backend (regla de negocio)

| Bloque | Funciones actuales (GamePage) | Servicio destino | Fase |
|---|---|---|---|
| Combate y economía | `handleCombat` (L1463), `processCardAction` (L1610), `processDamageAndRevive`, recompensas de oro | `CombatResolver` | 2 |
| RNG (crítico, ruleta, carroñero, disfraz mímico, spawns) | `heal_roulete` (L404), `gambler` (L1179), crítico (L1478), `blacksmith` (L1599), `scavenger` | `RngService` + Resolvers | 2 |
| Efectos de carta (20) | `applyCardEffect` (L1267), `handleCardEffect`, `applyThorny/Plunder/ExtraGold/Mitosis/Souleater/Seal`, `weaponBreaker` | `CardEffectResolver` | 2 |
| Robo de mano y ticks por turno | `fillRoom` (L702) — veneno, anticura, progresivo, regenerador, roboalmas, sello | `TurnTicker` + `DeckBuilder` | 2 |
| Máquina de rondas y victoria | `startNewRound` (L1114), `continueFunction` (L1346), derrota por `health<=0` (L2046), interés | `RoundManager` | 3 |
| Minibosses (7) | `handleMiniboss` (L880), `handleCleanMinibosses`, `handleMinibossPillageQueen`, ramas de `processCardAction` | `MinibossResolver` | 3 |
| Habilidades y passivas | `warrior` (L471), `elf` (L502), `blacksmith` (L1599), `gambler` (L1179), `applyCharacterPassive` (L832), `ABILITY_HANDLERS` (L1808) | `AbilityResolver` | 3 |
| Huida | `scape` (L529), telaraña, tanatofobia (L2286), adrenalina (L2298) | `CombatResolver` | 3 |
| Modificadores (~35) | `applyEffect` (L1892), `handleModifierEvent` (L2032), `handleDeleteSuit/ Half/Covenant` | `ModifierResolver` | 4 |
| Tienda y economía | `GameShop.jsx` (precios ×1.25, `boughtCards`, `refund`, `membership`, `amego`), interés por ronda | `ShopService` | 4 |
| Generación de enemigos | `addEnemy`/`addEnemys` (L461-465), `enemyCardEffectList` de `MatchProvider` | `DeckBuilder` | 3 |
| Logros | `handleNewAchievement` (disparo client-side) → condiciones validadas en servidor | `AchievementService` | 4 |
| Persistencia/estadísticas | `endGame`/`updateActualGame` con `timeRef`, `totalEarnedGold`, `healedLife` | cierre en `finalizar` | 1 |
| Log de partida | ~60 `logsRef.push` | `EventLog` | 1 |

### 7.2 Permanece en el frontend (presentación)

- Render Konva completo (`Stage`/`Layer`/`Card`), `cardRefs`, `layerRef`.
- Drag & drop con hit-test de `WEAPON_ZONE` (`handleDragEnd` L1844) → se traduce en `playCard(uid)`.
- Animaciones (`healAnimation`, `damageAnimation`, `coinAnimation`, `moveCardToDiscard`) y `setTimeout` asociados → ahora disparadas por `eventos[]` de la respuesta.
- Layout responsive (`calculateLayout`, `resize`, `VIRTUAL_WIDTH`).
- Sonidos (`SettingsProvider`), tooltips, cursor, `ViewTransition`, hover del mazo.
- Historial/navegación (`popstate`, `pushState`, evento `interrumpirPartida`).
- Cronómetro visual: el cliente muestra, el servidor mide (`stats.tiempo_s`).
- Modal de confirmación, pantalla de error, reporte de bugs.

### 7.3 Cadena de reemplazo de un turno (antes → después)

```
ANTES (hoy):
  click carta → processCardAction() muta 10 useState + 15 useRef → Konva re-render
                → a veces POST /nuevo-logro → a veces endGame()

DESPUÉS:
  click carta → useGameAction.playCard(uid)
                → POST /acciones {seq}
                → servidor: lock → valida → resuelve → guarda → responde
                → cliente: setEstado(estado) + reproducir eventos[] con animación
                → si 409/422: rollback con GET snapshot
```

---

## 8. Núcleo del dominio en Laravel

### 8.1 Estructura de carpetas (sigue el patrón del repo)

```
back/src/app/
├── Http/Controllers/Api/PartidaEnCursoController.php
├── Http/Requests/PartidasEnCurso/
│   ├── StorePartidaEnCursoRequest.php
│   └── AccionPartidaEnCursoRequest.php
├── Models/PartidaEnCurso.php
│   └── Models/PartidaEnCursoEvento.php
└── Services/Engine/
    ├── MatchState.php
    ├── MatchRepository.php
    ├── RngService.php
    ├── DeckBuilder.php
    ├── CombatResolver.php
    ├── CardEffectResolver.php
    ├── AbilityResolver.php
    ├── MinibossResolver.php
    ├── ModifierResolver.php
    ├── TurnTicker.php
    ├── RoundManager.php
    ├── ShopService.php
    ├── AchievementService.php
    └── EventLog.php
```

> Hoy `app/Services/` solo contiene `DiscordReporteBugService.php`; `Engine/` es la primera capa de dominio real. Se recomienda **no** inyectar vía container (hoy `AppServiceProvider` está vacío y el patrón es instanciar a mano), pero sí diseñar clases con constructor explícito para poder testearlas con PHPUnit + SQLite `:memory:` (ya soportado en `phpunit.xml`).

### 8.2 Ejemplo: controlador delgado + pipeline de acción

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PartidasEnCurso\AccionPartidaEnCursoRequest;
use App\Models\PartidaEnCurso;
use App\Services\Engine\{ActionPipeline, MatchRepository};

class PartidaEnCursoController extends Controller
{
    public function accion(
        AccionPartidaEnCursoRequest $request,
        PartidaEnCurso $partida_en_curso,
        MatchRepository $repo,
        ActionPipeline $pipeline,
    ): \Illuminate\Http\JsonResponse {
        if ((int) $partida_en_curso->usuario_id !== (int) $request->user()->id) {
            return response()->json(['ok' => false, 'error' => ['code' => 'FORBIDDEN']], 403);
        }

        $data = $request->validated();

        // Transacción + bloqueo pessimista: dos clics rápidos no pisan el estado.
        $resultado = \DB::transaction(function () use ($repo, $pipeline, $partida_en_curso, $data) {
            $estado = $repo->lock($partida_en_curso);            // SELECT ... FOR UPDATE

            if ($data['seq'] <= $estado->seq) {
                return ['code' => 'OUT_OF_ORDER', 409];          // replay/duplicado
            }

            $nuevo = $pipeline->apply($estado, $data['accion'], $data['payload']);
            $repo->save($partida_en_curso, $nuevo, $data);

            return $nuevo;
        });

        if (isset($resultado['code'])) {
            return response()->json(['ok' => false, 'error' => ['code' => $resultado['code']]], $resultado[1]);
        }

        return response()->json([
            'ok' => true,
            'data' => [
                'seq' => $resultado->seq,
                'estado' => $resultado->toArray(),
                'eventos' => $resultado->eventos,
                'fin' => $resultado->fin,
            ],
        ]);
    }
}
```

### 8.3 Ejemplo: `CombatResolver` (porting de `handleCombat`, L1463-1592)

```php
final class CombatResolver
{
    public function __construct(
        private RngService $rng,
        private CardEffectResolver $efectos,
        private EventLog $log,
    ) {}

    /**
     * Resuelve un combate arma-vs-enemigo.
     * Reglas portadas de GamePage::handleCombat y BibliMecanicas.md:670-692.
     */
    public function resolver(MatchState $s, CardDTO $enemigo, CardDTO $arma): void
    {
        // 1. Domador: convierte el enemigo en arma en vez de combatir.
        if ($s->personaje->codigo === 'domador' && $s->efectos['tameando']) { ... }

        // 2. Crítico (siempre servidor).
        $critico = $arma && $this->rng->chance($s->efectos['probabilidad_critica'] / 100);

        // 3. Daño del enemigo al jugador (nunca < 0 — BibliMecanicas).
        $danoEnemigo = max(0, (int) floor($enemigo->valor * $s->efectos['mult_dano_enemigo'])
            + $s->efectos['dano_extra_enemigo'] - $s->efectos['reduccion_dano']);

        if ($arma === null) {
            $this->aplicarDanioJugador($s, $danoEnemigo);          // rama "sin arma"
        } else {
            $dano = (int) round(
                ($arma->valor + $s->efectos['dano_extra'] + $s->efectos['dano_permanente'])
                * $s->efectos['mult_dano_jugador'] * ($critico ? 1.5 : 1.0)
            );
            // Degradación Scoundrel + pentakill + ricochet + robo de vida con tope...
            // → mismas fórmulas que hoy, pero en un sitio testeable.
        }

        // 4. Revive / Ángel guardián / clamp de vida → $this->log->push(...)
    }
}
```

### 8.4 `RngService` (semilla verificable)

```php
final class RngService
{
    private int $cursor;

    public function __construct(private int $seed, int $cursor = 0) { $this->cursor = $cursor; }

    /** Devuelve un float 0-1 determinista para la posición actual. */
    public function next(): float
    {
        // 64-bit mix (p. ej. splitmix64 sobre el seed + cursor) sin depender de mt_srand global.
        $x = ($this->seed + ++$this->cursor) * 0x9E3779B97F4A7C15;
        $x = ($x ^ ($x >> 30)) * 0xBF58476D1CE4E5B9;
        return (($x ^ ($x >> 27)) & 0xFFFFFFFF) / 0xFFFFFFFF;
    }

    public function chance(float $p): bool  { return $this->next() < $p; }
    public function int(int $min, int $max): int { return $min + (int) floor($this->next() * ($max - $min + 1)); }
    public function shuffle(array $a): array { /* Fisher-Yates usando next() */ }
    public function cursor(): int { return $this->cursor; }  // se persiste en rng_cursor
}
```

Esto elimina todos los `Math.random()`/`lodash.shuffle` del cliente y hace que una partida sea **reproducible** a partir de `(seed, secuencia de intenciones)`.

### 8.5 Ciclo de vida de una acción (`ActionPipeline`)

```
1. Validar FormRequest          (estructura)
2. Resolver partida + usuario   (403/404/410)
3. DB::transaction
   a. SELECT ... FOR UPDATE     (MatchRepository::lock)
   b. comparar seq              (409 si <=)
   c. dispatch por acción:
        playCard      → palo → CardEffect | Combat | Weapon | Miniboss
        scape         → valida huidas/telaraña → devuelve cartas al mazo
        useAbility    → valida coste/sello/usos → AbilityResolver
        startRound    → RoundManager (victoria? tienda? interés? enemigos? miniboss?)
   d. TurnTicker (si aplica: veneno, anticura, progresivo...)
   e. AchievementService::evaluar()  → logros validados server-side
   f. persistir estado_juego + evento + rng_cursor
4. Devolver snapshot + eventos[] + fin
```

---

## 9. Estrategia de migración por fases

> Regla de cada fase: **el juego sigue siendo jugable de principio a fin en producción**. Se avanza por dentro (capa de dominio) y solo se "corta" el cable cuando una mecánica está cubierta por tests.

### Fase 0 — Cimientos (≈3-4 días)
- Corregir los bugs de §2.4 (shuffle sin args, `await` faltante, funciones inexistentes de `useUser`, cerrar CRUD públicos).
- Añadir interceptor de respuesta en `api.js` (401 global → logout, manejo de `error.code`).
- Crear migración `partidas_en_curso` + `partidas_en_curso_eventos`, modelos, rutas vacías y FormRequests.
- `php artisan make:test` con una suite base en SQLite `:memory:`.
- **Salida:** endpoints respondiendo, tablas creadas, CI de deploy no rota.

### Fase 1 — Puente: partida viva y cierre servidor (≈4-5 días)
- `POST /partidas-en-curso` crea la partida **antes** de jugar; `GET /activa` permite reanudar tras F5 (hoy se pierde todo).
- El cliente sigue calculando, pero `endGame` deja de enviar stats "a ciegas": el servidor guarda `estado_juego` con cada checkpoint (o al final) y **calculará** `tiempo`, `rondas`, `oro_obtenido`, `vida_curada`, `enemigos_enfrentados` a partir de su propio estado.
- Logros: `POST /nuevo-logro` pasa a validar la condición en servidor (deja de aceptar cualquier `incremento`).
- **Salida:** rankings y logros ya no confían en el cliente; reanudación funcionando.

### Fase 2 — Migrar el núcleo del turno (≈2-3 semanas)
- Portar al backend: `RngService`, `DeckBuilder`, `CombatResolver`, `CardEffectResolver`, `TurnTicker`.
- Nuevo modo de juego "server-authoritative" tras **feature flag** (`config/game.php` o `modificadores` de tester: `is_tester` ya existe en `usuarios`).
- `GamePage` deja de mutar estado local en `processCardAction` y pasa a `useGameAction()`; Konva renderiza el `estado` devuelto.
- Tests: combate (con/sin arma, degradación, crítico, lifesteal con tope, revive, daño nunca < 0), los 20 efectos de carta, ticks de turno.
- **Salida:** un personaje (p. ej. Guerrero) jugable de punta a punta contra el servidor con flag activo.

### Fase 3 — Rondas, habilidades, huida y minibosses (≈2 semanas)
- Portar `RoundManager`, `AbilityResolver`, `MinibossResolver`, generación de enemigos con sus probabilidades de efecto.
- Tienda: queda fuera por ahora; la ronda se cierra en `startRound` con el interés aplicado por servidor.
- Tests: fórmula de enemigos `5 + floor(((ronda-1) % 2.5) * 2)`, miniboss cada 5 rondas (no múltiplos de 10), las 8 habilidades con sus costes, huidas y telaraña.
- **Salida:** partida completa con todos los personajes.

### Fase 4 — Modificadores, tienda y logros (≈1-2 semanas)
- Portar `ModifierResolver` (~35 efectos) y `ShopService` (precios ×1.25, `refund`, `membership`, `amego`).
- Selección de modificadores (1 de 3 con probabilidades de nivel) movida al servidor.
- Logros evaluados en `EventLog`/`AchievementService`.
- **Salida:**-feature flag apagado para todos; el cliente ya no calcula nada relevante.

### Fase 5 — Limpieza (≈3-4 días)
- Borrar de `GamePage.jsx` la lógica migrada (se estima que el archivo baja de ~2.900 a ~900-1.100 líneas: render + input + animación).
- `MatchProvider` deja de generar mazos/enemigos (`enemyCardEffectList`, `startNewGame`, `getWeapon`... pasan a catálogo puro).
- Reporte de bugs rellena el `EventLog` real en vez de un JSON improvisado.
- Documentar la API (aunque no hay OpenAPI en el repo: añadir al menos esta carpeta `docs/`).

**Esfuerzo total estimado: 6-8 semanas** con una persona, o ~4 si se ataca en paralelo front/back.

### Orden de ataque recomendado por valor/riesgo

```
Fase 0 (sin esto nada)  →  Fase 1 (cierra el agujero de anti-cheat más barato)
→  Fase 2 (el 70% del valor)  →  3  →  4  →  5
```

---

## 10. Cambios en el frontend

### 10.1 Nuevos hooks

```js
// front/src/hooks/useGame.js
export function useGameState(partidaId) {
  return useQuery({
    queryKey: ['partida-en-curso', partidaId],
    queryFn: async () => (await api.get(`/partidas-en-curso/${partidaId}`)).data.data,
    staleTime: 0,                    // el servidor es la fuente
    refetchOnWindowFocus: true,
  });
}

export function useGameAction(partidaId) {
  const qc = useQueryClient();
  const seqRef = useRef(0);

  return useMutation({
    mutationFn: async (accion, payload) => {
      const { data } = await api.post(`/partidas-en-curso/${partidaId}/acciones`, {
        seq: ++seqRef.current, accion, payload,
      });
      return data.data;
    },
    onSuccess: ({ estado, eventos, fin }) => {
      qc.setQueryData(['partida-en-curso', partidaId], estado);
      eventBus.emit(eventos);        // animaciones, sonidos, logros
      if (fin) showEndScreen(fin);
    },
    onError: (err) => {
      if (err.response?.status === 409) qc.invalidateQueries(['partida-en-curso', partidaId]); // resync
      // 422 → toast "acción no válida" + rollback optimista
    },
  });
}
```

### 10.2 `GamePage.jsx` tras la migración

| Hoy | Después |
|---|---|
| ~60 `useState` de estado de juego | `const { data: estado } = useGameState(id)` |
| ~90 `useRef` de buffs/efectos | dentro de `estado.efectos` (servidor) |
| `processCardAction` (194 líneas) | `accion.mutate('playCard', { uid })` |
| `handleCombat`, `handleHeal`, `handleWeapon` | borrados; se animan desde `eventos[]` |
| `fillRoom` con `setTimeout(150*i)` | el servidor reparte la mano; el cliente **escenifica** el retardo |
| `endGame` con 4 protecciones `gameSavedRef` | `POST .../finalizar` idempotente en servidor |
| `Math.random()` en 8 sitios | ninguno |

Se conservan en GamePage: `layout`, Konva, drag, animaciones, sonidos, tooltips, historial, modal de salida, cronómetro visual, `try/catch` de render.

### 10.3 Sincronización y casos borde

- **Doble clic / lag:** bloqueo `canBeClicked` local *y* `seq` del servidor (ambos).
- **F5 / cerrar pestaña:** `GET /activa` reanuda el estado (nueva ventaja sobre hoy, donde se pierde la partida).
- **Dos pestañas:** `unique(usuario_id, estado)` en BD → la segunda recibe `409`.
- **Desfase de animación:** el estado se aplica al instante; las animaciones se reproducen por evento con cola, sin bloquear la lógica.
- **Sin conexión:** retry de react-query; si el servidor ya aplicó la acción (409 con el mismo `seq`), se descarta en silencio.
- **Tiempo:** el servidor mide con `iniciada_at`/`finalizada_at`; el HUD solo formatea.

---

## 11. Testing

| Nivel | Qué | Herramienta |
|---|---|---|
| Unitario de dominio | Un test por Resolver: cada efecto, cada habilidad, cada miniboss, fórmulas de `BibliMecanicas.md` | PHPUnit + `RngService` con seed fija |
| Feature de API | `POST /acciones` happy path, `409` seq, `403` de otro usuario, `410` partida cerrada, `422` payload inválido | PHPUnit Feature (SQLite `:memory:` ya configurado) |
| Propiedad | "la vida nunca sale de `[0, vida_max]`", "el daño recibido nunca < 0", "el oro nunca negativo" | PHPUnit + casos parametrizados |
| Regresión visual | El render de Konva no cambia con el nuevo estado | (no hay E2E hoy; opcional: Playwright solo para smoke de `/jugar`) |
| Anti-cheat | Intentar mandar `payload.dano = 999` o reenviar un `seq` antiguo → rechazado | Feature test |

Hoy solo hay `tests/Feature/ExampleTest.php`: la suite nueva es el activo más importante de la fase 0/2, porque **es** la red de seguridad de esta migración.

---

## 12. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Regresión de reglas al portar 2.900 líneas | Alto | Fases + tests por Resolver + feature flag `is_tester`; mantener el código viejo hasta parity |
| Doble implementación durante la transición (front y back calculando) | Medio | Flag único por partida (`estado.modo`), no mezclar mecánicas a medias en una misma partida |
| Latencia percibida en acciones | Medio | Acción ≈1 request; animar tras respuesta; prefetch y optimistic UI solo para acciones seguras |
| Deploy rompe partidas activas | Alto | `estado_juego.version` + migrador de estado (`v1 → v2`) o cierre forzado de partidas antiguas al desplegar |
| CI despliega a `master` con `migrate --force` + seeders | Medio | Migraciones aditativas e idempotentes; **no** editar valores de seeders existentes (se sobrescriben en prod) |
| Sin worker de colas en docker | Bajo | No usar colas en el camino caliente de partida |
| Bloqueos MySQL por escritura frecuente | Bajo | 1 fila por partida, transacción corta; si duele, pasar a Redis para el estado con write-behind |
| Latencia del TFG/mantenimiento (es un proyecto académico) | Medio | Mantener el documento `docs/` y los tests como fuente de verdad |

---

## 13. Checklist de implementación

- [ ] **Fase 0**
  - [ ] Fix `GamePage.jsx:1878` (`shuffleDeck` sin argumento)
  - [ ] Fix `GamePage.jsx:1838` (`await getWeapon`)
  - [ ] Fix `useUser.js` (`getNotificaciones`, `requestMatch`)
  - [ ] Cerrar escritura de CRUD públicos (`routes/api.php:84-97`) o moverlos a admin
  - [ ] Interceptor de respuesta en `front/src/api/api.js`
  - [ ] Migración `partidas_en_curso` + `partidas_en_curso_eventos`
  - [ ] `PartidaEnCursoController` + FormRequests + rutas
  - [ ] Suite PHPUnit base en SQLite
- [ ] **Fase 1**
  - [ ] `POST /partidas-en-curso`, `GET /activa`, reanudación tras F5
  - [ ] Cierre de partida con stats calculadas por servidor
  - [ ] `POST /nuevo-logro` valida condiciones
- [ ] **Fase 2**
  - [ ] `RngService` con semilla + tests deterministas
  - [ ] `DeckBuilder`, `CombatResolver`, `CardEffectResolver`, `TurnTicker`
  - [ ] `useGameState` / `useGameAction` en front
  - [ ] `processCardAction` delega al servidor bajo flag
- [ ] **Fase 3**: `RoundManager`, `AbilityResolver`, `MinibossResolver`, huida
- [ ] **Fase 4**: `ModifierResolver`, `ShopService`, logros server-side
- [ ] **Fase 5**: purga de `GamePage.jsx`, `MatchProvider` solo catálogo, docs

---

## 14. Referencias internas

- `front/src/components/pages/GamePage.jsx` — origen de toda la lógica portada.
- `front/src/context/MatchProvider.jsx` — composición de mazo/catálogos/logros.
- `front/src/api/api.js`, `front/src/hooks/*.js` — capa de red existente.
- `back/src/routes/api.php`, `back/src/app/Http/Controllers/Api/` — convenciones a seguir.
- `back/src/database/seeders/{Cartas,Minibosses,Habilidades,Personajes,Modificadores,Logros}.php` — fuente de datos de reglas.
- `BibliMecanicas.md` — especificación de reglas (combate L670-692, enemigos L6-77, tienda L699-729, modificadores L354-667).
- `README.md` — estructura, convenciones de ramas (`feature/*` desde `develope`) y despliegue.
- `.github/workflows/deploy.yml` — despliegue automático en `master` con `migrate --force` y seeders.
