import { useTranslation } from 'react-i18next';
import { Group, Rect, Text } from 'react-konva';
import PlayerEffects from "./PlayerEffects.jsx";
import { effectsPosPortrait } from "../../game/layout.js";

/**
 * Panel de efectos activos (Fase 4 - vista).
 * Presentacional: valores e iconos llegan por props.
 * En portrait los 13 iconos van en tira 7+6 (game/layout.js),
 * sin marco ni título.
 *
 * Cada entrada declara turnos/valor/icono explícitos (mismo render
 * que el original en landscape).
 */
const EFFECTS_META = [
    { key: 'extraDmg', x: 5, y: 30, turnos: false, icon: 'buff' },
    { key: 'enemyExtraDmg', x: 47.5, y: 30, turnos: false, icon: 'debuff' },
    { key: 'spadesExtra', x: 90, y: 30, turnos: false, icon: 'spade' },
    { key: 'clubsExtra', x: 5, y: 70, turnos: false, icon: 'club' },
    { key: 'poisonTurns', x: 47.5, y: 70, icon: 'poison' },
    { key: 'sealTurns', x: 90, y: 70, icon: 'seal' },
    { key: 'souleaterTurns', x: 5, y: 110, icon: 'souleater' },
    { key: 'mma', x: 47.5, y: 110, turnos: false, icon: 'mma' },
    { key: 'antihealTurns', x: 90, y: 110, icon: 'antiheal' },
    { key: 'extraGold', x: 5, y: 150, turnos: false, icon: 'extraGold' },
    { key: 'invincibilityTurns', x: 47.5, y: 150, icon: 'invincibility' },
    { key: 'progresiveTurns', x: 90, y: 150, icon: 'progresiveHeal', valorKey: 'progresiveValue' },
    { key: 'dmgReductionTurns', x: 5, y: 190, icon: 'dmgReduction' },
];

const resolveIcon = (meta, values, icons) => {
    if (meta.icon === 'mma') {
        return values.mma === 3 ? icons.mma3 : values.mma === 2 ? icons.mma2 : icons.mma1;
    }
    return icons[meta.icon];
};

const EffectsPanel = ({ x, y, width, height, values, icons, layoutMode, onHover, onLeave }) => {
    const { t } = useTranslation('game');
    const portrait = layoutMode === 'portrait';
    return (
        <Group x={x} y={y}>
            {!portrait && (
                <>
                    <Rect width={width / 3} height={height} fill="#9c94476e" stroke="white" strokeWidth={2} cornerRadius={8} />
                    <Text text={t('effects.title')} fontFamily="Alagard" fontSize={16} fill="white" y={height * 0.05} x={(width / 3) * 0.3} />
                </>
            )}
            {EFFECTS_META.map((meta, index) => {
                const pos = portrait ? effectsPosPortrait(index) : { x: meta.x, y: meta.y };
                return (
                    <PlayerEffects
                        key={meta.key}
                        x={pos.x}
                        y={pos.y}
                        size={32}
                        nombre={t(`effects.${meta.key}`)}
                        turnos={meta.turnos === false ? false : values[meta.key]}
                        valor={meta.valorKey ? values[meta.valorKey] : (meta.turnos === false ? values[meta.key] : false)}
                        icono={resolveIcon(meta, values, icons)}
                        onHover={onHover}
                        onLeave={onLeave}
                    />
                );
            })}
        </Group>
    );
};

export default EffectsPanel;
