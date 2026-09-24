// 1. React y librerías externas (NPM)
import React, { useState, Fragment, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layer, Label, Rect, Stage, Text, Image, Group } from "react-konva";
import useImage from "use-image";

// 2. Contextos y Hooks
import { matchContext } from "../../context/MatchProvider.jsx";
import { useModifier } from "../../hooks/useModifier.js";

// 3. Componentes
import Card from "../Card.jsx";
import Modifier from "../Modifier.jsx";
import CharacterTutorial from "./CharacterTutorial.jsx";

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
import MinibossIcon from '/images/suit_miniboss.webp';

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

const getModifierEffects = (modifier) => {
    if (!modifier?.efectos) return [];

    try {
        const effects = typeof modifier.efectos === 'string'
            ? JSON.parse(modifier.efectos)
            : modifier.efectos;
        return Array.isArray(effects) ? effects : [effects];
    } catch {
        return [];
    }
};

const getModifierCategory = (modifier) => {
    const effectNames = getModifierEffects(modifier).map(effect => effect?.name);

    if (effectNames.some(name => ['user_clubs_dmg', 'user_spades_dmg', 'mma', 'critical_percentage', 'pentakill_dmg', 'blacksmith_dmg', 'tamer_dmg'].includes(name))) {
        return 'Daño';
    }
    if (effectNames.some(name => ['max_hp', 'dmg_reduction', 'lifeward', 'health_steal', 'vitamine', 'gluttony', 'grandma', 'tactical_change'].includes(name))) {
        return 'Defensa';
    }
    if (effectNames.some(name => ['gold_multiplier', 'interest', 'refund'].includes(name))) {
        return 'Economía';
    }
    if (effectNames.some(name => ['max_scapes', 'enemy_extra_dmg', 'ricochet', 'mma', 'user_clubs_dmg', 'user_spades_dmg'].includes(name))) {
        return 'Control';
    }

    return 'Otros';
};

const modifierFilters = ['Todos', 'Daño', 'Defensa', 'Economía', 'Control', 'Otros'];
const effectFilters = ['Todos', 'Enemigo', 'Arma', 'Curación'];
const effectDetails = {
    'Anticuras': { origin: 'Enemigo', timing: 'Resto de la mano', value: 'Bloquea curación' },
    'Reducción de daño': { origin: '13-Corazón', timing: 'Siguiente ataque', value: '-10 daño' },
    'Oro extra': { origin: 'Enemigo', timing: 'Al jugar la carta', value: 'Valor del enemigo' },
    'Ruleta de curación': { origin: '14-Corazón', timing: 'Al jugarla', value: '100 / 25%' },
    'Invencibilidad': { origin: '11-Diamante', timing: 'Primer ataque', value: '0 daño' },
    'Saqueo': { origin: 'Enemigo', timing: 'Al jugar la carta', value: '2× valor' },
    'Veneno': { origin: 'Enemigo', timing: '3 manos', value: '1 por turno' },
    'Curación progresiva': { origin: '12-Corazón', timing: '3 rondas', value: '10 + 3' },
    'Restaurar habilidad': { origin: '11-Corazón', timing: 'Al jugarla', value: 'Habilidad' },
    'Robo de vida': { origin: '13-Diamante', timing: 'Al derrotar', value: '1 vida' },
    'Revivir': { origin: '12-Diamante', timing: 'Al morir', value: '1 vida' },
    'Espinoso': { origin: 'Enemigo', timing: 'Al jugar la carta', value: '3 daño' },
    'Rompe Armas': { origin: 'Enemigo', timing: 'Al jugar la carta', value: 'Arma activa' },
    'Mitosis': { origin: 'Enemigo', timing: 'Al derrotar', value: '2 enemigos' },
    'Robaalmas': { origin: 'Enemigo', timing: '3 turnos', value: '-3 vida máxima' },
    'Sello Arcano': { origin: 'Enemigo', timing: '3 turnos', value: 'Habilidad bloqueada' },
    'Bloqueo': { origin: 'Enemigo', timing: 'Al huir', value: 'Permanece en mano' },
};
const simulatorEffectOptions = [
    { id: 'invincibility', label: 'Invencibilidad', description: 'El primer golpe con arma hace 0 de daño.' },
    { id: 'revive', label: 'Revivir', description: 'Si ibas a morir, sobrevives con 1 de vida.' },
    { id: 'health_steal', label: 'Robo de vida', description: 'Recuperas 1 de vida al derrotar con arma.' },
    { id: 'dmg_reduction', label: 'Reducción de daño', description: 'Resta 10 al siguiente daño enemigo.' },
];
const simulatorEnemyEffectOptions = [
    { id: 'thorny', label: 'Espinoso', description: 'El enemigo te inflige 3 de daño adicional.' },
    { id: 'poison', label: 'Veneno', description: 'Sufres 1 de daño al pasar la mano.' },
    { id: 'weapon_breaker', label: 'Rompe Armas', description: 'El enemigo destruye el arma activa.' },
    { id: 'plunder', label: 'Saqueo', description: 'Pierdes el doble del valor del enemigo en oro.' },
    { id: 'extra_gold', label: 'Oro extra', description: 'Ganas oro equivalente al valor del enemigo.' },
    { id: 'souleater', label: 'Robaalmas', description: 'Pierdes 3 de vida máxima durante 3 turnos.' },
    { id: 'antiheal', label: 'Anticuras', description: 'No puedes curarte durante el resto de la mano.' },
    { id: 'mitosis', label: 'Mitosis', description: 'Al derrotar al enemigo aparecen dos enemigos más débiles.' },
    { id: 'seal', label: 'Sello Arcano', description: 'La habilidad queda bloqueada durante 3 turnos.' },
    { id: 'blocked', label: 'Bloqueo', description: 'La carta no puede salir de la mano al huir.' },
];

const getCardEffectName = (card) => {
    if (!card?.efectos) return null;

    try {
        const effects = typeof card.efectos === 'string'
            ? JSON.parse(card.efectos)
            : card.efectos;
        const firstEffect = Array.isArray(effects) ? effects[0] : effects;
        return firstEffect?.name || null;
    } catch {
        return null;
    }
};

