import { Stage, Layer } from 'react-konva';
import EffectsPanel from "./EffectsPanel.jsx";
import DungeonZone from "./DungeonZone.jsx";
import DiscardZone from "./DiscardZone.jsx";
import WeaponZone from "./WeaponZone.jsx";
import RoomLayer from "./RoomLayer.jsx";
import TooltipLayer from "./TooltipLayer.jsx";

/**
 * Tablero Konva completo (Fase 4 - vista).
 * Presentacional: compone las zonas con props, sin lógica de juego.
 */
const GameBoard = ({
    layout,
    layoutMode,
    dungeonZone,
    discardZone,
    weaponZone,
    effectValues,
    effectIcons,
    dungeon,
    discardPile,
    room,
    weapon,
    slainMonsters,
    isWizard,
    overDungeonZone,
    canBeClicked,
    catEye,
    gameOn,
    tooltip,
    cardRefs,
    layerRef,
    defaultImage,
    getSuitIcon,
    onHoverEffect,
    onLeaveEffect,
    setOverDungeonZone,
    onDragEnd,
    onPlay,
    onClearTooltip,
}) => (
    <Stage className="game-window" width={layout.width} height={layout.height} scaleX={layout.scale} scaleY={layout.scale} imageSmoothingEnabled={false} x={0}>
        {/* CAPA ESTÁTICA */}
        <Layer>
            <EffectsPanel
                x={layoutMode === 'portrait' ? 0 : dungeonZone.x}
                y={layoutMode === 'portrait' ? 0 : weaponZone.y}
                width={weaponZone.width}
                height={weaponZone.height}
                values={effectValues}
                icons={effectIcons}
                layoutMode={layoutMode}
                onHover={onHoverEffect}
                onLeave={onLeaveEffect}
            />

            {/* ZONA DEL MAZO */}
            <DungeonZone
                zone={dungeonZone}
                dungeon={dungeon}
                isWizard={isWizard}
                overDungeonZone={overDungeonZone}
                canBeClicked={canBeClicked}
                catEye={catEye}
                getSuitIcon={getSuitIcon}
                defaultImage={defaultImage}
                setOverDungeonZone={setOverDungeonZone}
                layoutMode={layoutMode}
            />

            {/* PILA DE DESCARTES */}
            <DiscardZone
                zone={discardZone}
                weaponZone={weaponZone}
                discardPile={discardPile}
                getSuitIcon={getSuitIcon}
                defaultImage={defaultImage}
            />
            {/* ZONA DE EQUIPO */}
            <WeaponZone
                zone={weaponZone}
                weapon={weapon}
                slainMonsters={slainMonsters}
                cardRefs={cardRefs}
                getSuitIcon={getSuitIcon}
                defaultImage={defaultImage}
                compact={layoutMode === 'portrait'}
            />
        </Layer>


        {/* PARTES JUGABLES (No estáticas) */}
        <RoomLayer
            room={room}
            cardRefs={cardRefs}
            layerRef={layerRef}
            gameOn={gameOn}
            canBeClicked={canBeClicked}
            getSuitIcon={getSuitIcon}
            defaultImage={defaultImage}
            onDragEnd={onDragEnd}
            onPlay={onPlay}
            layoutMode={layoutMode}
        />
        <Layer>
            <TooltipLayer tooltip={tooltip} onTap={onClearTooltip} />
        </Layer>
    </Stage>
);

export default GameBoard;
