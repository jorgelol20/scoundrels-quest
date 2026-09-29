/**
 * Guardado de derrota en unload (recarga/cierre) vía `fetch keepalive`.
 *
 * El axios normal no sobrevive al `unload` de la página (el navegador
 * aborta la petición), así que la derrota por recarga se envía con
 * `keepalive: true`, que el navegador garantiza encolar. Mismo endpoint
 * y misma forma que `endGame` (POST /partidas), con el Bearer de
 * localStorage (sin CSRF implicado: auth por token, no por cookie).
 * No dispara logros: en unload no hay tiempo para la cadena async.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Construye el payload de derrota (puro, testeable).
 */
export const buildLossPayload = ({
    usuario_id,
    personaje_id,
    tiempo,
    rondas,
    modificadores,
    oro_obtenido,
    vida_curada,
    enemigos_enfrentados,
}) => ({
    usuario_id,
    personaje_id,
    tiempo,
    victoria: false,
    rondas,
    modificadores,
    oro_obtenido,
    vida_curada,
    enemigos_enfrentados,
});

/**
 * Envía el payload con keepalive. Fire-and-forget: nunca rechaza.
 */
export const postMatchKeepalive = (form) => {
    try {
        const token = localStorage.getItem('auth_token');
        return fetch(`${BACKEND_URL}/partidas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(form),
            keepalive: true,
        }).catch(() => undefined);
    } catch {
        return Promise.resolve(undefined);
    }
};
