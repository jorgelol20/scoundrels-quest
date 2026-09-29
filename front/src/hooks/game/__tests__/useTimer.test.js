// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer.js';

afterEach(() => {
    vi.useRealTimers();
});

describe('useTimer', () => {
    it('start avanza timeRef cada segundo', () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useTimer());
        act(() => {
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(result.current.timeRef.current).toBe(3);
    });

    it('stop detiene el avance', () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useTimer());
        act(() => {
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        act(() => {
            result.current.stop();
        });
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(result.current.timeRef.current).toBe(2);
    });

    it('reset deja a cero', () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useTimer());
        act(() => {
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        act(() => {
            result.current.reset();
        });
        expect(result.current.timeRef.current).toBe(0);
    });

    it('start es idempotente (no duplica intervalos)', () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useTimer());
        act(() => {
            result.current.start();
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(result.current.timeRef.current).toBe(2);
    });

    it('desmontar limpia el intervalo sin errores', () => {
        vi.useFakeTimers();
        const { result, unmount } = renderHook(() => useTimer());
        act(() => {
            result.current.start();
        });
        expect(() => unmount()).not.toThrow();
    });
});
