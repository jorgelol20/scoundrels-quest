import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "../../i18n/format.js";
import "./LegalPage.css";

const UPDATED_AT = "2026-09-04T12:00:00Z";

const TermsPage = () => {
    const { t, i18n } = useTranslation("legal");

    return (
        <Fragment>
            <div className="legal-page">
                <h1>{t("terms.title")}</h1>

                <p className="legal-updated">
                    {t("terms.updatedAt", {
                        date: fmtDate(i18n.language, UPDATED_AT, {
                            dateStyle: "long",
                        }),
                    })}
                </p>

                <h2>{t("terms.s1.title")}</h2>

                <p>
                    {t("terms.s1.p1a")} <strong>{t("terms.s1.brandName")}</strong>
                    {t("terms.s1.p1b")}
                </p>

                <p>{t("terms.s1.p2")}</p>

                <p>{t("terms.s1.p3")}</p>

                <h2>{t("terms.s2.title")}</h2>

                <p>{t("terms.s2.p1")}</p>

                <p>{t("terms.s2.p2")}</p>

                <p>{t("terms.s2.p3")}</p>

                <p>{t("terms.s2.p4")}</p>

                <p>{t("terms.s2.p5")}</p>

                <h2>{t("terms.s3.title")}</h2>

                <p>{t("terms.s3.p1")}</p>

                <p>{t("terms.s3.p2")}</p>

                <p>{t("terms.s3.p3")}</p>

                <h2>{t("terms.s4.title")}</h2>

                <p>{t("terms.s4.p1")}</p>

                <p>{t("terms.s4.p2")}</p>

                <p>{t("terms.s4.p3")}</p>

                <p>{t("terms.s4.p4")}</p>

                <h2>{t("terms.s5.title")}</h2>

                <p>{t("terms.s5.p1")}</p>

                <p>{t("terms.s5.p2")}</p>

                <p>{t("terms.s5.p3")}</p>

                <p>{t("terms.s5.p4")}</p>

                <p>{t("terms.s5.p5")}</p>

                <p>{t("terms.s5.contactIntro")}</p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>

                <h2>{t("terms.s6.title")}</h2>

                <p>{t("terms.s6.p1")}</p>

                <p>{t("terms.s6.p2")}</p>

                <p>{t("terms.s6.p3")}</p>

                <p>{t("terms.s6.p4")}</p>

                <h2>{t("terms.s7.title")}</h2>

                <p>{t("terms.s7.p1")}</p>

                <p>{t("terms.s7.p2")}</p>

                <p>{t("terms.s7.p3")}</p>

                <h2>{t("terms.s8.title")}</h2>

                <p>{t("terms.s8.p1")}</p>

                <p>{t("terms.s8.p2")}</p>

                <p>{t("terms.s8.p3")}</p>

                <h2>{t("terms.s9.title")}</h2>

                <p>
                    {t("terms.s9.p1a")} <em>{t("terms.s9.gameName")}</em>
                    {t("terms.s9.p1b")}
                </p>

                <p>{t("terms.s9.p2")}</p>

                <p>{t("terms.s9.p3")}</p>

                <h2>{t("terms.s10.title")}</h2>

                <p>{t("terms.s10.p1")}</p>

                <p>{t("terms.s10.p2")}</p>

                <p>{t("terms.s10.p3")}</p>

                <p>{t("terms.s10.p4")}</p>

                <h2>{t("terms.s11.title")}</h2>

                <p>{t("terms.s11.p1")}</p>

                <p>{t("terms.s11.p2")}</p>

                <p>{t("terms.s11.p3")}</p>

                <h2>{t("terms.s12.title")}</h2>

                <p>{t("terms.s12.p1")}</p>

                <p>{t("terms.s12.p2")}</p>

                <p>{t("terms.s12.p3")}</p>

                <h2>{t("terms.s13.title")}</h2>

                <p>{t("terms.s13.p1")}</p>

                <p>{t("terms.s13.p2")}</p>

                <h2>{t("terms.s14.title")}</h2>

                <p>{t("terms.s14.p1")}</p>

                <p>{t("terms.s14.p2")}</p>

                <h2>{t("terms.s15.title")}</h2>

                <p>{t("terms.s15.p1")}</p>

                <p>{t("terms.s15.p2")}</p>

                <h2>{t("terms.s16.title")}</h2>

                <p>{t("terms.s16.contactIntro")}</p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>
            </div>
        </Fragment>
    );
};

export default TermsPage;
