import { useTranslation } from 'react-i18next';
import { Group, Rect, Text } from 'react-konva';
import Card from "../Card";
import {
    LANDSCAPE_WIZARD_PREVIEW,
    LANDSCAPE_WIZARD_STEP,
    PORTRAIT_WIZARD_PREVIEW,
    PORTRAIT_WIZARD_STEP,
} from "../../game/layout.js";

/**
 * Zona del mazo/Dungeon (Fase 4 - vista).
 * Presentacional: la matemática de despliegue del mago se conserva tal cual.
 * En portrait previsualiza menos cartas con abanico más cerrado.
 */
const DungeonZone = ({
    zone,
    dungeon,
    isWizard,
    overDungeonZone,
    canBeClicked,
    catEye,
    getSuitIcon,
    defaultImage,
    setOverDungeonZone,
    layoutMode,
}) => {
    const { t } = useTranslation('game');
    const portrait = layoutMode === 'portrait';
    const previewCount = isWizard ? (portrait ? PORTRAIT_WIZARD_PREVIEW : LANDSCAPE_WIZARD_PREVIEW) : 1;
    const fanStep = portrait ? PORTRAIT_WIZARD_STEP : LANDSCAPE_WIZARD_STEP;
    return (
    <Group x={zone.x} y={zone.y}>
        <Rect width={zone.width} height={zone.height} fill="#0000006c" stroke="white" strokeWidth={2} cornerRadius={8} onMouseEnter={(e) => { setOverDungeonZone(true) }} onMouseLeave={(e) => { setOverDungeonZone(false) }} />
        <Text text={t('zones.dungeon')} rotation={55} fontFamily="Alagard" fontSize={30} fill="white" y={20} x={35} />

        {dungeon.toReversed().slice(0, previewCount).toReversed().map((card, i) => {
            let x, y;

            if (isWizard) {
                if (i < 4) {
                    x = 5;
                    y = 5 + (overDungeonZone ? i * fanStep : 0);
                } else {
                    const rowIndex = i - 4;
                    x = overDungeonZone ? 50 : 5;
                    y = (overDungeonZone ? 10 : 5) + (overDungeonZone ? rowIndex * fanStep : 0);
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
                haveCatEye={catEye}
                onDeck={true}
                setOverDungeonZone={setOverDungeonZone}
                cardSuit={getSuitIcon(card?.palo)}
                defaultImage={defaultImage}
            />
        })}
    </Group>
    );
};

export default DungeonZone;
