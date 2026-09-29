import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "../../i18n/format.js";
import "./LegalPage.css";

const UPDATED_AT = "2026-09-04T12:00:00Z";

const CookiesPage = () => {
    const { t, i18n } = useTranslation("legal");

    return (
        <Fragment>
            <div className="legal-page">
                <h1>{t("cookies.title")}</h1>

                <p className="legal-updated">
                    {t("cookies.updatedAt", {
                        date: fmtDate(i18n.language, UPDATED_AT, {
                            dateStyle: "long",
                        }),
                    })}
                </p>

                <h2>{t("cookies.s1.title")}</h2>

                <p>{t("cookies.s1.p1")}</p>

                <p>{t("cookies.s1.p2")}</p>

                <h2>{t("cookies.s2.title")}</h2>

                <p>{t("cookies.s2.p1")}</p>

                <p>{t("cookies.s2.intro")}</p>

                <ul>
                    <li>{t("cookies.s2.li1")}</li>

                    <li>{t("cookies.s2.li2")}</li>

                    <li>{t("cookies.s2.li3")}</li>

                    <li>{t("cookies.s2.li4")}</li>
                </ul>

                <h2>{t("cookies.s3.title")}</h2>

                <p>{t("cookies.s3.p1")}</p>

                <p>{t("cookies.s3.p2")}</p>

                <p>{t("cookies.s3.p3")}</p>

                <h2>{t("cookies.s4.title")}</h2>

                <p>{t("cookies.s4.p1")}</p>

                <p>{t("cookies.s4.p2")}</p>

                <h2>{t("cookies.s5.title")}</h2>

                <p>{t("cookies.s5.p1")}</p>

                <p>{t("cookies.s5.p2")}</p>

                <p>{t("cookies.s5.p3")}</p>

                <h2>{t("cookies.s6.title")}</h2>

                <p>{t("cookies.s6.p1")}</p>

                <p>{t("cookies.s6.p2")}</p>

                <h2>{t("cookies.s7.title")}</h2>

                <p>{t("cookies.s7.p1")}</p>

                <p>{t("cookies.s7.p2")}</p>

                <h2>{t("cookies.s8.title")}</h2>

                <p>{t("cookies.s8.p1")}</p>

                <h2>{t("cookies.s9.title")}</h2>

                <p>{t("cookies.s9.p1")}</p>

                <p>{t("cookies.s9.p2")}</p>

                <h2>{t("cookies.s10.title")}</h2>

                <p>{t("cookies.s10.p1")}</p>

                <p>{t("cookies.s10.p2")}</p>

                <h2>{t("cookies.s11.title")}</h2>

                <p>{t("cookies.s11.p1")}</p>

                <p>{t("cookies.s11.p2")}</p>

                <h2>{t("cookies.s12.title")}</h2>

                <p>{t("cookies.s12.contactIntro")}</p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>
            </div>
        </Fragment>
    );
};

export default CookiesPage;
