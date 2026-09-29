import { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import './SelectModifier.css'
import { matchContext } from "../../context/MatchProvider.jsx";
import Modifier from "../Modifier.jsx";
import ShopMan from '/images/ShopMan.webp'

const SelectModifier = ({ setSelectModifier, rounds, setModifiersLoading }) => {
    const { getRandomsModifier } = useContext(matchContext)
    const { t } = useTranslation('game');
    const [modifiersList, setModifiersList] = useState([])
    useEffect(() => {
        setModifiersList(getRandomsModifier(3, rounds))
    }, [getRandomsModifier, rounds])
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
                                        <p>{t('select.noModifiersLeft')}</p>
                                    </div>
                                </div>
                                <div style={{display:'flex'}}>
                                    <img src={ShopMan} alt={t('select.shopManAlt')} />
                                    <button onClick={()=>{ setModifiersLoading(false); setSelectModifier(false); }}>{t('select.close')}</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <button 
                className="skip-modifiers"
                onClick={() => {setSelectModifier(false);setModifiersLoading(false)}}
                >
                    {t('select.skip')}
                </button>
            </div>
        </Fragment>
    )
}
export default SelectModifier;