import React, { Fragment, useContext, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import './GameShop.css';
import { matchContext } from "../../context/MatchProvider.jsx";
import GoldIcon from '/images/gold.webp';
import { useUser } from "../../hooks/useUser.js";
import Modifier from "../Modifier.jsx";
import ShopItemCard from "./ShopItemCard.jsx";
import ShopMan from '/images/ShopMan.webp'
import shuffle from 'lodash/shuffle';
import HeartIcon from '/images/suit_heart.webp';
import DiamonIcon from '/images/suit_diamond.webp';
import missionsCatalog from "../../assets/database/missions.json";
import { pickMissionOffers, isMissionCompleted } from "../../game/missions.js";

const GameShop = ({ gold, setGold, coinAnimation, goldAnimation, goldAnimationValue, setShopAvailable, health, maxHealth, formatedTimeRef, healthIcon, character, round, refund, boughtCards, setNewBought, membership, amego }) => {
    const { user } = useUser();
    const { t } = useTranslation('game');
    const { addCardToMatchDeck, addModifierToMatch, getRandomsModifier, getWeapon, getHealItem, activeModifiers: modifiers, activeMissions, acceptMission, claimMission, addEnemysToMatchDeck } = useContext(matchContext);

    // Diálogos del tendero (game:shop.dialogs); se elige uno al azar cada vez.
    // Es estado histórico: no cambia si se cambia el idioma a mitad de tienda.
    const pickDialog = () => shuffle(t('shop.dialogs', { returnObjects: true }))[0];

    const [dialog, setDialog] = useState(pickDialog)

    // Estado para almacenar los ítems de la tienda
    const [shopItems, setShopItems] = useState([]);

    const [hoveredIndex, setHoveredIndex] = useState(null);


    const usedGold = useRef(0);

    const [membershipAvailable, setMembershipAvailable] = useState(false);

    const calculateWeaponPrice = (valor, multiplicador, id) => {
        const timesBought = boughtCards.get(id) ?? 0; // 0 = nunca comprada
        const base = valor <= 10
            ? valor * 5
            : ((valor - 4) * 5) + ((valor >= 14 ? 15 : 10) * (valor - 8));

        const price = Math.max(10, base) * multiplicador;

        // Interés compuesto: cada compra multiplica el precio anterior por 1.25
        const finalPrice = price * Math.pow(1.25, timesBought);

        return Math.floor(finalPrice);
    };

    const calculateHealPrice = (valor, multiplicador, id) => {
        const timesBought = boughtCards.get(id) ?? 0;
        const base = valor <= 10
            ? valor * 5
            : ((valor - 4) * 5) + (10 * (valor - 8));

        const price = Math.max(10, base) * multiplicador;

        // Interés compuesto: cada compra multiplica el precio anterior por 1.25
        const finalPrice = price * Math.pow(1.25, timesBought);

        return Math.floor(finalPrice);
    };

    const calcFinalPrice = (item) => {
        if (item.isAmego) {
            return Math.floor(item.price / 2);
        }
        if (item.data.valor === 2 && membershipAvailable) {
            return 0;
        }
        return item.price;
    }



    useEffect(() => {
        const currentRound = round;
        const mods = getRandomsModifier(3, currentRound) || [];
        const items = [];

        // Multiplicador de precio corregido
        const multiplicador = currentRound > 10 ? currentRound % 10 == 0 ? Math.min(5, currentRound - 10) / 2 : Math.min(20, currentRound - 10) : 1;
        let amegoItem = null;
        if (amego) {
            amegoItem = Math.floor(Math.random() * (30));
        }

        let itemIndex = 0;


        // Misiones del cazador: aceptadas vigentes (ocupan slot hasta
        // completarse y reclamarse) + 3 ofertas frescas del catálogo.
        const isCazador = character?.habilidad_personaje?.codigo === 'cazador';
        if (isCazador) {
            const takenIds = activeMissions.map((m) => m.id);
            activeMissions
                .filter((m) => !m.claimed)
                .forEach((m) => {
                    const def = missionsCatalog.find((c) => c.id === m.id);
                    if (!def) return;
                    items.push({ id: `mis-${def.id}`, type: 'mission', data: { ...def, accepted: true, progress: m.progress }, price: 0, isBought: false });
                });
            pickMissionOffers(missionsCatalog, takenIds, 3, shuffle).forEach((m) => {
                items.push({ id: `mis-offer-${m.id}`, type: 'mission', data: { ...m, offer: true }, price: 0, isBought: false });
            });
        }

        // Agregar modificadores si existen
        mods.forEach((mod, index) => {
            if (mod) {
                itemIndex++;
                items.push({
                    id: `mod-${index}`,
                    type: 'modifier',
                    data: mod,
                    price: 75 * (mod.nivel || 1) * multiplicador,
                    isBought: false,
                    isAmego: amegoItem === itemIndex ? true : false
                });
            }
        });

        for (let valor = 2; valor <= 14; valor++) {
            const wep = getWeapon(valor);
            if (wep) {
                itemIndex++;
                items.push({
                    id: `wep-${valor}`,
                    type: 'card',
                    data: wep,
                    price: calculateWeaponPrice(wep?.valor, multiplicador, wep?.id),
                    isBought: false,
                    isAmego: amegoItem === itemIndex ? true : false
                });
            }

            const heal = getHealItem(valor);
            if (heal) {
                itemIndex++;
                items.push({
                    id: `heal-${valor}`,
                    type: 'card',
                    data: heal,
                    price: calculateHealPrice(heal?.valor, multiplicador, wep?.id),
                    isBought: false,
                    isAmego: amegoItem === itemIndex ? true : false
                });
            }
        }



        setShopItems(items);
        setMembershipAvailable(membership);
    }, [round]);

    // Misión: aceptar oferta (gratis, puede añadir enemigos) o reclamar
    // completada (suma el oro y libera el slot).
    const handleMissionAction = (index) => {
        const item = shopItems[index];
        if (!item || item.type !== 'mission') return;
        if (item.data.offer) {
            const entry = acceptMission(item.data.id);
            if (!entry) return;
            if (item.data.enemigos_extra > 0) {
                addEnemysToMatchDeck(item.data.enemigos_extra, round);
            }
            setShopItems(prev => prev.map((it, i) => i === index
                ? { ...it, data: { ...item.data, offer: false, accepted: true, progress: entry.progress } }
                : it));
        } else if (item.data.accepted) {
            const reward = claimMission(item.data.id);
            if (reward > 0) {
                coinAnimation(reward);
                setGold(prevGold => prevGold + reward);
                setShopItems(prev => prev.filter((_, i) => i !== index));
            }
        }
    };

    // Función para manejar la compra
    const handleBuyItem = (index) => {
        setDialog(pickDialog())
        const item = shopItems[index];

        // Validar si ya se compró o no hay oro suficiente
        if (item.isBought || gold < calcFinalPrice(item)) return;

        // 1. Restar el oro al jugador
        if (membershipAvailable && item.data.valor === 2) {
            setGold(prevGold => prevGold - 0);
            coinAnimation(0);
            setMembershipAvailable(false)
        } else if (item.isAmego) {
            const price = calcFinalPrice(item);
            coinAnimation((price * -1))
            setGold(prevGold => prevGold - price);
        } else {
            coinAnimation((item.price * -1))
            setGold(prevGold => prevGold - item.price);
        }

        usedGold.current += item.price;

        // 2. Añadir el ítem al jugador según su tipo
        if (item.type === 'modifier') {
            addModifierToMatch(item.data);
        } else if (item.type === 'card') {
            setNewBought(item.data)
            addCardToMatchDeck(item.data);
        }

        // 3. Marcar el ítem como comprado en la UI
        setShopItems(prevItems => {
            const newItems = [...prevItems];
            newItems[index].isBought = true;
            return newItems
        });
    };

    const closeShop = async () => {
        if (refund) {
            await setGold(prev => prev + Math.floor((usedGold.current / 10)));
        }
        setShopAvailable(false)
    }

    return (
        <Fragment>
            <div className="game-shop">
                <div className="game-hud">
                    <div className="game-hud-text">
                        <h1 className="player-health"><img src={healthIcon} alt="" />{health}/{maxHealth}</h1>
                        <h1 className="player-gold"><img src={GoldIcon} alt="" />{gold}{goldAnimation !== null ? <div className="animation-container"><strong className="animation">{goldAnimationValue}</strong><img className="animation" alt="" src={goldAnimation} /></div> : <></>}</h1>
                        {refund ? <h1 className="player-gold">{t('shop.refund', { amount: Math.floor(usedGold.current / 10) })}</h1> : <></>}
                        <h1>{t('shop.round', { round })}</h1>
                        <h2 ref={formatedTimeRef}>{t('shop.time')}</h2>
                    </div>
                    <div className="game-character">
                        <img className="character-avatar" style={{ borderColor: user?.color }} src={character?.imagen} alt={character?.nombre} />
                        <img className="character-ability available" src={character?.habilidad_personaje?.icono} style={null} alt={t('shop.abilityIconAlt')} />
                    </div>
                    <div className="extra">
                        <div className="game-modifiers">
                            {
                                modifiers.map((modifierInfo, modifierIndex) => (
                                    <Modifier key={`${modifierInfo.id}-${modifierIndex}`} modifierInfo={modifierInfo} />
                                ))
                            }
                        </div>

                    </div>
                </div>

                <div className="shop-container">
                    <div className="shop-items">
                        {shopItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`shop-item-wrapper ${item.isBought ? 'bought' : ''} ${item.type === 'mission'?'mission-item':''}`}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: item.isBought ? 0.5 : 1 }}
                            >
                                {/* Renderizado condicional según el tipo de ítem */}
                                <div className="item-display">
                                    <div className={item.type}>
                                        {item.type === 'modifier' ? (
                                            <Modifier modifierInfo={item.data} bigger={true} />
                                        ) : item.type === 'mission' ? (
                                            <div className="mission-display">
                                                <h4>{t(`shop.missions.${item.data.id}.name`)}</h4>
                                                <p>{t(`shop.missions.${item.data.id}.description`)}</p>
                                                <p className="mission-meta">
                                                    {t('shop.missionGoal', { current: item.data.accepted ? item.data.progress : 0, target: item.data.meta.objetivo })}
                                                    {' · '}{t('shop.missionDifficulty', { level: item.data.dificultad })}
                                                </p>
                                                <p className="mission-reward">{t('shop.missionReward', { gold: item.data.recompensa_oro })}</p>
                                            </div>
                                        ) : (
                                            <ShopItemCard
                                                item={item}
                                                index={index}
                                                hoveredIndex={hoveredIndex}
                                                setHoveredIndex={setHoveredIndex}
                                                DiamonIcon={DiamonIcon}
                                                HeartIcon={HeartIcon}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="item-purchase-controls" style={{ marginTop: '10px', textAlign: 'center' }}>
                                    {item.type === 'mission' ? (
                                        item.data.offer ? (
                                            <button onClick={() => handleMissionAction(index)}>
                                                {t('shop.missionAccept')}
                                            </button>
                                        ) : isMissionCompleted({ progress: item.data.progress ?? 0 }, item.data.meta) ? (
                                            <button onClick={() => handleMissionAction(index)}>
                                                {t('shop.missionClaim')}
                                            </button>
                                        ) : (
                                            <button disabled>
                                                {t('shop.missionInProgress')}
                                            </button>
                                        )
                                    ) : (
                                        <>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                                <img src={GoldIcon} alt={t('shop.goldIconAlt')} style={{ width: '16px', verticalAlign: 'middle', marginRight: '5px' }} />
                                                {membershipAvailable && item.data.valor === 2 ? " " + 0 : item.isAmego ? Math.floor(item.price / 2) : item.price}
                                                {(membershipAvailable && item.data.valor === 2) || item.isAmego && <span className="discount"> {" " + item.price + " "} </span>}
                                            </p>
                                            <button
                                                onClick={() => handleBuyItem(index)}
                                                disabled={item.isBought || gold < calcFinalPrice(item)}
                                            >
                                                {item.isBought ? t('shop.bought') : t('shop.buy')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="continue-button" style={{ marginTop: '20px' }}
                        onClick={() => {
                            closeShop()
                        }}>
                        {t('shop.continue')}
                    </button>
                </div>
                <div className="shop-man">
                    <div className="dialog">
                        <div>
                            <p>{dialog}</p>
                        </div>
                    </div>
                    <img src={ShopMan} alt="" />
                </div>
            </div>
        </Fragment>
    );
}

export default GameShop;