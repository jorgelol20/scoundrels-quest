import React, { Fragment } from "react";
import './Footer.css'
import { NavLink } from "react-router-dom";
const Footer = () => {
    
    return (
        <Fragment>
            <footer>
                <p>V. Alfa - Última acutlización: 29/08/2026</p>
                <a className="footer-link" href="mailto:soporte@scoundrels-quest.com">soporte@scoundrels-quest.com</a>
                <NavLink to={"/creditos"}>Créditos</NavLink>
            </footer>
        </Fragment>
    )
}
export default Footer;