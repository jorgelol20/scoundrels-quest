/**
 * Función automática llamada desde el package.json al montarse que obtiene la fecha del último log de git para mostrarse (por ahora) únicamente en el Footer para obtener la última actualización automáticamente.
 */


import { execSync } from 'node:child_process';
import fs from 'node:fs';

const ENV_FILE = '.env.local';
const VAR_NAME = 'VITE_LAST_COMMIT_DATE';

try {
  // Cambio aquí: Usamos --date=format:'%Y-%m-%d' para máxima compatibilidad
  const gitDate = execSync("git log -1 --format=%cd --date=format:'%d-%m-%Y'").toString().trim();
  const newEntry = `${VAR_NAME}=${gitDate}`;

  let envContent = '';
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  }

  if (envContent.includes(`${VAR_NAME}=`)) {
    const regex = new RegExp(`^${VAR_NAME}=.*$`, 'gm');
    envContent = envContent.replace(regex, newEntry);
  } else {
    envContent += (envContent.endsWith('\n') || envContent === '' ? '' : '\n') + `${newEntry}\n`;
  }

  fs.writeFileSync(ENV_FILE, envContent);
  console.log(`Fecha de Git actualizada correctamente: ${gitDate}`);
} catch (error) {
  console.warn('No se pudo actualizar la fecha de Git:', error.message);
}