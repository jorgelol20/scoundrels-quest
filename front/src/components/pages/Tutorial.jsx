// 1. React y librerías externas (NPM)
import React, { useState, Fragment, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layer, Label, Rect, Stage, Text, Image, Group } from "react-konva";
import useImage from "use-image";

// 2. Contextos y Hooks
import { matchContext } from "../../context/MatchProvider.jsx";
import { useModifier } from "../../hooks/useModifier.js";
import { useScheduledTimeouts } from "../../hooks/game/useScheduledTimeouts.js";

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

// Las categorías y filtros se guardan como claves estables (traducibles) en el
// estado; sólo las etiquetas que se muestran pasan por t().
const getModifierCategory = (modifier) => {
    const effectNames = getModifierEffects(modifier).map(effect => effect?.name);

    if (effectNames.some(name => ['user_clubs_dmg', 'user_spades_dmg', 'mma', 'critical_percentage', 'pentakill_dmg', 'blacksmith_dmg', 'tamer_dmg'].includes(name))) {
        return 'damage';
    }
    if (effectNames.some(name => ['max_hp', 'dmg_reduction', 'lifeward', 'health_steal', 'vitamine', 'gluttony', 'grandma', 'tactical_change'].includes(name))) {
        return 'defense';
    }
    if (effectNames.some(name => ['gold_multiplier', 'interest', 'refund'].includes(name))) {
        return 'economy';
    }
    if (effectNames.some(name => ['max_scapes', 'enemy_extra_dmg', 'ricochet', 'mma', 'user_clubs_dmg', 'user_spades_dmg'].includes(name))) {
        return 'control';
    }

    return 'other';
};

const modifierFilters = ['all', 'damage', 'defense', 'economy', 'control', 'other'];
const effectFilters = ['all', 'enemy', 'weapon', 'heal'];
// Efectos que tienen ficha de detalle en effects.details.<id>
const effectsWithDetails = [
    'antiheal', 'dmg_reduction', 'extra_gold', 'heal_roulete', 'invincibility',
    'plunder', 'poison', 'progresive_heal', 'restore_ability', 'health_steal',
    'revive', 'thorny', 'weapon_breaker', 'mitosis', 'souleater', 'seal', 'blocked',
];
const simulatorEffectOptions = [
    'invincibility', 'revive', 'health_steal', 'dmg_reduction',
];
const simulatorEnemyEffectOptions = [
    'thorny', 'poison', 'weapon_breaker', 'plunder', 'extra_gold',
    'souleater', 'antiheal', 'mitosis', 'seal', 'blocked',
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
    { id: 'spade', icon: SpadeIcon },
    { id: 'diamond', icon: DiamondIcon },
    { id: 'heart', icon: HeartIcon },
    { id: 'club', icon: ClubIcon },
];

const minibossDetails = [
    'reina_slime',
    'arana_gigante',
    'chaman_demoniaco',
    'reina_ladrones',
    'rey_hada',
    'guantes',
    'bola_pelo',
    'mimico',
];

