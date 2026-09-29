import { useTranslation } from "react-i18next";

/**
 * Menú de fin de partida (Fase 4 - vista).
 * Presentacional: todo llega por props, sin lógica de juego.
 */
const GameOverMenu = ({
    gameWin,
    timeText,
    rounds,
    remainingCards,
    cardsUsed,
    earnedGold,
    enemysDefeated,
    onContinue,
    onRestart,
    onChangeCharacter,
    onHome,
    onProfile,
}) => {
    const { t } = useTranslation('game');
    return (
        <div className="gameOver-menu">
            <h1 className={gameWin ? "victory" : "lose"}>{gameWin ? t('gameOver.victory') : t('gameOver.defeat')}</h1>

            {
                gameWin ?
                    <button onClick={onContinue}>
                        {t('gameOver.continue')}
                    </button>
                    : <></>
            }

            <button onClick={onRestart}>
                {gameWin ? t('gameOver.playAgain') : t('gameOver.retry')}
            </button>

            <button onClick={onChangeCharacter}>
                {t('gameOver.changeCharacter')}
            </button>

            <button onClick={onHome}>{t('gameOver.home')}</button>
            <button onClick={onProfile}>{t('gameOver.profile')}</button>
            <div className="final-match-info">
                <p><span>{timeText}</span></p>
                <p>{t('matchStats.rounds')} <span>{rounds}</span></p>
                <p>{t('matchStats.remainingCards')} <span>{remainingCards}</span></p>
                <p>{t('matchStats.cardsUsed')} <span>{cardsUsed}</span></p>
                <p>{t('matchStats.earnedGold')} <span>{earnedGold}</span></p>
                <p>{t('matchStats.enemiesDefeated')} <span style={{ color: 'var(--main-red)' }}>{enemysDefeated}</span></p>
            </div>
        </div>
    );
};

export default GameOverMenu;