const cardReferenceDetails = [
    {
        type: 'Enemigo',
        icon: SpadeIcon,
        values: 'Base: 2-14',
        availability: 'Mazo inicial y nuevas rondas',
        description: 'Se juega contra el arma activa. Su valor determina el daño que recibes.',
    },
    {
        type: 'Arma',
        icon: DiamondIcon,
        values: 'Base: 2-10',
        availability: 'Valores 11-14 en tienda',
        description: 'Se coloca en la zona de equipo y reduce el daño de los enemigos.',
    },
    {
        type: 'Curación',
        icon: HeartIcon,
        values: 'Base: 2-10',
        availability: 'Valores 11-14 en tienda',
        description: 'Se juega para recuperar vida. Las cartas especiales añaden otros efectos.',
    },
    {
        type: 'Enemigo',
        icon: ClubIcon,
        values: 'Base: 2-14',
        availability: 'Mazo inicial y nuevas rondas',
        description: 'Los tréboles son enemigos monstruosos con las mismas reglas de combate.',
    },
];

const minibossDetails = [
    {
        name: 'Reina Slime',
        effect: 'Sticky',
        value: '16',
        timing: 'Cada golpe recibido',
        description: 'Reduce su valor a la mitad y crea dos slimes más débiles. La Reina Slime queda derrotada cuando llega a valor 2.',
    },
    {
        name: 'Araña gigante',
        effect: 'Telaraña',
        value: '6 por parte',
        timing: 'Al atacar una parte',
        description: 'La Araña está dividida en partes. Al eliminar una parte, no podrás huir durante 3 turnos.',
    },
    {
        name: 'Chamán demoníaco',
        effect: 'Fuerza del caos',
        value: 'Variable',
        timing: 'Cada 5 manos',
        description: 'Su valor cambia según los enemigos restantes. Si lo atacas, se elimina inmediatamente, pero puede volver a aparecer.',
    },
    {
        name: 'Reina de los Ladrones',
        effect: 'Último saqueo',
        value: '12',
        timing: 'Última mano de la ronda',
        description: 'Al derrotarla, roba el 25% de tu oro y destruye el arma utilizada para vencerla.',
    },
    {
        name: 'Rey Hada',
        effect: 'Suministros',
        value: '30',
        timing: 'Cada curación',
        description: 'Cada vez que te curas, el Rey Hada reduce tu vida máxima en 2, hasta un mínimo de 2.',
    },
    {
        name: 'Guantes',
        effect: 'Bolas de pelo',
        value: '9',
        timing: 'Última mano de la ronda',
        description: 'Cada vez que huyas, Guantes añade una carta de bola de pelo con valor 0 y un efecto aleatorio.',
    },
    {
        name: 'Bola de pelo',
        effect: 'Invocación',
        value: '0',
        timing: 'Al huir',
        description: 'No es un miniboss independiente: es una carta invocada por Guantes que puede volver a llamar a su dueño.',
    },
    {
        name: 'Mímico',
        effect: 'Camuflaje',
        value: '16 real',
        timing: 'Aparece disfrazado',
        description: 'Se hace pasar por una curación, pero su valor real es 16. Necesitarás comparar sus pistas para descubrirlo.',
    },
];

const simulatorCharacterNotes = {
    guerrero: 'A mitad de vida o menos, aumenta su daño un 50% y puede hacer huir enemigos.',
    paladin: 'Comienza con 25 de vida máxima. En cada ronda recupera 5 de vida.',
    elfo: 'Reduce el valor de dos cartas y puede huir una vez adicional.',
    mago: 'Puede ver información de las siguientes cartas y barajar el mazo.',
    apostador: 'Recibe 50 de oro al comenzar y gana 10 de oro base por enemigo derrotado con arma.',
    herrero: 'Gana 1 de daño adicional con armas y puede crear un arma durante la ronda.',
    vampiro: 'Roba vida al derrotar enemigos, con un límite máximo de 10.',
    domador: 'Gana 1 de daño adicional con armas y puede convertir enemigos en armas.',
};

