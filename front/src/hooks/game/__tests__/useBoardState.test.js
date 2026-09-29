// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useBoardState, DUNGEON_ZONE, WEAPON_ZONE } from '../useBoardState.js';

afterEach(() => {
    cleanup();
});

const setup = () => {
    const fns = [];
    const scheduleTimeout = vi.fn((fn) => {
        fns.push(fn);
        return fns.length;
    });
    const utils = renderHook(() => useBoardState({ scheduleTimeout }));
    return { ...utils, fns, scheduleTimeout };
};

const card = (key) => ({ key, valor: 5, palo: 'Pica', x: 200, y: 0 });

describe('useBoardState', () => {
    it('zonas con la geometría original', () => {
        expect(DUNGEON_ZONE).toEqual({ x: 10, y: 5, width: 130, height: 160 });
        expect(WEAPON_ZONE).toEqual({ x: 200, y: 200, width: 400, height: 240 });
    });

    it('deleteFromRoom filtra por key', () => {
        const { result } = setup();
        act(() => {
            result.current.setRoom([card('a'), card('b')]);
        });
        act(() => {
            result.current.deleteFromRoom(card('a'));
        });
        expect(result.current.room.map((c) => c.key)).toEqual(['b']);
    });

    it('moveCardToDiscard mueve tras 450ms y limpia refs', () => {
        const { result, fns } = setup();
        act(() => {
            result.current.setRoom([card('a'), card('b')]);
        });
        act(() => {
            result.current.moveCardToDiscard([card('a')]);
        });
        // Antes del timeout nada cambia
        expect(result.current.discardPile).toEqual([]);
        act(() => {
            fns.forEach((fn) => fn());
        });
        expect(result.current.discardPile.map((c) => c.key)).toEqual(['a']);
        expect(result.current.room.map((c) => c.key)).toEqual(['b']);
    });

    it('moveCardToDiscard con moved anima sin fallar sin refs', () => {
        const { result, fns } = setup();
        act(() => {
            result.current.setRoom([card('a')]);
        });
        expect(() => {
            act(() => {
                result.current.moveCardToDiscard([card('a')], true);
            });
        }).not.toThrow();
        act(() => {
            fns.forEach((fn) => fn());
        });
        expect(result.current.discardPile.map((c) => c.key)).toEqual(['a']);
    });
});
