#!/usr/bin/env bash
 
# Título en la terminal
echo -e "\033]0;Scoundrel Quest Up\007"
 
echo "==========================================="
echo "  Entorno de desarrollo Scoundrel's Quest  "
echo "==========================================="
 
# Obtener directorio raíz del proyecto (equivalente a %~dp0)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
 
# =====================================
# Detectar terminal disponible
# =====================================
 
open_terminal() {
  local title="$1"
  local cmd="$2"
 
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: usar osascript para abrir Terminal
    osascript -e "tell application \"Terminal\" to do script \"echo -e '\\\\033]0;${title}\\\\007'; ${cmd}; exec bash\""
  elif command -v gnome-terminal &>/dev/null; then
    gnome-terminal --title="$title" -- bash -c "${cmd}; exec bash"
  elif command -v xterm &>/dev/null; then
    xterm -title "$title" -e bash -c "${cmd}; exec bash" &
  elif command -v konsole &>/dev/null; then
    konsole --title "$title" -e bash -c "${cmd}; exec bash" &
  else
    echo "⚠️  No se encontró un emulador de terminal compatible."
    echo "   Ejecuta manualmente: ${cmd}"
  fi
}
 
# =====================================
# BACKEND - Docker + Laravel
# =====================================
 
echo ""
echo "Iniciando Laravel (Docker)..."
 
BACKEND_CMD="cd '${ROOT_DIR}/back' && docker compose up -d && docker compose exec -it php php artisan migrate && docker compose exec -it php php artisan storage:link && docker compose exec -it php sh"
 
open_terminal "Backend Laravel" "$BACKEND_CMD"
 
# =====================================
# FRONTEND - Instalación y ejecución
# =====================================
 
echo ""
echo "Instalando dependencias frontend..."
cd "${ROOT_DIR}/front" || { echo "❌ No se encontró el directorio front/"; exit 1; }
npm install
 
echo ""
echo "Iniciando Frontend en http://localhost:5173"
 
FRONTEND_CMD="cd '${ROOT_DIR}/front' && npm run build && npm run dev"
 
open_terminal "Frontend - Vite" "$FRONTEND_CMD"
 
echo ""
echo "✅ Backend y Frontend iniciados correctamente."
echo ""