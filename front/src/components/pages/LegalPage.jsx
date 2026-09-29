import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "../../i18n/format.js";
import "./LegalPage.css";

const UPDATED_AT = "2026-09-04T12:00:00Z";

const LegalPage = () => {
    const { t, i18n } = useTranslation("legal");

    return (
        <Fragment>
            <div className="legal">
                <div className="legal-page">
                    <h1>{t("legal.title")}</h1>

                    <p className="legal-updated">
                        {t("legal.updatedAt", {
                            date: fmtDate(i18n.language, UPDATED_AT, {
                                dateStyle: "long",
                            }),
                        })}
                    </p>

                    <h2>{t("legal.s1.title")}</h2>

                    <p>
                        <strong>{t("legal.s1.brandName")}</strong>{" "}
                        {t("legal.s1.p1b")}
                    </p>

                    <ul>
                        <li>
                            <strong>{t("legal.s1.li1.label")}</strong>{" "}
                            {t("legal.s1.li1.text")}
                        </li>

                        <li>
                            <strong>{t("legal.s1.li2.label")}</strong>{" "}
                            <a href="mailto:soporte@scoundrels-quest.com">
                                soporte@scoundrels-quest.com
                            </a>
                        </li>

                        <li>
                            <strong>{t("legal.s1.li3.label")}</strong>{" "}
                            {t("legal.s1.li3.text")}
                        </li>
                    </ul>

                    <p>{t("legal.s1.p2")}</p>

                    <h2>{t("legal.s2.title")}</h2>

                    <p>{t("legal.s2.p1")}</p>

                    <p>{t("legal.s2.p2")}</p>

                    <h2>{t("legal.s3.title")}</h2>

                    <p>{t("legal.s3.p1")}</p>

                    <p>{t("legal.s3.p2")}</p>

                    <h2>{t("legal.s4.title")}</h2>

                    <p>
                        {t("legal.s4.p1a")} <em>{t("legal.s4.gameName")}</em>
                        {t("legal.s4.p1b")}
                    </p>

                    <p>{t("legal.s4.p2")}</p>

                    <p>{t("legal.s4.p3")}</p>

                    <h2>{t("legal.s5.title")}</h2>

                    <p>{t("legal.s5.p1")}</p>

                    <p>{t("legal.s5.p2")}</p>

                    <p>{t("legal.s5.p3")}</p>

                    <h2>{t("legal.s6.title")}</h2>

                    <p>{t("legal.s6.p1")}</p>

                    <p>{t("legal.s6.p2")}</p>

                    <p>{t("legal.s6.p3")}</p>

                    <h2>{t("legal.s7.title")}</h2>

                    <p>{t("legal.s7.p1")}</p>

                    <p>{t("legal.s7.p2")}</p>

                    <p>{t("legal.s7.p3")}</p>

                    <h2>{t("legal.s8.title")}</h2>

                    <p>{t("legal.s8.intro")}</p>

                    <ul>
                        <li>{t("legal.s8.li1")}</li>
                        <li>{t("legal.s8.li2")}</li>
                        <li>{t("legal.s8.li3")}</li>
                        <li>{t("legal.s8.li4")}</li>
                        <li>{t("legal.s8.li5")}</li>
                    </ul>

                    <p>{t("legal.s8.outro")}</p>

                    <h2>{t("legal.s9.title")}</h2>

                    <p>
                        {t("legal.s9.p1a")} <a href="/privacy">
                            {t("legal.s9.linkLabel")}
                        </a>
                        {t("legal.s9.p1b")}
                    </p>

                    <h2>{t("legal.s10.title")}</h2>

                    <p>
                        {t("legal.s10.p1a")} <a href="/cookies">
                            {t("legal.s10.linkLabel")}
                        </a>
                        {t("legal.s10.p1b")}
                    </p>

                    <h2>{t("legal.s11.title")}</h2>

                    <p>{t("legal.s11.p1")}</p>

                    <p>{t("legal.s11.p2")}</p>

                    <p>
                        {t("legal.s11.p3a")} <a href="/terms">
                            {t("legal.s11.linkLabel")}
                        </a>
                        {t("legal.s11.p3b")}
                    </p>

                    <h2>{t("legal.s12.title")}</h2>

                    <p>{t("legal.s12.contactIntro")}</p>

                    <p>
                        <a href="mailto:soporte@scoundrels-quest.com">
                            soporte@scoundrels-quest.com
                        </a>
                    </p>
                </div>
            </div>
        </Fragment>
    );
};

export default LegalPage;
