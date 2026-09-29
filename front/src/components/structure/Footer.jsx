import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Footer.css";
import { NavLink } from "react-router-dom";
import { bugReportContext } from "../../context/BugReportProvider";
import { fmtDate } from "../../i18n/format.js";

const Footer = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { openBugReport } = useContext(bugReportContext);
    const { t, i18n } = useTranslation('nav');

    const lastCommitDate = import.meta.env.VITE_LAST_COMMIT_DATE;
    const formattedDate = lastCommitDate ? fmtDate(i18n.language, lastCommitDate) : '';
    const lastUpdate = formattedDate || t('footer.dateUnavailable');

    const toggleFooter = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <footer className={`footer ${isExpanded ? "expanded" : ""}`}>
            <button
                className="footer-toggle"
                onClick={toggleFooter}
                aria-expanded={isExpanded}
                aria-label={t('footer.toggleLabel')}
            >
                <span className="toggle-icon">
                    ▲
                </span>
            </button>

            <div>
                <div className="footer-info">
                    {t('footer.versionAndDate', { date: lastUpdate })}
                </div>

                <a
                    className="footer-link"
                    href="mailto:soporte@scoundrels-quest.com"
                >
                    {t('footer.support')}
                </a>
            </div>



            <nav className="footer-nav" aria-label={t('footer.legalNavLabel')}>
                <NavLink
                    onClick={(event) => {
                        event.preventDefault()
                        openBugReport()
                    }
                    }
                >
                    {t('footer.reportError')}
                </NavLink>
                <NavLink to="/creditos">{t('footer.credits')}</NavLink>
                <NavLink to="/privacy">{t('footer.privacy')}</NavLink>
                <NavLink to="/cookies">{t('footer.cookies')}</NavLink>
                <NavLink to="/terms">{t('footer.terms')}</NavLink>
                <NavLink to="/legal">{t('footer.legal')}</NavLink>
            </nav>
        </footer>
    );
};

export default Footer;