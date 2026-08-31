import React, { Fragment } from "react";
import './Achievement.css';
import achievementPlaceholder from '/images/achievement.webp'

const Achievement = ({ achievementInfo }) => {
    if (achievementInfo !== null) {
        return (
            <Fragment>
                <div className={achievementInfo.obtained ? "achievement true" : "achievement false"}>
                    <div className="achievement-info">
                        <img src={achievementInfo.icono} alt={`Icono logro ${achievementInfo.nombre}`}
                            onError={(e) => {
                                e.currentTarget.src = achievementPlaceholder;
                            }} />
                        <div>
                            <h1>{achievementInfo.nombre}</h1>
                            {achievementInfo.created_at ? <p>{new Date(achievementInfo.created_at).toLocaleDateString('es-ES')}</p> : <></>}
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