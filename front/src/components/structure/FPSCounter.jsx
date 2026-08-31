import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

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

      requestAnimationFrame(calculateFPS);
    };

    const animationId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 10, background: 'black', color: 'white', padding: '5px', fontSize: '2cqw' }}>
      FPS: {fps}
    </div>
  );
};
export default FPSCounter;