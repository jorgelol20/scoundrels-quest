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
import { useTranslation } from 'react-i18next';

const MainPage = () => {
    const { t } = useTranslation('home');
    const { t: tSeo } = useTranslation('seo');
    const { user, isLoading: userIsLoading } = useUser()
    const { isLoading: cardIsLoading } = useCard();
    const { isLoading: achievementsIsLoading } = useAchievements();
    const { isLoading: modifierIsLoading } = useModifier();
    const { openBugReport } = useContext(bugReportContext)
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
            <div style={{paddingBottom: '2em'}}>
                <article className="menu">
                    <img className="banner-menu" src={GameIcon} alt={tSeo('bannerAlt')} fetchPriority="high" decoding="async" />
                    <h1 className="sr-only">{tSeo('srTitle')}</h1>
                    <p className="sr-only">
                        {tSeo('srText1a')}<strong>{tSeo('srStrong1')}</strong>{tSeo('srText1b')}<strong>{tSeo('srStrong2')}</strong>{tSeo('srText1c')}<strong>{tSeo('srStrong3')}</strong>{tSeo('srText1d')}
                    </p>
                    <div className="main-menu">
                        <button onClick={(event) => { startButtonSound(true); user ? navigate(`/jugar`) : navigate('/login') }}>{t('play')}</button>
                        <button onClick={(event) => { startButtonSound(true); user ? navigate(`/jugar/tutorial`) : navigate('/login') }}>{t('howToPlay')}</button>
                        <button onClick={(event) => { startButtonSound(true); navigate('/ajustes') }}>{t('settings')}</button>
                        <button onClick={(event) => { startButtonSound(true); user ? navigate(`/perfil/${user ? user.nick : ''}`) : navigate('/login') }}>{t('profile')}</button>
                        {
                            user ? <button onClick={() => openBugReport()}>{t('reportBug')}</button> : <></>
                        }
                        {
                            navigator.userAgent.indexOf("Firefox") > -1 ?
                                <div className="advise">
                                    <h1>{t('firefoxWarningTitle')}</h1>
                                    <p>{t('firefoxWarningLine1')}<br />{t('firefoxWarningLine2')} <strong>Chrome.</strong><br />{t('firefoxWarningLine3')}</p>
                                </div>
                                : <></>
                        }
                    </div>
                    <div>
                        <UserRanking />
                    </div>
                </article>
                <article className="matches-history">
                    <div className="last-matches">
                        <h2>{t('lastMatches', { total: matches?.total_jugadas ?? "" })}</h2>
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
                <section className="seo-content" aria-label={tSeo('aria')}>
                    <h2>{tSeo('content.h2')}</h2>
                    <p>
                        {tSeo('content.p1a')}<strong>{tSeo('content.p1strong1')}</strong>{tSeo('content.p1b')}<strong>{tSeo('content.p1strong2')}</strong>{tSeo('content.p1c')}<strong>{tSeo('content.p1strong3')}</strong>{tSeo('content.p1d')}<strong>{tSeo('content.p1strong4')}</strong>{tSeo('content.p1e')}<strong>{tSeo('content.p1strong5')}</strong>{tSeo('content.p1f')}
                    </p>
                    <h3>{tSeo('content.h3Why')}</h3>
                    <ul>
                        <li><strong>{tSeo('content.li1a')}</strong>{tSeo('content.li1b')}</li>
                        <li><strong>{tSeo('content.li2a')}</strong>{tSeo('content.li2b')}</li>
                        <li>{tSeo('content.li3')}</li>
                        <li>{tSeo('content.li4a')}<strong>{tSeo('content.li4strong')}</strong>{tSeo('content.li4b')}</li>
                        <li><strong>{tSeo('content.li5a')}</strong>{tSeo('content.li5b')}</li>
                    </ul>
                    <h3>{tSeo('content.h3Faq')}</h3>
                    <details>
                        <summary>{tSeo('content.q1')}</summary>
                        <p><strong>Scoundrel</strong>{tSeo('content.a1b')}</p>
                    </details>
                    <details>
                        <summary>{tSeo('content.q2')}</summary>
                        <p>{tSeo('content.a2a')}<strong>Scoundrel's Quest (Scoundrels Quest)</strong>{tSeo('content.a2b')}<strong>{tSeo('content.a2strong')}</strong>{tSeo('content.a2c')}</p>
                    </details>
                    <details>
                        <summary>{tSeo('content.q3')}</summary>
                        <p>{tSeo('content.a3')}</p>
                    </details>
                </section>
            </div>
        </Fragment>
    );
}
export default MainPage;