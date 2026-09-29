import { describe, it, expect } from 'vitest';
import { shouldConfirmExit } from '../../../game/navigation.js';

describe('shouldConfirmExit', () => {
    it('sin personaje no intercepta aunque sea /jugar', () => {
        expect(shouldConfirmExit('/jugar', null)).toBe(false);
        expect(shouldConfirmExit('/jugar', undefined)).toBe(false);
    });

    it('con personaje en /jugar sí pide confirmación', () => {
        expect(shouldConfirmExit('/jugar', { id: 1 })).toBe(true);
    });

    it('fuera de /jugar nunca intercepta', () => {
        expect(shouldConfirmExit('/', { id: 1 })).toBe(false);
        expect(shouldConfirmExit('/perfil/x', { id: 1 })).toBe(false);
    });
});
