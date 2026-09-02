import React, { Fragment } from "react";
import './Footer.css'
import { NavLink } from "react-router-dom";
const Footer = () => {
    const lastUpdate = import.meta.env.VITE_LAST_COMMIT_DATE || 'No disponible';
    return (
        <Fragment>
            <footer>
                <p>V. Alfa - Última acutlización: {lastUpdate}</p>
                <a className="footer-link" href="mailto:soporte@scoundrels-quest.com">soporte@scoundrels-quest.com</a>
                <NavLink to={"/creditos"}>Créditos</NavLink>
            </footer>
        </Fragment>
    )
}
export default Footer;