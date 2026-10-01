import { createContext, Fragment, useState, useEffect, useCallback, useRef } from "react";
import shuffle from 'lodash/shuffle';

import { useCard } from "../hooks/useCard.js";
import { useCharacters } from "../hooks/useCharacter.js";
import { useModifier } from "../hooks/useModifier.js";
import { useMatch } from "../hooks/useMatch.js";
import { useUser } from "../hooks/useUser.js";
import { useAchievements } from "../hooks/useAchievements.js";
import { buildLossPayload, postMatchKeepalive } from "../api/matchKeepalive.js";
import missionsCatalog from "../assets/database/missions.json";
import { advanceMission, isMissionCompleted } from "../game/missions.js";



const matchContext = createContext();

// Lista de efectos que pueden aplicarse a cartas enemigas
const enemyCardEffectList = [
    { 'name': 'poison', 'value': 3 },
    { 'name': 'antiheal', 'value': 1 },
    { 'name': 'weapon_breaker', 'value': true },
    { 'name': 'thorny', 'value': true },
    { 'name': 'plunder', 'value': true },
    { 'name': 'mitosis', 'value': true },
    { 'name': 'souleater', 'value': true },
    { 'name': 'seal', 'value': true },
    { 'name': 'blocked', 'value': true },
    { 'name': 'extra_gold', 'value': true },
];

// Lista de efectos que pueden aplicarse a las armas
const weaponCardEffectList = [
    { 'name': 'extra_gold', 'value': true },
];

// Lista de efectos que pueden aplicarse a las curaciones
const healthCardEffectList = [
    //Ninguno por ahora
];

