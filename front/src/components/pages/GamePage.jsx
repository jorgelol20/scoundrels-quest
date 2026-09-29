import { Fragment, useCallback, useContext, useEffect, useRef, useState, ViewTransition } from "react";
// 1. Librerías externas (React, React Router, Lodash, etc.)
import { useNavigate } from "react-router-dom";
import shuffle from 'lodash/shuffle';
import useImage from "use-image";

// 2. Contextos y Hooks propios
import { matchContext } from "../../context/MatchProvider.jsx";
import { settingsContext } from "../../context/SettingsProvider.jsx";
import { useUser } from "../../hooks/useUser.js";
import { bugReportContext } from "../../context/BugReportProvider.jsx";
import { uid } from "../../game/utils.js";
import { applyCardEffectToState, resolveSealExpiry } from "../../game/cardEffects.js";
import { shouldStartNewGame } from "../../game/boot.js";
import { applyModifierToState } from "../../game/modifiers.js";
import {
    enemyQuantityForRound,
    buildShuffledDeck,
    prependToDeck,
    insertAndShuffle,
} from "../../game/cards.js";
import {
    calcCombatDamage,
    calcGoldReward,
    resolveDeath,
    calcWeaponLifesteal,
    calcBarehandLifesteal,
} from "../../game/combat.js";
import {
    getMinibossEffectName,
    planMinibossSpawn,
    planMinibossDefeat,
    countChamanPower,
} from "../../game/minibosses.js";
import {
    applyPassiveToState,
    warriorScare,
    elfCaltrops,
    calcVampireAbility,
    applyBounty,
} from "../../game/characters.js";
import {
    calcStageLayout,
    PORTRAIT_DUNGEON_ZONE,
    PORTRAIT_DISCARD_ZONE,
    PORTRAIT_WEAPON_ZONE,
} from "../../game/layout.js";
import { useScheduledTimeouts } from "../../hooks/game/useScheduledTimeouts.js";
import { usePlayerState } from "../../hooks/game/usePlayerState.js";
import {
    useBoardState,
    DUNGEON_ZONE,
    DISCARD_ZONE,
    WEAPON_ZONE,
} from "../../hooks/game/useBoardState.js";
import { useTimer } from "../../hooks/game/useTimer.js";
import { useGamePersistence } from "../../hooks/game/useGamePersistence.js";

// 3. Componentes de tu aplicación
import SelectCharacter from "../game-components/SelectCharacter.jsx";
import SelectModifier from "../game-components/SelectModifier.jsx";
import Loading from "../Loading.jsx";
import GameShop from "../game-components/GameShop.jsx";
import GameHud from "../game-components/GameHud.jsx";
import GameOverMenu from "../game-components/GameOverMenu.jsx";
import GameBoard from "../game-components/GameBoard.jsx";

// 4. Estilos CSS
import './GamePage.css';

// 5. Archivos estáticos / Imágenes (Iconos de cartas)
import ClubIcon from '/images/suit_club.webp';
import HeartIcon from '/images/suit_heart.webp';
import DiamonIcon from '/images/suit_diamond.webp';
import SpadeIcon from '/images/suit_spade.webp';
import MinibossIcon from '/images/suit_miniboss.webp';
import DefaultCardImage from '/images/default_card.webp';

// 6. Archivos estáticos / Imágenes (Interfaz del juego)
import GoldIcon from '/images/gold.webp';
import FullHealthIcon from '/images/full_health.png';
import MidHealthIcon from '/images/mid_health.png';
import NoHealthIcon from '/images/no_health.png';

// 7. Archivos estáticos / Imágenes (Animaciones)
import HealAnimation from '/images/animations/HealAnimation.webp';
import GoldAnimation from '/images/gold.webp';
import AllDamageAnimation from '/images/animations/AllDamageAnimation.webp';
import DamageAnimation from '/images/animations/DamageAnimation.webp';
import ConfirmationModal from "../modals/ConfirmationModal.jsx";
import ErrorBoundary from "../structure/ErrorBoundary.jsx";
import { useTranslation } from "react-i18next";

// 8. Iconos de efectos
import PoisonIcon from '/images/cardEffects/Poison.webp';
import AntihealIcon from '/images/cardEffects/Antiheal.webp';
import DmgReductionIcon from '/images/cardEffects/DmgReduction.webp';
import ProgresiveHealIcon from '/images/cardEffects/ProgresiveHeal.webp';
import InvincibilityIcon from '/images/cardEffects/Invincibility.webp';
import HealthStealIcon from '/images/cardEffects/HealthSteal.webp';
import ExtraGoldIcon from '/images/cardEffects/ExtraGold.webp';
import SouleaterIcon from '/images/cardEffects/Souleater.webp';
import BuffIcon from '/images/cardEffects/BuffIcon.webp';
import DebuffIcon from '/images/cardEffects/DebuffIcon.webp';
import SealIcon from '/images/cardEffects/Seal.webp';
import MMA1Icon from '/images/cardEffects/MMA1.webp';
import MMA2Icon from '/images/cardEffects/MMA2.webp';
import MMA3Icon from '/images/cardEffects/MMA3.webp';


