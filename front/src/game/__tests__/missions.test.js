import { describe, it, expect } from 'vitest';
import { advanceMission, isMissionCompleted, pickMissionOffers } from '../missions.js';

const m = (progress = 0) => ({ id: 'x', progress, claimed: false });

describe('advanceMission', () => {
    it('kills acumula y miniboss suma de uno en uno', () => {
        let r = advanceMission(m(), { tipo: 'kills', objetivo: 5 }, { kills: 1 });
        expect(r.progress).toBe(1);
        r = advanceMission(r, { tipo: 'kills', objetivo: 5 }, { kills: 1 });
        expect(r.progress).toBe(2);
        const mb = advanceMission(m(), { tipo: 'miniboss', objetivo: 1 }, { miniboss: true });
        expect(mb.progress).toBe(1);
        expect(advanceMission(m(), { tipo: 'miniboss', objetivo: 1 }, { miniboss: false }).progress).toBe(0);
    });

    it('streak/gold/rounds guardan el máximo', () => {
        expect(advanceMission(m(2), { tipo: 'streak', objetivo: 5 }, { streak: 4 }).progress).toBe(4);
        expect(advanceMission(m(4), { tipo: 'streak', objetivo: 5 }, { streak: 2 }).progress).toBe(4);
        expect(advanceMission(m(), { tipo: 'gold', objetivo: 60 }, { goldTotal: 70 }).progress).toBe(70);
        expect(advanceMission(m(), { tipo: 'rounds', objetivo: 4 }, { round: 3 }).progress).toBe(3);
    });

    it('reclamadas, sin meta o tipo desconocido no cambian', () => {
        const claimed = { id: 'x', progress: 1, claimed: true };
        expect(advanceMission(claimed, { tipo: 'kills', objetivo: 5 }, { kills: 1 })).toBe(claimed);
        const base = m();
        expect(advanceMission(base, null, { kills: 1 })).toBe(base);
        expect(advanceMission(base, { tipo: 'otro', objetivo: 1 }, {})).toBe(base);
    });
});

describe('isMissionCompleted', () => {
    it('progreso >= objetivo', () => {
        expect(isMissionCompleted(m(5), { objetivo: 5 })).toBe(true);
        expect(isMissionCompleted(m(4), { objetivo: 5 })).toBe(false);
        expect(isMissionCompleted(null, { objetivo: 5 })).toBe(false);
    });
});

describe('pickMissionOffers', () => {
    const catalog = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
    const reverse = (arr) => [...arr].reverse();

    it('excluye aceptadas y limita cantidad sin mutar', () => {
        const out = pickMissionOffers(catalog, ['d'], 3, reverse);
        expect(out.map((x) => x.id)).toEqual(['c', 'b', 'a']);
        expect(catalog.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('menos disponibles que pedidas devuelve las que hay', () => {
        expect(pickMissionOffers(catalog, ['a', 'b', 'c'], 3, reverse)).toHaveLength(1);
    });
});
