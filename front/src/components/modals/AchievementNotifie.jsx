import { matchContext } from '../../context/MatchProvider';
import './AchievementNotifie.css';
import { Fragment, useContext, useEffect } from "react"
import { useTranslation } from 'react-i18next';
import achievementPlaceholder from '/images/achievement.webp'
import { settingsContext } from '../../context/SettingsProvider';
import { fmtDate } from '../../i18n/format.js';
import { useScheduledTimeouts } from '../../hooks/game/useScheduledTimeouts.js';

const AchievementNotifie = ({ achievementInfo }) => {
    const { deleteNewAchievement } = useContext(matchContext);
    const {startAchievementSound} = useContext(settingsContext);
    const { t, i18n } = useTranslation('modals');
    const { scheduleTimeout } = useScheduledTimeouts();
    useEffect(() => {
        if (achievementInfo != null) {
            startAchievementSound(true);
            scheduleTimeout(() => {
                deleteNewAchievement(achievementInfo.id);
            }, 4900);
        }
    }, [achievementInfo])
    return (
        <Fragment>
            <div className='achievement-modal'>
                <div className="achievement-info">
                    <img src={achievementInfo.icono} alt={t('modals:achievement.iconAlt', { nombre: achievementInfo.nombre })}
                        onError={(e) => {
                            e.currentTarget.src = achievementPlaceholder;
                        }} />
                    <div>
                        <h1>{achievementInfo.nombre}</h1>
                        {achievementInfo.created_at ? <p>{fmtDate(i18n.language, achievementInfo.created_at)}</p> : <></>}
                        <div className="achievement-description">
                            <p>{achievementInfo.descripcion}</p>
                        </div>
                    </div>
                </div>

                <span></span>
            </div>
        </Fragment>
    )
}

export default AchievementNotifie;