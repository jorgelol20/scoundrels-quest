import { useCallback, useRef, useState } from "react";

/**
 * Geometría de zonas (antes useState sin setters: nunca cambiaban).
 */
export const DUNGEON_ZONE = { x: 10, y: 5, width: 130, height: 160 };
export const DISCARD_ZONE = { x: 650, y: 200, width: 130, height: 160 };
export const WEAPON_ZONE = { x: 200, y: 200, width: 400, height: 240 };

/**
 * Estado del tablero (Fase 4 - vista/estado).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 *
 * Mazo, sala, descartes, arma, derrotados, refs Konva y movimiento
 * de cartas al descarte. `scheduleTimeout` se inyecta para compartir
 * el registro único de timers.
 */
export const useBoardState = ({ scheduleTimeout }) => {
    const layerRef = useRef(null);
    const cardRefs = useRef({});
    const [room, setRoom] = useState([]);
    const [dungeon, setDungeon] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [weapon, setWeapon] = useState(null);
    const [slainMonsters, setSlainMonsters] = useState([]);

    const deleteFromRoom = useCallback((card) => {
        setRoom(prev => prev.filter(c => c.key !== card?.key));
    }, []);

    // Ejecuta la animación para mover a descartes
    const moveCardToDiscard = useCallback((cardsToMove, moved = false) => {
        if (moved) {
            cardsToMove.forEach((card) => {
                if (cardRefs.current[card.key]) {
                    const x = 660 - card?.x - 2
                    cardRefs.current[card.key].animateTo(x, 6, 0.2);
                }
            });
        } else {
            cardsToMove.forEach((card) => {
                if (cardRefs.current[card.key]) {
                    cardRefs.current[card.key].animateTo(660, 204, 0.4);
                }
            });
        }
        scheduleTimeout(() => {
            setDiscardPile(prev => [...prev, ...cardsToMove]);
            setRoom(prev => prev.filter(c => !cardsToMove.find(moved => moved.key === c.key)));
            cardsToMove.forEach(card => {
                delete cardRefs.current[card.key];
            });
        }, 450);
    }, [scheduleTimeout]);

    return {
        layerRef,
        cardRefs,
        room,
        setRoom,
        dungeon,
        setDungeon,
        discardPile,
        setDiscardPile,
        weapon,
        setWeapon,
        slainMonsters,
        setSlainMonsters,
        deleteFromRoom,
        moveCardToDiscard,
    };
};
