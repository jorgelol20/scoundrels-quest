# Nombre del proyecto
Scoundrel's Quest - Juego Roguelike de cartas Web. **(TOTALMENTE GRATIS)**

## Funcionalidades
**Scoundrel's Quest** se trata de un juego web desarrollado como trabajo de fin de grado para el curso de 2º de DAW (2025/2026) de IES Enric Valor Monóvar y que sigue en desarrollo activo tras la finalización del grado.

## Requisitos previos
- Docker instalado localmente.
- Node V.24.* o superior.
- `.env` [Contactame para solicitarlos](mailto:jorgejorgemonovar@gmail.com) o crear a partir de `.env_exaple`

## Ejecutar el proyecto en local
### Windows
1. Clonar el repositorio
2. Ejecutar el `start-dev.bat` que se encuentra en la raiz del repositorio
---
### Linux/Mac
1. Clonar el repositorio
2. Ejecutar el `start-dev.sh` que se encuentra en la raiz del repositorio
---
### Manualmente
1. Clonar el repositorio
2. Ejecutar `pnpm run dev` dentro de la carpeta **/front**.
3. Levantar los contenedores desde la carpeta **/back** con `docker compose up -d --build`.
4. Acceder al contenedor de **PHP** y ejecutar los siguientes comandos:
    - `php artisan migrate`
    - `php artisan optimize`
    - `php artisan storage:link`
---

## Uso
### Local
Acceder a [http://localhost:5174](http://localhost:5174)
### Producción
Acceder a [Scoundrel's Quest](scoundrels-quest.com)

## Estructura del Proyecto

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

## Arquitectura del juego (front)

`front/src/components/pages/GamePage.jsx` (componente monolítico, ~3k líneas) se está
refactorizando a 3 capas. Estado y reglas reales del código:

### Las 3 capas

| Capa | Ruta | Rol |
|------|------|-----|
| 1. Lógica pura | `front/src/game/` (`utils.js`, `cardEffects.js`, `modifiers.js`) | Funciones puras `(estado, params) => resultado`, sin React. Testeables con vitest en `front/src/game/__tests__/` |
| 2. Adaptadores React | `front/src/hooks/game/` (`useScheduledTimeouts.js`) + adaptador fino en `GamePage.jsx` | Conectan la lógica pura con `useState`/`useRef`/contexto (`MatchProvider.jsx`). El adaptador construye un snapshot plano, llama a la función pura, aplica el `state` resultante y ejecuta los `events` devueltos con las funciones existentes |
| 3. Vista | `front/src/components/` | Render tonto (JSX). No decide reglas |

Patrón de las funciones puras: `(state, effect, extra) => { state, handled, events }`.
Los casos aritméticos/booleanos devuelven el siguiente estado; los casos con efectos
secundarios (animaciones, oro, mazo, contexto) devuelven `events` que ejecuta el adaptador.
`CARD_EFFECT_DEFAULTS` y `MODIFIER_DEFAULTS` definen el snapshot plano de entrada.

### Reglas

- `game/` sin React/JSX/`setTimeout`/`document` ni imports de contexto. Sin `Math.random`
  en las reglas (`cardEffects`/`modifiers` delegan el azar al adaptador vía `events`);
  única excepción: el fallback de `uid()` en `game/utils.js` (`crypto.randomUUID()` primero).
- `components/` sin `Math.random` nuevo ni mutación de refs ajenas.
- Timeouts solo vía `useScheduledTimeouts` (`scheduleTimeout` / `cancelTimeout` /
  `clearScheduledTimeouts`): se registran en un `Set` y se limpian al reiniciar o desmontar
  (evita `setState` tras desmontar y timeouts huérfanos).
- Tests con `pnpm --dir front run test` (equivale a `vitest run` en `front/`).

### Estado de la migración

- **Fase 0 hecha**: `uid` → `game/utils.js`; timers → `hooks/game/useScheduledTimeouts.js`.
- **Fase 1 hecha**: `cardEffects.js` (`applyCardEffectToState`) y `modifiers.js`
  (`applyModifierToState`) puros, con tests en `game/__tests__/` y adaptador fino en
  `GamePage.jsx` (sin cambios de comportamiento).
- **Fase 2+ en curso**: `GamePage.jsx` sigue siendo el dueño del estado y de los efectos
  secundarios; `MatchProvider.jsx` aún contiene azar/mazo (`Math.random`, `lodash.shuffle`).
  No existe todavía `components/pages/game/`.

### Cómo añadir una regla nueva

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
   ya disponibles. Verificar con `pnpm --dir front run test`.

## Idiomas (i18n) — es / en

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

Reglas para_no romper la paridad:

- Claves jerárquicas estables y semánticas (`game.hud.round`), nunca el texto como clave.
- Sin HTML dentro de los JSON: si el texto lleva `<strong>`/`<br/>`, se parte en
  varias claves (`p1a` / `p1b`) y las etiquetas se quedan en el JSX.
- Fechas y plurales: `fmtDate(i18n.language, ...)` y claves `_one` / `_other`
  (nunca `minuto/minutos` a mano).
- `game/` (lógica pura) nunca llama a `t()`: devuelve claves o códigos.
- No se traducen: contenido de usuario (nicks, comentarios, reportes), datos de
  la API que aún no tienen i18n en backend (cartas, personajes, habilidades,
  logros, `dialogs.json`, `missions.json`) ni logs de `console`.

Tests que lo vigilan (`pnpm --dir front run test`):

- `src/i18n/__tests__/locales.test.js`: paridad de claves es/en, mismas
  variables `{{var}}` y ningún valor con HTML.
- `src/i18n/__tests__/keys-used.test.js`: toda clave `t('...')` usada en el
  código existe en es y en.
- `src/testSetup.js`: inicializa i18n en `es` para los tests de componentes.

Pendiente (fases siguientes): i18n de contenido en el backend (columna JSON de
traducciones + seeders bilingües), `lang/{es,en}` para validaciones y emails, y
los ~70 logs de `GamePage.jsx`.

## Contribución
1. Crear la rama correspondiente con el formato `feature/funcionalidad` o `fix/arreglo` desde la rama `develope`
 ```bash
 git checkout -b feature/nueva-funcionalidad
```
2. Una vez finalices de implementar los cambios, se deberá realizar un pull request y solicitar un merge.

## Documentación
El código debe, en la medida de lo posible, ir comentado con el estándard JSDoc (para el front) y PHPDoc (para el backend). Esto facilitará la legibilidad del código y las futuras implementaciones.  
Además, sustituyendo en la URL del repositorio `github` por `deepwiki` encontrarás una documentación automática generada por inteligencia artificial a la que podrás consultar distinta información del repositorio. 