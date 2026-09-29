import { describe, it, expect } from 'vitest';
import { shouldStartNewGame } from '../boot.js';

describe('shouldStartNewGame (fix arranque en recarga /jugar)', () => {
    it('no arranca mientras el provider sigue cargando', () => {
        expect(shouldStartNewGame({ gameLoading: true, alreadyStarted: false, baseDeckSize: 40 }))
            .toBe(false);
    });

    it('no arranca con baseDeck vacío aunque loading diga false (recarga)', () => {
        // restartFunction fuerza gameLoading=false antes del load del provider.
        expect(shouldStartNewGame({ gameLoading: false, alreadyStarted: false, baseDeckSize: 0 }))
            .toBe(false);
    });

    it('arranca una sola vez con datos listos', () => {
        expect(shouldStartNewGame({ gameLoading: false, alreadyStarted: false, baseDeckSize: 40 }))
            .toBe(true);
    });

    it('no rearranca una vez iniciado', () => {
        expect(shouldStartNewGame({ gameLoading: false, alreadyStarted: true, baseDeckSize: 40 }))
            .toBe(false);
    });
});
