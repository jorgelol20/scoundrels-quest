---
description: Genera spec, plan y tareas numerados a partir de una idea breve
agent: planner
---

Eres un analista de producto/ingeniería. Tu tarea es redactar una **spec** (NO implementar código) a partir de esta idea:

> $ARGUMENTS

## Documentos rectores del proyecto

Lee estos cuatro ficheros ANTES de redactar. Cada uno tiene un papel distinto:

1. **SCOUNDRELSQUEST.md**: fuente de la verdad. Define qué es el producto y cómo es hoy. Si algo contradice a este documento, este documento gana.
2. **docs/constitution.md**: fuente de qué se puede hacer. Marca los límites. Si la idea los viola, no la especifiques tal cual.
3. **AGENTS.md**: cómo se debe hacer. Convenciones, stack y forma de trabajar. Úsalo para que los requisitos no choquen con ellas.
4. **MEMORY.md**: estado actual del proyecto y decisiones previas. Úsalo para no duplicar ni contradecir trabajo ya hecho.

@SCOUNDRELSQUEST.md
@docs/constitution.md
@AGENTS.md
@MEMORY.md

## Contexto adicional

Specs existentes:
!`ls specs 2>/dev/null || echo "(no hay carpeta specs todavía)"`

Estructura del repo (2 niveles):
!`find . -maxdepth 2 -not -path '*/node_modules*' -not -path '*/.git*' | head -60`

## Pasos

1. **Numeración:** usa el siguiente número de 3 dígitos según `specs/` (001 si no hay ninguno). Carpeta: `specs/NNN-slug-en-kebab-case/` con `spec.md`, `plan.md` y `tasks.md` (tareas T1, T2… pequeñas, por capas).
2. **Alineación:** antes de escribir, comprueba la idea contra los cuatro documentos:
   - ¿Encaja con SCOUNDRELSQUEST.md (no lo contradice ni duplica algo ya existente)?
   - ¿Está permitida por docs/constitution.md?
   - ¿Es coherente con las convenciones de AGENTS.md?
3. **Conflictos:** si la idea choca con alguno, NO resuelvas el conflicto por tu cuenta. Redacta la spec con la parte que sí encaja y registra el choque en "Dudas abiertas" citando el documento y la sección afectada.
4. **Exploración:** lee código relacionado solo si hace falta. No leas más de lo necesario.
5. **Redacción:** rellena la plantilla en español, con los encabezados exactos y en el mismo orden.
6. **Dudas:** lo que no se pueda deducir de la idea, del código ni de los documentos rectores va en "Dudas abiertas" como `- [NECESITA ACLARACIÓN] <duda concreta>`. No inventes.
7. **Guardado:** escribe `spec.md`, `plan.md` y `tasks.md` en la carpeta y termina con un resumen de 3-5 líneas: ruta, nº de RF/tareas, conflictos con los documentos rectores (si los hay) y dudas más importantes.

## Reglas de calidad

- Los RF usan EARS y son verificables (se podría escribir un test a partir de cada uno). Usa solo los patrones que apliquen.
- Numera historias (H1, H2...) y requisitos (RF-1, RF-2...) consecutivamente.
- Usa el vocabulario y los nombres de SCOUNDRELSQUEST.md; no introduzcas términos nuevos para conceptos que ya existen.
- "Requisitos no funcionales": solo los que apliquen; si ninguno, "Ninguno relevante". Incluye aquí las restricciones de la constitución que afecten a esta funcionalidad.
- "Fuera de alcance": explícito, para frenar que el agente se extienda al implementar.
- Sé conciso. No rellenes con texto genérico.
- No modifiques ningún otro fichero.

## Plantilla

```md
# Spec NNN — <Nombre de la funcionalidad>
## Contexto y objetivo
<Qué problema resuelve y por qué merece la pena. Un párrafo.>
## Usuarios / actores
<Quién lo usa.>
## Historias de usuario
- H1: Como <rol> quiero <acción> para <beneficio>.
## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: CUANDO <evento>, EL SISTEMA <respuesta> (salida/resultado esperado).
- RF-2: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-3: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-4: EL SISTEMA <comportamiento permanente>.
## Requisitos no funcionales
<Solo los que apliquen: rendimiento, seguridad, plataformas, idioma...>
## Casos límite
<Vacíos, duplicados, datos corruptos, límites, concurrencia...>
## Fuera de alcance
<Lo que explícitamente NO se hace en esta iteración.>
## Criterios de finalización
<Ej.: todos los RF con test en verde + demo manual del flujo principal.>
## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>
```