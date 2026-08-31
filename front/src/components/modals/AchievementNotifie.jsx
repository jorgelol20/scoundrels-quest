import { matchContext } from '../../context/MatchProvider';
import './AchievementNotifie.css';
import { Fragment, useContext, useEffect } from "react"
import achievementPlaceholder from '/images/achievement.webp'
import { settingsContext } from '../../context/SettingsProvider';

const AchievementNotifie = ({ achievementInfo }) => {
    const { deleteNewAchievement } = useContext(matchContext);
    const {startAchievementSound} = useContext(settingsContext);
    const deleteAchievement = async () => {
        setTimeout(() => {
            deleteNewAchievement(achievementInfo.id);
        }, 4900)
    }
    useEffect(() => {
        if (achievementInfo != null) {
            startAchievementSound(true)
            deleteAchievement()
        }
    },[achievementInfo])
    return (
        <Fragment>
            <div className='achievement-modal'>
                <div className="achievement-info">
                    <img src={achievementInfo.icono} alt={`Icono logro ${achievementInfo.nombre}`}
                        onError={(e) => {
                            e.currentTarget.src = achievementPlaceholder;
                        }} />
                    <div>
                        <h1>{achievementInfo.nombre}</h1>
                        {achievementInfo.created_at ? <p>{new Date(achievementInfo.created_at).toLocaleDateString('es-ES')}</p> : <></>}
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