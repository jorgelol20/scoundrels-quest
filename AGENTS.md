# AGENTS.md — Scoundrel's Quest

> Normas innegociables: `docs/constitution.md` (7 principios + verificación). Este archivo es el detalle operativo: rutas, firmas, ejemplos y pendientes.

## Stack y estructura

- **Front:** React 19 + Vite 8 + pnpm (`front/`). Libs: `react-router-dom`, `react-konva/konva`, `axios + @tanstack/react-query`, `i18next`, `lodash` (norma: principio 1).
- **Back:** Laravel (`back/src/`), Sanctum, MySQL 8, Caddy + Docker (`back/docker-compose.yml`, `back/Caddyfile`).
- **Arranque:** `start-dev.bat` (Windows) / `start-dev.sh` (Linux/Mac). Manual: `pnpm run dev` en `front/`, `docker compose up -d --build` en `back/`, luego en PHP `php artisan migrate`, `php artisan optimize`, `php artisan storage:link`. Front en `http://localhost:5174`.
- **Fuente de verdad de mecánicas:** `SCOUNDRELSQUEST.md` (cartas, personajes, habilidades, modificadores, combate, tienda, minibosses, salida/derrotas). Ante discrepancia con el código: ver principio 2.

***Nota:*** **Comprueba al documentación que necesites con Context7**

Estructura de referencia: `back/src/` (`app/Http/Controllers/Api/`, `app/Http/Requests/{Cartas,Habilidades,Modificadores,Partidas,Personajes,Usuarios,Logros}/`, `app/Models/`, `routes/`, `database/{factories,migrations,seeders}/`, `storage/app/{private,public/...}`) y `front/src/` (`api/`, `components/{pages,structure}/`, `context/`, `game/` + `__tests__/`, `hooks/game/`, `i18n/`, `locales/{es,en}/`). El código es la fuente de verdad de la estructura.

## Convenciones

- Código comentado con JSDoc (front) y PHPDoc (backend).
- Ramas `feature/funcionalidad` o `fix/arreglo` desde `develope`, luego pull request. Ver `README.md` (Contribución).
- Documentación automática: sustituir `github` por `deepwiki` en la URL del repo.

### Arquitectura del juego (front)

`front/src/components/pages/GamePage.jsx` (componente monolítico, ~3k líneas) se está
refactorizando a 3 capas. Estado y reglas reales del código:

#### Las 3 capas

| Capa | Ruta | Rol |
|------|------|-----|
| 1. Lógica pura | `front/src/game/` (`utils.js`, `cardEffects.js`, `modifiers.js`) | Funciones puras `(estado, params) => resultado`, sin React. Testeables con vitest en `front/src/game/__tests__/` |
| 2. Adaptadores React | `front/src/hooks/game/` (`useScheduledTimeouts.js`) + adaptador fino en `GamePage.jsx` | Conectan la lógica pura con `useState`/`useRef`/contexto (`MatchProvider.jsx`). El adaptador construye un snapshot plano, llama a la función pura, aplica el `state` resultante y ejecuta los `events` devueltos con las funciones existentes |
| 3. Vista | `front/src/components/` | Render tonto (JSX). No decide reglas |

Patrón de las funciones puras: `(state, effect, extra) => { state, handled, events }`.
Los casos aritméticos/booleanos devuelven el siguiente estado; los casos con efectos
secundarios (animaciones, oro, mazo, contexto) devuelven `events` que ejecuta el adaptador.
`CARD_EFFECT_DEFAULTS` y `MODIFIER_DEFAULTS` definen el snapshot plano de entrada.

Restricciones de capas: ver principio 3. Detalle operativo:

- Timeouts solo vía `useScheduledTimeouts` (`scheduleTimeout` / `cancelTimeout` /
  `clearScheduledTimeouts`): se registran en un `Set` y se limpian al reiniciar o desmontar
  (evita `setState` tras desmontar y timeouts huérfanos).

#### Estado de la migración

- **Fase 0 hecha**: `uid` → `game/utils.js`; timers → `hooks/game/useScheduledTimeouts.js`.
- **Fase 1 hecha**: `cardEffects.js` (`applyCardEffectToState`) y `modifiers.js`
  (`applyModifierToState`) puros, con tests en `game/__tests__/` y adaptador fino en
  `GamePage.jsx` (sin cambios de comportamiento).
- **Fase 2+ en curso**: `GamePage.jsx` sigue siendo el dueño del estado y de los efectos
  secundarios; `MatchProvider.jsx` aún contiene azar/mazo (`Math.random`, `lodash.shuffle`).
  No existe todavía `components/pages/game/`.

#### Cómo añadir una regla nueva

