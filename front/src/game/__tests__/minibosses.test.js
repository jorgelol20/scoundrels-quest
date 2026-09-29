import { describe, it, expect } from 'vitest';
import {
    getMinibossEffectName,
    planMinibossSpawn,
    planMinibossDefeat,
    countChamanPower,
    MINIBOSS_ACHIEVEMENTS,
} from '../minibosses.js';

let n = 0;
const uidMock = () => `uid-${++n}`;

const mk = (effectName, value, extra = {}) => ({
    valor: 99,
    palo: 'Miniboss',
    imagen: 'img/2Miniboss.webp',
    efectos: [{ name: effectName, value }],
    ...extra,
});

describe('getMinibossEffectName', () => {
    it('array, objeto único y nulo', () => {
        expect(getMinibossEffectName(mk('sticky', 6))).toBe('sticky');
        expect(getMinibossEffectName({ efectos: { name: 'seal' } })).toBe('seal');
        expect(getMinibossEffectName(null)).toBe(undefined);
        expect(getMinibossEffectName({})).toBe(undefined);
    });
});

describe('planMinibossSpawn', () => {
    it('nulo o sin efecto no se maneja', () => {
        expect(planMinibossSpawn(null, {}).handled).toBe(false);
        expect(planMinibossSpawn({}, {}).handled).toBe(false);
    });

    it('sticky crea la reina slime para barajar', () => {
        n = 0;
        const r = planMinibossSpawn(mk('sticky', 6), { uidFn: uidMock });
        expect(r.handled).toBe(true);
        expect(r.shuffleCards).toHaveLength(1);
        const [queen] = r.shuffleCards;
        expect(queen.palo).toBe('Miniboss');
        expect(queen.codigo).toBe('slime');
        expect(queen.valor).toBe(6);
        expect(queen.key).toBe('uid-1');
    });

    it('spider_web crea 9 partes con sprites y patch', () => {
        n = 0;
        const r = planMinibossSpawn(mk('spider_web', 6), { uidFn: uidMock });
        expect(r.handled).toBe(true);
        expect(r.shuffleCards).toHaveLength(9);
        expect(r.patch.spiderPartsLeft).toBe(9);
        const parts = r.shuffleCards;
        expect(parts.every((c) => c.codigo === 'arana' && c.valor === 6 && c.palo === 'Miniboss')).toBe(true);
        expect(parts.slice(0, 4).every((c) => c.imagen === 'img/2Miniboss-1.webp')).toBe(true);
        expect(parts.slice(4, 8).every((c) => c.imagen === 'img/2Miniboss-2.webp')).toBe(true);
        expect(parts[8].imagen).toBe('img/2Miniboss.webp');
        expect(parts.map((c) => c.key)).toEqual(parts.map((c) => c.key));
        expect(new Set(parts.map((c) => c.key)).size).toBe(9);
        expect(r.logs).toHaveLength(1);
        expect(r.logs[0]).toEqual({ key: 'logs.spiderSpawn', params: { value: 6 } });
    });

    it('chaos_force devuelve carta de chamán con poder inyectado', () => {
        n = 0;
        const r = planMinibossSpawn(mk('chaos_force', 0), { uidFn: uidMock, chamanPower: 7 });
        expect(r.handled).toBe(true);
        expect(r.chamanCard.codigo).toBe('chaman');
        expect(r.chamanCard.valor).toBe(7);
        expect(r.patch).toEqual({ chamanActive: true, chamanTurns: 0 });
    });

    it('last_pillage y hairballs van a lastCardBoss con flag', () => {
        const pillage = planMinibossSpawn(mk('last_pillage', 12), { uidFn: uidMock });
        expect(pillage.lastCardBoss.codigo).toBe('ladrona');
        expect(pillage.lastCardBoss.valor).toBe(12);
        expect(pillage.patch).toEqual({ pillageQueenActive: true });

        const guantes = planMinibossSpawn(mk('hairballs', 7), { uidFn: uidMock });
        expect(guantes.lastCardBoss.codigo).toBe('guantes');
        expect(guantes.patch).toEqual({ guantesActive: true });
    });

    it('supplies crea al Rey hada', () => {
        const r = planMinibossSpawn(mk('supplies', 30), { uidFn: uidMock });
        expect(r.shuffleCards[0].codigo).toBe('rey');
        expect(r.shuffleCards[0].valor).toBe(30);
    });

    it('mimicry reutiliza el disfraz existente', () => {
        const disguise = { imagen: 'img/8Miniboss-5.webp', valor: 5, suit: 'heart' };
        const card = { ...mk('mimicry', 16), imagen: 'img/8Miniboss.webp' };
        const r = planMinibossSpawn(card, { uidFn: uidMock, mimicDisguise: disguise, mimicRoll: 9, mimicSuit: 'heart' });
        expect(r.newDisguise).toBe(disguise);
        const [mimic] = r.shuffleCards;
        expect(mimic.codigo).toBe('mimic');
        expect(mimic.valor).toBe(16);
        expect(mimic.disfrazado).toBe(true);
        expect(mimic.disfraz).toBe(disguise);
    });

    it('mimicry genera disfraz con el roll inyectado', () => {
        const card = { ...mk('mimicry', 16), imagen: 'img/8Miniboss.webp' };
        const r = planMinibossSpawn(card, { uidFn: uidMock, mimicDisguise: null, mimicRoll: 7, mimicSuit: 'heart' });
        expect(r.newDisguise).toEqual({ imagen: 'img/8Miniboss-7.webp', valor: 7, suit: 'heart' });
        expect(r.shuffleCards[0].disfraz.valor).toBe(7);
    });
});

