import { describe, it, expect } from 'vitest';
import { isHalloweenSeason, normalizeThemePreference, resolveSeasonalTheme } from '../season.js';

describe('isHalloweenSeason', () => {
    it('false el 30 de septiembre', () => {
        expect(isHalloweenSeason(new Date(2026, 8, 30, 12))).toBe(false);
    });
    it('true del 1 al 31 de octubre', () => {
        expect(isHalloweenSeason(new Date(2026, 9, 1, 0, 0))).toBe(true);
        expect(isHalloweenSeason(new Date(2026, 9, 15, 12))).toBe(true);
        expect(isHalloweenSeason(new Date(2026, 9, 31, 23, 59))).toBe(true);
    });
    it('false el 1 de noviembre', () => {
        expect(isHalloweenSeason(new Date(2026, 10, 1, 0))).toBe(false);
    });
    it('false con fecha inválida', () => {
        expect(isHalloweenSeason(new Date('nope'))).toBe(false);
    });
});

describe('resolveSeasonalTheme', () => {
    it('auto: halloween en octubre, default fuera', () => {
        expect(resolveSeasonalTheme(new Date(2026, 9, 10), 'auto')).toBe('halloween');
        expect(resolveSeasonalTheme(new Date(2026, 5, 10), 'auto')).toBe('default');
    });
    it('el override manual manda sobre la fecha', () => {
        expect(resolveSeasonalTheme(new Date(2026, 9, 10), 'default')).toBe('default');
        expect(resolveSeasonalTheme(new Date(2026, 5, 10), 'halloween')).toBe('halloween');
    });
    it('preferencia desconocida cae a auto', () => {
        expect(normalizeThemePreference('calabaza')).toBe('auto');
        expect(resolveSeasonalTheme(new Date(2026, 9, 10), 'calabaza')).toBe('halloween');
    });
});
