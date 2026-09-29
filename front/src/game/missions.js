/**
 * Misiones del cazador (motor puro).
 * Sin React, sin estado: el progreso vive en MatchProvider
 * (`activeMissions`) y la tienda lo presenta.
 */

/**
 * Avanza UNA misión aceptada según un evento de partida.
 *
 * @param {{id:string, progress:number, claimed:boolean}} mission
 * @param {{tipo:string, objetivo:number}} meta
 * @param {{kills?:number, streak?:number, goldTotal?:number, round?:number, miniboss?:boolean}} ev
 * @returns {object} misión actualizada (misma ref si no aplica)
 */
export const advanceMission = (mission, meta, ev = {}) => {
    if (!mission || mission.claimed || !meta) {
        return mission;
    }
    switch (meta.tipo) {
        case 'kills':
            if (!ev.kills) return mission;
            return { ...mission, progress: mission.progress + ev.kills };
        case 'streak':
            if (ev.streak == null) return mission;
            return { ...mission, progress: Math.max(mission.progress, ev.streak) };
        case 'gold':
            if (ev.goldTotal == null) return mission;
            return { ...mission, progress: Math.max(mission.progress, ev.goldTotal) };
        case 'rounds':
            if (ev.round == null) return mission;
            return { ...mission, progress: Math.max(mission.progress, ev.round) };
        case 'miniboss':
            if (!ev.miniboss) return mission;
            return { ...mission, progress: mission.progress + 1 };
        default:
            return mission;
    }
};

/**
 * @param {{progress:number}} mission
 * @param {{objetivo:number}} meta
 * @returns {boolean}
 */
export const isMissionCompleted = (mission, meta) => (
    !!mission && !!meta && mission.progress >= meta.objetivo
);

/**
 * Ofertas de tienda: N al azar excluyendo las ya cogidas.
 *
 * @param {Array} catalog catálogo (missions.json)
 * @param {Array<string>} excludeIds aceptadas + reclamadas
 * @param {number} count
 * @param {(arr:Array) => Array} shuffleFn inyectada
 * @returns {Array}
 */
export const pickMissionOffers = (catalog, excludeIds = [], count = 3, shuffleFn) => {
    const excluded = new Set(excludeIds);
    const pool = (catalog ?? []).filter((m) => m && !excluded.has(m.id));
    return shuffleFn(pool).slice(0, count);
};
