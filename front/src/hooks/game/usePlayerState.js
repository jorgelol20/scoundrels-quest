import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Estado del jugador (Fase 4 - vista/estado).
 * Extraído de GamePage.jsx sin cambios de comportamiento.
 *
 * Vida, oro, icono de vida y animaciones. `scheduleTimeout` se inyecta
 * para compartir el registro único de timers (el restart los cancela
 * todos). `icons` se congela en ref: son estáticos.
 */
export const usePlayerState = ({ scheduleTimeout, icons }) => {
    const [maxHealth, setMaxHealth] = useState(20);
    const [health, setHealth] = useState(20);
    const [healthIcon, setHealthIcon] = useState(icons.full);
    const [gold, setGold] = useState(0);
    const [healthAnimation, setHealthAnimation] = useState(null);
    const [goldAnimation, setGoldAnimation] = useState(null);
    const [healthAnimationValue, setHealthAnimationValue] = useState(null);
    const [goldAnimationValue, setGoldAnimationValue] = useState(null);

    const iconsRef = useRef(icons);

    useEffect(() => {
        if (health >= maxHealth) {
            setHealthIcon(iconsRef.current.full);
        } else if (health <= maxHealth / 2 && health > 0) {
            setHealthIcon(iconsRef.current.mid);
        } else if (health === 0) {
            setHealthIcon(iconsRef.current.none);
        }
    }, [health, maxHealth]);

    const healAnimation = useCallback((value) => {
        setHealthAnimationValue("+" + (value))
        setHealthAnimation(iconsRef.current.heal)
        scheduleTimeout(() => {
            setHealthAnimation(null)
        }, 300)
    }, [scheduleTimeout]);

    const healthStealAnimation = useCallback((value) => {
        setHealthAnimationValue("+" + (value))
        setHealthAnimation(iconsRef.current.steal)
        scheduleTimeout(() => {
            setHealthAnimation(null)
        }, 300)
    }, [scheduleTimeout]);

    const damageAnimation = useCallback((value, allDamage = false) => {
        setHealthAnimationValue(value * -1)
        if (allDamage) {
            setHealthAnimation(iconsRef.current.allDamage)
        } else {
            setHealthAnimation(iconsRef.current.damage)
        }

        scheduleTimeout(() => {
            setHealthAnimation(null)
        }, 300)
    }, [scheduleTimeout]);

    const coinAnimation = useCallback((value) => {
        setGoldAnimationValue(value)
        setGoldAnimation(iconsRef.current.gold)
        scheduleTimeout(() => {
            setGoldAnimation(null)
        }, 300)
    }, [scheduleTimeout]);

    return {
        maxHealth,
        setMaxHealth,
        health,
        setHealth,
        healthIcon,
        gold,
        setGold,
        healthAnimation,
        goldAnimation,
        healthAnimationValue,
        goldAnimationValue,
        healAnimation,
        healthStealAnimation,
        damageAnimation,
        coinAnimation,
    };
};
