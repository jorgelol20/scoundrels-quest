/**
 * Efectos de carta puros (Fase 1).
 * Extraído de GamePage.jsx `applyCardEffect` sin cambios de comportamiento.
 *
 * Patrón: (state, effect, cardValue) => { state, handled, events }.
 * - Los casos de asignación directa mutan una copia del estado plano.
 * - Los casos con efectos secundarios (animaciones, oro, mazo, contexto)
 *   devuelven eventos que el adaptador de GamePage ejecuta con las
 *   funciones existentes (applyThorny, applyPlunder, ...).
 * - Sin React, sin imports de contexto. Sin Math.random (heal_roulete
 *   sigue en GamePage via evento).
 */

export const CARD_EFFECT_DEFAULTS = {
    currentHeal: 0,
    dmgReduction: 0,
    progresiveHeal: 0,
    progresiveHealTurns: 0,
    weaponDmg: 0,
    invincibilityTurns: 0,
    revive: false,
    reviveHealth: 0,
    weaponHealthSteal: false,
    weaponHealthStealQuantity: 0,
    antiheal: false,
    antihealTurns: 0,
    breakWeapon: false,
    poison: 0,
    sealTurns: 0,
    availableAbility: true,
    // Solo lectura en el puro (los escribe el dueño del estado en GamePage)
    isGambler: false,
    isVampire: false,
};

const delegated = (type, cardValue) => [{ type, cardValue }];

/**
 * @param {object} state snapshot plano (ver CARD_EFFECT_DEFAULTS)
 * @param {{name:string,value?:number}|null|undefined} effect
 * @param {number} cardValue valor de la carta (para plunder/extra_gold/...)
 * @returns {{state:object, handled:boolean, events:Array}}
 */export const applyCardEffectToState = (state, effect, cardValue) => {
    const name = effect?.name;
    if (!name) {
        return { state, handled: false, events: [] };
    }

    switch (name) {
        case 'restore_ability': {
            const next = {
                ...state,
                sealTurns: 0,
                currentHeal: 0,
            };
            if (!state.isGambler && !state.isVampire) {
                next.availableAbility = true;
            }
            return { state: next, handled: true, events: [] };
        }
        case 'heal':
            return { state: { ...state, currentHeal: effect?.value }, handled: true, events: [] };
        case 'dmg_reduction':
            return { state: { ...state, dmgReduction: effect?.value }, handled: true, events: [] };
        case 'heal_roulete':
            return {
                state,
                handled: true,
                events: [{ type: 'healRoulette' }, { type: 'achievement', id: 'gelatina' }],
            };
        case 'progresive_heal':
            return { state: { ...state, progresiveHeal: effect?.value }, handled: true, events: [] };
        case 'progresive_heal_turns':
            return {
                state: { ...state, progresiveHealTurns: state.progresiveHealTurns + effect?.value },
                handled: true,
                events: [],
            };
        case 'weapon_dmg':
            return { state: { ...state, weaponDmg: effect?.value }, handled: true, events: [] };
        case 'invincibility_turns':
            return {
                state: { ...state, invincibilityTurns: state.invincibilityTurns + effect?.value },
                handled: true,
                events: [],
            };
        case 'revive':
            return { state: { ...state, revive: true }, handled: true, events: [] };
        case 'revive_health':
            return { state: { ...state, reviveHealth: effect?.value }, handled: true, events: [] };
        case 'health_steal':
            return {
                state: { ...state, weaponHealthSteal: true, weaponHealthStealQuantity: effect?.value },
                handled: true,
                events: [],
            };
        case 'antiheal':
            return {
                state: { ...state, antiheal: true, antihealTurns: state.antihealTurns + 2 },
                handled: true,
                events: [],
            };
        case 'weapon_breaker':
            return { state: { ...state, breakWeapon: true }, handled: true, events: [] };
        case 'poison':
            return { state: { ...state, poison: effect?.value }, handled: true, events: [] };
        case 'thorny':
            return { state, handled: true, events: delegated('thorny', cardValue) };
        case 'plunder':
            return { state, handled: true, events: delegated('plunder', cardValue) };
        case 'extra_gold':
            return { state, handled: true, events: delegated('extraGold', cardValue) };
        case 'mitosis':
            return { state, handled: true, events: delegated('mitosis', cardValue) };
        case 'souleater':
            return { state, handled: true, events: delegated('souleater', cardValue) };
        case 'seal':
            return { state, handled: true, events: delegated('seal', cardValue) };
        default:
            return { state, handled: false, events: [] };
    }
};

/**
 * Disponibilidad al expirar el sello arcano (fix bug: antes restauraba
 * `true` siempre para no-apostador/no-vampiro, aunque la habilidad ya
 * se hubiese usado).
 *
 * - Apostador: reutilizable mientras haya oro (>= 25), no depende del uso.
 * - Vampiro: exige vida (> 5) y sello de uso limpio.
 * - Resto: se restaura lo que había al aplicar el sello (`wasAvailable`).
 *
 * @param {object} input
 * @param {boolean} input.isGambler
 * @param {boolean} input.isVampire
 * @param {number} input.gold
 * @param {number} input.health
 * @param {boolean} input.vampireUsed
 * @param {boolean} input.wasAvailable disponibilidad al aplicar el sello
 * @returns {{available:boolean}}
 */
export const resolveSealExpiry = ({ isGambler, isVampire, gold, health, vampireUsed, wasAvailable }) => {
    if (isGambler) {
        return { available: gold >= 25 };
    }
    if (isVampire) {
        return { available: health > 5 && !vampireUsed };
    }
    return { available: wasAvailable };
};
