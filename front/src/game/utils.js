/**
 * Genera un identificador único para instancias de carta.
 * Extraído de GamePage.jsx (Fase 0) sin cambios de comportamiento.
 */
export const uid = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
