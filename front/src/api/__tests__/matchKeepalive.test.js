import { describe, it, expect } from 'vitest';
import { buildLossPayload } from '../matchKeepalive.js';

describe('buildLossPayload', () => {
    it('misma forma que endGame con victoria false', () => {
        expect(buildLossPayload({
            usuario_id: 7,
            personaje_id: 3,
            tiempo: 120,
            rondas: 4,
            modificadores: [1, 5],
            oro_obtenido: 30,
            vida_curada: 12,
            enemigos_enfrentados: 18,
        })).toEqual({
            usuario_id: 7,
            personaje_id: 3,
            tiempo: 120,
            victoria: false,
            rondas: 4,
            modificadores: [1, 5],
            oro_obtenido: 30,
            vida_curada: 12,
            enemigos_enfrentados: 18,
        });
    });
});
