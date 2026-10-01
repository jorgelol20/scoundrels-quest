import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import './Achievement.css';
import achievementPlaceholder from '/images/achievement.webp'
import { fmtDate } from "../i18n/format.js"

const Achievement = ({ achievementInfo }) => {
    const { t, i18n } = useTranslation('characters');
    if (achievementInfo !== null) {
        return (
            <Fragment>
                <div className={achievementInfo.obtained ? "achievement true" : "achievement false"}>
                    <div className="achievement-info">
                        <img src={achievementInfo.icono} alt={t('achievements.iconAlt', { nombre: achievementInfo.nombre })}
                            onError={(e) => {
                                e.currentTarget.src = achievementPlaceholder;
                            }} />
                        <div>
                            <h1>{achievementInfo.nombre}</h1>
                            {achievementInfo.created_at ? <p>{fmtDate(i18n.language, achievementInfo.created_at)}</p> : <></>}
                        </div>
                    </div>
                    <div className="achievement-description">
                        <p>{achievementInfo.descripcion}</p>
                    </div>
                    {
                        achievementInfo.meta !== null ?
                            <div>
                                <p>{`${achievementInfo.progreso}/${achievementInfo.meta}`}</p>
                            </div>
                            : <></>
                    }
                </div>
            </Fragment>
        )
    }
    return (<></>)
}
export default Achievement;