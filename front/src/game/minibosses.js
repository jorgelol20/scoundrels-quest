/**
 * Minibosses puros (Fase 4).
 * Extraído de GamePage.jsx `handleMiniboss` + resolución de derrota
 * en `processCardAction` sin cambios de comportamiento.
 *
 * Solo construcción de cartas y decisiones: sin React, sin setState,
 * sin contexto, sin Math.random (el roll del disfraz del mímico y el
 * poder del chamán se inyectan). El adaptador de GamePage aplica
 * `shuffleCards`/`lastCardBoss`/`chamanCard`/`patch`/`logs` con las
 * funciones existentes.
 */

export const MINIBOSS_ACHIEVEMENTS = {
    sticky: 'miniboss_slime',
    spider_web: 'miniboss_arana',
    chaos_force: 'miniboss_chaman',
    last_pillage: 'miniboss_ladrona',
    supplies: 'miniboss_hada',
    hairballs: 'miniboss_guantes',
    mimicry: 'miniboss_mimico',
};

/**
 * Nombre del primer efecto del miniboss (undefined si no hay).
 * @param {object|null|undefined} miniboss
 * @returns {string|undefined}
 */
export const getMinibossEffectName = (miniboss) => {
    const raw = miniboss?.efectos;
    const effectsList = Array.isArray(raw) ? raw : [raw];
    return effectsList[0]?.name;
};

/**
 * Poder del chamán: nº de Tréboles + Picas entre dungeon y sala.
 * @param {Array} dungeon
 * @param {Array} room
 * @returns {number}
 */
export const countChamanPower = (dungeon, room) => (
    [...(dungeon ?? []), ...(room ?? [])].filter(
        (card) => ['Trebol', 'Pica'].includes(card?.palo)
    ).length
);

const baseMinibossCard = (miniboss, codigo, valor, uidFn) => ({
    ...miniboss,
    palo: 'Miniboss',
    codigo,
    valor,
    key: uidFn(),
});

const emptySpawn = (handled) => ({
    handled,
    shuffleCards: [],
    lastCardBoss: null,
    chamanCard: null,
    patch: {},
    newDisguise: undefined,
    logs: [],
});

/**
 * Planifica la aparición de un miniboss.
 *
 * @param {object|null|undefined} miniboss carta base (de getRandomMiniboss)
 * @param {object} ctx
 * @param {() => string} ctx.uidFn
 * @param {number} [ctx.chamanPower] poder inyectado del chamán
 * @param {object|null} [ctx.mimicDisguise] disfraz existente (único por partida)
 * @param {number} [ctx.mimicRoll] valor 2-10 inyectado si no hay disfraz
 * @param {string} [ctx.mimicSuit] icono de palo del disfraz (lo aporta la vista)
 * @returns {{handled:boolean, shuffleCards:Array, lastCardBoss:object|null,
 *   chamanCard:object|null, patch:object, newDisguise:object|undefined,
 *   logs:Array<{key:string, params:object}>}}
 */
export const planMinibossSpawn = (miniboss, ctx = {}) => {
    const effectName = getMinibossEffectName(miniboss);
    if (!miniboss || !effectName) {
        return emptySpawn(false);
    }
    const { uidFn } = ctx;

    switch (effectName) {
        case 'sticky': {
            const value = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            return {
                ...emptySpawn(true),
                shuffleCards: [baseMinibossCard(miniboss, 'slime', value, uidFn)],
            };
        }
        case 'spider_web': {
            const partValue = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            const baseImage = miniboss?.imagen || '';
            const parts = [];
            for (let spiderIndex = 0; spiderIndex < 9; spiderIndex++) {
                // 4 patas derechas (-1), 4 izquierdas (-2), 1 cabeza (base).
                let partImage = baseImage;
                if (spiderIndex < 4) {
                    partImage = baseImage.replace('2Miniboss.webp', '2Miniboss-1.webp');
                } else if (spiderIndex < 8) {
                    partImage = baseImage.replace('2Miniboss.webp', '2Miniboss-2.webp');
                }
                parts.push({
                    ...baseMinibossCard(miniboss, 'arana', partValue, uidFn),
                    imagen: partImage || baseImage,
                });
            }
            return {
                ...emptySpawn(true),
                shuffleCards: parts,
                patch: { spiderPartsLeft: 9 },
                logs: [{ key: 'logs.spiderSpawn', params: { value: partValue } }],
            };
        }
        case 'chaos_force': {
            return {
                ...emptySpawn(true),
                chamanCard: baseMinibossCard(miniboss, 'chaman', ctx.chamanPower, uidFn),
                patch: { chamanActive: true, chamanTurns: 0 },
            };
        }
        case 'last_pillage': {
            const value = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            return {
                ...emptySpawn(true),
                lastCardBoss: baseMinibossCard(miniboss, 'ladrona', value, uidFn),
                patch: { pillageQueenActive: true },
            };
        }
        case 'supplies': {
            const value = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            return {
                ...emptySpawn(true),
                shuffleCards: [baseMinibossCard(miniboss, 'rey', value, uidFn)],
            };
        }
        case 'hairballs': {
            const value = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            return {
                ...emptySpawn(true),
                lastCardBoss: baseMinibossCard(miniboss, 'guantes', value, uidFn),
                patch: { guantesActive: true },
            };
        }
        case 'mimicry': {
            const value = miniboss?.efectos?.[0]?.value
                ?? miniboss?.efectos?.value;
            const disguise = ctx.mimicDisguise ?? {
                imagen: (miniboss?.imagen || '').replace('8Miniboss.webp', `8Miniboss-${ctx.mimicRoll}.webp`),
                valor: ctx.mimicRoll,
                suit: ctx.mimicSuit,
            };
            return {
                ...emptySpawn(true),
                shuffleCards: [{
                    ...baseMinibossCard(miniboss, 'mimic', value, uidFn),
                    disfrazado: true,
                    disfraz: disguise,
                }],
                newDisguise: disguise,
            };
        }
        default:
            return emptySpawn(false);
    }
};

