import React, { Fragment, useContext, useEffect, useState } from "react";
import { useCharacters } from "../hooks/useCharacter";
import Placeholder from '/images/placeholder.webp'
import CommentsIcon from '/images/comments_icon.webp'
import './Match.css'
import Modifier from "./Modifier";
import { useTranslation } from 'react-i18next';
import { fmtDate } from "../i18n/format.js";
const Match = ({ match, showUser }) => {
    const { t, i18n } = useTranslation('match');
    const {isLoading } = useCharacters()
    if (!isLoading) {
        return (
            
            <Fragment>
                <article className="match-row">
                    
                    <img className="character-image" src={match.personaje.imagen} alt={match.personaje.nombre} title={match.personaje.nombre}/>
                    <div className="match-info">
                        <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                            <h2 className={match.victoria ? 'win' : 'lose'}>{match.victoria ? t('win') : t('loss')}</h2>
                            <p>{t('playedOn', { date: fmtDate(i18n.language, match.created_at) })}</p>
                            <div className="match-comments">
                                <img src={CommentsIcon} alt={t('commentsCount')} title={t('commentsCount')}/>
                                <p>{match.comentarios_count}</p>
                            </div>
                        </div>
                        <div className="match-modifiers">
                            {match.modificadores?.length > 0 ? match.modificadores.map((modifierInfo) => {
                                return <Modifier key={crypto.randomUUID()} modifierInfo={modifierInfo} />
                            }) : <h1>{t('noModifiers')}</h1>}
                            
                        </div>
                    </div>
                    {showUser ?
                        <div className="player-info">
                            <img className='user-avatar' style={{ borderColor: match.jugador.color }} src={match.jugador.avatar !== "" && match.jugador.avatar ? match.jugador.avatar : Placeholder} alt={t('avatarOf', { nick: match.jugador.nick })} title={t('avatarOf', { nick: match.jugador.nick })}/>
                            <p className={match.jugador.es_admin?"admin":"user"}>{match.jugador.nick}</p>
                        </div>
                        : <></>}
                </article>
            </Fragment>
        )
    }
}
export default Match;