import { Fragment, useCallback, useContext, useEffect, useRef, useState, ViewTransition } from "react";
import { Stage, Layer, Text, Group, Rect } from 'react-konva';
// 1. Librerías externas (React, React Router, Lodash, etc.)
import { useNavigate } from "react-router-dom";
import lodash from 'lodash';
import useImage from "use-image";

// 2. Contextos y Hooks propios
import { matchContext } from "../../context/MatchProvider.jsx";
import { settingsContext } from "../../context/SettingsProvider.jsx";
import { useUser } from "../../hooks/useUser.js";
import { bugReportContext } from "../../context/BugReportProvider.jsx";

// 3. Componentes de tu aplicación
import Card from "../Card";
import SelectCharacter from "../game-components/SelectCharacter.jsx";
import SelectModifier from "../game-components/SelectModifier.jsx";
import Modifier from "../Modifier.jsx";
import Loading from "../Loading.jsx";
import GameShop from "../game-components/GameShop.jsx";

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
import PlayerEffects from "../game-components/PlayerEffects.jsx";
import TooltipLayer from "../game-components/TooltipLayer.jsx";
import ErrorBoundary from "../structure/ErrorBoundary.jsx";

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
    const { startButtonSound, startPlayCardSound, startPlaceCardSound, showLogs } = useContext(settingsContext)
    const { matchDeck, character, activeModifiers: modifiers, setNewDeck, setNewMatchDeck, setNewCharacter, startNewGame, addCardToMatchDeck, gameLoading, getWeapon, getHealItem, getRandomMiniboss, getHairball, endGame, updateActualGame, setActiveModifiers, setGameLoading, addEnemysToMatchDeck, addEnemyToMatchDeck, handleNewAchievement, deleteCardFromMatchDeck, getCustomSlime } = useContext(matchContext);
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

    // Timer
    const formatedTimeRef = useRef(null);
    const timeRef = useRef(0);
    const intervalRef = useRef(null);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Vida
    const [maxHealth, setMaxHealth] = useState(20);
    const [health, setHealth] = useState(20);
    const healedRef = useRef(null);
    const [healthIcon, setHealthIcon] = useState(FullHealthIcon);

    // Oro
    const [gold, setGold] = useState(0);
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

    // Cartas y zonas Konva
    const layerRef = useRef(null);
    const [canBeClicked, setCanBeClicked] = useState(true);
    const cardRefs = useRef({});
    const [room, setRoom] = useState([]);
    const [DUNGEON_ZONE, setDUNGEON_ZONE] = useState({ x: 10, y: 5, width: 130, height: 160 });
    const [dungeon, setDungeon] = useState([]);
    const [DISCARD_ZONE, setDISCARD_ZONE] = useState({ x: 650, y: 200, width: 130, height: 160 });
    const [overDungeonZone, setOverDungeonZone] = useState(false);
    const [discardPile, setDiscardPile] = useState([]);
    const [WEAPON_ZONE, setWEAPON_ZONE] = useState({ x: 200, y: 200, width: 400, height: 240 });
    const [weapon, setWeapon] = useState(null);
    const [slainMonsters, setSlainMonsters] = useState([]);
    const [tooltip, setTooltip] = useState(null);

    // Layout
    const VIRTUAL_WIDTH = 800;
    const [layout, setLayout] = useState(() => {
        const isDesktop = window.innerWidth > 1024;
        const physicalWidth = isDesktop ? window.innerWidth / 2 : window.innerWidth / 1.5;
        const physicalHeight = window.innerHeight;
        return {
            width: physicalWidth,
            height: physicalHeight,
            scale: physicalWidth / VIRTUAL_WIDTH,
        };
    });



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

    // Animaciones
    const [healthAnimation, setHealthAnimation] = useState(null);
    const [goldAnimation, setGoldAnimation] = useState(null);
    const [healthAnimationValue, setHealthAnimationValue] = useState(null);
    const [goldAnimationValue, setGoldAnimationValue] = useState(null);

    // Control de robo
    const isDrawingRef = useRef(false);

    const hasStartedNewGameRef = useRef(false);

    const gameSavedRef = useRef(false);

    const userRef = useRef(user);
    const characterRef = useRef(character);
    const gameWinRef = useRef(gameWin);
    const roundsRef = useRef(rounds);
    const modifiersRef = useRef(modifiers);
    const enemysDefeatedRef = useRef(enemysDefeated);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { characterRef.current = character; }, [character]);
    useEffect(() => { gameWinRef.current = gameWin; }, [gameWin]);
    useEffect(() => { roundsRef.current = rounds; }, [rounds]);
    useEffect(() => { modifiersRef.current = modifiers; }, [modifiers]);
    useEffect(() => { enemysDefeatedRef.current = enemysDefeated; }, [enemysDefeated]);

    // =====================================================
    // HELPERS — claves de cartas y timers cancelables
    // =====================================================
    const uid = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    };

    // Timers cancelables: registrados para poder limpiarlos al reiniciar o
    // desmontar (evita setState tras desmontar y timeouts huérfanos).
    const pendingTimeoutsRef = useRef(new Set());
    const scheduleTimeout = (fn, delay) => {
        const id = setTimeout(() => {
            pendingTimeoutsRef.current.delete(id);
            fn();
        }, delay);
        pendingTimeoutsRef.current.add(id);
        return id;
    };
    const cancelTimeout = (id) => {
        if (id !== undefined && id !== null) {
            clearTimeout(id);
            pendingTimeoutsRef.current.delete(id);
        }
    };
    const clearScheduledTimeouts = () => {
        pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
        pendingTimeoutsRef.current.clear();
    };

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

            // El modal indica que la partida contará como derrota → se envía false
            // y se lee el estado actual vía refs (evita closures obsoletas).
            if (!gameSavedRef.current && userRef.current?.id) {
                gameSavedRef.current = true;
                Promise.resolve(
                    endGame(
                        userRef.current.id,
                        timeRef.current,
                        false,
                        roundsRef.current,
                        totalEarnedGold.current,
                        healedLife.current,
                        enemysDefeatedRef.current
                    )
                ).catch((saveError) => console.error("Error al guardar la partida:", saveError));
            }
            navigate('/');
        }, [navigate, endGame]);

        // =====================================================
        // CAPA 2 — FUNCIONES HOJA / PRIMITIVAS
        // =====================================================

        const stopTimer = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const calculateLayout = () => {
            const isDesktop = window.innerWidth > 1024;
            // En desktop el canvas mide la mitad de la pantalla (deja espacio al HUD lateral)
            // En móvil/vertical mide el 100% de la pantalla para aprovechar todo el ancho disponible
            const physicalWidth = isDesktop ? window.innerWidth / 2 : window.innerWidth / 1.5;
            const physicalHeight = window.innerHeight;

            return {
                width: physicalWidth,
                height: physicalHeight,
                // Escala proporcional basada en el ancho disponible real frente al virtual
                scale: physicalWidth / VIRTUAL_WIDTH,

            };
        };

        const healAnimation = (value) => {
            setHealthAnimationValue("+" + (value))
            setHealthAnimation(HealAnimation)
            scheduleTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const healthStealAnimation = (value) => {
            setHealthAnimationValue("+" + (value))
            setHealthAnimation(HealthStealIcon)
            scheduleTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const damageAnimation = (value, allDamage = false) => {
            setHealthAnimationValue(value * -1)
            if (allDamage) {
                setHealthAnimation(AllDamageAnimation)
            } else {
                setHealthAnimation(DamageAnimation)
            }

            scheduleTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const coinAnimation = (value) => {
            setGoldAnimationValue(value)
            setGoldAnimation(GoldAnimation)
            scheduleTimeout(() => {
                setGoldAnimation(null)
            }, 300)
        }

        const deleteFromRoom = (card) => {
            setRoom(prev => prev.filter(c => c.key !== card?.key));
        }

        // Función para ejecutar la animación para mover a descartes
        const moveCardToDiscard = (cardsToMove, moved = false) => {
            if (moved) {
                cardsToMove.forEach((card) => {
                    if (cardRefs.current[card.key]) {
                        const x = 660 - card?.x - 2
                        cardRefs.current[card.key].animateTo(x, 6, 0.2);
                    }
                });
            } else {
                cardsToMove.forEach((card) => {
                    if (cardRefs.current[card.key]) {
                        cardRefs.current[card.key].animateTo(660, 204, 0.4);
                    }
                });
            }
            scheduleTimeout(() => {
                setDiscardPile(prev => [...prev, ...cardsToMove]);
                setRoom(prev => prev.filter(c => !cardsToMove.find(moved => moved.key === c.key)));
                cardsToMove.forEach(card => {
                    delete cardRefs.current[card.key];
                });
            }, 450);
        };

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

        const shuffleDeck = (deck) => {
            // Acepta entradas no-array (null/undefined) y preserva las claves
            // existentes: regenerar keys en cada baraja rompe los refs y keys
            // referenciados por las cartas ya colocadas.
            const source = Array.isArray(deck) ? deck : [];
            const shuffled = lodash.shuffle(source)
                .filter((card) => card)
                .map((card) => ({
                    ...card,
                    key: card.key ?? uid()
                }));

            setDungeon(shuffled);
        };

        const addCardToDungeon = (card) => {
            if (!card) return;
            setDungeon(prev => [card, ...prev])
        }

        const addCardAndShuffle = (card) => {
            if (!card) return;
            setDungeon(prev => {
                // Solo asigna clave si la carta no la trae: re-clavar todas las
                // cartas en cada inserción duplica keys referenciadas por refs.
                const normalized = card.key ? card : { ...card, key: uid() };
                return lodash.shuffle([...prev, normalized]);
            });
        }

        const addEnemy = async (anti_exec) => {
            const newEnemy = await addEnemysToMatchDeck(1, rounds);
            return newEnemy[0];
        }
        const addEnemies = async (round = rounds) => {
            // Fórmula de enemigos por ronda: 5, 7, 9, 5, 7, 9, ...
            const quantity = 5 + (((round - 1) % 3) * 2);
            const newEnemys = await addEnemysToMatchDeck(quantity, round);
            return newEnemys;
        };

        const warrior = () => {
            handleNewAchievement('habilidad_guerrero')
            logsRef.current.push((logsRef.current.length + 1) + " - " + `Asustas a los enemigos en la sala.`)
            let actualRoom = [...room];
            let currentDungeon = [...dungeon];
            const allEnemys = actualRoom.filter(card => card?.palo === 'Pica' || card?.palo === "Trebol");
            const enemys = allEnemys.slice(0, 2);
            const noEnemys = actualRoom.filter(card => card?.palo !== 'Pica' && card?.palo !== "Trebol");
            if (enemys.length > 0) {
                enemys.forEach((card) => {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `${card?.valor} de ${card?.palo} ha huido`)
                })
                // Reposición: se roba desde el TOPE del dungeon (final del array),
                // así que `pop` es la carta que saldría a continuación. Se guarda
                // el guard por si el mazo está vacío (push(undefined) rompía la sala).
                const newCards = [];
                for (let i = 0; i < enemys.length && currentDungeon.length > 0; i++) {
                    newCards.push(currentDungeon.pop());
                }
                // Los enemigos asustados vuelven al FONDO (se robarán al final).
                currentDungeon.unshift(...enemys);
                const remainingEnemys = allEnemys.slice(2);
                const newRoom = [...newCards, ...remainingEnemys, ...noEnemys];
                setRoom(newRoom);
                setDungeon(currentDungeon);
            } else {
                logsRef.current.push((logsRef.current.length + 1) + " - " + `No has asustado a nada...`)
            }
            actualScapes.current - 1 > 0 ?
                actualScapes.current -= 1 :
                canScape.current = false
            setThanatophobiaActivated(false);
            canScape.current ? setAvailableAbility(true) : setAvailableAbility(false)
        }

        const elf = () => {
            let actualRoom = [...room];
            let newCards = [];
            logsRef.current.push((logsRef.current.length + 1) + " - " + `Has lanzado unos abrojos, bajando el valor a dos cartas.`)
            if (actualRoom.length <= 2) {
                newCards = actualRoom.map((card) => {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `${card?.valor} de ${card?.palo} ahora vale ${Math.max(0, card?.valor - 5)}`)
                    return {
                        ...card,
                        valor: Math.max(0, card?.valor - 5)
                    };
                });
            } else {
                newCards = actualRoom.map((card, index) => {
                    if (index == actualRoom.length - 1 || index == actualRoom.length - 2) {
                        logsRef.current.push((logsRef.current.length + 1) + " - " + `${card?.valor} de ${card?.palo} ahora vale ${Math.max(0, card?.valor - 5)}`)
                        return {
                            ...card,
                            valor: Math.max(0, card?.valor - 5)
                        };
                    }
                    return card;
                });
            }
            setRoom(newCards);
        }

        const scape = () => {
            if (!canScape.current) return;

            // Telaraña de la Araña gigante: bloquea la huida sin consumir intentos
            // (no se toca canScape ni actualScapes).
            if (webTurns.current > 0) {
                logsRef.current.push(`${logsRef.current.length + 1} - Una telaraña te impide huir.`);
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
            enemyDmgMultiplier.current = (0);
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
            logsRef.current.push((logsRef.current.length + 1) + " - " + "El enemigo tenía unas espinas que te han inflingido 3 de daño.")
        }

        const applyPlunder = (quantity) => {
            coinAnimation(-quantity)
            setGold(prev => Math.max(0, prev - quantity));
            logsRef.current.push((logsRef.current.length + 1) + " - " + `¡El enemigo te ha robado ${quantity} de oro!`)
        }

        const applyExtraGold = (quantity) => {
            coinAnimation(quantity)
            setGold(prev => prev + quantity);
            totalEarnedGold.current += quantity;
            logsRef.current.push((logsRef.current.length + 1) + " - " + `El enemigo llevaba una bolsita de oro con él. +${quantity} de oro.`)
        }

        const weaponBreaker = () => {
            if (weapon) {
                moveCardToDiscard([weapon], true)
                logsRef.current.push((logsRef.current.length + 1) + " - " + "El enemigo ha roto tu arma.")
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
            logsRef.current.push((logsRef.current.length + 1) + " - " + "¡El enemigo ha hecho mitosis!")
            if (card1 !== null) {
                addCardToDungeon(card1)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Se ha añadido un ${card1?.valor} de ${card1?.palo}`)
            }
            if (card2 !== null) {
                addCardToDungeon(card2)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Se ha añadido un ${card2?.valor} de ${card2?.palo}`)
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
            logsRef.current.push((logsRef.current.length + 1) + " - " + `El enemigo te ha robado 3 de vida máxima durante ${souleaterTurns.current} turnos.`)
        }

        const applySeal = () => {
            sealTurns.current += 3;
            setAvailableAbility(false);
            logsRef.current.push((logsRef.current.length + 1) + " - " + `El enemigo estaba maldito y te ha sellado la habilidad.`)
        }

        const getChamanPower = useCallback(() => {
            const remainingEnemies = [...dungeon, ...room].filter(
                (card) => ['Trebol', 'Pica'].includes(card?.palo)
            ).length;

            return remainingEnemies;
        }, [dungeon, room]);

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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `El veneno te resta 1 de salud.`);
                damageAnimation(1);
                setHealth(prev => prev - 1);
            }

            if (antihealTurns.current > 0) {
                antihealTurns.current -= 1;
                if (antihealTurns.current !== 0) {
                    antiheal.current = true;
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Turnos restantes de anticura: ${antihealTurns.current}.`);
                } else {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Anticuras desactivado.`);
                    antiheal.current = false;
                }

            }

            if (progresiveHealTurns.current > 0) {
                if (!antiheal.current) {
                    setHealth(prev => Math.min(maxHealth, prev + progresiveHeal.current));
                    healAnimation(progresiveHeal.current);
                    healedLife.current += progresiveHeal.current;
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Te has curado ${progresiveHeal.current}.`);
                } else {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `La curación progresiva no hace efecto: estás bajo anticura.`);
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
                        logsRef.current.push((logsRef.current.length + 1) + " - " + `Te has curado ${regeneratorHealth.current} de tu curación pasiva.`);
                    } else {
                        logsRef.current.push((logsRef.current.length + 1) + " - " + `Tu curación pasiva no hace efecto: estás bajo anticura.`);
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
                        logsRef.current.push((logsRef.current.length + 1) + " - " + `Has recuperado tu salud máxima.`);
                    }
                }
                souleaterTurns.current -= 1;
            }

            if (sealTurns.current > 0) {
                if (sealTurns.current === 1) {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Tu habilidad ya no está sellada.`);
                    // Re-evaluar la disponibilidad real al expirar el sello
                    if (isGambler) {
                        setAvailableAbility(gold >= 25);
                    } else if (isVampire) {
                        setAvailableAbility(health > 5 && !vampireAbilityUsed.current);
                    } else {
                        setAvailableAbility(true);
                    }
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
            if (char?.habilidad_personaje?.codigo === 'guerrero') {
                setIsWarrior(true);
            } else if (char?.habilidad_personaje?.codigo === 'paladin') {
                setMaxHealth(prev => 25);
                setHealth(prev => 25);
            } else if (char?.habilidad_personaje?.codigo === 'elfo') {
                setMaxScapes(2);
                actualScapes.current = 2;
            } else if (char?.habilidad_personaje?.codigo === 'mago') {
                setIsWizard(true);
            } else if (char?.habilidad_personaje?.codigo === 'apostador') {
                setIsGambler(true);
                coinAnimation(50);
                setGold(prev => 50);
            } else if (char?.habilidad_personaje?.codigo === 'herrero') {
                setBlacksmithDmg(1);
            } else if (char?.habilidad_personaje?.codigo === 'vampiro') {
                setIsVampire(true);
                setMaxHealthSteal(10);
            } else if (char?.habilidad_personaje?.codigo === 'domador') {
                setTameDamage(1);
            }
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
            const minibossEffect = miniboss?.efectos;
            const effectsList = Array.isArray(minibossEffect) ? minibossEffect : [minibossEffect];
            const effectName = effectsList[0]?.name;

            // Guard: si la BD no tiene cartas de miniboss (seeder no ejecutado),
            // getRandomMiniboss() devuelve null y no hay nada que activar.
            if (!miniboss || !effectName) {
                return false;
            }

            setMinibossActive(true);
            activeMinibossEffect.current = effectName;
            switch (effectName) {
                // Reina slime
                case 'sticky':
                    const queenSlime = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'slime',
                        valor: effectsList[0].value,
                        key: uid()
                    }
                    addCardAndShuffle(queenSlime)
                    break;
                // Araña gigante: se divide en 9 partes de valor 6 (value del efecto).
                // Cada parte mantiene el efecto 'spider_web' para identificarla.
                case 'spider_web':
                    spiderPartsLeft.current = 9;
                    const spiderPartValue = effectsList[0].value;
                    const spiderBaseImage = miniboss?.imagen || '';
                    for (let spiderIndex = 0; spiderIndex < 9; spiderIndex++) {
                        // Sprites por pieza: 4 patas derechas (2Miniboss-1), 4 patas
                        // izquierdas (2Miniboss-2) y 1 cabeza central (2Miniboss.webp,
                        // la imagen base).
                        let partImage = spiderBaseImage;
                        if (spiderIndex < 4) {
                            partImage = spiderBaseImage.replace('2Miniboss.webp', '2Miniboss-1.webp');
                        } else if (spiderIndex < 8) {
                            partImage = spiderBaseImage.replace('2Miniboss.webp', '2Miniboss-2.webp');
                        }
                        const spiderPart = {
                            ...miniboss,
                            palo: 'Miniboss',
                            codigo: 'arana',
                            valor: spiderPartValue,
                            imagen: partImage || spiderBaseImage,
                            key: uid()
                        };
                        addCardAndShuffle(spiderPart);
                    }
                    logsRef.current.push(`${logsRef.current.length + 1} - ¡La Araña gigante aparece con 9 partes de ${spiderPartValue} de valor!`);
                    break;
                // Chamán demoniaco
                // En tu switch dentro de handleMiniboss:
                case 'chaos_force':
                    isChamanActive.current = true;
                    chamanTurns.current = 0;

                    const initialPower = getChamanPower();

                    const chamanCard = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'chaman',
                        valor: initialPower,
                        key: uid()
                    };

                    setMinibossCard(chamanCard);
                    break;
                // Reina de los aldrones
                case 'last_pillage':
                    isPillageQueenActive.current = true;
                    const pillageQueenMiniboss = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'ladrona',
                        valor: effectsList[0].value,
                        key: uid()
                    }
                    setLastCardBoss(pillageQueenMiniboss)
                    break;
                // Rey Hada
                case 'supplies':
                    const reyHada = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'rey',
                        valor: effectsList[0].value,
                        key: uid()
                    }
                    addCardAndShuffle(reyHada)
                    break;
                // Guantes
                case 'hairballs':
                    isGuantesActive.current = true;
                    const guantesMiniboss = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'guantes',
                        valor: effectsList[0].value,
                        key: uid()
                    };
                    setLastCardBoss(guantesMiniboss);
                    break;
                // Mimico
                case 'mimicry':
                    // Camuflaje: adopta el aspecto y el valor de una carta de
                    // curación aleatoria usando los sprites especiales
                    // 8Miniboss-{valor}.webp (existentes para los valores 2-10).
                    // Disfraz único por partida. Su valor interno es SIEMPRE el
                    // verdadero (16): el render muestra el disfraz mientras
                    // `disfrazado` sea true y no hay ninguna revelación —
                    // "le pegas sin saber que es él" y el combate golpea con 16.
                    if (!mimicDisguiseRef.current) {
                        const disguiseValue = 2 + Math.floor(Math.random() * 9); // 2-10
                        mimicDisguiseRef.current = {
                            imagen: (miniboss?.imagen || '').replace('8Miniboss.webp', `8Miniboss-${disguiseValue}.webp`),
                            valor: disguiseValue,
                            suit: HeartIcon
                        };
                    }
                    const mimicCard = {
                        ...miniboss,
                        palo: 'Miniboss',
                        codigo: 'mimic',
                        valor: effectsList[0].value, // valor VERDADERO del mímico (16)
                        disfrazado: true,
                        disfraz: mimicDisguiseRef.current,
                        key: uid()
                    };
                    addCardAndShuffle(mimicCard)
                    break;
                default:
                    return false;
            }
            return true;
        }


        const handleMinibossPillageQueen = () => {
            if (weapon) {
                weaponBreaker();
                deleteCardFromMatchDeck(weapon.key)
                logsRef.current.push(
                    `${logsRef.current.length + 1} - Tu arma ha sido destruida.`
                );
            }
            // Último saqueo: la reina se lleva un 25% del oro actual
            setGold(prev => Math.floor(prev * 0.75));
            logsRef.current.push(
                `${logsRef.current.length + 1} - La Reina de los Ladrones te ha robado un 25% de tu oro.`
            );
            logsRef.current.push(
                `${logsRef.current.length + 1} - ¡Has derrotado a la Reina de los Ladrones!`
            );
        }
        const handleMinibossGuantes = () => {
            logsRef.current.push(
                `${logsRef.current.length + 1} - ¡Has derrotado a Guantes!`
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
            gameSavedRef.current = false;

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
            stopTimer();
            timeRef.current = 0;
            if (formatedTimeRef.current) {
                formatedTimeRef.current.textContent = `Tiempo: 00:00`;
            }
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
                    setShopAvailable(true);
                    applyCharacterPassive(character);
                    setGameOn(true);
                    // Nueva partida activa: se vuelve a permitir el guardado
                    gameSavedRef.current = false;
                    setRounds(startedRound);
                    pendingMiniboss = getRandomMiniboss();
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ¡JACKPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)
                handleNewAchievement('desafio_apostador')
            }
            else if (roll === 1) {
                setGold(0)
                setLastGamblerEffect(`La banca gana, tú pierdes todo tu dinero.`);
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca gana, tú pierdes todo tu dinero.`)
            }
            else if (roll <= 10) {
                //Veneno
                poison.current += 3;
                setLastGamblerEffect(`Estás envenenado 3 turnos. Ese chupito tenia un sabor raro...`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Estás envenenado 3 turnos. Ese chupito tenía un sabor raro...`)
            }
            else if (roll <= 20) {
                //Modificar daño
                const randomDmg = Math.floor(Math.random() * 7) - 3;
                userExtraDmg.current += randomDmg;
                setLastGamblerEffect(`${randomDmg} de daño extra en la siguiente acción.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomDmg} de daño extra en la siguiente acción.`)
            } else if (roll <= 30) {
                progresiveHeal.current = 1;
                progresiveHealTurns.current = 3;
                setLastGamblerEffect(`Curación progresiva 3 turnos. ¡La hidromiel no falla!`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Curación progresiva 3 turnos. ¡La hidromiel no falla!.`)
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${appliedHeal} de vida.`)
            } else if (roll <= 60) {
                //Añadir arma
                const randomPower = Math.floor(Math.random() * (rounds + 3))
                const filter = Math.max(2, randomPower)
                const weaponPower = Math.min(filter, 13)
                const newWeapon = await getWeapon(weaponPower);
                if (newWeapon) {
                    addCardToMatchDeck(newWeapon);
                    setLastGamblerEffect(`Añadida una nueva arma con valor ${newWeapon?.valor}.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva arma con valor ${newWeapon?.valor}.`)
                    addCardToDungeon(newWeapon);
                } else {
                    setLastGamblerEffect(`La banca no ha podido preparar tu arma esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca no ha podido preparar tu arma esta vez.`)
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
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva curación con valor ${newHeal?.valor}.`)
                    addCardToDungeon(newHeal)
                } else {
                    setLastGamblerEffect(`La banca no ha podido preparar tu curación esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca no ha podido preparar tu curación esta vez.`)
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomHealth} de vida máxima.`)
            } else {
                //Añadir enemigo
                const newEnemy = await addEnemy();
                if (newEnemy) {
                    setLastGamblerEffect(`Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)
                    addCardToDungeon(newEnemy);
                } else {
                    setLastGamblerEffect(`La banca no ha encontrado un enemigo esta vez.`)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca no ha encontrado un enemigo esta vez.`)
                }
            }
        }
        // =====================================================
        // CAPA 4 — ORQUESTACIÓN
        // =====================================================

        const applyCardEffect = (effect, cardValue) => {
            switch (effect?.name) {
                case 'restore_ability':
                    if (!isGambler && !isVampire) {

                        setAvailableAbility(true);
                    }
                    sealTurns.current = 0
                    currentHeal.current = 0;
                    break
                case 'heal':
                    currentHeal.current = effect?.value;
                    break;
                case 'dmg_reduction':
                    dmgReduction.current = effect?.value
                    break;
                case 'heal_roulete':
                    heal_roulete(true)
                    handleNewAchievement('gelatina')
                    break;
                case 'progresive_heal':
                    progresiveHeal.current = effect?.value
                    break;
                case 'progresive_heal_turns':
                    progresiveHealTurns.current += effect?.value
                    break;
                case 'weapon_dmg':
                    weaponDmg.current = effect?.value
                    break;
                case 'invincibility_turns':
                    invincibilityTurns.current += effect?.value
                    break;
                case 'revive':
                    revive.current = true;
                    break;
                case 'revive_health':
                    reviveHealth.current = effect?.value
                    break;
                case 'health_steal':
                    weaponHealthSteal.current = true;
                    weaponHealthStealQuantity.current = effect?.value;
                    break;
                case 'antiheal':
                    antiheal.current = true;
                    antihealTurns.current += 2;
                    break;
                case 'weapon_breaker':
                    breakWeapon.current = true;
                    break;
                case 'poison':
                    poison.current = effect?.value;
                    break;
                case 'thorny':
                    applyThorny()
                    break;
                case 'plunder':
                    applyPlunder(cardValue)
                    break;
                case 'extra_gold':
                    applyExtraGold(cardValue);
                    break;
                case 'mitosis':
                    applyMitosis(cardValue).catch((mitosisError) => console.error("Error en la mitosis:", mitosisError));
                    break;
                case 'souleater':
                    applySouleater();
                    break;
                case 'seal':
                    applySeal();
                    break;
                default:
                    return false;
            }
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + card?.valor + " de " + card?.palo + " te no te ha curado nada.")
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
            logsRef.current.push((logsRef.current.length + 1) + " - " + card?.valor + " de " + card?.palo + " te ha curado " + currentHeal.current + " de daño.")

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
                    `${logsRef.current.length + 1} - Los suministros del reino feérico debilitan al Rey hada: ahora le quedan ${nuevaVidaRey} de vida.`
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
                logsRef.current.push(`${logIndex} - Arma de ${weapon?.valor} ha sido cambiada por arma de ${card?.valor}.`);

                scheduleTimeout(() => {
                    setWeapon(card);
                    deleteFromRoom(card);
                }, 100);
            } else {
                logsRef.current.push(`${logIndex} - Nueva arma de ${card?.valor} activa.`);
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

            // Cálculos base de combate y modificadores
            const criticalMultiplier = Math.floor(Math.random() * 100) < criticalPercentage.current ? 1.5 : 1;
            if (criticalMultiplier > 1) {
                logsRef.current.push(`${logsRef.current.length + 1} - ¡Crítico! Multiplicador de ${criticalMultiplier}`);
            }
            const pentakill = actualStreak >= pentakillTargetNumber ? pentakillDmg : 0;
            const enemyBaseDmg = Math.floor(card?.valor * enemyDmgMultiplier.current) + enemyExtraDmg.current - dmgReduction.current;
            const extraSuitDmg = card?.palo === 'Pica' ? spadesExtraTakedDmg.current : card?.palo === 'Trebol' ? clubsExtraTakedDmg.current : 0;
            let finalDmg = 0;
            let isSlain = false;

            // Helpers locales para evitar duplicar lógica recurrente
            const grantGoldReward = () => {
                const baseGold = isGambler ? 10 : 5;
                const earnedGold = Math.floor(baseGold * goldMultiplier.current);
                setGold(prev => prev + earnedGold);
                coinAnimation(earnedGold);
                totalEarnedGold.current += earnedGold;
            };

            const processDamageAndRevive = (dmg) => {
                if (health - dmg <= 0 && revive.current) {
                    // Consumir SIEMPRE la resurrección (aunque reviveHealth sea 0),
                    // restaurando al menos 1 de vida.
                    revive.current = false;
                    const restoredHealth = reviveHealth.current > 0 ? reviveHealth.current : 1;
                    reviveHealth.current = 0;
                    setHealth(restoredHealth);
                    logsRef.current.push(`${logsRef.current.length + 1} - Tu ángel guardián te ha salvado la vida.`);
                } else if (lifeward && health - dmg <= 0) {
                    setLifeward(false)
                    setHealth(1);
                    logsRef.current.push(`${logsRef.current.length + 1} - Tu ángel guardián te ha salvado la vida.`);
                } else {
                    setHealth(prev => Math.max(0, prev - dmg));
                }
            };

            // Simplificación de la regla del arma
            const lastSlainCard = slainMonsters[slainMonsters.length - 1];
            const canUseWeapon = weapon && (
                slainMonsters.length === 0 ||
                card?.valor < lastSlainCard?.valor ||
                (ricochet && card?.valor <= lastSlainCard?.valor)
            );

            // Resolución de Ramas de Combate
            if (invincibilityTurns.current > 0) {
                // --- MODO INVENCIBLE ---
                finalDmg = 0;
                isSlain = true;
                invincibilityTurns.current -= 1;
                damageAnimation(0);
                if (weapon || midas.current) grantGoldReward();
            } else if (canUseWeapon) {

                // --- ATAQUE CON ARMA ---
                const finalUserDmg = Math.floor(((pentakill + weaponDmg.current + extraSuitDmg + tameDamage + userExtraDmg.current + userPermanentExtraDmg.current + blacksmithDmg) * userDmgMultiplier.current) * criticalMultiplier + 0.5);
                finalDmg = Math.max(0, enemyBaseDmg - finalUserDmg);
                isSlain = true;
                damageAnimation(finalDmg);
                grantGoldReward();
                processDamageAndRevive(finalDmg);

                // Robo de vida (Lifesteal)

                if (!antiheal.current && ((healthSteal.current || isVampire) && card?.valor < (weaponDmg.current + (isVampire ? userExtraDmg.current : 0)))) {

                    // Simplificación matemática exacta de tu lógica original
                    let heal = Math.min(maxHealthSteal, (weaponDmg.current + (isVampire ? userExtraDmg.current : 0)) - card?.valor);
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

                // --- ATAQUE SIN ARMA ---
                const finalUserDmg = Math.floor(((pentakill + extraSuitDmg + userExtraDmg.current + userPermanentExtraDmg.current + mma.current) * userDmgMultiplier.current) * criticalMultiplier + 0.5);
                finalDmg = Math.max(0, enemyBaseDmg - finalUserDmg);
                isSlain = false;

                moveCardToDiscard([card]);
                damageAnimation(finalDmg, true);
                processDamageAndRevive(finalDmg);
                if (midas.current) {
                    grantGoldReward();
                }

                if (!antiheal.current && isVampire && card?.valor < finalUserDmg) {
                    let heal = Math.min(maxHealthSteal, (finalUserDmg) - card?.valor);
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
            logsRef.current.push(`${logsRef.current.length + 1} - ${card?.valor} de ${card?.palo} te ha hecho ${finalDmg} de daño.`);
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `El hierro se ha arruinado: no se ha forjado ninguna arma.`);
                return;
            }
            handleWeapon(newWeapon);
            logsRef.current.push((logsRef.current.length + 1) + " - " + `Has forjado una nueva arma con valor ${weaponValue}.`)
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
                    `${logsRef.current.length + 1} - ¡Te enfrentaste a ${card?.valor} !`
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

                    let isMinibossDefeated = true;

                    if (effectsList.some(effect => effect?.name === 'sticky')) {
                        if (card?.valor === 2) {
                            deleteFromRoom(card);
                        } else {
                            // La reina no muere: pierde la mitad de su valor y crea 2 slimes
                            isMinibossDefeated = false;
                            const halfValue = Math.max(2, Math.floor(card.valor / 2));
                            const reducedCard = {
                                ...card,
                                valor: halfValue,
                                key: uid()
                            };
                            const customSlime = getCustomSlime(halfValue);
                            if (customSlime) {
                                // Claves distintas por copia: dos copias del mismo
                                // objeto comparten key y rompen React y los refs.
                                addCardToDungeon({ ...customSlime, key: uid() });
                                addCardToDungeon({ ...customSlime, key: uid() });
                            }
                            deleteFromRoom(card);
                            addCardAndShuffle(reducedCard);
                        }
                    } else {
                        // Miniboss normal: se descarta
                        deleteFromRoom(card);
                    }

                    // Araña gigante: sus 9 partes comparten el efecto 'spider_web'.
                    // Al destruir una parte se bloquea la huida 3 turnos (telaraña)
                    // y se descuenta de las partes restantes.
                    const isSpiderPart = card?.codigo === 'arana' &&
                        effectsList.some(effect => effect?.name === 'spider_web');
                    if (isSpiderPart && isMinibossDefeated) {
                        spiderPartsLeft.current = Math.max(0, spiderPartsLeft.current - 1);
                        webTurns.current = 3;
                        logsRef.current.push(
                            `${logsRef.current.length + 1} - Una telaraña te envuelve: no podrás huir durante 3 turnos.`
                        );
                        logsRef.current.push(
                            `${logsRef.current.length + 1} - Partes de la Araña gigante restantes: ${spiderPartsLeft.current}.`
                        );
                        if (spiderPartsLeft.current === 0 && activeMinibossEffect.current === 'spider_web') {
                            logsRef.current.push(
                                `${logsRef.current.length + 1} - ¡Has derrotado a la Araña gigante!`
                            );
                        }
                    }

                    // Solo limpiar el estado si el miniboss derrotado es el que estaba
                    // activo: las piezas derivadas (slimes, bolas de pelo...) no deben
                    // cancelar un miniboss pendiente (chamán, ladrona o guantes).
                    // Regla explícita: atacar una BOLA DE PELO (codigo 'hairball')
                    // nunca debe matar al miniboss activo (Guantes): se excluye por
                    // IDENTIDAD, y su efecto aleatorio viene de la pool de efectos
                    // enemigos, disjunta de los nombres de efecto de miniboss.
                    // La Araña solo se limpia al morir la ÚLTIMA parte: sus partes
                    // comparten nombre de efecto con el miniboss activo.
                    const defeatedEffectName = effectsList[0]?.name;

                    // Logros de miniboss: se lanzan al derrotar al miniboss en
                    // cuestión, en el mismo momento que la limpieza de estado.
                    const minibossAchievementByEffect = {
                        sticky: 'miniboss_slime',
                        spider_web: 'miniboss_arana',
                        chaos_force: 'miniboss_chaman',
                        last_pillage: 'miniboss_ladrona',
                        supplies: 'miniboss_hada',
                        hairballs: 'miniboss_guantes',
                        mimicry: 'miniboss_mimico',
                    };
                    // La bola de pelo tiene logro propio aunque jamás sea el miniboss activo.
                    if (isMinibossDefeated && card?.codigo === 'hairball') {
                        handleNewAchievement('miniboss_bola');
                    }

                    if (isMinibossDefeated && card?.codigo !== 'hairball'
                        && defeatedEffectName === activeMinibossEffect.current
                        && !(isSpiderPart && spiderPartsLeft.current > 0)) {
                        if (defeatedEffectName === 'supplies') {
                            logsRef.current.push(
                                `${logsRef.current.length + 1} - ¡Has derrotado al Rey hada!`
                            );
                        }
                        const minibossAchievement = minibossAchievementByEffect[defeatedEffectName];
                        if (minibossAchievement) {
                            handleNewAchievement(minibossAchievement);
                        }
                        handleCleanMinibosses();
                    }

                    // La telaraña se fija DESPUÉS de la limpieza para que también
                    // dure el golpe final (handleCleanMinibosses pone webTurns a 0).
                    // Decisión: un impacto nuevo REINICIA el contador a 3 turnos
                    // (3 manos), no se acumula con la telaraña anterior.
                    if (isSpiderPart) {
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
                        `${logsRef.current.length + 1} - No puedes enfrentarte al miniboss de esta forma.`
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
                }
                if (scavenger && validMove) {
                    if (Math.floor(Math.random() * 100) < 10) {
                        if (Math.floor(Math.random() * 100) >= 50) {
                            userExtraDmg.current += 1;
                            logsRef.current.push(`${logsRef.current.length + 1} - Carroñero te da 1 de daño extra en la siguiente acción.`);
                        } else if (!antiheal.current) {
                            logsRef.current.push(`${logsRef.current.length + 1} - Carroñero te ha curado 1 de vida.`);
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
                logsRef.current.push(`${logsRef.current.length + 1} - Movimiento no válido.`);
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
            vampiro: () => { setHealth(prev => prev - Math.floor(prev / 4)); userExtraDmg.current += 5; handleNewAchievement('habilidad_vampiro'); vampireAbilityUsed.current = true; setAvailableAbility(false); },
            domador: () => { setIsTaming(true); setAvailableAbility(false); handleNewAchievement('habilidad_domador') },
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
            const isOverZone =
                finalX > WEAPON_ZONE.x && finalX < WEAPON_ZONE.x + WEAPON_ZONE.width &&
                finalY > WEAPON_ZONE.y && finalY < WEAPON_ZONE.y + WEAPON_ZONE.height;
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
            const shuffledDeck = lodash.shuffle(matchDeck);
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

        const applyEffect = (effect) => {
            switch (effect?.name) {
                case "chest_rewards":
                    const weaponValue = lodash.shuffle(Array.isArray(effect?.value) ? effect.value : [])[0];
                    if (weaponValue) {
                        setModifierWeapon(weaponValue);
                    }
                    break;
                case "pentakill_target_number":
                    // Lógica para registrar cuántas muertes se necesitan (ej: 3)
                    if (pentakillTargetNumber < effect?.value) {
                        setPentakillTargetNumber(effect?.value)
                    }
                    break;

                case "pentakill_dmg":
                    // Lógica para aplicar el daño extra
                    if (pentakillDmg < effect?.value) {
                        setPentakillDmg(effect?.value)
                    }
                    break;

                case "health_steal":
                    // Lógica para el drenaje
                    healthSteal.current = true;
                    break;
                case "user_clubs_dmg":
                    clubsExtraTakedDmg.current += effect.value
                    break;
                case "user_spades_dmg":
                    spadesExtraTakedDmg.current += effect.value
                    break;
                case "enemy_dmg_multiplier":
                    enemyDmgMultiplier.current = enemyDmgMultiplier.current * effect.value
                    break;
                case "enemy_extra_dmg":
                    enemyExtraDmg.current = enemyExtraDmg.current + effect.value
                    break
                case "max_scapes":
                    setMaxScapes(prev => prev + effect.value)
                    actualScapes.current += effect.value
                    break;
                case "max_hp":
                    setMaxHealth(prev => prev + effect.value)
                    setHealth(prev => prev + effect.value)
                    break;
                case "ricochet":
                    setRicochet(true);
                    break;
                case 'gold_multiplier':
                    goldMultiplier.current = Math.max(goldMultiplier.current, effect.value)
                    break;
                case 'grandma':
                    setGrandma(true);
                    break;
                case 'mma':
                    if (mma.current < effect.value) {
                        mma.current = effect.value;
                    }
                    break;
                case 'critical_percentage':
                    if (criticalPercentage.current < effect.value) {
                        criticalPercentage.current = effect.value;
                    }
                    break;
                case 'tactical_change':
                    if (tacticalChange.current < effect.value) {
                        tacticalChange.current = effect.value;
                    }
                    break
                case 'expert':
                    expert.current = true;
                    extraHealthExpert.current = Math.max(0, Math.min(10, Math.floor(enemysDefeated / 20)));
                    setMaxHealth(prev => prev + extraHealthExpert.current);
                    break;
                case 'scavenger':
                    setScavenger(true)
                    break;
                case 'vitamine':
                    setVitamine(true)
                    break;
                case 'gluttony':
                    setGluttony(true)
                    break;
                case 'interest':
                    setInterest(prev => Math.max(prev, effect.value));
                    break;
                case 'thanatophobia':
                    setThanatophobia(true);
                    setThanatophobiaActivated(false);
                    break;
                case 'lifeward':
                    setLifeward(true);
                    break;
                case 'refund':
                    refund.current = true;
                    break;
                case 'delete':
                    handleDeleteSuit(effect.value);
                    break;
                case 'membership':
                    membership.current = true;
                    break;
                case 'clean':
                    handleDeleteHalf();
                    break;
                case 'cat_eye':
                    catEye.current = true;
                    break;
                case 'covenant':
                    handleCovenant();
                    break;
                case 'amego':
                    amego.current = true;
                    break;
                case 'regenerator':
                    if (effect.value === 1 && regeneratorHealth.current == 0) {
                        regeneratorGoalTurns.current = 5;
                    } else if (effect.value === 2 && regeneratorGoalTurns.current > 3) {
                        regeneratorGoalTurns.current = 3;
                    } else if (effect.value === 3) {
                        regeneratorGoalTurns.current = 1;
                    }
                    regeneratorHealth.current = 1;
                    regeneratorTurns.current = 0;
                    break;
                case 'adrenalin':
                    adrenalin.current = true;
                    adrenalinActivated.current = false;
                    break;
                case 'midas':
                    midas.current = true;
                    break;
                default:
                    return false;
            }
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
            if (health >= maxHealth) {
                setHealthIcon(FullHealthIcon);
            } else if (health <= maxHealth / 2 && health > 0) {
                setHealthIcon(MidHealthIcon);
            } else if (health === 0) {
                setHealthIcon(NoHealthIcon);
            }
        }, [health, maxHealth]);

        useEffect(() => {
            if (canBeClicked === false) {
                const id = scheduleTimeout(() => {
                    setCanBeClicked(true);
                }, 500);
                return () => cancelTimeout(id);
            }
        }, [canBeClicked]);

        useEffect(() => {
            if (gameLoading !== false || hasStartedNewGameRef.current) return;

            hasStartedNewGameRef.current = true;
            Promise.resolve(startNewGame()).catch((startError) => console.error("Error al iniciar la partida:", startError));
        }, [gameLoading, startNewGame]);

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
                setDungeon(prev => (prev.length > 0 ? prev : lodash.shuffle(matchDeckRef.current)));
            }
            shopWasOpenRef.current = shopAvailable;
        }, [shopAvailable]);

        // Timer
        useEffect(() => {
            if (gameOn) {
                stopTimer();
                // Nueva partida activa: se vuelve a permitir el guardado
                gameSavedRef.current = false;
                intervalRef.current = setInterval(() => {
                    timeRef.current += 1;
                    const mins = Math.floor(timeRef.current / 60);
                    const secs = timeRef.current % 60;
                    if (formatedTimeRef.current) {
                        formatedTimeRef.current.textContent = `Tiempo: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                    }
                }, 1000);
            } else if (user && rounds > 0 && !gameSavedRef.current) {
                stopTimer();
                // La bandera se marca ANTES de lanzar la petición para evitar
                // guardados duplicados; los errores se capturan explícitamente.
                gameSavedRef.current = true;
                const savePromise = continuedGame
                    ? updateActualGame(user.id, timeRef.current, true, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated)
                    : endGame(user.id, timeRef.current, gameWin, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated);
                Promise.resolve(savePromise).catch((saveError) => console.error("Error al guardar la partida:", saveError));
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

        // Layout / resize
        useEffect(() => {
            const handleResize = () => {
                setLayout(calculateLayout());
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                // Se guarda solo si la partida realmente empezó (rounds > 0)
                if (!gameSavedRef.current && userRef.current?.id && characterRef.current && roundsRef.current > 0) {
                    gameSavedRef.current = true;
                    Promise.resolve(
                        endGame(
                            userRef.current.id,
                            timeRef.current,
                            gameWinRef.current,
                            roundsRef.current,
                            totalEarnedGold.current,
                            healedLife.current,
                            enemysDefeatedRef.current
                        )
                    ).catch((saveError) => console.error("Error al guardar la partida al salir:", saveError));
                }
                stopTimer();
            };
        }, []);

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
                    if (!gameSavedRef.current && userRef.current?.id) {
                        gameSavedRef.current = true;
                        await endGame(
                            userRef.current.id,
                            timeRef.current,
                            false,
                            roundsRef.current,
                            totalEarnedGold.current,
                            healedLife.current,
                            enemysDefeatedRef.current
                        );
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
        }, [navigate, endGame]);

        // Popstate
        useEffect(() => {
            window.history.pushState(null, null, window.location.pathname);
            const handlePopState = async () => {
                setIsModalOpen(true);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }, []);

        useEffect(() => {
            return () => {
                // Solo recursos/contexto al desmontar: los setState locales no
                // tienen efecto en un componente desmontado. Se cancelan timers
                // pendientes y se restaura el cursor.
                clearScheduledTimeouts();
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
                        title="Advertencia"
                        message="Si sales, la partida contará como derrota."
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
        return (
            <Fragment>
                <div className="game">
                    {
                        !gameOn ?
                            <div className="gameOver-menu">
                                <h1 className={gameWin ? "victory" : "lose"}>{gameWin ? "VICTORIA" : "DERROTA"}</h1>

                                {
                                    gameWin ?
                                        <button onClick={() => { continueFunction() }}>
                                            CONTINUAR
                                        </button>
                                        : <></>
                                }

                                <button onClick={(event) => {
                                    setRestart(true)
                                }}>
                                    {gameWin ? 'JUGAR OTRA' : 'REINTENTAR'}
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
                                    <p>Rondas: <span>{rounds}</span></p>
                                    <p>Cartas restantes en esta ronda: <span>{dungeon.length + room.length}</span></p>
                                    <p>Total de cartas jugadas: <span>{totalCardsUsed.current}</span></p>
                                    <p>Oro obtenido esta partida: <span>{totalEarnedGold.current}</span></p>
                                    <p>Total enemigos derrotados: <span style={{ color: 'var(--main-red)' }}>{enemysDefeated}</span></p>
                                </div>
                            </div> :
                            <></>
                    }
                    <div className="game-container">

                        {/* INTERFAZ IZQUIERDA */}
                        <div className="game-hud">
                            <div className="game-hud-text">
                                <h1 className="player-health"><img src={healthIcon} alt="" />{health}/{maxHealth}{healthAnimation !== null ? <div className="animation-container"><strong className="animation">{healthAnimationValue}</strong><img className="animation" alt="" src={healthAnimation} /></div> : <></>}</h1>
                                <h1 className="player-gold"><img src={GoldIcon} alt="" />{gold}{goldAnimation !== null ? <div className="animation-container"><strong className="animation">{goldAnimationValue}</strong><img className="animation" alt="" src={goldAnimation} /></div> : <></>}</h1>
                                {!modifiersLoading && pentakillTargetNumber !== 0 ? <h1>Racha <strong>{actualStreak}</strong>/<strong>{pentakillTargetNumber}</strong></h1> : <></>}
                                {gameOn && gameWin ? <h1>RONDA {rounds}/Sin límite</h1> : <h1>RONDA {rounds}/{maxRounds}</h1>}
                                <h2 ref={formatedTimeRef}>Tiempo: 00:00</h2>
                                <p>{dungeon.length + (lastCardBoss !== undefined && !room.some(c => c?.key === lastCardBoss?.key) ? 1 : 0)} cartas restantes {minibossActive ? <img src={MinibossIcon} className='minibossIcon' title="Miniboss activo" alt="Icono miniboss" /> : ''}</p>
                                {isGambler ? lastGamblerEffect !== null ? <p className="gambler-text">Última apuesta: <br /> <span>{lastGamblerEffect}</span></p> : <p>Aún no has apostado.</p> : <></>}
                            </div>
                            <div className="game-character">
                                <img className={`character-avatar ${isWarrior && health <= maxHealth / 2 ? 'warrior' : ''} ${isTaming ? 'tamer' : ''} ${vampireAbilityUsed.current ? 'vampire' : ''}`} style={{ borderColor: user?.color }} src={character?.imagen} alt={character?.nombre} title={character?.nombre} />
                                <img className={availableAbility ? "character-ability available" : "character-ability"} src={character?.habilidad_personaje?.icono} style={null} alt="Habilidad" />
                            </div>
                            <div className="extra">
                                <div className="game-modifiers">
                                    {
                                        modifiers.length > 0 ?
                                            modifiers.map((modifierInfo, modifierIndex) => (
                                                <Modifier key={`${modifierInfo.id}-${modifierIndex}`} modifierInfo={modifierInfo} />
                                            ))
                                            : <h1>Sin modificadores</h1>
                                    }
                                </div>
                                <div className="game-buttons">
                                    <button disabled={ (dungeon.length === 0) || !(webTurns.current === 0) || !canScape.current || !gameOn} onClick={() => {
                                        scape()
                                    }}>HUIR</button>
                                    <button disabled={!availableAbility || !gameOn} onClick={() => {
                                        handleUseAbility()
                                    }}>HABILIDAD</button>
                                </div>
                            </div>
                        </div>

                        {/* VENTANA DE JUEGO */}
                        <Stage className="game-window" width={layout.width} height={layout.height * 0.8} scaleX={layout.scale} scaleY={layout.scale} imageSmoothingEnabled={false} x={0}>
                            {/* CAPA ESTÁTICA */}
                            <Layer>
                                <Group x={DUNGEON_ZONE.x} y={WEAPON_ZONE.y}>
                                    <Rect width={WEAPON_ZONE.width / 3} height={WEAPON_ZONE.height} fill="#9c94476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                                    <Text text="Efectos" fontFamily="Alagard" fontSize={16} fill="white" y={WEAPON_ZONE.height * 0.05} x={(WEAPON_ZONE.width / 3) * 0.3} />
                                    <PlayerEffects
                                        x={5}
                                        y={30}
                                        size={32}
                                        nombre="Daño extra"
                                        turnos={false}
                                        valor={extraDmgEffects()}
                                        icono={BuffIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={47.5}
                                        y={30}
                                        size={32}
                                        nombre="Daño extra de enemigos"
                                        turnos={false}
                                        valor={enemyExtraDmg.current}
                                        icono={DebuffIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={90}
                                        y={30}
                                        size={32}
                                        nombre="Daño extra a picas"
                                        turnos={false}
                                        valor={spadesExtraTakedDmg.current}
                                        icono={SpadeIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={5}
                                        y={70}
                                        size={32}
                                        nombre="Daño extra a tréboles"
                                        turnos={false}
                                        valor={clubsExtraTakedDmg.current}
                                        icono={ClubIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={47.5}
                                        y={70}
                                        size={32}
                                        nombre="Veneno"
                                        turnos={poison.current}
                                        valor={false}
                                        icono={PoisonIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={90}
                                        y={70}
                                        size={32}
                                        nombre="Sello Arcano"
                                        turnos={sealTurns.current}
                                        valor={false}
                                        icono={SealIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={5}
                                        y={110}
                                        size={32}
                                        nombre="Robaalmas"
                                        turnos={souleaterTurns.current}
                                        valor={false}
                                        icono={SouleaterIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={47.5}
                                        y={110}
                                        size={32}
                                        nombre="Daño desarmado"
                                        turnos={false}
                                        valor={mma.current}
                                        icono={mma.current === 3 ? MMA3Icon : mma.current === 2 ? MMA2Icon : MMA1Icon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={90}
                                        y={110}
                                        size={32}
                                        nombre="Anticura"
                                        turnos={antihealTurns.current}
                                        valor={false}
                                        icono={AntihealIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={5}
                                        y={150}
                                        size={32}
                                        nombre="Oro extra"
                                        turnos={false}
                                        valor={calcExtraGold()}
                                        icono={ExtraGoldIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={47.5}
                                        y={150}
                                        size={32}
                                        nombre="Invencible"
                                        turnos={invincibilityTurns.current}
                                        valor={false}
                                        icono={InvincibilityIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={90}
                                        y={150}
                                        size={32}
                                        nombre="Curación progresiva"
                                        turnos={progresiveHealTurns.current}
                                        valor={progresiveHeal.current}
                                        icono={ProgresiveHealIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                    <PlayerEffects
                                        x={5}
                                        y={190}
                                        size={32}
                                        nombre="Reducción de daño"
                                        turnos={dmgReduction.current}
                                        valor={false}
                                        icono={DmgReductionIcon}
                                        onHover={setTooltip}
                                        onLeave={() => setTooltip(null)}
                                    />
                                </Group>

                                {/* ZONA DEL MAZO */}
                                <Group x={DUNGEON_ZONE.x} y={DUNGEON_ZONE.y}>
                                    <Rect width={DUNGEON_ZONE.width} height={DUNGEON_ZONE.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} onMouseEnter={(e) => { setOverDungeonZone(true) }} onMouseLeave={(e) => { setOverDungeonZone(false) }} />
                                    <Text text="DUNGEON" rotation={55} fontFamily="Alagard" fontSize={30} fill="white" y={20} x={35} />

                                    {dungeon.toReversed().slice(0, isWizard ? 8 : 1).toReversed().map((card, i) => {
                                        let x, y;

                                        if (isWizard) {
                                            if (i < 4) {
                                                x = 5;
                                                y = 5 + (overDungeonZone ? i * 100 : 0);
                                            } else {
                                                const rowIndex = i - 4;
                                                x = overDungeonZone ? 50 : 5;
                                                y = (overDungeonZone ? 10 : 5) + (overDungeonZone ? rowIndex * 100 : 0);
                                            }
                                        } else {
                                            x = 7;
                                            y = 5;
                                        }
                                        return <Card
                                            key={card?.key}
                                            cardInfo={card}
                                            x={x}
                                            y={y}
                                            onDragEnd={() => { }}
                                            onClick={setOverDungeonZone}
                                            canBeClicked={canBeClicked}
                                            isDraggable={false}
                                            isWizard={isWizard}
                                            haveCatEye={catEye.current}
                                            onDeck={true}
                                            setOverDungeonZone={setOverDungeonZone}
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : card?.palo == 'Pica' ? SpadeIcon : MinibossIcon}
                                            defaultImage={defaultImage}
                                        />
                                    })}
                                </Group>

                                {/* PILA DE DESCARTES */}
                                <Group x={DISCARD_ZONE.x} y={DISCARD_ZONE.y}>
                                    <Rect width={DISCARD_ZONE.width} height={DISCARD_ZONE.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
                                    <Text text="DESCARTES" rotation={55} fontFamily="Alagard" fontSize={30} fill="white" y={WEAPON_ZONE.height * 0.05} x={WEAPON_ZONE.width * 0.08} />
                                    {discardPile.toReversed().slice(0, 1).map((card, i) => (
                                        <Card
                                            key={card?.key}
                                            cardInfo={card}
                                            x={5}
                                            y={5}
                                            onDragEnd={() => { }}
                                            onClick={() => { }}
                                            isDraggable={false}
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : card?.palo == 'Pica' ? SpadeIcon : MinibossIcon}
                                            defaultImage={defaultImage}
                                        />
                                    ))}
                                </Group>
                                {/* ZONA DE EQUIPO */}
                                <Group x={WEAPON_ZONE.x} y={WEAPON_ZONE.y}>
                                    <Rect width={WEAPON_ZONE.width} height={WEAPON_ZONE.height} fill="#6a9c476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                                    <Text text="ZONA DE EQUIPO" fontFamily="Alagard" fontSize={40} fill="white" y={WEAPON_ZONE.height * 0.4} x={WEAPON_ZONE.width * 0.12} />
                                    {weapon && <Card
                                        ref={el => cardRefs.current[weapon.key] = el}
                                        key={weapon?.key}
                                        cardInfo={weapon}
                                        x={10}
                                        y={10}
                                        onDragEnd={() => { }}
                                        onClick={() => { }}
                                        isDraggable={false}
                                        cardSuit={weapon?.palo == "Diamante" ? DiamonIcon : weapon?.palo == "Trebol" ? ClubIcon : weapon?.palo == "Corazon" ? HeartIcon : weapon?.palo == 'Pica' ? SpadeIcon : MinibossIcon}
                                        defaultImage={defaultImage}
                                    />}
                                    {slainMonsters.map((card, i) => (
                                        <Card
                                            ref={el => cardRefs.current[card?.key] = el}
                                            key={card?.key}
                                            cardInfo={card}
                                            x={150 + (i * 20)}
                                            y={10 + (i * 10)}
                                            onDragEnd={() => { }}
                                            onClick={() => { }}
                                            isDraggable={false}
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : card?.palo == 'Pica' ? SpadeIcon : MinibossIcon}
                                            defaultImage={defaultImage}
                                        />
                                    ))}
                                </Group>
                            </Layer>


                            {/* PARTES JUGABLES (No estáticas) */}
                            <Layer ref={layerRef}>
                                {room.map((card, index) => (
                                    <Card
                                        ref={el => cardRefs.current[card?.key] = el}
                                        key={card?.key}
                                        cardInfo={card}
                                        x={card?.x + (index * (140))}
                                        y={card?.y + 10}
                                        onDragEnd={handleDragEnd}
                                        onClick={gameOn ? processCardAction : () => { }}
                                        canBeClicked={canBeClicked}
                                        isDraggable={gameOn}
                                        cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : card?.palo == 'Pica' ? SpadeIcon : MinibossIcon}
                                        defaultImage={defaultImage}
                                    />
                                ))}
                            </Layer>
                            <Layer>
                                <TooltipLayer tooltip={tooltip} onTap={() => setTooltip(null)} />
                            </Layer>
                        </Stage>
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
                            if (!user?.id) return;
                            Promise.resolve(
                                endGame(user.id, timeRef.current, gameWin, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated)
                            ).catch((saveError) => console.error("Error al guardar la partida:", saveError));
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
                            <p>Rondas: <span>{rounds}</span></p>
                            <p>Cartas restantes en esta ronda: <span>{dungeon.length + room.length}</span></p>
                            <p>Total de cartas jugadas: <span>{totalCardsUsed.current}</span></p>
                            <p>Oro obtenido esta partida: <span>{totalEarnedGold.current}</span></p>
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