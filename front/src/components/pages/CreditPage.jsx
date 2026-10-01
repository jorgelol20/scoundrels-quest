import { Fragment } from "react";
import { useTranslation } from 'react-i18next';
import './CreditPage.css';
const CreditPage = () => {
    const { t } = useTranslation('credits');
    return (
        <Fragment>
            <div className="credits">
                <h1>{t('programmer')} <span className="span-1">Jorge Colomer</span></h1>
                <h1>{t('artist')} <span className="span-2">Adrian Cutillas</span></h1>
                <h2>{t('testers')} <span className="span-3">Lina Caldón</span>{t('testersJoin')} <span className="span-4">Kenai Rivero</span></h2>
                <h3>{t('inspired')} <a href="http://stfj.net/art/2011/Scoundrel.pdf">Scoundrel, creado por Zach Gage y Kurt Bieg</a></h3>
                <h4><span className="span-1">Scoundrel's Quest</span> {t('independent')}</h4>
                <h3>{t('donate')}</h3>
                <a href='https://ko-fi.com/T1D625M9EV' target='_blank'><img height='36' style={{border:'0px',height:'36px'}} src='https://storage.ko-fi.com/cdn/kofi1.png?v=6' border='0' alt={t('kofiAlt')} /></a>
            </div>
        </Fragment>
    )
}
export default CreditPage;
