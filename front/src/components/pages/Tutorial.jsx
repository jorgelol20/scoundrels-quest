// 1. React y librerías externas (NPM)
import React, { useState, Fragment, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layer, Label, Rect, Stage, Text, Image, Group } from "react-konva";
import useImage from "use-image";

// 2. Contextos y Hooks
import { matchContext } from "../../context/MatchProvider.jsx";
import { useModifier } from "../../hooks/useModifier.js";

// 3. Componentes
import Card from "../Card.jsx";
import Modifier from "../Modifier.jsx";

import './Tutorial.css';
import GameIcon from '/images/banner_menu.webp';

// Suits & UI
import ClubIcon from '/images/suit_club.webp';
import HeartIcon from '/images/suit_heart.webp';
import DiamondIcon from '/images/suit_diamond.webp';
import SpadeIcon from '/images/suit_spade.webp';
import DefaultCardImage from '/images/default_card.webp';
import GoldIcon from '/images/gold.webp';
import healthIcon from '/images/full_health.png';

// ShopMan
import ShopManSad from '/images/shopman/Sad.webp';
import ShopManAngry from '/images/shopman/Angry.webp';
import ShopManNormal from '/images/shopman/Normal.webp';
import ShopManHappy from '/images/shopman/Happy.webp';
import ShopManSarcastic from '/images/shopman/Sarcastic.webp';
import ShopManThinking from '/images/shopman/Thinking.webp';

// Animations
import AllDamageAnimation from '/images/animations/AllDamageAnimation.webp';
import DamageAnimation from '/images/animations/DamageAnimation.webp';

// Card Effects
import PoisonIcon from '/images/cardEffects/Poison.webp';
import AntihealIcon from '/images/cardEffects/Antiheal.webp';
import WeaponBreakerIcon from '/images/cardEffects/WeaponBreaker.webp';
import RestoreAbilityIcon from '/images/cardEffects/RestoreAbility.webp';
import DmgReductionIcon from '/images/cardEffects/DmgReduction.webp';
import ProgresiveHealIcon from '/images/cardEffects/ProgresiveHeal.webp';
import HealRouleteIcon from '/images/cardEffects/HealRoulete.webp';
import InvincibilityIcon from '/images/cardEffects/Invincibility.webp';
import ReviveIcon from '/images/cardEffects/Revive.webp';
import HealthStealIcon from '/images/cardEffects/HealthSteal.webp';
import ThornyIcon from '/images/cardEffects/Thorny.webp';
import PlunderIcon from '/images/cardEffects/Plunder.webp';
import ExtraGoldIcon from '/images/cardEffects/ExtraGold.webp';
import MitosisIcon from '/images/cardEffects/Mitosis.webp';
import SouleaterIcon from '/images/cardEffects/Souleater.webp';
import SealIcon from '/images/cardEffects/Seal.webp';
import BlockedIcon from '/images/cardEffects/Blocked.webp';

