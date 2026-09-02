import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { Group, Rect, Text, Image } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import Default from '/images/default_card.webp'
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

const Card = forwardRef(({ cardInfo, x, y, onDragEnd, onClick, isDraggable = true, onDeck = false, isWizard = false, setOverDungeonZone, canBeClicked, cardSuit, defaultImage, scale = 1 }, ref) => {

    const groupRef = useRef(null);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [hasEffect, setHasEffect] = useState(false);

    // Exponemos métodos al padre (GamePage)
    useImperativeHandle(ref, () => ({
        animateTo: (targetX, targetY, duration = 0.3) => {
            if (groupRef.current) {
                groupRef.current.to({
                    x: targetX,
                    y: targetY,
                    duration: duration,
                    easing: Konva.Easings.EaseInOut,
                });
            }
        }
    }));

    // Carga de imágenes
    const [image] = useImage(cardInfo?.imagen);
    const [suit] = useImage(cardSuit);

    const selectEffectImage = () => {
        if (cardInfo?.efectos) {
            const effectsList = Array.isArray(cardInfo.efectos) ? cardInfo.efectos : [cardInfo.efectos];
            switch (effectsList[0].name) {
                case 'antiheal': return AntihealIcon;
                case 'weapon_breaker': return WeaponBreakerIcon;
                case 'poison': return PoisonIcon;
                case 'restore_ability': return RestoreAbilityIcon;
                case 'progresive_heal': return ProgresiveHealIcon;
                case 'heal_roulete': return HealRouleteIcon;
                case 'dmg_reduction': return DmgReductionIcon;
                case 'revive': return ReviveIcon;
                case 'invincibility_turns': return InvincibilityIcon;
                case 'health_steal': return HealthStealIcon;
                case 'thorny': return ThornyIcon;
                case 'plunder': return PlunderIcon;
                case 'extra_gold': return ExtraGoldIcon;
                case 'mitosis': return MitosisIcon;
                case 'souleater': return SouleaterIcon;
                case 'seal': return SealIcon;
                case 'blocked': return BlockedIcon; 
                default: return null;
            }
        }
        return null;
    };
    const [effectIcon] = useImage(selectEffectImage());

    // Color de la carta
    const colorRef = useRef('');

    // --- SISTEMA DE CACHÉ PARA LA CARTA ---
    useEffect(() => {
        const imagesLoaded = image && suit && (!hasEffect || effectIcon);

        if (imagesLoaded && groupRef.current) {
            // Un pequeño timeout asegura que Konva ya tenga los textos listos antes de congelar la imagen
            const timeoutId = setTimeout(() => {
                if (groupRef.current) {
                    groupRef.current.clearCache();
                    groupRef.current.cache({
                        x: -5,          // Margen para que el stroke (borde) no se corte
                        y: -5,
                        width: 130,     // Un poco más ancho que los 120 del Rect
                        height: 160,    // Un poco más alto que los 150 del Rect
                        pixelRatio: 2   // Forzamos alta densidad para que fuentes y pixelart se vean nítidos
                    });

                    // Desactivamos el suavizado de curvas en el canvas interno del caché
                    const nativeCanvas = groupRef.current._cache?.canvas?._canvas;
                    if (nativeCanvas) {
                        const ctx = nativeCanvas.getContext('2d');
                        if (ctx) ctx.imageSmoothingEnabled = false;
                    }

                    groupRef.current.getLayer()?.batchDraw();
                }
            }, 60);

            return () => clearTimeout(timeoutId);
        }
    }, [image, suit, effectIcon, hasEffect, cardInfo?.valor, strokeWidth, onDeck, isWizard]);

    const handleDragEndInternal = (e) => {
        const finalX = e.target.x();
        const finalY = e.target.y();
        const isValidMove = onDragEnd(cardInfo, finalX, finalY);
        setStrokeWidth(2);

        if (!isValidMove) {
            groupRef.current.to({
                x: x,
                y: y,
                duration: 0.2,
                easing: Konva.Easings.EaseInOut,
            });
        }
    };

    useEffect(() => {
        const palos = ['Diamante', 'Corazon'];
        if (cardInfo?.valor > 10 && palos.indexOf(cardInfo?.palo) !== -1) {
            if (cardInfo?.valor !== 14) {
                cardInfo?.valor = 10;
            }
        }
        setHasEffect(!!cardInfo?.efectos);
        colorRef.current = cardInfo?.especial ? '#D4AF37' : cardInfo?.palo === 'Corazon' ? '#1E5128' : cardInfo?.palo === 'Diamante' ? '#F77F00' : '#0C0C0C';
    }, [cardInfo]);

    return (
        <Group
            ref={groupRef}
            x={x}
            y={y}
            draggable={isDraggable}
            onClick={() => !onDeck ? (canBeClicked ? onClick(cardInfo) : null) : (canBeClicked && setOverDungeonZone ? setOverDungeonZone(prev => !prev) : null)}
            onTap={() => !onDeck ? (canBeClicked ? onClick(cardInfo) : null) : (canBeClicked && setOverDungeonZone ? setOverDungeonZone(prev => !prev) : null)}
            onDragEnd={handleDragEndInternal}
            onDragStart={() => {
                setStrokeWidth(6);
                groupRef.current.getStage().container().style.cursor =
                    "url('/images/cursor/Cursor_4.webp') 3 7, auto";
            }}

            onMouseEnter={() => {
                groupRef.current.getStage().container().style.cursor = isDraggable
                    ? "url('/images/cursor/Cursor_3.webp') 3 7, auto"
                    : "url('/images/cursor/Cursor_5.webp') 3 7, auto";
                if (isWizard && setOverDungeonZone) setOverDungeonZone(true);
            }}

            onMouseLeave={() => {
                groupRef.current.getStage().container().style.cursor =
                    "url('/images/cursor/Cursor_1.webp') 3 7, auto";
                if (isWizard && setOverDungeonZone) setOverDungeonZone(false);
            }}
        >
            <Rect
                width={120}
                height={150}
                fill={onDeck ? (!isWizard ? "#000000" : "#ffffffe5") : "white"}
                cornerRadius={8}
                stroke={!onDeck ? colorRef.current : '#0C0C0C'}
                strokeWidth={!onDeck ? strokeWidth : 0}
                lineJoin="round"
            />

            {!onDeck && (
                <>
                    <Text
                        text={`${cardInfo?.valor}`}
                        fill={colorRef.current}
                        fontSize={34}
                        fontFamily="Alagard"
                        x={15}
                        y={4}
                        listening={false}
                    />
                    <Image
                        image={suit}
                        width={25}
                        height={25}
                        x={75}
                        y={8}
                        imageSmoothingEnabled={false}
                        listening={false}
                    />
                    <Image
                        image={image}
                        width={90}
                        height={90}
                        x={15}
                        y={35}
                        imageSmoothingEnabled={false}
                        listening={false}
                    />
                    {hasEffect && (
                        <Image
                            image={effectIcon}
                            width={30}
                            height={30}
                            x={45}
                            y={112}
                            imageSmoothingEnabled={false}
                            listening={false}
                        />
                    )}
                    <Image
                        image={suit}
                        width={25}
                        height={25}
                        x={40}
                        y={142}
                        imageSmoothingEnabled={false}
                        rotation={180}
                        listening={false}
                    />
                    <Text
                        text={`${cardInfo?.valor}`}
                        fill={colorRef.current}
                        fontSize={34}
                        fontFamily="Alagard"
                        x={100}
                        y={146}
                        rotation={180}
                        listening={false}
                    />
                </>
            )}

            {onDeck && (
                !isWizard ? (
                    <Image
                        image={defaultImage}
                        width={120}
                        height={150}
                        x={0}
                        y={0}
                        imageSmoothingEnabled={false}
                        listening={false}
                    />
                ) : (
                    <>
                        <Image
                            image={defaultImage}
                            width={120}
                            height={150}
                            x={0}
                            y={0}
                            opacity={0.2}
                            imageSmoothingEnabled={false}
                            listening={false}
                        />
                        <Text
                            text={`${cardInfo?.valor}`}
                            fill={colorRef.current}
                            fontSize={34}
                            fontFamily="Alagard"
                            x={15}
                            y={4}
                            listening={false}
                        />
                        <Image
                            image={suit}
                            width={25}
                            height={25}
                            x={75}
                            y={8}
                            imageSmoothingEnabled={false}
                            listening={false}
                        />
                        <Image
                            image={image}
                            width={90}
                            height={90}
                            x={15}
                            y={35}
                            imageSmoothingEnabled={false}
                            listening={false}
                        />
                        <Image
                            image={suit}
                            width={25}
                            height={25}
                            x={40}
                            y={142}
                            imageSmoothingEnabled={false}
                            rotation={180}
                            listening={false}
                        />
                        <Text
                            text={`${cardInfo?.valor}`}
                            fill={colorRef.current}
                            fontSize={34}
                            fontFamily="Alagard"
                            x={100}
                            y={146}
                            rotation={180}
                            listening={false}
                        />
                    </>
                )
            )}
        </Group>
    );
});

export default Card;