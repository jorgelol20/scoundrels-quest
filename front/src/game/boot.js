/**
 * Arranque de partida (fix bug recarga /jugar).
 *
 * En recarga, los effects de montaje hijos corren antes que el `load`
 * del MatchProvider, y `restartFunction` fuerza `gameLoading=false`
 * con `baseDeck` aún vacío. Sin el chequeo de `baseDeckSize`,
 * `startNewGame` barajaba un mazo vacío y el guard bloqueaba el
 * reintento para siempre (Loading infinito tras elegir personaje).
 *
 * @param {object} input
 * @param {boolean} input.gameLoading carga del provider en curso
 * @param {boolean} input.alreadyStarted guard hasStartedNewGameRef
 * @param {number} input.baseDeckSize cartas base disponibles
 * @returns {boolean}
 */
export const shouldStartNewGame = ({ gameLoading, alreadyStarted, baseDeckSize }) => (
    gameLoading === false && !alreadyStarted && baseDeckSize > 0
);
