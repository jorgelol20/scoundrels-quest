import { Fragment } from "react";
import "./LegalPage.css";

const CookiesPage = () => {
    return (
        <Fragment>
            <div className="legal-page">
                <h1>Política de Cookies</h1>

                <p className="legal-updated">
                    Última actualización: 3 de septiembre de 2026
                </p>

                <h2>1. ¿Qué son las cookies?</h2>

                <p>
                    Las cookies son pequeños archivos o identificadores que
                    pueden almacenarse en el dispositivo del usuario cuando
                    visita un sitio web.
                </p>

                <p>
                    Pueden utilizarse para diferentes finalidades, como
                    mantener una sesión, guardar preferencias, realizar
                    análisis estadísticos o mostrar publicidad personalizada.
                </p>

                <h2>2. Cookies utilizadas por Scoundrel's Quest</h2>

                <p>
                    Scoundrel's Quest utiliza únicamente cookies y tecnologías
                    similares que resultan necesarias para el funcionamiento
                    del servicio, cuando estas son necesarias.
                </p>

                <p>
                    Estas tecnologías pueden utilizarse, entre otras cosas,
                    para:
                </p>

                <ul>
                    <li>
                        Mantener la sesión de un usuario que ha iniciado
                        sesión.
                    </li>

                    <li>
                        Permitir la autenticación de la cuenta.
                    </li>

                    <li>
                        Mantener determinadas preferencias necesarias para el
                        funcionamiento del sitio.
                    </li>

                    <li>
                        Aplicar medidas de seguridad y protección frente a usos
                        maliciosos.
                    </li>
                </ul>

                <h2>3. Cookies de Cloudflare</h2>

                <p>
                    Scoundrel's Quest utiliza determinados servicios de
                    Cloudflare relacionados con la infraestructura y seguridad
                    del sitio.
                </p>

                <p>
                    Dependiendo de los servicios y configuración utilizados,
                    Cloudflare puede utilizar cookies técnicas necesarias para
                    funciones como la seguridad, detección de bots,
                    protección frente a abusos o distribución de tráfico.
                </p>

                <p>
                    Estas cookies no son utilizadas por Scoundrel's Quest para
                    realizar perfiles publicitarios de los usuarios.
                </p>

                <h2>4. Cookies de analítica</h2>

                <p>
                    Scoundrel's Quest no utiliza Google Analytics ni otras
                    herramientas de analítica que requieran cookies de
                    seguimiento para analizar el comportamiento de los
                    jugadores.
                </p>

                <h2>5. Cookies publicitarias</h2>

                <p>
                    Scoundrel's Quest no utiliza cookies publicitarias ni
                    tecnologías destinadas a mostrar publicidad personalizada.
                </p>

                <h2>6. Consentimiento</h2>

                <p>
                    Las cookies estrictamente necesarias para proporcionar las
                    funcionalidades solicitadas por el usuario pueden estar
                    exceptuadas de la obligación de obtener consentimiento
                    conforme a la normativa aplicable.
                </p>

                <p>
                    Si en el futuro se incorporasen cookies o tecnologías que
                    no fueran estrictamente necesarias para el funcionamiento
                    del servicio, se revisaría esta política y, cuando fuera
                    necesario, se solicitaría el consentimiento del usuario
                    antes de utilizarlas.
                </p>

                <h2>7. Gestión de cookies</h2>

                <p>
                    El usuario también puede gestionar o eliminar las cookies
                    mediante las opciones de configuración de su navegador.
                </p>

                <p>
                    La desactivación de determinadas cookies técnicas puede
                    provocar que algunas funciones de Scoundrel's Quest no
                    funcionen correctamente, especialmente aquellas
                    relacionadas con el inicio de sesión y la sesión del
                    usuario.
                </p>

                <h2>8. Más información</h2>

                <p>
                    Para cualquier cuestión relacionada con las cookies puede
                    contactarse mediante:
                </p>

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