# Constitución — Scoundrel's Quest

1. **Stack congelado.** Front: React 19 + Vite 8 + pnpm (`front/`). Back: Laravel + Sanctum + MySQL 8 + Caddy/Docker (`back/`). Ninguna dependencia nueva, migración/seeder ni cambio de infra sin aprobación previa. Verificación: `front/package.json`, `back/docker-compose.yml` y `back/Caddyfile` sin cambios no aprobados.

2. **La spec manda.** `SCOUNDRELSQUEST.md` es la única fuente de verdad de mecánicas. Ante discrepancia spec-código, se para, se reporta y se pregunta; nunca se "arregla" el balance en silencio (daños, `calculateWeaponPrice`/`calculateHealPrice`, probabilidades de modificadores). Verificación: cada cambio de regla cita su sección de la spec o la pregunta previa.

3. **Lógica, interfaz y persistencia separadas.** `front/src/game/` es puro: sin React/JSX/`setTimeout`/`document`/imports de contexto/`Math.random` (única excepción: fallback de `uid()`); el azar se delega al adaptador vía `events`. `components/` solo renderiza: sin `Math.random` nuevo ni mutación de refs ajenas; timers solo vía `useScheduledTimeouts`. La persistencia vive en los dueños de estado y el back (controladores/`Requests`/migraciones), nunca en `game/` ni en la vista. Verificación: `grep` de los tokens prohibidos en `game/` y `components/`.

4. **Sin test no hay regla.** Toda función nueva en `front/src/game/` entra con su test en `__tests__/`; `pnpm test` (`vitest run`) y los tests de paridad i18n deben estar en verde. Front se verifica además con chrome-dev-tools; back sin comandos automatizados (manual). Verificación: `pnpm test` en verde + fichero de test por regla nueva.

5. **Los datos persistidos se protegen.** Rankings públicos sin `email`; contenido del juego con lectura pública y escritura solo `auth:sanctum` + `admin`; `POST /partidas` exige sesión e identifica por token; registro/login/OAuth bajo `throttle`; salida con personaje o recarga/cierre = derrota (`victoria: false`, `keepalive`, sin logros, sin duplicar); jamás se sube `.env` ni secretos. Verificación: `back/src/routes/api.php` + proyecciones de rankings + `git status` limpio de secretos.

6. **Cada capa habla su idioma.** Back: identificadores, comentarios y PHPDoc en español (salvo nombres del framework: `store`/`update`/`destroy`). Front: identificadores en inglés, comentarios JSDoc en español. Ningún texto visible hardcodeado en JSX: todo por `t()` con paridad es/en; `game/` nunca llama a `t()`; no se traducen nicks, contenido de usuario, datos de API sin i18n ni logs. Verificación: tests `locales`/`keys-used` en verde + `grep` sin texto visible fuera de `locales/`.

7. **Disciplina unipersonal.** Cambios pequeños y localizados; prohibidas las reescrituras de golpe (`GamePage.jsx`, `MatchProvider.jsx`); ramas `feature/` o `fix/` desde `develope` + pull request; `MEMORY.md` actualizado al terminar cada tarea; código comentado (JSDoc/PHPDoc). Verificación: diff pequeño + `MEMORY.md` al día.