const GamePageInner = () => {
    // =====================================================
    // CAPA 1 — ESTADO BASE (sin funciones propias)
    // =====================================================

    const navigate = useNavigate();
    const { t } = useTranslation('game');
    const { startButtonSound, startPlayCardSound, startPlaceCardSound, showLogs } = useContext(settingsContext)
    const { matchDeck, character, activeModifiers: modifiers, setNewDeck, setNewMatchDeck, setNewCharacter, startNewGame, addCardToMatchDeck, gameLoading, baseDeck, getWeapon, getHealItem, getRandomMiniboss, getHairball, endGame, updateActualGame, saveLossOnUnload, setActiveModifiers, setGameLoading, addEnemysToMatchDeck, addEnemyToMatchDeck, handleNewAchievement, deleteCardFromMatchDeck, getCustomSlime, trackMissionEvent, resetMissions } = useContext(matchContext);
    const { user, isLoading } = useUser();
    const { openBugReport } = useContext(bugReportContext);

    // Imagen por defecto
    const [defaultImage] = useImage(DefaultCardImage);

    // Flujo de partida
    const [gameOn, setGameOn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWin, setGameWin] = useState(false);
    const [continuedGame, setContinuedGame] = useState(false);
    const [restart, setRestart] = useState(false);
    // Nuevo: indica si el próximo reinicio debe forzar también la
    // reselección de personaje (lo activa el botón "CAMBIAR PERSONAJE").
    const [changeCharacter, setChangeCharacter] = useState(false);

    // Rondas y estadísticas
    const [rounds, setRounds] = useState(0);
    const [maxRounds, setMaxRounds] = useState(10);
    const totalEarnedGold = useRef(0);
    const healedLife = useRef(0);
    const [enemysDefeated, setEnemysDefeated] = useState(0);
    const totalCardsUsed = useRef(0);
    const logsRef = useRef([]);
    const [isRestarting, setIsRestarting] = useState(false);

    // Timer (Fase 2: front/src/hooks/game/useTimer.js).
    // Se mantienen los nombres timeRef/formatedTimeRef/stopTimer
    // para no tocar los call sites existentes.
    const { timeRef, formatedTimeRef, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(t('game:hud.timeLabel'));
    // Persistencia (Fase 2: front/src/hooks/game/useGamePersistence.js).
    // Funciones estables: seguras en effects con deps [].
    const { resetSaveFlag, hasActiveGame, hasCharacter, saveExit, saveAuto, saveManual } = useGamePersistence({
        user,
        character,
        gameWin,
        rounds,
        enemysDefeated,
        endGame,
        updateActualGame,
    });

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Vida y oro (Fase 4: usePlayerState). healedRef es flag de ronda (flujo).
    const healedRef = useRef(null);

    // Tienda (flujo, se queda)
    const [shopAvailable, setShopAvailable] = useState(false);
    const [boughtCards, setBoughtCards] = useState(new Map());

    const setNewBought = (newBoughtCard) => {
        if (!newBoughtCard) return;
        // Estado funcional: mutar el Map sin setState no re-renderizaba la tienda.
        setBoughtCards((prev) => {
            const next = new Map(prev);
            next.set(newBoughtCard.id, (next.get(newBoughtCard.id) ?? 0) + 1);
            return next;
        });
    }

    // Tablero (Fase 4: useBoardState). canBeClicked/tooltip/overDungeonZone
    // son UI efímera y se quedan.
    const [canBeClicked, setCanBeClicked] = useState(true);
    const [overDungeonZone, setOverDungeonZone] = useState(false);
    const [tooltip, setTooltip] = useState(null);

    // Layout del tablero (game/layout.js). Se inicializa con la ventana
    // y se corrige al medir el contenedor real (ResizeObserver).
    // Callback ref (no effect []): el wrapper no existe en las ramas
    // tempranas (Loading/SelectCharacter), así que se observa al aparecer.
    const boardObserverRef = useRef(null);
    const [layout, setLayout] = useState(() => calcStageLayout(window.innerWidth, window.innerHeight));
    const observeBoard = useCallback((el) => {
        if (boardObserverRef.current) {
            boardObserverRef.current.disconnect();
            boardObserverRef.current = null;
        }
        if (!el || typeof ResizeObserver === 'undefined') return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) return;
            const next = calcStageLayout(rect.width, rect.height);
            setLayout(prev => (
                prev && prev.mode === next.mode
                && prev.width === next.width && prev.height === next.height
                    ? prev
                    : next
            ));
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        boardObserverRef.current = observer;
    }, []);
    const layoutMode = layout.mode;
    const dungeonZone = layoutMode === 'portrait' ? PORTRAIT_DUNGEON_ZONE : DUNGEON_ZONE;
    const discardZone = layoutMode === 'portrait' ? PORTRAIT_DISCARD_ZONE : DISCARD_ZONE;
    const weaponZone = layoutMode === 'portrait' ? PORTRAIT_WEAPON_ZONE : WEAPON_ZONE;



    // Personaje
    const [isWizard, setIsWizard] = useState(false);
    const [isGambler, setIsGambler] = useState(false);
    const [isWarrior, setIsWarrior] = useState(false);
    const isScapingRef = useRef(false);
    const canScape = useRef(true);
    const [isVampire, setIsVampire] = useState(false)
    const vampireAbilityUsed = useRef(false);
    const [maxHealthSteal, setMaxHealthSteal] = useState(3);
    const [isTaming, setIsTaming] = useState(false);
    const [tameDamage, setTameDamage] = useState(0);

    const [availableAbility, setAvailableAbility] = useState(true);
    const [lastGamblerEffect, setLastGamblerEffect] = useState(null);
    const [blacksmithDmg, setBlacksmithDmg] = useState(0)

    // Modificadores
    const [selectModifier, setSelectModifier] = useState(false);
    const [modifiersLoading, setModifiersLoading] = useState(true);
    const userExtraDmg = useRef(0);
    const userPermanentExtraDmg = useRef(0);
    const userDmgMultiplier = useRef(1);
    const mma = useRef(0);
    const enemyDmgMultiplier = useRef(1);
    const enemyExtraDmg = useRef(0);
    const spadesExtraTakedDmg = useRef(0);
    const clubsExtraTakedDmg = useRef(0);
    const healthSteal = useRef(false);
    const [pentakillTargetNumber, setPentakillTargetNumber] = useState(0);
    const [pentakillDmg, setPentakillDmg] = useState(0);
    const [actualStreak, setActualStreak] = useState(0);
    const [maxScapes, setMaxScapes] = useState(1);
    const actualScapes = useRef(1);
    const [ricochet, setRicochet] = useState(false);
    const goldMultiplier = useRef(1);
    const criticalPercentage = useRef(0);
    const [grandma, setGrandma] = useState(false);
    const tacticalChange = useRef(0);
    const tacticalChangeUsed = useRef(false);
    const expert = useRef(false);
    const extraHealthExpert = useRef(0);
    const [scavenger, setScavenger] = useState(false);
    const [vitamine, setVitamine] = useState(false);
    const vitamineValue = useRef(0);
    const [gluttony, setGluttony] = useState(false);
    const [interest, setInterest] = useState(0);
    const [thanatophobia, setThanatophobia] = useState(false);
    const [thanatophobiaActivated, setThanatophobiaActivated] = useState(false);
    const [lifeward, setLifeward] = useState(false)
    const refund = useRef(false);
    const membership = useRef(false);
    const catEye = useRef(false);
    const amego = useRef(false);
    const regeneratorTurns = useRef(0);
    const regeneratorHealth = useRef(0);
    const regeneratorGoalTurns = useRef(0);
    const adrenalin = useRef(false);
    const adrenalinActivated = useRef(false)
    const midas = useRef(false);

    // Efectos de cartas
    const currentHeal = useRef(0);
    const progresiveHeal = useRef(0);
    const progresiveHealTurns = useRef(0);
    const dmgReduction = useRef(0);
    const weaponDmg = useRef(0);
    const invincibilityTurns = useRef(0);
    const revive = useRef(false);
    const reviveHealth = useRef(0);
    const weaponHealthSteal = useRef(false);
    const weaponHealthStealQuantity = useRef(0);
    const poison = useRef(0);
    const antiheal = useRef(false);
    const antihealTurns = useRef(0);
    const breakWeapon = useRef(false);
    const souleaterTurns = useRef(0);
    const sealTurns = useRef(0);
    // Disponibilidad al aplicar el sello: al expirar se restaura ESTO,
    // no `true` a ciegas (fix bug sello arcano vs habilidad ya usada).
    const sealedFromAvailableRef = useRef(true);

    // Minibosses
    const [minibossActive, setMinibossActive] = useState(false);
    const [minibossCard, setMinibossCard] = useState(undefined);
    const [lastCardBoss, setLastCardBoss] = useState(undefined);
    const isPillageQueenActive = useRef(false);
    const isGuantesActive = useRef(false);

    const chamanTurns = useRef(0);
    const isChamanActive = useRef(false);
    const chamanForce = useRef(0);
    // Efecto del miniboss actualmente activo. Se usa para saber si la carta
    // derrotada es EL miniboss activo o solo una pieza derivada (slimes, etc.).
    const activeMinibossEffect = useRef(null);
    // Disfraz del Mímico: se genera UNA sola vez por partida y se reutiliza si
    // el miniboss vuelve a aparecer (null = aún no se ha generado).
    const mimicDisguiseRef = useRef(null);
    // Araña gigante: partes restantes (9 al aparecer) y turnos que la telaraña
    // bloquea la huida (1 por mano, patrón de chamanTurns).
    const spiderPartsLeft = useRef(0);
    const webTurns = useRef(0);

    // Control de robo
    const isDrawingRef = useRef(false);

    const hasStartedNewGameRef = useRef(false);

    // Guardado y refs espejo (Fase 2: useGamePersistence).
    // modifiersRef era dead code (solo se escribía, nunca se leía).

    // =====================================================
    // HELPERS — claves de cartas y timers cancelables (Fase 0: extraídos)
    // =====================================================
    // uid -> front/src/game/utils.js
    // Timers cancelables -> front/src/hooks/game/useScheduledTimeouts.js
    // (registrados para poder limpiarlos al reiniciar o desmontar).
    const { scheduleTimeout, cancelTimeout, clearScheduledTimeouts } = useScheduledTimeouts();

    // Estado del jugador y del tablero (Fase 4). Mismos nombres para
    // no tocar los call sites. Iconos congelados en el hook.
    const {
        maxHealth, setMaxHealth,
        health, setHealth,
        healthIcon,
        gold, setGold,
        healthAnimation, goldAnimation,
        healthAnimationValue, goldAnimationValue,
        healAnimation, healthStealAnimation,
        damageAnimation, coinAnimation,
    } = usePlayerState({
        scheduleTimeout,
        icons: {
            full: FullHealthIcon,
            mid: MidHealthIcon,
            none: NoHealthIcon,
            heal: HealAnimation,
            steal: HealthStealIcon,
            damage: DamageAnimation,
            allDamage: AllDamageAnimation,
            gold: GoldAnimation,
        },
    });
    const {
        layerRef, cardRefs,
        room, setRoom,
        dungeon, setDungeon,
        discardPile, setDiscardPile,
        weapon, setWeapon,
        slainMonsters, setSlainMonsters,
        deleteFromRoom, moveCardToDiscard,
    } = useBoardState({ scheduleTimeout });

    // Refs de sincronización y control de reentrada / unicidad
    const matchDeckRef = useRef(matchDeck);
    const shopWasOpenRef = useRef(false);
    const isStartingRoundRef = useRef(false);
    const abilityLockRef = useRef(false);
    const appliedModifiersCountRef = useRef(0);
    const passiveAppliedRef = useRef(false);
    const souleaterStolen = useRef(0);
    useEffect(() => { matchDeckRef.current = matchDeck; }, [matchDeck]);

    // =====================================================
    // FUNCIONES AUXILIARES — solo Capa 1 / contexto
    // =====================================================

        const handleCloseModal = useCallback(() => {
            setIsModalOpen(false);
            window.history.pushState(null, null, window.location.pathname);
        }, []);

        const handleConfirmAction = useCallback(() => {
            setIsModalOpen(false);

            // El modal indica que la partida contará como derrota → se envía false.
            saveExit({
                time: timeRef.current,
                gold: totalEarnedGold.current,
                healed: healedLife.current,
                victory: false,
                reason: 'modal',
            });
            navigate('/');
        }, [navigate, saveExit]);

        // =====================================================
        // CAPA 2 — FUNCIONES HOJA / PRIMITIVAS
        // =====================================================

        // calculateLayout eliminado (Fase 4): el canvas Konva usa tamaño
        // fijo y se dimensiona al contenedor real (ResizeObserver).

        // Animaciones y descarte (Fase 4: usePlayerState/useBoardState).

        const heal_roulete = (execute = false) => {
            if (execute) {
                if (Math.floor(Math.random() * 100) >= 75) {
                    currentHeal.current = -100
                } else {
                    currentHeal.current = 100
                }
            }
        }

        const cleanHealEffects = () => {
            currentHeal.current = 0;
            progresiveHeal.current = 0;
            progresiveHealTurns.current = 0;
            dmgReduction.current = 0;
        }

        const cleanWeaponEffects = () => {
            weaponDmg.current = 0
            invincibilityTurns.current = 0
            revive.current = false
            reviveHealth.current = 0
            weaponHealthSteal.current = false
            weaponHealthStealQuantity.current = 0
        }

        const cleanEnemyEffects = () => {
            poison.current = 0;
            antiheal.current = false;
            breakWeapon.current = false;
            sealTurns.current = 0;
            souleaterTurns.current = 0;
        }

        // Cálculo puro en game/cards.js (preserva claves existentes).
        const shuffleDeck = (deck) => {
            setDungeon(buildShuffledDeck(deck, uid, shuffle));
        };

        const addCardToDungeon = (card) => {
            if (!card) return;
            setDungeon(prev => prependToDeck(prev, card))
        }

        const addCardAndShuffle = (card) => {
            if (!card) return;
            // Solo asigna clave si la carta no la trae: re-clavar todas las
            // cartas en cada inserción duplica keys referenciadas por refs.
            setDungeon(prev => insertAndShuffle(prev, card, uid, shuffle));
        }

        const addEnemy = async (anti_exec) => {
            const newEnemy = await addEnemysToMatchDeck(1, rounds);
            return newEnemy[0];
        }
        const addEnemies = async (round = rounds) => {
            // Fórmula de enemigos por ronda: 5, 7, 9, 5, 7, 9, ... (game/cards.js)
            const quantity = enemyQuantityForRound(round);
            const newEnemys = await addEnemysToMatchDeck(quantity, round);
            return newEnemys;
        };

        const warrior = () => {
            handleNewAchievement('habilidad_guerrero')
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.scareStart'))
            // Susto puro en game/characters.js; aquí solo se aplica.
            const result = warriorScare(room, dungeon);
            if (result.scared.length > 0) {
                result.scared.forEach((card) => {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.scareFled', { valor: card?.valor, palo: card?.palo }))
                })
                setRoom(result.room);
                setDungeon(result.dungeon);
            } else {
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.scareNone'))
            }
            actualScapes.current - 1 > 0 ?
                actualScapes.current -= 1 :
                canScape.current = false
            setThanatophobiaActivated(false);
            canScape.current ? setAvailableAbility(true) : setAvailableAbility(false)
        }

        const elf = () => {
            // Abrojos puros en game/characters.js; aquí solo logs y commit.
            const result = elfCaltrops(room);
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.caltrops'))
            result.weakened.forEach((weakened) => {
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.caltropsWeakened', { prevValor: weakened.prevValor, palo: weakened.palo, valor: weakened.valor }))
            });
            setRoom(result.room);
        }

        const scape = () => {
            if (!canScape.current) return;

            // Telaraña de la Araña gigante: bloquea la huida sin consumir intentos
            // (no se toca canScape ni actualScapes).
            if (webTurns.current > 0) {
                logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.webBlock')}`);
                return;
            }

            isScapingRef.current = true;
            // Backup: el reset se programa aquí mismo por si el effect de robo no
            // vuelve a ejecutarse (la sala/mazmorra no cambian de tamaño).
            scheduleTimeout(() => {
                isScapingRef.current = false;
            }, 50);

            const blockedCards = [];
            const nonBlocked = [];

            room.forEach((card) => {
                const tempEffect = card?.efectos;
                const cardEffect = Array.isArray(tempEffect)
                    ? tempEffect
                    : [tempEffect];

                if (cardEffect[0]?.name === 'blocked') {
                    blockedCards.push(card);
                } else {
                    nonBlocked.push(card);
                }
            });

            setDungeon(prev => [...nonBlocked, ...prev]);
            setRoom(blockedCards);

            if (actualScapes.current - 1 > 0) {
                actualScapes.current -= 1;
            } else {
                canScape.current = false;
            }

            if (isGuantesActive.current) {
                const newHairball = getHairball();
                if (newHairball) {
                    addCardToDungeon(newHairball);
                }
            }


            if (character?.habilidad_personaje?.codigo === 'guerrero' && !canScape.current) {
                setAvailableAbility(false);
            }
        };

        const cleanModifiers = () => {
            setPentakillTargetNumber(0);
            setPentakillDmg(0);
            setActualStreak(0);
            actualScapes.current = (1);
            healthSteal.current = (false);
            setRicochet(false)
            enemyDmgMultiplier.current = (1);
            enemyExtraDmg.current = (0)
            spadesExtraTakedDmg.current = (0);
            clubsExtraTakedDmg.current = (0);
            goldMultiplier.current = (1)
            setMaxScapes(1)
            userExtraDmg.current = (0)
            userPermanentExtraDmg.current = (0)
            userDmgMultiplier.current = (1);
            criticalPercentage.current = (0);
            mma.current = (0);
            setGrandma(false);
            tacticalChange.current = (0);
            expert.current = (false);
            extraHealthExpert.current = (0)
            setScavenger(false);
            setVitamine(false);
            setGluttony(false);
            setThanatophobia(false)
            setThanatophobiaActivated(false);
            setInterest(0);
            vitamineValue.current = 0;
            refund.current = false;
            membership.current = false;
            catEye.current = false;
            amego.current = false;
            regeneratorGoalTurns.current = 0;
            regeneratorHealth.current = 0;
            regeneratorTurns.current = 0;
            adrenalin.current = false;
            adrenalinActivated.current = false;
            midas.current = false;
            setLifeward(false);
            sealTurns.current = 0;
            totalCardsUsed.current = 0;
            healedLife.current = 0;
            totalEarnedGold.current = 0;
            antiheal.current = false;
            goldMultiplier.current = 1;
        }
        // =====================================================
        // CAPA 3 — COMPOSICIÓN DE FUNCIONES
        // =====================================================

        const applyThorny = () => {
            damageAnimation(3, true);
            setHealth(prev => Math.max(0, prev - 3))
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.thorns'))
        }

        const applyPlunder = (quantity) => {
            coinAnimation(-quantity)
            setGold(prev => Math.max(0, prev - quantity));
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.plunderGold', { quantity }))
        }

        const applyExtraGold = (quantity) => {
            coinAnimation(quantity)
            setGold(prev => prev + quantity);
            totalEarnedGold.current += quantity;
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.extraGold', { quantity }))
        }

        const weaponBreaker = () => {
            if (weapon) {
                moveCardToDiscard([weapon], true)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.weaponBroke'))
                cleanWeaponEffects();
                setWeapon(null)
                if (slainMonsters.length > 0) {
                    moveCardToDiscard([...slainMonsters], true)
                    scheduleTimeout(() => {
                        setSlainMonsters([]);
                    }, 200);
                }
            }
            breakWeapon.current = false;
        }

        const applyMitosis = async (cardValue) => {
            const cardPower = Math.min(14, Math.max(Math.floor(cardValue / 2), 2));
            const card1 = await addEnemyToMatchDeck(cardPower, rounds);
            const card2 = await addEnemyToMatchDeck(cardPower, rounds);
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.mitosis'))
            if (card1 !== null) {
                addCardToDungeon(card1)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.mitosisAdded', { valor: card1?.valor, palo: card1?.palo }))
            }
            if (card2 !== null) {
                addCardToDungeon(card2)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.mitosisAdded', { valor: card2?.valor, palo: card2?.palo }))
            }
        }

        const applySouleater = () => {
            if (souleaterTurns.current === 0) {
                // Clamp: vida máxima >= 1, vida actual <= nueva máxima, y se
                // guarda lo robado para restaurar exactamente al expirar.
                const stolen = Math.min(3, Math.max(0, maxHealth - 1));
                souleaterStolen.current = stolen;
                const newMax = maxHealth - stolen;
                setMaxHealth(newMax);
                setHealth(prev => Math.max(1, Math.min(prev, newMax)));
            }
            souleaterTurns.current += 3;
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.souleater', { turns: souleaterTurns.current }))
        }

        const applySeal = () => {
            // Solo se fotografía en aplicación fresca, no al refrescar la pila.
            if (sealTurns.current === 0) {
                sealedFromAvailableRef.current = availableAbility;
            }
            sealTurns.current += 3;
            setAvailableAbility(false);
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.seal'))
        }

        const getChamanPower = useCallback(() => countChamanPower(dungeon, room), [dungeon, room]);

        const fillRoom = useCallback((onComplete) => {
            const roomSize = room.length;
            const cardsNeeded = 4 - roomSize;

            // Contador de turnos del Chamán
            if (isChamanActive.current) {
                chamanTurns.current += 1;
            }

            // Telaraña de la Araña gigante: 1 mano = 1 turno de bloqueo de huida
            if (webTurns.current > 0) {
                webTurns.current -= 1;
            }

            // Comprobar si el Chamán ya está presente en la mesa
            const isChamanInRoom = room.some(c => c?.palo === 'Miniboss' && c?.codigo === 'chaman');

            // Condición de aparición: cada 5 turnos O cuando queden menos de 4 cartas totales
            const totalCardsLeft = dungeon.length + room.length;
            const shouldSpawnChaman = isChamanActive.current &&
                !isChamanInRoom &&
                minibossCard &&
                (chamanTurns.current % 5 === 0 || totalCardsLeft < 4);

            if (cardsNeeded <= 0 || (dungeon.length === 0 && lastCardBoss === undefined && !shouldSpawnChaman)) {
                onComplete?.();
                return;
            }

            // Extraer cartas de la mazmorra identificadas por su clave
            // (filtrar por clave es robusto frente a reordenaciones del mazo).
            const actualToDraw = Math.min(cardsNeeded, dungeon.length);
            const newCards = dungeon.slice(-actualToDraw).reverse();
            const drawnKeys = new Set(newCards.map((c) => c?.key));

            setDungeon(prevDungeon => prevDungeon.filter(c => !drawnKeys.has(c?.key)));

            // Preparar el lote de cartas incluyendo al Chamán si corresponde
            let finalCardsToAdd = [...newCards];

            if (shouldSpawnChaman) {
                const updatedChamanCard = {
                    ...minibossCard,
                    valor: getChamanPower()
                };

                if (finalCardsToAdd.length >= cardsNeeded) {
                    // La mano está llena: el chaman sustituye a la última carta del
                    // lote y ESA carta se devuelve al mazo (antes se perdía).
                    const replaced = finalCardsToAdd.pop();
                    finalCardsToAdd.push(updatedChamanCard);
                    if (replaced) {
                        setDungeon(prevDungeon => [replaced, ...prevDungeon]);
                    }
                } else {
                    finalCardsToAdd.push(updatedChamanCard);
                }
            }

            // Colocar cartas con delay y sonido
            if (finalCardsToAdd.length === 0) {
                // Lote vacío (p. ej. dungeon agotado): asegurar el cierre del robo
                // para no dejar isDrawingRef colgado (softlock) y reponer el boss.
                if (lastCardBoss && !room.some(c => c?.key === lastCardBoss?.key)) {
                    setRoom(prevRoom => prevRoom.some(c => c?.key === lastCardBoss?.key) ? prevRoom : [...prevRoom, lastCardBoss]);
                }
                onComplete?.();
            }
            finalCardsToAdd.forEach((card, i) => {
                scheduleTimeout(() => {
                    startPlaceCardSound();
                    scheduleTimeout(() => {
                        setRoom(prevRoom => {
                            const exists = prevRoom.some(existingCard => existingCard?.key === card?.key);
                            return exists ? prevRoom : [...prevRoom, card];
                        });

                        if (i === finalCardsToAdd.length - 1) {
                            if (actualToDraw === dungeon.length && lastCardBoss && !room.some(c => c?.key === lastCardBoss?.key)) {
                                setRoom(prevRoom => prevRoom.some(c => c?.key === lastCardBoss?.key) ? prevRoom : [...prevRoom, lastCardBoss]);
                            }
                            onComplete?.();
                        }
                    });
                }, 150 * i);
            });

            // Efectos de estado de la ronda
            if (poison.current > 0) {
                poison.current -= 1;
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.poison'));
                damageAnimation(1);
                setHealth(prev => prev - 1);
            }

            if (antihealTurns.current > 0) {
                antihealTurns.current -= 1;
                if (antihealTurns.current !== 0) {
                    antiheal.current = true;
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.antihealTurns', { turns: antihealTurns.current }));
                } else {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.antihealOff'));
                    antiheal.current = false;
                }

            }

            if (progresiveHealTurns.current > 0) {
                if (!antiheal.current) {
                    setHealth(prev => Math.min(maxHealth, prev + progresiveHeal.current));
                    healAnimation(progresiveHeal.current);
                    healedLife.current += progresiveHeal.current;
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.progHeal', { amount: progresiveHeal.current }));
                } else {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.progHealBlocked'));
                }
                progresiveHealTurns.current -= 1;
            }

            if (regeneratorGoalTurns.current > 0) {
                regeneratorTurns.current += 1;
                if (regeneratorTurns.current === regeneratorGoalTurns.current) {
                    regeneratorTurns.current = 0;
                    if (!antiheal.current) {
                        healAnimation(regeneratorHealth.current);
                        setHealth(prev => Math.min(maxHealth, prev + regeneratorHealth.current));
                        logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.passiveHeal', { amount: regeneratorHealth.current }));
                    } else {
                        logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.passiveHealBlocked'));
                    }
                }
            }

            if (souleaterTurns.current > 0) {
                if (souleaterTurns.current === 1) {
                    const restore = souleaterStolen.current;
                    souleaterStolen.current = 0;
                    if (restore > 0) {
                        setMaxHealth(prev => prev + restore);
                        setHealth(prev => (prev >= maxHealth ? Math.min(maxHealth + restore, prev + restore) : prev));
                        logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.maxHealthRestored'));
                    }
                }
                souleaterTurns.current -= 1;
            }

            if (sealTurns.current > 0) {
                if (sealTurns.current === 1) {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.sealExpired'));
                    // Re-evaluar la disponibilidad real al expirar el sello
                    // (puro en game/cardEffects.js; fix bug sello arcano).
                    const { available } = resolveSealExpiry({
                        isGambler,
                        isVampire,
                        gold,
                        health,
                        vampireUsed: vampireAbilityUsed.current,
                        wasAvailable: sealedFromAvailableRef.current,
                    });
                    setAvailableAbility(available);
                } else {
                    setAvailableAbility(false);
                }
                sealTurns.current -= 1;
            }

        }, [room, dungeon, maxHealth, health, gold, isGambler, isVampire, minibossCard, lastCardBoss, getChamanPower, startPlaceCardSound, damageAnimation, healAnimation]);

        const applyCharacterPassive = useCallback((char) => {
            // passiveAppliedRef evita reaplicar la pasiva (doble apply al volver
            // de la tienda o al re-ejecutar el effect de rounds === 1).
            if (!char || passiveAppliedRef.current) return;
            passiveAppliedRef.current = true;
            // Cálculo puro en game/characters.js; aquí solo se vuelca.
            // Los valores son absolutos (25, 50, 2), no incrementos.
            const code = char?.habilidad_personaje?.codigo;
            const { state: next, handled } = applyPassiveToState({
                isWarrior,
                maxHealth,
                health,
                maxScapes,
                actualScapes: actualScapes.current,
                isWizard,
                isGambler,
                gold,
                blacksmithDmg,
                isVampire,
                maxHealthSteal,
                tameDamage,
            }, code);
            if (!handled) return;
            if (next.isWarrior !== isWarrior) {
                setIsWarrior(next.isWarrior);
            }
            setMaxHealth(next.maxHealth);
            setHealth(next.health);
            setMaxScapes(next.maxScapes);
            actualScapes.current = next.actualScapes;
            if (next.isWizard !== isWizard) {
                setIsWizard(next.isWizard);
            }
            if (next.isGambler !== isGambler) {
                setIsGambler(next.isGambler);
            }
            if (next.gold !== gold) {
                if (code === 'apostador') {
                    coinAnimation(50);
                }
                setGold(next.gold);
            }
            setBlacksmithDmg(next.blacksmithDmg);
            if (next.isVampire !== isVampire) {
                setIsVampire(next.isVampire);
            }
            setMaxHealthSteal(next.maxHealthSteal);
            setTameDamage(next.tameDamage);
        }, []);

        const handleCleanMinibosses = () => {
            setMinibossActive(false);
            setLastCardBoss(undefined);
            setMinibossCard(undefined);
            isPillageQueenActive.current = false;
            isGuantesActive.current = false;
            chamanTurns.current = 0;
            isChamanActive.current = false;
            chamanForce.current = 0;
            activeMinibossEffect.current = null;
            // Araña gigante: se limpia con el resto del estado del miniboss
            // (mismo patrón que chamanTurns) — también al reiniciar la partida.
            spiderPartsLeft.current = 0;
            webTurns.current = 0;

        }

        /**
         *
         * @param {Object} effect
         * @returns
         */
        const handleMiniboss = (miniboss) => {
            const effectName = getMinibossEffectName(miniboss);

            // Guard: si la BD no tiene cartas de miniboss (seeder no ejecutado),
            // getRandomMiniboss() devuelve null y no hay nada que activar.
            if (!miniboss || !effectName) {
                return false;
            }

            setMinibossActive(true);
            activeMinibossEffect.current = effectName;

            // Plan puro en game/minibosses.js; aquí solo se aplica.
            // El roll del disfraz solo se genera si no hay uno (único por partida).
            const plan = planMinibossSpawn(miniboss, {
                uidFn: uid,
                chamanPower: getChamanPower(),
                mimicDisguise: mimicDisguiseRef.current,
                mimicRoll: mimicDisguiseRef.current ? undefined : 2 + Math.floor(Math.random() * 9),
                mimicSuit: HeartIcon,
            });
            if (!plan.handled) {
                return false;
            }

            plan.shuffleCards.forEach((spawnCard) => addCardAndShuffle(spawnCard));
            if (plan.lastCardBoss) {
                setLastCardBoss(plan.lastCardBoss);
            }
            if (plan.chamanCard) {
                setMinibossCard(plan.chamanCard);
            }
            if (plan.patch.spiderPartsLeft !== undefined) {
                spiderPartsLeft.current = plan.patch.spiderPartsLeft;
            }
            if (plan.patch.pillageQueenActive) {
                isPillageQueenActive.current = true;
            }
            if (plan.patch.guantesActive) {
                isGuantesActive.current = true;
            }
            if (plan.patch.chamanActive) {
                isChamanActive.current = true;
                chamanTurns.current = plan.patch.chamanTurns;
            }
            if (plan.newDisguise && !mimicDisguiseRef.current) {
                mimicDisguiseRef.current = plan.newDisguise;
            }
            plan.logs.forEach((entry) => {
                logsRef.current.push(`${logsRef.current.length + 1} - ${t(entry.key, entry.params)}`);
            });
            return true;
        }


        const handleMinibossPillageQueen = () => {
            if (weapon) {
                weaponBreaker();
                deleteCardFromMatchDeck(weapon.key)
                logsRef.current.push(
                    `${logsRef.current.length + 1} - ${t('game:logs.pillageWeaponDestroyed')}`
                );
            }
            // Último saqueo: la reina se lleva un 25% del oro actual
            setGold(prev => Math.floor(prev * 0.75));
            logsRef.current.push(
                `${logsRef.current.length + 1} - ${t('game:logs.pillageQueenSteal')}`
            );
            logsRef.current.push(
                `${logsRef.current.length + 1} - ${t('game:logs.pillageQueenDefeated')}`
            );
        }
        const handleMinibossGuantes = () => {
            logsRef.current.push(
                `${logsRef.current.length + 1} - ${t('game:logs.guantesDefeated')}`
            );
        }

        const restartFunction = (resetCharacter = false) => {
            setBoughtCards(new Map());
            setIsRestarting(true);
            setRounds(0);
            setGold(0);
            setHealth(20);
            setMaxHealth(20)
            setAvailableAbility(true);
            setShopAvailable(false)
            canScape.current = true;
            healedLife.current = 0;
            totalEarnedGold.current = 0;
            setEnemysDefeated(0);
            totalCardsUsed.current = 0;
            setIsWizard(false);
            setIsGambler(false);
            setIsWarrior(false);
            setIsVampire(false);
            vampireAbilityUsed.current = false;
            setBlacksmithDmg(0)
            setMaxScapes(1);
            setLastGamblerEffect(null);
            setContinuedGame(false);
            resetSaveFlag();

            // Reiniciar minibosses
            handleCleanMinibosses()
            mimicDisguiseRef.current = null;


            // Reiniciar modificadores
            cleanModifiers()

            // Reiniciar efectos cartas
            cleanHealEffects()
            cleanWeaponEffects()
            cleanEnemyEffects()

            // Limpieza de cartas y mazo
            setDungeon([]);
            setRoom([]);
            setDiscardPile([]);
            setWeapon(null);
            setSlainMonsters([]);

            // Reiniciar contexto
            setNewDeck();
            setActiveModifiers([]);
            resetMissions();
            if (resetCharacter) {
                setNewCharacter(null);
            }
            setGameLoading(false)
            setRestart(false)

            // Sonido y UI básica
            setGameOver(false);
            setGameOn(false);
            setGameWin(false)
            logsRef.current = [];

            // Reset de refs/estado de control y UI miscelánea
            isStartingRoundRef.current = false;
            isDrawingRef.current = false;
            isScapingRef.current = false;
            passiveAppliedRef.current = false;
            appliedModifiersCountRef.current = 0;
            abilityLockRef.current = false;
            shopWasOpenRef.current = false;
            cardRefs.current = {};
            healedRef.current = false;
            tacticalChangeUsed.current = false;
            antihealTurns.current = 0;
            clearScheduledTimeouts();
            setIsTaming(false);
            setTameDamage(0);
            setMaxHealthSteal(3);
            setSelectModifier(false);
            setTooltip(null);
            setCanBeClicked(true);
            setOverDungeonZone(false);

            // Reset del Timer
            resetTimer();
            // Se difiere para que la pantalla de carga se pinte al menos un frame
            // (evita el parpadeo del cambio de partida).
            scheduleTimeout(() => {
                setIsRestarting(false);
            }, 300);
        }

        const startNewRound = async (continueMatch = false) => {
            // Condición de fin de juego (Guard Clause): Retornamos temprano y evitamos el "else"
            const isGameWon = rounds === maxRounds && !continueMatch && !continuedGame;
            if (isGameWon) {
                setGameOn(false);
                setGameWin(true);
                cardRefs.current = [];
                return;
            }

            // Guard de reentrada: effects concurrentes (fin de ronda + continuación)
            // no deben ejecutar la ronda dos veces.
            if (isStartingRoundRef.current) return;
            isStartingRoundRef.current = true;

            try {
                setSelectModifier(true);
                let newEnemies = []; // Nota: Corregido de 'newEnemys' a 'newEnemies'
                const isActiveMatch = gameOn || continueMatch;
                const startedRound = rounds + 1;

                // Agrupamos la lógica por flujo: Primera ronda vs Rondas siguientes
                let pendingMiniboss = null;
                if (rounds === 0) {
                    setShopAvailable(false);
                    applyCharacterPassive(character);
                    setGameOn(true);
                    // Nueva partida activa: se vuelve a permitir el guardado
                    resetSaveFlag();
                    setRounds(startedRound);
                }
                else if (isActiveMatch) { // Ya sabemos implícitamente que rounds >= 1
                    setShopAvailable(true);
                    setRounds(startedRound);

                    // Interés mínimo 2 (con 1 se duplicaría el oro en cada ronda)
                    if (interest >= 2) {
                        setGold(prev => prev + Math.floor(prev / interest));
                    }

                    newEnemies = await addEnemies(startedRound);

                    if (health <= maxHealth / 4 && health > 0) {
                        handleNewAchievement('al_limite');
                    }

                    // El miniboss corresponde a la ronda que ACABA de empezar
                    if (startedRound % 5 === 0 && startedRound % 10 !== 0) {
                        pendingMiniboss = getRandomMiniboss();
                    }
                }
                else {
                    setShopAvailable(false);
                }

                // Actualización de mazos y descartes
                shuffleDeck([...newEnemies, ...matchDeck]);
                setDiscardPile([]);

                // El miniboss se spawnnea DESPUÉS de barajar: shuffleDeck reemplaza
                // el dungeon completo, así que antes de esta línea sus cartas (p. ej.
                // la Reina Slime) se sobrescribían y se perdían.
                if (pendingMiniboss) {
                    handleMiniboss(pendingMiniboss);
                }

                // Simplificación de la lógica de habilidades (sellada → no reactivar)
                const canUseAbility = sealTurns.current === 0 && (!isGambler || (isVampire && health > 5));
                if (canUseAbility) {
                    setAvailableAbility(true);
                }

                // Misiones: la meta de rondas avanza al empezar cada ronda.
                trackMissionEvent({ round: startedRound });

                cardRefs.current = [];
            } finally {
                isStartingRoundRef.current = false;
            }
        };

        const gambler = async () => {
            const roll = Math.floor(Math.random() * 100) + 1;
            if (roll === 100) {
                setGold(prev => prev + 50);
                if (!antiheal.current) {
                    setHealth(prev => Math.min(maxHealth, prev + 10));
                    healedLife.current += 10;
                }
                userExtraDmg.current += 10;
                setLastGamblerEffect(`¡JACKPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerJackpot'))
                handleNewAchievement('desafio_apostador')
            }
            else if (roll === 1) {
                setGold(0)
                setLastGamblerEffect(`La banca gana, tú pierdes todo tu dinero.`);
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerBust'))
            }
            else if (roll <= 10) {
                //Veneno
                poison.current += 3;
                setLastGamblerEffect(`Estás envenenado 3 turnos. Ese chupito tenia un sabor raro...`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerPoison'))
            }
            else if (roll <= 20) {
                //Modificar daño
                const randomDmg = Math.floor(Math.random() * 7) - 3;
                userExtraDmg.current += randomDmg;
                setLastGamblerEffect(`${randomDmg} de daño extra en la siguiente acción.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerDmg', { amount: randomDmg }))
            } else if (roll <= 30) {
                progresiveHeal.current = 1;
                progresiveHealTurns.current = 3;
                setLastGamblerEffect(`Curación progresiva 3 turnos. ¡La hidromiel no falla!`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerProgHeal'))
            }
            else if (roll <= 40) {
                //Curación/Daño
                const randomHeal = Math.floor(Math.random() * 7) - 3;
                const appliedHeal = (randomHeal > 0 && antiheal.current) ? 0 : randomHeal;
                if (randomHeal < 0) {
                    damageAnimation(Math.abs(randomHeal))
                } else if (appliedHeal > 0) {
                    healAnimation(appliedHeal)
                    healedLife.current += appliedHeal;
                }
                setHealth(prev => Math.min(maxHealth, Math.max(0, prev + appliedHeal)));
                setLastGamblerEffect(`${appliedHeal} de vida.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerHeal', { amount: appliedHeal }))
            } else if (roll <= 60) {
                //Añadir arma
                const randomPower = Math.floor(Math.random() * (rounds + 3))
                const filter = Math.max(2, randomPower)
                const weaponPower = Math.min(filter, 13)
                const newWeapon = await getWeapon(weaponPower);
                if (newWeapon) {
                    addCardToMatchDeck(newWeapon);
                    setLastGamblerEffect(`Añadida una nueva arma con valor ${newWeapon?.valor}.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerWeapon', { valor: newWeapon?.valor }))
                    addCardToDungeon(newWeapon);
                } else {
                    setLastGamblerEffect(`La banca no ha podido preparar tu arma esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerWeaponFail'))
                }
            } else if (roll <= 80) {
                //Añadir curación
                const randomPower = Math.floor(Math.random() * (rounds + 3))
                const filter = Math.max(2, randomPower)
                const healPower = Math.min(filter, 13)
                const newHeal = await getHealItem(healPower);
                if (newHeal) {
                    addCardToMatchDeck(newHeal);
                    setLastGamblerEffect(`Añadida una nueva curación con valor ${newHeal?.valor}.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerHealCard', { valor: newHeal?.valor }))
                    addCardToDungeon(newHeal)
                } else {
                    setLastGamblerEffect(`La banca no ha podido preparar tu curación esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerHealCardFail'))
                }
            } else if (roll <= 90) {
                const randomHealth = Math.floor(Math.random() * 3) - 1;
                if (randomHealth == -1) {
                    damageAnimation(randomHealth)
                } else {
                    healAnimation(randomHealth)
                }
                setMaxHealth(prev => prev + randomHealth);
                setLastGamblerEffect(`${randomHealth} de vida máxima.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerMaxHealth', { amount: randomHealth }))
            } else {
                //Añadir enemigo
                const newEnemy = await addEnemy();
                if (newEnemy) {
                    setLastGamblerEffect(`Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerEnemy', { valor: newEnemy?.valor }))
                    addCardToDungeon(newEnemy);
                } else {
                    setLastGamblerEffect(`La banca no ha encontrado un enemigo esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.gamblerEnemyFail'))
                }
            }
        }
        // =====================================================
        // CAPA 4 — ORQUESTACIÓN
        // =====================================================

        // Adaptador Fase 1: el cálculo puro vive en game/cardEffects.js;
        // aquí solo se vuelca al estado/refs y se ejecutan los eventos
        // con las funciones existentes (sin cambios de comportamiento).
        const snapshotCardEffects = () => ({
            currentHeal: currentHeal.current,
            dmgReduction: dmgReduction.current,
            progresiveHeal: progresiveHeal.current,
            progresiveHealTurns: progresiveHealTurns.current,
            weaponDmg: weaponDmg.current,
            invincibilityTurns: invincibilityTurns.current,
            revive: revive.current,
            reviveHealth: reviveHealth.current,
            weaponHealthSteal: weaponHealthSteal.current,
            weaponHealthStealQuantity: weaponHealthStealQuantity.current,
            antiheal: antiheal.current,
            antihealTurns: antihealTurns.current,
            breakWeapon: breakWeapon.current,
            poison: poison.current,
            sealTurns: sealTurns.current,
            availableAbility,
            isGambler,
            isVampire,
        });

        const commitCardEffects = (next) => {
            currentHeal.current = next.currentHeal;
            dmgReduction.current = next.dmgReduction;
            progresiveHeal.current = next.progresiveHeal;
            progresiveHealTurns.current = next.progresiveHealTurns;
            weaponDmg.current = next.weaponDmg;
            invincibilityTurns.current = next.invincibilityTurns;
            revive.current = next.revive;
            reviveHealth.current = next.reviveHealth;
            weaponHealthSteal.current = next.weaponHealthSteal;
            weaponHealthStealQuantity.current = next.weaponHealthStealQuantity;
            antiheal.current = next.antiheal;
            antihealTurns.current = next.antihealTurns;
            breakWeapon.current = next.breakWeapon;
            poison.current = next.poison;
            sealTurns.current = next.sealTurns;
            if (next.availableAbility !== availableAbility) {
                setAvailableAbility(next.availableAbility);
            }
        };

        const applyCardEffect = (effect, cardValue) => {
            const { state: next, handled, events } = applyCardEffectToState(snapshotCardEffects(), effect, cardValue);
            if (!handled) {
                return false;
            }
            commitCardEffects(next);
            events.forEach((event) => {
                switch (event.type) {
                    case 'healRoulette':
                        heal_roulete(true);
                        break;
                    case 'achievement':
                        handleNewAchievement(event.id);
                        break;
                    case 'thorny':
                        applyThorny();
                        break;
                    case 'plunder':
                        applyPlunder(event.cardValue);
                        break;
                    case 'extraGold':
                        applyExtraGold(event.cardValue);
                        break;
                    case 'mitosis':
                        applyMitosis(event.cardValue).catch((mitosisError) => console.error("Error en la mitosis:", mitosisError));
                        break;
                    case 'souleater':
                        applySouleater();
                        break;
                    case 'seal':
                        applySeal();
                        break;
                    default:
                        break;
                }
            });
            return true;
        }


        const continueFunction = () => {
            setGameOn(true);
            setContinuedGame(true);
            startNewRound(true).catch((roundError) => console.error("Error al iniciar la ronda:", roundError));
        };

        // =====================================================
        // CAPA 5 — EFECTOS DE CARTA
        // =====================================================

        const handleCardEffect = (card) => {
            const cardEffects = card?.efectos;
            const effectsList = Array.isArray(cardEffects) ? cardEffects : [cardEffects];
            effectsList.forEach((effect) => {
                applyCardEffect(effect, card?.valor)
            });
        }

        // =====================================================
        // CAPA 6 — ACCIONES DE CARTA
        // =====================================================

        const handleHeal = (card) => {
            currentHeal.current = card?.valor;
            if (card?.especial) {
                handleCardEffect(card)
            }
            if (isVampire || healedRef.current || antiheal.current) {
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.healBlocked', { valor: card?.valor, palo: card?.palo }))
                moveCardToDiscard([card])
                setActualStreak(0);
                return true;
            }

            if (gluttony) {
                currentHeal.current += 1;
            }
            if (vitamine && currentHeal.current + health > maxHealth) {
                vitamineValue.current = Math.min(2, (currentHeal.current + health - maxHealth));
            }
            setHealth(prev => Math.max(0, Math.min(maxHealth, prev + currentHeal.current)));
            healAnimation(currentHeal.current)
            healedLife.current += currentHeal.current;
            healedRef.current = true
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.healed', { valor: card?.valor, palo: card?.palo, amount: currentHeal.current }))

            // Efecto "Suministros del reino feérico" (Rey hada):
            // "Cada vez que te curas con cartas de curación, le baja 2 de vida máxima hasta 2 de vida."
            // La vida máxima es SU VALOR como carta (por eso tiene 30): cada carta de
            // curación que juegues le resta 2 al Rey hada, con suelo de 2, mientras
            // siga vivo (en la dungeon o en la sala). No afecta a tu vida máxima.
            const esReyHada = (c) => c?.palo === 'Miniboss' && c?.codigo === 'rey';
            const reyHada = [...dungeon, ...room].find(esReyHada);
            if (reyHada && reyHada.valor > 2) {
                const nuevaVidaRey = Math.max(2, reyHada.valor - 2);
                setRoom(prev => prev.map(c => esReyHada(c) ? { ...c, valor: nuevaVidaRey } : c));
                setDungeon(prev => prev.map(c => esReyHada(c) ? { ...c, valor: nuevaVidaRey } : c));
                logsRef.current.push(
                    `${logsRef.current.length + 1} - ${t('game:logs.fairySupplies', { amount: nuevaVidaRey })}`
                );
            }


            moveCardToDiscard([card])
            setActualStreak(0);
            return true;
        }

        const handleWeapon = (card) => {
            if (!card) return false;

            // 1. Limpieza y asignación inicial
            cleanWeaponEffects();
            weaponDmg.current = card?.valor;

            if (card?.especial) {
                handleCardEffect(card);
            }

            // 2. Curación por cambio táctico (evitamos operaciones si es 0)
            const healAmount = tacticalChange.current;
            if (healAmount !== 0 && !tacticalChangeUsed.current) {
                // El cambio táctico se consume aunque la curación esté bloqueada
                tacticalChangeUsed.current = true;
                if (!antiheal.current) {
                    healAnimation(healAmount);
                    healedLife.current += healAmount;
                    setHealth(prev => Math.min(maxHealth, prev + healAmount));
                }
            }

            // 3. Gestión del arma y Logs
            const logIndex = logsRef.current.length + 1;

            if (weapon) {
                moveCardToDiscard([weapon], true);
                logsRef.current.push(`${logIndex} - ${t('game:logs.weaponSwapped', { oldValor: weapon?.valor, newValor: card?.valor })}`);

                scheduleTimeout(() => {
                    setWeapon(card);
                    deleteFromRoom(card);
                }, 100);
            } else {
                logsRef.current.push(`${logIndex} - ${t('game:logs.weaponEquipped', { valor: card?.valor })}`);
                setWeapon(card);
                deleteFromRoom(card);
            }

            // Limpieza de zona de juego
            if (slainMonsters.length > 0) {
                moveCardToDiscard([...slainMonsters], true);

                scheduleTimeout(() => {
                    setSlainMonsters([]);
                }, 200);
            }

            // Reinicio de racha
            setActualStreak(0);
            return true;
        };

        const handleCombat = (card) => {
            if (!card) return false;

            // El domador "tamea" ANTES de aplicar efectos de combate: la carta no
            // debe infligir daño ni lanzar efectos de enemigo al ser domada.
            if (isTaming && card?.palo !== 'Miniboss') {
                setIsTaming(false);
                handleWeapon(card);
                setTameDamage(1);
                return true;
            } else {
                setTameDamage(0);
            }

            // Comprobación inicial de efectos en la carta 
            if (card?.especial) {
                handleCardEffect(card);
            }

            // Cálculos base de combate (matemática pura en game/combat.js).
            // La tirada de crítico se genera aquí y se inyecta al puro.
            const lastSlainCard = slainMonsters[slainMonsters.length - 1];
            const combat = calcCombatDamage({
                enemyValor: card?.valor,
                palo: card?.palo,
                hasWeapon: Boolean(weapon),
                lastSlainValor: lastSlainCard?.valor,
                slainCount: slainMonsters.length,
                ricochet,
                weaponDmg: weaponDmg.current,
                tameDamage,
                blacksmithDmg,
                mma: mma.current,
                pentakillTargetNumber,
                pentakillDmg,
                actualStreak,
                userExtraDmg: userExtraDmg.current,
                userPermanentExtraDmg: userPermanentExtraDmg.current,
                userDmgMultiplier: userDmgMultiplier.current,
                enemyDmgMultiplier: enemyDmgMultiplier.current,
                enemyExtraDmg: enemyExtraDmg.current,
                dmgReduction: dmgReduction.current,
                spadesExtra: spadesExtraTakedDmg.current,
                clubsExtra: clubsExtraTakedDmg.current,
                criticalPercentage: criticalPercentage.current,
                criticalRoll: Math.floor(Math.random() * 100),
            });
            const { criticalMultiplier, finalUserDmg } = combat;
            let { finalDmg, isSlain } = combat;
            if (criticalMultiplier > 1) {
                logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.crit', { multiplier: criticalMultiplier })}`);
            }
            const canUseWeapon = combat.canUseWeapon;

            // Helpers locales para evitar duplicar lógica recurrente
            const grantGoldReward = () => {
                const earnedGold = calcGoldReward({ isGambler, goldMultiplier: goldMultiplier.current });
                setGold(prev => prev + earnedGold);
                coinAnimation(earnedGold);
                totalEarnedGold.current += earnedGold;
            };

            const processDamageAndRevive = (dmg) => {
                const outcome = resolveDeath({
                    health,
                    dmg,
                    revive: revive.current,
                    reviveHealth: reviveHealth.current,
                    lifeward,
                });
                if (outcome.survivedVia === 'revive') {
                    // Consumir SIEMPRE la resurrección (aunque reviveHealth sea 0),
                    // restaurando al menos 1 de vida.
                    revive.current = false;
                    reviveHealth.current = 0;
                    setHealth(outcome.health);
                    logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.guardianAngel')}`);
                } else if (outcome.survivedVia === 'lifeward') {
                    setLifeward(false)
                    setHealth(1);
                    logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.guardianAngel')}`);
                } else {
                    setHealth(prev => Math.max(0, prev - dmg));
                }
            };

            // Resolución de Ramas de Combate
            if (invincibilityTurns.current > 0) {
                // --- MODO INVENCIBLE ---
                finalDmg = 0;
                isSlain = true;
                invincibilityTurns.current -= 1;
                damageAnimation(0);
                if (weapon || midas.current) grantGoldReward();
            } else if (canUseWeapon) {

                // --- ATAQUE CON ARMA (daño precalculado en game/combat.js) ---
                damageAnimation(finalDmg);
                grantGoldReward();
                processDamageAndRevive(finalDmg);

                // Robo de vida (Lifesteal)

                const lifestealHeal = calcWeaponLifesteal({
                    antiheal: antiheal.current,
                    healthSteal: healthSteal.current,
                    isVampire,
                    enemyValor: card?.valor,
                    weaponDmg: weaponDmg.current,
                    userExtraDmg: userExtraDmg.current,
                    maxHealthSteal,
                });
                if (lifestealHeal > 0) {
                    const heal = lifestealHeal;
                    if (isVampire) {
                        handleNewAchievement('desafio_vampiro', heal);
                    }
                    healedLife.current += heal;
                    healthStealAnimation(heal);
                    setHealth(prev => Math.min(maxHealth, prev + heal));
                }
                if (!antiheal.current && weaponHealthSteal.current) {
                    setHealth(prev => Math.min(maxHealth, prev + weaponHealthStealQuantity.current));
                }
            } else {

                // --- ATAQUE SIN ARMA (daño precalculado en game/combat.js) ---
                moveCardToDiscard([card]);
                damageAnimation(finalDmg, true);
                processDamageAndRevive(finalDmg);
                if (midas.current) {
                    grantGoldReward();
                }

                const vampireHeal = calcBarehandLifesteal({
                    antiheal: antiheal.current,
                    isVampire,
                    enemyValor: card?.valor,
                    finalUserDmg,
                    maxHealthSteal,
                });
                if (vampireHeal > 0) {
                    const heal = vampireHeal;
                    healedLife.current += heal;
                    handleNewAchievement('desafio_vampiro', heal);
                    healthStealAnimation(heal);
                    setHealth(prev => Math.min(maxHealth, prev + heal));
                }
            }

            // Mandar el monstruo a la zona de juego
            if (isSlain) {
                setSlainMonsters(prev => [...prev, card]);
                deleteFromRoom(card);
            }

            // Actualizar racha global, logs y durabilidad del arma
            setActualStreak(prev => prev + 1);
            logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.combatDamage', { valor: card?.valor, palo: card?.palo, dmg: finalDmg })}`);
            if (breakWeapon.current) {
                weaponBreaker();
            }
            return true;
        };


        // =====================================================
        // CAPA 7 — ACCIONES DE NIVEL SUPERIOR
        // =====================================================

        const blacksmith = async () => {
            const weaponValue = Math.floor(Math.random() * (14 - 2) + 2);
            if (weaponValue > 10) {
                handleNewAchievement('desafio_herrero');
            }
            const newWeapon = await getWeapon(weaponValue);
            if (!newWeapon) {
                logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.forgeFail'));
                return;
            }
            handleWeapon(newWeapon);
            logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.forged', { valor: weaponValue }))
        }


        const processCardAction = useCallback((card) => {
            setCanBeClicked(false);
            document.body.style.cursor = "url('/images/cursor/Cursor_2.webp') 16 16, auto";
            let validMove = false;

            // Lógica de Minibosses
            if (card?.palo === 'Miniboss') {
                const minibossEffect = card?.efectos;
                const effectsList = Array.isArray(minibossEffect)
                    ? minibossEffect
                    : [minibossEffect];

                logsRef.current.push(
                    `${logsRef.current.length + 1} - ${t('game:logs.facedMiniboss', { valor: card?.valor })}`
                );

                // Aplicar efecto especial del miniboss
                switch (effectsList[0]?.name) {
                    case 'last_pillage':
                        handleMinibossPillageQueen();
                        validMove = true;
                        break;

                    case 'hairballs':
                        validMove = handleCombat(card);
                        break;
                    case 'mimicry':
                        validMove = handleCombat({ ...card, disfrazado: false });
                        break;

                    default:
                        validMove = handleCombat(card);
                }

                if (validMove) {
                    setEnemysDefeated(prev => prev + 1);
                    userExtraDmg.current = 0;
                    rechargeVampireAbility();
                    dmgReduction.current = 0;
                    // Solo hay combate real (y racha) si no es saqueo directo.
                    const foughtMiniboss = effectsList[0]?.name !== 'last_pillage';
                    trackMissionEvent({
                        kills: 1,
                        streak: foughtMiniboss ? actualStreak + 1 : actualStreak,
                        goldTotal: totalEarnedGold.current,
                        round: rounds,
                        miniboss: true,
                    });

                    // Resolución pura en game/minibosses.js; aquí solo se aplica.
                    const defeat = planMinibossDefeat(card, {
                        activeMinibossEffect: activeMinibossEffect.current,
                        spiderPartsLeft: spiderPartsLeft.current,
                    });

                    if (defeat.isSticky) {
                        if (defeat.stickySplit) {
                            // La reina no muere: pierde la mitad de su valor y crea 2 slimes
                            const customSlime = getCustomSlime(defeat.stickySplit.halfValue);
                            if (customSlime) {
                                // Claves distintas por copia: dos copias del mismo
                                // objeto comparten key y rompen React y los refs.
                                addCardToDungeon({ ...customSlime, key: uid() });
                                addCardToDungeon({ ...customSlime, key: uid() });
                            }
                            deleteFromRoom(card);
                            addCardAndShuffle({ ...card, valor: defeat.stickySplit.halfValue, key: uid() });
                        } else {
                            deleteFromRoom(card);
                        }
                    } else {
                        // Miniboss normal: se descarta
                        deleteFromRoom(card);
                    }

                    // Araña gigante: sus 9 partes comparten el efecto 'spider_web'.
                    // Al destruir una parte se bloquea la huida 3 turnos (telaraña)
                    // y se descuenta de las partes restantes.
                    if (defeat.isSpiderPart && defeat.isMinibossDefeated) {
                        spiderPartsLeft.current = defeat.spiderLeft;
                        webTurns.current = 3;
                    }
                    defeat.logs.forEach((entry) => {
                        logsRef.current.push(`${logsRef.current.length + 1} - ${t(entry.key, entry.params)}`);
                    });

                    // Solo limpiar el estado si el miniboss derrotado es el que estaba
                    // activo (lógica en el puro). La bola de pelo tiene logro propio
                    // aunque jamás sea el miniboss activo.
                    if (defeat.achievement) {
                        handleNewAchievement(defeat.achievement);
                    }
                    if (defeat.shouldCleanMiniboss) {
                        handleCleanMinibosses();
                    }

                    // La telaraña se fija DESPUÉS de la limpieza para que también
                    // dure el golpe final (handleCleanMinibosses pone webTurns a 0).
                    // Decisión: un impacto nuevo REINICIA el contador a 3 turnos
                    // (3 manos), no se acumula con la telaraña anterior.
                    if (defeat.isSpiderPart) {
                        webTurns.current = 3;
                    }
                }

                if (validMove) {
                    startPlayCardSound();

                    if (character?.habilidad_personaje?.codigo === 'guerrero') {
                        setAvailableAbility(false);
                    }

                    canScape.current = false;
                    totalCardsUsed.current += 1;
                } else {
                    logsRef.current.push(
                        `${logsRef.current.length + 1} - ${t('game:logs.minibossInvalid')}`
                    );
                }

                return;
            }


            // Lógica de curación
            if (card?.palo === 'Corazon') {
                validMove = handleHeal(card);
                if (validMove) {
                    userExtraDmg.current = 0;
                    rechargeVampireAbility();
                    userExtraDmg.current += vitamineValue.current;
                    vitamineValue.current = 0;
                    if (grandma) {
                        userExtraDmg.current += 1;
                    }
                }
            }
            // Lógica de arma
            else if (card?.palo === 'Diamante') {
                validMove = handleWeapon(card);
                if (validMove) {
                    userExtraDmg.current = 0;
                    rechargeVampireAbility();
                    dmgReduction.current = 0;
                }
            }
            // Lógica de combate
            else if (card?.palo === 'Pica' || card?.palo === 'Trebol') {
                validMove = handleCombat(card);
                if (validMove) {
                    setEnemysDefeated(prev => prev + 1);
                    userExtraDmg.current = 0;
                    rechargeVampireAbility();
                    dmgReduction.current = 0;
                    trackMissionEvent({
                        kills: 1,
                        streak: actualStreak + 1,
                        goldTotal: totalEarnedGold.current,
                        round: rounds,
                        miniboss: false,
                    });
                }
                if (scavenger && validMove) {
                    if (Math.floor(Math.random() * 100) < 10) {
                        if (Math.floor(Math.random() * 100) >= 50) {
                            userExtraDmg.current += 1;
                            logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.scavengerDmg')}`);
                        } else if (!antiheal.current) {
                            logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.scavengerHeal')}`);
                            healedLife.current += 1;
                            setHealth(prev => Math.min(maxHealth, prev + 1))
                            healAnimation(1)
                        }
                    }
                }
            }

            if (validMove) {
                startPlayCardSound();
                if (character?.habilidad_personaje?.codigo === 'guerrero') {
                    setAvailableAbility(false);
                }
                canScape.current = false;
                totalCardsUsed.current += 1;
            } else {
                logsRef.current.push(`${logsRef.current.length + 1} - ${t('game:logs.invalidMove')}`);
            }
        }, [handleHeal, handleWeapon, handleCombat, grandma, character]);
        // =====================================================
        // CAPA 8 — INTERACCIÓN DEL JUGADOR
        // =====================================================

        // Reutilizar la habilidad de Vampiro al jugar una carta: limpia el sello
        // de uso y reactiva el botón si no hay sello activo y hay vida suficiente.
        const rechargeVampireAbility = () => {
            vampireAbilityUsed.current = false;
            if (character?.habilidad_personaje?.codigo === 'vampiro'
                && sealTurns.current === 0
                && health > 5) {
                setAvailableAbility(true);
            }
        };

        const ABILITY_HANDLERS = {
            guerrero: warrior,
            paladin: () => {
                if (!antiheal.current) {
                    setHealth(prev => Math.min(maxHealth, prev + 5));
                    healedLife.current += 5;
                    healAnimation(5);
                }
                setAvailableAbility(false);
                handleNewAchievement('habilidad_paladin')
            },
            elfo: () => { elf(); setAvailableAbility(false); handleNewAchievement('habilidad_elfo') },
            mago: () => { shuffleDeck(dungeon); setAvailableAbility(false); handleNewAchievement('habilidad_mago') },
            apostador: () => {
                gambler().catch((gamblerError) => console.error("Error en la apuesta:", gamblerError));
                coinAnimation(-25);
                setGold(prev => Math.max(0, prev - 25));
                handleNewAchievement('habilidad_apostador')
            },
            herrero: () => { blacksmith().catch((smithError) => console.error("Error al forjar el arma:", smithError)); setAvailableAbility(false); handleNewAchievement('habilidad_herrero') },
            vampiro: () => { setHealth(prev => prev - calcVampireAbility(prev).healthCost); userExtraDmg.current += calcVampireAbility(health).dmgBonus; handleNewAchievement('habilidad_vampiro'); vampireAbilityUsed.current = true; setAvailableAbility(false); },
            domador: () => { setIsTaming(true); setAvailableAbility(false); handleNewAchievement('habilidad_domador') },
            cazador: () => {
                // Recompensa pura en game/characters.js; aquí solo se aplica.
                const result = applyBounty(room);
                if (result.bountied.length > 0) {
                    result.bountied.forEach((bountied) => {
                        logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.bounty', { valor: bountied.valor, palo: bountied.palo }))
                    });
                    setRoom(result.room);
                } else {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + t('game:logs.bountyNone'))
                }
                handleNewAchievement('habilidad_cazarrecompensas')
                setAvailableAbility(false);
            },
        };

        const handleUseAbility = () => {
            // abilityLockRef: evita disparos duplicados mientras el estado de
            // disponibilidad aún no se ha propagado (doble clic).
            if (!availableAbility || abilityLockRef.current) return;

            const handler = ABILITY_HANDLERS[character?.habilidad_personaje?.codigo];
            if (!handler) return;

            abilityLockRef.current = true;
            handler();
            scheduleTimeout(() => {
                abilityLockRef.current = false;
            }, 400);
        };

        const setModifierWeapon = (power) => {
            const newWeapon = getWeapon(power)
            if (!newWeapon) return;
            processCardAction(newWeapon)
            canScape.current = true
        }

        const handleDragEnd = (card, finalX, finalY) => {
            // Mismo guard que el onClick: no procesar si la partida está pausada
            // o en transición (evita jugadas duplicadas por drag + click).
            if (!canBeClicked || !gameOn) return false;
            // Zona de soltado efectiva según modo (portrait compacta).
            const isOverZone =
                finalX > weaponZone.x && finalX < weaponZone.x + weaponZone.width &&
                finalY > weaponZone.y && finalY < weaponZone.y + weaponZone.height;
            if (isOverZone) {
                processCardAction(card);
                return true;
            }
            return false;
        };
        // =====================================================
        // CAPA 9 — APLICACIÓN DE MODIFICADORES
        // =====================================================


        const handleDeleteSuit = (suit) => {
            const newDeck = matchDeck.filter((card) => !(card.valor <= 5 && card.palo === suit));
            let originalCardNumber = matchDeck.length - newDeck.length;
            setNewMatchDeck(newDeck);
            shuffleDeck(newDeck);
            setRoom([]);
            const aument = Math.floor(originalCardNumber / 4);
            if (suit === "Corazon") {
                setMaxHealth(prev => prev + aument);
                setHealth(prev => prev + aument);
            } else {
                userPermanentExtraDmg.current += aument;
            }
        }

        const handleDeleteHalf = () => {
            const half = Math.floor(matchDeck.length / 2);
            const shuffledDeck = shuffle(matchDeck);
            const newDeck = shuffledDeck.slice(0, half);
            setNewMatchDeck(newDeck);
            setDungeon(newDeck);
            setRoom([]);
        }

        const handleCovenant = () => {
            // Clamp: la vida máxima nunca baja de 1 y la vida actual nunca
            // queda por encima de la nueva máxima.
            const newMax = Math.max(1, maxHealth - 5);
            setMaxHealth(newMax);
            setHealth(prev => Math.min(prev, newMax));
            userPermanentExtraDmg.current += 2;
        }

        // Adaptador Fase 1: el cálculo puro vive en game/modifiers.js;
        // aquí solo se vuelca al estado/refs y se ejecutan los eventos
        // con las funciones existentes (sin cambios de comportamiento).
        const snapshotModifiers = () => ({
            pentakillTargetNumber,
            pentakillDmg,
            healthSteal: healthSteal.current,
            clubsExtraTakedDmg: clubsExtraTakedDmg.current,
            spadesExtraTakedDmg: spadesExtraTakedDmg.current,
            enemyDmgMultiplier: enemyDmgMultiplier.current,
            enemyExtraDmg: enemyExtraDmg.current,
            maxScapes,
            actualScapes: actualScapes.current,
            maxHealth,
            health,
            ricochet,
            goldMultiplier: goldMultiplier.current,
            grandma,
            mma: mma.current,
            criticalPercentage: criticalPercentage.current,
            tacticalChange: tacticalChange.current,
            expert: expert.current,
            extraHealthExpert: extraHealthExpert.current,
            scavenger,
            vitamine,
            gluttony,
            interest,
            thanatophobia,
            thanatophobiaActivated,
            lifeward,
            refund: refund.current,
            membership: membership.current,
            catEye: catEye.current,
            amego: amego.current,
            regeneratorGoalTurns: regeneratorGoalTurns.current,
            regeneratorHealth: regeneratorHealth.current,
            regeneratorTurns: regeneratorTurns.current,
            adrenalin: adrenalin.current,
            adrenalinActivated: adrenalinActivated.current,
            midas: midas.current,
        });

        const commitModifiers = (next) => {
            if (next.pentakillTargetNumber !== pentakillTargetNumber) {
                setPentakillTargetNumber(next.pentakillTargetNumber);
            }
            if (next.pentakillDmg !== pentakillDmg) {
                setPentakillDmg(next.pentakillDmg);
            }
            healthSteal.current = next.healthSteal;
            clubsExtraTakedDmg.current = next.clubsExtraTakedDmg;
            spadesExtraTakedDmg.current = next.spadesExtraTakedDmg;
            enemyDmgMultiplier.current = next.enemyDmgMultiplier;
            enemyExtraDmg.current = next.enemyExtraDmg;
            if (next.maxScapes !== maxScapes) {
                setMaxScapes(next.maxScapes);
            }
            actualScapes.current = next.actualScapes;
            if (next.maxHealth !== maxHealth) {
                setMaxHealth(next.maxHealth);
            }
            if (next.health !== health) {
                setHealth(next.health);
            }
            if (next.ricochet !== ricochet) {
                setRicochet(next.ricochet);
            }
            goldMultiplier.current = next.goldMultiplier;
            if (next.grandma !== grandma) {
                setGrandma(next.grandma);
            }
            mma.current = next.mma;
            criticalPercentage.current = next.criticalPercentage;
            tacticalChange.current = next.tacticalChange;
            expert.current = next.expert;
            extraHealthExpert.current = next.extraHealthExpert;
            if (next.scavenger !== scavenger) {
                setScavenger(next.scavenger);
            }
            if (next.vitamine !== vitamine) {
                setVitamine(next.vitamine);
            }
            if (next.gluttony !== gluttony) {
                setGluttony(next.gluttony);
            }
            if (next.interest !== interest) {
                setInterest(next.interest);
            }
            if (next.thanatophobia !== thanatophobia) {
                setThanatophobia(next.thanatophobia);
            }
            if (next.thanatophobiaActivated !== thanatophobiaActivated) {
                setThanatophobiaActivated(next.thanatophobiaActivated);
            }
            if (next.lifeward !== lifeward) {
                setLifeward(next.lifeward);
            }
            refund.current = next.refund;
            membership.current = next.membership;
            catEye.current = next.catEye;
            amego.current = next.amego;
            regeneratorGoalTurns.current = next.regeneratorGoalTurns;
            regeneratorHealth.current = next.regeneratorHealth;
            regeneratorTurns.current = next.regeneratorTurns;
            adrenalin.current = next.adrenalin;
            adrenalinActivated.current = next.adrenalinActivated;
            midas.current = next.midas;
        };

        const applyEffect = (effect) => {
            const { state: next, handled, events } = applyModifierToState(snapshotModifiers(), effect, { enemysDefeated });
            if (!handled) {
                return false;
            }
            commitModifiers(next);
            events.forEach((event) => {
                switch (event.type) {
                    case 'chestRewards': {
                        const weaponValue = shuffle(Array.isArray(event.values) ? event.values : [])[0];
                        if (weaponValue) {
                            setModifierWeapon(weaponValue);
                        }
                        break;
                    }
                    case 'deleteSuit':
                        handleDeleteSuit(event.suit);
                        break;
                    case 'cleanHalf':
                        handleDeleteHalf();
                        break;
                    case 'covenant':
                        handleCovenant();
                        break;
                    default:
                        break;
                }
            });
            return true;
        }
        // =====================================================
        // CAPA 10 — EVENTOS DE MODIFICADORES
        // =====================================================

        const handleModifierEvent = () => {
            // Aplica SOLO los modificadores pendientes (evita reaplicar los
            // anteriores cada vez que crece `modifiers`) y nunca deja el Loading
            // colgado aunque un efecto lance excepción.
            try {
                const pendingModifiers = modifiers.slice(appliedModifiersCountRef.current);
                pendingModifiers.forEach((modifier) => {
                    const modifierEffects = modifier?.efectos;
                    const effectsList = Array.isArray(modifierEffects) ? modifierEffects : [modifierEffects];
                    effectsList.forEach((effect) => {
                        if (effect) applyEffect(effect);
                    });
                });
                appliedModifiersCountRef.current = modifiers.length;
            } catch (modifierError) {
                console.error("Error al aplicar modificadores:", modifierError);
            } finally {
                setModifiersLoading(false);
            }
        }
        // =====================================================
        // CAPA 11 — EFECTOS (useEffect)
        // =====================================================

        // Sin dependencias de funciones propias
        useEffect(() => {
            if (health <= 0) {
                setGameOn(false);
                setGameOver(true);
                setGameWin(false);
            }
        }, [health]);

        useEffect(() => {
            if (canBeClicked === false) {
                const id = scheduleTimeout(() => {
                    setCanBeClicked(true);
                }, 500);
                return () => cancelTimeout(id);
            }
        }, [canBeClicked]);

        useEffect(() => {
            // Fix recarga /jugar: no arrancar con baseDeck vacío (el load del
            // provider aún no terminó). Al completarse, el effect se re-ejecuta
            // (nueva identidad de startNewGame + baseDeck.length) y arranca bien.
            if (!shouldStartNewGame({
                gameLoading,
                alreadyStarted: hasStartedNewGameRef.current,
                baseDeckSize: baseDeck?.length ?? 0,
            })) return;

            hasStartedNewGameRef.current = true;
            Promise.resolve(startNewGame()).catch((startError) => console.error("Error al iniciar la partida:", startError));
        }, [gameLoading, startNewGame, baseDeck?.length]);

        useEffect(() => {
            if (maxHealth >= 60 && character?.habilidad_personaje?.codigo === 'paladin') {
                handleNewAchievement('desafio_paladin');
            }
        }, [maxHealth, character]);

        // Manejo disponibilidad pasiva Guerrero
        useEffect(() => {
            if (isWarrior && health <= (maxHealth / 2)) {
                userDmgMultiplier.current = 1.5;
            } else {
                userDmgMultiplier.current = 1;
            }
        }, [isWarrior, health, maxHealth]);

        // Manejo disponibilidad habilidad Gambler
        useEffect(() => {
            if (!isGambler) return;

            if (sealTurns.current === 0) {
                // Solo actualiza si tiene suficiente oro
                if (gold >= 25) {
                    setAvailableAbility(true);
                } else if (gold < 25 && availableAbility) {
                    // Solo desactiva si ACTUALMENTE está activa
                    // Esto evita sobrescribir cuando fue usada hace poco
                    setAvailableAbility(false);
                }
            }
            // NO desactives si está sellada (sealTurns > 0) - el otro useEffect lo maneja
        }, [gold, isGambler]);

        // Manejo disponibilidad habilidad Vampiro
        useEffect(() => {
            if (!isVampire) return;
            if (sealTurns.current === 0) {
                // No reactivar si la habilidad ya fue usada en esta ronda
                if (health > 5) {
                    setAvailableAbility(true);
                } else {
                    setAvailableAbility(false);
                }
            } else {
                setAvailableAbility(false);
            }
        }, [health, isVampire, rounds]);

        useEffect(() => {
            if (expert.current && extraHealthExpert.current < 10) {
                if (enemysDefeated > 0 && enemysDefeated % 20 === 0) {
                    setMaxHealth(prev => prev + 1);
                    extraHealthExpert.current += 1;
                }
            }
        }, [enemysDefeated]);

        // Oro / shop — al CERRAR la tienda (transición true → false), si la
        // dungeon está vacía se repone desde el matchDeck. NUNCA se limpia la
        // sala aquí: destruía cartas solo-dungeon y perdía el estado de la mano.
        useEffect(() => {
            if (shopWasOpenRef.current && !shopAvailable) {
                setDungeon(prev => (prev.length > 0 ? prev : shuffle(matchDeckRef.current)));
            }
            shopWasOpenRef.current = shopAvailable;
        }, [shopAvailable]);

        // Timer
        useEffect(() => {
            if (gameOn) {
                // Nueva partida activa: se vuelve a permitir el guardado
                resetSaveFlag();
                startTimer();
            } else if (user && rounds > 0) {
                stopTimer();
                saveAuto({
                    time: timeRef.current,
                    gold: totalEarnedGold.current,
                    healed: healedLife.current,
                    defeated: enemysDefeated,
                    continuedGame,
                });
            }

            return () => stopTimer();
        }, [gameOn]);

        // Robar cartas automáticamente
        useEffect(() => {
            // El reset de isScapingRef se programa SIEMPRE (aunque la mazmorra
            // esté vacía): si no, huir con dungeon vacía deja el flag clavado
            // y bloquea la ronda automática (softlock).
            if (isScapingRef.current) {
                scheduleTimeout(() => {
                    isScapingRef.current = false;
                }, 50);
            }

            if (isDrawingRef.current) return;

            if (room.length <= 1) {
                isDrawingRef.current = true;
                fillRoom(() => {
                    isDrawingRef.current = false;
                });

                if (!isScapingRef.current) {
                    if (isWarrior && sealTurns.current === 0) {
                        setAvailableAbility(true);
                    }
                    tacticalChangeUsed.current = false;
                    healedRef.current = false;
                    actualScapes.current = maxScapes;
                    canScape.current = true;
                    setThanatophobiaActivated(false);
                }
            }
        }, [room.length, dungeon.length]);

        // Efecto de daño del chamán. Debe ser idempotente: si el poder no cambia,
        // NO debemos devolver un array nuevo porque eso dispara otro render y vuelve
        // a ejecutar este mismo efecto.
        useEffect(() => {
            if (!isChamanActive.current) return;

            const newPower = [...dungeon, ...room].filter(
                (card) => ['Trebol', 'Pica'].includes(card?.palo)
            ).length;

            setRoom((prevRoom) => {
                const hasChaman = prevRoom.some(
                    c => c?.palo === 'Miniboss' && c?.codigo === 'chaman'
                );
                if (!hasChaman) return prevRoom;

                let changed = false;
                const nextRoom = prevRoom.map((card) => {
                    if (card?.palo === 'Miniboss' && card?.codigo === 'chaman') {
                        if (card.valor === newPower) return card;
                        changed = true;
                        return { ...card, valor: newPower };
                    }
                    return card;
                });

                // React bail-out: misma referencia = no nuevo render.
                return changed ? nextRoom : prevRoom;
            });
        }, [dungeon, room]);

        // Pasivas de personaje (primera selección / cambio de personaje)
        useEffect(() => {
            if (rounds === 1) applyCharacterPassive(character);
        }, [character, gameOn]);

        // Inicialización
        useEffect(() => {
            restartFunction();
            setShopAvailable(false);
        }, []);

        // Reinicio solicitado
        useEffect(() => {
            if (restart) {
                // Limpieza ANTES de reiniciar
                cleanModifiers();
                cleanHealEffects();
                cleanWeaponEffects();
                cleanEnemyEffects();

                // DESPUÉS reiniciar
                restartFunction(changeCharacter);
                setChangeCharacter(false);
                setRestart(false); // 
            }
        }, [restart]);

        // Redirección: solo fuera de la fase de carga inicial (evita expulsar al
        // usuario mientras `useUser` aún está resolviendo su petición).
        useEffect(() => {
            if (!isLoading && !user) {
                navigate('/');
            }
        }, [user, isLoading, navigate]);

        // Medición real del contenedor del tablero: ver observeBoard
        // (callback ref). El canvas Konva usa tamaño fijo y se dimensiona
        // al wrapper visible.

        useEffect(() => {
            if (thanatophobia && room.length === 4) {
                const allEnemys = room.reduce(
                    (areEnemys, currentValue) => areEnemys = ((currentValue?.palo === 'Trebol' || currentValue?.palo === 'Pica') && areEnemys),
                    true,);
                if (allEnemys && !thanatophobiaActivated) {
                    actualScapes.current += 1;
                    setThanatophobiaActivated(true);
                }
            }
        }, [room, thanatophobia])

        useEffect(() => {
            if (adrenalin.current && room.length === 4) {
                const allEnemys = room.reduce(
                    (areEnemys, currentValue) => areEnemys = ((currentValue?.palo === 'Trebol' || currentValue?.palo === 'Pica') && areEnemys),
                    true,);
                if (allEnemys && !adrenalinActivated.current) {
                    if (!isGambler && !isVampire && sealTurns.current === 0) {
                        setAvailableAbility(true);
                    }
                    adrenalinActivated.current = true;
                }
            }
        }, [room, isGambler, isVampire])

        // Cuando el mazo base de la partida esté listo, se carga en el mazo de juego.
        useEffect(() => {
            const totalCardsAvailable = (dungeon?.length || 0) + (room?.length || 0);

            if (matchDeck && matchDeck.length > 0 && totalCardsAvailable === 0 && !isScapingRef.current && !isDrawingRef.current) {
                startNewRound().catch((roundError) => console.error("Error al iniciar la ronda:", roundError));
            }
        }, [matchDeck, dungeon, room]);

        // Cambios de modificadores
        useEffect(() => {
            if (modifiers.length > 0) {
                setModifiersLoading(true);
                handleModifierEvent();
            }
        }, [modifiers]);

        // Salida desde Navbar — lee el estado actual vía refs y solo se
        // suscribe una vez (deps estables), evitando re-suscripciones por render.
        useEffect(() => {
            const gestionarSalidaNavbar = async (e) => {
                const rutaDestino = e.detail.destino;
                try {
                    // Sin personaje no hay partida que contar como derrota.
                    if (hasCharacter()) {
                        await saveExit({
                            time: timeRef.current,
                            gold: totalEarnedGold.current,
                            healed: healedLife.current,
                            victory: false,
                            reason: 'navbar',
                        });
                    }
                } catch (error) {
                    console.error("Error al guardar la partida desde el Navbar:", error);
                } finally {
                    navigate(rutaDestino);
                }
            };

            window.addEventListener('interrumpirPartida', gestionarSalidaNavbar);
            return () => {
                window.removeEventListener('interrumpirPartida', gestionarSalidaNavbar);
            };
        }, [navigate, saveExit, hasCharacter]);

        // Popstate: el modal de derrota solo salta con personaje elegido.
        // Sin personaje, el atrás del navegador fluye con normalidad.
        useEffect(() => {
            window.history.pushState(null, null, window.location.pathname);
            const handlePopState = async () => {
                if (!hasCharacter()) return;
                setIsModalOpen(true);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }, [hasCharacter]);

        // Recarga/cierre de pestaña: el modal propio no puede abrirse en
        // unload (restricción del navegador), así que se usa el diálogo
        // nativo. Solo con personaje elegido.
        useEffect(() => {
            const handleBeforeUnload = (e) => {
                if (!hasCharacter()) return;
                e.preventDefault();
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }, [hasCharacter]);

        // Unload confirmado (recarga/cierre): cuenta como derrota vía
        // keepalive (axios no sobrevive al unload). Solo con partida en
        // curso (gameOn): si ya terminó, el guardado normal la cubrió.
        // No dispara en navegación interna SPA (no hay unload).
        useEffect(() => {
            const handlePageHide = () => {
                if (!gameOn) return;
                if (!hasCharacter()) return;
                saveLossOnUnload({
                    tiempo: timeRef.current,
                    rondas: rounds,
                    oro_obtenido: totalEarnedGold.current,
                    vida_curada: healedLife.current,
                    enemigos_enfrentados: enemysDefeated,
                });
            };

            window.addEventListener('pagehide', handlePageHide);
            return () => {
                window.removeEventListener('pagehide', handlePageHide);
            };
        }, [gameOn, rounds, enemysDefeated, hasCharacter, saveLossOnUnload]);

        useEffect(() => {
            return () => {
                // Solo recursos/contexto al desmontar: los setState locales no
                // tienen efecto en un componente desmontado. Se cancelan timers
                // pendientes y se restaura el cursor.
                clearScheduledTimeouts();
                // Guardado al salir (antes en el cleanup del resize, que solo
                // corría al desmontar: deps []). Solo si la partida empezó.
                if (hasActiveGame()) {
                    saveExit({
                        time: timeRef.current,
                        gold: totalEarnedGold.current,
                        healed: healedLife.current,
                        reason: 'unmount',
                    });
                }
                stopTimer();
                document.body.style.cursor = '';
                setActiveModifiers([]);
                setNewCharacter(null);
                setNewDeck();
            };
        }, []);

    try {
        // =====================================================
        // CAPA 12 — RENDER
        // =====================================================

        if (isRestarting && !gameOver) {
            return (
                <Fragment>
                    <ViewTransition>
                        <Loading />
                    </ViewTransition>
                </Fragment>
            )
        }

        if (!character && !gameOver) {
            return (
                <Fragment>
                    <ViewTransition>
                        <SelectCharacter />
                    </ViewTransition>
                </Fragment>
            )
        }

        if (selectModifier && !gameOver) {
            return (
                <Fragment>
                    <ViewTransition>
                        <SelectModifier rounds={rounds} setSelectModifier={setSelectModifier} setModifiersLoading={setModifiersLoading} />
                    </ViewTransition>
                </Fragment>
            )
        }
        if (modifiersLoading && !gameOver) {
            return (
                <Fragment>
                    <Loading />
                </Fragment>
            )
        }
        if (shopAvailable && !gameOver) {
            return (
                <Fragment>
                    <ViewTransition>
                        <GameShop
                            gold={gold}
                            setGold={setGold}
                            setShopAvailable={setShopAvailable}
                            health={health}
                            maxHealth={maxHealth}
                            formatedTimeRef={formatedTimeRef}
                            healthIcon={healthIcon}
                            character={character}
                            round={rounds}
                            refund={refund.current}
                            boughtCards={boughtCards}
                            setNewBought={setNewBought}
                            membership={membership.current}
                            coinAnimation={coinAnimation}
                            goldAnimation={goldAnimation}
                            goldAnimationValue={goldAnimationValue}
                            amego={amego.current}
                        />
                    </ViewTransition>
                </Fragment>
            )
        }
        if (isModalOpen) {
            return (
                <>
                    {/* Contenido principal de la partida */}

                    <ConfirmationModal
                        isOpen={isModalOpen}
                        onClose={() => handleCloseModal()}
                        onConfirm={handleConfirmAction}
                        title={t('exitTitle')}
                        message={t('exitMessage')}
                    />
                </>
            );
        }

        const extraDmgEffects = () => {
            if (userDmgMultiplier.current !== 1) {
                return `${userExtraDmg.current + (weapon ? blacksmithDmg : 0) + tameDamage + userPermanentExtraDmg.current + (actualStreak >= pentakillTargetNumber ? pentakillDmg : 0)} y un mult de ${userDmgMultiplier.current}.`
            } else {
                return userExtraDmg.current + (weapon ? blacksmithDmg : 0) + tameDamage + userPermanentExtraDmg.current + (actualStreak >= pentakillTargetNumber ? pentakillDmg : 0);
            }
        }


        const calcExtraGold = () => {
            // Fórmula real de grantGoldReward: Math.floor(base * goldMultiplier)
            // con base 10 para el apostador y 5 para el resto.
            const base = isGambler ? 10 : 5;
            const total = Math.floor(base * goldMultiplier.current);
            if (goldMultiplier.current !== 1) {
                return `${total} por enemigo`;
            }
            return total;
        }

        // Icono por palo (mismo mapeo que los ternarios inline del Stage).
        const getSuitIcon = (palo) => palo == "Diamante" ? DiamonIcon : palo == "Trebol" ? ClubIcon : palo == "Corazon" ? HeartIcon : palo == 'Pica' ? SpadeIcon : MinibossIcon;

        // Valores e iconos del panel de efectos (se leen en cada render, igual que antes).
        const effectValues = {
            extraDmg: extraDmgEffects(),
            enemyExtraDmg: enemyExtraDmg.current,
            spadesExtra: spadesExtraTakedDmg.current,
            clubsExtra: clubsExtraTakedDmg.current,
            poisonTurns: poison.current,
            sealTurns: sealTurns.current,
            souleaterTurns: souleaterTurns.current,
            mma: mma.current,
            antihealTurns: antihealTurns.current,
            extraGold: calcExtraGold(),
            invincibilityTurns: invincibilityTurns.current,
            progresiveTurns: progresiveHealTurns.current,
            progresiveValue: progresiveHeal.current,
            dmgReductionTurns: dmgReduction.current,
        };
        const effectIcons = {
            buff: BuffIcon,
            debuff: DebuffIcon,
            spade: SpadeIcon,
            club: ClubIcon,
            poison: PoisonIcon,
            seal: SealIcon,
            souleater: SouleaterIcon,
            mma1: MMA1Icon,
            mma2: MMA2Icon,
            mma3: MMA3Icon,
            antiheal: AntihealIcon,
            extraGold: ExtraGoldIcon,
            invincibility: InvincibilityIcon,
            progresiveHeal: ProgresiveHealIcon,
            dmgReduction: DmgReductionIcon,
        };
        return (
            <Fragment>
                <div className="game">
                    {
                        !gameOn ?
                            <GameOverMenu
                                gameWin={gameWin}
                                timeText={formatedTimeRef?.current?.textContent ?? ""}
                                rounds={rounds}
                                remainingCards={dungeon.length + room.length}
                                cardsUsed={totalCardsUsed.current}
                                earnedGold={totalEarnedGold.current}
                                enemysDefeated={enemysDefeated}
                                onContinue={() => { continueFunction() }}
                                onRestart={() => { setRestart(true) }}
                                onChangeCharacter={() => { setChangeCharacter(true); setRestart(true) }}
                                onHome={() => { startButtonSound(true); navigate('/') }}
                                onProfile={() => { startButtonSound(true); navigate(`/perfil/${user ? user.nick : ''}`) }}
                            /> :
                            <></>
                    }
                    <div className="game-container">

                        {/* INTERFAZ IZQUIERDA */}
                        <GameHud
                            health={health}
                            maxHealth={maxHealth}
                            healthIcon={healthIcon}
                            healthAnimation={healthAnimation}
                            healthAnimationValue={healthAnimationValue}
                            gold={gold}
                            goldIcon={GoldIcon}
                            goldAnimation={goldAnimation}
                            goldAnimationValue={goldAnimationValue}
                            modifiersLoading={modifiersLoading}
                            pentakillTargetNumber={pentakillTargetNumber}
                            actualStreak={actualStreak}
                            gameOn={gameOn}
                            gameWin={gameWin}
                            rounds={rounds}
                            maxRounds={maxRounds}
                            formatedTimeRef={formatedTimeRef}
                            remainingCards={dungeon.length + (lastCardBoss !== undefined && !room.some(c => c?.key === lastCardBoss?.key) ? 1 : 0)}
                            minibossIcon={MinibossIcon}
                            minibossActive={minibossActive}
                            isGambler={isGambler}
                            lastGamblerEffect={lastGamblerEffect}
                            character={character}
                            userColor={user?.color}
                            isWarrior={isWarrior}
                            isTaming={isTaming}
                            vampireUsed={vampireAbilityUsed.current}
                            availableAbility={availableAbility}
                            modifiers={modifiers}
                            canFlee={(dungeon.length !== 0) && (webTurns.current === 0) && canScape.current && gameOn}
                            canUseAbility={availableAbility && gameOn}
                            onFlee={() => { scape() }}
                            onAbility={() => { handleUseAbility() }}
                        />

                        {/* VENTANA DE JUEGO */}
                        <div className="board-wrap" ref={observeBoard}>
                        <GameBoard
                            layout={layout}
                            layoutMode={layoutMode}
                            dungeonZone={dungeonZone}
                            discardZone={discardZone}
                            weaponZone={weaponZone}
                            effectValues={effectValues}
                            effectIcons={effectIcons}
                            dungeon={dungeon}
                            discardPile={discardPile}
                            room={room}
                            weapon={weapon}
                            slainMonsters={slainMonsters}
                            isWizard={isWizard}
                            overDungeonZone={overDungeonZone}
                            canBeClicked={canBeClicked}
                            catEye={catEye.current}
                            gameOn={gameOn}
                            tooltip={tooltip}
                            cardRefs={cardRefs}
                            layerRef={layerRef}
                            defaultImage={defaultImage}
                            getSuitIcon={getSuitIcon}
                            onHoverEffect={setTooltip}
                            onLeaveEffect={() => setTooltip(null)}
                            setOverDungeonZone={setOverDungeonZone}
                            onDragEnd={handleDragEnd}
                            onPlay={processCardAction}
                            onClearTooltip={() => setTooltip(null)}
                        />
                        </div>
                        {
                            showLogs ?

                                <div className="logs-container">
                                    {
                                        logsRef.current.length > 0 ?
                                            <div className="logs">
                                                <pre>{logsRef.current.toReversed().join('\n\n')}</pre>
                                            </div>
                                            : <h1 style={{ color: "white" }}>SIN LOGS</h1>
                                    }
                                </div>
                                : <></>
                        }
                    </div>
                </div>
            </Fragment>
        );
    } catch (error) {
        console.error("Error en GamePage:", error);

        return (
            <Fragment>
                <div>
                    <div className="gameOver-menu">
                        <h1 className="lose">ERROR</h1>
                        <button
                            onClick={() => {
                                const newBugInfo = {
                                    modificadores: modifiers,
                                    error: error?.message,
                                    personaje: character?.nombre ?? '',
                                    logs: logsRef.current.join('\n'),
                                    room: room,
                                    dungeon: dungeon
                                }
                                openBugReport(JSON.stringify(newBugInfo))
                            }
                            }
                        >
                            REPORTAR ERROR
                        </button>
                        <button onClick={() => {
                            saveManual({
                                time: timeRef.current,
                                gold: totalEarnedGold.current,
                                healed: healedLife.current,
                                victory: gameWin,
                                userId: user?.id,
                                rounds,
                            });
                        }}>
                            GUARDAR PARTIDA
                        </button>
                        <button onClick={(event) => {
                            setRestart(true)
                        }}>
                            JUGAR OTRA
                        </button>

                        <button onClick={(event) => {
                            setChangeCharacter(true)
                            setRestart(true)
                        }}>
                            CAMBIAR PERSONAJE
                        </button>

                        <button onClick={(event) => { startButtonSound(true); navigate('/') }}>INICIO</button>
                        <button onClick={(event) => { startButtonSound(true); navigate(`/perfil/${user ? user.nick : ''}`) }}>PERFIL</button>

                        <div className="final-match-info">
                            <p><span>{formatedTimeRef?.current?.textContent ?? ""}</span></p>
                            <p>{t('matchStats.rounds')} <span>{rounds}</span></p>
                            <p>{t('matchStats.remainingCards')} <span>{dungeon.length + room.length}</span></p>
                            <p>{t('matchStats.cardsUsed')} <span>{totalCardsUsed.current}</span></p>
                            <p>{t('matchStats.earnedGold')} <span>{totalEarnedGold.current}</span></p>
                            <p>Total enemigos derrotados: <span style={{ color: 'var(--main-red)' }}>{enemysDefeated}</span></p>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }


};

const GamePage = () => (
    <ErrorBoundary>
        <GamePageInner />
    </ErrorBoundary>
);

export default GamePage;