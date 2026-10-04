/**
 * Cálculos de combate puros (Fase 3).
 * Extraído de GamePage.jsx `handleCombat` sin cambios de comportamiento.
 *
 * Solo matemática: sin React, sin setState, sin animaciones, sin logs.
 * La aleatoriedad (tirada de crítico) se inyecta vía `criticalRoll`
 * para poder testear de forma determinista.
 */

/**
 * Núcleo de daño de un enfrentamiento.
 *
 * @param {object} input
 * @param {number} input.enemyValor valor de la carta enemiga
 * @param {string} input.palo palo de la carta enemiga
 * @param {boolean} input.hasWeapon hay arma equipada
 * @param {number|undefined} input.lastSlainValor valor del último monstruo en el arma
 * @param {number} input.slainCount monstruos actuales en el arma
 * @param {boolean} input.ricochet modificador ricochet
 * @param {number} input.weaponDmg daño base del arma
 * @param {number} input.tameDamage bono de domador
 * @param {number} input.blacksmithDmg bono de herrero
 * @param {number} input.mma daño desarmado
 * @param {number} input.pentakillTargetNumber racha objetivo
 * @param {number} input.pentakillDmg daño bonus por racha
 * @param {number} input.actualStreak racha actual
 * @param {number} input.userExtraDmg daño extra temporal
 * @param {number} input.userPermanentExtraDmg daño extra permanente
 * @param {number} input.userDmgMultiplier multiplicador propio
 * @param {number} input.enemyDmgMultiplier multiplicador enemigo
 * @param {number} input.enemyExtraDmg daño extra enemigo
 * @param {number} input.dmgReduction reducción de daño
 * @param {number} input.spadesExtra daño extra recibido por picas
 * @param {number} input.clubsExtra daño extra recibido por tréboles
 * @param {number} input.criticalPercentage probabilidad de crítico
 * @param {number} input.criticalRoll tirada 0-99 (inyectada)
 * @param {object} [input.guardian] mitigación del guardián (namespaced para
 *   no engordar la firma con más flags: patrón para futuras mitigaciones).
 * @param {number} [input.guardian.flat] reducción plana ya decidida por el
 *   adaptador (0/1; solo Pica/Trebol, minibosses exentos)
 * @param {boolean} [input.guardian.stance] posición defensiva activa en la carta
 * @returns {{criticalMultiplier:number, pentakill:number, enemyBaseDmg:number,
 *   extraSuitDmg:number, canUseWeapon:boolean, finalUserDmg:number,
 *   finalDmg:number, isSlain:boolean}}
 */
export const calcCombatDamage = (input) => {
    const {
        enemyValor, palo, hasWeapon, lastSlainValor, slainCount, ricochet,
        weaponDmg, tameDamage, blacksmithDmg, mma,
        pentakillTargetNumber, pentakillDmg, actualStreak,
        userExtraDmg, userPermanentExtraDmg, userDmgMultiplier,
        enemyDmgMultiplier, enemyExtraDmg, dmgReduction,
        spadesExtra, clubsExtra, criticalPercentage, criticalRoll,
        guardian = {},
    } = input;
    const { flat: guardianFlat = 0, stance: guardianStance = false } = guardian;

    const criticalMultiplier = criticalRoll < criticalPercentage ? 1.5 : 1;
    const pentakill = actualStreak >= pentakillTargetNumber ? pentakillDmg : 0;
    const enemyBaseDmg = Math.floor(enemyValor * enemyDmgMultiplier) + enemyExtraDmg - dmgReduction;
    const extraSuitDmg = palo === 'Pica' ? spadesExtra : palo === 'Trebol' ? clubsExtra : 0;

    const canUseWeapon = hasWeapon && (
        slainCount === 0 ||
        enemyValor < lastSlainValor ||
        (ricochet && enemyValor <= lastSlainValor)
    );

    let finalUserDmg;
    let isSlain;
    if (canUseWeapon) {
        finalUserDmg = Math.floor(((pentakill + weaponDmg + extraSuitDmg + tameDamage + userExtraDmg + userPermanentExtraDmg + blacksmithDmg) * userDmgMultiplier) * criticalMultiplier + 0.5);
        isSlain = true;
    } else {
        finalUserDmg = Math.floor(((pentakill + extraSuitDmg + userExtraDmg + userPermanentExtraDmg + mma) * userDmgMultiplier) * criticalMultiplier + 0.5);
        isSlain = false;
    }
    const finalDmg = applyGuardianMitigation(
        Math.max(0, enemyBaseDmg - finalUserDmg),
        { flat: guardianFlat, stance: guardianStance },
    );

    return { criticalMultiplier, pentakill, enemyBaseDmg, extraSuitDmg, canUseWeapon, finalUserDmg, finalDmg, isSlain };
};

