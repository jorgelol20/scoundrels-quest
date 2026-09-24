import { useCharacters } from "../../hooks/useCharacter.js";
import PlaceholderImage from "/images/placeholder.webp";

/*

 */
const characterStyles = {
    guerrero: "Ofensivo",
    paladin: "Defensivo",
    elfo: "Control",
    mago: "Información",
    apostador: "Riesgo",
    herrero: "Ofensivo",
    cazador: "Economía",
    vampiro: "Drenaje",
    domador: "Control",
};

const characterStrategies = {
    guerrero: "Lo ideal es jugar al rededor del 50% de la vida e intentar obtener los modificadores de vida extra para que ese 50% sea superior y no ir siempre a riesgo de morir por una mala decisión.",
    paladin: "Es el personaje más equilibrado por lo que encaja en cualquier estilo de juego.",
    elfo: "Con la posibilidad de huir hasta 2 veces por mano, puedes pensar mejor cuando jugartela o usar tu habilidad.",
    mago: "Personaje ideal si te gusta un ritmo de juego más pausado y calmado dado que te permite pensar con varios turnos a futuro.",
    apostador: "La opción más viable es: no usar su habilidad.",
    herrero: "",
    cazador: "",
    vampiro: "",
    domador: "",
};

const getStrategyNote = (character) => {
    const code = character?.habilidad_personaje?.codigo;
    return characterStrategies[code] || "";
};

const getCharacterStyle = (character) => {
    const code = character?.habilidad_personaje?.codigo;
    return characterStyles[code] || "Híbrido";
};

const CharacterTutorial = () => {
    const { characters, isLoading, error } = useCharacters();

    return (
        <section className="character-tutorial" aria-labelledby="character-tutorial-title">
            <header className="character-tutorial-header">
                <p className="character-tutorial-kicker">Elige tu estilo de juego</p>
                <h1 id="character-tutorial-title">Personajes</h1>
                <p>
                    Cada personaje cambia la forma de superar la mazmorra. Revisa su habilidad
                    y su estrategia antes de comenzar tu partida.
                </p>
                {!isLoading && !error && characters?.length > 0 && (
                    <span className="character-count">{characters.length} personajes disponibles</span>
                )}
            </header>

            {isLoading && (
                <div className="character-tutorial-status">
                    Cargando personajes...
                </div>
            )}

            {!isLoading && error && (
                <div className="character-tutorial-status character-tutorial-error">
                    No se han podido cargar los personajes.
                </div>
            )}

            {!isLoading && !error && characters?.length === 0 && (
                <div className="character-tutorial-status">
                    Todavía no hay personajes disponibles.
                </div>
            )}

            {!isLoading && !error && characters?.length > 0 && (
                <div
                    className="character-timeline"
                    role="list"
                    tabIndex="0"
                    aria-label="Lista de personajes desplazable"
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
                                                alt={`Retrato de ${character.nombre}`}
                                            />
                                        </div>
                                        <div className="character-heading">
                                            <span className="character-order">Personaje {index + 1} de {characters.length}</span>
                                            <h2>{character.nombre}</h2>
                                            <span className="character-style">{getCharacterStyle(character)}</span>
                                            <span className="character-code">
                                                {ability?.nombre || "Habilidad especial"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="character-card-content">
                                        <p className="character-description">
                                            {character.descripcion || "Sin descripción disponible."}
                                        </p>

                                        <div className="character-ability">
                                            <img
                                                src={ability?.icono}
                                                onError={(event) => {
                                                    event.currentTarget.src = PlaceholderImage;
                                                }}
                                                alt={`Icono de la habilidad de ${character.nombre}`}
                                            />
                                            <div>
                                                <h3>Habilidad</h3>
                                                <p>
                                                    {ability?.descripcion ||
                                                        "Este personaje todavía no tiene una habilidad visible."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="character-strategy">
                                            <h3>Estrategia ideal</h3>
                                            <p className={strategyNote ? "strategy-filled" : "strategy-placeholder"}>
                                                {strategyNote ||
                                                    "Sin estrategia fija."}
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
