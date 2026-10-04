import { describe, it, expect } from 'vitest';
import {
    applyPassiveToState,
    CHARACTER_DEFAULTS,
    rollAlchemistHeal,
    rollAlchemistDmg,
    calcAlchemistHealBonus,
    rollAlchemistPotion,
    calcPotionHeal,
} from '../characters.js';

describe('alquimista: pasiva', () => {
    it('activa flag isAlchemist', () => {
        const { state, handled } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'alquimista');
        expect(handled).toBe(true);
        expect(state.isAlchemist).toBe(true);
    });

    it('tiradas independientes al 50% (cortes 49/50)', () => {
        expect(rollAlchemistHeal(49)).toBe(true);
        expect(rollAlchemistHeal(50)).toBe(false);
        expect(rollAlchemistDmg(0)).toBe(true);
        expect(rollAlchemistDmg(99)).toBe(false);
    });

    it('bonus +25% con suelo', () => {
        expect(calcAlchemistHealBonus(4)).toBe(1);
        expect(calcAlchemistHealBonus(10)).toBe(2);
        expect(calcAlchemistHealBonus(1)).toBe(0);
        expect(calcAlchemistHealBonus(0)).toBe(0);
    });
});

describe('alquimista: pociones', () => {
    it('cortes 25/50/75', () => {
        expect(rollAlchemistPotion(0)).toBe('heal');
        expect(rollAlchemistPotion(24)).toBe('heal');
        expect(rollAlchemistPotion(25)).toBe('force');
        expect(rollAlchemistPotion(49)).toBe('force');
        expect(rollAlchemistPotion(50)).toBe('greed');
        expect(rollAlchemistPotion(74)).toBe('greed');
        expect(rollAlchemistPotion(75)).toBe('speed');
        expect(rollAlchemistPotion(99)).toBe('speed');
    });

    it('poción curativa por umbral de vida', () => {
        expect(calcPotionHeal({ health: 15, maxHealth: 20 })).toBe(2);
        expect(calcPotionHeal({ health: 5, maxHealth: 20 })).toBe(4);
        expect(calcPotionHeal({ health: 10, maxHealth: 20 })).toBe(3);
    });
});