const generateCardKey = (id) => {
    return `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * @typedef {Object} Card
 * @property {boolean} activa - Indica si la carta está activa en el tablero.
 * @property {Array|null} efectos - Efectos aplicados a la carta.
 * @property {boolean} especial - Define si la carta tiene propiedades especiales.
 * @property {number} id - Identificador numérico único de la carta.
 * @property {string} imagen - URL de la imagen de la carta.
 * @property {string} key - UUID único para la instancia de la carta.
 * @property {string} palo - Palo de la baraja (ej. "Diamante", "Trebol").
 * @property {number} valor - Valor numérico de la carta.
 * @property {number} x - Posición en el eje X.
 * @property {number} y - Posición en el eje Y.
 */
/**
 * @typedef {Object} Modifier
 * @property {number} id - Identificador único del modificador.
 * @property {string} nombre - Nombre del modificador.
 * @property {string} descripcion - Descripción de sus efectos.
 * @property {string} imagen - URL de la imagen del modificador.
 * @property {number} nivel - Nivel de rareza/potencia (1, 2 o 3).
 * @property {boolean} activo - Estado de activación.
 * @property {Object|string} efectos - Configuración o datos de los efectos aplicados.
 */

const MatchProvider = (props) => {
    // Hooks de datos externos
    const {
        cards,
        isLoading: isLoadingCard,
        error: cardError
    } = useCard();

    const {
        characters,
        isLoading: isLoadingCharacter,
        error: characterError
    } = useCharacters();

    const {
        modifiers,
        isLoading: isLoadingModifier,
        error: modifierError
    } = useModifier();

    const {
        user,
        isLoading: isLoadingUser,
        error: userError
    } = useUser();

    const {
        achievements,
        isLoading: isLoadingAchievements,
        error: achievementsError
    } = useAchievements();
    const { newAchievement } = useAchievements();
    const { saveMatch, updateMatch } = useMatch();

    // Carga y logros
    const [gameLoading, setGameLoading] = useState(true);
    const [achievementList, setAchievementList] = useState([]);
    const [newAchievements, setNewAchievements] = useState([]);

    // Estados de la partida en curso
    const [actualMatchId, setActualMatchId] = useState(null);
    const [baseDeck, setBaseDeck] = useState([]);
    const [matchDeck, setMatchDeck] = useState([]);
    const [character, setCharacter] = useState(undefined);
    const [availableCharacters, setAvailableCharacters] = useState([]);
    const [availableModifiers, setAvailableModifiers] = useState([]);
    const [activeModifiers, setActiveModifiers] = useState([]);
    // Misiones del cazador: [{id, progress, claimed}]. Viven aquí para
    // sobrevivir a la reconstrucción de la tienda cada ronda.
    const [activeMissions, setActiveMissions] = useState([]);



    // Carga inicial y/o reinicio de partida
    /**
     * Carga inicial de los datos para jugar
     */
    const load = () => {
        const modifiersList = modifiers.map(item => ({
            ...item,
            efectos: typeof item.efectos === 'string' ? JSON.parse(item.efectos) : item.efectos
        }));
        const normalize = (str) => str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

        const tempCards = cards
            .filter((card) => {
                const palo = normalize(card?.palo);
                const isForbiddenDiamond = palo === 'diamante' && card?.valor > 10;
                const isForbiddenHeart = palo === 'corazon' && card?.valor > 10;
                const isBosscard = palo === 'miniboss';
                return !isForbiddenDiamond && !isForbiddenHeart && !isBosscard;
            })
            .map((card) => ({
                ...card,
                x: 200,
                y: 0,
                key: generateCardKey()
            }));
        setBaseDeck(tempCards);
        setAvailableCharacters(characters);
        setAvailableModifiers(modifiersList);
        setAchievementList(achievements)
        setGameLoading(false);
    };
    /**
     * Reinicia todos los valores de la partida actual.
     */
    const startNewGame = () => {
        setGameLoading(true);
        const shuffledDeck = shuffle(baseDeck).map(card => (
            {
                ...card,
                key: generateCardKey()
            }));
        setMatchDeck(shuffledDeck);
        setCharacter(undefined);
        setActiveModifiers([]);
        setActiveMissions([]);
        setActualMatchId(null);
        setGameLoading(false);
    };


    useEffect(() => {
        setGameLoading(true)
        if (!isLoadingCard && !isLoadingCharacter && !isLoadingModifier && !isLoadingAchievements && !isLoadingUser) {
            load();
        }
    }, [isLoadingCard, isLoadingCharacter, isLoadingModifier, isLoadingAchievements, isLoadingUser]);

    // Contenido traducido del back: al cambiar el idioma se refetchean los
    // personajes (queryKey por idioma en useCharacters) y hay que propagar
    // la lista nueva (incluye habilidad_personaje) a la UI visible.
    useEffect(() => {
        if (Array.isArray(characters) && characters.length > 0) {
            setAvailableCharacters(characters);
        }
    }, [characters]);

    // Logros
    /**
     * Elimina un logro de la lista de logros recién obtenidos
     * 
     * @param {int} id Id del logro 
     */
    const deleteNewAchievement = (id) => {
        setNewAchievements(prev => prev.filter(achievement => achievement.id != id));
    };

    /**
     * 
     * @param {int} achievementId Id del logro
     * @param {int} increment Incremento que tendrá el logro al ser actualizado 
     * @returns 
     */
    const handleNewAchievement = async (achievementCode, increment = 1) => {
        const alreadyUnlocked = user?.logros?.some(
            (logro) => logro.codigo === achievementCode && logro.pivot.obtenido
        );

        if (alreadyUnlocked) return;

        try {
            const isUnlocked = await newAchievement({ logro_codigo: achievementCode, incremento: increment });

            if (isUnlocked) {
                // 2. Lookup by ID instead of array index arithmetic
                const achievementData = achievementList.find(a => a.codigo === achievementCode);

                if (achievementData) {
                    // 3. Removed unnecessary await from state updater
                    setNewAchievements(prev => [...prev, achievementData]);
                }
            }
        } catch (error) {
            console.error("Failed to update achievement:", error);
        }
    };

    /**
     * Envía al backend la petición para indicar que el usuario activo ha obtenido X logro
     * 
     * @param {boolean} victoria true: Ganado false: Perdido
     */
    const loadAchievements = async (victoria, round = 0) => {
        if (victoria) {
            //Logro victoria
            await handleNewAchievement('victoria')
            // Por codigo de habilidad (robusto ante huecos de ids); fallback
            // al id legacy si la relación no viene cargada.
            const victoryCode = character?.habilidad_personaje?.codigo ?? `id:${character?.id}`;
            switch (victoryCode) {
                case 'guerrero':
                case 'id:1':
                    await handleNewAchievement('victoria_guerrero')
                    break;
                case 'paladin':
                case 'id:2':

                    await handleNewAchievement('victoria_paladin')
                    break;
                case 'elfo':
                case 'id:3':
                    await handleNewAchievement('victoria_elfo')
                    break;
                case 'mago':
                case 'id:4':
                    await handleNewAchievement('victoria_mago')
                    break;
                case 'apostador':
                case 'id:5':
                    await handleNewAchievement('victoria_apostador')
                    break;
                case 'herrero':
                case 'id:6':
                    await handleNewAchievement('victoria_herrero')
                    break;
                case 'cazador':
                case 'id:7':
                    await handleNewAchievement('victoria_cazarrecompensas')
                    break;
                case 'vampiro':
                case 'id:8':
                    await handleNewAchievement('victoria_vampiro')
                    break;
                case 'domador':
                case 'id:9':
                    await handleNewAchievement('victoria_domador')
                    break;
                case 'espectro':
                case 'id:10':
                    await handleNewAchievement('victoria_espectro')
                    break;
            }
        } else {
            // Logro derrota
            await handleNewAchievement('2_derrota')
        }
        // Logro ronda 20
        if (round >= 20) {
            await handleNewAchievement('ronda_20')
        }
        // Logro primera partida
        await handleNewAchievement('1_bienvenido')
    };


    // Persistencia de partida
    /**
     * 
     * @param {int} user_id ID del usuario
     * @param {int} tiempo Tiempo en segundos
     * @param {boolean} victoria true: Ganado false: Perdido
     * @param {int} rondas Rondas superadas
     * @param {int} earnedGold Oro obtenido
     * @param {int} healedLife Vida curada
     * @param {int} enemysDefeated Enemigos derrotados
     * @returns 
     */
    const endGame = async (user_id, tiempo, victoria, rondas, earnedGold, healedLife, enemysDefeated) => {
        if (character) {
            await loadAchievements(victoria, rondas);
            const gameModifiers = activeModifiers.map((modifier) => modifier.id);
            if (victoria && gameModifiers.length === 0) {
                handleNewAchievement('cesped');
            }
            const payload = {
                usuario_id: user_id,
                personaje_id: character.id,
                tiempo: tiempo,
                victoria: victoria,
                rondas: rondas,
                modificadores: gameModifiers,
                oro_obtenido: earnedGold,
                vida_curada: healedLife,
                enemigos_enfrentados: enemysDefeated
            };
            const savedMatch = await saveMatch({ form: payload });
            setActualMatchId(savedMatch.id);
            return true;
        }
    };

    // Derrota por recarga/cierre: axios no sobrevive al unload, así que se
    // envía por keepalive (fire-and-forget, sin logros). Una sola vez por
    // montaje del provider (cubre doble disparo por bfcache).
    const unloadSavedRef = useRef(false);
    const saveLossOnUnload = (stats) => {
        if (unloadSavedRef.current || !user?.id || !character) {
            return false;
        }
        unloadSavedRef.current = true;
        postMatchKeepalive(buildLossPayload({
            usuario_id: user.id,
            personaje_id: character.id,
            tiempo: stats.tiempo,
            rondas: stats.rondas,
            modificadores: activeModifiers.map((modifier) => modifier.id),
            oro_obtenido: stats.oro_obtenido,
            vida_curada: stats.vida_curada,
            enemigos_enfrentados: stats.enemigos_enfrentados,
        }));
        return true;
    };

    /**
     *  Función para actualizar el estado de una partida. 
     * Utiliza el id de la partida activa, por lo que si no hay ninguna, devolverá false. En caso que si haya, devolverá true/false si se ha podido actualizar o no
     * 
     * @param {int} user_id ID del usuario
     * @param {int} tiempo Tiempo en segundos
     * @param {boolean} victoria true: Ganado false: Perdido
     * @param {int} rondas Rondas superadas
     * @param {int} earnedGold Oro obtenido
     * @param {int} healedLife Vida curada
     * @param {int} enemysDefeated Enemigos derrotados
     * @returns 
     */
    const updateActualGame = async (user_id, tiempo, victoria, rondas, earnedGold, healedLife, enemysDefeated) => {
        loadAchievements(victoria, rondas)
        if (actualMatchId == null) {
            return false;
        }
        if (character) {
            const gameModifiers = activeModifiers.map((modifier) => modifier.id);
            const payload = {
                usuario_id: user_id,
                personaje_id: character.id,
                tiempo,
                victoria,
                rondas,
                modificadores: gameModifiers,
                oro_obtenido: earnedGold,
                vida_curada: healedLife,
                enemigos_enfrentados: enemysDefeated
            };

            try {
                const savedMatch = await updateMatch({ matchId: actualMatchId, form: payload });
                setActualMatchId(savedMatch.id);
                return true;
            } catch (err) {
                console.error("Error al actualizar partida:", err);
                return false;
            }
        }
    };

    // Gestión del mazo de partida
    /**
     * Baraja el mazo actual
     */
    const shuffleMatchDeck = () => {
        setMatchDeck(prev => shuffle(prev));
    };

    /**
     * Devuelve el mazo al estado original
     */
    const setNewDeck = () => {
        setMatchDeck(baseDeck);
    };

    /**
     * 
     * @returns 
     */
    const setNewMatchDeck = (newMatchDeck) => {
        setMatchDeck(newMatchDeck);
    }

    const checkWeapons = () => {
        const especialCardsIds = [36, 37, 38, 39];
        const idsEnArray = new Set(matchDeck.map(obj => obj.id));
        return especialCardsIds.every(id => idsEnArray.has(id));
    }

    /**
     * 
     * @param {Card} card 
     */
    const addCardToMatchDeck = (card) => {
        if (card) {
            const newCard = {
                ...card,
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                x: 200,
                y: 0,
                key: card?.key ?? generateCardKey()
            };
            setMatchDeck(prevDeck => [...prevDeck, newCard]);
            if (checkWeapons()) {
                handleNewAchievement(18)
            }
        }
    };


    /**
     * Devuelve X cantidad de enemigos aleatorios 
     * 
     * @param {int} quantity Cantidad de cartas
     * @param {int} round Ronda (de esto dependerá el `nivel` de la carta)
     * @returns {Card|undefined}
     */
    const addRandomEnemysToMatchDeck = (quantity, round = 1) => {
        const minPower = Math.min(10, Math.max(2, round));
        const maxPower = Math.min(round + 5, 14);

        const candidates = cards.filter(({ palo, valor }) =>
            (palo === "Trebol" || palo === "Pica") &&
            valor >= minPower &&
            valor <= maxPower
        );

        const shuffled = shuffle(candidates);
        const selectedEnemys = shuffled.slice(0, quantity);
        const effectProbability = Math.min(5 + (round - 1) * 5, 100);

        const newEnemys = selectedEnemys.map((card) => {
            const roll = Math.random() * 100;
            let appliedEffect = null;
            if (roll < effectProbability) {
                const randomEffectIndex = Math.floor(Math.random() * enemyCardEffectList.length);
                appliedEffect = { ...enemyCardEffectList[randomEffectIndex] };
            }
            const enemyDmg = round > 5 ? Math.floor(card.valor + (round / 5)) : card.valor;
            return {
                ...card,
                valor: enemyDmg,
                x: 200,
                y: 0,
                key: generateCardKey(),
                especial: appliedEffect !== null ? true : false,
                efectos: appliedEffect
            };
        });

        setMatchDeck(prevDeck => [...prevDeck, ...newEnemys]);
        return newEnemys;
    };


    /**
     * Devuelve un enemigo de valor X 
     * 
     * @param {int} power Valor de la carta
     * @param {int} round Ronda (de esto dependerá el `nivel` de la carta)
     * @returns {Card|undefined}
     */
    const addEnemyToMatchDeck = (power, round = 1) => {
        const candidates = cards.filter(({ palo, valor }) =>
            (palo === "Trebol" || palo === "Pica") && valor === power
        );
        if (candidates.length === 0) {
            return null;
        }
        const targetCard = candidates[0];
        const effectProbability = Math.min(5 + (round - 1) * 5, 60);
        const roll = Math.random() * 100;
        let appliedEffect = null;

        if (roll < effectProbability) {
            const randomEffectIndex = Math.floor(Math.random() * enemyCardEffectList.length);
            // Clonamos profundamente el efecto de la lista base
            appliedEffect = structuredClone(enemyCardEffectList[randomEffectIndex]);
        }
        const newEnemy = {
            ...targetCard,
            x: 200,
            y: 0,
            key: generateCardKey(),
            especial: appliedEffect !== null,
            efectos: appliedEffect
        };
        setMatchDeck(prevDeck => [...prevDeck, newEnemy]);

        return newEnemy;
    };


    /**
     * Devuelve un arma con valor X 
     * 
     * @param {int} power Valor de la carta
     * @returns {Card|null} 
     */
    const getWeapon = (power) => {
        if (cards) {
            const card = cards.find((c) => c?.palo === "Diamante" && c?.valor === power);
            if (card) {
                return {
                    ...card,
                    x: 200,
                    y: 0,
                    efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                    key: generateCardKey()
                };
            }
        }
        return null;
    };

    /**
 * Devuelve una curación con valor X.
 * 
 * @param {number} power - Valor de la carta.
 * @returns {Card|null}
 */
    const getHealItem = (power) => {
        if (cards) {
            const card = cards.find((c) => c?.palo === "Corazon" && c?.valor === power);
            if (card) {
                return {
                    ...card,
                    x: 200,
                    y: 0,
                    efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                    key: generateCardKey()
                };
            }
        }
        return null;
    };

    /**
     * Devuelve un miniboss random
     * 
     * @returns {Card|null}
     */
    const getRandomMiniboss = () => {
        const tempPower = Math.floor(Math.random() * (9 - 1) + 1);
        const power = tempPower === 7 ? 6 : tempPower;
        const card = cards.find((c) => c?.palo === "Miniboss" && c?.valor === power);
        if (card) {
            return {
                ...card,
                x: 200,
                y: 0,
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                key: generateCardKey()
            };
        }
        return null;
    }

    const getHairball = () => {
        const power = 7;
        const card = cards.find((c) => c?.palo === "Miniboss" && c?.valor === power);
        if (card) {
            // Spec de Guantes: cada bola de pelo lleva un Efecto de carta ALEATORIO,
            // tomado de la misma pool que los enemigos normales. El `codigo` conserva
            // la identidad 'hairball' para que su derrota lance el logro 'miniboss_bola'.
            const randomEffectIndex = Math.floor(Math.random() * enemyCardEffectList.length);
            return {
                ...card,
                valor: 0,
                x: 200,
                y: 0,
                codigo: 'hairball',
                efectos: [{ ...enemyCardEffectList[randomEffectIndex] }],
                key: generateCardKey()
            };
        }
        return null;
    }

    const getCustomSlime = (power) => {
        const card = cards.find((c) => c?.palo === "Trebol" && c?.valor === 2);
        if (card) {
            return {
                ...card,
                valor: power,
                x: 200,
                y: 0,
                palo: 'Miniboss',
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                key: generateCardKey()
            };
        }
        return null;
    }

    const deleteCardFromMatchDeck = (cardKey) => {
        const filteredDeck = matchDeck.filter((card) => (card.key !== cardKey));
        setMatchDeck(filteredDeck);
    }


    /**
     * Obtener las cartas de X tutorial
     * 
     * @param {int} tutorialNumber Número del tutorial
     * @returns 
     */
    const getTutorialCards = (tutorialNumber = 1) => {
        const tempDeck = [...baseDeck];
        switch (tutorialNumber) {
            case 1:
                // No depender del orden de la API: el tutorial necesita una
                // muestra de cada palo aunque el backend cambie la respuesta.
                const cardstutorialOne = [
                    tempDeck.find(card => card?.palo === "Pica"),
                    tempDeck.find(card => card?.palo === "Corazon"),
                    tempDeck.find(card => card?.palo === "Diamante"),
                    tempDeck.find(card => card?.palo === "Trebol"),
                ].filter(Boolean);
                return cardstutorialOne;
            case 7:
                const cardstutorialSeven = [tempDeck[5], tempDeck[26], tempDeck[28], tempDeck[41]];
                return cardstutorialSeven;
            default:
                break;
        }
    };

    // Gestios de personajes y modificadores
    const setNewCharacter = (newCharacter) => {
        setCharacter(newCharacter);
    };

    /**
     * Añade un modificador a la lista de modificadores activos
     * 
     * @param {Object} modifier Modificador a añadir
     * 
        class Card {
            id (INT),
            nombre (STRING),
            descripcion (STRING),
            imagen (STRING),
            nivel (INT),
            activo (BOOLEAN), 
            efectos (Objeto/String),
        }
     * 
     */
    const addModifierToMatch = (modifier) => {
        if (modifier == null) return false
        setActiveModifiers([...activeModifiers, modifier]);
    };

    /**
     * Obtiene 3 modificadores aleatorios NO ACTIVOS
     * 
     * @param {int} quantity Cantidad (Por defecto 3)
     * @param {int} round Ronda actual (Por defecto 1)
     * @returns 
     */
    const getRandomsModifier = useCallback((quantity = 3, round = 1) => {
        const activeIds = new Set(activeModifiers.map(mod => mod.id));
        let pool = availableModifiers.filter(mod => !activeIds.has(mod.id) && mod.nivel > 0);

        const getTargetLevel = (isGuaranteed) => {
            if (isGuaranteed) return 3;

            const roll = Math.random() * 100;

            // CÁLCULO DE PROBABILIDADES
            // Nivel 3: Empieza en 5% y sube 2.5% por ronda (Cap en 25%)
            const probLvl3 = Math.min(0 + (round - 1) * 2.5, 25);

            // Nivel 2: Empieza en 10% y sube 5% por ronda (Cap en 40%)
            const probLvl2 = Math.min(5 + (round - 1) * 5, 40);

            if (roll < probLvl3) return 3;
            if (roll < probLvl3 + probLvl2) return 2;
            return 1;
        };

        const selectedModifiers = [];

        for (let i = 0; i < quantity; i++) {
            // OBLIGATORIO: En ronda 5, el primer slot es nivel 3 sí o sí
            const forceLevel3 = (round === 5 && i === 0);
            let targetLevel = getTargetLevel(forceLevel3);

            let options = pool.filter(mod => mod.nivel === targetLevel);

            // Fallback: Si no hay del nivel pedido, busca el más cercano por debajo
            if (options.length === 0) {
                options = pool.filter(mod => mod.nivel < targetLevel).sort((a, b) => b.nivel - a.nivel);
            }

            if (options.length > 0) {
                const randomIndex = Math.floor(Math.random() * options.length);
                const chosen = options[randomIndex];
                selectedModifiers.push(chosen);
                pool = pool.filter(mod => mod.id !== chosen.id);
            }
        }

        return selectedModifiers;
    }, [activeModifiers, availableModifiers])

    /**
     * Meta del catálogo por id de misión.
     */
    const getMissionMeta = (missionId) => missionsCatalog.find((m) => m?.id === missionId);

    /**
     * Acepta una misión ofertada (gratis). Devuelve la entrada creada
     * (progreso 0) o la existente si ya estaba cogida.
     *
     * @param {string} missionId
     * @returns {{id:string, progress:number, claimed:boolean}|null}
     */
    const acceptMission = (missionId) => {
        if (!getMissionMeta(missionId)) return null;
        const existing = activeMissions.find((m) => m.id === missionId);
        if (existing) return existing;
        const entry = { id: missionId, progress: 0, claimed: false };
        setActiveMissions(prev => prev.some((m) => m.id === missionId) ? prev : [...prev, entry]);
        return entry;
    };

    /**
     * Avanza las misiones aceptadas no reclamadas con un evento de partida.
     * Evento: {kills, streak, goldTotal, round, miniboss}.
     */
    const trackMissionEvent = (ev) => {
        setActiveMissions(prev => {
            if (prev.length === 0) return prev;
            return prev.map((m) => advanceMission(m, getMissionMeta(m.id)?.meta, ev));
        });
    };

    /**
     * Reclama una misión completada: la marca y devuelve el oro.
     * Sin completar devuelve 0.
     *
     * @param {string} missionId
     * @returns {number} oro de recompensa
     */
    const claimMission = (missionId) => {
        const meta = getMissionMeta(missionId);
        const found = activeMissions.find((m) => m.id === missionId);
        if (!found || !isMissionCompleted(found, meta?.meta)) return 0;
        setActiveMissions(prev => prev.map((m) => m.id === missionId ? { ...m, claimed: true } : m));
        return meta?.recompensa_oro ?? 0;
    };

    const resetMissions = () => {
        setActiveMissions([]);
    };

    const exports = {
        gameLoading,
        baseDeck,
        matchDeck,
        character,
        activeModifiers,
        availableCharacters,
        isLoadingCharacter,
        newAchievements,
        setNewDeck,
        setNewMatchDeck,
        addCardToMatchDeck,
        startNewGame,
        setNewCharacter,
        getRandomsModifier,
        endGame,
        addModifierToMatch,
        getWeapon,
        setCharacter,
        setActiveModifiers,
        setGameLoading,
        addEnemysToMatchDeck: addRandomEnemysToMatchDeck,
        addEnemyToMatchDeck,
        getHealItem,
        getRandomMiniboss,
        getHairball,
        getCustomSlime,
        updateActualGame,
        saveLossOnUnload,
        activeMissions,
        acceptMission,
        trackMissionEvent,
        claimMission,
        resetMissions,
        getTutorialCards,
        setNewAchievements,
        handleNewAchievement,
        deleteNewAchievement,
        deleteCardFromMatchDeck,
    };

    return (
        <Fragment>
            <matchContext.Provider value={exports}>
                {props.children}
            </matchContext.Provider>
        </Fragment>
    );
};

export default MatchProvider;
export { matchContext };