/**
 * Mitigación del guardián al daño final: primero 50% (floor) si la stance
 * cubre la carta, luego -1 plano. Suelo 0. El adaptador decide por palo
 * (solo Pica/Trebol) y por clave (mano activa); aquí solo aritmética.
 * @param {number} dmg daño final ya calculado
 * @param {{flat:number, stance:boolean}} [guardian]
 * @returns {number}
 */
export const applyGuardianMitigation = (dmg, { flat = 0, stance = false } = {}) =>
    Math.max(0, Math.floor((dmg ?? 0) * (stance ? 0.5 : 1)) - flat);

/**
 * Recompensa de oro por enemigo (base 10 apostador, 5 resto).
 * @param {{isGambler:boolean, goldMultiplier:number}} input
 * @returns {number}
 */
export const calcGoldReward = ({ isGambler, goldMultiplier }) => {
    const baseGold = isGambler ? 10 : 5;
    return Math.floor(baseGold * goldMultiplier);
};

/**
 * Resuelve la muerte: revive > lifeward > daño normal.
 * @param {{health:number, dmg:number, revive:boolean, reviveHealth:number, lifeward:boolean}} input
 * @returns {{health:number, survivedVia:'none'|'revive'|'lifeward',
 *   consumeRevive:boolean, consumeLifeward:boolean}}
 */
export const resolveDeath = ({ health, dmg, revive, reviveHealth, lifeward }) => {
    if (health - dmg <= 0 && revive) {
        // Se consume SIEMPRE la resurrección (aunque reviveHealth sea 0),
        // restaurando al menos 1 de vida.
        return {
            health: reviveHealth > 0 ? reviveHealth : 1,
            survivedVia: 'revive',
            consumeRevive: true,
            consumeLifeward: false,
        };
    }
    if (lifeward && health - dmg <= 0) {
        return { health: 1, survivedVia: 'lifeward', consumeRevive: false, consumeLifeward: true };
    }
    return {
        health: Math.max(0, health - dmg),
        survivedVia: 'none',
        consumeRevive: false,
        consumeLifeward: false,
    };
};

/**
 * Robo de vida con arma (healthSteal o vampiro).
 * @returns {number} vida a robar (0 si no aplica)
 */
export const calcWeaponLifesteal = ({
    antiheal, healthSteal, isVampire, enemyValor, weaponDmg, userExtraDmg, maxHealthSteal,
}) => {
    if (antiheal) {
        return 0;
    }
    if ((healthSteal || isVampire) && enemyValor < (weaponDmg + (isVampire ? userExtraDmg : 0))) {
        return Math.min(maxHealthSteal, (weaponDmg + (isVampire ? userExtraDmg : 0)) - enemyValor);
    }
    return 0;
};

/**
 * Robo de vida desarmado (solo vampiro).
 * @returns {number} vida a robar (0 si no aplica)
 */
export const calcBarehandLifesteal = ({ antiheal, isVampire, enemyValor, finalUserDmg, maxHealthSteal }) => {
    if (antiheal) {
        return 0;
    }
    if (isVampire && enemyValor < finalUserDmg) {
        return Math.min(maxHealthSteal, finalUserDmg - enemyValor);
    }
    return 0;
};
