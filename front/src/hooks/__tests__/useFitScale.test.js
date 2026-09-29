// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useFitScale } from '../useFitScale.js';

afterEach(() => {
    cleanup();
});

describe('useFitScale', () => {
    it('escala inicial 1 sin observador (jsdom no tiene ResizeObserver)', () => {
        const { result } = renderHook(() => useFitScale(200, 170));
        const [ref, scale] = result.current;
        expect(typeof ref).toBe('function');
        expect(scale).toBe(1);
    });

    it('el tope se aplica desde el inicio', () => {
        const { result } = renderHook(() => useFitScale(200, 170, 0.6));
        expect(result.current[1]).toBe(0.6);
    });
});
