import { useTranslation } from 'react-i18next';
import { Group, Rect, Text } from 'react-konva';
import Card from "../Card";

/**
 * Zona de equipo: arma + monstruos derrotados (Fase 4 - vista).
 * Presentacional. cardRefs se pasa como objeto ref compartido
 * (las animaciones lo necesitan por key, no se clona).
 * En portrait (compact) los derrotados solapan más y el título
 * se achica para caber en 404px.
 */
const WeaponZone = ({ zone, weapon, slainMonsters, cardRefs, getSuitIcon, defaultImage, compact }) => {
    const { t } = useTranslation('game');
    return (
    <Group x={zone.x} y={zone.y}>
        <Rect width={zone.width} height={zone.height} fill="#6a9c476e" stroke="white" strokeWidth={2} cornerRadius={8} />
        <Text text={t('zones.weapon')} fontFamily="Alagard" fontSize={compact ? 26 : 40} fill="white" y={zone.height * 0.4} x={zone.width * 0.12} />
        {weapon && <Card
            ref={el => cardRefs.current[weapon.key] = el}
            key={weapon?.key}
            cardInfo={weapon}
            x={10}
            y={10}
            onDragEnd={() => { }}
            onClick={() => { }}
            isDraggable={false}
            cardSuit={getSuitIcon(weapon?.palo)}
            defaultImage={defaultImage}
        />}
        {slainMonsters.map((card, i) => (
            <Card
                ref={el => cardRefs.current[card?.key] = el}
                key={card?.key}
                cardInfo={card}
                x={150 + (i * (compact ? 12 : 20))}
                y={10 + (i * (compact ? 6 : 10))}
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

export default WeaponZone;
