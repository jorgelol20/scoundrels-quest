import { useCallback, useEffect, useRef } from "react";

/**
 * Persistencia de partida (Fase 2).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 *
 * Centraliza la bandera anti-duplicados (`gameSavedRef`) y los refs espejo
 * (necesarios porque los cleanups con deps [] y los handlers de eventos no
 * pueden leer el estado live por closures obsoletas).
 *
 * Los 5 sitios de guardado originales quedan así:
 * - timer-off (auto)      -> saveAuto (updateActualGame si continuedGame, si no endGame)
 * - unmount resize        -> hasActiveGame + saveExit (victoria = mirror)
 * - navbar                -> saveExit con victory:false (await + navigate fuera)
 * - modal confirm         -> saveExit con victory:false + navigate fuera
 * - botón GUARDAR PARTIDA -> saveManual (sin bandera, reintentable)
 *
 * Todas las funciones retornadas son estables (endGame/updateActualGame se
 * guardan en ref): seguro usarlas en effects con deps [].
 */
export const useGamePersistence = ({
    user,
    character,
    gameWin,
    rounds,
    enemysDefeated,
    endGame,
    updateActualGame,
}) => {
    const gameSavedRef = useRef(false);

    const userRef = useRef(user);
    const characterRef = useRef(character);
    const gameWinRef = useRef(gameWin);
    const roundsRef = useRef(rounds);
    const enemysDefeatedRef = useRef(enemysDefeated);

    const endGameRef = useRef(endGame);
    const updateActualGameRef = useRef(updateActualGame);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { characterRef.current = character; }, [character]);
    useEffect(() => { gameWinRef.current = gameWin; }, [gameWin]);
    useEffect(() => { roundsRef.current = rounds; }, [rounds]);
    useEffect(() => { enemysDefeatedRef.current = enemysDefeated; }, [enemysDefeated]);
    useEffect(() => { endGameRef.current = endGame; });
    useEffect(() => { updateActualGameRef.current = updateActualGame; });

    const resetSaveFlag = useCallback(() => {
        gameSavedRef.current = false;
    }, []);

    /** La partida realmente empezó: hay usuario, personaje y rondas. */
    const hasActiveGame = useCallback(() => (
        Boolean(userRef.current?.id && characterRef.current && roundsRef.current > 0)
    ), []);

    /** Hay personaje elegido (la partida existe como tal, aunque sea ronda 0). */
    const hasCharacter = useCallback(() => (
        characterRef.current != null
    ), []);

    const logSaveError = useCallback((reason, saveError) => {
        console.error(`Error al guardar la partida${reason ? ` (${reason})` : ''}:`, saveError);
    }, []);

    /**
     * Guardado único con bandera. Devuelve la promesa del guardado o null
     * si estaba bloqueado (ya guardado o sin usuario).
     * `victory`/`defeated` por defecto salen del mirror (sitio unmount).
     */
    const saveExit = useCallback(({ time, gold, healed, defeated, victory, reason }) => {
        if (gameSavedRef.current || !userRef.current?.id) {
            return null;
        }
        // La bandera se marca ANTES de lanzar la petición para evitar
        // guardados duplicados (patrón original).
        gameSavedRef.current = true;
        const savePromise = endGameRef.current(
            userRef.current.id,
            time,
            victory ?? gameWinRef.current,
            roundsRef.current,
            gold,
            healed,
            defeated ?? enemysDefeatedRef.current
        );
        // Se devuelve la promesa ya capturada: los llamantes pueden
        // esperarla sin riesgo de rechazo sin manejar.
        return Promise.resolve(savePromise).catch((saveError) => logSaveError(reason, saveError));
    }, [logSaveError]);

    /**
     * Guardado automático al apagarse el timer. Distingue continuada
     * (updateActualGame con victoria true) de normal (endGame).
     * No guarda si rounds es 0 (partida sin empezar).
     */
    const saveAuto = useCallback(({ time, gold, healed, defeated, continuedGame, reason = 'auto' }) => {
        if (roundsRef.current <= 0) {
            return null;
        }
        if (gameSavedRef.current || !userRef.current?.id) {
            return null;
        }
        gameSavedRef.current = true;
        const args = [
            userRef.current.id,
            time,
            continuedGame ? true : gameWinRef.current,
            roundsRef.current,
            gold,
            healed,
            defeated ?? enemysDefeatedRef.current,
        ];
        const savePromise = continuedGame
            ? updateActualGameRef.current(...args)
            : endGameRef.current(...args);
        return Promise.resolve(savePromise).catch((saveError) => logSaveError(reason, saveError));
    }, [logSaveError]);

    /**
     * Guardado manual reintentable (botón GUARDAR PARTIDA del menú de error):
     * no consume la bandera y usa valores live.
     */
    const saveManual = useCallback(({ time, gold, healed, defeated, victory, userId, rounds }) => {
        if (!userId) {
            return null;
        }
        const savePromise = endGameRef.current(userId, time, victory, rounds, gold, healed, defeated);
        return Promise.resolve(savePromise).catch((saveError) => logSaveError('manual', saveError));
    }, [logSaveError]);

    return { resetSaveFlag, hasActiveGame, hasCharacter, saveExit, saveAuto, saveManual };
};
