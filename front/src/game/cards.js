/**
 * Operaciones de mazo puras (Fase 3).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 *
 * Sin React, sin lodash, sin Math.random: el barajado y la generación
 * de claves se inyectan (shuffleFn, uidFn) para poder testear con
 * funciones deterministas.
 */

/**
 * Enemigos por ronda: 5, 7, 9, 5, 7, 9, ...
 * @param {number} round ronda que acaba de empezar (1-based)
 * @returns {number}
 */
export const enemyQuantityForRound = (round) => 5 + (((round - 1) % 3) * 2);

/**
 * Baraja preservando claves existentes (regenerar keys rompe los refs
 * y keys de las cartas ya colocadas). Acepta entradas no-array.
 *
 * @param {Array|null|undefined} deck
 * @param {() => string} uidFn
 * @param {(arr: Array) => Array} shuffleFn
 * @returns {Array}
 */
export const buildShuffledDeck = (deck, uidFn, shuffleFn) => {
    const source = Array.isArray(deck) ? deck : [];
    return shuffleFn(source)
        .filter((card) => card)
        .map((card) => ({
            ...card,
            key: card.key ?? uidFn(),
        }));
};

/**
 * Añade una carta al fondo del mazo (principio del array).
 * @param {Array} deck
 * @param {object} card
 * @returns {Array}
 */
export const prependToDeck = (deck, card) => [card, ...deck];

/**
 * Inserta una carta (normalizando su clave solo si no la trae) y baraja.
 * @param {Array} deck
 * @param {object} card
 * @param {() => string} uidFn
 * @param {(arr: Array) => Array} shuffleFn
 * @returns {Array}
 */
export const insertAndShuffle = (deck, card, uidFn, shuffleFn) => {
    const normalized = card.key ? card : { ...card, key: uidFn() };
    return shuffleFn([...deck, normalized]);
};
