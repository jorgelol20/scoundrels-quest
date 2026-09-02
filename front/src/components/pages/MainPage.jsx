import React, { Fragment, useContext, useEffect, useState } from "react";
import './MainPage.css';
import { useUser } from "../../hooks/useUser.js";
import Loading from "../Loading";
import { useNavigate } from "react-router-dom";
import { settingsContext } from "../../context/SettingsProvider.jsx";
import { useMatch } from "../../hooks/useMatch.js";
import Match from "../Match.jsx";
import UserRanking from "../UserRanking.jsx";
import GameIcon from '/images/banner_menu.webp';
import { useCard } from "../../hooks/useCard.js";
import { useAchievements } from "../../hooks/useAchievements.js";
import { useModifier } from "../../hooks/useModifier.js";
import { bugReportContext } from "../../context/BugReportProvider.jsx";

const MainPage = () => {
    const { user, isLoading: userIsLoading } = useUser()
    const { isLoading: cardIsLoading } = useCard();
    const { isLoading: achievementsIsLoading } = useAchievements();
    const { isLoading: modifierIsLoading } = useModifier();
    const {openBugReport} = useContext(bugReportContext)
    const { matches, isLoading: matchIsLoading } = useMatch();
    const { startButtonSound } = useContext(settingsContext)
    const navigate = useNavigate();


    if (userIsLoading || cardIsLoading || achievementsIsLoading || modifierIsLoading || matchIsLoading) {
        return (
            <Fragment>
                <Loading />
            </Fragment>
        )
    }
    return (
        <Fragment>
            <article className="menu">
                <img className="banner-menu" src={GameIcon} alt="Icono juego" />
                <div className="main-menu">
                    <button onClick={(event) => { startButtonSound(true); user ? navigate(`/jugar`) : navigate('/login') }}>JUGAR</button>
                    <button onClick={(event) => { startButtonSound(true); user ? navigate(`/jugar/tutorial`) : navigate('/login') }}>CÓMO JUGAR</button>
                    <button onClick={(event) => { startButtonSound(true); navigate('/ajustes') }}>AJUSTES</button>
                    <button onClick={(event) => { startButtonSound(true); user ? navigate(`/perfil/${user ? user.nick : ''}`) : navigate('/login') }}>PERFIL</button>
                    <button onClick={() => openBugReport()}>REPORTAR ERROR</button>
                    {
                        navigator.userAgent.indexOf("Firefox") > -1 ?
                            <div className="advise">
                                <h1>¡Advertencia!</h1>
                                <p>En navegadores Firefox pueden haber perdidas de rendimiento durante la experiencia de juego. <br />Recomendamos encarecidamente que se utilice un navegador en base <strong> Chrome.</strong><br />Disculpen las molestias.</p>
                            </div>
                            : <></>
                    }
                </div>
                <div>
                    <UserRanking />
                </div>
            </article>
            <article>
                <div className="last-matches">
                    <h1>Últimas partidas ( Totales: {matches?.total_jugadas ?? ""} )</h1>
                    <div tabIndex={1} className="match-history">
                        {matches?.partidas?.map((match) => {
                            return <div tabIndex={1} key={match.id}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') { navigate(`/partida/${match.id}`) }
                                }}
                                onClick={() => { navigate(`/partida/${match.id}`) }}><Match key={match.id} match={match} showUser={true} /></div>
                        })}
                    </div>
                </div>
            </article>
        </Fragment>
    );
}
export default MainPage;