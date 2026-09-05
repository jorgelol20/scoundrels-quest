import { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
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
import Banner from "../structure/Banner";
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

// 8. Iconos de efectos
import PoisonIcon from '/images/cardEffects/Poison.webp';
import AntihealIcon from '/images/cardEffects/Antiheal.webp';
import DmgReductionIcon from '/images/cardEffects/DmgReduction.webp';
import ProgresiveHealIcon from '/images/cardEffects/ProgresiveHeal.webp';
import InvincibilityIcon from '/images/cardEffects/Invincibility.webp';
import HealthStealIcon from '/images/cardEffects/HealthSteal.webp';
import ExtraGoldIcon from '/images/cardEffects/ExtraGold.webp';
import MitosisIcon from '/images/cardEffects/Mitosis.webp';
import SouleaterIcon from '/images/cardEffects/Souleater.webp';
import BuffIcon from '/images/cardEffects/BuffIcon.webp';
import DebuffIcon from '/images/cardEffects/DebuffIcon.webp';
import SealIcon from '/images/cardEffects/Seal.webp';
import MMA1Icon from '/images/cardEffects/MMA1.webp';
import MMA2Icon from '/images/cardEffects/MMA2.webp';
import MMA3Icon from '/images/cardEffects/MMA3.webp';


const GamePage = () => {
    // =====================================================
    // CAPA 1 — ESTADO BASE (sin funciones propias)
    // =====================================================

    const navigate = useNavigate();
    const { startButtonSound, startPlayCardSound, startPlaceCardSound, showLogs } = useContext(settingsContext)
    const { matchDeck, character, activeModifiers: modifiers, setNewDeck, setNewCharacter, startNewGame, addCardToMatchDeck, gameLoading, availableCharacters, getWeapon, getHealItem, endGame, updateActualGame, setCharacter, setActiveModifiers, setGameLoading, addEnemysToMatchDeck, addEnemyToMatchDeck, handleNewAchievement } = useContext(matchContext);
    const { user } = useUser();
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
    const [maxHealthSteal, setMaxHealthSteal] = useState(3);
    const [isTaming, setIsTaming] = useState(false);
    const [tameDamage, setTameDamage] = useState(0);

    const [availableAbility, setAvailableAbility] = useState(true);
    const [lastGamblerEffect, setLastGamblerEffect] = useState(null);
    const [blacksmithDmg, setBlacksmishDmg] = useState(0)

    // Modificadores
    const [selectModifier, setSelectModifier] = useState(false);
    const [modifiersLoading, setModifiersLoading] = useState(true);
    const userExtraDmg = useRef(0);
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
    // FUNCIONES AUXILIARES — solo Capa 1 / contexto
    // =====================================================
    try {

        const handleCloseModal = useCallback(() => {
            setIsModalOpen(false);
            window.history.pushState(null, null, window.location.pathname);
        }, []);

        const handleConfirmAction = useCallback(async () => {
            setIsModalOpen(false);

            try {
                if (!gameSavedRef.current) {
                    gameSavedRef.current = true;
                    await endGame(user.id, timeRef.current, gameWin, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated);
                }
            } catch (error) {
                console.error("Error al guardar la partida:", error);
            } finally {
                navigate('/');
            }
        }, [navigate, user, gameWin, rounds, endGame]);

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

        const healAnimation = async (value) => {
            setHealthAnimationValue("+" + (value))
            setHealthAnimation(HealAnimation)
            setTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const healthStealAnimation = async (value) => {
            setHealthAnimationValue("+" + (value))
            setHealthAnimation(HealthStealIcon)
            setTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const damageAnimation = async (value, allDamage = false) => {
            setHealthAnimationValue(value * -1)
            if (allDamage) {
                setHealthAnimation(AllDamageAnimation)
            } else {
                setHealthAnimation(DamageAnimation)
            }

            setTimeout(() => {
                setHealthAnimation(null)
            }, 300)
        }

        const coinAnimation = async (value) => {
            setGoldAnimationValue(value)
            setGoldAnimation(GoldAnimation)
            setTimeout(() => {
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
            setTimeout(() => {
                setDiscardPile(prev => [...prev, ...cardsToMove]);
                setRoom(prev => prev.filter(c => !cardsToMove.find(moved => moved.key === c.key)));
                cardsToMove.forEach(card => {
                    delete cardRefs.current[card.key];
                });
            }, 450);
        };

        const heal_roulete = (execute = false) => {
            if (execute) {
                if (Math.floor(Math.random() * 100) > 75) {
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
            const shuffled = lodash.shuffle(deck).map((card) => ({
                ...card,
                key: crypto.randomUUID()
            }));

            setDungeon(shuffled);
        };

        const addEnemy = async (anti_exec) => {
            const newEnemy = await addEnemysToMatchDeck(1, rounds);
            return newEnemy[0];
        }
        const addEnemys = async (anti_exec) => {
            const quantity = 5 + Math.floor((rounds - 1) * 2);
            const newEnemys = await addEnemysToMatchDeck(quantity, rounds);
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
                enemys.map((card) => {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `${card?.valor} de ${card?.palo} ha huido`)
                })
                currentDungeon.push(...enemys);
                const newCards = [];
                for (let i = 0; i < enemys.length; i++) {
                    newCards.push(currentDungeon.shift());
                }
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

            isScapingRef.current = true;

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

            if (character?.habilidad_personaje?.id === 1 && !canScape.current) {
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
            coinAnimation((quantity * -2))
            setGold(prev => Math.max(0, prev - quantity));
            logsRef.current.push((logsRef.current.length + 1) + " - " + `¡El enemigo te ha robado ${quantity} de oro!`)
        }

        const applyExtraGold = (quantity) => {
            coinAnimation(quantity)
            setGold(prev => prev + quantity);
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
                    setTimeout(() => {
                        setSlainMonsters([]);
                    }, 200);
                }
            }
            breakWeapon.current = false;
        }

        const applyMitosis = async (cardValue) => {
            const cardPower = Math.max(Math.floor(cardValue / 2), 2)
            const card1 = await addEnemyToMatchDeck(cardPower, rounds);
            const card2 = await addEnemyToMatchDeck(cardPower, rounds);
            logsRef.current.push((logsRef.current.length + 1) + " - " + "¡El enemigo ha hecho mitosis!")
            if (card1 !== null) {
                setDungeon(prev => [card1, ...prev])
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Se ha añadido un ${card1?.valor} de ${card1?.palo}`)
            }
            if (card2 !== null) {
                setDungeon(prev => [card2, ...prev])
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Se ha añadido un ${card2?.valor} de ${card2?.palo}`)
            }
        }

        const applySouleater = () => {
            if (souleaterTurns.current === 0) {
                if (health === maxHealth) {
                    setHealth(prev => prev - 3);
                }
                setMaxHealth(prev => prev - 3);
            }
            souleaterTurns.current += 3;
            logsRef.current.push((logsRef.current.length + 1) + " - " + `El enemigo te ha robado 3 de vida máxima durante ${souleaterTurns.current} turnos.`)
        }

        const applySeal = () => {
            sealTurns.current += 3;
            setAvailableAbility(false);
            logsRef.current.push((logsRef.current.length + 1) + " - " + `El enemigo estaba maldito y te ha sellado la habilidad.`)
        }

        const fillRoom = useCallback((onComplete) => {
            const roomSize = room.length;
            const cardsNeeded = 4 - roomSize;
            if (cardsNeeded <= 0 || dungeon.length === 0) {
                onComplete?.();
                return;
            }

            const actualToDraw = Math.min(cardsNeeded, dungeon.length);
            const newCards = dungeon.slice(-actualToDraw).reverse();

            setDungeon(prevDungeon => prevDungeon.slice(0, prevDungeon.length - actualToDraw));

            newCards.forEach((card, i) => {
                setTimeout(() => {
                    startPlaceCardSound();
                    setTimeout(() => {
                        setRoom(prevRoom => {
                            const exists = prevRoom.some(existingCard => existingCard?.key === card?.key);
                            return exists ? prevRoom : [...prevRoom, card];
                        });
                        if (i === actualToDraw - 1) {
                            onComplete?.();
                        }
                    });
                }, 150 * i);
            });

            if (poison.current > 0) {
                poison.current -= 1;
                logsRef.current.push((logsRef.current.length + 1) + " - " + `El veneno te resta 1 de salud.`)
                damageAnimation(1);
                setHealth(prev => prev - 1);
            }

            if (antihealTurns.current > 0) {
                antiheal.current = true;
                antihealTurns.current -= 1;
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Turnos restantes de anticura: ${antihealTurns.current}.`)
            } else {
                antiheal.current = false;
            }

            if (progresiveHealTurns.current > 0) {
                setHealth(prev => Math.min(maxHealth, prev + progresiveHeal.current));
                healAnimation(progresiveHeal.current);
                healedLife.current += progresiveHeal.current;
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Te has curado ${progresiveHealTurns.current}.`)
                progresiveHealTurns.current -= 1;
            }
            if (souleaterTurns.current > 0) {
                if (souleaterTurns.current === 1) {
                    if (health === maxHealth) {
                        setHealth(prev => prev + 3)
                    }
                    setMaxHealth(prev => prev + 3)
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Has recuperado tu salud máxima.`)
                }
                souleaterTurns.current -= 1;
            }
            if (sealTurns.current > 0) {
                if (sealTurns.current === 1) {
                    logsRef.current.push((logsRef.current.length + 1) + " - " + `Tu habilidad ya no está sellada.`)
                    setAvailableAbility(true)
                }
                sealTurns.current -= 1;

            }

        }, [room.length, dungeon, maxHealth]);

        const applyCharacterPassive = useCallback((char) => {
            if (!char) return;
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
            } else if (char?.habilidad_personaje?.codigo === 'gambler') {
                setIsGambler(true);
                coinAnimation(50);
                setGold(prev => 50);
            } else if (char?.habilidad_personaje?.codigo === 'herrero') {
                setBlacksmishDmg(1);
            } else if (char?.habilidad_personaje?.codigo === 'vampiro') {
                setIsVampire(true);
                setMaxHealthSteal(10);
            } else if (char?.habilidad_personaje?.codigo === 'domador') {
                setTameDamage(1);
            }
        }, []);

        const restartFunction = (resetCharacter = false) => {
            setRounds(0);
            setGold(0);
            setHealth(20);
            setMaxHealth(20)
            setAvailableAbility(true);
            setShopAvailable(false)
            setActualStreak(0);
            setPentakillDmg(0)
            setPentakillTargetNumber(0)
            canScape.current = true;
            healedLife.current = 0;
            totalEarnedGold.current = 0;
            setEnemysDefeated(0);
            totalCardsUsed.current = 0;
            setIsWizard(false);
            setIsGambler(false);
            setIsWarrior(false);
            setIsVampire(false);
            setBlacksmishDmg(0)
            setMaxScapes(1);
            setLastGamblerEffect(null);
            setContinuedGame(false);
            gameSavedRef.current = false;

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

            // Reset del Timer
            stopTimer();
            timeRef.current = 0;
            if (formatedTimeRef.current) {
                formatedTimeRef.current.textContent = `Tiempo: 00:00`;
            }
            // Reiniciar modificadores
            cleanModifiers()

            // Reiniciar efectos cartas
            cleanHealEffects()
            cleanWeaponEffects()
            cleanEnemyEffects()

        }

        const startNewRound = async (continueMatch = false) => {
            if (rounds === maxRounds && !continueMatch && !continuedGame) {
                setGameOn(false)
                setGameWin(true)
            }
            else if (rounds !== maxRounds || continueMatch) {
                setSelectModifier(true)
                let newEnemys = [];
                if (rounds >= 1 && (gameOn || continueMatch)) {
                    if (interest !== 0) {
                        setGold(prev => prev + Math.floor((prev / interest)));
                    }
                    newEnemys = await addEnemys()
                    if (health <= (maxHealth / 4)) {
                        handleNewAchievement('al_limite')
                    }
                    setShopAvailable(true)
                } else {
                    setShopAvailable(false)
                }
                if (continueMatch || gameOn || rounds == 0) {
                    setRounds(rounds + 1)
                }

                // La primera ronda debe dejar la partida activa.
                if (rounds === 0) {
                    applyCharacterPassive(character);
                    setGameOn(true)
                }

                shuffleDeck([...newEnemys, ...matchDeck]);
                setDiscardPile([]);
                if (!isGambler && !isVampire) {
                    setAvailableAbility(true)
                }
            }
            cardRefs.current = []
        }

        const gambler = async () => {
            const roll = Math.floor(Math.random() * 100) + 1;
            if (roll === 100) {
                setGold(prev => prev + 50);
                setHealth(prev => Math.min(maxHealth, prev + 10));
                healedLife.current += 10;
                userExtraDmg.current += 10;
                setLastGamblerEffect(`¡JACKTPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ¡JACKTPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)
                handleNewAchievement('let_it_ride')
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
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca gana, tú pierdes todo tu dinero.`)
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
                if (randomHeal < 0) {
                    damageAnimation(randomHeal)
                } else {
                    healAnimation(randomHeal)
                    healedLife.current += randomHeal;
                }
                setHealth(prev => Math.min(maxHealth, Math.max(0, prev + randomHeal)));
                setLastGamblerEffect(`${randomHeal} de vida.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomHeal} de vida.`)
            } else if (roll <= 60) {
                //Añadir arma
                const randomPower = Math.floor(Math.random() * (rounds + 3))
                const filter = Math.max(2, randomPower)
                const weaponPower = Math.min(filter, 13)
                const newWeapon = await getWeapon(weaponPower);
                addCardToMatchDeck(newWeapon);
                setLastGamblerEffect(`Añadida una nueva arma con valor ${newWeapon?.valor}.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva arma con valor ${newWeapon?.valor}.`)
                setDungeon(prev => [newWeapon, ...prev])
            } else if (roll <= 80) {
                //Añadir curación
                const randomPower = Math.floor(Math.random() * (rounds + 3))
                const filter = Math.max(2, randomPower)
                const healPower = Math.min(filter, 13)
                const newHeal = await getHealItem(healPower);
                addCardToMatchDeck(newHeal);
                setLastGamblerEffect(`Añadida una nueva curación con valor ${newHeal?.valor}.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva curación con valor ${newHeal?.valor}.`)
                setDungeon(prev => [newHeal, ...prev])
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
                setLastGamblerEffect(`Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)
                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)
                setDungeon(prev => [newEnemy, ...prev])
            }
        }
        // =====================================================
        // CAPA 4 — ORQUESTACIÓN
        // =====================================================

        const applyCardEffect = (effect, cardValue) => {
            switch (effect?.name) {
                case 'restore_ability':
                    if (!isGambler && !isVampire) {
                        sealTurns.current = 0
                        setAvailableAbility(true);
                    }
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
                    applyMitosis(cardValue);
                    break;
                case 'souleater':
                    applySouleater();
                    break;
                case 'seal':
                    if (availableAbility) {
                        applySeal();
                    }
                    break;
                default:
                    return false;
            }
            return true;
        }


        const continueFunction = () => {
            setGameOn(true);
            setContinuedGame(true);
            startNewRound(true);
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
            if (!healedRef.current && !antiheal.current && !isVampire) {
                if (gluttony) {
                    currentHeal.current += 1;
                }
                if (currentHeal.current + health > maxHealth) {
                    vitamineValue.current = Math.min(2, (currentHeal.current + health - maxHealth));
                }
                setHealth(prev => Math.max(0, Math.min(maxHealth, prev + currentHeal.current)));
                healAnimation(currentHeal.current)
                healedLife.current += currentHeal.current;
                healedRef.current = true
                logsRef.current.push((logsRef.current.length + 1) + " - " + card?.valor + " de " + card?.palo + " te ha curado " + currentHeal.current + " de daño.")
            } else {
                logsRef.current.push((logsRef.current.length + 1) + " - " + card?.valor + " de " + card?.palo + " te no te ha curado nada.")
            }
            moveCardToDiscard([card])
            setActualStreak(0);
            return true;
        }

        const handleWeapon = (card) => {
            // 1. Limpieza y asignación inicial
            cleanWeaponEffects();
            weaponDmg.current = card?.valor;

            if (card.especial) {
                handleCardEffect(card);
            }

            // 2. Curación por cambio táctico (evitamos operaciones si es 0)
            const healAmount = tacticalChange.current;
            if (healAmount !== 0) {
                healAnimation(healAmount);
                healedLife.current += healAmount;
                setHealth(prev => Math.min(maxHealth, prev + healAmount));
            }

            // 3. Gestión del arma y Logs
            const logIndex = logsRef.current.length + 1;

            if (weapon) {
                moveCardToDiscard([weapon], true);
                logsRef.current.push(`${logIndex} - Arma de ${weapon?.valor} ha sido cambiada por arma de ${card?.valor}.`);

                setTimeout(() => {
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

                setTimeout(() => {
                    setSlainMonsters([]);
                }, 200);
            }

            // Reinicio de racha
            setActualStreak(0);
            return true;
        };

        const handleCombat = (card) => {
            // Comprobación inicial de efectos en la carta 
            if (card?.especial) {
                handleCardEffect(card);
            }
            if (isTaming) {
                setIsTaming(false);
                handleWeapon(card);
                return true;
            }

            // Cálculos base de combate y modificadores
            const criticalMultiplier = Math.floor(Math.random() * 100) <= criticalPercentage.current ? 1.5 : 1;
            if (criticalMultiplier > 1) {
                logsRef.current.push(`${logsRef.current.length + 1} - ¡Crítico! Multiplicador de ${criticalMultiplier}`);
            }
            const pentakill = actualStreak >= pentakillTargetNumber ? pentakillDmg : 0;
            const enemyBaseDmg = Math.floor(card?.valor * enemyDmgMultiplier.current) + enemyExtraDmg.current - dmgReduction.current;
            const extraSuitDmg = card?.palo === 'Pica' ? spadesExtraTakedDmg.current : clubsExtraTakedDmg.current;
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
                if (health - dmg <= 0 && revive.current || lifeward) {
                    if (reviveHealth?.current !== 0) {
                        setHealth(reviveHealth?.current);
                    } else {
                        setHealth(1);
                    }
                    if (lifeward) {
                        setLifeward(false)
                    } else {
                        revive.current = false;
                        reviveHealth.current = 0;
                    }
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
                if (weapon) grantGoldReward();
            } else if (canUseWeapon) {

                // --- ATAQUE CON ARMA ---
                const finalUserDmg = Math.floor(((weaponDmg.current + extraSuitDmg + userExtraDmg.current + blacksmithDmg) * userDmgMultiplier.current) * criticalMultiplier + 0.5);
                finalDmg = Math.max(0, (enemyBaseDmg - pentakill) - finalUserDmg);
                isSlain = true;
                damageAnimation(finalDmg);
                grantGoldReward();
                processDamageAndRevive(finalDmg);

                // Robo de vida (Lifesteal)

                if (!antiheal.current && ((healthSteal.current || isVampire) && card?.valor < (weaponDmg.current + (isVampire ? userExtraDmg.current : 0)))) {

                    // Simplificación matemática exacta de tu lógica original
                    let heal = Math.min(maxHealthSteal, (weaponDmg.current + (isVampire ? userExtraDmg.current : 0)) - card?.valor);
                    if (isVampire) {
                        handleNewAchievement('chupacabras', heal);
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
                const finalUserDmg = Math.floor(((pentakill + extraSuitDmg + userExtraDmg.current + mma.current) * userDmgMultiplier.current) * criticalMultiplier + 0.5);
                finalDmg = Math.max(0, enemyBaseDmg - finalUserDmg);
                isSlain = false;

                moveCardToDiscard([card]);
                damageAnimation(finalDmg, true);
                processDamageAndRevive(finalDmg);

                if (!antiheal.current && isVampire && card?.valor < finalUserDmg) {
                    let heal = Math.min(maxHealthSteal, (finalUserDmg) - card?.valor);
                    healedLife.current += heal;
                    handleNewAchievement('chupacabras', heal);
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
                handleNewAchievement('obra_mmaestra');
            }
            const newWeapon = await getWeapon(weaponValue);
            handleWeapon(newWeapon);
            logsRef.current.push((logsRef.current.length + 1) + " - " + `Has forjado una nueva arma con valor ${weaponValue}.`)
        }


        const processCardAction = useCallback((card) => {
            setCanBeClicked(false);
            document.body.style.cursor = "url('/images/cursor/Cursor_2.webp') 16 16, auto";
            let validMove = false;

            // Lógica de curación
            if (card?.palo === 'Corazon') {
                validMove = handleHeal(card);
                if (validMove) {
                    userExtraDmg.current = 0;
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
                    dmgReduction.current = 0;
                }
            }
            // Lógica de combate
            else if (card?.palo === 'Pica' || card?.palo === 'Trebol') {
                validMove = handleCombat(card);
                if (validMove) {
                    setEnemysDefeated(prev => prev + 1);
                    userExtraDmg.current = 0;
                    dmgReduction.current = 0;
                }
                if (scavenger) {
                    if (Math.floor(Math.random() * 100) <= 10) {
                        if (Math.floor(Math.random() * 100) > 50) {
                            userExtraDmg.current += 1;
                            logsRef.current.push(`${logsRef.current.length + 1} - Carroñero te da 1 de daño extra en la siguiente acción.`);
                        } else {
                            logsRef.current.push(`${logsRef.current.length + 1} - Carroñero te ha curado 1 de vida.`);
                            healedLife.current += 1;
                            setHealth(prev => prev + 1)
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

            // Añadimos las funciones y estados que REALMENTE se usan dentro de la función
        }, [handleHeal, handleWeapon, handleCombat, grandma, character]);
        // =====================================================
        // CAPA 8 — INTERACCIÓN DEL JUGADOR
        // =====================================================

        const ABILITY_HANDLERS = {
            guerrero: warrior,
            paladin: () => {
                setHealth(prev => Math.min(maxHealth, prev + 5));
                healedLife.current += 5;
                healAnimation(5);
                setAvailableAbility(false);
                handleNewAchievement('habilidad_paladin')
            },
            elfo: () => { elf(); setAvailableAbility(false); handleNewAchievement('habilidad_elfo') },
            mago: () => { shuffleDeck(dungeon); setAvailableAbility(false); handleNewAchievement('habilidad_mago') },
            apostador: () => {
                gambler();
                coinAnimation(-25);
                setGold(prev => Math.max(0, prev - 25));
                handleNewAchievement('habilidad_apostador')
            },
            herrero: () => { blacksmith(); setAvailableAbility(false); handleNewAchievement('habilidad_herrero') },
            vampiro: () => { setHealth(prev => prev - Math.floor(prev / 4)); userExtraDmg.current += 5; handleNewAchievement('habilidad_vampiro') },
            domador: () => { setIsTaming(true); setAvailableAbility(false); handleNewAchievement('habilidad_domador') },
        };

        const handleUseAbility = () => {
            if (!availableAbility) return;

            const handler = ABILITY_HANDLERS[character?.habilidad_personaje?.codigo];
            handler?.();
        };

        const setModifierWeapon = async (power) => {
            const newWeapon = getWeapon(power)
            processCardAction(newWeapon)
            canScape.current = true

        }

        const handleDragEnd = (card, finalX, finalY) => {
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

        const applyEffect = (effect) => {
            switch (effect?.name) {
                case "chest_rewards":
                    const weaponValue = lodash.shuffle(effect?.value)[0];
                    setModifierWeapon(weaponValue);
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
                    actualScapes.current = effect.value
                    break;
                case "max_hp":
                    setMaxHealth(prev => prev + effect.value)
                    setHealth(prev => prev + effect.value)
                    break;
                case "ricochet":
                    setRicochet(true);
                    break;
                case 'gold_multiplier':
                    goldMultiplier.current = effect.value
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
                    extraHealthExpert.current = Math.min(10, Math.floor(enemysDefeated / 20));
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
                    setInterest(effect.value);
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
                default:
                    return false;
            }
            return true;
        }
        // =====================================================
        // CAPA 10 — EVENTOS DE MODIFICADORES
        // =====================================================

        const handleModifierEvent = () => {
            const modifier = modifiers[modifiers.length - 1]
            const modifierEffects = modifier.efectos
            const effectsList = Array.isArray(modifierEffects) ? modifierEffects : [modifierEffects];
            effectsList.forEach((effect) => {
                applyEffect(effect)
            });
            setModifiersLoading(false)
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
                setTimeout(() => {
                    setCanBeClicked(true);
                }, 500);
            }
        }, [canBeClicked]);

        useEffect(() => {
            if (gameLoading !== false || hasStartedNewGameRef.current) return;

            hasStartedNewGameRef.current = true;
            startNewGame();
        }, [gameLoading, startNewGame]);

        useEffect(() => {
            if (maxHealth >= 60 && character?.habilidad_personaje?.codigo === 'paladin') {
                handleNewAchievement('muro_impenetrable');
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
        }, [gold, isGambler, sealTurns.current]);

        // Manejo disponibilidad habilidad Vampiro
        useEffect(() => {
            if (!isVampire) return;

            if (sealTurns.current === 0) {
                if (health > 5) {
                    setAvailableAbility(true);
                } else if (health <= 5 && availableAbility) {
                    setAvailableAbility(false);
                }
            }
        }, [health, isVampire, sealTurns.current]);

        useEffect(() => {
            if (expert.current && extraHealthExpert.current < 10) {
                if (enemysDefeated % 20 == 0) {
                    setMaxHealth(prev => prev + 1);
                    extraHealthExpert.current += 1;
                }
            }
        }, [enemysDefeated]);

        // Oro / shop
        useEffect(() => {
            if (!shopAvailable) {
                setRoom([]);
                shuffleDeck(matchDeck);
            }
        }, [shopAvailable]);

        // Timer
        useEffect(() => {
            if (gameOn) {
                stopTimer();
                intervalRef.current = setInterval(() => {
                    timeRef.current += 1;
                    const mins = Math.floor(timeRef.current / 60);
                    const secs = timeRef.current % 60;
                    if (formatedTimeRef.current) {
                        formatedTimeRef.current.textContent = `Tiempo: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                    }
                }, 1000);
            } else if (user !== undefined) {
                stopTimer();
                if (continuedGame) {
                    updateActualGame(user.id, timeRef.current, true, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated);
                } else {
                    endGame(user.id, timeRef.current, gameWin, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated);
                }
                gameSavedRef.current = true;
            }

            return () => stopTimer();
        }, [gameOn]);

        // Robar cartas automáticamente
        useEffect(() => {
            if (dungeon.length === 0 || isDrawingRef.current) return;

            if (room.length <= 1) {
                isDrawingRef.current = true;
                fillRoom(() => {
                    isDrawingRef.current = false;
                });

                if (!isScapingRef.current) {
                    if (isWarrior && sealTurns.current === 0) {
                        setAvailableAbility(true);
                    }
                    healedRef.current = false;
                    actualScapes.current = maxScapes;
                    canScape.current = true;
                    setThanatophobiaActivated(false);
                }

                isScapingRef.current = false;
            }
        }, [room.length, dungeon.length]);

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
                restartFunction(changeCharacter);
                setChangeCharacter(false);
            }
        }, [restart]);

        // Layout / resize
        useEffect(() => {
            if (!user) {
                navigate('/');
            }
            const handleResize = () => {
                setLayout(calculateLayout());
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                if (!gameSavedRef.current && userRef.current && characterRef.current && modifiersRef.current.length > 0) {
                    gameSavedRef.current = true;
                    endGame(
                        userRef.current.id,
                        timeRef.current,
                        gameWinRef.current,
                        roundsRef.current,
                        totalEarnedGold.current,
                        healedLife.current,
                        enemysDefeatedRef.current
                    );
                }
                stopTimer();
            };
        }, []);

        useEffect(() => {
            if (thanatophobia && room.length === 4) {
                const allEnemys = room.reduce(
                    (areEnemys, currentValue) => areEnemys = ((currentValue.palo === 'Trebol' || currentValue.palo === 'Pica') && areEnemys),
                    true,);
                if (allEnemys && !thanatophobiaActivated) {
                    actualScapes.current += 1;
                    setThanatophobiaActivated(true);
                }
            }
        }, [room, thanatophobia])

        const handleEffectHover = (effect) => {
            const stage = stageRef.current;

            setTooltip({
                ...effect,
                stage: stage,
            });
        };

        // Cuando el mazo base de la partida esté listo, se carga en el mazo de juego.
        useEffect(() => {
            if (matchDeck && matchDeck.length > 0 && dungeon.length == 0 && room.length == 0 && !isScapingRef.current) {
                startNewRound();
            }
        }, [matchDeck, dungeon, room]);

        // Cambios de modificadores
        useEffect(() => {
            if (modifiers.length > 0) {
                setModifiersLoading(true);
                handleModifierEvent();
            }
        }, [modifiers]);

        // Salida desde Navbar
        useEffect(() => {
            const gestionarSalidaNavbar = async (e) => {
                const rutaDestino = e.detail.destino;
                try {
                    if (!gameSavedRef.current) {
                        gameSavedRef.current = true;
                        await endGame(
                            user?.id,
                            timeRef.current,
                            false,
                            rounds,
                            totalEarnedGold.current,
                            healedLife.current,
                            enemysDefeated
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
        }, [navigate, user, gameWin, rounds, endGame]);

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
        }, [navigate, user, gameWin, rounds, endGame]);

        // =====================================================
        // CAPA 12 — RENDER
        // =====================================================


        if (!character && !gameOver) {
            return (
                <Fragment>
                    <div>
                        <SelectCharacter availableCharacters={availableCharacters} />
                    </div>
                </Fragment>
            )
        }

        if (selectModifier && !gameOver) {
            return (
                <Fragment>
                    <div>
                        <SelectModifier rounds={rounds} setSelectModifier={setSelectModifier} setModifiersLoading={setModifiersLoading} />
                    </div>
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
                    />
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
                return `${userExtraDmg.current + (weapon ? blacksmithDmg : 0) + (actualStreak >= pentakillTargetNumber ? pentakillDmg : 0)} y un mult de ${userDmgMultiplier.current}.`
            } else {
                return userExtraDmg.current + (weapon ? blacksmithDmg : 0) + (actualStreak >= pentakillTargetNumber ? pentakillDmg : 0);
            }
        }


        const calcExtraGold = () => {
            if (isGambler && goldMultiplier.current != 1) {
                return `5 más ${goldMultiplier.current}% del total por enemigo`
            } else if (isGambler) {
                return 5;
            } else if (goldMultiplier.current != 1) {
                return `${goldMultiplier.current}%`
            } else {
                return 0
            }
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
                                <h1 className="player-health"><img src={healthIcon} />{health}/{maxHealth}{healthAnimation !== null ? <div className="animation-container"><strong className="animation" disabled={healthAnimation}>{healthAnimationValue}</strong><img className="animation" disabled={healthAnimation} src={healthAnimation} /></div> : <></>}</h1>
                                <h1 className="player-gold"><img src={GoldIcon} />{gold}{goldAnimation !== null ? <div className="animation-container"><strong className="animation" disabled={goldAnimation}>{goldAnimationValue}</strong><img className="animation" disabled={goldAnimation} src={goldAnimation} /></div> : <></>}</h1>
                                {!modifiersLoading && pentakillTargetNumber !== 0 ? <h1>Racha <strong>{actualStreak}</strong>/<strong>{pentakillTargetNumber}</strong></h1> : <></>}
                                {gameOn && gameWin ? <h1>RONDA {rounds}/Sin límite</h1> : <h1>RONDA {rounds}/{maxRounds}</h1>}
                                <h2 ref={formatedTimeRef}>Tiempo: 00:00</h2>
                                <p>{dungeon.length} cartas restantes</p>
                                {isGambler ? lastGamblerEffect !== null ? <p className="gambler-text">Última apuesta: <br /> <span>{lastGamblerEffect}</span></p> : <p>Aún no has apostado.</p> : <></>}
                            </div>
                            <div className="game-character">
                                <img className={`character-avatar ${isWarrior && health <= maxHealth / 2 ? 'passiveActive' : ''}`} style={{ borderColor: user.color }} src={character?.imagen} alt={character?.nombre} title={character?.nombre} />
                                <img className={availableAbility ? "character-ability available" : "character-ability"} src={character?.habilidad_personaje?.icono} style={null} />
                            </div>
                            <div className="extra">
                                <div className="game-modifiers">
                                    {
                                        modifiers.length > 0 ?
                                            modifiers.map((modifierInfo) => (
                                                <Modifier key={crypto.randomUUID()} modifierInfo={modifierInfo} />
                                            ))
                                            : <h1>Sin modificadores</h1>
                                    }
                                </div>
                                <div className="game-buttons">
                                    <button disabled={!canScape.current || !gameOn} onClick={() => {
                                        scape()
                                    }}>HUIR</button>
                                    <button disabled={!availableAbility || !gameOn} onClick={() => {
                                        handleUseAbility(character.habilidad_personaje.id)
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

                                    {dungeon.toReversed().slice(0, 4).toReversed().map((card, i) => (
                                        <Card
                                            key={card?.key}
                                            cardInfo={card}
                                            x={7}
                                            y={isWizard ? 5 + (i * (overDungeonZone ? 100 : 0)) : 5}
                                            onDragEnd={() => { }}
                                            onClick={setOverDungeonZone}
                                            canBeClicked={canBeClicked}
                                            isDraggable={false}
                                            isWizard={isWizard}
                                            onDeck={true}
                                            setOverDungeonZone={setOverDungeonZone}
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
                                            defaultImage={defaultImage}
                                        />
                                    ))}
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
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
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
                                        cardSuit={weapon?.palo == "Diamante" ? DiamonIcon : weapon?.palo == "Trebol" ? ClubIcon : weapon?.palo == "Corazon" ? HeartIcon : SpadeIcon}
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
                                            cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
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
                                        cardSuit={card?.palo == "Diamante" ? DiamonIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
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

        return (
            <Fragment>
                <div>
                    <div className="gameOver-menu">
                        <h1 className="lose">ERROR</h1>
                        <button
                            onClick={() => {
                                const newBugInfo = {
                                    modificadores: modifiers,
                                    error: error.message,
                                    personaje: character.nombre,
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
                        <button onClick={(event) => {
                            endGame(user.id, timeRef.current, gameWin, rounds, totalEarnedGold.current, healedLife.current, enemysDefeated)
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

export default GamePage;