import { useTranslation } from "react-i18next";
import Modifier from "../Modifier.jsx";

/**
 * HUD lateral de partida (Fase 4 - vista).
 * Presentacional: todo llega por props, sin lógica de juego.
 * formatedTimeRef se pasa como objeto ref (el <h2> lo usa como ancla
 * de escritura para el timer, igual que antes).
 */
const GameHud = ({
    health,
    maxHealth,
    healthIcon,
    healthAnimation,
    healthAnimationValue,
    gold,
    goldIcon,
    goldAnimation,
    goldAnimationValue,
    modifiersLoading,
    pentakillTargetNumber,
    actualStreak,
    gameOn,
    gameWin,
    rounds,
    maxRounds,
    formatedTimeRef,
    remainingCards,
    minibossIcon,
    minibossActive,
    isGambler,
    lastGamblerEffect,
    character,
    userColor,
    isWarrior,
    isTaming,
    vampireUsed,
    availableAbility,
    modifiers,
    canFlee,
    canUseAbility,
    onFlee,
    onAbility,
}) => {
    const { t } = useTranslation('game');
    return (
        <div className="game-hud">
            <div className="game-hud-text">
                <h1 className="player-health"><img src={healthIcon} alt="" />{health}/{maxHealth}{healthAnimation !== null ? <div className="animation-container"><strong className="animation">{healthAnimationValue}</strong><img className="animation" alt="" src={healthAnimation} /></div> : <></>}</h1>
                <h1 className="player-gold"><img src={goldIcon} alt="" />{gold}{goldAnimation !== null ? <div className="animation-container"><strong className="animation">{goldAnimationValue}</strong><img className="animation" alt="" src={goldAnimation} /></div> : <></>}</h1>
                {!modifiersLoading && pentakillTargetNumber !== 0 ? <h1>{t('hud.streak', { a: actualStreak, b: pentakillTargetNumber })}</h1> : <></>}
                {gameOn && gameWin ? <h1>{t('hud.roundUnlimited', { current: rounds })}</h1> : <h1>{t('hud.round', { current: rounds, total: maxRounds })}</h1>}
                <h2 ref={formatedTimeRef}>{t('hud.time')}</h2>
                <p>{t('hud.remainingCards', { count: remainingCards })} {minibossActive ? <img src={minibossIcon} className='minibossIcon' title={t('hud.minibossTitle')} alt={t('hud.minibossIconAlt')} /> : ''}</p>
                {isGambler ? lastGamblerEffect !== null ? <p className="gambler-text">{t('hud.lastBet')} <br /> <span>{lastGamblerEffect}</span></p> : <p>{t('hud.notBetYet')}</p> : <></>}
            </div>
            <div className="game-character">
                <img className={`character-avatar ${isWarrior && health <= maxHealth / 2 ? 'warrior' : ''} ${isTaming ? 'tamer' : ''} ${vampireUsed ? 'vampire' : ''}`} style={{ borderColor: userColor }} src={character?.imagen} alt={character?.nombre} title={character?.nombre} />
                <img className={availableAbility ? "character-ability available" : "character-ability"} src={character?.habilidad_personaje?.icono} style={null} alt={t('hud.abilityIconAlt')} />
            </div>
            <div className="extra">
                <div className="game-modifiers">
                    {
                        modifiers.length > 0 ?
                            modifiers.map((modifierInfo, modifierIndex) => (
                                <Modifier key={`${modifierInfo.id}-${modifierIndex}`} modifierInfo={modifierInfo} />
                            ))
                            : <h1>{t('hud.noModifiers')}</h1>
                    }
                </div>
                <div className="game-buttons">
                    <button disabled={!canFlee} onClick={onFlee}>{t('hud.flee')}</button>
                    <button disabled={!canUseAbility} onClick={onAbility}>{t('hud.ability')}</button>
                </div>
            </div>
        </div>
    );
};

export default GameHud;
