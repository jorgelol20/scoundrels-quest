import { Group, Rect, Text } from "react-konva";

const TooltipLayer = ({ tooltip, onTap }) => {
    if (!tooltip) {
        return null;
    }

    const width = 180;
    const height = 80;
    const margin = 10;

    let x = tooltip.x;
    let y = tooltip.y;

    const getNameFontSize = (nombre) => {
        const length = nombre?.length ?? 0;

        if (length > 25) return 12;
        if (length > 20) return 14;
        if (length > 15) return 16;

        return 18;
    };

    return (
        <Group
            x={x / 2}
            y={y / 2}
            listening={false}
            onTap={onTap}
        >
            <Rect
                width={width}
                height={height}
                cornerRadius={8}
                fill="#1c1c1c"
                stroke="#aaa"
                strokeWidth={2}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.5}
                shadowOffset={{ x: 2, y: 2 }}

            />

            <Text
                text={tooltip.nombre}
                x={12}
                y={10}
                width={width - 24}
                fontFamily="Alagard"
                fontSize={getNameFontSize(tooltip.nombre)}
                fontStyle="bold"
                fill="white"
                wrap="wrap"
            />

            {
                tooltip.turnos !== false ?
                    <Text
                        text={`Turnos: ${tooltip.turnos}`}
                        x={12}
                        y={40}
                        fontSize={13}
                        fill="#ccc"
                        fontFamily="Alagard"
                    />
                    : <></>
            }

            {
                tooltip.valor !== false ?
                    <Text
                        text={`Valor: ${tooltip.valor}`}
                        x={12}
                        y={tooltip.turnos !== false ? 59 : 40}
                        fontSize={13}
                        fontStyle="bold"
                        fill={tooltip.valor === 0 ? "#ffd54a" : tooltip.valor > 0 ? "#29973f" : tooltip.valor < 0 ? "#84142D" : "#ffd54a"}
                        fontFamily="Alagard"
                    />
                    : <></>
            }
        </Group>
    );
};

export default TooltipLayer;