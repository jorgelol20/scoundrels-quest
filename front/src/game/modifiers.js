/**
 * Modificadores puros (Fase 1).
 * Extraído de GamePage.jsx `applyEffect` sin cambios de comportamiento.
 *
 * Patrón: (state, effect, extra) => { state, handled, events }.
 * - Los casos aritméticos/booleanos mutan una copia del estado plano.
 * - Los casos con contexto/mazo (chest_rewards, delete, clean, covenant)
 *   devuelven eventos que el adaptador de GamePage ejecuta con las
 *   funciones existentes (setModifierWeapon, handleDeleteSuit, ...).
 * - Sin React, sin lodash, sin Math.random, sin imports de contexto.
 */

export const MODIFIER_DEFAULTS = {
    pentakillTargetNumber: 0,
    pentakillDmg: 0,
    healthSteal: false,
    clubsExtraTakedDmg: 0,
    spadesExtraTakedDmg: 0,
    enemyDmgMultiplier: 1,
    enemyExtraDmg: 0,
    maxScapes: 1,
    actualScapes: 1,
    maxHealth: 20,
    health: 20,
    ricochet: false,
    goldMultiplier: 1,
    grandma: false,
    mma: 0,
    criticalPercentage: 0,
    tacticalChange: 0,
    expert: false,
    extraHealthExpert: 0,
    scavenger: false,
    vitamine: false,
    gluttony: false,
    interest: 0,
    thanatophobia: false,
    thanatophobiaActivated: false,
    lifeward: false,
    refund: false,
    membership: false,
    catEye: false,
    amego: false,
    regeneratorGoalTurns: 0,
    regeneratorHealth: 0,
    regeneratorTurns: 0,
    adrenalin: false,
    adrenalinActivated: false,
    midas: false,
};

/**
 * @param {object} state snapshot plano (ver MODIFIER_DEFAULTS)
 * @param {{name:string,value?:any}|null|undefined} effect
 * @param {{enemysDefeated?:number}} extra datos de solo lectura (para `expert`)
 * @returns {{state:object, handled:boolean, events:Array}}
 */