describe('countChamanPower', () => {
    it('cuenta Trébol y Pica en dungeon y sala', () => {
        const dungeon = [{ palo: 'Trebol' }, { palo: 'Corazon' }];
        const room = [{ palo: 'Pica' }, { palo: 'Diamante' }, { palo: 'Trebol' }];
        expect(countChamanPower(dungeon, room)).toBe(3);
    });
});

describe('planMinibossDefeat', () => {
    const ctx = (overrides = {}) => ({ activeMinibossEffect: 'sticky', spiderPartsLeft: 0, ...overrides });

    it('reina con valor 2 muere normal', () => {
        const card = { valor: 2, codigo: 'slime', efectos: [{ name: 'sticky' }] };
        const r = planMinibossDefeat(card, ctx());
        expect(r.isSticky).toBe(true);
        expect(r.isMinibossDefeated).toBe(true);
        expect(r.stickySplit).toBeNull();
        expect(r.shouldCleanMiniboss).toBe(true);
        expect(r.achievement).toBe('miniboss_slime');
    });

    it('reina con valor 8 se divide con suelo de 2', () => {
        const card = { valor: 8, codigo: 'slime', efectos: [{ name: 'sticky' }] };
        const r = planMinibossDefeat(card, ctx());
        expect(r.isMinibossDefeated).toBe(false);
        expect(r.stickySplit).toEqual({ halfValue: 4 });
        expect(r.shouldCleanMiniboss).toBe(false);
        expect(r.achievement).toBeNull();
    });

    it('reina con valor 3 no baja de 2', () => {
        const card = { valor: 3, codigo: 'slime', efectos: [{ name: 'sticky' }] };
        const r = planMinibossDefeat(card, ctx());
        expect(r.stickySplit).toEqual({ halfValue: 2 });
    });

    it('bola de pelo: logro propio sin limpiar activo', () => {
        const card = { valor: 0, codigo: 'hairball', efectos: [{ name: 'poison' }] };
        const r = planMinibossDefeat(card, ctx({ activeMinibossEffect: 'hairballs' }));
        expect(r.isMinibossDefeated).toBe(true);
        expect(r.achievement).toBe('miniboss_bola');
        expect(r.shouldCleanMiniboss).toBe(false);
    });

    it('efecto distinto al activo no limpia ni da logro', () => {
        const card = { valor: 5, codigo: 'x', efectos: [{ name: 'poison' }] };
        const r = planMinibossDefeat(card, ctx({ activeMinibossEffect: 'hairballs' }));
        expect(r.shouldCleanMiniboss).toBe(false);
        expect(r.achievement).toBeNull();
    });

    it('parte de araña descuenta y fija telaraña', () => {
        const card = { valor: 6, codigo: 'arana', efectos: [{ name: 'spider_web' }] };
        const r = planMinibossDefeat(card, ctx({ activeMinibossEffect: 'spider_web', spiderPartsLeft: 5 }));
        expect(r.isSpiderPart).toBe(true);
        expect(r.spiderLeft).toBe(4);
        expect(r.shouldCleanMiniboss).toBe(false);
        expect(r.logs[0]).toEqual({ key: 'logs.spiderWeb', params: {} });
        expect(r.logs[1]).toEqual({ key: 'logs.spiderPartsLeft', params: { left: 4 } });
    });

    it('última parte limpia y da logro', () => {
        const card = { valor: 6, codigo: 'arana', efectos: [{ name: 'spider_web' }] };
        const r = planMinibossDefeat(card, ctx({ activeMinibossEffect: 'spider_web', spiderPartsLeft: 1 }));
        expect(r.spiderLeft).toBe(0);
        expect(r.spiderCleared).toBe(true);
        expect(r.shouldCleanMiniboss).toBe(true);
        expect(r.achievement).toBe('miniboss_arana');
        expect(r.logs.map((l) => l.key)).toContain('logs.spiderDefeated');
    });

    it('rey hada añade su log al limpiar', () => {
        const card = { valor: 2, codigo: 'rey', efectos: [{ name: 'supplies' }] };
        const r = planMinibossDefeat(card, ctx({ activeMinibossEffect: 'supplies' }));
        expect(r.shouldCleanMiniboss).toBe(true);
        expect(r.achievement).toBe('miniboss_hada');
        expect(r.logs).toEqual([{ key: 'logs.fairyKingDefeated', params: {} }]);
    });

    it('tabla de logros completa', () => {
        expect(MINIBOSS_ACHIEVEMENTS).toEqual({
            sticky: 'miniboss_slime',
            spider_web: 'miniboss_arana',
            chaos_force: 'miniboss_chaman',
            last_pillage: 'miniboss_ladrona',
            supplies: 'miniboss_hada',
            hairballs: 'miniboss_guantes',
            mimicry: 'miniboss_mimico',
        });
    });
});
