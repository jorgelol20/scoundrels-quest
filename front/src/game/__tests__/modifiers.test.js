import { describe, it, expect } from 'vitest';
import { applyModifierToState, MODIFIER_DEFAULTS } from '../modifiers.js';

const baseState = () => ({ ...MODIFIER_DEFAULTS });

describe('applyModifierToState', () => {
    it('pentakill solo sube (max)', () => {
        let r = applyModifierToState(baseState(), { name: 'pentakill_target_number', value: 3 });
        expect(r.state.pentakillTargetNumber).toBe(3);
        r = applyModifierToState(r.state, { name: 'pentakill_target_number', value: 2 });
        expect(r.state.pentakillTargetNumber).toBe(3);
        r = applyModifierToState(baseState(), { name: 'pentakill_dmg', value: 5 });
        expect(r.state.pentakillDmg).toBe(5);
    });

    it('health_steal y daño extra por palo acumulan', () => {
        let r = applyModifierToState(baseState(), { name: 'health_steal' });
        expect(r.state.healthSteal).toBe(true);
        r = applyModifierToState(r.state, { name: 'user_clubs_dmg', value: 2 });
        r = applyModifierToState(r.state, { name: 'user_spades_dmg', value: 1 });
        expect(r.state.clubsExtraTakedDmg).toBe(2);
        expect(r.state.spadesExtraTakedDmg).toBe(1);
    });

    it('multiplicador y extra de enemigo', () => {
        let r = applyModifierToState(baseState(), { name: 'enemy_dmg_multiplier', value: 1.5 });
        expect(r.state.enemyDmgMultiplier).toBe(1.5);
        r = applyModifierToState(r.state, { name: 'enemy_extra_dmg', value: 2 });
        expect(r.state.enemyExtraDmg).toBe(2);
    });

    it('max_scapes suma a max y actual, max_hp a vida y maxima', () => {
        let r = applyModifierToState(baseState(), { name: 'max_scapes', value: 1 });
        expect(r.state.maxScapes).toBe(2);
        expect(r.state.actualScapes).toBe(2);
        r = applyModifierToState(baseState(), { name: 'max_hp', value: 3 });
        expect(r.state.maxHealth).toBe(23);
        expect(r.state.health).toBe(23);
    });

    it('flags simples se activan', () => {
        for (const name of ['ricochet', 'grandma', 'scavenger', 'vitamine', 'gluttony', 'lifeward', 'refund', 'membership', 'cat_eye', 'amego', 'adrenalin', 'midas']) {
            const { state, handled } = applyModifierToState(baseState(), { name });
            expect(handled).toBe(true);
        }
        const { state } = applyModifierToState(baseState(), { name: 'ricochet' });
        expect(state.ricochet).toBe(true);
        const g = applyModifierToState(baseState(), { name: 'grandma' });
        expect(g.state.grandma).toBe(true);
    });

    it('gold_multiplier, mma, critical y tactical solo suben', () => {
        let r = applyModifierToState(baseState(), { name: 'gold_multiplier', value: 2 });
        expect(r.state.goldMultiplier).toBe(2);
        r = applyModifierToState(r.state, { name: 'gold_multiplier', value: 1 });
        expect(r.state.goldMultiplier).toBe(2);
        r = applyModifierToState(baseState(), { name: 'mma', value: 2 });
        expect(r.state.mma).toBe(2);
        r = applyModifierToState(baseState(), { name: 'critical_percentage', value: 10 });
        expect(r.state.criticalPercentage).toBe(10);
        r = applyModifierToState(baseState(), { name: 'tactical_change', value: 4 });
        expect(r.state.tacticalChange).toBe(4);
    });

    it('interest usa max y thanatophobia resetea activacion', () => {
        let r = applyModifierToState(baseState(), { name: 'interest', value: 3 });
        expect(r.state.interest).toBe(3);
        r = applyModifierToState({ ...baseState(), thanatophobiaActivated: true }, { name: 'thanatophobia' });
        expect(r.state.thanatophobia).toBe(true);
        expect(r.state.thanatophobiaActivated).toBe(false);
    });

    it('expert calcula +1 por cada 20 enemigos con tope 10', () => {
        const { state } = applyModifierToState(baseState(), { name: 'expert' }, { enemysDefeated: 40 });
        expect(state.expert).toBe(true);
        expect(state.extraHealthExpert).toBe(2);
        expect(state.maxHealth).toBe(22);
    });

    it('regenerator progresa 5 -> 3 -> 1 turnos', () => {
        let r = applyModifierToState(baseState(), { name: 'regenerator', value: 1 });
        expect(r.state.regeneratorGoalTurns).toBe(5);
        expect(r.state.regeneratorHealth).toBe(1);
        expect(r.state.regeneratorTurns).toBe(0);
        r = applyModifierToState(r.state, { name: 'regenerator', value: 2 });
        expect(r.state.regeneratorGoalTurns).toBe(3);
        r = applyModifierToState(r.state, { name: 'regenerator', value: 3 });
        expect(r.state.regeneratorGoalTurns).toBe(1);
    });

    it('chest_rewards, delete, clean y covenant delegan al adaptador', () => {
        expect(applyModifierToState(baseState(), { name: 'chest_rewards', value: [5] }).events)
            .toContainEqual({ type: 'chestRewards', values: [5] });
        expect(applyModifierToState(baseState(), { name: 'delete', value: 'Pica' }).events)
            .toContainEqual({ type: 'deleteSuit', suit: 'Pica' });
        expect(applyModifierToState(baseState(), { name: 'clean' }).events)
            .toContainEqual({ type: 'cleanHalf' });
        expect(applyModifierToState(baseState(), { name: 'covenant' }).events)
            .toContainEqual({ type: 'covenant' });
    });

    it('efecto desconocido o nulo no se maneja', () => {
        expect(applyModifierToState(baseState(), { name: 'inexistente' }).handled).toBe(false);
        expect(applyModifierToState(baseState(), null).handled).toBe(false);
    });
});
