# Nombre del proyecto
Scoundrel's Quest

## Funcionalidades
**Scoundrel's Quest** se trata de un juego web desarrollado como trabajo de fin de grado para el curso de 2º de DAW (2025/2026) de IES Enric Valor Monóvar

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
### Otros
1. Clonar el repositorio
2. Ejecutar `npm run dev` dentro de la carpeta **/front**.
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
    |   +---Http/
    |   |   +---Controllers/
    |   |   |   \---Api/
    |   |   \---Requests/
    |   |       +---Cartas/
    |   |       +---Habilidades/
    |   |       +---Modificadores/
    |   |       +---Partidas/
    |   |       +---Personajes/
    |   |       \---Usuarios/
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
    |   |       \---usuarios/
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
    \---hooks/
```

## Contribución
1. Hacer un fork del repositorio.
2. Crear la rama correspondiente con el formato `feature/funcionalidad` o `fix/arreglo`
 ```bash
 git checkout -b feature/nueva-funcionalidad
```
3. Una vez finalices de implementar los cambios, se deberá realizar un pull request y solicitar un merge.