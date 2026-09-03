import { Fragment } from "react";
import "./LegalPage.css";

const PrivacyPage = () => {
    return (
        <Fragment>
            <div className="legal-page">
                <h1>Política de Privacidad</h1>

                <p className="legal-updated">
                    Última actualización: 3 de septiembre de 2026
                </p>

                <p>
                    En <strong>Scoundrel's Quest</strong> nos tomamos la
                    privacidad de los usuarios en serio. Esta política explica
                    qué datos personales se recopilan, para qué se utilizan y
                    cómo se protegen.
                </p>

                <h2>1. Responsable del tratamiento</h2>

                <p>
                    El responsable del tratamiento de los datos personales
                    tratados a través de Scoundrel's Quest es:
                </p>

                <ul>
                    <li>
                        <strong>Responsable:</strong> Jorge Colomer
                    </li>
                    <li>
                        <strong>Correo de contacto:</strong>{" "}
                        <a href="mailto:soporte@scoundrels-quest.com">
                            soporte@scoundrels-quest.com
                        </a>
                    </li>
                </ul>

                <h2>2. Datos que se recopilan</h2>

                <p>
                    Para crear y utilizar una cuenta de Scoundrel's Quest
                    pueden tratarse los siguientes datos:
                </p>

                <ul>
                    <li>
                        <strong>Nombre de usuario:</strong> para identificar la
                        cuenta dentro del juego.
                    </li>

                    <li>
                        <strong>Dirección de correo electrónico:</strong> para
                        gestionar e identificar la cuenta.
                    </li>

                    <li>
                        <strong>Contraseña:</strong> necesaria para la
                        autenticación de la cuenta.
                    </li>

                    <li>
                        <strong>Datos de las partidas:</strong> información
                        necesaria para guardar y asociar el progreso de las
                        partidas con la cuenta correspondiente.
                    </li>

                    <li>
                        <strong>Datos técnicos necesarios:</strong> aquellos
                        que puedan resultar necesarios para mantener la
                        autenticación, seguridad y funcionamiento del servicio.
                    </li>
                </ul>

                <h2>3. Uso de las contraseñas</h2>

                <p>
                    Las contraseñas de los usuarios no se almacenan en texto
                    plano.
                </p>

                <p>
                    La contraseña se almacena mediante un mecanismo de
                    <strong> hash</strong>, de forma que la contraseña original
                    no se conserva directamente en la base de datos.
                </p>

                <h2>4. Finalidad del tratamiento</h2>

                <p>
                    Los datos personales se utilizan exclusivamente para
                    proporcionar las funcionalidades necesarias de
                    Scoundrel's Quest.
                </p>

                <p>En particular, se utilizan para:</p>

                <ul>
                    <li>Crear y gestionar la cuenta del usuario.</li>
                    <li>Permitir el inicio de sesión.</li>
                    <li>Mantener la sesión autenticada.</li>
                    <li>
                        Guardar las partidas y asociarlas con la cuenta del
                        usuario.
                    </li>
                    <li>
                        Mantener el funcionamiento y la seguridad básica del
                        servicio.
                    </li>
                </ul>

                <h2>5. Base jurídica</h2>

                <p>
                    El tratamiento de los datos necesarios para crear la
                    cuenta, autenticar al usuario y prestar las funcionalidades
                    solicitadas se basa en la ejecución de la relación de
                    servicio solicitada por el propio usuario.
                </p>

                <p>
                    Cuando sea necesario tratar determinados datos para la
                    seguridad y protección del servicio, dicho tratamiento
                    podrá basarse en el interés legítimo del responsable, de
                    acuerdo con la normativa aplicable.
                </p>

                <h2>6. Inicio de sesión mediante terceros</h2>

                <p>
                    Scoundrel's Quest permite iniciar sesión utilizando
                    determinados proveedores externos de autenticación, como
                    Google y X.
                </p>

                <p>
                    Cuando el usuario elige esta opción, el proveedor
                    correspondiente puede comunicar a Scoundrel's Quest los
                    datos necesarios para identificar la cuenta y realizar la
                    autenticación.
                </p>

                <p>
                    Scoundrel's Quest únicamente utiliza los datos recibidos
                    que sean necesarios para crear, identificar y mantener la
                    cuenta del usuario.
                </p>

                <p>
                    El tratamiento realizado directamente por Google o X se
                    encuentra sujeto a las respectivas políticas de privacidad
                    de dichos servicios.
                </p>

                <h2>7. Datos de las partidas</h2>

                <p>
                    Para permitir que los usuarios continúen sus partidas en
                    diferentes sesiones, determinados datos relacionados con
                    el progreso del juego se almacenan y se asocian a su
                    cuenta.
                </p>

                <p>
                    Estos datos se utilizan únicamente para proporcionar la
                    funcionalidad de guardado y persistencia del juego.
                </p>

                <h2>8. Almacenamiento</h2>

                <p>
                    Los datos asociados a las cuentas de usuario se almacenan
                    en una base de datos <strong>MySQL</strong> alojada en un
                    servidor privado virtual (VPS) proporcionado por
                    <strong>IONOS</strong>.
                </p>

                <p>
                    La infraestructura utilizada para ejecutar Scoundrel's
                    Quest se encuentra bajo control del responsable del
                    proyecto, dentro de las posibilidades proporcionadas por
                    el proveedor de alojamiento.
                </p>

                <h2>9. Cloudflare</h2>

                <p>
                    Scoundrel's Quest utiliza servicios de Cloudflare para
                    determinadas funciones de infraestructura, seguridad y
                    protección del servicio.
                </p>

                <p>
                    En función de la configuración utilizada, Cloudflare puede
                    tratar determinados datos técnicos de las solicitudes
                    realizadas al sitio web, como direcciones IP, información
                    del navegador o información necesaria para detectar y
                    prevenir usos maliciosos del servicio.
                </p>

                <p>
                    Estos tratamientos tienen como finalidad proporcionar,
                    proteger y mantener el funcionamiento del servicio.
                </p>

                <h2>10. Google Search Console</h2>

                <p>
                    El sitio web puede utilizar Google Search Console para
                    supervisar la presencia y el funcionamiento del sitio en
                    los resultados de búsqueda.
                </p>

                <p>
                    Esta herramienta se utiliza con fines de administración y
                    supervisión del sitio web y no para realizar perfiles
                    publicitarios de los jugadores.
                </p>

                <h2>11. Analítica y publicidad</h2>

                <p>
                    Scoundrel's Quest no utiliza Google Analytics ni otras
                    herramientas de analítica destinadas a realizar perfiles
                    de comportamiento de los jugadores.
                </p>

                <p>
                    El sitio tampoco utiliza publicidad personalizada ni
                    vende los datos personales de sus usuarios.
                </p>

                <h2>12. Donaciones</h2>

                <p>
                    Scoundrel's Quest es un proyecto gratuito.
                </p>

                <p>
                    El proyecto puede incluir un enlace voluntario a Ko-fi
                    para aquellas personas que quieran realizar una donación
                    y apoyar su desarrollo.
                </p>

                <p>
                    La realización de una donación no es necesaria para jugar
                    ni para utilizar las funcionalidades de Scoundrel's Quest.
                </p>

                <p>
                    Los pagos o datos introducidos directamente en Ko-fi son
                    gestionados por dicho servicio y están sujetos a sus
                    propias condiciones y políticas de privacidad.
                </p>

                <h2>13. Conservación de los datos</h2>

                <p>
                    Los datos de la cuenta y las partidas se conservarán
                    mientras la cuenta permanezca activa y sean necesarios
                    para proporcionar las funcionalidades del servicio.
                </p>

                <p>
                    Cuando corresponda, los datos podrán eliminarse o
                    anonimizarse cuando dejen de ser necesarios o cuando el
                    usuario solicite la eliminación de su cuenta, salvo que
                    exista una obligación legal que requiera conservarlos.
                </p>

                <h2>14. Derechos de los usuarios</h2>

                <p>
                    El usuario puede ejercer, cuando sean aplicables, los
                    derechos reconocidos por la normativa de protección de
                    datos, incluyendo:
                </p>

                <ul>
                    <li>Derecho de acceso.</li>
                    <li>Derecho de rectificación.</li>
                    <li>Derecho de supresión.</li>
                    <li>Derecho a la limitación del tratamiento.</li>
                    <li>Derecho de oposición.</li>
                    <li>Derecho a la portabilidad de los datos.</li>
                </ul>

                <p>
                    Para ejercer estos derechos puede ponerse en contacto
                    mediante:
                </p>

                <p>
                    <a href="mailto:soporte@scoundrels-quest.com">
                        soporte@scoundrels-quest.com
                    </a>
                </p>

                <p>
                    La solicitud deberá permitir identificar suficientemente
                    la cuenta a la que se refiere.
                </p>

                <p>
                    Si el usuario considera que el tratamiento de sus datos
                    personales no cumple la normativa aplicable, también puede
                    presentar una reclamación ante la Agencia Española de
                    Protección de Datos (AEPD).
                </p>

                <h2>15. Seguridad</h2>

                <p>
                    Se aplican medidas técnicas y organizativas razonables
                    para proteger los datos personales frente a accesos no
                    autorizados, pérdida, alteración o divulgación.
                </p>

                <p>
                    Entre otras medidas, las contraseñas se almacenan mediante
                    hash y no en texto plano.
                </p>

                <h2>16. Cambios en esta política</h2>

                <p>
                    Esta política de privacidad puede actualizarse cuando sea
                    necesario para reflejar cambios en Scoundrel's Quest, en
                    los tratamientos de datos realizados o en la normativa
                    aplicable.
                </p>

                <p>
                    La versión vigente estará siempre disponible en esta
                    página.
                </p>
            </div>
        </Fragment>
    );
};

export default PrivacyPage;