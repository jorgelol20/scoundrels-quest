/**
 * Predicados de navegación (puros, sin imports).
 */

/**
 * El modal de salida solo salta en /jugar con personaje elegido.
 * Sin personaje no hay partida: navegación libre.
 *
 * @param {string} pathname ruta actual
 * @param {object|null|undefined} character personaje de matchContext
 * @returns {boolean}
 */
export const shouldConfirmExit = (pathname, character) => (
    pathname === '/jugar' && character != null
);
