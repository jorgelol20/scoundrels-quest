import React, { Fragment, useEffect, useState } from "react";
import './UserRanking.css'
import { useUser } from "../hooks/useUser.js";
import { useMatch } from "../hooks/useMatch.js";
import { useNavigate } from "react-router-dom";
import Match from "./Match.jsx";
import _ from "lodash";
const UserRanking = () => {
    const { user, isLoading, getVictoryRanking, getRoundRanking } = useUser()
    const { getRanking: getMatchRanking } = useMatch()
    const navigate = useNavigate()

    const [ranking, setRanking] = useState([]);

    const [rankingType, setRankingType] = useState()

    const [loading, setLoading] = useState(false)

    const loadVictoryRanking = async () => {
        const newRanking = await getVictoryRanking();
        return newRanking
    }
    const loadMatchRanking = async () => {
        const newRanking = await getMatchRanking();
        return newRanking
    }
    const loadRoundRanking = async () => {
        const newRanking = await getRoundRanking();
        return newRanking
    }


    const handleRankingChange = async (newRankingType) => {
        let newRanking = []
        if (newRankingType === 'BEST_MATCH') {
            newRanking = await loadMatchRanking();
            localStorage.setItem('rankingType', 'BEST_MATCH');
        } else if (newRankingType === 'VICTORIAS') {
            newRanking = await loadVictoryRanking();
            localStorage.setItem('rankingType', 'VICTORIAS');
        } else {
            newRanking = await loadRoundRanking();
            localStorage.setItem('rankingType', 'RONDAS');
        }
        setRanking(newRanking)
        setRankingType(newRankingType)
        setLoading(false)
    }

    const UserVictoryRanking = ({ userInfo, index }) => {
        return (
            <div tabIndex={0} key={`user-${index}`} onClick={(e) => { navigate(`/perfil/${userInfo.nick}`) }} className="user-ranking">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h1 id={`num-${index + 1}`}>#{index + 1}</h1>
                    <img style={{ borderColor: userInfo.color }} src={userInfo.avatar} alt={`Avatar de ${userInfo.nick}`} title={`${userInfo.nick}`}/>
                </div>
                <h1 className={userInfo.es_admin ? 'admin' : 'user'}>{userInfo.nick}</h1>
                <h1>Total: <strong style={{ color: 'var(--main-white)' }}>{userInfo.tiene_jugadas_count}</strong></h1>
                <h1>V: <strong style={{ color: 'var(--main-gold)' }}>{userInfo.total_victorias}</strong></h1>
                <h1>WR: <strong style={{ color: 'var(--main-gold)' }}>{Math.floor((userInfo.total_victorias / userInfo.tiene_jugadas_count) * 100)}%</strong></h1>
            </div>
        )
    }
    const UserRoundRanking = ({ userInfo, index }) => {
        return (
            <div tabIndex={0} key={`user-${index}`} onClick={(e) => { navigate(`/perfil/${userInfo.nick}`) }} className="user-ranking">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h1 id={`num-${index + 1}`}>#{index + 1}</h1>
                    <img style={{ borderColor: userInfo.color }} src={userInfo.avatar} alt={`Avatar de ${userInfo.nick}`} title={`${userInfo.nick}`}/>
                </div>
                <h1 className={userInfo.es_admin ? 'admin' : 'user'}>{userInfo.nick}</h1>
                <h1>Record Rondas: <strong style={{ color: 'var(--main-gold)' }}>{userInfo.record_rondas}</strong></h1>
            </div>
        )
    }
    const MatchRanking = ({ matchInfo, index }) => {
        return (
            <div tabIndex={0} key={`user-${index}`}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { navigate(`/partida/${matchInfo.id}`) }
                }}
                onClick={(e) => { navigate(`/partida/${matchInfo.id}`) }} className="user-ranking">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h1 id={`num-${index + 1}`}>#{index + 1}</h1>
                    <img style={{ borderColor: 'var(--main-gold)' }} src={matchInfo.personaje.imagen} alt={`Avatar de ${matchInfo.personaje.nombre}`} title={`${matchInfo.personaje.nombre}`}/>
                </div>
                <h1>Rondas: <strong style={{ color: 'var(--main-white)' }}>{matchInfo.rondas}</strong></h1>
                <h1>Enemigos derrotados: <strong style={{ color: 'var(--main-red)', filter: 'brightness(1.5)' }}>{matchInfo.enemigos_enfrentados}</strong></h1>
                <h1 className={matchInfo.jugador.es_admin ? 'admin' : 'user'}>{matchInfo.jugador.nick}</h1>
            </div>
        )
    }

    const createRanking = () => {
        let finalRanking = []
        switch (rankingType) {
            case 'BEST_MATCH':
                finalRanking = ranking.map((matchInfo, index) => {
                    return <MatchRanking key={matchInfo.id + "match-ranking"} matchInfo={matchInfo} index={index} />
                })
                break;
            case 'VICTORIAS':
                finalRanking = ranking.map((userInfo, index) => {
                    return <UserVictoryRanking key={userInfo.id + "victory-ranking"} userInfo={userInfo} index={index} />
                })
                break;
            case 'RONDAS':
                finalRanking = ranking.map((userInfo, index) => {
                    return <UserRoundRanking key={userInfo.id + "rounds-ranking"} userInfo={userInfo} index={index} />
                })
                break;
            default:
                break;
        }
        return finalRanking;
    }

    useEffect(() => {
        const savedRankingType = localStorage['rankingType'] ?? 'RONDAS';
        handleRankingChange(savedRankingType)
    }, [])


    return (
        <Fragment>
            <div className="ranking">
                <div className="ranking-buttons">
                    <button disabled={loading} className={rankingType === 'RONDAS' ? "ranking-button active" : "ranking-button"} id="forRounds" onClick={(e) => { setLoading(true); handleRankingChange('RONDAS') }}>RONDAS</button>
                    <button disabled={loading} className={rankingType === 'BEST_MATCH' ? "ranking-button active" : "ranking-button"} id="forMatch" onClick={(e) => { setLoading(true); handleRankingChange('BEST_MATCH') }}>MEJORES PARTIDAS</button>
                    <button disabled={loading} className={rankingType === 'VICTORIAS' ? "ranking-button active" : "ranking-button"} id="forVictory" onClick={(e) => { setLoading(true); handleRankingChange('VICTORIAS') }}>VICTORIAS</button>
                </div>
                <h1>Ranking de <strong style={{ color: 'var(--main-gold)' }}>{rankingType !== 'BEST_MATCH' ? rankingType : "MEJORES PARTIDAS"}</strong></h1>
                <div tabIndex={0} className="ranking-container">
                    {ranking !== undefined && ranking.length > 0 ?
                        createRanking()
                        : <></>}
                </div>
            </div>
        </Fragment>
    )
}
export default UserRanking