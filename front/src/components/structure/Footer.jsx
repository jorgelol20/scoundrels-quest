import React, { useContext, useState } from "react";
import "./Footer.css";
import { NavLink } from "react-router-dom";
import { bugReportContext } from "../../context/BugReportProvider";

const Footer = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { openBugReport } = useContext(bugReportContext);

    const lastUpdate =
        import.meta.env.VITE_LAST_COMMIT_DATE || "No disponible";

    const toggleFooter = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <footer className={`footer ${isExpanded ? "expanded" : ""}`}>
            <button
                className="footer-toggle"
                onClick={toggleFooter}
                aria-expanded={isExpanded}
                aria-label="Expandir/Contraer navegación del footer"
            >
                <span className="toggle-icon">
                    ▲
                </span>
            </button>

            <div>
                <div className="footer-info">
                    V. Alfa · Última actualización: {lastUpdate}
                </div>

                <a
                    className="footer-link"
                    href="mailto:soporte@scoundrels-quest.com"
                >
                    soporte@scoundrels-quest.com
                </a>
            </div>



            <nav className="footer-nav" aria-label="Enlaces legales">
                <NavLink
                    onClick={(event) => {
                        event.preventDefault()
                        openBugReport()
                    }
                    }
                >
                    REPORTAR ERROR
                </NavLink>
                <NavLink to="/creditos">Créditos</NavLink>
                <NavLink to="/privacy">Privacidad</NavLink>
                <NavLink to="/cookies">Cookies</NavLink>
                <NavLink to="/terms">Términos de uso</NavLink>
                <NavLink to="/legal">Información legal</NavLink>
            </nav>
        </footer>
    );
};

export default Footer;