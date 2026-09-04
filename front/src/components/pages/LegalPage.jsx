import { Fragment } from "react";
import "./LegalPage.css";

const LegalPage = () => {
    return (
        <Fragment >
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
                    </ul>

                    <p>
                        El proyecto se ofrece gratuitamente y no contiene
                        publicidad.
                    </p>

                    <h2>2. Naturaleza del proyecto</h2>

                    <p>
                        Scoundrel's Quest es un proyecto personal desarrollado con
                        fines de entretenimiento y aprendizaje.
                    </p>

                    <p>
                        Actualmente no se cobra por el acceso al juego ni se
                        requiere ningún pago para utilizar sus funcionalidades.
                    </p>

                    <h2>3. Propiedad intelectual</h2>

                    <p>
                        El código, ilustraciones, personajes, diseños, textos y
                        demás elementos originales creados específicamente para
                        Scoundrel's Quest pertenecen a sus respectivos autores.
                    </p>

                    <p>
                        Queda prohibida la reproducción, distribución,
                        modificación o explotación de los contenidos originales
                        del proyecto sin la correspondiente autorización, salvo
                        cuando la ley permita expresamente lo contrario.
                    </p>

                    <h2>4. Inspiración en Scoundrel</h2>

                    <p>
                        Scoundrel's Quest está inspirado en las mecánicas del juego
                        <em> Scoundrel</em>, creado por Zach Gage y Kurt Bieg.
                    </p>

                    <p>
                        Scoundrel's Quest es una obra independiente y no está
                        afiliada ni respaldada por Zach Gage o Kurt Bieg.
                    </p>

                    <p>
                        Las ilustraciones, personajes y demás elementos artísticos
                        utilizados en Scoundrel's Quest han sido creados
                        específicamente para este proyecto.
                    </p>

                    <h2>5. Servicio gratuito</h2>

                    <p>
                        El acceso a Scoundrel's Quest es gratuito.
                    </p>

                    <p>
                        El proyecto puede ofrecer un enlace externo a Ko-fi para
                        realizar donaciones voluntarias destinadas a apoyar el
                        desarrollo del proyecto.
                    </p>

                    <p>
                        La donación no es necesaria para utilizar el juego y no
                        proporciona ventajas obligatorias ni constituye un pago
                        por el acceso al servicio.
                    </p>

                    <h2>6. Disponibilidad</h2>

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

                    <h2>7. Enlaces a terceros</h2>

                    <p>
                        El sitio puede contener enlaces a servicios externos,
                        como servicios de autenticación o plataformas de
                        donaciones.
                    </p>

                    <p>
                        Estos servicios son independientes de Scoundrel's Quest y
                        disponen de sus propias condiciones de uso y políticas de
                        privacidad.
                    </p>

                    <h2>8. Protección de datos</h2>

                    <p>
                        El tratamiento de los datos personales de los usuarios se
                        describe en la{" "}
                        <a href="/privacy">
                            Política de Privacidad
                        </a>
                        .
                    </p>

                    <h2>9. Cookies</h2>

                    <p>
                        La información sobre las cookies y tecnologías similares
                        utilizadas por Scoundrel's Quest se encuentra disponible
                        en la{" "}
                        <a href="/cookies">
                            Política de Cookies
                        </a>
                        .
                    </p>

                    <h2>10. Contacto</h2>

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