const Tutorial = () => {
    const { t } = useTranslation('tutorial');
    const navigate = useNavigate();
    const { modifiers } = useModifier()
    const [currentIndex, setCurrentIndex] = useState(0);
    const movementButtonsRef = useRef(null);
    const { getTutorialCards, getWeapon, getHealItem, availableCharacters } = useContext(matchContext);
    // Timers cancelables: se limpian al desmontar (evita setState tras salir del tutorial).
    const { scheduleTimeout } = useScheduledTimeouts();

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
    const [modifierFilter, setModifierFilter] = useState('all');
    const [effectFilter, setEffectFilter] = useState('all');
    const visibleModifiers = modificadores.filter(modifier =>
        modifierFilter === 'all' || getModifierCategory(modifier) === modifierFilter
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
                <h1>{t('sections.welcome.title')}{' '}</h1>
                <img src={GameIcon} alt={t('sections.welcome.bannerAlt')} />
                <p>{t('sections.welcome.subtitle')}</p>
            </div>
        </Fragment>
    );

    const slide2 = (
        <Fragment>
            <div className="slide-2 slide">
                <div className="container explanation-card">
                    <h1>{t('sections.objective.title')}</h1>
                    <p>{t('sections.objective.p1a')}<span>{t('sections.objective.p1Highlight')}</span>{t('sections.objective.p1b')}</p>
                    <h2><strong>{t('sections.objective.motto')}</strong></h2>
                    <p>{t('sections.objective.p2a')}<span>{t('sections.objective.p2Highlight1')}</span>{t('sections.objective.p2b')}<span>{t('sections.objective.p2Highlight2')}</span>{t('sections.objective.p2c')}</p>
                    <p>{t('sections.objective.p3a')}<span>{t('sections.objective.p3Highlight')}</span>{t('sections.objective.p3b')}</p>
                </div>
            </div>
        </Fragment>
    );

    const slide3 = (
        <Fragment>
            <div className="slide-3 slide">
                <div className="slide-3-info explanation-card">
                    <h1>{t('sections.cards.title')}</h1>
                    <p>{t('sections.cards.p1a')}<span>{t('sections.cards.gameName')}</span>{t('sections.cards.p1b')}</p>
                    <p>
                        {t('sections.cards.p2a')}<strong>{t('sections.cards.enemiesStrong')}</strong>{t('sections.cards.p2b')}<br />
                        {t('sections.cards.p2aWeapons')}<span>{t('sections.cards.weapons')}</span>{t('sections.cards.p2c')}<span style={{ color: 'var(--main-green)' }}>{t('sections.cards.healings')}</span>{t('sections.cards.p2d')}
                    </p>
                    <p>{t('sections.cards.p3')}</p>
                    <p><span>{t('sections.cards.hover')}</span>{t('sections.cards.p4b')}<span>{t('sections.cards.click')}</span>{t('sections.cards.p4c')}</p>
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

                                        <Text text={t('sections.cards.tooltips.food')} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={0} />
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
                                        <Text text={t('sections.cards.tooltips.weapon')} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={0} />
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
                                        <Text text={t('sections.cards.tooltips.humanoid')} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
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
                                        <Text text={t('sections.cards.tooltips.monster')} fill="var(--main-black)" padding={5} fontSize={16} width={150} align="center" fontFamily="Alagard" x={50} y={20} />
                                        <Image image={shopManThinking} width={60} height={60} x={15} y={85} imageSmoothingEnabled={false} listening={false} />
                                    </Label>
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
                <div className="card-reference-grid" aria-label={t('sections.cards.referenceAria')}>
                    {cardReferenceDetails.map((cardDetail, index) => (
                        <article className={`card-reference-card card-reference-${index}`} key={`${cardDetail.id}-${index}`}>
                            <div className="card-reference-icon">
                                <img src={cardDetail.icon} alt={t('aria.cardSuit', { type: t(`sections.cards.reference.${cardDetail.id}.type`) })} />
                                <span>{t(`sections.cards.reference.${cardDetail.id}.type`)}</span>
                            </div>
                            <div className="card-reference-content">
                                <strong>{t(`sections.cards.reference.${cardDetail.id}.values`)}</strong>
                                <p>{t(`sections.cards.reference.${cardDetail.id}.description`)}</p>
                                <small>{t(`sections.cards.reference.${cardDetail.id}.availability`)}</small>
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
                <h1>{t('sections.modifiers.title')}</h1>
                <p>{t('sections.modifiers.p1a')}<span>{t('sections.modifiers.p1Highlight1')}</span>{t('sections.modifiers.p1b')}<span>{t('sections.modifiers.p1Highlight2')}</span>{t('sections.modifiers.p1c')}</p>
                <p>{t('sections.modifiers.p2a')}<span>{t('sections.modifiers.p2Highlight')}</span>{t('sections.modifiers.p2b')}</p>
                <div className="tutorial-filters" role="group" aria-label={t('sections.modifiers.filtersAria')}>
                    {modifierFilters.map(filter => (
                        <button
                            className={modifierFilter === filter ? 'tutorial-filter active' : 'tutorial-filter'}
                            key={`modifier-filter-${filter}`}
                            onClick={() => setModifierFilter(filter)}
                        >
                            {t(`filters.modifier.${filter}`)}
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
        { 'id': 'antiheal', 'image': AntihealIcon, 'target': 'enemy' },
        { 'id': 'dmg_reduction', 'image': DmgReductionIcon, 'target': 'heal' },
        { 'id': 'extra_gold', 'image': ExtraGoldIcon, 'target': 'enemy' },
        { 'id': 'heal_roulete', 'image': HealRouleteIcon, 'target': 'heal' },
        { 'id': 'invincibility', 'image': InvincibilityIcon, 'target': 'weapon' },
        { 'id': 'plunder', 'image': PlunderIcon, 'target': 'enemy' },
        { 'id': 'poison', 'image': PoisonIcon, 'target': 'enemy' },
        { 'id': 'progresive_heal', 'image': ProgresiveHealIcon, 'target': 'heal' },
        { 'id': 'restore_ability', 'image': RestoreAbilityIcon, 'target': 'heal' },
        { 'id': 'health_steal', 'image': HealthStealIcon, 'target': 'weapon' },
        { 'id': 'revive', 'image': ReviveIcon, 'target': 'weapon' },
        { 'id': 'thorny', 'image': ThornyIcon, 'target': 'enemy' },
        { 'id': 'weapon_breaker', 'image': WeaponBreakerIcon, 'target': 'enemy' },
        { 'id': 'mitosis', 'image': MitosisIcon, 'target': 'enemy' },
        { 'id': 'souleater', 'image': SouleaterIcon, 'target': 'enemy' },
        { 'id': 'seal', 'image': SealIcon, 'target': 'enemy' },
        { 'id': 'blocked', 'image': BlockedIcon, 'target': 'enemy' },
    ];
    const slide5 = (
        <Fragment>
            <div className="slide-5 slide">
                <h1>{t('sections.effects.title')}</h1>
                <div className="explanation-card explanation-intro">
                    <p>{t('sections.effects.introA')}<span>{t('sections.effects.introHighlight')}</span>{t('sections.effects.introB')}<span>{t('sections.effects.introHealing')}</span>{t('sections.effects.introC')}<span>{t('sections.effects.introWeapons')}</span>{t('sections.effects.introD')}</p>
                </div>
                <div className="tutorial-filters" role="group" aria-label={t('sections.effects.filtersAria')}>
                    {effectFilters.map(filter => (
                        <button
                            className={effectFilter === filter ? 'tutorial-filter active' : 'tutorial-filter'}
                            key={`effect-filter-${filter}`}
                            onClick={() => setEffectFilter(filter)}
                        >
                            {t(`filters.effect.${filter}`)}
                        </button>
                    ))}
                </div>
                <div className="card-effects">
                    {
                        cardsEffects
                            .filter(effect => effectFilter === 'all' || effect.target === effectFilter)
                            .map((effect, index) => {
                                const details = effectsWithDetails.includes(effect.id)
                                    ? {
                                        origin: t(`effects.details.${effect.id}.origin`),
                                        timing: t(`effects.details.${effect.id}.timing`),
                                        value: t(`effects.details.${effect.id}.value`),
                                    }
                                    : {
                                        origin: t(`filters.targets.${effect.target}`),
                                        timing: t('effects.fallbackTiming'),
                                        value: t('effects.fallbackValue'),
                                    };

                                return <div key={index} className="card-effect">
                                    <div className="effect-image">
                                        <img src={effect.image} alt={t(`effects.items.${effect.id}.name`)} />
                                        <p><span>{t(`filters.targets.${effect.target}`)}</span></p>
                                    </div>
                                    <div className="effect-meta" aria-label={t('aria.effectMeta', details)}>
                                        <span>{details.origin}</span>
                                        <span>{details.timing}</span>
                                        <strong>{details.value}</strong>
                                    </div>
                                    <div className="effect-text">
                                        <div className="effect-name">
                                            <h1>{t(`effects.items.${effect.id}.name`)}</h1>
                                        </div>
                                        <div className="effect-description">
                                            <p>{t(`effects.items.${effect.id}.description`)}</p>
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
                <h1>{t('sections.zones.title')}</h1>
                <div className="explanation-card zone-explanation">
                    <p>
                        {t('sections.zones.z1')}<span>{t('sections.zones.zMazo')}</span>{t('sections.zones.z2')}<span>{t('sections.zones.zMano')}</span>{t('sections.zones.z3')}<span>{t('sections.zones.zZona')}</span>{t('sections.zones.z4')}<span>{t('sections.zones.zDescartes')}</span>{t('sections.zones.z5')}<br />
                        {t('sections.zones.z6')}<span>{t('sections.zones.zMazo2')}</span>{t('sections.zones.z7')}<br />
                        {t('sections.zones.z8')}<span>{t('sections.zones.zMano2')}</span>{t('sections.zones.z9')}<strong>{t('sections.zones.zEnemigos')}</strong>{t('sections.zones.z10')}<span>{t('sections.zones.zArmas')}</span>{t('sections.zones.z11')}<span style={{ color: "var(--main-green)" }}>{t('sections.zones.zCuraciones')}</span>{t('sections.zones.z12')}<span>{t('sections.zones.zCuatro')}</span>{t('sections.zones.z13')}<br />
                        {t('sections.zones.z14')}<span>{t('sections.zones.zZona2')}</span>{t('sections.zones.z15')}<br />
                        {t('sections.zones.z16')}<span>{t('sections.zones.zDescartes2')}</span>{t('sections.zones.z17')}
                    </p>
                </div>
                <Stage width={765 * scale} height={400 * scale} scaleX={scale} scaleY={scale} y={20 * scale / 20}>
                    <Layer>
                        {/* ZONA DEL MAZO */}
                        <Group x={DUNGEON_ZONE.x} y={DUNGEON_ZONE.y}>
                            <Rect width={DUNGEON_ZONE.width} height={DUNGEON_ZONE.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text={t('sections.zones.dungeon')} rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={25} x={35} />
                        </Group>
                        <Group x={DISCARD_ZONE.x} y={DISCARD_ZONE.y}>
                            <Rect width={DISCARD_ZONE.width} height={DISCARD_ZONE.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text={t('sections.zones.discard')} rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={WEAPON_ZONE.height * 0.05} x={WEAPON_ZONE.width * 0.08} />
                        </Group>
                        <Group x={WEAPON_ZONE.x} y={WEAPON_ZONE.y}>
                            <Rect width={WEAPON_ZONE.width} height={WEAPON_ZONE.height} fill="#6a9c476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text={t('sections.zones.weaponZone')} fontFamily="Alagard" fontSize={40} fill="white" y={WEAPON_ZONE.height * 0.4} x={WEAPON_ZONE.width * 0.12} />
                        </Group>
                        <Group x={HAND_ZONE.x} y={HAND_ZONE.y}>
                            <Rect width={HAND_ZONE.width} height={HAND_ZONE.height} fill="#90c0ff50" stroke="white" strokeWidth={2} cornerRadius={8} />
                            <Text text={t('sections.zones.hand')} fontFamily="Alagard" fontSize={40} fill="white" y={HAND_ZONE.height * 0.4} x={HAND_ZONE.width * 0.35} />
                        </Group>
                    </Layer>
                </Stage>


            </div>
        </Fragment>
    )
    const tutorial7Cards = getTutorialCards(7) ?? [];

    const simulatorScenarios = [
        'explore',
        'first_weapon',
        'strict_order',
        'without_weapon',
        'special_cards',
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

        if (scenarioId === 'without_weapon') {
            return [...enemies];
        }

        if (scenarioId === 'first_weapon' && weaponCard && enemies[0]) {
            return [weaponCard, enemies[0]];
        }

        if (scenarioId === 'strict_order' && weaponCard && enemies.length >= 2) {
            return [weaponCard, enemies[0], enemies[enemies.length - 1]];
        }

        if (scenarioId === 'special_cards' && specialCards.length > 0) {
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
    const [simulatorMessage, setSimulatorMessage] = useState(() => t('simulator.initialMessage'));
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

        scheduleTimeout(() => {
            setHealthAnimation(null);
        }, 300);
    }

    const moveCardToDiscard = (cardsToMove, moved = false) => {
        scheduleTimeout(() => {
            setDiscardPile(prev => [...prev, ...cardsToMove]);
            setRoom(prev => prev.filter(c => !cardsToMove.find(moved => moved.key === c.key)));
        }, 200);
    };

    const refillHandFromDeck = () => {
        const cardsNeeded = Math.max(0, 4 - (room.length - 1));
        if (cardsNeeded === 0 || simulatorDeck.length === 0) return;

        const cardsToDraw = simulatorDeck.slice(0, cardsNeeded);
        scheduleTimeout(() => {
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
        setSimulatorMessage(t('simulator.messages.equipWeapon', {
            value: card?.valor,
            suffix: previousWeapon ? t('simulator.messages.equipWeaponReset') : '',
        }));

        if (weapon) {
            moveCardToDiscard([weapon], true);
            scheduleTimeout(() => {
                setWeapon(card);
                deleteFromRoom(card);
            }, 100);
        } else {
            setWeapon(card);
            deleteFromRoom(card);
        }

        if (slainMonsters.length > 0) {
            moveCardToDiscard([...slainMonsters], true);
            scheduleTimeout(() => {
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
            setSimulatorMessage(t('simulator.messages.invincibility'));
        } else if (isSlain) {
            setSimulatorMessage(t('simulator.messages.weaponReduced', { weaponPower, enemyDamage, combatDamage }));
        } else {
            setSimulatorMessage(activeWeapon
                ? t('simulator.messages.weaponNotApplied', { lastValue: lastSlainCard?.valor, value: card?.valor })
                : t('simulator.messages.noWeapon', { enemyDamage })
            );
        }

        if (hasThorny) {
            setSimulatorMessage(t('simulator.messages.thorny'));
        } else if (hasPoison) {
            setSimulatorMessage(t('simulator.messages.poison', { turns: Math.max(0, poisonTurns - 1) }));
        }

        if (hasSeal) {
            setSimulatorMessage(t('simulator.messages.seal'));
        } else if (hasBlocked) {
            setSimulatorMessage(t('simulator.messages.blocked'));
        }

        if (hasWeaponBreaker && weapon) {
            moveCardToDiscard([weapon], true);
            setWeapon(null);
            setSimulatorMessage(t('simulator.messages.weaponBreaker'));
        }

        if (hasRevive && reviveTriggered) {
            setActiveSimulatorEffects(prev => prev.filter(effect => effect !== 'revive'));
            setSimulatorMessage(t('simulator.messages.revive'));
        } else if (lifeStealAmount > 0) {
            setSimulatorMessage(t('simulator.messages.lifeSteal', { amount: lifeStealAmount }));
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
            setSimulatorMessage(t('simulator.messages.plunder', { stolen: stolenGold, base: baseGoldReward }));
        } else if (hasExtraGold && isSlain) {
            setSimulatorMessage(t('simulator.messages.extraGold', {
                special: specialGoldReward,
                suffix: baseGoldReward ? t('simulator.messages.extraGoldBase', { base: baseGoldReward }) : '',
            }));
        } else if (baseGoldReward > 0) {
            setSimulatorMessage(t('simulator.messages.baseGold', { base: baseGoldReward }));
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
            setSimulatorMessage(t('simulator.messages.antiheal'));
            return;
        }

        if (effectName === 'restore_ability') {
            setSimulatorMessage(t('simulator.messages.restoreAbility'));
        } else if (effectName === 'progresive_heal') {
            setHealth(prev => Math.min(maxHealth, prev + 10));
            setProgressiveHealTurns(3);
            setSimulatorMessage(t('simulator.messages.progresiveHeal'));
        } else if (effectName === 'heal_roulete') {
            const didHeal = Math.random() > 0.25;
            const healValue = didHeal ? 100 : -100;
            setHealth(prev => Math.max(0, Math.min(maxHealth, prev + healValue)));
            setSimulatorMessage(didHeal
                ? t('simulator.messages.rouleteGood')
                : t('simulator.messages.rouleteBad')
            );
        } else if (effectName === 'dmg_reduction') {
            setActiveSimulatorEffects(prev => [...new Set([...prev, 'dmg_reduction'])]);
            setSimulatorMessage(t('simulator.messages.dmgReduction'));
        } else {
            const healValue = card?.valor || 0;
            setHealth(prev => Math.min(maxHealth, prev + healValue));
            setSimulatorMessage(t('simulator.messages.heal', { value: healValue }));
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
        scheduleTimeout(() => {
            setCanBeClicked(true);
            document.body.style.cursor = "auto";
        }, 500);
    }, [t, weapon, slainMonsters, health, maxHealth, antihealActive, activeSimulatorEffects, activeEnemyEffects, poisonTurns, progressiveHealTurns, simulatorCharacterCodeValue, room, simulatorDeck]);

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
            setSimulatorMessage(t('simulator.messages.characterRemoved'));
            return;
        }

        setMaxHealth(20);
        if (code === 'paladin') {
            setMaxHealth(25);
            setHealth(25);
            setSimulatorMessage(t('simulator.messages.paladin'));
        } else {
            setHealth(previousHealth => Math.min(previousHealth, 20));
            if (code === 'apostador') {
                setGold(previousGold => previousGold + 50);
                setSimulatorMessage(t('simulator.messages.gambler'));
            } else {
                const character = availableCharacters?.find(item => item?.habilidad_personaje?.codigo === code);
                setSimulatorMessage(t('simulator.messages.passiveApplied', {
                    name: character?.nombre || t('simulator.messages.genericCharacter'),
                }));
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
            simulatorScenarios.includes(scenarioId)
                ? t(`simulator.scenarios.${scenarioId}.description`)
                : t('simulator.messages.resetFallback')
        );
    };

    const slide7 = (
        <Fragment>
            <div className="slide-7 slide">
                <div className="container explanation-card">
                    <h1>{t('sections.combat.title')}</h1>
                    <p>
                        {t('sections.combat.c1')}<br />
                        {t('sections.combat.cSi1')}<span>{t('sections.combat.haveWeapon')}</span>{t('sections.combat.c2')}<span>{t('sections.combat.notHitYet')}</span>{t('sections.combat.c3')}<strong>{t('sections.combat.enemyS1')}</strong>{t('sections.combat.c4')}<strong>{t('sections.combat.enemyS2')}</strong>{t('sections.combat.c5')}<span>{t('sections.combat.weaponS')}</span>{t('sections.combat.c6')}<br />
                        <span>{t('sections.combat.alreadyHave')}</span>{t('sections.combat.c7')}<span>{t('sections.combat.usedAgainst')}</span>{t('sections.combat.c8')}<span>{t('sections.combat.lastEnemy')}</span>{t('sections.combat.c9')}<span>{t('sections.combat.greater')}</span>{t('sections.combat.c10')}<br />
                        <span>{t('sections.combat.noWeapon')}</span>{t('sections.combat.c11')}<span>{t('sections.combat.greaterEqual')}</span>{t('sections.combat.c12')}<strong>{t('sections.combat.allDamage')}</strong>{t('sections.combat.c13')}
                    </p>
                    <p>{t('sections.combat.p2a')}<span>{t('sections.combat.simHighlight')}</span>{t('sections.combat.p2b')}</p>
                </div>
            </div>
        </Fragment>
    );

    const slide8 = (
        <Fragment>
            <div className="slide-8 slide">
                <h1>{t('simulator.title')}</h1>
                <div className="simulator-guide">
                    <p>{t('simulator.guide')}</p>
                    <div className="simulator-scenarios" role="group" aria-label={t('simulator.scenariosAria')}>
                        {simulatorScenarios.map(scenario => (
                            <button
                                className={selectedScenario === scenario ? 'simulator-scenario active' : 'simulator-scenario'}
                                key={scenario}
                                onClick={() => resetSimulator(scenario)}
                            >
                                {t(`simulator.scenarios.${scenario}.label`)}
                            </button>
                        ))}
                    </div>
                    <div className="simulator-feedback" aria-live="polite">{simulatorMessage}</div>
                    <details className="simulator-settings">
                        <summary>{t('simulator.settingsSummary')}</summary>
                        <div className="simulator-advanced">
                            <h3>{t('simulator.advancedTitle')}</h3>
                            <p>{t('simulator.advancedText')}</p>
                            <div className="simulator-effect-options">
                                {simulatorEffectOptions.map(effect => (
                                    <button
                                        className={activeSimulatorEffects.includes(effect) ? 'simulator-effect active' : 'simulator-effect'}
                                        key={effect}
                                        aria-pressed={activeSimulatorEffects.includes(effect)}
                                        onClick={() => toggleSimulatorEffect(effect)}
                                        title={t(`simulator.effectOptions.${effect}.description`)}
                                    >
                                        {t(`simulator.effectOptions.${effect}.label`)}
                                    </button>
                                ))}
                            </div>
                            <div className="simulator-enemy-effects">
                                <h3>{t('simulator.enemyEffectsTitle')}</h3>
                                <p>{t('simulator.enemyEffectsText')}</p>
                                <div className="simulator-effect-options">
                                    {simulatorEnemyEffectOptions.map(effect => (
                                        <button
                                            className={activeEnemyEffects.includes(effect) ? 'simulator-effect active' : 'simulator-effect'}
                                            key={effect}
                                            aria-pressed={activeEnemyEffects.includes(effect)}
                                            onClick={() => toggleSimulatorEnemyEffect(effect)}
                                            title={t(`simulator.enemyEffectOptions.${effect}.description`)}
                                        >
                                            {t(`simulator.enemyEffectOptions.${effect}.label`)}
                                        </button>
                                    ))}
                                </div>
                                {poisonTurns > 0 && <p className="simulator-effect-status">{t('simulator.poisonStatus', { turns: poisonTurns })}</p>}
                                {antihealActive && <p className="simulator-effect-status">{t('simulator.antihealStatus')}</p>}
                            </div>
                            <div className="simulator-character">
                                <label htmlFor="tutorial-simulator-character">{t('simulator.characterLabel')}</label>
                                <select
                                    id="tutorial-simulator-character"
                                    value={simulatorCharacterCode}
                                    onChange={event => handleSimulatorCharacterChange(event.target.value)}
                                >
                                    <option value="">{t('simulator.noCharacter')}</option>
                                    {availableCharacters?.map(character => (
                                        <option key={character.id} value={character?.habilidad_personaje?.codigo || character.id}>
                                            {character.nombre}
                                        </option>
                                    ))}
                                </select>
                                {simulatorCharacter && (
                                    <div className="simulator-character-note">
                                        <strong>{simulatorCharacter.habilidad_personaje?.nombre}</strong>
                                        <p>
                                            {t(`characters.strategies.${simulatorCharacter.habilidad_personaje?.codigo}`, {
                                                defaultValue: simulatorCharacter.descripcion,
                                            })}
                                        </p>
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
                <div className="simulator-board-stats" aria-label={t('simulator.boardAria')}>
                    <span>{t('simulator.board.deck')}<strong>{simulatorDeck.length}</strong></span>
                    <span>{t('simulator.board.hand')}<strong>{room.length}/4</strong></span>
                    <span>{t('simulator.board.discard')}<strong>{discardPile.length}</strong></span>
                </div>
                <div>
                    <button className="reset-simulator-btn" onClick={() => resetSimulator()}>
                        {t('simulator.reset')}
                    </button>
                    <Stage width={1200 * scale} height={550 * scale} scaleX={scale * 1.5} scaleY={scale * 1.5} y={30 * scale / 30}>
                        <Layer>
                            {/* ZONA DEL MAZO */}
                            <Group x={DUNGEON_ZONE.x} y={DUNGEON_ZONE.y}>
                                <Rect width={DUNGEON_ZONE.width} height={DUNGEON_ZONE.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text={t('sections.zones.dungeon')} rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={25} x={35} />
                            </Group>

                            {/* DESCARTES */}
                            <Group x={DISCARD_ZONE.x} y={DISCARD_ZONE.y}>
                                <Rect width={DISCARD_ZONE.width} height={DISCARD_ZONE.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
                                <Text text={t('sections.zones.discard')} rotation={55} fontFamily="Alagard" fontSize={20} fill="white" y={WEAPON_ZONE.height * 0.05} x={WEAPON_ZONE.width * 0.08} />
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
                                <Text text={t('sections.zones.weaponZone')} fontFamily="Alagard" fontSize={40} fill="white" y={WEAPON_ZONE.height * 0.4} x={WEAPON_ZONE.width * 0.12} />
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
                                <Text text={t('sections.zones.hand')} fontFamily="Alagard" fontSize={40} fill="white" y={HAND_ZONE.height * 0.4} x={HAND_ZONE.width * 0.35} />
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
                                <Text text={t('simulator.reloadHint')} fill="var(--main-black)" padding={5} fontSize={24} width={150} align="center" fontFamily="Alagard" x={40} y={175} />
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
                    <h1>{t('sections.shop.title')}</h1>
                    <p>
                        {t('sections.shop.p1a')}<span>{t('sections.shop.healing')}</span>{t('sections.shop.p1b')}<span>{t('sections.shop.weapons')}</span>{t('sections.shop.p1c')}<span>{t('sections.shop.modifiers')}</span>{t('sections.shop.p1d')} <br /> <br />
                        {t('sections.shop.p2a')}<span>{t('sections.shop.goldReward')}<img src={GoldIcon} /></span>{t('sections.shop.p2b')} <br /> <br />
                        {t('sections.shop.p3')}
                    </p>
                    <Stage width={300 * scale} height={250 * scale} scaleX={scale} scaleY={scale} x={0} y={0}>
                        <Layer>
                            <Label x={0} y={0}>
                                <Rect width={220} height={150} fill="#FFF" x={70} y={5} cornerRadius={5} stroke={"black"} />
                                <Text text={t('sections.shop.shopmanQuote')} fill="var(--main-black)" padding={5} fontSize={26} width={220} align="center" fontFamily="Alagard" x={70} y={5} />
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
                <p className="character-tutorial-kicker">{t('minibosses.kicker')}</p>
                <h1>{t('minibosses.title')}</h1>
                <p>{t('minibosses.intro')}</p>
            </div>
            <div className="miniboss-grid" aria-label={t('minibosses.listAria')}>
                {minibossDetails.map((miniboss, index) => (
                    <article className="miniboss-card" key={miniboss}>
                        <div className="miniboss-card-header">
                            <div className="miniboss-icon-wrap">
                                <img src={MinibossIcon} alt={t('aria.minibossIcon', { name: t(`minibosses.list.${miniboss}.name`) })} />
                            </div>
                            <div>
                                <span>{t('minibosses.counter', { index: index + 1, total: minibossDetails.length })}</span>
                                <h2>{t(`minibosses.list.${miniboss}.name`)}</h2>
                                <strong>{t(`minibosses.list.${miniboss}.effect`)}</strong>
                            </div>
                        </div>
                        <div className="miniboss-card-body">
                            <div className="miniboss-meta">
                                <span>{t('minibosses.valueLabel', { value: t(`minibosses.list.${miniboss}.value`) })}</span>
                                <span>{t(`minibosses.list.${miniboss}.timing`)}</span>
                            </div>
                            <p>{t(`minibosses.list.${miniboss}.description`)}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );

    const slides = [
        { id: 'welcome', render: slide1 },
        { id: 'objective', render: slide2 },
        { id: 'zones', render: slide6 },
        { id: 'cards', render: slide3 },
        { id: 'combat', render: slide7 },
        { id: 'simulator', render: slide8 },
        { id: 'characters', render: slide10 },
        { id: 'minibosses', render: slide11 },
        { id: 'modifiers', render: slide4 },
        { id: 'effects', render: slide5 },
        { id: 'shop', render: slide9 },
    ];
    const totalSlides = slides.length;
    const currentSlide = slides[currentIndex];
    const slideLabel = (id) => t(`slides.${id}.label`);
    const currentSlideLabel = slideLabel(currentSlide.id);
    const prevSlide = currentIndex > 0 ? slides[currentIndex - 1] : null;
    const nextSlide = currentIndex < totalSlides - 1 ? slides[currentIndex + 1] : null;

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
                            aria-label={prevSlide ? t('nav.prevAria', { label: slideLabel(prevSlide.id) }) : t('nav.prevEmpty')}
                        >
                            <span aria-hidden="true">←</span>
                            <span>{t('nav.prev', { label: prevSlide ? slideLabel(prevSlide.id) : slideLabel('welcome') })}</span>
                        </button>
                        <button
                            className="btn-next"
                            onClick={() => moveSlide(1)}
                            disabled={currentIndex === totalSlides - 1}
                            aria-label={nextSlide ? t('nav.nextAria', { label: slideLabel(nextSlide.id) }) : t('nav.nextEmpty')}
                        >
                            <span>{t('nav.next', { label: nextSlide ? slideLabel(nextSlide.id) : slideLabel('shop') })}</span>
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                <header className="tutorial-navigation">
                    <div className="tutorial-progress-label">
                        <span>{t('nav.section', { current: currentIndex + 1, total: totalSlides })}</span>
                        <strong>{currentSlideLabel}</strong>
                    </div>
                    <div
                        className="tutorial-progress-track"
                        role="progressbar"
                        aria-valuemin="1"
                        aria-valuemax={totalSlides}
                        aria-valuenow={currentIndex + 1}
                        aria-label={t('nav.progressAria', { label: currentSlideLabel })}
                    >
                        <span style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }} />
                    </div>
                    <p className="tutorial-section-description">{t(`slides.${currentSlide.id}.description`)}</p>
                </header>

                <nav ref={movementButtonsRef} className="movement-buttons" aria-label={t('nav.navAria')}>
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            className={currentIndex === index ? "movement-button active" : "movement-button"}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={t('nav.goTo', { label: slideLabel(slide.id) })}
                            aria-current={currentIndex === index ? 'page' : undefined}
                        >
                            {slideLabel(slide.id)}
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