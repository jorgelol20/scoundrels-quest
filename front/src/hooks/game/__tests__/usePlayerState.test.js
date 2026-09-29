// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePlayerState } from '../usePlayerState.js';

afterEach(() => {
    cleanup();
});

const icons = {
    full: 'full',
    mid: 'mid',
    none: 'none',
    heal: 'heal',
    steal: 'steal',
    damage: 'dmg',
    allDamage: 'all',
    gold: 'gold',
};

const setup = () => {
    const fns = [];
    const scheduleTimeout = vi.fn((fn) => {
        fns.push(fn);
        return fns.length;
    });
    const utils = renderHook(() => usePlayerState({ scheduleTimeout, icons }));
    return { ...utils, fns, scheduleTimeout };
};

describe('usePlayerState', () => {
    it('valores iniciales', () => {
        const { result } = setup();
        expect(result.current.health).toBe(20);
        expect(result.current.maxHealth).toBe(20);
        expect(result.current.gold).toBe(0);
        expect(result.current.healthIcon).toBe('full');
    });

    it('healAnimation muestra y limpia a los 300ms', () => {
        const { result, fns } = setup();
        act(() => {
            result.current.healAnimation(5);
        });
        expect(result.current.healthAnimationValue).toBe('+5');
        expect(result.current.healthAnimation).toBe('heal');
        act(() => {
            fns.forEach((fn) => fn());
        });
        expect(result.current.healthAnimation).toBe(null);
    });

    it('damageAnimation niega el valor y distingue total', () => {
        const { result } = setup();
        act(() => {
            result.current.damageAnimation(3);
        });
        expect(result.current.healthAnimationValue).toBe(-3);
        expect(result.current.healthAnimation).toBe('dmg');
        act(() => {
            result.current.damageAnimation(4, true);
        });
        expect(result.current.healthAnimation).toBe('all');
    });

    it('coinAnimation muestra oro', () => {
        const { result } = setup();
        act(() => {
            result.current.coinAnimation(10);
        });
        expect(result.current.goldAnimationValue).toBe(10);
        expect(result.current.goldAnimation).toBe('gold');
    });

    it('icono cambia con la vida', () => {
        const { result } = setup();
        act(() => {
            result.current.setHealth(8);
        });
        expect(result.current.healthIcon).toBe('mid');
        act(() => {
            result.current.setHealth(0);
        });
        expect(result.current.healthIcon).toBe('none');
    });
});
