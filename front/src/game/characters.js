/**
 * Personajes puros (Fase 4).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 *
 * Pasiva, susto del guerrero, abrojos del elfo y coste del vampiro
 * como datos: sin React, sin setState, sin contexto, sin Math.random.
 * Los logs y el commit al estado/refs los hace el adaptador de GamePage.
 */

export const CHARACTER_DEFAULTS = {
    isWarrior: false,
    maxHealth: 20,
    health: 20,
    maxScapes: 1,
    actualScapes: 1,
    isWizard: false,
    isGambler: false,
    gold: 0,
    blacksmithDmg: 0,
    isVampire: false,
    maxHealthSteal: 3,
    tameDamage: 0,
};

const isEnemy = (card) => card?.palo === 'Pica' || card?.palo === 'Trebol';

/**
 * Pasiva al empezar la primera ronda.
 * @param {object} state snapshot plano (ver CHARACTER_DEFAULTS)
 * @param {string|null|undefined} charCode codigo de habilidad_personaje
 * @returns {{state:object, handled:boolean}}
 */
export const applyPassiveToState = (state, charCode) => {
    if (!charCode) {
        return { state, handled: false };
    }
    switch (charCode) {
        case 'guerrero':
            return { state: { ...state, isWarrior: true }, handled: true };
        case 'paladin':
            return { state: { ...state, maxHealth: 25, health: 25 }, handled: true };
        case 'elfo':
            return { state: { ...state, maxScapes: 2, actualScapes: 2 }, handled: true };
        case 'mago':
            return { state: { ...state, isWizard: true }, handled: true };
        case 'apostador':
            return { state: { ...state, isGambler: true, gold: 50 }, handled: true };
        case 'herrero':
            return { state: { ...state, blacksmithDmg: 1 }, handled: true };
        case 'vampiro':
            return { state: { ...state, isVampire: true, maxHealthSteal: 10 }, handled: true };
        case 'domador':
            return { state: { ...state, tameDamage: 1 }, handled: true };
        default:
            return { state, handled: false };
    }
};

/**
 * Susto del guerrero: hasta 2 enemigos huyen al fondo del mazo y se
 * repone desde el tope (final del array). Sin enemigos no toca nada.
 * No muta las entradas.
 *
 * @param {Array} room sala actual
 * @param {Array} dungeon mazo actual (tope = final)
 * @returns {{room:Array, dungeon:Array, scared:Array}}
 */
export const warriorScare = (room, dungeon) => {
    const allEnemys = room.filter(isEnemy);
    const scared = allEnemys.slice(0, 2);
    if (scared.length === 0) {
        return { room, dungeon, scared };
    }
    const currentDungeon = [...dungeon];
    const drawn = [];
    for (let i = 0; i < scared.length && currentDungeon.length > 0; i++) {
        drawn.push(currentDungeon.pop());
    }
    const newDungeon = [...scared, ...currentDungeon];
    const remainingEnemys = allEnemys.slice(2);
    const noEnemys = room.filter((card) => !isEnemy(card));
    return { room: [...drawn, ...remainingEnemys, ...noEnemys], dungeon: newDungeon, scared };
};

/**
 * Abrojos del elfo: -5 a las dos últimas cartas (toda la sala si hay
 * 2 o menos), con suelo de 0. No muta la entrada.
 *
 * @param {Array} room sala actual
 * @returns {{room:Array, weakened:Array<{prevValor:number, valor:number, palo:string|undefined}>}}
 */
export const elfCaltrops = (room) => {
    const weaken = (card) => ({ ...card, valor: Math.max(0, card?.valor - 5) });
    const describe = (card) => ({
        prevValor: card?.valor,
        valor: Math.max(0, card?.valor - 5),
        palo: card?.palo,
    });
    if (room.length <= 2) {
        return { room: room.map(weaken), weakened: room.map(describe) };
    }
    const next = room.map((card, index) =>
        (index === room.length - 1 || index === room.length - 2) ? weaken(card) : card
    );
    return { room: next, weakened: room.slice(-2).map(describe) };
};

/**
 * Coste de la habilidad del vampiro: un cuarto de la vida actual
 * a cambio de +5 de daño.
 * @param {number} health vida actual
 * @returns {{healthCost:number, newHealth:number, dmgBonus:number}}
 */
export const calcVampireAbility = (health) => {
    const healthCost = Math.floor(health / 4);
    return { healthCost, newHealth: health - healthCost, dmgBonus: 5 };
};

const isBountyTarget = (card) => card?.palo === 'Pica' || card?.palo === 'Trebol';

/**
 * Recompensa del cazador: oro extra permanente a los 2 enemigos más
 * fuertes de la sala. Los efectos existentes se conservan (el campo
 * puede venir como objeto, array o ausente). No muta la entrada.
 * Minibosses excluidos (mismo criterio que warriorScare).
 *
 * @param {Array} room sala actual
 * @returns {{room:Array, bountied:Array<{valor:number, palo:string|undefined}>}}
 */
export const applyBounty = (room) => {
    const ranked = room
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => isBountyTarget(card))
        .sort((a, b) => b.card.valor - a.card.valor || a.index - b.index)
        .slice(0, 2);
    if (ranked.length === 0) {
        return { room, bountied: [] };
    }
    const keys = new Set(ranked.map(({ card }) => card.key));
    const next = room.map((card) => {
        if (!keys.has(card?.key)) return card;
        const raw = card?.efectos;
        const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        return { ...card, especial: true, efectos: [...list, { name: 'extra_gold' }] };
    });
    return {
        room: next,
        bountied: ranked.map(({ card }) => ({ valor: card.valor, palo: card.palo })),
    };
};