1. Función pura en `front/src/game/` (p. ej. en `cardEffects.js` o fichero nuevo):
```js
export const applyMyRuleToState = (state, effect) => {
    if (effect?.name !== 'my_rule') return { state, handled: false, events: [] };
    return { state: { ...state, myFlag: true }, handled: true, events: [] };
    // Si necesita azar/DOM/contexto: devolver { type: '...', ... } en events
    // y ejecutarlo en el adaptador, nunca en game/.
};
```
2. Test en `front/src/game/__tests__/myRule.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { applyMyRuleToState } from '../cardEffects.js';

describe('applyMyRuleToState', () => {
    it('marca myFlag', () => {
        const { state, handled } = applyMyRuleToState({}, { name: 'my_rule' });
        expect(handled).toBe(true);
        expect(state.myFlag).toBe(true);
    });
});
```
3. Adaptador fino en `GamePage.jsx`: construir el snapshot, llamar a la función pura,
   aplicar el `state` con los setters existentes y ejecutar cada `event` con las funciones
   ya disponibles.

### Idiomas (i18n) — es / en

Norma de paridad y alcance: ver principio 6. Detalle operativo:

| Pieza | Ruta | Rol |
|-------|------|-----|
| Init | `front/src/i18n/index.js` | Registra idiomas y namespaces (fuente de verdad: añadir un namespace aquí y en el test) |
| Detección | `front/src/i18n/detector.js` | `?lang=` > `localStorage['sq_locale']` > `user.locale` > `navigator` (español si empieza por `es`) > `en` (inglés por defecto) |
| Formato | `front/src/i18n/format.js` | `fmtDate` / `fmtNum` / `fmtRel` parametrizados por locale (reemplazan a `toLocaleDateString('es-ES')`) |
| Estado | `front/src/context/SettingsProvider.jsx` | `locale` + `changeLocale()` (en caliente, persiste en localStorage y en `users.locale`) |
| Backend | `back/src/app/Http/Middleware/SetLocale.php` | Resuelve locale por `Accept-Language` (que envía `front/src/api/api.js`) o `users.locale`; responde `Content-Language` |

Alcance (no se traduce): contenido de usuario (nicks, comentarios, reportes), datos de
la API que aún no tienen i18n en backend (cartas, personajes, habilidades,
logros, `dialogs.json`, `missions.json`) ni logs de `console`.

Tests que lo vigilan:

- `src/i18n/__tests__/locales.test.js`: paridad de claves es/en, mismas
  variables `{{var}}` y ningún valor con HTML.
- `src/i18n/__tests__/keys-used.test.js`: toda clave `t('...')` usada en el
  código existe en es y en.
- `src/testSetup.js`: inicializa i18n en `es` para los tests de componentes.

Pendiente (fases siguientes): i18n de contenido en el backend (columna JSON de
traducciones + seeders bilingües), `lang/{es,en}` para validaciones y emails, y
los ~70 logs de `GamePage.jsx`.

## Datos

Norma de protección: ver principio 5. Detalle operativo:

- Rankings públicos (`ranking-victorias`, `ranking-rondas`, `ranking-partidas`).
- Contenido del juego (cartas, personajes, habilidades, modificadores, partidas): lectura pública en `index/show`, escritura solo con `auth:sanctum` + `admin` (ver `back/src/routes/api.php`).
- `POST /partidas` exige sesión y toma la identidad del token. Salir sin personaje no guarda nada; salir con personaje o recargar/cerrar cuenta como derrota (`victoria: false`, vía `fetch keepalive`, sin logros). No duplicar el registro al recargar tras el fin.
- Registro/login/OAuth bajo `throttle`.

## Forma de trabajar

- Cambios pequeños y localizados; no reescribir `GamePage.jsx` ni `MatchProvider.jsx` de golpe (ver principio 7).
- Si una mecánica de `SCOUNDRELSQUEST.md` contradice al código: ver principio 2.

## Agentes (`.opencode/agents/`)

- `coordinator.md` (primary, solo lectura): elige el comando que mejor ajuste (`/spec`, `/feature`, `/personaje` u otros futuros), reparte entre `planner`/`implementer`/`reviewer` y exige aprobación de spec y de plan+tasks. Flujo SDD en `specs/NNN-slug/` (`spec.md` + `plan.md` + `tasks.md`).
- `planner.md` / `reviewer.md` (subagentes, solo lectura): el planner redacta spec EARS + plan/tasks por capas; el reviewer valida RF por RF (capas, tests, datos, idioma) con veredicto `OK` / `CAMBIOS NECESARIOS` (máx. 2 vueltas).
- `implementer.md` (subagente): una tarea por llamada, patrón `(state, effect, extra) => { state, handled, events }` + test en `__tests__/`; `pnpm test` en verde; back sin comandos automatizados.

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 


## Límites

> Norma completa: `docs/constitution.md` (principios 1–7). Aquí solo el detalle de cuándo preguntar.

- ⚠️ Pregunta antes: cambios de balance (daños, precios de tienda `calculateWeaponPrice`/`calculateHealPrice`, probabilidades de modificadores), nuevas dependencias, migraciones/seeders, tocar auth/roles/throttle o `routes/api.php`.

## Verificación

- Front: Utiliza las chrome-dev-tools
- Backend: Sin comandos automatizados.
