import { Fragment } from "react";
import './CreditPage.css';
const CreditPage = () => {
    return (
        <Fragment>
            <div className="credits">
                <h1>Programador: <span className="span-1">Jorge Colomer</span></h1>
                <h1>Artista: <span className="span-2">Adrian Cutillas</span></h1>
                <h2>Testers: <span className="span-3">Lina Caldón</span> y <span className="span-4">Kenai Rivero</span></h2>
                <h3>Inspirado en las mecánicas de <a href="http://stfj.net/art/2011/Scoundrel.pdf">Scoundrel, creado por Zach Gage y Kurt Bieg</a></h3>
                <h4><span className="span-1">Scoundrel's Quest</span> es una obra independiente y no está afiliada ni respaldada por Zach Gage o Kurt Bieg.</h4>
                <h3>Dona para apoyar el 'proyecto'</h3>
                <a href='https://ko-fi.com/T1D625M9EV' target='_blank'><img height='36' style={{border:'0px',height:'36px'}} src='https://storage.ko-fi.com/cdn/kofi1.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
            </div>
        </Fragment>
    )
}
export default CreditPage;