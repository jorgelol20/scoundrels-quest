import { Fragment } from "react";
import "./LegalPage.css";

const LegalPage = () => {
    return (
        <Fragment>
            <div className="legal">
                <div className="legal-page">
                    <h1>Información legal</h1>

                    <p className="legal-updated">
                        Última actualización: 4 de septiembre de 2026
                    </p>

                    <h2>1. Identificación del proyecto</h2>

                    <p>
                        <strong>Scoundrel's Quest</strong> es un proyecto
                        independiente de videojuego desarrollado como proyecto
                        personal.
                    </p>

                    <ul>
                        <li>
                            <strong>Responsable del proyecto:</strong> Jorge
                            Colomer
                        </li>

                        <li>
                            <strong>Correo de contacto:</strong>{" "}
                            <a href="mailto:soporte@scoundrels-quest.com">
                                soporte@scoundrels-quest.com
                            </a>
                        </li>

                        <li>
                            <strong>Dominio:</strong> scoundrels-quest.com
                        </li>
                    </ul>

                    <p>
                        El proyecto se ofrece gratuitamente y actualmente no
                        contiene publicidad.
                    </p>

                    <h2>2. Naturaleza del proyecto</h2>

                    <p>
                        Scoundrel's Quest es un proyecto personal desarrollado
                        con fines de entretenimiento, aprendizaje y desarrollo
                        de software.
                    </p>

                    <p>
                        Actualmente no se cobra por el acceso al juego ni se
                        requiere ningún pago para utilizar sus funcionalidades.
                    </p>

                    <h2>3. Propiedad intelectual</h2>

                    <p>
                        El código, ilustraciones, personajes, diseños, textos y
                        demás elementos originales creados específicamente para
                        Scoundrel's Quest pertenecen a sus respectivos autores
                        o se utilizan con la autorización correspondiente.
                    </p>

                    <p>
                        Salvo que la legislación aplicable permita lo
                        contrario, no está permitida la reproducción,
                        distribución, modificación o explotación de los
                        contenidos originales sin la autorización
                        correspondiente.
                    </p>

                    <h2>4. Inspiración en Scoundrel</h2>

                    <p>
                        Scoundrel's Quest está inspirado en las mecánicas del
                        juego <em>Scoundrel</em>, creado por Zach Gage y Kurt
                        Bieg.
                    </p>

                    <p>
                        Scoundrel's Quest es una obra independiente y no está
                        afiliada, patrocinada, autorizada ni respaldada por
                        Zach Gage o Kurt Bieg.
                    </p>

                    <p>
                        Las ilustraciones, personajes, diseños y demás
                        elementos artísticos propios de Scoundrel's Quest han
                        sido creados específicamente para este proyecto.
                    </p>

                    <h2>5. Servicio gratuito</h2>

                    <p>
                        El acceso a Scoundrel's Quest es gratuito.
                    </p>

                    <p>
                        El proyecto puede ofrecer un enlace externo a Ko-fi
                        para realizar donaciones voluntarias destinadas a
                        apoyar su desarrollo.
                    </p>

                    <p>
                        La donación no es necesaria para utilizar el juego ni
                        constituye un pago obligatorio por el acceso al
                        servicio.
                    </p>

                    <h2>6. Comunicaciones por correo electrónico</h2>

                    <p>
                        Scoundrel's Quest puede enviar automáticamente
                        determinados correos electrónicos relacionados con el
                        funcionamiento del servicio.
                    </p>

                    <p>
                        Entre ellos se encuentra el correo de bienvenida que se
                        envía cuando se crea una cuenta, así como correos
                        relacionados con solicitudes de soporte y reportes de
                        errores.
                    </p>

                    <p>
                        Estas comunicaciones tienen una finalidad funcional y
                        no constituyen publicidad ni comunicaciones comerciales
                        de carácter promocional.
                    </p>

                    <h2>7. Disponibilidad</h2>

                    <p>
                        Scoundrel's Quest se proporciona tal y como se encuentra
                        disponible en cada momento.
                    </p>

                    <p>
                        Al tratarse de un proyecto personal y gratuito, pueden
                        producirse interrupciones, errores, modificaciones o
                        periodos de mantenimiento.
                    </p>

                    <p>
                        El proyecto puede cambiar, suspenderse o dejar de estar
                        disponible en el futuro.
                    </p>

                    <h2>8. Servicios de terceros</h2>

                    <p>
                        Scoundrel's Quest utiliza determinados servicios de
                        terceros necesarios para su funcionamiento o disponibles
                        como funcionalidades externas.
                    </p>

                    <ul>
                        <li>Google, para autenticación mediante Google.</li>
                        <li>X, para autenticación mediante X.</li>
                        <li>IONOS, para infraestructura de servidor y correo.</li>
                        <li>
                            Cloudflare, para servicios relacionados con DNS y
                            proxy.
                        </li>
                        <li>
                            Ko-fi, como plataforma externa para donaciones
                            voluntarias.
                        </li>
                    </ul>

                    <p>
                        Estos servicios disponen de sus propias condiciones de
                        uso y políticas de privacidad.
                    </p>

                    <h2>9. Protección de datos</h2>

                    <p>
                        El tratamiento de los datos personales de los usuarios
                        se describe en la{" "}
                        <a href="/privacy">Política de Privacidad</a>.
                    </p>

                    <h2>10. Cookies</h2>

                    <p>
                        La información sobre las cookies y tecnologías
                        similares utilizadas por Scoundrel's Quest se encuentra
                        disponible en la{" "}
                        <a href="/cookies">Política de Cookies</a>.
                    </p>

                    <h2>11. Contenido de usuarios</h2>

                    <p>
                        Los usuarios pueden proporcionar determinados
                        contenidos para personalizar sus perfiles, como
                        avatares y banners.
                    </p>

                    <p>
                        El usuario es responsable de disponer de los derechos
                        necesarios para utilizar los contenidos que suba y debe
                        respetar los derechos de terceros.
                    </p>

                    <p>
                        Para obtener más información, consulta los{" "}
                        <a href="/terms">Términos de Uso</a>.
                    </p>

                    <h2>12. Contacto</h2>

                    <p>
                        Para cualquier consulta relacionada con el proyecto:
                    </p>

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