import React, { Fragment, useContext, useEffect, useState } from "react";
import './Banner.css'
import { settingsContext } from "../../context/SettingsProvider";

const Banner = () => {
    const {bannerImage} = useContext(settingsContext)

    return (
        <Fragment>
            <div className="banner">
                <img 
                    src={bannerImage} 
                    alt="Banner"
                    loading="lazy"
                />
            </div>
        </Fragment>
    )
}
export default Banner