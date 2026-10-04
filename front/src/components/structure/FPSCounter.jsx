import React, { useEffect, useState, useRef } from 'react';

/**
 * Contador de FPS para depuración (bandera `showFPS`).
 * Sin Konva: solo DOM, para no meter `react-konva` en el bundle inicial.
 */
const FPSCounter = () => {
    const [fps, setFps] = useState(0);
    const frameRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const rafRef = useRef(0);

    useEffect(() => {
        const calculateFPS = () => {
            const now = performance.now();
            frameRef.current++;

            // Cada segundo, actualizamos el estado de los FPS
            if (now - lastTimeRef.current >= 1000) {
                setFps(Math.round((frameRef.current * 1000) / (now - lastTimeRef.current)));
                frameRef.current = 0;
                lastTimeRef.current = now;
            }

            rafRef.current = requestAnimationFrame(calculateFPS);
        };

        rafRef.current = requestAnimationFrame(calculateFPS);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 10, background: 'black', color: 'white', padding: '5px', fontSize: '2cqw' }}>
      FPS: {fps}
    </div>
  );
};
export default FPSCounter;