const Tutorial = () => {
    const navigate = useNavigate();
    const { modifiers } = useModifier()
    const [currentIndex, setCurrentIndex] = useState(0);
    const { getTutorialCards } = useContext(matchContext);

    //Imagenes ShopMan
    const [shopManSad] = useImage(ShopManSad);
    const [shopManAngry] = useImage(ShopManAngry);
    const [shopManNormal] = useImage(ShopManNormal);
    const [shopManHappy] = useImage(ShopManHappy); 
    const [shopManThinking] = useImage(ShopManSarcastic);
    const [shopManSarcastic] = useImage(ShopManThinking);

    // Tutorial 1
    const tutorial1Cards = getTutorialCards(1);
    const [defaultImage] = useImage(DefaultCardImage);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Tutorial 2
    const modificadores = modifiers;

    // Escala para react-konva
    const [scale, setScale] = useState(window.innerWidth / 2560)


    useEffect(() => {
        const handleResize = () => {
            setScale(window.innerWidth / 1920)
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, []);

    const slide1 = (
        <Fragment>
            <div className="slide-1 slide">
                <h1>Bienvenido a </h1>
                <img src={GameIcon} alt="Banner Menu" />
                <p>El roguelike estratégico de cartas más adictivo y dificil.</p>
            </div>
        </Fragment>
    );

    const slide2 = (
        <Fragment>
            <div className="slide-2 slide">
                <div className="container">
                    <h1>Tu objetivo</h1>
                    <p>Te has adentrado en la mazmorra para conseguir <span>riquezas</span> y no tener que preocuparte más de ser pobre. ¿Sencillo verdad?</p>
                    <h2><strong>¡Pues no!</strong></h2>
                    <p>Para poder llevar a casa toda esa riqueza, deberás superar las 10 rondas de la mazmorra donde, con cada ronda que superes, más enemigos irán apareciendo incluso algunos teniendo <span>efectos especiales</span> que complicarán más tu cometido.</p>
                </div>
            </div>
        </Fragment>
    );

    const slide3 = (
        <Fragment>
            <div className="slide-3 slide">
                <div className="slide-3-info">
                    <h1>Cartas</h1>
                    <p>En <span>Scoundrel's Quest</span> se utilizan las cartas de la baraja de póker donde cada una tiene una función propia.</p>
                    <p>
                        Los <strong>enemigos</strong> son las picas y los tréboles. <br />
                        Las <span>armas</span> son los diamantes. <br />
                        Las <span style={{ color: 'var(--main-green)' }}>curaciones</span> son los corazones.
                    </p>
                    <p><span>Ponte encima </span> o <span>clica</span> en ellas para conocer más.</p>
                </div>
                <div className="card-stage">
                    {/* Carta 2 */}
                    <div key={tutorial1Cards[1]?.key + 3}>
                        <Stage width={200 * (scale + 0.1)} height={200 * (scale + 0.1)} scaleX={scale + 0.1} scaleY={scale + 0.1} y={20 * scale / 20}
                            onMouseOver={() => setHoveredIndex(tutorial1Cards[1]?.id)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onTap={() => hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(tutorial1Cards[1]?.id)}
                        >
                            <Layer key={tutorial1Cards[1]?.key + 1}>
                                <Card
                                    key={tutorial1Cards[1]?.key}
                                    cardInfo={tutorial1Cards[1]}
                                    onMouseOver={() => { }}
                                    onDragEnd={() => { }}
                                    onClick={() => { }}
                                    canBeClicked={false}
                                    isDraggable={false}
                                    cardSuit={HeartIcon}
                                    defaultImage={defaultImage}
                                />
                                {hoveredIndex === tutorial1Cards[1]?.id && (
                                    <Label x={0} y={0}>
                                        <Rect width={150} height={110} fill="#FFF" x={50} y={0} cornerRadius={5} stroke={"black"} />

                                        <Text text={"¡Comida! Te servirá para curarte tras el combate. Su poder base va desde el 2 hasta el 10"} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={0} />
                                        <Image image={shopManHappy} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>
                                )}
                            </Layer>
                        </Stage>
                    </div>

                    {/* Carta 3 */}
                    <div key={tutorial1Cards[2]?.key + 3}>
                        <Stage width={200 * (scale + 0.1)} height={200 * (scale + 0.1)} scaleX={(scale + 0.1)} scaleY={(scale + 0.1)} y={20 * scale / 20}
                            onMouseOver={() => setHoveredIndex(tutorial1Cards[2]?.id)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onTap={() => hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(tutorial1Cards[2]?.id)}
                        >
                            <Layer key={tutorial1Cards[2]?.key + 1}>
                                <Card
                                    key={tutorial1Cards[2]?.key}
                                    cardInfo={tutorial1Cards[2]}
                                    onMouseOver={() => { }}
                                    onDragEnd={() => { }}
                                    onClick={() => { }}
                                    canBeClicked={false}
                                    isDraggable={false}
                                    cardSuit={DiamondIcon}
                                    defaultImage={defaultImage}
                                />
                                {hoveredIndex === tutorial1Cards[2]?.id && (
                                    <Label x={0} y={0}>
                                        <Rect width={150} height={110} fill="#FFF" x={50} y={0} cornerRadius={5} stroke={"black"} />
                                        <Text text={"Son las armas que te ayudarán en la mazmorra. Su poder base va desde el 2 hasta el 10."} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={0} />
                                        <Image image={shopManNormal} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>
                                )}
                            </Layer>
                        </Stage>
                    </div>

                    {/* Carta 1 */}
                    <div key={tutorial1Cards[0]?.key + 3}>
                        <Stage width={200 * (scale + 0.1)} height={200 * (scale + 0.1)} scaleX={(scale + 0.1)} scaleY={(scale + 0.1)} y={20 * scale / 20}
                            onMouseOver={() => setHoveredIndex(tutorial1Cards[0]?.id)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onTap={() => hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(tutorial1Cards[0]?.id)}
                        >
                            <Layer key={tutorial1Cards[0]?.key + 1}>
                                <Card
                                    key={tutorial1Cards[0]?.key}
                                    cardInfo={tutorial1Cards[0]}
                                    onMouseOver={() => { }}
                                    onDragEnd={() => { }}
                                    onClick={() => { }}
                                    canBeClicked={false}
                                    isDraggable={false}
                                    cardSuit={SpadeIcon}
                                    defaultImage={defaultImage}
                                />
                                {hoveredIndex === tutorial1Cards[0]?.id && (
                                    <Label x={0} y={0}>
                                        <Rect width={150} height={90} fill="#FFF" x={50} y={20} cornerRadius={5} stroke={"black"} />
                                        <Text text={"Se tratan de enemigos con forma humanoide. Su poder va del 2 al 14."} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
                                        <Image image={shopManAngry} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>

                                )}
                            </Layer>
                        </Stage>
                    </div>

                    {/* Carta 4 */}
                    <div key={tutorial1Cards[3]?.key + 3}>
                        <Stage width={200 * (scale + 0.1)} height={200 * (scale + 0.1)} scaleX={(scale + 0.1)} scaleY={(scale + 0.1)} y={20 * scale / 20}
                            onMouseOver={() => setHoveredIndex(tutorial1Cards[3]?.id)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onTap={() => hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(tutorial1Cards[3]?.id)}
                        >
                            <Layer key={tutorial1Cards[3]?.key + 1}>
                                <Card
                                    key={tutorial1Cards[3]?.key}
                                    cardInfo={tutorial1Cards[3]}
                                    onMouseOver={() => { }}
                                    onDragEnd={() => { }}
                                    onClick={() => { }}
                                    canBeClicked={false}
                                    isDraggable={false}
                                    cardSuit={ClubIcon}
                                    defaultImage={defaultImage}
                                />
                                {hoveredIndex === tutorial1Cards[3]?.id && (
                                    <Label x={0} y={0}>
                                        <Rect width={150} height={90} fill="#FFF" x={50} y={20} cornerRadius={5} stroke={"black"} />
                                        <Text text={"Se tratan de enemigos monstruosos. Su poder va del 2 al 14."} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
                                        <Image image={shopManThinking} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
            </div>
        </Fragment>
    );


    const slide4 = (
        <Fragment>
            <div className="slide-4 slide">
                <h1>Modificadores</h1>
                <p>En tu partida irás consiguiendo <span>modificadores</span> que te ayudarán a llegar lo más lejos que puedas.</p>
                <p><span>Ponte encima</span> o <span>clica sobre ellos</span> para conocer sus efectos.</p>
                <div className="tutorial-modifiers">
                    {modifiers?.map(modifier => <Modifier key={modifier.id + '-modifier'} modifierInfo={modifier} />)}
                </div>
            </div>
        </Fragment>
    )

    const cardsEffects = [
        { 'name': 'Anticuras', 'description': 'Durante el resto de la mano, te impide curarte.', 'image': AntihealIcon, 'target': 'Enemigo' },
        { 'name': 'Reducción de daño', 'description': 'Reduce el daño que sufres.', 'image': DmgReductionIcon, 'target': 'Curación' },
        { 'name': 'Oro extra', 'description': 'El enemigo te da una cantidad de oro equivalente a su valor.', 'image': ExtraGoldIcon, 'target': 'Enemigo' },
        { 'name': 'Ruleta de curación', 'description': 'Hay una probabilidad de que te cure o te haga daño.', 'image': HealRouleteIcon, 'target': 'Curación' },
        { 'name': 'Invencibilidad', 'description': 'No recibes daño directo del enemigo.', 'image': InvincibilityIcon, 'target': 'Arma' },
        { 'name': 'Saqueo', 'description': 'El enemigo te quita una cantidad de oro equivalente al doble de su valor.', 'image': PlunderIcon, 'target': 'Enemigo' },
        { 'name': 'Veneno', 'description': 'Te va causando daño al pasar de mano durante una cantidad de manos fijas.', 'image': PoisonIcon, 'target': 'Enemigo' },
        { 'name': 'Curación progresiva', 'description': 'Te cura una cantidad de vida al pasar de mano durante una cantidad de manos fijas.', 'image': ProgresiveHealIcon, 'target': 'Curación' },
        { 'name': 'Restaurar habilidad', 'description': 'Restaura tu habilidad, pero no te cura.', 'image': RestoreAbilityIcon, 'target': 'Curación' },
        { 'name': 'Revivir', 'description': 'Si fueses a morir golpeando con el arma portadora del efecto, sobrevives a 1 de vida.', 'image': ReviveIcon, 'target': 'Arma' },
        { 'name': 'Espinoso', 'description': 'Recibes 3 de daño fijo.', 'image': ThornyIcon, 'target': 'Enemigo' },
        { 'name': 'Rompe Armas', 'description': 'Rompe el arma activa.', 'image': WeaponBreakerIcon, 'target': 'Enemigo' },
        { 'name': 'Mitosis', 'description': 'Al matar al enemigo, crea dos enemigos más debiles.', 'image': MitosisIcon, 'target': 'Enemigo' },
        { 'name': 'Robaalmas', 'description': 'Durante 3 turnos, pierdes 3 de vida máxima.', 'image': SouleaterIcon, 'target': 'Enemigo' },
        { 'name': 'Sello Arcano', 'description': 'Durante 3 turnos, la habilidad permanece bloqueada.', 'image': SealIcon, 'target': 'Enemigo' },
        { 'name': 'Bloqueo', 'description': 'Aunque huyas, la carta se mantendrá en la mano.', 'image': BlockedIcon, 'target': 'Enemigo' },
    ];
    const slide5 = (
        <Fragment>
            <div className="slide-5 slide">
                <h1>Efectos en las cartas</h1>
                <div style={{ width: '80%' }}>
                    <p>Aleatoriamente, algunas cartas enemigas podrán tener <span>efectos</span>. Para contrarrestar eso, en la tienda podrás obtener cartas (<span>curaciones</span> y <span>armas</span>) con efectos únicos.</p>
                </div>
                <div className="card-effects">
                    {
                        cardsEffects.map((effect, index) => {
                            return <div key={index} className="card-effect">
                                <div className="effect-image">
                                    <img src={effect.image} alt={effect.name} />
                                    <p><span>{effect.target}</span></p>
                                </div>
                                <div className="effect-text">
                                    <div className="effect-name">
                                        <h1>{effect.name}</h1>
                                    </div>
                                    <div className="effect-description">
                                        <p>{effect.description}</p>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        </Fragment>
    )


    //
    const [DUNGEON_ZONE, setDUNGEON_ZONE] = useState({ x: 10, y: 5, width: 100, height: 130 });
    const [DISCARD_ZONE, setDISCARD_ZONE] = useState({ x: 650, y: 170, width: 100, height: 130 });
    const [WEAPON_ZONE, setWEAPON_ZONE] = useState({ x: 200, y: 170, width: 370, height: 190 });
    const [HAND_ZONE, setHAND_ZONE] = useState({ x: 150, y: 5, width: 550, height: 160 });
    const slide6 = (
        <Fragment>
            <div className="slide-6 slide">
                <h1>Zona de juego</h1>
                <div style={{ width: '80%' }}>
                    <p>
                        La zona de juego se reparte en 4 partes: el <span>mazo</span>, la <span>mano</span>, la <span>zona de juego</span> y los <span>descartes</span>.<br />
                        El <span>mazo</span> es donde se 'apilan' todas las cartas que van a verse durante la ronda. <br />
                        La <span>mano</span>, donde irán apareciendo las cartas que podrán ser <strong>enemigos</strong>, <span>armas</span> o <span style={{ color: "var(--main-green)" }}>curaciones</span> de <span>4 en 4</span>. <br />
                        La <span>zona de juego</span> donde se deberán mover las cartas para ser jugadas. <br />
                        Por último, están los <span>descartes</span>, donde se irán quedando las cartas ya jugadas.
                    </p>
                </div>
                <Stage width={765 * scale} height={400 * scale} scaleX={scale} scaleY={scale} y={20 * scale / 20}>
                    <Layer>
                        {/* ZONA DEL MAZO */}
                        <Group x={DUNGEON_ZONE.x} y={DUNGEON_ZONE.y}>
                            <Rect width={DUNGEON_ZONE.width} height={DUNGEON_ZONE.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text="DUNGEON" rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={25} x={35} />
                        </Group>
                        <Group x={DISCARD_ZONE.x} y={DISCARD_ZONE.y}>
                            <Rect width={DISCARD_ZONE.width} height={DISCARD_ZONE.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text="DESCARTES" rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={WEAPON_ZONE.height * 0.05} x={WEAPON_ZONE.width * 0.08} />
                        </Group>
                        <Group x={WEAPON_ZONE.x} y={WEAPON_ZONE.y}>
                            <Rect width={WEAPON_ZONE.width} height={WEAPON_ZONE.height} fill="#6a9c476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text="ZONA DE EQUIPO" fontFamily="Alagard" fontSize={40} fill="white" y={WEAPON_ZONE.height * 0.4} x={WEAPON_ZONE.width * 0.12} />
                        </Group>
                        <Group x={HAND_ZONE.x} y={HAND_ZONE.y}>
                            <Rect width={HAND_ZONE.width} height={HAND_ZONE.height} fill="#90c0ff50" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text="MANO" fontFamily="Alagard" fontSize={40} fill="white" y={HAND_ZONE.height * 0.4} x={HAND_ZONE.width * 0.35} />
                        </Group>
                    </Layer>
                </Stage>


            </div>
        </Fragment>
    )
    const tutorial7Cards = getTutorialCards(7)
    const [room, setRoom] = useState([
        ...tutorial7Cards
    ]);
    const [discardPile, setDiscardPile] = useState([]);
    const [health, setHealth] = useState(20);
    const [healthAnimationValue, setHealthAnimationValue] = useState(null);
    const [weapon, setWeapon] = useState(null);
    const [slainMonsters, setSlainMonsters] = useState([]);
    const [canBeClicked, setCanBeClicked] = useState(true);

    const deleteFromRoom = (card) => {
        setRoom(prev => prev.filter(c => c.key !== card?.key));
    }

    const [healthAnimation, setHealthAnimation] = useState(null);
    const damageAnimation = async (value, allDamage = false) => {
        setHealthAnimationValue(value * -1);
        if (allDamage) {
            setHealthAnimation(AllDamageAnimation);
        } else {
            setHealthAnimation(DamageAnimation);
        }

        setTimeout(() => {
            setHealthAnimation(null);
        }, 300);
    }

    const moveCardToDiscard = (cardsToMove, moved = false) => {
        setTimeout(() => {
            setDiscardPile(prev => [...prev, ...cardsToMove]);
            setRoom(prev => prev.filter(c => !cardsToMove.find(moved => moved.key === c.key)));
        }, 200);
    };

    const handleWeapon = (card) => {
        if (weapon) {
            moveCardToDiscard([weapon], true);
            setTimeout(() => {
                setWeapon(card);
                deleteFromRoom(card);
            }, 100);
        } else {
            setWeapon(card);
            deleteFromRoom(card);
        }

        if (slainMonsters.length > 0) {
            moveCardToDiscard([...slainMonsters], true);
            setTimeout(() => {
                setSlainMonsters([]);
            }, 200);
        }
        return true;
    };

    const handleCombat = (card) => {
        let finalDmg = 0;
        let isSlain = false;

        const lastSlainCard = slainMonsters[slainMonsters.length - 1];
        const canUseWeapon = weapon && (
            slainMonsters.length === 0 ||
            card?.valor < lastSlainCard?.valor
        );

        if (canUseWeapon) {
            finalDmg = Math.max(0, card?.valor - weapon?.valor);
            isSlain = true;
            damageAnimation(finalDmg);
            setHealth(prev => Math.max(0, prev - finalDmg));
        } else {
            finalDmg = card?.valor;
            isSlain = false;
            moveCardToDiscard([card]);
            damageAnimation(finalDmg, true);
            setHealth(prev => Math.max(0, prev - finalDmg));
        }

        if (isSlain) {
            setSlainMonsters(prev => [...prev, card]);
            deleteFromRoom(card);
        }

        return true;
    };

    const processCardAction = useCallback((card) => {
        setCanBeClicked(false);
        document.body.style.cursor = "url('/images/cursor/Cursor_2.webp') 16 16, auto";

        if (card?.palo === 'Diamante') {
            handleWeapon(card);
        } else if (card?.palo === 'Pica' || card?.palo === 'Trebol') {
            handleCombat(card);
        }

        setTimeout(() => {
            setCanBeClicked(true);
            document.body.style.cursor = "auto";
        }, 500);
    }, [weapon, slainMonsters, health]);

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

    const resetSimulator = () => {
        setRoom([
            ...getTutorialCards(7)
        ]);
        setWeapon(null);
        setSlainMonsters([]);
        setDiscardPile([]);
        setHealth(20);
    };

    const slide7 = (
        <Fragment>
            <div className="slide-7 slide">
                <div className="container">
                    <h1>Combate</h1>
                    <p>
                        Las bases del combate en Scoundrel's Quest gira en torno a el arma activa. <br />
                        Si <span>tienes arma</span> y <span>no has pegado aún</span> a ningún <strong>enemigo</strong>, el daño que recibirás será el valor del <strong>enemigo</strong> menos el valor del <span>arma</span> <br />
                        Si <span>ya dispones de un arma</span> y ya la has <span>usado contra un enemigo</span>, para que el arma tenga efecto el <span>último enemigo</span> que has derrotado tiene que ser mayor que el que vas a derrotar a continuación <br />
                        <span>Si no tienes ninguna arma</span> o si el enemigo que vas a golpear es <span> mayor o igual que el anterior</span>, recibirás <strong>todo el daño del enemigo</strong>.
                    </p>
                    <p>A continuación, tendrás un <span>simulador de combate</span> para comprobarlo por tu cuenta.</p>
                </div>
            </div>
        </Fragment>
    );

    const slide8 = (
        <Fragment>
            <div className="slide-8 slide">
                <h1>Simulador de combate</h1>
                <h1 className="player-health"><img src={healthIcon} />{health}/20{healthAnimation !== null ? <div className="animation-container"><strong className="animation" disabled={healthAnimation}>{healthAnimationValue}</strong><img className="animation" disabled={healthAnimation} src={healthAnimation} /></div> : <></>}</h1>
                <div>
                    <button className="reset-simulator-btn" onClick={resetSimulator}>
                        Reiniciar
                    </button>
                    <Stage width={1200 * scale} height={550 * scale} scaleX={scale * 1.5} scaleY={scale * 1.5} y={30 * scale / 30}>
                        <Layer>
                            {/* ZONA DEL MAZO */}
                            <Group x={DUNGEON_ZONE.x} y={DUNGEON_ZONE.y}>
                                <Rect width={DUNGEON_ZONE.width} height={DUNGEON_ZONE.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text="DUNGEON" rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={25} x={35} />
                            </Group>

                            {/* DESCARTES */}
                            <Group x={DISCARD_ZONE.x} y={DISCARD_ZONE.y}>
                                <Rect width={DISCARD_ZONE.width} height={DISCARD_ZONE.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text="DESCARTES" rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={WEAPON_ZONE.height * 0.05} x={WEAPON_ZONE.width * 0.08} />
                                {discardPile.slice(-1).map((card, i) => (
                                    <Card
                                        key={card.key}
                                        cardInfo={card}
                                        x={5}
                                        y={5}
                                        onDragEnd={() => { }}
                                        onClick={() => { }}
                                        isDraggable={false}
                                        canBeClicked={false}
                                        cardSuit={card?.palo == "Diamante" ? DiamondIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
                                        defaultImage={defaultImage}
                                    />
                                ))}
                            </Group>

                            {/* ZONA DE EQUIPO */}
                            <Group x={WEAPON_ZONE.x} y={WEAPON_ZONE.y}>
                                <Rect width={WEAPON_ZONE.width} height={WEAPON_ZONE.height} fill="#6a9c476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text="ZONA DE EQUIPO" fontFamily="Alagard" fontSize={40} fill="white" y={WEAPON_ZONE.height * 0.4} x={WEAPON_ZONE.width * 0.12} />
                                {weapon && <Card
                                    key={weapon.key}
                                    cardInfo={weapon}
                                    x={10}
                                    y={10}
                                    onDragEnd={() => { }}
                                    onClick={() => { }}
                                    isDraggable={false}
                                    canBeClicked={false}
                                    cardSuit={weapon?.palo == "Diamante" ? DiamondIcon : weapon?.palo == "Trebol" ? ClubIcon : weapon?.palo == "Corazon" ? HeartIcon : SpadeIcon}
                                    defaultImage={defaultImage}
                                />}
                                {slainMonsters.map((card, i) => (
                                    <Card
                                        key={card.key}
                                        cardInfo={card}
                                        x={140 + (i * 20)}
                                        y={10 + (i * 10)}
                                        onDragEnd={() => { }}
                                        onClick={() => { }}
                                        isDraggable={false}
                                        canBeClicked={false}
                                        cardSuit={card?.palo == "Diamante" ? DiamondIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
                                        defaultImage={defaultImage}
                                    />
                                ))}
                            </Group>

                            {/* MANO */}
                            <Group x={HAND_ZONE.x} y={HAND_ZONE.y}>
                                <Rect width={HAND_ZONE.width} height={HAND_ZONE.height} fill="#90c0ff50" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text="MANO" fontFamily="Alagard" fontSize={40} fill="white" y={HAND_ZONE.height * 0.4} x={HAND_ZONE.width * 0.35} />
                                {room.length != 0 ? room.map((card, index) => {
                                    if (card !== undefined) {
                                        return <Card
                                            key={card.key}
                                            cardInfo={card}
                                            x={10 + (index * 130)}
                                            y={5}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => processCardAction(card)}
                                            canBeClicked={canBeClicked}
                                            isDraggable={true}
                                            cardSuit={card?.palo == "Diamante" ? DiamondIcon : card?.palo == "Trebol" ? ClubIcon : card?.palo == "Corazon" ? HeartIcon : SpadeIcon}
                                            defaultImage={defaultImage}
                                            scale={scale}
                                        />
                                    }
                                }
                                ) : <></>}
                            </Group>
                        </Layer>
                        <Layer>
                            <Label x={0} y={0}>
                                <Rect width={150} height={120} fill="#FFF" x={40} y={170} cornerRadius={5} stroke={"black"} />
                                <Text text={"Si no cargan las cartas, dale a reiniciar."} fill="var(--main-black)" padding={5} fontSize={24} width={150} align="center" fontFamily="Alagard" x={40} y={175} />
                                <Image image={shopManNormal} width={60} height={60} x={5} y={265} imageSmoothingEnabled={false} listening={false} />
                            </Label>
                        </Layer>
                    </Stage>
                </div>

            </div>
        </Fragment>
    )

    const slide9 = (
        <Fragment>
            <div className="slide-9 slide">
                <div className="container">
                    <h1>Tienda</h1>
                    <p>
                        Tras terminar cada ronda, aparecerá la tienda donde podrás comprar con el oro obtenido cartas de <span>curación</span>, <span>armas</span> e incluso <span>modificadores</span>. <br /> <br />
                        Obtienes <span>5 de oro <img src={GoldIcon} /></span> cada vez que derrotas a un enemigo con tu arma. <br /> <br />
                        No te preocupes por el precio de los objetos, este solo aumentará una vez pases al modo infinito
                    </p>
                    <Stage width={300 * scale} height={250 * scale} scaleX={scale} scaleY={scale} x={0} y={0}>
                        <Layer>
                            <Label x={0} y={0}>
                                <Rect width={220} height={150} fill="#FFF" x={70} y={5} cornerRadius={5} stroke={"black"} />
                                <Text text={"Tengo los mejores precios de la zona y la única tienda en la zona."} fill="var(--main-black)" padding={5} fontSize={26} width={220} align="center" fontFamily="Alagard" x={70} y={5} />
                                <Image image={shopManHappy} width={90} height={90} x={5} y={120} imageSmoothingEnabled={false} listening={false} />
                            </Label>
                        </Layer>
                    </Stage>
                </div>
            </div>
        </Fragment>
    );

    const slides = [slide1, slide2, slide6, slide3, slide7, slide8, slide4, slide5, slide9];
    const totalSlides = slides.length;

    const moveSlide = (direction) => {
        if (direction === 1) {
            setCurrentIndex((prev) => (prev === totalSlides - 1 ? prev : prev + 1));
        } else {
            setCurrentIndex((prev) => (prev === 0 ? prev : prev - 1));
        }
    };

    return (
        <Fragment>
            <div className="tutorial-container">
                <div className="movement-buttons">
                    {slides.map((slide, index) => {
                        return <button key={index + '-button'} className={currentIndex === index ? "movement-button active" : "movement-button"} onClick={() => { setCurrentIndex(index) }}>{index + 1}</button>
                    })}
                </div>
                <div className="tutorial-carousel">
                    <div className="carousel-inner">
                        {slides[currentIndex]}
                    </div>
                </div>
                <button className="btn-prev" onClick={() => moveSlide(-1)}>&#10094;</button>
                <button className="btn-next" onClick={() => moveSlide(1)}>&#10095;</button>


            </div>
        </Fragment>
    );
};

export default Tutorial;