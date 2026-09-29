import { describe, it, expect } from 'vitest';
import {
    LANDSCAPE_VIRTUAL,
    PORTRAIT_VIRTUAL,
    PORTRAIT_DUNGEON_ZONE,
    PORTRAIT_DISCARD_ZONE,
    PORTRAIT_WEAPON_ZONE,
    PORTRAIT_ROOM_X,
    PORTRAIT_ROOM_Y,
    isPortraitLayout,
    roomPosPortrait,
    effectsPosPortrait,
    calcStageLayout,
    fitScale,
} from '../layout.js';

const inside = (zone, virtual) => (
    zone.x >= 0 && zone.y >= 0 &&
    zone.x + zone.width <= virtual.width &&
    zone.y + zone.height <= virtual.height
);

describe('isPortraitLayout', () => {
    it('vertical vs apaisado (cuadrado = landscape)', () => {
        expect(isPortraitLayout(390, 844)).toBe(true);
        expect(isPortraitLayout(1920, 1080)).toBe(false);
        expect(isPortraitLayout(500, 500)).toBe(false);
    });
});

describe('calcStageLayout', () => {
    it('desktop apaisado usa el virtual 800x440', () => {
        const l = calcStageLayout(960, 700);
        expect(l.mode).toBe('landscape');
        expect(l.scale).toBeCloseTo(1.2, 5);
        expect(l.width).toBe(Math.floor(800 * l.scale));
        expect(l.height).toBe(Math.floor(440 * l.scale));
    });

    it('móvil vertical usa el virtual portrait y cabe sin recorte', () => {
        const l = calcStageLayout(350, 500);
        expect(l.mode).toBe('portrait');
        expect(l.width).toBeLessThanOrEqual(350);
        expect(l.height).toBeLessThanOrEqual(500);
        // Carta de 130px queda >= 80px (antes ~52px)
        expect(130 * l.scale).toBeGreaterThanOrEqual(80);
    });

    it('nunca escala 0 ni NaN', () => {
        const l = calcStageLayout(0, 0);
        expect(Number.isFinite(l.scale)).toBe(true);
        expect(l.scale).toBeGreaterThan(0);
    });
});

describe('zonas portrait dentro del virtual', () => {
    it('mazo, descartes y equipo no se salen', () => {
        expect(inside(PORTRAIT_DUNGEON_ZONE, PORTRAIT_VIRTUAL)).toBe(true);
        expect(inside(PORTRAIT_DISCARD_ZONE, PORTRAIT_VIRTUAL)).toBe(true);
        expect(inside(PORTRAIT_WEAPON_ZONE, PORTRAIT_VIRTUAL)).toBe(true);
    });

    it('mazo y descartes comparten fila sin solaparse', () => {
        expect(PORTRAIT_DUNGEON_ZONE.y).toBe(PORTRAIT_DISCARD_ZONE.y);
        expect(PORTRAIT_DUNGEON_ZONE.x + PORTRAIT_DUNGEON_ZONE.width)
            .toBeLessThanOrEqual(PORTRAIT_DISCARD_ZONE.x);
    });
});

describe('roomPosPortrait', () => {
    it('grid 2x2 con cartas 130x160 sin salirse', () => {
        const positions = [0, 1, 2, 3].map(roomPosPortrait);
        expect(positions).toEqual([
            { x: PORTRAIT_ROOM_X[0], y: PORTRAIT_ROOM_Y[0] },
            { x: PORTRAIT_ROOM_X[1], y: PORTRAIT_ROOM_Y[0] },
            { x: PORTRAIT_ROOM_X[0], y: PORTRAIT_ROOM_Y[1] },
            { x: PORTRAIT_ROOM_X[1], y: PORTRAIT_ROOM_Y[1] },
        ]);
        positions.forEach(({ x, y }) => {
            expect(inside({ x, y, width: 130, height: 160 }, PORTRAIT_VIRTUAL)).toBe(true);
        });
    });
});

describe('effectsPosPortrait', () => {
    it('13 iconos en tira 7+6 sin solaparse (32px en paso 40)', () => {
        const positions = Array.from({ length: 13 }, (_, i) => effectsPosPortrait(i));
        const keys = new Set(positions.map(({ x, y }) => `${x},${y}`));
        expect(keys.size).toBe(13);
        positions.forEach(({ x, y }) => {
            expect(inside({ x, y, width: 32, height: 32 }, PORTRAIT_VIRTUAL)).toBe(true);
        });
        // Dos filas
        expect(positions[0].y).toBe(positions[6].y);
        expect(positions[7].y).toBeGreaterThan(positions[6].y);
    });
});

describe('virtuales', () => {
    it('landscape conserva el diseño original', () => {
        expect(LANDSCAPE_VIRTUAL).toEqual({ width: 800, height: 440 });
    });
});

describe('fitScale', () => {
    it('ajusta al lado limitante', () => {
        expect(fitScale(200, 400, 200, 170)).toBeCloseTo(1, 5);
        expect(fitScale(100, 400, 200, 170)).toBeCloseTo(0.5, 5);
        expect(fitScale(400, 100, 200, 170)).toBeCloseTo(100 / 170, 5);
    });

    it('caja sin medir devuelve 1', () => {
        expect(fitScale(0, 0, 200, 170)).toBe(1);
        expect(fitScale(5, 5, 200, 170)).toBe(1);
        expect(fitScale(undefined, undefined, 200, 170)).toBe(1);
    });
});
