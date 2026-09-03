import React, { Fragment, useContext, useState, useEffect, useRef } from "react";
import './GameShop.css';
import { matchContext } from "../../context/MatchProvider.jsx";
import GoldIcon from '/images/gold.webp';
import { useUser } from "../../hooks/useUser.js";
import Card from "../Card.jsx";
import Modifier from "../Modifier.jsx";
import { Stage, Layer, Group, Label, Tag, Text, Rect } from 'react-konva';
import ShopMan from '/images/ShopMan.webp'
import Dialogs from '../../assets/database/dialogs.json'
import lodash from 'lodash';
import HeartIcon from '/images/suit_heart.webp';
import DiamonIcon from '/images/suit_diamond.webp';

const GameShop = ({ gold, setGold, setShopAvailable, health, maxHealth, formatedTimeRef, healthIcon, character, round, refund }) => {
    const { user } = useUser();
    const { addCardToMatchDeck, addModifierToMatch, getRandomsModifier, getWeapon, getHealItem, activeModifiers: modifiers, } = useContext(matchContext);

    const dialogs = Dialogs;

    const [dialog, setDialog] = useState(lodash.shuffle(dialogs)[0])

    // Estado para almacenar los ítems de la tienda
    const [shopItems, setShopItems] = useState([]);

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const usedGold = useRef(0);

    const calculateWeaponPrice = (valor, multiplicador) => {
        const base = valor <= 10
            ? valor * 5
            : ((valor - 4) * 5) + (5 * (valor - 8));

        return Math.floor(Math.max(10, base) * multiplicador);
    };

    const calculateHealPrice = (valor, multiplicador) => {
        const base = valor <= 10
            ? valor * 5
            : ((valor - 4) * 5) + (10 * (valor - 8));

        return Math.floor(Math.max(10, base) * multiplicador);
    };


    useEffect(() => {
        const currentRound = round;
        const mods = getRandomsModifier(3, currentRound) || [];
        const items = [];

        // Multiplicador de precio corregido
        const multiplicador = currentRound > 10 ? currentRound % 10 == 0 ? Math.min(5, currentRound - 10) / 2 : Math.min(20, currentRound - 10) : 1;

        // Agregar modificadores si existen
        mods.forEach((mod, index) => {
            if (mod) {
                items.push({
                    id: `mod-${index}`,
                    type: 'modifier',
                    data: mod,
                    price: 50 * (mod.nivel || 1) * multiplicador,
                    isBought: false
                });
            }
        });

        for (let valor = 2; valor <= 14; valor++) {
            const wep = getWeapon(valor);
            if (wep) {
                items.push({
                    id: `wep-${valor}`,
                    type: 'card',
                    data: wep,
                    price: calculateWeaponPrice(wep?.valor, multiplicador),
                    isBought: false
                });
            }

            const heal = getHealItem(valor);
            if (heal) {
                items.push({
                    id: `heal-${valor}`,
                    type: 'card',
                    data: heal,
                    price: calculateHealPrice(heal?.valor, multiplicador),
                    isBought: false
                });
            }
        }

        setShopItems(items);
    }, [round]);

    const [scale, setScale] = useState(window.innerWidth / 1920)
    const [scaleMultiplier, setScaleMultiplier] = useState(1.2)


    useEffect(() => {
        const handleResize = () => {
            setScale(window.innerWidth / 1920)
            if (window.innerWidth <= 1080) {
                setScaleMultiplier(2)
            } else {
                setScaleMultiplier(1)
            }
        };
        window.addEventListener('resize', handleResize);
        if (window.innerWidth <= 1080) {
            setScaleMultiplier(2)
        } else {
            setScaleMultiplier(1)
        }
        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, []);

    // Función para manejar la compra
    const handleBuyItem = (index) => {
        setDialog(lodash.shuffle(dialogs)[0])
        const item = shopItems[index];

        // Validar si ya se compró o no hay oro suficiente
        if (item.isBought || gold < item.price) return;

        // 1. Restar el oro al jugador
        setGold(prevGold => prevGold - item.price);

        usedGold.current += item.price;

        // 2. Añadir el ítem al jugador según su tipo
        if (item.type === 'modifier') {
            addModifierToMatch(item.data);
        } else if (item.type === 'card') {
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
            console.log(refund)
            console.log(usedGold.current)
            await setGold(prev => prev + Math.floor((usedGold.current / 10)));
        }
        setShopAvailable(false)
    }

    return (
        <Fragment>
            <div className="game-shop">
                <div className="game-hud">
                    <div className="game-hud-text">
                        <h1 className="player-health"><img src={healthIcon} />{health}/{maxHealth}</h1>
                        <h1 className="player-gold"><img src={GoldIcon} />{gold}</h1>
                        {refund?<h1 className="player-gold">Reembolso: {Math.floor(usedGold.current / 10)}</h1>:<></>}
                        <h1>RONDA {round}</h1>
                        <h2 ref={formatedTimeRef}>Tiempo: 00:00</h2>
                    </div>
                    <div className="game-character">
                        <img className="character-avatar" style={{ borderColor: user.color }} src={character?.imagen} alt={character?.nombre} />
                        <img className="character-ability available" src={character?.habilidad_personaje?.icono} style={null} />
                    </div>
                    <div className="extra">
                        <div className="game-modifiers">
                            {
                                modifiers.map((modifierInfo) => (
                                    <Modifier key={crypto.randomUUID()} modifierInfo={modifierInfo} />
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
                                className={`shop-item-wrapper ${item.isBought ? 'bought' : ''}`}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: item.isBought ? 0.5 : 1 }}
                            >
                                {/* Renderizado condicional según el tipo de ítem */}
                                <div className="item-display">
                                    <div className={item.type}>
                                        {item.type === 'modifier' ? (
                                            <Modifier modifierInfo={item.data} bigger={true} />
                                        ) : (
                                            <Stage width={250 * scale * scaleMultiplier} height={180 * scale * scaleMultiplier} s scaleX={scale * scaleMultiplier} scaleY={scale * scaleMultiplier}>
                                                <Layer>
                                                    <Group
                                                        onMouseOver={() => item.data.efectos ? setHoveredIndex(index) : null}
                                                        onMouseLeave={() => item.data.efectos ? setHoveredIndex(null) : null}
                                                        onTap={() => item.data.efectos ? hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(index) : null}
                                                    >
                                                        <Card
                                                            cardInfo={item?.data}
                                                            x={55}
                                                            y={0}
                                                            isDraggable={false}
                                                            cardSuit={item?.palo == "Diamante" ? DiamonIcon : HeartIcon}
                                                        />


                                                        {/* Ventana emergente simple */}
                                                        {hoveredIndex === index && item.data.efectos && (
                                                            <Label x={0} y={0}>

                                                                <Rect
                                                                    width={150}
                                                                    height={90}
                                                                    fill="#685a5a"
                                                                    x={40}
                                                                    y={0}
                                                                    cornerRadius={5}
                                                                    stroke={"black"}
                                                                />
                                                                <Text
                                                                    text={item.data.efectos[0].description}
                                                                    fill="white"
                                                                    padding={5}
                                                                    fontSize={16}
                                                                    width={150}
                                                                    align="center"
                                                                    fontFamily="Alagard"
                                                                    x={40}
                                                                    y={0}
                                                                />
                                                            </Label>
                                                        )}
                                                    </Group>
                                                </Layer>
                                            </Stage>
                                        )}
                                    </div>
                                </div>
                                <div className="item-purchase-controls" style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                        <img src={GoldIcon} alt="Oro" style={{ width: '16px', verticalAlign: 'middle', marginRight: '5px' }} />
                                        {item.price}
                                    </p>
                                    <button
                                        onClick={() => handleBuyItem(index)}
                                        disabled={item.isBought || gold < item.price}
                                    >
                                        {item.isBought ? 'Comprado' : 'Comprar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="continue-button" style={{ marginTop: '20px' }}
                        onClick={() => {
                                closeShop()
                        }}>
                        Seguir
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