const Tutorial = () => {
    const navigate = useNavigate();
    const { modifiers } = useModifier()
    const [currentIndex, setCurrentIndex] = useState(0);
    const movementButtonsRef = useRef(null);
    const { getTutorialCards, getWeapon, getHealItem, availableCharacters } = useContext(matchContext);

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
    const modificadores = Array.isArray(modifiers) ? modifiers : [];
    const [modifierFilter, setModifierFilter] = useState('Todos');
    const [effectFilter, setEffectFilter] = useState('Todos');
    const visibleModifiers = modificadores.filter(modifier =>
        modifierFilter === 'Todos' || getModifierCategory(modifier) === modifierFilter
    );

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

    useEffect(() => {
        const activeButton = movementButtonsRef.current?.querySelector('.movement-button.active');
        activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [currentIndex]);

    const slide1 = (
        <Fragment>
            <div className="slide-1 slide">
                <h1>Bienvenido a </h1>
                <img src={GameIcon} alt="Banner Menu" />
                <p>El roguelike estratégico de cartas más adictivo y difícil.</p>
            </div>
        </Fragment>
    );

    const slide2 = (
        <Fragment>
            <div className="slide-2 slide">
                <div className="container explanation-card">
                    <h1>Tu objetivo</h1>
                    <p>Te has adentrado en la mazmorra para conseguir <span>riquezas</span> y no tener que preocuparte más de ser pobre. ¿Sencillo verdad?</p>
                    <h2><strong>¡Pues no!</strong></h2>
                    <p>La ronda inicial contiene <span>44 cartas</span>: 26 enemigos, 9 armas y 9 curaciones. Para llevarte toda esa riqueza, tendrás que superar las <span>10 rondas</span> de la mazmorra.</p>
                    <p>En cada ronda aparecen más enemigos, algunos con <span>efectos especiales</span>. Cuando llegues a 0 de vida perderás; si superas la ronda 10, ganarás la partida.</p>
                </div>
            </div>
        </Fragment>
    );

    const slide3 = (
        <Fragment>
            <div className="slide-3 slide">
                <div className="slide-3-info explanation-card">
                    <h1>Cartas</h1>
                    <p>En <span>Scoundrel's Quest</span> se utilizan las cartas de la baraja de póker donde cada una tiene una función propia.</p>
                    <p>
                        Los <strong>enemigos</strong> son las picas y los tréboles. Sus valores base pueden ir del 2 al 14, aunque en rondas avanzadas su daño puede aumentar. <br />
                        Las <span>armas</span> son los diamantes y las <span style={{ color: 'var(--main-green)' }}>curaciones</span> son los corazones. Las armas y curaciones básicas tienen valores del 2 al 10.
                    </p>
                    <p>Las cartas especiales de valor 11 o superior se pueden encontrar en la tienda y tienen efectos propios.</p>
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
                                        <Text text={"Se tratan de enemigos con forma humanoide. Su valor base va del 2 al 14."} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
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
                                        <Text text={"Se tratan de enemigos monstruosos. Su valor base va del 2 al 14."} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
                                        <Image image={shopManThinking} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
                <div className="card-reference-grid" aria-label="Resumen de tipos de carta">
                    {cardReferenceDetails.map((cardDetail, index) => (
                        <article className={`card-reference-card card-reference-${index}`} key={`${cardDetail.type}-${index}`}>
                            <div className="card-reference-icon">
                                <img src={cardDetail.icon} alt={`Palo de ${cardDetail.type}`} />
                                <span>{cardDetail.type}</span>
                            </div>
                            <div className="card-reference-content">
                                <strong>{cardDetail.values}</strong>
                                <p>{cardDetail.description}</p>
                                <small>{cardDetail.availability}</small>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </Fragment>
    );


    const slide4 = (
        <Fragment>
            <div className="slide-4 slide">
                <h1>Modificadores</h1>
                <p>En tu partida irás conseguindo <span>modificadores</span> que te ayudarán a llegar lo más lejos que puedas. Al comenzar cada ronda se ofrecen <span>3 opciones</span> y puedes elegir una.</p>
                <p>También puedes comprar modificadores en la tienda. <span>Ponte encima</span> de ellos para conocer sus efectos.</p>
                <div className="tutorial-filters" role="group" aria-label="Categorías de modificadores">
                    {modifierFilters.map(filter => (
                        <button
                            className={modifierFilter === filter ? 'tutorial-filter active' : 'tutorial-filter'}
                            key={`modifier-filter-${filter}`}
                            onClick={() => setModifierFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="tutorial-modifiers">
                    {visibleModifiers.map(modifier => (
                        <div className="tutorial-modifier-item" key={modifier.id + '-modifier'}>
                            <Modifier modifierInfo={modifier} />
                            <p>{modifier.descripcion}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Fragment>
    )

    const cardsEffects = [
        { 'name': 'Anticuras', 'description': 'Durante el resto de la mano, te impide curarte.', 'image': AntihealIcon, 'target': 'Enemigo' },
        { 'name': 'Reducción de daño', 'description': 'Reduce en 10 el siguiente ataque que recibas.', 'image': DmgReductionIcon, 'target': 'Curación' },
        { 'name': 'Oro extra', 'description': 'El enemigo te da una cantidad de oro equivalente a su valor.', 'image': ExtraGoldIcon, 'target': 'Enemigo' },
        { 'name': 'Ruleta de curación', 'description': 'Cura 100 de vida, pero tiene un 25% de probabilidad de hacer el efecto contrario.', 'image': HealRouleteIcon, 'target': 'Curación' },
        { 'name': 'Invencibilidad', 'description': 'El primer ataque que recibas con este arma te hace 0 de daño.', 'image': InvincibilityIcon, 'target': 'Arma' },
        { 'name': 'Saqueo', 'description': 'El enemigo te quita una cantidad de oro equivalente al doble de su valor.', 'image': PlunderIcon, 'target': 'Enemigo' },
        { 'name': 'Veneno', 'description': 'Te causa 1 de daño al pasar de mano durante 3 turnos.', 'image': PoisonIcon, 'target': 'Enemigo' },
        { 'name': 'Curación progresiva', 'description': 'Te cura 10 de vida y después 3 por ronda durante 3 rondas.', 'image': ProgresiveHealIcon, 'target': 'Curación' },
        { 'name': 'Restaurar habilidad', 'description': 'Restaura la habilidad de tu personaje, pero no te cura.', 'image': RestoreAbilityIcon, 'target': 'Curación' },
        { 'name': 'Robo de vida', 'description': 'Robas 1 de vida a cada enemigo derrotado con este arma.', 'image': HealthStealIcon, 'target': 'Arma' },
        { 'name': 'Revivir', 'description': 'Si fueses a morir golpeando con el arma portadora del efecto, sobrevives a 1 de vida.', 'image': ReviveIcon, 'target': 'Arma' },
        { 'name': 'Espinoso', 'description': 'Recibes 3 de daño fijo.', 'image': ThornyIcon, 'target': 'Enemigo' },
        { 'name': 'Rompe Armas', 'description': 'Rompe el arma activa.', 'image': WeaponBreakerIcon, 'target': 'Enemigo' },
        { 'name': 'Mitosis', 'description': 'Al matar al enemigo, crea dos enemigos más débiles.', 'image': MitosisIcon, 'target': 'Enemigo' },
        { 'name': 'Robaalmas', 'description': 'Durante 3 turnos, pierdes 3 de vida máxima.', 'image': SouleaterIcon, 'target': 'Enemigo' },
        { 'name': 'Sello Arcano', 'description': 'Durante 3 turnos, la habilidad permanece bloqueada.', 'image': SealIcon, 'target': 'Enemigo' },
        { 'name': 'Bloqueo', 'description': 'Aunque huyas, la carta se mantendrá en la mano.', 'image': BlockedIcon, 'target': 'Enemigo' },
    ];
    const slide5 = (
        <Fragment>
            <div className="slide-5 slide">
                <h1>Efectos en las cartas</h1>
                <div className="explanation-card explanation-intro">
                    <p>Aleatoriamente, algunas cartas enemigas podrán tener <span>efectos</span>. Para contrarrestar eso, en la tienda podrás obtener cartas (<span>curaciones</span> y <span>armas</span>) con efectos únicos. Revisa dónde aparece cada efecto y cómo modifica la partida.</p>
                </div>
                <div className="tutorial-filters" role="group" aria-label="Categorías de efectos">
                    {effectFilters.map(filter => (
                        <button
                            className={effectFilter === filter ? 'tutorial-filter active' : 'tutorial-filter'}
                            key={`effect-filter-${filter}`}
                            onClick={() => setEffectFilter(filter)}
                        >
                            {filter === 'Todos' ? 'Todos' : filter === 'Enemigo' ? 'Enemigos' : `${filter}s`}
                        </button>
                    ))}
                </div>
                <div className="card-effects">
                    {
                        cardsEffects
                            .filter(effect => effectFilter === 'Todos' || effect.target === effectFilter)
                            .map((effect, index) => {
                                const details = effectDetails[effect.name] || {
                                    origin: effect.target,
                                    timing: 'Según el efecto',
                                    value: 'Variable',
                                };

                                return <div key={index} className="card-effect">
                                    <div className="effect-image">
                                        <img src={effect.image} alt={effect.name} />
                                        <p><span>{effect.target}</span></p>
                                    </div>
                                    <div className="effect-meta" aria-label={`Origen: ${details.origin}. Momento: ${details.timing}. Valor: ${details.value}.`}>
                                        <span>{details.origin}</span>
                                        <span>{details.timing}</span>
                                        <strong>{details.value}</strong>
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
                <div className="explanation-card zone-explanation">
                    <p>
                        La zona de juego se reparte en 4 partes: el <span>mazo</span>, la <span>mano</span>, la <span>zona de equipo</span> y los <span>descartes</span>.<br />
                        El <span>mazo</span> es donde se 'apilan' todas las cartas que van a verse durante la ronda. <br />
                        La <span>mano</span>, donde irán apareciendo las cartas que podrán ser <strong>enemigos</strong>, <span>armas</span> o <span style={{ color: "var(--main-green)" }}>curaciones</span> de <span>4 en 4</span>. Puedes jugarlas haciendo clic o arrastrándolas. <br />
                        La <span>zona de equipo</span>, donde se colocan las armas que protejan del daño enemigo. <br />
                        Por último, están los <span>descartes</span>, donde se quedan las cartas ya jugadas. Los enemigos derrotados volverán a aparecer en la siguiente ronda.
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
    const tutorial7Cards = getTutorialCards(7) ?? [];

    const simulatorScenarios = [
        {
            id: 'explore',
            label: 'Explorar',
            description: 'Prueba todas las cartas disponibles en el simulador.'
        },
        {
            id: 'first-weapon',
            label: 'Primer golpe',
            description: 'Coloca un arma y prueba su primer uso contra un enemigo.'
        },
        {
            id: 'strict-order',
            label: 'Orden de combate',
            description: 'Comprueba cuándo puede volver a aplicarse el arma.'
        },
        {
            id: 'without-weapon',
            label: 'Sin arma',
            description: 'Observa cuánto daño recibes cuando no tienes arma activa.'
        },
        {
            id: 'special-cards',
            label: 'Cartas especiales',
            description: 'Prueba las cartas de valor 11, 12 y 13 de la tienda.'
        }
    ];

    const getSimulatorCards = (scenarioId) => {
        const enemies = tutorial7Cards
            .filter(card => card?.palo === 'Pica' || card?.palo === 'Trebol')
            .sort((first, second) => second.valor - first.valor);
        const weaponCard = tutorial7Cards.find(card => card?.palo === 'Diamante');
        const specialCards = [
            getWeapon(11),
            getWeapon(12),
            getWeapon(13),
            getHealItem(11),
            getHealItem(12),
            getHealItem(13),
            getHealItem(14),
        ].filter(Boolean);

        if (scenarioId === 'without-weapon') {
            return [...enemies];
        }

        if (scenarioId === 'first-weapon' && weaponCard && enemies[0]) {
            return [weaponCard, enemies[0]];
        }

        if (scenarioId === 'strict-order' && weaponCard && enemies.length >= 2) {
            return [weaponCard, enemies[0], enemies[enemies.length - 1]];
        }

        if (scenarioId === 'special-cards' && specialCards.length > 0) {
            return [...specialCards.slice(0, 3), enemies[0]].filter(Boolean);
        }

        return [...tutorial7Cards];
    };

    const getSimulatorPracticePool = () => {
        const cards = [
            ...tutorial7Cards,
            getWeapon(2),
            getWeapon(4),
            getWeapon(6),
            getHealItem(2),
            getHealItem(4),
            getHealItem(6),
        ].filter(Boolean);

        return cards.map((card, index) => ({
            ...card,
            key: `practice-${index}-${card.key}`,
            efectos: null,
            especial: false,
        }));
    };

    const getSimulatorState = (scenarioId) => {
        const hand = getSimulatorCards(scenarioId);
        const handKeys = new Set(hand.map(card => card?.key));
        const deck = getSimulatorPracticePool().filter(card => !handKeys.has(card.key));
        return { hand, deck };
    };

    const [selectedScenario, setSelectedScenario] = useState('explore');
    const [simulatorCharacterCode, setSimulatorCharacterCode] = useState('');
    const [activeSimulatorEffects, setActiveSimulatorEffects] = useState([]);
    const [activeEnemyEffects, setActiveEnemyEffects] = useState([]);
    const [poisonTurns, setPoisonTurns] = useState(0);
    const [progressiveHealTurns, setProgressiveHealTurns] = useState(0);
    const [antihealActive, setAntihealActive] = useState(false);
    const [simulatorMessage, setSimulatorMessage] = useState('Elige un escenario o juega una carta para comprobar la regla.');
    const [room, setRoom] = useState(() => getSimulatorState('explore').hand);
    const [simulatorDeck, setSimulatorDeck] = useState(() => getSimulatorState('explore').deck);
    const [discardPile, setDiscardPile] = useState([]);
    const [health, setHealth] = useState(20);
    const [maxHealth, setMaxHealth] = useState(20);
    const [gold, setGold] = useState(0);
    const [healthAnimationValue, setHealthAnimationValue] = useState(null);
    const [weapon, setWeapon] = useState(null);
    const [slainMonsters, setSlainMonsters] = useState([]);
    const [canBeClicked, setCanBeClicked] = useState(true);
    const simulatorCharacter = availableCharacters?.find(
        character => character?.habilidad_personaje?.codigo === simulatorCharacterCode
    );
    const simulatorCharacterCodeValue = simulatorCharacter?.habilidad_personaje?.codigo;

    useEffect(() => {
        if (tutorial7Cards.length > 0 && room.length === 0 && weapon === null) {
            const simulatorState = getSimulatorState(selectedScenario);
            setRoom(simulatorState.hand);
            setSimulatorDeck(simulatorState.deck);
        }
    }, [tutorial7Cards.length, selectedScenario]);

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

    const refillHandFromDeck = () => {
        const cardsNeeded = Math.max(0, 4 - (room.length - 1));
        if (cardsNeeded === 0 || simulatorDeck.length === 0) return;

        const cardsToDraw = simulatorDeck.slice(0, cardsNeeded);
        setTimeout(() => {
            setSimulatorDeck(previousDeck => previousDeck.slice(cardsToDraw.length));
            setRoom(previousRoom => {
                const missingCards = Math.max(0, 4 - previousRoom.length);
                if (missingCards === 0) return previousRoom;
                return [...previousRoom, ...cardsToDraw.slice(0, missingCards)];
            });
        }, 450);
    };

    const handleWeapon = (card) => {
        const previousWeapon = weapon;
        setSimulatorMessage(`Has equipado un arma de valor ${card?.valor}.${previousWeapon ? ' La secuencia de enemigos derrotados se reinicia.' : ''}`);

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
        const lastSlainCard = slainMonsters[slainMonsters.length - 1];
        const hasWeaponBreaker = activeEnemyEffects.includes('weapon_breaker');
        const activeWeapon = hasWeaponBreaker ? null : weapon;
        const canUseWeapon = activeWeapon && (
            slainMonsters.length === 0 ||
            card?.valor < lastSlainCard?.valor
        );
        const hasInvincibility = Boolean(activeWeapon && activeSimulatorEffects.includes('invincibility'));
        const hasDamageReduction = activeSimulatorEffects.includes('dmg_reduction');
        const hasRevive = activeSimulatorEffects.includes('revive');
        const hasHealthSteal = activeSimulatorEffects.includes('health_steal');
        const hasThorny = activeEnemyEffects.includes('thorny');
        const hasPlunder = activeEnemyEffects.includes('plunder');
        const hasExtraGold = activeEnemyEffects.includes('extra_gold');
        const hasSouleater = activeEnemyEffects.includes('souleater');
        const hasMitosis = activeEnemyEffects.includes('mitosis');
        const hasSeal = activeEnemyEffects.includes('seal');
        const hasBlocked = activeEnemyEffects.includes('blocked');
        const hasPoison = poisonTurns > 0;
        const enemyDamage = Math.max(0, card?.valor - (hasDamageReduction ? 10 : 0));
        const poisonDamage = hasPoison ? 1 : 0;
        const thornyDamage = hasThorny ? 3 : 0;
        const progressiveHeal = progressiveHealTurns > 0 ? 3 : 0;
        const characterWeaponBonus = ['herrero', 'domador'].includes(simulatorCharacterCodeValue) ? 1 : 0;
        const characterDamageMultiplier = simulatorCharacterCodeValue === 'guerrero' && health <= 10 ? 1.5 : 1;
        const weaponPower = Math.floor(((activeWeapon?.valor || 0) + characterWeaponBonus) * characterDamageMultiplier);
        const isSlain = Boolean(hasInvincibility || canUseWeapon);
        const combatDamage = hasInvincibility
            ? 0
            : isSlain
                ? Math.max(0, enemyDamage - weaponPower)
                : enemyDamage;
        const finalDmg = combatDamage + poisonDamage + thornyDamage;
        const wouldDie = health - finalDmg <= 0;
        const reviveTriggered = wouldDie && hasRevive;
        const nextMaxHealth = hasSouleater ? Math.max(1, maxHealth - 3) : maxHealth;
        const nextHealthBeforeSteal = reviveTriggered
            ? 1
            : Math.max(0, health + progressiveHeal - finalDmg);
        const healthLossFromSouleater = hasSouleater && health >= maxHealth ? 3 : 0;
        const healthAfterSouleater = Math.max(0, nextHealthBeforeSteal - healthLossFromSouleater);
        const characterLifeSteal = simulatorCharacterCodeValue === 'vampiro' && canUseWeapon && !hasInvincibility
            ? Math.max(0, Math.min(10, weaponPower - card?.valor))
            : 0;
        const effectLifeSteal = hasHealthSteal && canUseWeapon && !hasInvincibility && weaponPower > card?.valor ? 1 : 0;
        const lifeStealAmount = Math.max(characterLifeSteal, effectLifeSteal);
        const finalHealth = Math.min(nextMaxHealth, healthAfterSouleater + lifeStealAmount);

        if (hasInvincibility) {
            setActiveSimulatorEffects(prev => prev.filter(effect => effect !== 'invincibility'));
            setSimulatorMessage('La invencibilidad bloquea el primer ataque: 0 de daño y el enemigo queda derrotado.');
        } else if (isSlain) {
            setSimulatorMessage(`El arma de ${weaponPower} reduce el daño de ${enemyDamage} a ${combatDamage}.`);
        } else {
            setSimulatorMessage(activeWeapon
                ? `El arma no se aplica: el último enemigo derrotado era de ${lastSlainCard?.valor} y este enemigo es de ${card?.valor}.`
                : `No tienes arma activa, así que recibes todo el daño: ${enemyDamage}.`
            );
        }

        if (hasThorny) {
            setSimulatorMessage('El enemigo tenía espinas: recibes 3 de daño adicional.');
        } else if (hasPoison) {
            setSimulatorMessage(`El veneno te causa 1 de daño. Quedan ${Math.max(0, poisonTurns - 1)} turnos.`);
        }

        if (hasSeal) {
            setSimulatorMessage('Sello Arcano: la habilidad del personaje queda bloqueada durante 3 turnos.');
        } else if (hasBlocked) {
            setSimulatorMessage('Bloqueo: aunque intentes huir, este enemigo permanece en la mano.');
        }

        if (hasWeaponBreaker && weapon) {
            moveCardToDiscard([weapon], true);
            setWeapon(null);
            setSimulatorMessage('Rompe Armas destruye el arma activa antes de resolver el combate.');
        }

        if (hasRevive && reviveTriggered) {
            setActiveSimulatorEffects(prev => prev.filter(effect => effect !== 'revive'));
            setSimulatorMessage('El ataque te habría dejado sin vida, pero revives con 1 de vida.');
        } else if (lifeStealAmount > 0) {
            setSimulatorMessage(`El arma derrota al enemigo y recuperas ${lifeStealAmount} de vida.`);
        }

        if (hasDamageReduction) {
            setActiveSimulatorEffects(prev => prev.filter(effect => effect !== 'dmg_reduction'));
        }

        if (hasPoison) {
            const remainingPoisonTurns = Math.max(0, poisonTurns - 1);
            setPoisonTurns(remainingPoisonTurns);
            if (remainingPoisonTurns === 0) {
                setActiveEnemyEffects(prev => prev.filter(effect => effect !== 'poison'));
            }
        }

        const oneShotEnemyEffects = activeEnemyEffects.filter(effect => (
            !['antiheal', 'poison'].includes(effect)
        ));
        if (oneShotEnemyEffects.length > 0) {
            setActiveEnemyEffects(prev => prev.filter(effect => !oneShotEnemyEffects.includes(effect)));
        }

        const baseGoldReward = activeWeapon && isSlain
            ? (simulatorCharacterCodeValue === 'apostador' ? 10 : 5)
            : 0;
        const specialGoldReward = hasExtraGold && isSlain ? card?.valor || 0 : 0;
        const stolenGold = hasPlunder ? (card?.valor || 0) * 2 : 0;
        const goldDelta = baseGoldReward + specialGoldReward - stolenGold;

        if (goldDelta !== 0) {
            setGold(prev => Math.max(0, prev + goldDelta));
        }

        if (hasPlunder) {
            setSimulatorMessage(`Saqueo: pierdes ${stolenGold} de oro. Ganas ${baseGoldReward} de oro base si has derrotado al enemigo con un arma.`);
        } else if (hasExtraGold && isSlain) {
            setSimulatorMessage(`Oro extra: ganas ${specialGoldReward} de oro${baseGoldReward ? ` y ${baseGoldReward} de oro base` : ''}.`);
        } else if (baseGoldReward > 0) {
            setSimulatorMessage(`Enemigo derrotado con el arma: ganas ${baseGoldReward} de oro base.`);
        }

        if (hasMitosis && isSlain) {
            const weakerValue = Math.max(2, Math.floor(card?.valor / 2));
            const firstClone = { ...card, valor: weakerValue, key: `${card.key}-mitosis-1`, efectos: null, especial: false };
            const secondClone = { ...card, valor: weakerValue, key: `${card.key}-mitosis-2`, efectos: null, especial: false };
            setRoom(prev => [...prev, firstClone, secondClone]);
        }

        if (isSlain) {
            setSlainMonsters(prev => [...prev, card]);
            deleteFromRoom(card);
        } else {
            moveCardToDiscard([card]);
        }

        if (progressiveHeal > 0) {
            setProgressiveHealTurns(remaining => Math.max(0, remaining - 1));
        }

        damageAnimation(finalDmg, !isSlain);
        setMaxHealth(nextMaxHealth);
        setHealth(finalHealth);

        return true;
    };

    const handleHealCard = (card) => {
        const effectName = getCardEffectName(card);

        if (antihealActive) {
            setSimulatorMessage('Anticuras está activo: esta curación no puede aplicarse.');
            return;
        }

        if (effectName === 'restore_ability') {
            setSimulatorMessage('Restaurar habilidad activa la habilidad del personaje, pero no recupera vida.');
        } else if (effectName === 'progresive_heal') {
            setHealth(prev => Math.min(maxHealth, prev + 10));
            setProgressiveHealTurns(3);
            setSimulatorMessage('Curación progresiva: recuperas 10 de vida ahora y 3 más en los próximos intercambios.');
        } else if (effectName === 'heal_roulete') {
            const didHeal = Math.random() > 0.25;
            const healValue = didHeal ? 100 : -100;
            setHealth(prev => Math.max(0, Math.min(maxHealth, prev + healValue)));
            setSimulatorMessage(didHeal
                ? 'Ruleta de curación: el resultado favorable recupera 100 de vida.'
                : 'Ruleta de curación: el resultado contrario causa 100 de daño.'
            );
        } else if (effectName === 'dmg_reduction') {
            setActiveSimulatorEffects(prev => [...new Set([...prev, 'dmg_reduction'])]);
            setSimulatorMessage('Reducción de daño activada: el siguiente ataque recibe una reducción de 10 puntos de daño.');
        } else {
            const healValue = card?.valor || 0;
            setHealth(prev => Math.min(maxHealth, prev + healValue));
            setSimulatorMessage(`Recuperas ${healValue} de vida.`);
        }

        moveCardToDiscard([card]);
    };

    const processCardAction = useCallback((card) => {
        setCanBeClicked(false);
        document.body.style.cursor = "url('/images/cursor/Cursor_2.webp') 16 16, auto";

        if (card?.palo === 'Diamante') {
            handleWeapon(card);
        } else if (card?.palo === 'Pica' || card?.palo === 'Trebol') {
            handleCombat(card);
        } else if (card?.palo === 'Corazon') {
            handleHealCard(card);
        }

        refillHandFromDeck();
        setTimeout(() => {
            setCanBeClicked(true);
            document.body.style.cursor = "auto";
        }, 500);
    }, [weapon, slainMonsters, health, maxHealth, antihealActive, activeSimulatorEffects, activeEnemyEffects, poisonTurns, progressiveHealTurns, simulatorCharacterCodeValue, room, simulatorDeck]);

    const toggleSimulatorEffect = (effectId) => {
        setActiveSimulatorEffects(prev => (
            prev.includes(effectId)
                ? prev.filter(effect => effect !== effectId)
                : [...prev, effectId]
        ));
    };

    const toggleSimulatorEnemyEffect = (effectId) => {
        setActiveEnemyEffects(prev => (
            prev.includes(effectId)
                ? prev.filter(effect => effect !== effectId)
                : [...prev, effectId]
        ));

        if (effectId === 'poison') {
            setPoisonTurns(prev => prev > 0 ? 0 : 3);
        }

        if (effectId === 'antiheal') {
            setAntihealActive(prev => !prev);
        }
    };

    const handleDragEnd = (card, finalX, finalY) => {
        // Las cartas de la mano viven dentro de HAND_ZONE. Konva devuelve
        // sus coordenadas locales, por lo que las convertimos a coordenadas
        // del escenario antes de comprobar la zona de equipo.
        const stageX = finalX + HAND_ZONE.x;
        const stageY = finalY + HAND_ZONE.y;
        const isOverZone =
            stageX > WEAPON_ZONE.x && stageX < WEAPON_ZONE.x + WEAPON_ZONE.width &&
            stageY > WEAPON_ZONE.y && stageY < WEAPON_ZONE.y + WEAPON_ZONE.height;
        if (isOverZone) {
            processCardAction(card);
            return true;
        }
        return false;
    };

    const handleSimulatorCharacterChange = (code) => {
        setSimulatorCharacterCode(code);

        if (!code) {
            setMaxHealth(20);
            setHealth(previousHealth => Math.min(previousHealth, 20));
            setSimulatorMessage('Se ha quitado el personaje de referencia. El simulador vuelve a sus reglas básicas.');
            return;
        }

        setMaxHealth(20);
        if (code === 'paladin') {
            setMaxHealth(25);
            setHealth(25);
            setSimulatorMessage('Vitalismo aplicado: el Paladin comienza con 25 de vida.');
        } else {
            setHealth(previousHealth => Math.min(previousHealth, 20));
            if (code === 'apostador') {
                setGold(previousGold => previousGold + 50);
                setSimulatorMessage('Apuesta Ciega aplicada: el Apostador comienza con 50 de oro y gana 10 por enemigo derrotado con arma.');
            } else {
                const character = availableCharacters?.find(item => item?.habilidad_personaje?.codigo === code);
                setSimulatorMessage(`Pasiva aplicada: ${character?.nombre || 'personaje'}. Revisa su efecto en las reglas del simulador.`);
            }
        }
    };

    const resetSimulator = (scenarioId = selectedScenario) => {
        setSelectedScenario(scenarioId);
        const simulatorState = getSimulatorState(scenarioId);
        setRoom(simulatorState.hand);
        setSimulatorDeck(simulatorState.deck);
        setWeapon(null);
        setSlainMonsters([]);
        setDiscardPile([]);
        setHealth(20);
        setMaxHealth(20);
        setGold(0);
        setHealthAnimation(null);
        setHealthAnimationValue(null);
        setCanBeClicked(true);
        setActiveSimulatorEffects([]);
        setActiveEnemyEffects([]);
        setPoisonTurns(0);
        setProgressiveHealTurns(0);
        setAntihealActive(false);
        setSimulatorCharacterCode('');
        setSimulatorMessage(
            simulatorScenarios.find(scenario => scenario.id === scenarioId)?.description ||
            'Simulador reiniciado.'
        );
    };

    const slide7 = (
        <Fragment>
            <div className="slide-7 slide">
                <div className="container explanation-card">
                    <h1>Combate</h1>
                    <p>
                        Las bases del combate en Scoundrel's Quest giran en torno al arma activa. Puedes jugar las cartas haciendo clic o arrastrándolas a la zona de equipo. <br />
                        Si <span>tienes arma</span> y <span>no has pegado aún</span> a ningún <strong>enemigo</strong>, el daño que recibirás será el valor del <strong>enemigo</strong> menos el valor del <span>arma</span>. <br />
                        Si <span>ya dispones de un arma</span> y ya la has <span>usado contra un enemigo</span>, para que el arma tenga efecto el <span>último enemigo</span> que has derrotado tiene que ser <span>mayor</span> que el que vas a derrotar a continuación. <br />
                        <span>Si no tienes ninguna arma</span> o si el enemigo que vas a golpear es <span>mayor o igual que el anterior</span>, recibirás <strong>todo el daño del enemigo</strong>. El daño nunca puede ser menor que 0.
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
                <div className="simulator-guide">
                    <p>Elige un escenario o haz clic en las cartas. El simulador te mostrará por qué se usa o no se usa el arma.</p>
                    <div className="simulator-scenarios" role="group" aria-label="Escenarios del simulador">
                        {simulatorScenarios.map(scenario => (
                            <button
                                className={selectedScenario === scenario.id ? 'simulator-scenario active' : 'simulator-scenario'}
                                key={scenario.id}
                                onClick={() => resetSimulator(scenario.id)}
                            >
                                {scenario.label}
                            </button>
                        ))}
                    </div>
                    <div className="simulator-feedback" aria-live="polite">{simulatorMessage}</div>
                    <details className="simulator-settings">
                        <summary>Ajustes del simulador</summary>
                        <div className="simulator-advanced">
                            <h3>Simulador avanzado</h3>
                            <p>Activa un efecto para comprobar cómo puede cambiar el resultado del combate. Los efectos de un solo uso se desactivan después de aplicarse.</p>
                            <div className="simulator-effect-options">
                                {simulatorEffectOptions.map(effect => (
                                    <button
                                        className={activeSimulatorEffects.includes(effect.id) ? 'simulator-effect active' : 'simulator-effect'}
                                        key={effect.id}
                                        aria-pressed={activeSimulatorEffects.includes(effect.id)}
                                        onClick={() => toggleSimulatorEffect(effect.id)}
                                        title={effect.description}
                                    >
                                        {effect.label}
                                    </button>
                                ))}
                            </div>
                            <div className="simulator-enemy-effects">
                                <h3>Efectos de enemigos</h3>
                                <p>Activa un efecto para aplicarlo al siguiente enemigo. Anticuras permanece activo hasta que lo desactives o reinicies el simulador.</p>
                                <div className="simulator-effect-options">
                                    {simulatorEnemyEffectOptions.map(effect => (
                                        <button
                                            className={activeEnemyEffects.includes(effect.id) ? 'simulator-effect active' : 'simulator-effect'}
                                            key={effect.id}
                                            aria-pressed={activeEnemyEffects.includes(effect.id)}
                                            onClick={() => toggleSimulatorEnemyEffect(effect.id)}
                                            title={effect.description}
                                        >
                                            {effect.label}
                                        </button>
                                    ))}
                                </div>
                                {poisonTurns > 0 && <p className="simulator-effect-status">Veneno activo: {poisonTurns} turnos restantes.</p>}
                                {antihealActive && <p className="simulator-effect-status">Anticuras activo: las curaciones están bloqueadas.</p>}
                            </div>
                            <div className="simulator-character">
                                <label htmlFor="tutorial-simulator-character">Personaje de referencia</label>
                                <select
                                    id="tutorial-simulator-character"
                                    value={simulatorCharacterCode}
                                    onChange={event => handleSimulatorCharacterChange(event.target.value)}
                                >
                                    <option value="">Sin personaje</option>
                                    {availableCharacters?.map(character => (
                                        <option key={character.id} value={character?.habilidad_personaje?.codigo || character.id}>
                                            {character.nombre}
                                        </option>
                                    ))}
                                </select>
                                {simulatorCharacter && (
                                    <div className="simulator-character-note">
                                        <strong>{simulatorCharacter.habilidad_personaje?.nombre}</strong>
                                        <p>{simulatorCharacterNotes[simulatorCharacter.habilidad_personaje?.codigo] || simulatorCharacter.descripcion}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </details>
                </div>
                <div className="simulator-hud">
                    <h1 className="player-health"><img src={healthIcon} />{health}/{maxHealth}{healthAnimation !== null ? <div className="animation-container"><strong className="animation" disabled={healthAnimation}>{healthAnimationValue}</strong><img className="animation" disabled={healthAnimation} src={healthAnimation} /></div> : <></>}</h1>
                    <h1 className="simulator-gold"><img src={GoldIcon} />{gold}</h1>
                </div>
                <div className="simulator-board-stats" aria-label="Estado del tablero">
                    <span>Mazo: <strong>{simulatorDeck.length}</strong></span>
                    <span>Mano: <strong>{room.length}/4</strong></span>
                    <span>Descartes: <strong>{discardPile.length}</strong></span>
                </div>
                <div>
                    <button className="reset-simulator-btn" onClick={() => resetSimulator()}>
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
                <div className="container explanation-card">
                    <h1>Tienda</h1>
                    <p>
                        Tras terminar cada ronda, aparecerá la tienda donde podrás comprar con el oro obtenido cartas de <span>curación</span>, <span>armas</span> e incluso <span>modificadores</span>. <br /> <br />
                        Obtienes <span>5 de oro <img src={GoldIcon} /></span> base cada vez que derrotas a un enemigo con tu arma. Algunos personajes y modificadores pueden aumentar esta recompensa. <br /> <br />
                        El precio de una carta aumenta cada vez que la compras de nuevo y los precios escalan especialmente al entrar en las rondas posteriores a la 10.
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

    const slide10 = (
        <div className="slide-10 slide">
            <CharacterTutorial />
        </div>
    );

    const slide11 = (
        <div className="slide-11 slide">
            <div className="explanation-card miniboss-intro">
                <p className="character-tutorial-kicker">Amenazas especiales</p>
                <h1>Minibosses</h1>
                <p>Los minibosses aparecen en momentos concretos de la partida y tienen reglas propias. No se comportan como una carta normal: lee su efecto antes de decidir cómo afrontarlos.</p>
            </div>
            <div className="miniboss-grid" aria-label="Lista de minibosses">
                {minibossDetails.map((miniboss, index) => (
                    <article className="miniboss-card" key={miniboss.name}>
                        <div className="miniboss-card-header">
                            <div className="miniboss-icon-wrap">
                                <img src={MinibossIcon} alt={`Icono de ${miniboss.name}`} />
                            </div>
                            <div>
                                <span>Miniboss {index + 1} de {minibossDetails.length}</span>
                                <h2>{miniboss.name}</h2>
                                <strong>{miniboss.effect}</strong>
                            </div>
                        </div>
                        <div className="miniboss-card-body">
                            <div className="miniboss-meta">
                                <span>Valor: {miniboss.value}</span>
                                <span>{miniboss.timing}</span>
                            </div>
                            <p>{miniboss.description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );

    const slides = [
        { id: 'welcome', label: 'Inicio', description: 'Conoce el objetivo de la mazmorra.', render: slide1 },
        { id: 'objective', label: 'Objetivo', description: 'Descubre cómo se gana y se pierde una partida.', render: slide2 },
        { id: 'zones', label: 'Zonas', description: 'Aprende para qué sirve cada zona de juego.', render: slide6 },
        { id: 'cards', label: 'Cartas', description: 'Diferencia enemigos, armas y curaciones.', render: slide3 },
        { id: 'combat', label: 'Combate', description: 'Comprende cómo se utiliza el arma activa.', render: slide7 },
        { id: 'simulator', label: 'Simulador', description: 'Practica las reglas de combate de forma interactiva.', render: slide8 },
        { id: 'characters', label: 'Personajes', description: 'Elige el estilo de juego que mejor te encaje.', render: slide10 },
        { id: 'minibosses', label: 'Minibosses', description: 'Conoce las amenazas especiales de cada ronda.', render: slide11 },
        { id: 'modifiers', label: 'Modificadores', description: 'Descubre las mejoras que pueden acompañarte.', render: slide4 },
        { id: 'effects', label: 'Efectos', description: 'Aprende los efectos de enemigos, armas y curaciones.', render: slide5 },
        { id: 'shop', label: 'Tienda', description: 'Entiende cómo convertir el oro de la ronda en mejoras.', render: slide9 },
    ];
    const totalSlides = slides.length;
    const currentSlide = slides[currentIndex];

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
                <div className="tutorial-pagination">
                        <button
                            className="btn-prev"
                            onClick={() => moveSlide(-1)}
                            disabled={currentIndex === 0}
                            aria-label={currentIndex > 0 ? `Ir a la sección anterior: ${slides[currentIndex - 1].label}` : 'No hay sección anterior'}
                        >
                            <span aria-hidden="true">←</span>
                            <span>Anterior: {currentIndex > 0 ? slides[currentIndex - 1].label : 'Inicio'}</span>
                        </button>
                        <button
                            className="btn-next"
                            onClick={() => moveSlide(1)}
                            disabled={currentIndex === totalSlides - 1}
                            aria-label={currentIndex < totalSlides - 1 ? `Ir a la sección siguiente: ${slides[currentIndex + 1].label}` : 'No hay sección siguiente'}
                        >
                            <span>Siguiente: {currentIndex < totalSlides - 1 ? slides[currentIndex + 1].label : 'Tienda'}</span>
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                <header className="tutorial-navigation">
                    <div className="tutorial-progress-label">
                        <span>Sección {currentIndex + 1} de {totalSlides}</span>
                        <strong>{currentSlide.label}</strong>
                    </div>
                    <div
                        className="tutorial-progress-track"
                        role="progressbar"
                        aria-valuemin="1"
                        aria-valuemax={totalSlides}
                        aria-valuenow={currentIndex + 1}
                        aria-label={`Progreso del tutorial: ${currentSlide.label}`}
                    >
                        <span style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }} />
                    </div>
                    <p className="tutorial-section-description">{currentSlide.description}</p>
                </header>

                <nav ref={movementButtonsRef} className="movement-buttons" aria-label="Secciones del tutorial">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            className={currentIndex === index ? "movement-button active" : "movement-button"}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Ir a ${slide.label}`}
                            aria-current={currentIndex === index ? 'page' : undefined}
                        >
                            {slide.label}
                        </button>
                    ))}
                </nav>



                <div className="tutorial-carousel">
                    <div className="carousel-inner">
                        <div className="tutorial-slide-content" key={currentSlide.id}>
                            {currentSlide.render}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Tutorial;