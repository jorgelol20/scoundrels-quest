import React, { Fragment, useContext } from "react";
import Banner from "../structure/Banner.jsx";
import './SettingsPage.css'
import { settingsContext } from "../../context/SettingsProvider.jsx";

import MusicOff from '/images/music_off.svg'
import MusicOn from '/images/music_on.svg'

import VolumeOff from '/images/volume_off.svg'
import VolumeOn from '/images/volume_on.svg'
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('settings');
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
        showLogs,
        locale,
        changeLocale
    } = useContext(settingsContext);

    return (
        <Fragment>

            <div className="settings">
                <div className="settings-container">
                    <label htmlFor="music-range">{t('musicVolume')}</label>
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
                    <label htmlFor="effect-range">{t('effectsVolume')}</label>
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
                            <label htmlFor="fps-setting">{t('showFps')}</label><br />
                            <input className="fps-setting checkbox-setting" type="checkbox" checked={showFPS ? true : false} name="" id="" onChange={(e) => { changeShowFPS(e.target.checked) }} />
                        </div>
                        <div>
                            <label htmlFor="logs-setting">{t('showLogs')}</label><br />
                            <input className="logs-setting checkbox-setting" type="checkbox" checked={showLogs ? true : false} name="" id="" onChange={(e) => { changeShowLogs(e.target.checked) }} />
                        </div>
                    </div>
                    <div>
                        <button onClick={(event) => { startButtonSound(true); navigate('/') }}>{t('back')}</button>
                    </div>
                    <div className="language-setting">
                        <label htmlFor="locale-select">{t('language')}</label><br />
                        <select
                            id="locale-select"
                            value={locale}
                            onChange={(e) => { startButtonSound(true); changeLocale(e.target.value); }}
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                        <p className="language-help">{t('languageHelp')}</p>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SettingsPage;