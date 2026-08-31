import React, { Fragment, useContext } from "react";
import Banner from "../structure/Banner.jsx";
import './SettingsPage.css'
import { settingsContext } from "../../context/SettingsProvider.jsx";

import MusicOff from '/images/music_off.svg'
import MusicOn from '/images/music_on.svg'

import VolumeOff from '/images/volume_off.svg'
import VolumeOn from '/images/volume_on.svg'
import { NavLink, useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const navigate = useNavigate()
    const {
        effectsVolume,
        musicVolume,
        changeEffectsSound,
        changeMusicSound,
        muteMusic,
        muteEffects,
        effectsMuted,
        musicMuted,
        startButtonSound,
        changeShowFPS,
        showFPS,
        changeShowLogs,
        showLogs
    } = useContext(settingsContext);

    return (
        <Fragment>

            <div className="settings">
                <div className="settings-container">
                    <label htmlFor="music-range">Volumen Música</label>
                    <div className="sound-setting">
                        <button className="muteButton" onClick={() => { muteMusic(true) }}><img src={musicMuted ? MusicOff : MusicOn} /></button>
                        <input
                            type="range"
                            id="music-range"
                            value={musicVolume}
                            min={0}
                            max={100}
                            onChange={(e) => changeMusicSound(e.target.value)}
                        />
                    </div>
                    <br />
                    <label htmlFor="effect-range">Volumen Efectos</label>
                    <div className="sound-setting">
                        <button className="muteButton" onClick={() => { muteEffects(true) }}><img src={effectsMuted ? VolumeOff : VolumeOn} /></button>
                        <input
                            type="range"
                            id="effect-range"
                            value={effectsVolume}
                            min={0}
                            max={100}
                            onChange={(e) => changeEffectsSound(e.target.value)}
                        />
                    </div>
                    <div className="checkbox-settings">
                        <div>
                            <label htmlFor="fps-setting">Mostrar FPS</label><br />
                            <input className="fps-setting checkbox-setting" type="checkbox" checked={showFPS ? true : false} name="" id="" onChange={(e) => { changeShowFPS(e.target.checked) }} />
                        </div>
                        <div>
                            <label htmlFor="logs-setting">Mostrar Logs en partida</label><br />
                            <input className="logs-setting checkbox-setting" type="checkbox" checked={showLogs ? true : false} name="" id="" onChange={(e) => { changeShowLogs(e.target.checked) }} />
                        </div>
                    </div>
                    <div>
                        <button onClick={(event) => { startButtonSound(true); navigate('/') }}>Volver</button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SettingsPage;