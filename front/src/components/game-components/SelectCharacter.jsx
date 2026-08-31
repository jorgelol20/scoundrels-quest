import React, { Fragment, useContext, useEffect, useState } from "react";
import './SelectCharacter.css';
import Character from "../Character.jsx";
import Loading from "../Loading.jsx";
import { matchContext } from "../../context/MatchProvider";

const SelectCharacter = () => {
    const {availableCharacters} = useContext(matchContext)
    const [characterList, setCharacterList] = useState([])

    const [isFastSelector, setIsFastSelector] = useState(() => {
        return localStorage.getItem('fastSelector') === 'true';
    });


    const handleFastSelectorChange = (e) => {
        const isChecked = e.target.checked;
        setIsFastSelector(isChecked); 
        localStorage.setItem('fastSelector', isChecked);
    };
    useEffect(()=>{
        if(availableCharacters.length > 0){
            setCharacterList(availableCharacters)
        }
    },[availableCharacters])
    if(characterList.length === 0){
        return (
            <Fragment>
                <Loading/>
            </Fragment>
        )
    }
    return (
        <Fragment>
            <div className="container">
                <div className="character-selection">
                    {availableCharacters?.map((characterInfo) => {
                        return (
                            <Character
                                key={characterInfo.id}
                                characterInfo={characterInfo}
                                fastSelector={isFastSelector}
                            />
                        )
                    })}
                </div>
                <div className="character-menu">
                    <div className="character-menu-input">
                        <label htmlFor="checkbox-setting">Selector rápido</label>
                        <input
                            id="checkbox-setting"
                            className="checkbox-setting"
                            type="checkbox"
                            checked={isFastSelector}
                            onChange={handleFastSelectorChange}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SelectCharacter;