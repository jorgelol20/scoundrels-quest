import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "../../i18n/format.js";
import "./LegalPage.css";

const UPDATED_AT = "2026-09-05T12:00:00Z";

const PrivacyPage = () => {
    const { t, i18n } = useTranslation("legal");

    return (
        <Fragment>
            <div className="legal-page">
                <h1>{t("privacy.title")}</h1>

                <p className="legal-updated">
                    {t("privacy.updatedAt", {
                        date: fmtDate(i18n.language, UPDATED_AT, {
                            dateStyle: "long",
                        }),
                    })}
                </p>

                <h2>{t("privacy.s1.title")}</h2>

                <p>{t("privacy.s1.p1")}</p>

                <p>
                    <strong>{t("privacy.s1.name")}</strong>
                    <br />
                    {t("privacy.s1.project")}
                    <br />
                    {t("privacy.s1.emailLabel")}{" "}
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>

                <p>{t("privacy.s1.p2")}</p>

                <h2>{t("privacy.s2.title")}</h2>

                <p>{t("privacy.s2.intro")}</p>

                <ul>
                    <li>
                        <strong>{t("privacy.s2.li1.label")}</strong>{" "}
                        {t("privacy.s2.li1.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li2.label")}</strong>{" "}
                        {t("privacy.s2.li2.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li3.label")}</strong>{" "}
                        {t("privacy.s2.li3.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li4.label")}</strong>{" "}
                        {t("privacy.s2.li4.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li5.label")}</strong>{" "}
                        {t("privacy.s2.li5.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li6.label")}</strong>{" "}
                        {t("privacy.s2.li6.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li7.label")}</strong>{" "}
                        {t("privacy.s2.li7.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li8.label")}</strong>{" "}
                        {t("privacy.s2.li8.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s2.li9.label")}</strong>{" "}
                        {t("privacy.s2.li9.text")}
                    </li>
                </ul>

                <h2>{t("privacy.s3.title")}</h2>

                <p>{t("privacy.s3.p1")}</p>

                <p>{t("privacy.s3.p2")}</p>

                <h2>{t("privacy.s4.title")}</h2>

                <p>{t("privacy.s4.intro")}</p>

                <ul>
                    <li>{t("privacy.s4.li1")}</li>
                    <li>{t("privacy.s4.li2")}</li>
                    <li>{t("privacy.s4.li3")}</li>
                    <li>{t("privacy.s4.li4")}</li>
                    <li>{t("privacy.s4.li5")}</li>
                    <li>{t("privacy.s4.li6")}</li>
                    <li>{t("privacy.s4.li7")}</li>
                    <li>{t("privacy.s4.li8")}</li>
                    <li>{t("privacy.s4.li9")}</li>
                    <li>{t("privacy.s4.li10")}</li>
                    <li>{t("privacy.s4.li11")}</li>
                </ul>

                <h2>{t("privacy.s5.title")}</h2>

                <p>{t("privacy.s5.p1")}</p>

                <p>{t("privacy.s5.p2")}</p>

                <ul>
                    <li>{t("privacy.s5.li1")}</li>
                    <li>{t("privacy.s5.li2")}</li>
                    <li>{t("privacy.s5.li3")}</li>
                </ul>

                <p>{t("privacy.s5.p3")}</p>

                <h2>{t("privacy.s6.title")}</h2>

                <p>{t("privacy.s6.p1")}</p>

                <p>{t("privacy.s6.p2")}</p>

                <p>{t("privacy.s6.p3")}</p>

                <h2>{t("privacy.s7.title")}</h2>

                <p>{t("privacy.s7.p1")}</p>

                <p>{t("privacy.s7.p2")}</p>

                <p>{t("privacy.s7.p3")}</p>

                <h2>{t("privacy.s8.title")}</h2>

                <p>{t("privacy.s8.p1")}</p>

                <p>{t("privacy.s8.p2")}</p>

                <p>{t("privacy.s8.p3")}</p>

                <p>{t("privacy.s8.p4")}</p>

                <h2>{t("privacy.s9.title")}</h2>

                <p>{t("privacy.s9.p1")}</p>

                <p>{t("privacy.s9.p2")}</p>

                <h2>{t("privacy.s10.title")}</h2>

                <p>{t("privacy.s10.p1")}</p>

                <p>{t("privacy.s10.p2")}</p>

                <p>{t("privacy.s10.p3")}</p>

                <p>{t("privacy.s10.p4")}</p>

                <p>{t("privacy.s10.p5")}</p>

                <h2>{t("privacy.s11.title")}</h2>

                <p>{t("privacy.s11.p1")}</p>

                <p>{t("privacy.s11.p2")}</p>

                <h2>{t("privacy.s12.title")}</h2>

                <p>{t("privacy.s12.p1")}</p>

                <p>{t("privacy.s12.intro")}</p>

                <ul>
                    <li>{t("privacy.s12.li1")}</li>
                    <li>{t("privacy.s12.li2")}</li>
                    <li>{t("privacy.s12.li3")}</li>
                    <li>{t("privacy.s12.li4")}</li>
                    <li>{t("privacy.s12.li5")}</li>
                    <li>{t("privacy.s12.li6")}</li>
                    <li>{t("privacy.s12.li7")}</li>
                    <li>{t("privacy.s12.li8")}</li>
                </ul>

                <p>{t("privacy.s12.outro")}</p>

                <h2>{t("privacy.s13.title")}</h2>

                <p>{t("privacy.s13.p1")}</p>

                <p>{t("privacy.s13.p2")}</p>

                <p>{t("privacy.s13.intro")}</p>

                <ul>
                    <li>{t("privacy.s13.li1")}</li>
                    <li>{t("privacy.s13.li2")}</li>
                    <li>{t("privacy.s13.li3")}</li>
                    <li>{t("privacy.s13.li4")}</li>
                    <li>{t("privacy.s13.li5")}</li>
                    <li>{t("privacy.s13.li6")}</li>
                    <li>{t("privacy.s13.li7")}</li>
                </ul>

                <p>{t("privacy.s13.p3")}</p>

                <p>{t("privacy.s13.p4")}</p>

                <p>{t("privacy.s13.p5")}</p>

                <h2>{t("privacy.s14.title")}</h2>

                <p>{t("privacy.s14.p1")}</p>

                <p>{t("privacy.s14.p2")}</p>

                <h2>{t("privacy.s15.title")}</h2>

                <p>{t("privacy.s15.p1")}</p>

                <p>{t("privacy.s15.p2")}</p>

                <h2>{t("privacy.s16.title")}</h2>

                <p>{t("privacy.s16.p1")}</p>

                <p>{t("privacy.s16.p2")}</p>

                <p>{t("privacy.s16.p3")}</p>

                <h2>{t("privacy.s17.title")}</h2>

                <p>{t("privacy.s17.p1")}</p>

                <p>{t("privacy.s17.p2")}</p>

                <h2>{t("privacy.s18.title")}</h2>

                <p>{t("privacy.s18.p1")}</p>

                <p>{t("privacy.s18.p2")}</p>

                <h2>{t("privacy.s19.title")}</h2>

                <p>{t("privacy.s19.p1")}</p>

                <p>{t("privacy.s19.p2")}</p>

                <p>
                    {t("privacy.s19.p3a")} <a href="/cookies">
                        {t("privacy.s19.linkLabel")}
                    </a>
                    {t("privacy.s19.p3b")}
                </p>

                <h2>{t("privacy.s20.title")}</h2>

                <p>{t("privacy.s20.p1")}</p>

                <p>{t("privacy.s20.p2")}</p>

                <p>{t("privacy.s20.p3")}</p>

                <h2>{t("privacy.s21.title")}</h2>

                <p>{t("privacy.s21.p1")}</p>

                <p>{t("privacy.s21.p2")}</p>

                <p>{t("privacy.s21.p3")}</p>

                <h2>{t("privacy.s22.title")}</h2>

                <p>{t("privacy.s22.p1")}</p>

                <p>{t("privacy.s22.intro")}</p>

                <ul>
                    <li>
                        <strong>{t("privacy.s22.li1.label")}</strong>
                        {t("privacy.s22.li1.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s22.li2.label")}</strong>
                        {t("privacy.s22.li2.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s22.li3.label")}</strong>
                        {t("privacy.s22.li3.text")}
                    </li>

                    <li>
                        <strong>{t("privacy.s22.li4.label")}</strong>
                        {t("privacy.s22.li4.text")}
                    </li>
                </ul>

                <p>{t("privacy.s22.outro")}</p>

                <h2>{t("privacy.s23.title")}</h2>

                <p>{t("privacy.s23.p1")}</p>

                <p>{t("privacy.s23.p2")}</p>

                <p>{t("privacy.s23.p3")}</p>

                <h2>{t("privacy.s24.title")}</h2>

                <p>{t("privacy.s24.p1")}</p>

                <p>{t("privacy.s24.intro")}</p>

                <ul>
                    <li>{t("privacy.s24.li1")}</li>
                    <li>{t("privacy.s24.li2")}</li>
                    <li>{t("privacy.s24.li3")}</li>
                    <li>{t("privacy.s24.li4")}</li>
                    <li>{t("privacy.s24.li5")}</li>
                    <li>{t("privacy.s24.li6")}</li>
                </ul>

                <p>{t("privacy.s24.contactIntro")}</p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>

                <p>{t("privacy.s24.verify")}</p>

                <h2>{t("privacy.s25.title")}</h2>

                <p>{t("privacy.s25.p1")}</p>

                <p>
                    {t("privacy.s25.p2a")}{" "}
                    <strong>{t("privacy.s25.authority")}</strong>
                    {t("privacy.s25.p2b")}
                </p>

                <h2>{t("privacy.s26.title")}</h2>

                <p>{t("privacy.s26.p1")}</p>

                <p>
                    {t("privacy.s26.p2a")}{" "}
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>{" "}
                    {t("privacy.s26.p2b")}
                </p>

                <h2>{t("privacy.s27.title")}</h2>

                <p>{t("privacy.s27.p1")}</p>

                <p>{t("privacy.s27.p2")}</p>

                <p>{t("privacy.s27.p3")}</p>

                <h2>{t("privacy.s28.title")}</h2>

                <p>{t("privacy.s28.p1")}</p>

                <p>{t("privacy.s28.p2")}</p>

                <h2>{t("privacy.s29.title")}</h2>

                <p>{t("privacy.s29.p1")}</p>

                <p>{t("privacy.s29.p2")}</p>

                <p>
                    <a
                        href="https://github.com/jorgelol20/scoundrels-quest"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        github.com/jorgelol20/scoundrels-quest
                    </a>
                </p>

                <p>{t("privacy.s29.p3")}</p>

                <p>{t("privacy.s29.p4")}</p>

                <h2>{t("privacy.s30.title")}</h2>

                <p>{t("privacy.s30.p1")}</p>

                <p>{t("privacy.s30.p2")}</p>

                <h2>{t("privacy.s31.title")}</h2>

                <p>{t("privacy.s31.p1")}</p>

                <p>{t("privacy.s31.p2")}</p>

                <h2>{t("privacy.s32.title")}</h2>

                <p>{t("privacy.s32.contactIntro")}</p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>
            </div>
        </Fragment>
    );
};

export default PrivacyPage;
