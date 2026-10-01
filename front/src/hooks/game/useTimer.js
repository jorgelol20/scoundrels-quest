import { useCallback, useEffect, useRef } from "react";

/**
 * Formatea segundos a "Tiempo: MM:SS" (puro, testeable).
 * Extraído del intervalo del timer de GamePage.jsx sin cambios.
 *
 * @param {number} totalSeconds
 * @param {string} label Prefijo ya traducido (i18n) p. ej. t('game:hud.time')
 * @returns {string}
 */
export const formatTime = (totalSeconds, label = 'Tiempo:') => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${label} ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const writeTime = (formatedTimeRef, totalSeconds, label) => {
    if (formatedTimeRef.current) {
        formatedTimeRef.current.textContent = formatTime(totalSeconds, label);
    }
};

/**
 * Timer de partida (Fase 2).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 * Se mantiene el nombre `formatedTimeRef` (con su errata original)
 * para no romper la prop de GameShop ni el JSX existente.
 *
 * @param {string} [label] Prefijo de tiempo ya traducido (i18n).
 *   Se guarda en un ref y se re-escribe al cambiar (p. ej. cambio de idioma
 *   en GamePage.jsx: `useTimer(t('game:hud.timeLabel'))` re-renderiza con la
 *   nueva etiqueta sin congelar la anterior en el intervalo).
 * @returns {{ timeRef, formatedTimeRef, start, stop, reset }}
 */
export const useTimer = (label = 'Tiempo:') => {
    const timeRef = useRef(0);
    const intervalRef = useRef(null);
    const formatedTimeRef = useRef(null);
    const labelRef = useRef(label);

    useEffect(() => {
        labelRef.current = label;
        // Retraducir lo ya pintado al cambiar el idioma.
        writeTime(formatedTimeRef, timeRef.current, label);
    }, [label]);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        // Idempotente: hace stop previo como el effect original.
        stop();
        intervalRef.current = setInterval(() => {
            timeRef.current += 1;
            writeTime(formatedTimeRef, timeRef.current, labelRef.current);
        }, 1000);
    }, [stop]);

    const reset = useCallback(() => {
        stop();
        timeRef.current = 0;
        writeTime(formatedTimeRef, 0, label);
    }, [stop, label]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    return { timeRef, formatedTimeRef, start, stop, reset };
};
