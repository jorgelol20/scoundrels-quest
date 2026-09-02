import React, { Fragment, useEffect, useState } from "react";
import "./BugReportPage.css"
import { useNavigate, useParams } from "react-router-dom";
import { useReportBugs } from "../../hooks/useReportBugs.js";
import Loading from "../Loading.jsx";
import { useUser } from "../../hooks/useUser.js";

const ESTADOS = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_revision', label: 'En revisión' },
    { value: 'solucionado', label: 'Solucionado' },
    { value: 'descartado', label: 'Descartado' },
    { value: 'duplicado', label: 'Duplicado' },
];

const SEVERIDADES = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
];

/**
 * Intenta parsear logs_partida como el JSON que genera el juego
 * ({ modificadores, error, personaje, logs }). Si no es JSON válido
 * (reportes antiguos o manuales), lo devuelve como texto plano.
 */
const parseLogsPartida = (logsPartida) => {
    if (!logsPartida) return null;
    try {
        const parsed = JSON.parse(logsPartida);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
        return { raw: logsPartida };
    } catch {
        return { raw: logsPartida };
    }
};

const BugReportPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const {
        useReporte,
        useComentarios,
        updateEstadoReporte,
        newComentario,
        deleteComentario,
    } = useReportBugs();

    const {
        data: reporte,
        isLoading: isLoadingReporte,
        error: reporteError,
    } = useReporte(id);

    const {
        data: comentarios,
        isLoading: isLoadingComentarios,
    } = useComentarios(id);

    const [estado, setEstado] = useState('');
    const [severidad, setSeveridad] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [isSendingComentario, setIsSendingComentario] = useState(false);

    useEffect(() => {
        if (!user || !user?.es_admin) {
            navigate('/');
        }
    }, [user]);

    useEffect(() => {
        if (reporte) {
            setEstado(reporte.estado);
            setSeveridad(reporte.severidad);
        }
    }, [reporte]);

    const handleGuardarCambios = async () => {
        setIsSaving(true);
        try {
            await updateEstadoReporte(id, { estado, severidad });
        } catch (error) {
            console.error("Error al actualizar el reporte:", error.response?.data?.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        setIsSendingComentario(true);
        try {
            await newComentario(id, { comentario: nuevoComentario });
            setNuevoComentario('');
        } catch (error) {
            console.error("Error al enviar el comentario:", error.response?.data?.message);
        } finally {
            setIsSendingComentario(false);
        }
    };

    const handleEliminarComentario = async (comentarioId) => {
        try {
            await deleteComentario(id, comentarioId);
        } catch (error) {
            console.error("Error al eliminar el comentario:", error.response?.data?.message);
        }
    };

    if (isLoadingReporte) return <Loading />;
    if (reporteError) return <p className="bug-report-page-error">No se ha podido cargar el reporte.</p>;
    if (!reporte) return null;

    const logsData = parseLogsPartida(reporte.logs_partida);

    return (
        <Fragment>
            <div className="bug-report-page">
                <button type="button" onClick={() => navigate(-1)}>Volver</button>

                <div className="bug-report-detail">
                    <h2>{reporte.titulo}</h2>
                    <div className="bug-report-meta">
                        <span className={`tipo tipo-${reporte.tipo}`}>{reporte.tipo}</span>
                        <span>Reportado por: {reporte.usuario?.nick ?? `Usuario#${reporte.usuario_id}`}</span>
                        <span>{new Date(reporte.created_at).toLocaleString()}</span>
                    </div>

                    <p className="bug-report-descripcion">{reporte.descripcion}</p>
                    {logsData && (
                        <div className="bug-report-tecnico">
                            <h4>Información técnica</h4>

                            {logsData.raw ? (
                                // Fallback: no era el JSON esperado, se muestra tal cual
                                <pre>{logsData.raw}</pre>
                            ) : (
                                <div className="bug-report-tecnico-grid">
                                    {logsData.personaje && (
                                        <div className="bug-report-tecnico-item">
                                            <span className="label">Personaje</span>
                                            <span className="value">{logsData.personaje}</span>
                                        </div>
                                    )}

                                    {logsData.error && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">Error: </span>
                                            <span className="value error-value">{logsData.error}</span>
                                        </div>
                                    )}

                                    {Array.isArray(logsData.modificadores) && logsData.modificadores.length > 0 && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">Modificadores activos:</span>
                                            <div className="modificadores-list">
                                                {logsData.modificadores.map((mod, idx) => (
                                                    <span key={mod.id ?? idx} className="modificador-badge">
                                                        {mod.nombre ?? `#${mod.id ?? idx}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {logsData.logs && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">Logs de consola</span>
                                            <pre>{logsData.logs}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {reporte.screenshot_url && (
                        <div className="bug-report-screenshot">
                            <h4>Captura</h4>
                            <a href={reporte.screenshot_url} target="_blank" rel="noreferrer">
                                <img src={reporte.screenshot_url} alt="Captura del bug" />
                            </a>
                        </div>
                    )}

                    <div className="bug-report-controls">
                        <div className="bug-report-field">
                            <label htmlFor="estado">Estado</label>
                            <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                {ESTADOS.map((e) => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bug-report-field">
                            <label htmlFor="severidad">Severidad</label>
                            <select id="severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)}>
                                {SEVERIDADES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <button type="button" onClick={handleGuardarCambios} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>

                <div className="bug-report-comentarios">
                    <h3>Comentarios</h3>

                    {isLoadingComentarios && <Loading />}

                    {!isLoadingComentarios && comentarios?.length === 0 && (
                        <p>Aún no hay comentarios.</p>
                    )}

                    {!isLoadingComentarios && comentarios?.length > 0 && (
                        <div className="bug-report-comentarios-list">
                            {comentarios.map((c) => (
                                <div key={c.id} className="bug-report-comentario">
                                    <span className="comentario-autor">{c.usuario?.nick ?? `Usuario#${c.usuario_id}`}</span>
                                    <p className="comentario-texto">{c.comentario}</p>
                                    <span className="comentario-fecha">{new Date(c.created_at).toLocaleString()}</span>
                                    {(user?.id === c.usuario_id || user?.es_admin) && (
                                        <button type="button" onClick={() => handleEliminarComentario(c.id)}>
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <form className="bug-report-comentario-form" onSubmit={handleEnviarComentario}>
                        <textarea
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            maxLength={250}
                            rows={2}
                            placeholder="Escribe un comentario..."
                        />
                        <button type="submit" disabled={isSendingComentario || !nuevoComentario.trim()}>
                            {isSendingComentario ? 'Enviando...' : 'Comentar'}
                        </button>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}
export default BugReportPage