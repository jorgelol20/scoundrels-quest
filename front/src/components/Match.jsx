import React, { Fragment, useContext, useEffect, useState } from "react";
import { useCharacters } from "../hooks/useCharacter";
import Placeholder from '/images/placeholder.webp'
import CommentsIcon from '/images/comments_icon.webp'
import './Match.css'
import Modifier from "./Modifier";
const Match = ({ match, showUser }) => {
    const {isLoading } = useCharacters()
    if (!isLoading) {
        return (
            
            <Fragment>
                <article className="match-row">
                    
                    <img className="character-image" src={match.personaje.imagen} alt={match.personaje.nombre} title={match.personaje.nombre}/>
                    <div className="match-info">
                        <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                            <h2 className={match.victoria ? 'win' : 'lose'}>{match.victoria ? 'Victoria' : 'Derrota'}</h2>
                            <p>Jugada el {new Date(match.created_at).toLocaleDateString('es-ES')}</p>
                            <div className="match-comments">
                                <img src={CommentsIcon} alt="Cantidad de comentarios" title="Cantidad de comentarios"/>
                                <p>{match.comentarios_count}</p>
                            </div>
                        </div>
                        <div className="match-modifiers">
                            {match.modificadores?.length > 0 ? match.modificadores.map((modifierInfo) => {
                                return <Modifier key={crypto.randomUUID()} modifierInfo={modifierInfo} />
                            }) : <h1>Sin modificadores</h1>}
                            
                        </div>
                    </div>
                    {showUser ?
                        <div className="player-info">
                            <img className='user-avatar' style={{ borderColor: match.jugador.color }} src={match.jugador.avatar !== "" && match.jugador.avatar ? match.jugador.avatar : Placeholder} alt={`Avatar de ${match.jugador.nick}`} title={`Avatar de ${match.jugador.nick}`}/>
                            <p className={match.jugador.es_admin?"admin":"user"}>{match.jugador.nick}</p>
                        </div>
                        : <></>}
                </article>
            </Fragment>
        )
    }
}
export default Match;