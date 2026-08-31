import React, { Fragment, useEffect, useRef, useState } from "react";
import "./MatchPage.css"
import { useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch.js";
import Loading from "../Loading.jsx";
import Modifier from './../Modifier.jsx'
import { useUser } from "../../hooks/useUser.js";

import GoldIcon from '/images/gold.webp'
import FullHealthIcon from '/images/full_health.png'
import Placeholder from '/images/placeholder.webp'
import Comentario from "../Comentario.jsx";
import AllDamageAnimation from '/images/animations/AllDamageAnimation.webp'

const MatchPage = () => {
    const { getMatchById, isLoading: matchLoading } = useMatch();
    const { user, isLoading: userLoading, isError, comment, commentError, isCommenting } = useUser();
    const { matchId } = useParams();
    const [isGettingMatch, setIsGettingMatch] = useState(true)
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [match, setMatch] = useState(undefined)
    const [character, setCharacter] = useState(undefined)
    const [player, setPlayer] = useState(undefined)
    const [comments, setComments] = useState([])
    const navigate = useNavigate()
    const commentRef = useRef(null)
    const scrollRef = useRef(null);

    useEffect(() => {
        if (user == undefined && !userLoading) {
            navigate('/login');
        }
        if (isError) {
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            } else {
                return <p>Error al conectar con el servidor</p>
            }
        }
    }, [userLoading])

    const requestMatch = async () => {
        const tempMatch = await getMatchById(matchId);
        if (tempMatch && tempMatch.comentarios) {
            const sortedComments = [...tempMatch.comentarios].sort((a, b) => {
                const dateA = new Date(a.pivot?.created_at || 0).getTime();
                const dateB = new Date(b.pivot?.created_at || 0).getTime();
                return dateA - dateB;
            });

            setMatch(tempMatch);
            setCharacter(tempMatch.personaje);
            setPlayer(tempMatch.jugador);
            setComments(sortedComments);
        }
        setIsLoadingComments(false);
        setIsGettingMatch(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (commentRef.current.value !== "" && commentRef !== null) {
            setIsLoadingComments(true)
            const form = new FormData();
            form.append('comentario', commentRef.current.value)
            form.append('partida_id', matchId);
            await comment(form);
            commentRef.current.value = ""
        } else {
            setIsLoadingComments(false)
        }
    };

    useEffect(() => {
        if (!isCommenting) {
            requestMatch()
        }
    }, [isCommenting])


    useEffect(() => {
        if (scrollRef.current) {
            const scrollToBottom = () => {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            };
            const timeoutId = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [comments]);

    useEffect(() => {
        if (!matchLoading && matchId != null) {
            requestMatch()
        }
    }, [matchLoading])


    if (isGettingMatch || matchLoading) {
        return <Loading />
    }
    return (
        <Fragment>
            <div className="match">
                <div className="match-body">
                    <div className="match-info">
                        <div className="match-parameters">
                            <h1>ID de la partida: {match.id}</h1>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <img className="character-image" src={character.imagen} alt={character.nombre} />
                                <div className="match-modifiers">
                                    {match.modificadores.length > 0 ? match.modificadores.map((modifierInfo) => {
                                        return <Modifier key={modifierInfo.id} modifierInfo={modifierInfo} />
                                    }) : <h1>Sin modificadores</h1>}
                                </div>
                            </div>
                            <div className="match-text">
                                <br />
                                <p>Jugada el {new Date(match.created_at).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <div className="info">
                                    <h2 className={match.victoria ? 'win' : 'lose'}>{match.victoria ? 'Victoria' : 'Derrota'}</h2>
                                    <h2><strong>{`Tiempo: ${String(Math.floor((match.tiempo / 60 / 60))).padStart(2, '0')}:${String(Math.floor((match.tiempo / 60 % 60))).padStart(2, '0')}:${String(match.tiempo % 60).padStart(2, '0')}`}</strong></h2>
                                    <h2><strong>Rondas superadas: {match.rondas}</strong></h2>
                                </div>
                                <div className="info extra-info">
                                    <h2>Oro total obtenido: <span style={{ color: 'var(--main-gold)' }}>{match.oro_obtenido}<img src={GoldIcon} /></span></h2>
                                    <h2>Vida total curada: <span style={{ color: 'var(--main-red)' }}>{match.vida_curada}<img src={FullHealthIcon} /></span></h2>
                                    <h2>Enemigos enfrentados: <span style={{ color: 'var(--main-red)' }}>{match.enemigos_enfrentados}<img src={AllDamageAnimation} /></span></h2>
                                </div>
                            </div>
                        </div>
                        <div className="player-info">
                            <img className='user-avatar' onClick={() => { navigate(`/perfil/${player.nick}`) }} style={{ borderColor: player.color }} src={player.avatar !== "" && player.avatar ? player.avatar : Placeholder} alt={`Avatar de ${match.jugador.nick}`} />
                            <p className={player.es_admin ? "admin" : "user"} x="50%" y="10" textAnchor="middle" fontFamily="Alagard" fontWeight="bold" fill="#333">
                                {player.nick}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="match-comments" ref={scrollRef}>

                    <div className="comments">
                        {comments.map((comentario, index) => {
                            return <Comentario key={index} comentario={comentario} requestMatch={requestMatch} />
                        })}
                    </div>
                </div>
                <div className="comment-input">
                    <form onSubmit={(e) => { handleSubmit(e) }}>
                        <input type="text" ref={commentRef} placeholder="Escribe tu comentario..." />
                        <button type="submit" disabled={isLoadingComments} >Comentar</button>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}
export default MatchPage