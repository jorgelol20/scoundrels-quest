import React, { Fragment, useContext, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { matchContext } from "../context/MatchProvider";
import { settingsContext } from "../context/SettingsProvider";
import './Modifier.css';

const ModifierPopover = ({ modifierInfo, anchorRect, onMouseLeave }) => {
    const GAP = 8;

    const style = {
        position: "fixed",
        top: anchorRect.bottom / 2,
        left: anchorRect.left + (anchorRect.left/10),
        zIndex: 9999,
    };

    return ReactDOM.createPortal(
        <div className="modifier-text-portal" style={style} onMouseLeave={onMouseLeave}>
            <img  id={"nivel-" + modifierInfo.nivel} src={modifierInfo.imagen} alt="" />
            <h3 id={"nivel-" + modifierInfo.nivel}>{modifierInfo.nombre}</h3>
            <p>{modifierInfo.descripcion}</p>
            <p style={{ textAlign: "start" }}>
                Lvl: <strong id={"nivel-" + modifierInfo.nivel}>{modifierInfo.nivel}</strong>
            </p>
        </div>,
        document.body
    );
};

const Modifier = ({ modifierInfo, setSelectModifier, bigger }) => {
    const { addModifierToMatch } = useContext(matchContext);
    const { startButtonSound } = useContext(settingsContext);
    const [anchorRect, setAnchorRect] = useState(null);
    const imgRef = useRef(null);

    const handleMouseEnter = useCallback(() => {
        if (imgRef.current) {
            setAnchorRect(imgRef.current.getBoundingClientRect());
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setAnchorRect(null);
    }, []);

    if (setSelectModifier == null) {
        return (
            <Fragment>
                <div className="modifier-info-mini" onMouseLeave={handleMouseLeave}>
                    <img
                        ref={imgRef}
                        id={"nivel-" + modifierInfo.nivel}
                        className={bigger ? "bigger" : ""}
                        onMouseEnter={handleMouseEnter}
                        src={modifierInfo.imagen}
                        alt=""
                    />
                    {anchorRect && (
                        <ModifierPopover
                            modifierInfo={modifierInfo}
                            anchorRect={anchorRect}
                            onMouseLeave={handleMouseLeave}
                        />
                    )}
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div className="modifier-info">
                <h3 id={"nivel-" + modifierInfo.nivel}>{modifierInfo.nombre}</h3>
                <img id={"nivel-" + modifierInfo.nivel} src={modifierInfo.imagen} alt={modifierInfo.nombre} />
                <div>
                    <p>{modifierInfo.descripcion}</p>
                </div>
                <button onClick={(e) => { startButtonSound(e); addModifierToMatch(modifierInfo); setSelectModifier(false); }}>
                    Seleccionar
                </button>
            </div>
        </Fragment>
    );
};

export default Modifier;