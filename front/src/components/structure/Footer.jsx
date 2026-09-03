import React, { Fragment } from "react";
import "./Footer.css";
import { NavLink } from "react-router-dom";

const Footer = () => {
    const lastUpdate =
        import.meta.env.VITE_LAST_COMMIT_DATE || "No disponible";

    return (
        <Fragment>
            <footer className="footer">
                <p className="footer-info">
                    V. Alfa · Última actualización: {lastUpdate}
                </p>

                <a
                    className="footer-link"
                    href="mailto:soporte@scoundrels-quest.com"
                >
                    soporte@scoundrels-quest.com
                </a>

                <nav className="footer-nav" aria-label="Enlaces legales">
                    <NavLink to="/creditos">Créditos</NavLink>
                    <NavLink to="/privacy">Privacidad</NavLink>
                    <NavLink to="/cookies">Cookies</NavLink>
                    <NavLink to="/terms">Términos de uso</NavLink>
                    <NavLink to="/legal">Información legal</NavLink>
                </nav>
            </footer>
        </Fragment>
    );
};

export default Footer;