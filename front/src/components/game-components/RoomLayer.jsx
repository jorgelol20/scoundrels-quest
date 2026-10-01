import { Layer } from 'react-konva';
import Card from "../Card";
import { roomPosPortrait } from "../../game/layout.js";

/**
 * Cartas jugables de la sala (Fase 4 - vista). Presentacional.
 * En portrait van en grid 2x2 (game/layout.js); en landscape en fila.
 */
const RoomLayer = ({
    room,
    cardRefs,
    layerRef,
    gameOn,
    canBeClicked,
    getSuitIcon,
    defaultImage,
    onDragEnd,
    onPlay,
    layoutMode,
}) => {
    const portrait = layoutMode === 'portrait';
    return (
    <Layer ref={layerRef}>
        {room.map((card, index) => {
            const gridPos = portrait ? roomPosPortrait(index) : null;
            return (
            <Card
                ref={el => cardRefs.current[card?.key] = el}
                key={card?.key}
                cardInfo={card}
                x={gridPos ? gridPos.x : card?.x + (index * (140))}
                y={gridPos ? gridPos.y : card?.y + 10}
                onDragEnd={onDragEnd}
                onClick={gameOn ? onPlay : () => { }}
                canBeClicked={canBeClicked}
                isDraggable={gameOn}
                cardSuit={getSuitIcon(card?.palo)}
                defaultImage={defaultImage}
            />
            );
        })}
    </Layer>
    );
};

export default RoomLayer;
