# MEMORY.md — Scoundrel's Quest
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- `AGENTS.md` completo (stack, arquitectura 3 capas, i18n, datos, límites, verificación manual). `README.md` aligerado a uso operativo + enlace a `AGENTS.md`.
- Espectro (id 10, codigo `espectro`, activo): pasiva inmune a efectos Pica/Trebol no-miniboss, activa `spectreWeaken` -3 sala activa +2 manos, 1 uso/ronda. Arte `Espectro.webp` + icono pendiente de subir.
- `Personajes.php` referencia habilidades por `codigo` (no id hardcodeado): robusto ante huecos del autoincremento (caso local `Toque espectral`=11).
- i18n contenido: rutas públicas (`personajes`, `habilidades`, `cartas`, `modificadores`, `logros`, `partidas`) con middleware `locale`; `useCharacters` con queryKey por idioma + sync a `availableCharacters` (cambio en caliente sin recarga).
- `Character.css`: color negro explícito en `.abilitie-text p` y `.character-description p` (texto heredaba color claro → ilegible sobre caja blanca).
- Tema Halloween: predicado puro `game/season.js` (1-31 oct) + `theme` en `SettingsProvider` (`data-theme`, override `localStorage['sq_theme']` auto/halloween/default) + bloque `[data-theme="halloween"]` en `index.css` + selector en Ajustes (i18n es/en) + banner del menú por tema (`MainPage.jsx`). `Navbar.css` sin hardcodes: fondos/bordes/links a variables (`color-mix` para las transparencias) + brillo naranja del activo en Halloween.
## Decisiones (y por qué)
- Detalle técnico vive en `AGENTS.md`, no duplicado en `README.md` (evita deriva).m 
- Verificación = manual, sin comandos automatizados (decisión del usuario).
## Aprendizajes y errores a evitar
- `SCOUNDRELSQUEST.md` es fuente de verdad de mecánicas; si discrepa del código, preguntar.
- No meter `Math.random`/`setTimeout` crudo en `game/` ni texto hardcodeado en JSX (rompe paridad i18n).
## Próximos pasos
- (pendiente)
