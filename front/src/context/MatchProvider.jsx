import { createContext, Fragment, useState, useEffect } from "react";
import lodash from 'lodash';

import { useCard } from "../hooks/useCard.js";
import { useCharacters } from "../hooks/useCharacter.js";
import { useModifier } from "../hooks/useModifier.js";
import { useMatch } from "../hooks/useMatch.js";
import { useUser } from "../hooks/useUser.js";
import { useAchievements } from "../hooks/useAchievements.js";



const matchContext = createContext();

// Lista de efectos que pueden aplicarse a cartas enemigas
const enemyCardEffectList = [
    { 'name': 'poison', 'value': 3 },
    { 'name': 'antiheal', 'value': 1 },
    { 'name': 'weapon_breaker', 'value': true },
    { 'name': 'thorny', 'value': true },
    { 'name': 'plunder', 'value': true },
    { 'name': 'mitosis', 'value': true },
    { 'name': 'souleater', 'value': true},
    { 'name': 'seal', 'value': true},
    { 'name': 'blocked', 'value': true},
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

    // console.log("===== MATCH PROVIDER =====");
    // console.log("CARDS:", {
    //     data: cards,
    //     loading: isLoadingCard,
    //     error: cardError
    // });

    // console.log("CHARACTERS:", {
    //     data: characters,
    //     loading: isLoadingCharacter,
    //     error: characterError
    // });

    // console.log("MODIFIERS:", {
    //     data: modifiers,
    //     loading: isLoadingModifier,
    //     error: modifierError
    // });

    // console.log("ACHIEVEMENTS:", {
    //     data: achievements,
    //     loading: isLoadingAchievements,
    //     error: achievementsError
    // });

    // console.log("USER:", {
    //     data: user,
    //     loading: isLoadingUser,
    //     error: userError
    // });
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



    // Carga inicial y/o reinicio de partida
    /**
     * Carga inicial de los datos para jugar
     */
    const load = () => {
        const modifiersList = modifiers.map(item => ({
            ...item,
            efectos: typeof item.efectos === 'string' ? JSON.parse(item.efectos) : item.efectos
        }));
        const tempCards = cards
            .filter((card) => {
                const isForbiddenDiamond = card?.palo === 'Diamante' && card?.valor > 10;
                const isForbiddenHeart = card?.palo === 'Corazon' && card?.valor > 10;
                return !isForbiddenDiamond && !isForbiddenHeart;
            })
            .map((card) => ({
                ...card,
                x: 200,
                y: 0,
                key: Date.now() * card?.id // Cada carta tiene su propia identidad
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
        const shuffledDeck = lodash.shuffle(baseDeck).map(card => (
            {
            ...card,
            key: Date.now() * card?.id
        }));

        setMatchDeck(shuffledDeck);
        setCharacter(undefined);
        setActiveModifiers([]);
        setActualMatchId(null);
        setGameLoading(false);
    };

    useEffect(() => {
        setGameLoading(true)
        if (!isLoadingCard && !isLoadingCharacter && !isLoadingModifier && !isLoadingAchievements && !isLoadingUser) {
            //console.log("Ha cargado")
            load();
        }
    }, [isLoadingCard, isLoadingCharacter, isLoadingModifier, isLoadingAchievements, isLoadingUser]);

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
     */
    const handleNewAchievement = async (achievementId) => {
        // 1. Safe lookup using optional chaining
        const alreadyUnlocked = user?.logros?.some(
            (logro) =>logro.id === achievementId && logro.pivot.obtenido
        );

        if (alreadyUnlocked) return;

        try {
            const isUnlocked = await newAchievement({ logro_id: achievementId, incremento: 1 });

            if (isUnlocked) {
                // 2. Lookup by ID instead of array index arithmetic
                const achievementData = achievementList.find(a => a.id === achievementId);

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
            await handleNewAchievement(3)
            switch (character.id) {
                case 1:
                    //
                    await handleNewAchievement(8)
                    break;
                case 2:
                    //
                    await handleNewAchievement(7)
                    break;
                case 3:
                    //
                    await handleNewAchievement(6)
                    break;
                case 4:
                    //
                    await handleNewAchievement(5)
                    break;
                case 5:
                    //
                    await handleNewAchievement(4)
                    break;
                case 6:
                    await handleNewAchievement(9)
                    break;
            }
        } else {
            // Logro derrota
            await handleNewAchievement(2)
        }
        // Logro ronda 20
        if (round === 20) {
            await handleNewAchievement(17)
        }
        // Logro primera partida
        await handleNewAchievement(1)
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
        if (character && activeModifiers.length > 0) {
            await loadAchievements(victoria, rondas);
            const gameModifiers = activeModifiers.map((modifier) => modifier.id);
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
        setMatchDeck(prev => lodash.shuffle(prev));
    };

    /**
     * Devuelve el mazo al estado original
     */
    const setNewDeck = () => {
        setMatchDeck(baseDeck);
    };

    const checkWeapons = () => {
        const especialCardsIds = [36, 37, 38, 39];
        const idsEnArray = new Set(matchDeck.map(obj => obj.id));
        return especialCardsIds.every(id => idsEnArray.has(id));
    }

    /**
     * 
     * @param {Object} card 
     * 
        class Card {
            id,
            palo,
            valor,
            imagen,
            activa,
            especial,
            efectos
        }
     */
    const addCardToMatchDeck = (card) => {
        if (card) {
            const newCard = {
                ...card,
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                x: 200,
                y: 0,
                key: Date.now() * card?.id
            };
            setMatchDeck(prevDeck => [...prevDeck, newCard]);
            if (checkWeapons()) {
                handleNewAchievement(18)
            }
        }
    };


    /**
     * Añadir X cantidad de enemigos aleatorios al mazo
     * 
     * @param {int} quantity Cantidad de cartas
     * @param {int} round Ronda (de esto dependerá el `nivel` de la carta)
     * @returns 
     */
    const addRandomEnemysToMatchDeck = (quantity, round = 1) => {
        const minPower = Math.min(9, Math.max(2, round));
        const maxPower = Math.min(round + 5, 14);

        const candidates = cards.filter(({ palo, valor }) =>
            (palo === "Trebol" || palo === "Pica") &&
            valor >= minPower &&
            valor <= maxPower
        );

        const shuffled = lodash.shuffle(candidates);
        const selectedEnemys = shuffled.slice(0, quantity);
        const effectProbability = Math.min(5 + (round - 1) * 5, 60);

        const newEnemys = selectedEnemys.map((card) => {
            const roll = Math.random() * 100;
            let appliedEffect = null;
            if (roll < effectProbability) {
                const randomEffectIndex = Math.floor(Math.random() * enemyCardEffectList.length);
                appliedEffect = { ...enemyCardEffectList[randomEffectIndex] };
            }
            return {
                ...card,
                x: 200,
                y: 0,
                key: Date.now() * card?.id,
                especial: appliedEffect !== null ? true : false,
                efectos: appliedEffect
            };
        });

        setMatchDeck(prevDeck => [...prevDeck, ...newEnemys]);
        return newEnemys;
    };

    /**
     * Añadir cun enemigo de valor X al mazo.
     * 
     * @param {int} power Valor de la carta
     * @param {int} round Ronda (de esto dependerá el `nivel` de la carta)
     * @returns 
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
            key: Date.now() * targetCard.id,
            especial: appliedEffect !== null,
            efectos: appliedEffect
        };
        setMatchDeck(prevDeck => [...prevDeck, newEnemy]);

        return newEnemy;
    };


    /**
     * Añadir un arma con valor X al mazo
     * 
     * @param {int} power Valor de la carta
     * @returns 
     */
    const getWeapon = (power) => {
        const card = cards.find((c) => c?.palo === "Diamante" && c?.valor === power);
        if (card) {
            return {
                ...card,
                x: 200,
                y: 0,
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                // Añadir aquí el crypto hace que NUNCA se repita (otra vez no porfa)
                key: Date.now() * card?.id
            };
        }
    };

    /**
     * Añadir una curación con valor X al mazo
     * 
     * @param {int} power Valor de la carta
     * @returns 
     */
    const getHealItem = (power) => {
        const card = cards.find((c) => c?.palo === "Corazon" && c?.valor === power);
        if (card) {
            return {
                ...card,
                x: 200,
                y: 0,
                efectos: typeof card?.efectos === 'string' ? JSON.parse(card.efectos) : card?.efectos,
                key: crypto.randomUUID()
            };
        }
    };

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
                const cardstutorialOne = [tempDeck[0], tempDeck[14], tempDeck[28], tempDeck[42]];
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
    const getRandomsModifier = (quantity = 3, round = 1) => {
        const activeIds = new Set(activeModifiers.map(mod => mod.id));
        let pool = availableModifiers.filter(mod => !activeIds.has(mod.id) && mod.nivel > 0);

        const getTargetLevel = (isGuaranteed) => {
            if (isGuaranteed) return 3;

            const roll = Math.random() * 100;

            // CÁLCULO DE PROBABILIDADES
            // Nivel 3: Empieza en 5% y sube 2.5% por ronda (Cap en 25%)
            const probLvl3 = Math.min(5 + (round - 1) * 2.5, 25);

            // Nivel 2: Empieza en 10% y sube 5% por ronda (Cap en 40%)
            const probLvl2 = Math.min(10 + (round - 1) * 5, 40);

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
    };

    const exports = {
        gameLoading,
        matchDeck,
        character,
        activeModifiers,
        availableCharacters,
        isLoadingCharacter,
        newAchievements,
        setNewDeck,
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
        updateActualGame,
        getTutorialCards,
        setNewAchievements,
        handleNewAchievement,
        deleteNewAchievement,
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