import { describe, it, expect } from 'vitest';
import { applyCardEffectToState, CARD_EFFECT_DEFAULTS, resolveSealExpiry } from '../cardEffects.js';

const baseState = () => ({
    ...CARD_EFFECT_DEFAULTS,
    isGambler: false,
    isVampire: false,
});

describe('applyCardEffectToState', () => {
    it('heal asigna currentHeal', () => {
        const { state, handled, events } = applyCardEffectToState(baseState(), { name: 'heal', value: 7 }, 7);
        expect(handled).toBe(true);
        expect(state.currentHeal).toBe(7);
        expect(events).toEqual([]);
    });

    it('dmg_reduction asigna el valor', () => {
        const { state, handled } = applyCardEffectToState(baseState(), { name: 'dmg_reduction', value: 3 }, 0);
        expect(handled).toBe(true);
        expect(state.dmgReduction).toBe(3);
    });

    it('progresive_heal asigna y progresive_heal_turns acumula', () => {
        let r = applyCardEffectToState(baseState(), { name: 'progresive_heal', value: 2 }, 0);
        expect(r.state.progresiveHeal).toBe(2);
        r = applyCardEffectToState(r.state, { name: 'progresive_heal_turns', value: 3 }, 0);
        expect(r.state.progresiveHealTurns).toBe(3);
        r = applyCardEffectToState(r.state, { name: 'progresive_heal_turns', value: 2 }, 0);
        expect(r.state.progresiveHealTurns).toBe(5);
    });

    it('weapon_dmg asigna el valor', () => {
        const { state, handled } = applyCardEffectToState(baseState(), { name: 'weapon_dmg', value: 9 }, 0);
        expect(handled).toBe(true);
        expect(state.weaponDmg).toBe(9);
    });

    it('invincibility_turns acumula turnos', () => {
        const s = { ...baseState(), invincibilityTurns: 1 };
        const { state } = applyCardEffectToState(s, { name: 'invincibility_turns', value: 2 }, 0);
        expect(state.invincibilityTurns).toBe(3);
    });

    it('revive activa y revive_health asigna', () => {
        let r = applyCardEffectToState(baseState(), { name: 'revive' }, 0);
        expect(r.state.revive).toBe(true);
        r = applyCardEffectToState(r.state, { name: 'revive_health', value: 4 }, 0);
        expect(r.state.reviveHealth).toBe(4);
    });

    it('health_steal activa con cantidad', () => {
        const { state } = applyCardEffectToState(baseState(), { name: 'health_steal', value: 2 }, 0);
        expect(state.weaponHealthSteal).toBe(true);
        expect(state.weaponHealthStealQuantity).toBe(2);
    });

    it('antiheal activa y suma 2 turnos', () => {
        const { state } = applyCardEffectToState(baseState(), { name: 'antiheal' }, 0);
        expect(state.antiheal).toBe(true);
        expect(state.antihealTurns).toBe(2);
    });

    it('weapon_breaker y poison asignan', () => {
        let r = applyCardEffectToState(baseState(), { name: 'weapon_breaker' }, 0);
        expect(r.state.breakWeapon).toBe(true);
        r = applyCardEffectToState(baseState(), { name: 'poison', value: 3 }, 0);
        expect(r.state.poison).toBe(3);
    });

    it('restore_ability limpia sello y reactiva si no es gambler/vampiro', () => {
        const s = { ...baseState(), sealTurns: 3, currentHeal: 5, availableAbility: false };
        const { state, handled } = applyCardEffectToState(s, { name: 'restore_ability' }, 0);
        expect(handled).toBe(true);
        expect(state.sealTurns).toBe(0);
        expect(state.currentHeal).toBe(0);
        expect(state.availableAbility).toBe(true);
    });

    it('restore_ability no reactiva si es gambler', () => {
        const s = { ...baseState(), isGambler: true, availableAbility: false, sealTurns: 2 };
        const { state } = applyCardEffectToState(s, { name: 'restore_ability' }, 0);
        expect(state.availableAbility).toBe(false);
        expect(state.sealTurns).toBe(0);
    });

    it('heal_roulete delega con evento y logro gelatina', () => {
        const { handled, events, state } = applyCardEffectToState(baseState(), { name: 'heal_roulete' }, 0);
        expect(handled).toBe(true);
        expect(events).toContainEqual({ type: 'healRoulette' });
        expect(events).toContainEqual({ type: 'achievement', id: 'gelatina' });
        expect(state.currentHeal).toBe(0);
    });

    it.each([
        ['thorny', 'thorny'],
        ['plunder', 'plunder'],
        ['extra_gold', 'extraGold'],
        ['mitosis', 'mitosis'],
        ['souleater', 'souleater'],
        ['seal', 'seal'],
    ])('%s delega al adaptador con evento', (name, type) => {
        const { handled, events } = applyCardEffectToState(baseState(), { name }, 8);
        expect(handled).toBe(true);
        expect(events).toContainEqual({ type, cardValue: 8 });
    });

    it('efecto desconocido o nulo no se maneja', () => {
        expect(applyCardEffectToState(baseState(), { name: 'inexistente' }, 0).handled).toBe(false);
        expect(applyCardEffectToState(baseState(), null, 0).handled).toBe(false);
        expect(applyCardEffectToState(baseState(), undefined, 0).handled).toBe(false);
    });
});

describe('resolveSealExpiry', () => {
    it('habilidad usada antes del sello sigue usada al expirar (bug sello arcano)', () => {
        expect(resolveSealExpiry({
            isGambler: false, isVampire: false, gold: 0, health: 20,
            vampireUsed: false, wasAvailable: false,
        })).toEqual({ available: false });
    });

    it('habilidad sin usar se restaura al expirar', () => {
        expect(resolveSealExpiry({
            isGambler: false, isVampire: false, gold: 0, health: 20,
            vampireUsed: false, wasAvailable: true,
        })).toEqual({ available: true });
    });

    it('apostador se rige por el oro, no por el uso', () => {
        expect(resolveSealExpiry({
            isGambler: true, isVampire: false, gold: 30, health: 20,
            vampireUsed: false, wasAvailable: false,
        })).toEqual({ available: true });
        expect(resolveSealExpiry({
            isGambler: true, isVampire: false, gold: 10, health: 20,
            vampireUsed: false, wasAvailable: true,
        })).toEqual({ available: false });
    });

    it('vampiro exige vida y sello de uso limpio', () => {
        expect(resolveSealExpiry({
            isGambler: false, isVampire: true, gold: 0, health: 10,
            vampireUsed: false, wasAvailable: true,
        })).toEqual({ available: true });
        expect(resolveSealExpiry({
            isGambler: false, isVampire: true, gold: 0, health: 10,
            vampireUsed: true, wasAvailable: true,
        })).toEqual({ available: false });
        expect(resolveSealExpiry({
            isGambler: false, isVampire: true, gold: 0, health: 4,
            vampireUsed: false, wasAvailable: true,
        })).toEqual({ available: false });
    });
});
