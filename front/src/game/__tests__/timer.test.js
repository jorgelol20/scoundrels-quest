import { describe, it, expect } from 'vitest';
import { formatTime } from '../../hooks/game/useTimer.js';

describe('formatTime', () => {
    it('0 segundos', () => {
        expect(formatTime(0)).toBe('Tiempo: 00:00');
    });

    it('menos de un minuto', () => {
        expect(formatTime(5)).toBe('Tiempo: 00:05');
    });

    it('minutos y segundos', () => {
        expect(formatTime(65)).toBe('Tiempo: 01:05');
    });

    it('diez minutos', () => {
        expect(formatTime(600)).toBe('Tiempo: 10:00');
    });
});
