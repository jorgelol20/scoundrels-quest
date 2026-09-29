import { useEffect, useState } from 'react';
import { Stage, Layer, Group, Label, Tag, Text, Rect } from 'react-konva';
import Card from "../Card.jsx";
import { useFitScale } from "../../hooks/useFitScale.js";

/** Caja virtual de la carta de tienda (carta 130x160 en x=35,y=5). */
export const SHOP_CARD_W = 200;
export const SHOP_CARD_H = 170;

/**
 * Carta de la tienda con ajuste medido a su caja (mismo patrón que
 * el tablero: nada de window/1920). En pantallas estrechas se topa
 * a 0.6 para no dominar frente al resto de la interfaz.
 */
const ShopItemCard = ({ item, index, hoveredIndex, setHoveredIndex, DiamonIcon, HeartIcon }) => {
    const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 1080);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const onResize = () => setNarrow(window.innerWidth <= 1080);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const [fitRef, scale] = useFitScale(SHOP_CARD_W, SHOP_CARD_H, narrow ? 0.6 : 1);
    return (
        <div ref={fitRef} className="shop-card-fit">
            <Stage width={SHOP_CARD_W * scale} height={SHOP_CARD_H * scale} scaleX={scale} scaleY={scale}>
                <Layer>
                    <Group
                        onMouseOver={() => item.data.efectos ? setHoveredIndex(index) : null}
                        onMouseLeave={() => item.data.efectos ? setHoveredIndex(null) : null}
                        onTap={() => item.data.efectos ? hoveredIndex != null ? setHoveredIndex(null) : setHoveredIndex(index) : null}
                    >
                        <Card
                            cardInfo={item?.data}
                            x={35}
                            y={5}
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
                                    x={25}
                                    y={5}
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
                                    x={25}
                                    y={5}
                                />
                            </Label>
                        )}
                    </Group>
                </Layer>
            </Stage>
        </div>
    );
};

export default ShopItemCard;
