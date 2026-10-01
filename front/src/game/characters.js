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
    isSpectre: false,
    isAlchemist: false,
    isGuardian: false,
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
        case 'espectro':
            return { state: { ...state, isSpectre: true }, handled: true };
        case 'alquimista':
            return { state: { ...state, isAlchemist: true }, handled: true };
        case 'guardian':
            return { state: { ...state, isGuardian: true }, handled: true };
        default:
            return { state, handled: false };
    }
};

/**
 * Susto del guerrero: hasta 2 enemigos huyen al fondo del mazo y se
 * repone desde el tope (final del array). Sin enemigos no toca nada.
 * No muta las entradas.
 *
 * @param {Array} room mano actual
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
 * Abrojos del elfo: -5 a las dos últimas cartas de la mano (toda la mano si hay
 * 2 o menos), con suelo de 0. Minibosses (palo 'Miniboss') exentos.
 * No muta la entrada.
 *
 * @param {Array} room mano actual
 * @returns {{room:Array, weakened:Array<{prevValor:number, valor:number, palo:string|undefined}>}}
 */
export const elfCaltrops = (room) => {
    const isExempt = (card) => card?.palo === 'Miniboss';
    const weaken = (card) => (isExempt(card) ? card : { ...card, valor: Math.max(0, card?.valor - 5) });
    const describe = (card) => ({
        prevValor: card?.valor,
        valor: Math.max(0, card?.valor - 5),
        palo: card?.palo,
    });
    if (room.length <= 2) {
        return { room: room.map(weaken), weakened: room.filter((c) => !isExempt(c)).map(describe) };
    }
    const lastTwo = new Set([room.length - 2, room.length - 1]);
    const next = room.map((card, index) =>
        (lastTwo.has(index) && !isExempt(card)) ? weaken(card) : card
    );
    return {
        room: next,
        weakened: room.filter((card, index) => lastTwo.has(index) && !isExempt(card)).map(describe),
    };
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
 * Toque espectral: -3 a todos los enemigos Pica/Trébol de la mano,
 * con suelo de 0. Minibosses (palo 'Miniboss') exentos. No muta la entrada.
 *
 * @param {Array} room mano actual
 * @param {number} [amount=3] cantidad a reducir
 * @returns {{room:Array, weakened:Array<{prevValor:number, valor:number, palo:string|undefined}>}}
 */
export const spectreWeaken = (room, amount = 3) => {
    const isSpectreTarget = (card) =>
        (card?.palo === 'Pica' || card?.palo === 'Trebol');
    const weaken = (card) => ({ ...card, valor: Math.max(0, card?.valor - amount) });
    const describe = (card) => ({
        prevValor: card?.valor,
        valor: Math.max(0, card?.valor - amount),
        palo: card?.palo,
    });
    const weakened = room.filter(isSpectreTarget).map(describe);
    if (weakened.length === 0) {
        return { room, weakened };
    }
    return {
        room: room.map((card) => (isSpectreTarget(card) ? weaken(card) : card)),
        weakened,
    };
};

/**
 * Tirada de pasiva de la alquimista (curación): 50% (roll 0-99 < 50).
 * El azar se inyecta desde el adaptador (sin Math.random en el puro).
 * @param {number} roll tirada 0-99
 * @returns {boolean}
 */
export const rollAlchemistHeal = (roll) => roll < 50;

/**
 * Tirada de pasiva de la alquimista (daño): 50% independiente (roll 0-99 < 50).
 * @param {number} roll tirada 0-99
 * @returns {boolean}
 */
export const rollAlchemistDmg = (roll) => roll < 50;

/**
 * Bonus de curación de la pasiva: +25% (suelo por defecto).
 * @param {number} amount curación base ya con gluttony
 * @returns {number} bonus a sumar
 */
export const calcAlchemistHealBonus = (amount) => Math.floor((amount ?? 0) * 0.25);

/**
 * Poción de Alquimia Básica según tirada 0-99 (25% cada una).
 * @param {number} roll tirada 0-99
 * @returns {'heal'|'force'|'greed'|'speed'}
 */
export const rollAlchemistPotion = (roll) => {
    if (roll < 25) return 'heal';
    if (roll < 50) return 'force';
    if (roll < 75) return 'greed';
    return 'speed';
};

/**
 * Poción curativa: >50% vida máx +2, <50% +4, =50% +3 (punto medio).
 * @param {{health:number, maxHealth:number}} input
 * @returns {number}
 */
export const calcPotionHeal = ({ health, maxHealth }) => {
    if (health * 2 > maxHealth) return 2;
    if (health * 2 < maxHealth) return 4;
    return 3;
};

/**
 * Manos restantes del toque espectral (3 contando la activa:
 * al activar se aplica a la mano y quedan 2 futuras).
 * @param {number} left manos restantes
 * @returns {number}
 */
export const nextSpectreHands = (left) => Math.max(0, (left ?? 0) - 1);

/**
 * Reducción plana del guardián: -1 al daño final de combate
 * (solo Pica/Trebol; minibosses exentos; suelo 0 lo aplica el llamador).
 */
export const GUARDIAN_FLAT_REDUCTION = 1;

/**
 * Posición defensiva: -50% al daño final de la mano activa (suelo con floor).
 * Solo Pica/Trebol; minibosses exentos (lo decide el adaptador por palo/clave).
 * @param {number} dmg daño final ya calculado
 * @returns {number} daño mitigado
 */
export const calcGuardianStanceDamage = (dmg) => Math.floor((dmg ?? 0) * 0.5);

/**
 * ¿Aplica el kit del guardián a esta carta? Solo enemigos normales.
 * @param {object} card carta enemiga
 * @returns {boolean}
 */
export const isGuardianTarget = (card) =>
    card?.palo === 'Pica' || card?.palo === 'Trebol';

/**
 * Recompensa del cazador: oro extra permanente a los 2 enemigos más
 * fuertes de la mano. Los efectos existentes se conservan (el campo
 * puede venir como objeto, array o ausente). No muta la entrada.
 * Minibosses excluidos (mismo criterio que warriorScare).
 *
 * @param {Array} room mano actual
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
