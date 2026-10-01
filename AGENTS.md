# AGENTS.md — Scoundrel's Quest

## Stack y estructura

- **Front:** React 19 + Vite 8 + pnpm (`front/`). Libs: `react-router-dom`, `react-konva/konva`, `axios + @tanstack/react-query`, `i18next`, `lodash`.
- **Back:** Laravel (`back/src/`), Sanctum, MySQL 8, Caddy + Docker (`back/docker-compose.yml`, `back/Caddyfile`).
- **Arranque:** `start-dev.bat` (Windows) / `start-dev.sh` (Linux/Mac). Manual: `pnpm run dev` en `front/`, `docker compose up -d --build` en `back/`, luego en PHP `php artisan migrate`, `php artisan optimize`, `php artisan storage:link`. Front en `http://localhost:5174`.
- **Fuente de verdad de mecánicas:** `SCOUNDRELSQUEST.md` (cartas, personajes, habilidades, modificadores, combate, tienda, minibosses, salida/derrotas). Si código y doc discrepan, repórtalo y no cambies el balance sin preguntar.

### Backend

```
back/
+---Caddyfile
+---docker-compose.yml
+---php/
    +---docker-entrypoint.sh
    +---Dockerfile
    \---uploads.ini
\---src/
    +---app/
    |   +---Console/
    |   |   \---Commands/
    |   +---Http/
    |   |   +---Controllers/
    |   |   |   \---Api/
    |   |   \---Requests/
    |   |       +---Cartas/
    |   |       +---Habilidades/
    |   |       +---Modificadores/
    |   |       +---Partidas/
    |   |       +---Personajes/
    |   |       +---Usuarios/
    |   |       \---Logros/
    |   +---Models/
    |   \---Providers/
    +---bootstrap/
    +---config/
    +---database/
    |   +---factories/
    |   +---migrations/
    |   \---seeders/
    +---public/
    +---resources/
    |   +---css/
    |   +---js/
    |   \---views/
    +---routes/
    +---storage/
    |   +---app/
    |   |   +---private/
    |   |   \---public/
    |   |       +---cartas/
    |   |       +---habilidades/
    |   |       +---modificadores/
    |   |       +---personajes/
    |   |       +---usuarios/
    |   |        \---logros/
    |   +---framework/
    |   |   +---cache/
    |   |   |   \---data/
    |   |   +---sessions/
    |   |   +---testing/
    |   |   \---views/
    |   \---logs/
    +---tests/
    +---.env
    \---vendor/
```

### Frontend

```
front/
+--- node_modules/
+---dist/
+---public/
|   +---font/
|   +---images/
|   |   +---animations/
|   |   +---cardEffects/
|   |   +---cursor/
|   |   \---shopman/
|   \---sounds/
|       \---music/
+---.env
+---index.html
+---package.json
+---vite.config.js
\---src/
    +---api/
    +---assets/
    |   \---database
    +---components/
    |   +---pages/
    |   \---structure/
    +---context/
    +---game/                      # lógica pura (ver "Arquitectura del juego")
    |   +---utils.js               # uid()
    |   +---cardEffects.js         # applyCardEffectToState()
    |   +---modifiers.js           # applyModifierToState()
    |   \---__tests__/             # tests vitest
    \---hooks/
        \---game/
            \---useScheduledTimeouts.js  # timers cancelables
```

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

#### Reglas

- `game/` sin React/JSX/`setTimeout`/`document` ni imports de contexto. Sin `Math.random`
  en las reglas (`cardEffects`/`modifiers` delegan el azar al adaptador vía `events`);
  única excepción: el fallback de `uid()` en `game/utils.js` (`crypto.randomUUID()` primero).
- `components/` sin `Math.random` nuevo ni mutación de refs ajenas.
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

Toda la UI del front vive en `front/src/locales/{es,en}/<namespace>.json`
(16 namespaces, ~1200 claves, paridad 1:1 verificada por tests). No se escribe
texto visible en los componentes: se usa `useTranslation('<ns>')` + `t('clave')`.

| Pieza | Ruta | Rol |
|-------|------|-----|
| Init | `front/src/i18n/index.js` | Registra idiomas y namespaces (fuente de verdad: añadir un namespace aquí y en el test) |
| Detección | `front/src/i18n/detector.js` | `?lang=` > `localStorage['sq_locale']` > `user.locale` > `navigator` (español si empieza por `es`) > `en` (inglés por defecto) |
| Formato | `front/src/i18n/format.js` | `fmtDate` / `fmtNum` / `fmtRel` parametrizados por locale (reemplazan a `toLocaleDateString('es-ES')`) |
| Estado | `front/src/context/SettingsProvider.jsx` | `locale` + `changeLocale()` (en caliente, persiste en localStorage y en `users.locale`) |
| Backend | `back/src/app/Http/Middleware/SetLocale.php` | Resuelve locale por `Accept-Language` (que envía `front/src/api/api.js`) o `users.locale`; responde `Content-Language` |

Reglas para no romper la paridad:

- Claves jerárquicas estables y semánticas (`game.hud.round`), nunca el texto como clave.
- Sin HTML dentro de los JSON: si el texto lleva `<strong>`/`<br/>`, se parte en
  varias claves (`p1a` / `p1b`) y las etiquetas se quedan en el JSX.
- Fechas y plurales: `fmtDate(i18n.language, ...)` y claves `_one` / `_other`
  (nunca `minuto/minutos` a mano).
- `game/` (lógica pura) nunca llama a `t()`: devuelve claves o códigos.
- No se traducen: contenido de usuario (nicks, comentarios, reportes), datos de
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

- Rankings públicos (`ranking-victorias`, `ranking-rondas`, `ranking-partidas`) sin `email` (PII).
- Contenido del juego (cartas, personajes, habilidades, modificadores, partidas): lectura pública en `index/show`, escritura solo con `auth:sanctum` + `admin` (ver `back/src/routes/api.php`).
- `POST /partidas` exige sesión y toma la identidad del token. Salir sin personaje no guarda nada; salir con personaje o recargar/cerrar cuenta como derrota (`victoria: false`, vía `fetch keepalive`, sin logros). No duplicar el registro al recargar tras el fin.
- Registro/login/OAuth bajo `throttle`. No subir `.env` ni secretos al repo.

## Forma de trabajar

- Cambios pequeños y localizados; no reescribir `GamePage.jsx` ni `MatchProvider.jsx` de golpe.
- Si una mecánica de `SCOUNDRELSQUEST.md` contradice al código, parar y preguntar antes de "arreglarlo".

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
- ✅ Siempre: respetar la arquitectura de 3 capas, la paridad i18n es/en y las reglas de `SCOUNDRELSQUEST.md`.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea. 
- ⚠️ Pregunta antes: cambios de balance (daños, precios de tienda `calculateWeaponPrice`/`calculateHealPrice`, probabilidades de modificadores), nuevas dependencias, migraciones/seeders, tocar auth/roles/throttle o `routes/api.php`.
- 🚫 Nunca: subir `.env`/secretos, `Math.random` nuevo en `game/` o `components/`, `setTimeout` crudo fuera de `useScheduledTimeouts`, mutar refs ajenas, texto visible hardcodeado en JSX, exponer `email` en endpoints públicos.

## Verificación

- Sin comandos de verificación automatizada. Verificación manual.
