import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import './Banner.css'
import { settingsContext } from "../../context/SettingsProvider";

const Banner = () => {
    const {bannerImage} = useContext(settingsContext)
    const { t } = useTranslation('nav');

    return (
        <Fragment>
            <div className="banner">
                <img 
                    src={bannerImage} 
                    alt={t('footer.bannerAlt')}
                    loading="lazy"
                />
            </div>
        </Fragment>
    )
}
export default Banner