import { Fragment, useContext, useEffect, useState } from "react";
import './SelectModifier.css'
import { matchContext } from "../../context/MatchProvider.jsx";
import Modifier from "../Modifier.jsx";
import ShopMan from '/images/ShopMan.webp'

const SelectModifier = ({ setSelectModifier, rounds }) => {
    const { getRandomsModifier } = useContext(matchContext)
    const [modifiersList, setModifiersList] = useState([])
    useEffect(() => {
        setModifiersList(getRandomsModifier(3, rounds))
    }, [getRandomsModifier])
    if (undefined in modifiersList) {
        return (<></>)
    }
    return (

        <Fragment>
            <div className="select-modifier">
                <div className="modifiers-list">
                    {modifiersList.length > 0 ? modifiersList.map((modifierInfo) => (
                        modifierInfo == null ? <></> :
                            <Modifier key={modifierInfo.id + "-selectModifer"} modifierInfo={modifierInfo} setSelectModifier={setSelectModifier} />
                    )) :
                        <div>
                            <div className="shop-man">
                                <div className="dialog">
                                    <div>
                                        <p>Pues no quedan modificadores máquina.</p>
                                    </div>
                                </div>
                                <div style={{display:'flex'}}>
                                    <img src={ShopMan} alt="ShopMan" />
                                    <button onClick={()=>{setSelectModifier(false)}}>Pues vale...</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </Fragment>
    )
}
export default SelectModifier;