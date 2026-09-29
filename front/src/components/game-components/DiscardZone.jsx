import { useTranslation } from 'react-i18next';
import { Group, Rect, Text } from 'react-konva';
import Card from "../Card";

/**
 * Pila de descartes (Fase 4 - vista). Presentacional.
 * Nota: el posicionamiento del título reutiliza las medidas de
 * WEAPON_ZONE como en el original (se pasa como weaponZone).
 */
const DiscardZone = ({ zone, weaponZone, discardPile, getSuitIcon, defaultImage }) => {
    const { t } = useTranslation('game');
    return (
    <Group x={zone.x} y={zone.y}>
        <Rect width={zone.width} height={zone.height} fill="#9c4747c9" stroke="white" strokeWidth={2} cornerRadius={8} />
        <Text text={t('zones.discard')} rotation={55} fontFamily="Alagard" fontSize={30} fill="white" y={weaponZone.height * 0.05} x={weaponZone.width * 0.08} />
        {discardPile.toReversed().slice(0, 1).map((card, i) => (
            <Card
                key={card?.key}
                cardInfo={card}
                x={5}
                y={5}
                onDragEnd={() => { }}
                onClick={() => { }}
                isDraggable={false}
                cardSuit={getSuitIcon(card?.palo)}
                defaultImage={defaultImage}
            />
        ))}
    </Group>
    );
};

export default DiscardZone;
