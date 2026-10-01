// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamePersistence } from '../useGamePersistence.js';

const baseParams = (overrides = {}) => ({
    user: { id: 7 },
    character: { id: 1 },
    gameWin: false,
    rounds: 3,
    enemysDefeated: 10,
    endGame: vi.fn().mockResolvedValue(true),
    updateActualGame: vi.fn().mockResolvedValue(true),
    ...overrides,
});

const stats = { time: 100, gold: 20, healed: 5, defeated: 10 };

describe('useGamePersistence', () => {
    it('saveExit guarda una vez con derrota y bloquea el segundo', async () => {
        const params = baseParams();
        const { result } = renderHook(() => useGamePersistence(params));
        let first;
        await act(async () => {
            first = await result.current.saveExit({ ...stats, victory: false, reason: 'modal' });
        });
        expect(first).not.toBeNull();
        expect(params.endGame).toHaveBeenCalledTimes(1);
        expect(params.endGame).toHaveBeenCalledWith(7, 100, false, 3, 20, 5, 10);

        let second;
        await act(async () => {
            second = await result.current.saveExit({ ...stats, victory: false, reason: 'modal' });
        });
        expect(second).toBeNull();
        expect(params.endGame).toHaveBeenCalledTimes(1);
    });

    it('resetSaveFlag vuelve a armar el guardado', async () => {
        const params = baseParams();
        const { result } = renderHook(() => useGamePersistence(params));
        await act(async () => {
            await result.current.saveExit({ ...stats, victory: false, reason: 'modal' });
        });
        act(() => {
            result.current.resetSaveFlag();
        });
        await act(async () => {
            await result.current.saveExit({ ...stats, victory: false, reason: 'modal' });
        });
        expect(params.endGame).toHaveBeenCalledTimes(2);
    });

    it('saveManual no consume la bandera', async () => {
        const params = baseParams();
        const { result } = renderHook(() => useGamePersistence(params));
        await act(async () => {
            await result.current.saveManual({ ...stats, victory: false, userId: 7, rounds: 3 });
        });
        expect(params.endGame).toHaveBeenCalledTimes(1);
        await act(async () => {
            await result.current.saveExit({ ...stats, victory: false, reason: 'unmount' });
        });
        expect(params.endGame).toHaveBeenCalledTimes(2);
    });

    it('saveAuto usa updateActualGame con victoria cuando es continuada', async () => {
        const params = baseParams();
        const { result } = renderHook(() => useGamePersistence(params));
        await act(async () => {
            await result.current.saveAuto({ ...stats, continuedGame: true });
        });
        expect(params.updateActualGame).toHaveBeenCalledTimes(1);
        expect(params.updateActualGame).toHaveBeenCalledWith(7, 100, true, 3, 20, 5, 10);
        expect(params.endGame).not.toHaveBeenCalled();
    });

    it('saveAuto usa endGame con gameWin cuando no es continuada', async () => {
        const params = baseParams({ gameWin: true });
        const { result } = renderHook(() => useGamePersistence(params));
        await act(async () => {
            await result.current.saveAuto({ ...stats, continuedGame: false });
        });
        expect(params.endGame).toHaveBeenCalledWith(7, 100, true, 3, 20, 5, 10);
    });

    it('saveAuto no guarda si rounds es 0', async () => {
        const params = baseParams({ rounds: 0 });
        const { result } = renderHook(() => useGamePersistence(params));
        let saved;
        await act(async () => {
            saved = await result.current.saveAuto({ ...stats, continuedGame: false });
        });
        expect(saved).toBeNull();
        expect(params.endGame).not.toHaveBeenCalled();
    });

    it('hasActiveGame exige usuario, personaje y rondas', () => {
        const { result } = renderHook(() => useGamePersistence(baseParams()));
        expect(result.current.hasActiveGame()).toBe(true);

        const noChar = renderHook(() => useGamePersistence(baseParams({ character: null })));
        expect(noChar.result.current.hasActiveGame()).toBe(false);

        const noRounds = renderHook(() => useGamePersistence(baseParams({ rounds: 0 })));
        expect(noRounds.result.current.hasActiveGame()).toBe(false);
    });

    it('hasCharacter solo exige personaje elegido', () => {
        const { result } = renderHook(() => useGamePersistence(baseParams()));
        expect(result.current.hasCharacter()).toBe(true);

        const noChar = renderHook(() => useGamePersistence(baseParams({ character: null })));
        expect(noChar.result.current.hasCharacter()).toBe(false);

        // Ronda 0 con personaje ya cuenta como partida existente
        const roundZero = renderHook(() => useGamePersistence(baseParams({ rounds: 0 })));
        expect(roundZero.result.current.hasCharacter()).toBe(true);
    });

    it('los errores de guardado se capturan sin propagar', async () => {
        const params = baseParams({ endGame: vi.fn().mockRejectedValue(new Error('backend caido')) });
        const { result } = renderHook(() => useGamePersistence(params));
        await act(async () => {
            await result.current.saveExit({ ...stats, victory: false, reason: 'test' });
        });
        expect(params.endGame).toHaveBeenCalledTimes(1);
    });
});
