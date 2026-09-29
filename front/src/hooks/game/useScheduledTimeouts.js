import { useCallback, useEffect, useRef } from "react";

/**
 * Timers cancelables (Fase 0).
 * Extraído de GamePage.jsx sin cambios de comportamiento:
 * registra los timeouts para poder limpiarlos al reiniciar o desmontar
 * (evita setState tras desmontar y timeouts huérfanos).
 *
 * @returns {{ scheduleTimeout, cancelTimeout, clearScheduledTimeouts }}
 */
export const useScheduledTimeouts = () => {
    const pendingTimeoutsRef = useRef(new Set());

    const scheduleTimeout = useCallback((fn, delay) => {
        const id = setTimeout(() => {
            pendingTimeoutsRef.current.delete(id);
            fn();
        }, delay);
        pendingTimeoutsRef.current.add(id);
        return id;
    }, []);

    const cancelTimeout = useCallback((id) => {
        if (id !== undefined && id !== null) {
            clearTimeout(id);
            pendingTimeoutsRef.current.delete(id);
        }
    }, []);

    const clearScheduledTimeouts = useCallback(() => {
        pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
        pendingTimeoutsRef.current.clear();
    }, []);

    useEffect(() => {
        return () => {
            pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
            pendingTimeoutsRef.current.clear();
        };
    }, []);

    return { scheduleTimeout, cancelTimeout, clearScheduledTimeouts };
};
