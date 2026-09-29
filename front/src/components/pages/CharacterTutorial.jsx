import { useTranslation } from "react-i18next";

import { useCharacters } from "../../hooks/useCharacter.js";
import PlaceholderImage from "/images/placeholder.webp";

/*

 */
const CharacterTutorial = () => {
    const { t } = useTranslation('characters');
    const { characters, isLoading, error } = useCharacters();

    // Un código sin traducción devuelve "" (o el texto por defecto) para
    // mantener la lógica original de fallback por personaje.
    const getStrategyNote = (character) => {
        const code = character?.habilidad_personaje?.codigo;
        return code ? t(`strategies.${code}`, { defaultValue: '' }) : '';
    };

    const getCharacterStyle = (character) => {
        const code = character?.habilidad_personaje?.codigo;
        return t(`styles.${code}`, { defaultValue: t('styles.fallback') });
    };


    return (
        <section className="character-tutorial" aria-labelledby="character-tutorial-title">
            <header className="character-tutorial-header">
                <p className="character-tutorial-kicker">{t('kicker')}</p>
                <h1 id="character-tutorial-title">{t('title')}</h1>
                <p>{t('subtitle')}</p>
                {!isLoading && !error && characters?.length > 0 && (
                    <span className="character-count">
                        {t('count', { count: characters.length })}
                    </span>
                )}
            </header>

            {isLoading && (
                <div className="character-tutorial-status">
                    {t('loading')}
                </div>
            )}

            {!isLoading && error && (
                <div className="character-tutorial-status character-tutorial-error">
                    {t('loadError')}
                </div>
            )}

            {!isLoading && !error && characters?.length === 0 && (
                <div className="character-tutorial-status">
                    {t('empty')}
                </div>
            )}

            {!isLoading && !error && characters?.length > 0 && (
                <div
                    className="character-timeline"
                    role="list"
                    tabIndex="0"
                    aria-label={t('aria.list')}
                >
                    {characters.map((character, index) => {
                        const ability = character?.habilidad_personaje;
                        const strategyNote = getStrategyNote(character);

                        return (
                            <article
                                className={`character-entry ${index % 2 === 0 ? "character-entry-left" : "character-entry-right"}`}
                                key={character.id ?? character.nombre}
                                role="listitem"
                            >
                                <div className="character-card">
                                    <div className="character-card-header">
                                        <div className="character-portrait-wrap">
                                            <img
                                                className="character-portrait"
                                                src={character.imagen}
                                                onError={(event) => {
                                                    event.currentTarget.src = PlaceholderImage;
                                                }}
                                                alt={t('alt.portrait', { nombre: character.nombre })}
                                            />
                                        </div>
                                        <div className="character-heading">
                                            <span className="character-order">
                                                {t('position', { index: index + 1, total: characters.length })}
                                            </span>
                                            <h2>{character.nombre}</h2>
                                            <span className="character-style">{getCharacterStyle(character)}</span>
                                            <span className="character-code">
                                                {ability?.nombre || t('specialAbility')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="character-card-content">
                                        <p className="character-description">
                                            {character.descripcion || t('noDescription')}
                                        </p>

                                        <div className="character-ability">
                                            <img
                                                src={ability?.icono}
                                                onError={(event) => {
                                                    event.currentTarget.src = PlaceholderImage;
                                                }}
                                                alt={t('alt.ability', { nombre: character.nombre })}
                                            />
                                            <div>
                                                <h3>{t('ability')}</h3>
                                                <p>
                                                    {ability?.descripcion ||
                                                        t('abilityFallback')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="character-strategy">
                                            <h3>{t('strategyTitle')}</h3>
                                            <p className={strategyNote ? "strategy-filled" : "strategy-placeholder"}>
                                                {strategyNote ||
                                                    t('strategyFallback')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default CharacterTutorial;
