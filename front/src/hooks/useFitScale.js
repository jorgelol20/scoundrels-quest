import { useCallback, useRef, useState } from "react";
import { fitScale } from "../game/layout.js";

/**
 * Escala de ajuste a un contenedor medido (patrón callback ref:
 * mide al aparecer, sin depender de efectos de montaje).
 *
 * @param {number} virtualWidth ancho virtual del contenido
 * @param {number} virtualHeight alto virtual del contenido
 * @param {number} [maxScale=1] tope (p. ej. 0.6 para no dominar en móvil)
 * @returns {[Function, number]} [callbackRef, scale]
 */
export const useFitScale = (virtualWidth, virtualHeight, maxScale = 1) => {
    const observerRef = useRef(null);
    const [scale, setScale] = useState(() => Math.min(1, maxScale));

    const ref = useCallback((el) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!el || typeof ResizeObserver === 'undefined') return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            setScale(Math.min(fitScale(rect.width, rect.height, virtualWidth, virtualHeight), maxScale));
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        observerRef.current = observer;
        return () => {
            observer.disconnect();
            if (observerRef.current === observer) {
                observerRef.current = null;
            }
        };
    }, [virtualWidth, virtualHeight, maxScale]);

    return [ref, scale];
};
