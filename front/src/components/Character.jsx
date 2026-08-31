import React, { Fragment, useContext } from "react";

import { matchContext } from "../context/MatchProvider.jsx";
import {  settingsContext } from "../context/SettingsProvider.jsx";

import './Character.css';

const Character = ({characterInfo, fastSelector = false}) => {
    const {setNewCharacter} = useContext(matchContext)
    const {startButtonSound} = useContext( settingsContext)
    if(fastSelector){
        return (
            <Fragment>
                <div className="fastSelector-container">
                    <div className="character-info">
                        <img className="character-image" src={characterInfo.imagen} alt={characterInfo.nombre}/>
                        <h1>{characterInfo.nombre}</h1>
                        
                    </div>
                    <div>
                        <div className="character-abilitie">
                            <img className="abilitie-icon" src={characterInfo.habilidad_personaje.icono} alt={"Habilidad de " +  characterInfo.nombre}/>
                            
                        </div>
                    </div>
                    <div>
                        <button onClick={(event)=>{startButtonSound(true);setNewCharacter(characterInfo)}}>Seleccionar</button>
                    </div>
                </div>
            </Fragment>
        )
    }
    return (
        <Fragment>
            <div>
                <div className="character-container">
                    <div className="character-info">
                        <img className="character-image" src={characterInfo.imagen} alt={characterInfo.nombre}/>
                        <h1>{characterInfo.nombre}</h1>
                        <button onClick={(event)=>{startButtonSound(true);setNewCharacter(characterInfo)}}>Seleccionar</button>
                    </div>
                    <div>
                        <div className="character-abilitie">
                            <img className="abilitie-icon" src={characterInfo.habilidad_personaje.icono} alt={"Habilidad de " +  characterInfo.nombre}/>
                            <div className="abilitie-text">
                                <p>{characterInfo.habilidad_personaje.descripcion}</p>
                            </div>
                        </div>
                        <div className="character-description">
                            <p>{characterInfo.descripcion}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default Character;