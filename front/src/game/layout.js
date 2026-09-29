/**
 * Layout del tablero (responsive).
 *
 * El contenido Konva es apaisado (800x440). En pantallas verticales
 * escalarlo tal cual deja cartas de ~50px: injugable. Por eso hay dos
 * modos:
 * - landscape 800x440: zonas originales.
 * - portrait 420x760: sala en grid 2x2, efectos en tira 7+6,
 *   mazo+descartes en una fila y equipo abajo.
 *
 * Todo puro y testeable. GamePage mide el contenedor real
 * (ResizeObserver) y elige modo por orientación del contenedor.
 */

export const LANDSCAPE_VIRTUAL = { width: 800, height: 440 };
export const PORTRAIT_VIRTUAL = { width: 420, height: 760 };

// Zonas portrait (x+w <= 420, y+h <= 760)
export const PORTRAIT_DUNGEON_ZONE = { x: 8, y: 88, width: 130, height: 160 };
export const PORTRAIT_DISCARD_ZONE = { x: 282, y: 88, width: 130, height: 160 };
export const PORTRAIT_WEAPON_ZONE = { x: 8, y: 592, width: 404, height: 160 };

// Sala portrait: grid 2x2 de cartas 130x160
export const PORTRAIT_ROOM_X = [70, 220];
export const PORTRAIT_ROOM_Y = [256, 424];

// Efectos portrait: tira 7x2 de iconos 32px
export const PORTRAIT_EFFECTS = { x: 70, y: 8, step: 40, perRow: 7 };

// Mago en portrait: menos previsualización y abanico más cerrado
export const PORTRAIT_WIZARD_PREVIEW = 4;
export const PORTRAIT_WIZARD_STEP = 70;
export const LANDSCAPE_WIZARD_PREVIEW = 8;
export const LANDSCAPE_WIZARD_STEP = 100;

/**
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @returns {boolean} true si el contenedor es vertical
 */
export const isPortraitLayout = (containerWidth, containerHeight) => (
    containerHeight > containerWidth
);

/**
 * Posición de sala en portrait por índice (0-3). null en landscape
 * (se usa la fila clásica card.x + index*140).
 * @param {number} index
 * @returns {{x:number, y:number}}
 */
export const roomPosPortrait = (index) => ({
    x: PORTRAIT_ROOM_X[index % 2],
    y: PORTRAIT_ROOM_Y[Math.floor(index / 2) % 2],
});

/**
 * Posición de efecto en portrait por índice (0-13).
 * @param {number} index
 * @returns {{x:number, y:number}}
 */
export const effectsPosPortrait = (index) => ({
    x: PORTRAIT_EFFECTS.x + (index % PORTRAIT_EFFECTS.perRow) * PORTRAIT_EFFECTS.step,
    y: PORTRAIT_EFFECTS.y + Math.floor(index / PORTRAIT_EFFECTS.perRow) * PORTRAIT_EFFECTS.step,
});

/**
 * Escala de ajuste para un contenido virtual dentro de una caja medida.
 * Misma idea que calcStageLayout pero genérica (p. ej. cartas de tienda).
 *
 * @param {number} boxWidth ancho medido
 * @param {number} boxHeight alto medido
 * @param {number} virtualWidth ancho virtual del contenido
 * @param {number} virtualHeight alto virtual del contenido
 * @returns {number} escala (>= 0, 1 si la caja aún no mide)
 */
export const fitScale = (boxWidth, boxHeight, virtualWidth, virtualHeight) => {
    if (!boxWidth || !boxHeight || boxWidth < 10 || boxHeight < 10) {
        return 1;
    }
    return Math.min(boxWidth / virtualWidth, boxHeight / virtualHeight);
};

/**
 * Stage exacto al contenido escalado (sin bandas ni recortes):
 * el wrapper CSS lo centra.
 *
 * @param {number} containerWidth ancho real medido
 * @param {number} containerHeight alto real medido
 * @returns {{mode:'landscape'|'portrait', scale:number, width:number, height:number}}
 */
export const calcStageLayout = (containerWidth, containerHeight) => {
    const portrait = isPortraitLayout(containerWidth, containerHeight);
    const virtual = portrait ? PORTRAIT_VIRTUAL : LANDSCAPE_VIRTUAL;
    const safeW = Math.max(1, containerWidth);
    const safeH = Math.max(1, containerHeight);
    const scale = Math.min(safeW / virtual.width, safeH / virtual.height);
    return {
        mode: portrait ? 'portrait' : 'landscape',
        scale,
        width: Math.floor(virtual.width * scale),
        height: Math.floor(virtual.height * scale),
    };
};
