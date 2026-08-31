@echo off
title Scoundrel Quest Up

echo ===========================================
echo   Entorno de desarrollo Scoundrel's Quest
echo ===========================================

REM Obtener directorio raíz del proyecto
set ROOT_DIR=%~dp0

REM =====================================
REM BACKEND - Instalación y ejecución
REM =====================================

echo.

echo.
echo Iniciando Laravel (Docker)
start "Backend Laravel" cmd /k "cd /d %ROOT_DIR%back && docker compose up -d && docker compose exec -it php php artisan migrate && docker compose exec -it php php artisan storage:link && docker compose exec -it php sh

REM =====================================
REM FRONTEND - Instalación y ejecución
REM =====================================

echo.
echo Instalando dependencias frontend...
cd /d "%ROOT_DIR%front"
call npm install

echo.
echo Iniciando Frontend en http://localhost:5173
start "Frontend - Vite" cmd /k "cd /d %ROOT_DIR%front && npm run build && npm run dev"

echo.
echo ✅ Backend y Frontend iniciados correctamente.
echo.
pause
