# MEMORY.md — Scoundrel's Quest
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- `AGENTS.md` completo (stack, arquitectura 3 capas, i18n, datos, límites, verificación manual). `README.md` aligerado a uso operativo + enlace a `AGENTS.md`.
- Alquimista (id 11, codigo `alquimista`, activa): pasiva 2x50% independiente solo-Corazón-que-cura (+25% suelo+clamp, +1 daño); activa `Alquimia Básica` 1/ronda inmediata (pociones 25% c/u; avaricia x2 con arma, sin apilar). Arte `Alquimista.webp` + icono `AlquimiaBasica.webp` pendientes de subir. Logros `victoria_alquimista` (Juventud Eterna) y `habilidad_alquimista` (Transmutación perfecta).
- Espectro (id 10, codigo `espectro`, activo): pasiva inmune a efectos Pica/Trebol no-miniboss, activa `spectreWeaken` -3 sala activa +2 manos, 1 uso/ronda. Arte `Espectro.webp` + icono pendiente de subir.
- `Personajes.php` referencia habilidades por `codigo` (no id hardcodeado): robusto ante huecos del autoincremento (caso local `Toque espectral`=11).
- i18n contenido: rutas públicas (`personajes`, `habilidades`, `cartas`, `modificadores`, `logros`, `partidas`) con middleware `locale`; `useCharacters` con queryKey por idioma + sync a `availableCharacters` (cambio en caliente sin recarga).
- `Character.css`: color negro explícito en `.abilitie-text p` y `.character-description p` (texto heredaba color claro → ilegible sobre caja blanca).
- Tema Halloween: predicado puro `game/season.js` (1-31 oct) + `theme` en `SettingsProvider` (`data-theme`, override `localStorage['sq_theme']` auto/halloween/default) + bloque `[data-theme="halloween"]` en `index.css` + selector en Ajustes (i18n es/en) + banner del menú por tema (`MainPage.jsx`). `Navbar.css` sin hardcodes: fondos/bordes/links a variables (`color-mix` para las transparencias) + brillo naranja del activo en Halloween.
- Guardián (id 12, codigo `guardian`): pasiva −1 a `finalDmg` solo Pica/Trebol (minibosses exentos); activa `Posición defensiva` 1/ronda (−50% floor + −1 a la mano activa, se pierde al huir/cambiar ronda). Logros `victoria_guardian` (Gran Muralla) y `habilidad_guardian` (Guerrero Inamovible, meta 100). Arte `Guardian.webp` + icono `PosicionDefensiva.webp` pendientes de subir por el usuario.
- Elfo: `Abrojos` ya no afecta a minibosses (palo `Miniboss` exento, como Espectro). Glosario unificado: `mano` (antes `sala` en textos visibles); `ronda` = todas las manos hasta completar la baraja.
- `MatchProvider.loadAchievements`: añadidos `victoria_alquimista` (faltaba) y `victoria_guardian`.
- `calcCombatDamage` acepta `guardian: { flat, stance }` namespaced (patrón para futuras mitigaciones); `characters.js` aporta `GUARDIAN_FLAT_REDUCTION`/`calcGuardianStanceDamage`/`isGuardianTarget`.
## Decisiones (y por qué)
- Detalle técnico vive en `AGENTS.md`, no duplicado en `README.md` (evita deriva).m 
- Verificación = manual, sin comandos automatizados (decisión del usuario).
## Aprendizajes y errores a evitar
- `SCOUNDRELSQUEST.md` es fuente de verdad de mecánicas; si discrepa del código, preguntar.
- No meter `Math.random`/`setTimeout` crudo en `game/` ni texto hardcodeado en JSX (rompe paridad i18n).
## Próximos pasos
- (pendiente)
- `docs/constitution.md`: 7 principios innegociables (stack, spec, capas, tests, datos, idioma, disciplina unipersonal). Detalle operativo sigue en `AGENTS.md`.
- `AGENTS.md` podado (~250→~160 líneas): sin árboles de directorios ni reglas duplicadas; cada sección referencia a su principio y conserva solo el *cómo* (rutas, firmas, ejemplos, pendientes).
- Agentes SDD (`.opencode/agents/`): `coordinator.md` solo-lectura + `planner`/`implementer`/`reviewer` base; specs en `specs/NNN-slug/` (`spec.md`+`plan.md`+`tasks.md`); `/feature` cambio pequeño, `/personaje` trazable.