/**
 * Planifica la resolución tras derrotar (golpear con éxito) una carta
 * de miniboss. No toca estado: el adaptador aplica el resultado.
 *
 * @param {object} card carta derrotada
 * @param {object} ctx
 * @param {string|null} ctx.activeMinibossEffect efecto del miniboss activo
 * @param {number} ctx.spiderPartsLeft partes restantes de la araña
 * @returns {{isSticky:boolean, isMinibossDefeated:boolean, stickySplit:{halfValue:number}|null,
 *   isSpiderPart:boolean, spiderLeft:number, spiderCleared:boolean,
 *   shouldCleanMiniboss:boolean, achievement:string|null,
 *   logs:Array<{key:string, params:object}>}}
 */
export const planMinibossDefeat = (card, ctx = {}) => {
    const { activeMinibossEffect = null, spiderPartsLeft = 0 } = ctx;
    const raw = card?.efectos;
    const effectsList = Array.isArray(raw) ? raw : [raw];
    const defeatedEffectName = effectsList[0]?.name;

    const isSticky = effectsList.some((effect) => effect?.name === 'sticky');
    let isMinibossDefeated = true;
    let stickySplit = null;
    if (isSticky) {
        if (card?.valor === 2) {
            // La reina muere: se descarta normal (lo hace el adaptador).
        } else {
            // La reina no muere: pierde la mitad (suelo 2) y crea 2 slimes.
            isMinibossDefeated = false;
            stickySplit = { halfValue: Math.max(2, Math.floor(card.valor / 2)) };
        }
    }

    const isSpiderPart = card?.codigo === 'arana'
        && effectsList.some((effect) => effect?.name === 'spider_web');
    let spiderLeft = spiderPartsLeft;
    let spiderCleared = false;
    const logs = [];
    if (isSpiderPart && isMinibossDefeated) {
        spiderLeft = Math.max(0, spiderPartsLeft - 1);
        logs.push({ key: 'logs.spiderWeb', params: {} });
        logs.push({ key: 'logs.spiderPartsLeft', params: { left: spiderLeft } });
        if (spiderLeft === 0 && activeMinibossEffect === 'spider_web') {
            logs.push({ key: 'logs.spiderDefeated', params: {} });
            spiderCleared = true;
        }
    }

    // La bola de pelo tiene logro propio aunque jamás sea el miniboss activo.
    let achievement = null;
    if (isMinibossDefeated && card?.codigo === 'hairball') {
        achievement = 'miniboss_bola';
    }

    const shouldCleanMiniboss = isMinibossDefeated
        && card?.codigo !== 'hairball'
        && defeatedEffectName === activeMinibossEffect
        && !(isSpiderPart && spiderLeft > 0);

    if (shouldCleanMiniboss) {
        if (defeatedEffectName === 'supplies') {
            logs.push({ key: 'logs.fairyKingDefeated', params: {} });
        }
        achievement = MINIBOSS_ACHIEVEMENTS[defeatedEffectName] ?? null;
    }

    return {
        isSticky,
        isMinibossDefeated,
        stickySplit,
        isSpiderPart,
        spiderLeft,
        spiderCleared,
        shouldCleanMiniboss,
        achievement,
        logs,
    };
};
