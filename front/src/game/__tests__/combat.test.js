import { describe, it, expect } from 'vitest';
import {
    calcCombatDamage,
    calcGoldReward,
    resolveDeath,
    calcWeaponLifesteal,
    calcBarehandLifesteal,
} from '../combat.js';

const baseInput = (overrides = {}) => ({
    enemyValor: 10,
    palo: 'Pica',
    hasWeapon: true,
    lastSlainValor: 12,
    slainCount: 1,
    ricochet: false,
    weaponDmg: 8,
    tameDamage: 0,
    blacksmithDmg: 0,
    mma: 0,
    pentakillTargetNumber: 0,
    pentakillDmg: 0,
    actualStreak: 0,
    userExtraDmg: 0,
    userPermanentExtraDmg: 0,
    userDmgMultiplier: 1,
    enemyDmgMultiplier: 1,
    enemyExtraDmg: 0,
    dmgReduction: 0,
    spadesExtra: 0,
    clubsExtra: 0,
    criticalPercentage: 0,
    criticalRoll: 50,
    ...overrides,
});

describe('calcCombatDamage con arma', () => {
    it('arma superior al último slain: daño reducido y slain', () => {
        const r = calcCombatDamage(baseInput());
        expect(r.canUseWeapon).toBe(true);
        expect(r.isSlain).toBe(true);
        expect(r.enemyBaseDmg).toBe(10);
        expect(r.finalUserDmg).toBe(8);
        expect(r.finalDmg).toBe(2);
    });

    it('sin slain previos el arma siempre vale', () => {
        const r = calcCombatDamage(baseInput({ slainCount: 0, lastSlainValor: undefined }));
        expect(r.canUseWeapon).toBe(true);
    });

    it('enemigo mayor o igual sin ricochet: sin arma', () => {
        const r = calcCombatDamage(baseInput({ enemyValor: 12 }));
        expect(r.canUseWeapon).toBe(false);
        expect(r.isSlain).toBe(false);
    });

    it('ricochet permite igualar al último slain', () => {
        const r = calcCombatDamage(baseInput({ enemyValor: 12, ricochet: true }));
        expect(r.canUseWeapon).toBe(true);
    });

    it('sin arma en mano nunca hay canUseWeapon', () => {
        const r = calcCombatDamage(baseInput({ hasWeapon: false }));
        expect(r.canUseWeapon).toBe(false);
    });
});

describe('calcCombatDamage desarmado', () => {
    it('usa mma y no slain', () => {
        const r = calcCombatDamage(baseInput({ hasWeapon: false, mma: 3 }));
        expect(r.finalUserDmg).toBe(3);
        expect(r.finalDmg).toBe(7);
        expect(r.isSlain).toBe(false);
    });
});

describe('modificadores de daño', () => {
    it('crítico multiplica x1.5', () => {
        const r = calcCombatDamage(baseInput({ criticalPercentage: 10, criticalRoll: 5 }));
        expect(r.criticalMultiplier).toBe(1.5);
        expect(r.finalUserDmg).toBe(12);
    });

    it('sin crítico el multiplicador es 1', () => {
        const r = calcCombatDamage(baseInput({ criticalPercentage: 10, criticalRoll: 50 }));
        expect(r.criticalMultiplier).toBe(1);
    });

    it('pentakill suma cuando la racha alcanza el objetivo', () => {
        const r = calcCombatDamage(baseInput({
            pentakillTargetNumber: 3, pentakillDmg: 5, actualStreak: 3,
        }));
        expect(r.pentakill).toBe(5);
        expect(r.finalDmg).toBe(0);
    });

    it('daño extra por palo solo al suyo', () => {
        const pica = calcCombatDamage(baseInput({ spadesExtra: 2, clubsExtra: 9 }));
        expect(pica.extraSuitDmg).toBe(2);
        const trebol = calcCombatDamage(baseInput({ palo: 'Trebol', spadesExtra: 2, clubsExtra: 9 }));
        expect(trebol.extraSuitDmg).toBe(9);
        const corazon = calcCombatDamage(baseInput({ palo: 'Corazon', spadesExtra: 2 }));
        expect(corazon.extraSuitDmg).toBe(0);
    });

    it('reducción y multiplicadores enemigos', () => {
        const r = calcCombatDamage(baseInput({
            enemyDmgMultiplier: 1.5, enemyExtraDmg: 1, dmgReduction: 2,
        }));
        expect(r.enemyBaseDmg).toBe(14);
    });
});

describe('calcGoldReward', () => {
    it('base 5 normal y 10 apostador', () => {
        expect(calcGoldReward({ isGambler: false, goldMultiplier: 1 })).toBe(5);
        expect(calcGoldReward({ isGambler: true, goldMultiplier: 1 })).toBe(10);
        expect(calcGoldReward({ isGambler: true, goldMultiplier: 2 })).toBe(20);
    });
});

describe('resolveDeath', () => {
    it('revive restaura reviveHealth y lo consume', () => {
        const r = resolveDeath({ health: 3, dmg: 5, revive: true, reviveHealth: 4, lifeward: false });
        expect(r).toEqual({ health: 4, survivedVia: 'revive', consumeRevive: true, consumeLifeward: false });
    });

    it('revive con 0 restaura al menos 1', () => {
        const r = resolveDeath({ health: 3, dmg: 5, revive: true, reviveHealth: 0, lifeward: false });
        expect(r.health).toBe(1);
    });

    it('lifeward deja a 1 y lo consume', () => {
        const r = resolveDeath({ health: 2, dmg: 5, revive: false, reviveHealth: 0, lifeward: true });
        expect(r).toEqual({ health: 1, survivedVia: 'lifeward', consumeRevive: false, consumeLifeward: true });
    });

    it('daño normal nunca baja de 0', () => {
        const r = resolveDeath({ health: 8, dmg: 3, revive: true, reviveHealth: 4, lifeward: true });
        expect(r).toEqual({ health: 5, survivedVia: 'none', consumeRevive: false, consumeLifeward: false });
    });
});

describe('lifesteal', () => {
    it('con arma roba hasta el tope', () => {
        expect(calcWeaponLifesteal({
            antiheal: false, healthSteal: true, isVampire: false,
            enemyValor: 5, weaponDmg: 8, userExtraDmg: 0, maxHealthSteal: 3,
        })).toBe(3);
    });

    it('antiheal lo anula', () => {
        expect(calcWeaponLifesteal({
            antiheal: true, healthSteal: true, isVampire: false,
            enemyValor: 5, weaponDmg: 8, userExtraDmg: 0, maxHealthSteal: 3,
        })).toBe(0);
    });

    it('desarmado solo el vampiro roba', () => {
        expect(calcBarehandLifesteal({
            antiheal: false, isVampire: true, enemyValor: 4, finalUserDmg: 9, maxHealthSteal: 10,
        })).toBe(5);
        expect(calcBarehandLifesteal({
            antiheal: false, isVampire: false, enemyValor: 4, finalUserDmg: 9, maxHealthSteal: 10,
        })).toBe(0);
    });
});
