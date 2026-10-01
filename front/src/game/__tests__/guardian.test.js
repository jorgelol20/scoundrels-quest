import { describe, it, expect } from 'vitest';
import {
    applyPassiveToState,
    CHARACTER_DEFAULTS,
    GUARDIAN_FLAT_REDUCTION,
    calcGuardianStanceDamage,
    elfCaltrops,
    isGuardianTarget,
} from '../characters.js';
import { calcCombatDamage, applyGuardianMitigation } from '../combat.js';

const E = (valor, palo) => ({ valor, palo, key: `${palo}-${valor}` });

describe('guardian: pasiva', () => {
    it('activa flag isGuardian', () => {
        const { state, handled } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'guardian');
        expect(handled).toBe(true);
        expect(state.isGuardian).toBe(true);
    });

    it('flat es 1 y solo aplica a Pica/Trebol', () => {
        expect(GUARDIAN_FLAT_REDUCTION).toBe(1);
        expect(isGuardianTarget(E(5, 'Pica'))).toBe(true);
        expect(isGuardianTarget(E(5, 'Trebol'))).toBe(true);
        expect(isGuardianTarget({ valor: 16, palo: 'Miniboss', key: 'm' })).toBe(false);
        expect(isGuardianTarget(E(5, 'Corazon'))).toBe(false);
    });
});

describe('guardian: stance', () => {
    it('reduce 50% con floor', () => {
        expect(calcGuardianStanceDamage(7)).toBe(3);
        expect(calcGuardianStanceDamage(1)).toBe(0);
        expect(calcGuardianStanceDamage(0)).toBe(0);
    });

    it('orden: primero 50%, luego -1, suelo 0', () => {
        expect(applyGuardianMitigation(7, { flat: 1, stance: true })).toBe(2);
        expect(applyGuardianMitigation(1, { flat: 1, stance: true })).toBe(0);
        expect(applyGuardianMitigation(5, { flat: 1, stance: false })).toBe(4);
        expect(applyGuardianMitigation(5)).toBe(5);
    });

    it('calcCombatDamage aplica guardian sin cambiar el resto', () => {
        const base = {
            enemyValor: 8, palo: 'Pica', hasWeapon: false,
            lastSlainValor: undefined, slainCount: 0, ricochet: false,
            weaponDmg: 0, tameDamage: 0, blacksmithDmg: 0, mma: 0,
            pentakillTargetNumber: 99, pentakillDmg: 0, actualStreak: 0,
            userExtraDmg: 0, userPermanentExtraDmg: 0, userDmgMultiplier: 1,
            enemyDmgMultiplier: 1, enemyExtraDmg: 0, dmgReduction: 0,
            spadesExtra: 0, clubsExtra: 0, criticalPercentage: 0, criticalRoll: 99,
        };
        expect(calcCombatDamage(base).finalDmg).toBe(8);
        expect(calcCombatDamage({ ...base, guardian: { flat: 1, stance: false } }).finalDmg).toBe(7);
        expect(calcCombatDamage({ ...base, guardian: { flat: 1, stance: true } }).finalDmg).toBe(3);
    });
});

describe('elfo: minibosses exentos', () => {
    it('no toca al miniboss entre las dos últimas', () => {
        const room = [E(10, 'Pica'), E(9, 'Trebol'), E(8, 'Pica'), { valor: 16, palo: 'Miniboss', key: 'm' }];
        const r = elfCaltrops(room);
        expect(r.room.map((c) => c.valor)).toEqual([10, 9, 3, 16]);
        expect(r.weakened).toEqual([{ prevValor: 8, valor: 3, palo: 'Pica' }]);
    });

    it('con 2 o menos el miniboss queda intacto', () => {
        const r = elfCaltrops([E(7, 'Pica'), { valor: 16, palo: 'Miniboss', key: 'm' }]);
        expect(r.room.map((c) => c.valor)).toEqual([2, 16]);
        expect(r.weakened).toEqual([{ prevValor: 7, valor: 2, palo: 'Pica' }]);
    });
});