export const applyModifierToState = (state, effect, extra = {}) => {
    const name = effect?.name;
    if (!name) {
        return { state, handled: false, events: [] };
    }

    switch (name) {
        case 'chest_rewards': {
            const values = Array.isArray(effect?.value) ? effect.value : [];
            return { state, handled: true, events: [{ type: 'chestRewards', values }] };
        }
        case 'pentakill_target_number':
            if (state.pentakillTargetNumber < effect?.value) {
                return { state: { ...state, pentakillTargetNumber: effect?.value }, handled: true, events: [] };
            }
            return { state, handled: true, events: [] };
        case 'pentakill_dmg':
            if (state.pentakillDmg < effect?.value) {
                return { state: { ...state, pentakillDmg: effect?.value }, handled: true, events: [] };
            }
            return { state, handled: true, events: [] };
        case 'health_steal':
            return { state: { ...state, healthSteal: true }, handled: true, events: [] };
        case 'user_clubs_dmg':
            return {
                state: { ...state, clubsExtraTakedDmg: state.clubsExtraTakedDmg + effect.value },
                handled: true,
                events: [],
            };
        case 'user_spades_dmg':
            return {
                state: { ...state, spadesExtraTakedDmg: state.spadesExtraTakedDmg + effect.value },
                handled: true,
                events: [],
            };
        case 'enemy_dmg_multiplier':
            return {
                state: { ...state, enemyDmgMultiplier: state.enemyDmgMultiplier * effect.value },
                handled: true,
                events: [],
            };
        case 'enemy_extra_dmg':
            return {
                state: { ...state, enemyExtraDmg: state.enemyExtraDmg + effect.value },
                handled: true,
                events: [],
            };
        case 'max_scapes':
            return {
                state: {
                    ...state,
                    maxScapes: state.maxScapes + effect.value,
                    actualScapes: state.actualScapes + effect.value,
                },
                handled: true,
                events: [],
            };
        case 'max_hp':
            return {
                state: {
                    ...state,
                    maxHealth: state.maxHealth + effect.value,
                    health: state.health + effect.value,
                },
                handled: true,
                events: [],
            };
        case 'ricochet':
            return { state: { ...state, ricochet: true }, handled: true, events: [] };
        case 'gold_multiplier':
            return {
                state: { ...state, goldMultiplier: Math.max(state.goldMultiplier, effect.value) },
                handled: true,
                events: [],
            };
        case 'grandma':
            return { state: { ...state, grandma: true }, handled: true, events: [] };
        case 'mma':
            if (state.mma < effect.value) {
                return { state: { ...state, mma: effect.value }, handled: true, events: [] };
            }
            return { state, handled: true, events: [] };
        case 'critical_percentage':
            if (state.criticalPercentage < effect.value) {
                return { state: { ...state, criticalPercentage: effect.value }, handled: true, events: [] };
            }
            return { state, handled: true, events: [] };
        case 'tactical_change':
            if (state.tacticalChange < effect.value) {
                return { state: { ...state, tacticalChange: effect.value }, handled: true, events: [] };
            }
            return { state, handled: true, events: [] };
        case 'expert': {
            const extraHealth = Math.max(0, Math.min(10, Math.floor((extra.enemysDefeated ?? 0) / 20)));
            return {
                state: {
                    ...state,
                    expert: true,
                    extraHealthExpert: extraHealth,
                    maxHealth: state.maxHealth + extraHealth,
                },
                handled: true,
                events: [],
            };
        }
        case 'scavenger':
            return { state: { ...state, scavenger: true }, handled: true, events: [] };
        case 'vitamine':
            return { state: { ...state, vitamine: true }, handled: true, events: [] };
        case 'gluttony':
            return { state: { ...state, gluttony: true }, handled: true, events: [] };
        case 'interest':
            return {
                state: { ...state, interest: Math.max(state.interest, effect.value) },
                handled: true,
                events: [],
            };
        case 'thanatophobia':
            return {
                state: { ...state, thanatophobia: true, thanatophobiaActivated: false },
                handled: true,
                events: [],
            };
        case 'lifeward':
            return { state: { ...state, lifeward: true }, handled: true, events: [] };
        case 'refund':
            return { state: { ...state, refund: true }, handled: true, events: [] };
        case 'delete':
            return { state, handled: true, events: [{ type: 'deleteSuit', suit: effect.value }] };
        case 'membership':
            return { state: { ...state, membership: true }, handled: true, events: [] };
        case 'clean':
            return { state, handled: true, events: [{ type: 'cleanHalf' }] };
        case 'cat_eye':
            return { state: { ...state, catEye: true }, handled: true, events: [] };
        case 'covenant':
            return { state, handled: true, events: [{ type: 'covenant' }] };
        case 'amego':
            return { state: { ...state, amego: true }, handled: true, events: [] };
        case 'regenerator': {
            const next = {
                ...state,
                regeneratorHealth: 1,
                regeneratorTurns: 0,
            };
            if (effect.value === 1 && state.regeneratorHealth == 0) {
                next.regeneratorGoalTurns = 5;
            } else if (effect.value === 2 && state.regeneratorGoalTurns > 3) {
                next.regeneratorGoalTurns = 3;
            } else if (effect.value === 3) {
                next.regeneratorGoalTurns = 1;
            }
            return { state: next, handled: true, events: [] };
        }
        case 'adrenalin':
            return {
                state: { ...state, adrenalin: true, adrenalinActivated: false },
                handled: true,
                events: [],
            };
        case 'midas':
            return { state: { ...state, midas: true }, handled: true, events: [] };
        default:
            return { state, handled: false, events: [] };
    }
};
