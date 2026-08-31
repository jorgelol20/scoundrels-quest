import { createContext, useState, useEffect, useRef } from "react";
import MainMusic from '/sounds/main-music.mp3';
import ButtonSound from '/sounds/button-sound.mp3';
import AchievementSound from '/sounds/achievement-sound.aac';
import PlayCardSound from '/sounds/play-card-sound.aac'
import PlaceCardSound from '/sounds/place-card-sound.aac'
import ShuffleDeckSound from '/sounds/shuffle-deck-sound.aac'

export const settingsContext = createContext();

const SettingsProvider = ({ children }) => {
    // Estados audio
    const [effectsVolume, setEffectsVolume] = useState(50);
    const [effectsMuted, setEffectsMuted] = useState(false);
    const [musicVolume, setMusicVolume] = useState(50);
    const [musicMuted, setMusicMuted] = useState(false);

    // Estados ajustes avanzados
    const [showFPS, setShowFPS] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    // Refs
    const musicRef = useRef(null);
    const effectRef = useRef(null);

    // Carga inicial de preferencias guardadas
    useEffect(() => {
        const savedEffect = localStorage["effect_sound"];
        const savedMusic = localStorage["music_sound"];
        const savedMutedEffect = localStorage["effect_muted"];
        const savedMutedMusic = localStorage["music_muted"];
        const savedShowFPS = (localStorage.getItem('show_fps'));
        const savedShowLogs = (localStorage.getItem('show_logs'));

        if (savedMutedMusic !== null && savedMutedMusic !== undefined) setMusicMuted(Number(savedMutedMusic));
        if (savedMutedEffect !== null && savedMutedEffect !== undefined) setEffectsMuted(Number(savedMutedEffect));
        if (savedEffect !== null && savedEffect !== undefined) setEffectsVolume(Number(savedEffect));
        if (savedMusic !== null && savedMusic !== undefined) setMusicVolume(Number(savedMusic));
        if (savedShowFPS !== null && savedShowFPS !== undefined) setShowFPS(savedShowFPS);
        if (savedShowLogs !== null && savedShowLogs !== undefined) setShowLogs(savedShowLogs);
    }, []);

    // Sincronización del volumen/mute de la música con el elemento <audio>
    useEffect(() => {
        if (musicMuted) {
            if (musicRef.current) musicRef.current.volume = 0;
        } else {
            if (musicRef.current) musicRef.current.volume = musicVolume / 100;
        }
    }, [musicVolume, musicMuted]);

    // EventListener para iniciar la música cuando el jugador clicke dentro de la web.
    useEffect(() => {
        const enableAudio = () => {
            if (musicRef.current) {
                musicRef.current.play().catch(err => console.log("Audio bloqueado:", err));
            }
            window.removeEventListener('click', enableAudio);
        };
        window.addEventListener('click', enableAudio);
        return () => window.removeEventListener('click', enableAudio);
    }, []);

    // Handlers
    /**
     * Cambiar el volúmen de los efectos de sonido
     * 
     * @param {int} val Valor del volumen de los efectos de sonido (0-100)
     */
    const changeEffectsSound = (val) => {
        const num = Number(val);
        if (num >= 0 && num <= 100) {
            setEffectsMuted(false);
            setEffectsVolume(num);
            localStorage.setItem('effect_sound', num);
        }
    };

    /**
     * Cambiar el volúmen de la música del juego
     * 
     * @param {int} val Valor del volumen de la música (0-100)
     */
    const changeMusicSound = (val) => {
        const num = Number(val);
        if (num >= 0 && num <= 100) {
            setMusicMuted(false);
            setMusicVolume(num);
            localStorage.setItem('music_sound', num);
        }
    };

    /**
     * Función para mutear o desmutear la música
     * 
     * @param {boolean} change 
     */
    const muteMusic = (change) => {
        if (change) {
            localStorage['music_muted'] = !musicMuted;
            setMusicMuted(prev => !prev);
        }
    };

    /**
     * Función para mutear o desmutear los efectos de sonido
     * 
     * @param {boolean} change 
     */
    const muteEffects = (change) => {
        if (change) {
            localStorage['effect_muted'] = !effectsMuted;
            setEffectsMuted(prev => !prev);
        }
    };

    //Funciónes para ejecutar sonidos

    const playEffect = async (src = null, time = 0) => {
        if (effectsMuted) return;
        setTimeout(() => {
            const audio = new Audio(src);
            audio.volume = effectsVolume / 100;
            audio.play().catch(e => console.log("Playback prevented:", e));
        }, time)
    };

    //Funciónes para ejecutar sonidos
    const startButtonSound = (start) => playEffect(ButtonSound);
    const startAchievementSound = (start) => playEffect(AchievementSound);
    const startPlayCardSound = (start) => playEffect(PlayCardSound);
    const startPlaceCardSound = (start) => playEffect(PlaceCardSound);
    const startShuffleDeckSound = (start) => playEffect(ShuffleDeckSound);

    // Funciones de configuración avanzada

    /**
     * Función que cambia el estado actual de `Mostrar FPS`
     * 
     * @param {boolean} show true: Mostrar FPS false: Ocultar FPS 
     */
    const changeShowFPS = (show) => {
        localStorage.setItem('show_fps', show);
        setShowFPS(show);
    };

    /**
     * Función que cambia el estado actual de `Mostrar Logs`
     * 
     * @param {boolean} show true: Mostrar Logs false: Ocultar Logs 
     */
    const changeShowLogs = (show) => {
        localStorage.setItem('show_logs', show);
        setShowLogs(show);
    };

    const value = {
        effectsVolume,
        musicVolume,
        effectsMuted,
        musicMuted,
        showFPS,
        showLogs,
        changeEffectsSound,
        changeMusicSound,
        startButtonSound,
        startAchievementSound,
        startPlayCardSound,
        startPlaceCardSound,
        startShuffleDeckSound,
        muteEffects,
        muteMusic,
        changeShowFPS,
        changeShowLogs
    };

    return (
        <settingsContext.Provider value={value}>
            <audio ref={musicRef} src={MainMusic} volume={musicVolume} loop />
            {children}
        </settingsContext.Provider>
    );
};

export default SettingsProvider;