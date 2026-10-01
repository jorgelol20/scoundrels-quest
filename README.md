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

## Estructura del proyecto y arquitectura

Ver `AGENTS.md` (Stack y estructura, Arquitectura del juego, Idiomas i18n).

## Contribución
1. Crear la rama correspondiente con el formato `feature/funcionalidad` o `fix/arreglo` desde la rama `develope`
 ```bash
 git checkout -b feature/nueva-funcionalidad
```
2. Una vez finalices de implementar los cambios, se deberá realizar un pull request y solicitar un merge.