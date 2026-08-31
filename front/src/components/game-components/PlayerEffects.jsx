import React, { useRef, useState } from "react";
import { Group, Image, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

const PlayerEffects = ({
  nombre,
  turnos,
  valor,
  icono,
  x = 0,
  y = 0,
  size = 64,
  onHover,
  onLeave,
}) => {
  const [image] = useImage(icono);
  const [isTouchActive, setIsTouchActive] = useState(false);

  const effectRef = useRef(null);

  const disabled = !(turnos !== 0) && !(valor !== 0);
  console.log(disabled)

  const getTooltipData = () => {
    if (!effectRef.current) {
      return null;
    }

    const position = effectRef.current.getAbsolutePosition();

    return {
      nombre,
      turnos,
      valor,
      x: position.x,
      y: position.y,
      size,
    };
  };

  /*
   * ============================================================
   * DESKTOP
   * ============================================================
   */

  const handleMouseEnter = () => {
    // Si estamos en modo táctil, ignoramos el hover.
    if (isTouchActive) return;

    const tooltip = getTooltipData();

    if (tooltip && onHover) {
      onHover(tooltip);
    }

    const stage = effectRef.current?.getStage();

    if (stage) {
      stage.container().style.cursor = "pointer";
    }
  };

  const handleMouseLeave = () => {
    if (isTouchActive) return;

    if (onLeave) {
      onLeave();
    }

    const stage = effectRef.current?.getStage();

    if (stage) {
      stage.container().style.cursor = "default";
    }
  };

  /*
   * ============================================================
   * MÓVIL / TOUCH
   * ============================================================
   */

  const handleTap = (e) => {
    e.cancelBubble = true;

    /*
     * Activamos el modo táctil para evitar que los eventos
     * de mouse simulados por algunos dispositivos provoquen
     * un mouseLeave inmediatamente después.
     */
    setIsTouchActive(true);

    if (isTouchActive) {
      // Segundo tap → cerrar
      setIsTouchActive(false);

      if (onLeave) {
        onLeave();
      }

      return;
    }

    // Primer tap → mostrar
    const tooltip = getTooltipData();

    if (tooltip && onHover) {
      onHover(tooltip);
    }
  };

  return (
    <Group
      ref={effectRef}
      x={x}
      y={y}

      // Desktop
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}

      // Touch / móvil
      onTap={handleTap}
      onClick={handleTap}

      hitFunc={(context, shape) => {
        context.beginPath();
        context.rect(0, 0, size, size);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
    >
      <Rect
        width={size}
        height={size}
        cornerRadius={6}
        fill="#222"
        stroke="#888"
        strokeWidth={2}
      />

      {image && (
        <Image
          image={image}
          x={5}
          y={5}
          width={size - 10}
          height={size - 10}
          filters={
            disabled
              ? [Konva.Filters.Grayscale]
              : undefined
          }
          grayscale={1}
        />
      )}
    </Group>
  );
};

export default PlayerEffects;