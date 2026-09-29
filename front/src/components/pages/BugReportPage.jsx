import React, { Fragment, useEffect, useState } from "react";
import "./BugReportPage.css"
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReportBugs } from "../../hooks/useReportBugs.js";
import Loading from "../Loading.jsx";
import { useUser } from "../../hooks/useUser.js";
import { fmtDate } from "../../i18n/format.js";

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
    const { t, i18n } = useTranslation('bugs');

    // `value` es el identificador que se envía al backend: NO se traduce.
    // Las etiquetas se traducen con las claves compartidas `bugs:status.*` / `bugs:severity.*`,
    // las mismas que usa AdminPanel.
    const ESTADOS = [
        { value: 'abierto', label: t('bugs:status.abierto') },
        { value: 'en_revision', label: t('bugs:status.en_revision') },
        { value: 'solucionado', label: t('bugs:status.solucionado') },
        { value: 'descartado', label: t('bugs:status.descartado') },
        { value: 'duplicado', label: t('bugs:status.duplicado') },
    ];

    const SEVERIDADES = [
        { value: 'baja', label: t('bugs:severity.baja') },
        { value: 'media', label: t('bugs:severity.media') },
        { value: 'alta', label: t('bugs:severity.alta') },
        { value: 'critica', label: t('bugs:severity.critica') },
    ];

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
        if (!user || (!user.es_admin && user.id !== reporte?.usuario?.id)) {
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
    if (reporteError) return <p className="bug-report-page-error">{t('bugs:detail.loadError')}</p>;
    if (!reporte) return null;
    const logsData = parseLogsPartida(reporte.logs_partida);

    return (
        <Fragment>
            <div className="bug-report-page">
                <button type="button" onClick={() => navigate(-1)}>{t('bugs:detail.back')}</button>

                <div className="bug-report-detail">
                    <h2>{reporte.titulo}</h2>
                    <div className="bug-report-meta">
                        <span className={`tipo tipo-${reporte.tipo}`}>{reporte.tipo}</span>
                        <span>{t('bugs:detail.reportedBy', { nick: reporte.usuario?.nick ?? `Usuario#${reporte.usuario_id}` })}</span>
                        <span>{fmtDate(i18n.language, reporte.created_at, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>

                    <p className="bug-report-descripcion">{reporte.descripcion}</p>
                    {logsData && (
                        <div className="bug-report-tecnico">
                            <h4>{t('bugs:detail.techInfo')}</h4>

                            {logsData.raw ? (
                                <pre>{logsData.raw}</pre>
                            ) : (
                                <div className="bug-report-tecnico-grid">
                                    {logsData.personaje && (
                                        <div className="bug-report-tecnico-item">
                                            <span className="label">{t('bugs:detail.character')}{' '}</span>
                                            <span className="value">{logsData.personaje}</span>
                                        </div>
                                    )}

                                    {logsData.error && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.error')}{' '}</span>
                                            <span className="value error-value">{logsData.error}</span>
                                        </div>
                                    )}

                                    {Array.isArray(logsData.modificadores) && logsData.modificadores.length > 0 && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.activeModifiers')}</span>
                                            <div className="modificadores-list">
                                                {logsData.modificadores.map((mod, idx) => (
                                                    <span key={mod.id ?? idx} className="modificador-badge">
                                                        {mod.nombre ?? `#${mod.id ?? idx}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {Array.isArray(logsData.room) && logsData.room.length > 0 && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.handCards', { count: logsData.room.length })}</span>
                                            <div className="room-list">
                                                {logsData.room.map((card, index) => (
                                                    <pre> {index} - {card.key} {card.valor} {card.palo} {JSON.stringify(card.efectos ?? 'Sin efectos')}</pre>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {Array.isArray(logsData.dungeon) && logsData.dungeon.length > 0 && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.deckCards', { count: logsData.dungeon.length })}</span>
                                            <div className="dungeon-list">
                                                {logsData.map((card, index) => (
                                                    <pre> {index} - {card.key} {card.valor} {card.palo} {JSON.stringify(card.efectos ?? 'Sin efectos')}</pre>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {logsData[0] && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.userInfo')}</span>
                                            <div className="user-info">
                                                <pre>{t('bugs:detail.nickLabel')} {logsData[0]?.nick}</pre>
                                                <pre>{t('bugs:detail.idLabel')} {logsData[0]?.id}</pre>
                                                <pre>{t('bugs:detail.isAdmin')} {logsData[0]?.es_admin ? t('bugs:detail.yes') : t('bugs:detail.no')}</pre>
                                                <pre>{t('bugs:detail.isTester')} {logsData[0]?.is_tester ? t('bugs:detail.yes') : t('bugs:detail.no')}</pre>
                                                <img src={logsData[0]?.avatar} alt="" width={"50px"} height={"50px"}/>
                                                <img src={logsData[0]?.banner} alt="" width={"200px"} height={"80px"}/>
                                            </div>
                                        </div>
                                    )}
                                    {logsData.logs && (
                                        <div className="bug-report-tecnico-item full">
                                            <span className="label">{t('bugs:detail.consoleLogs')}</span>
                                            <pre>{logsData.logs}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {reporte.screenshot_url && (
                        <div className="bug-report-screenshot">
                            <h4>{t('bugs:detail.screenshot')}</h4>
                            <a href={reporte.screenshot_url} target="_blank" rel="noreferrer">
                                <img src={reporte.screenshot_url} alt={t('bugs:detail.screenshotAlt')} />
                            </a>
                        </div>
                    )}

                    <div className="bug-report-controls">
                        <div className="bug-report-field">
                            <label htmlFor="estado">{t('bugs:detail.stateLabel')}</label>
                            <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                {ESTADOS.map((e) => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bug-report-field">
                            <label htmlFor="severidad">{t('bugs:detail.severityLabel')}</label>
                            <select id="severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)}>
                                {SEVERIDADES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <button type="button" onClick={handleGuardarCambios} disabled={isSaving}>
                            {isSaving ? t('bugs:detail.saving') : t('bugs:detail.save')}
                        </button>
                    </div>
                </div>

                <div className="bug-report-comentarios">
                    <h3>{t('bugs:comments.title')}</h3>

                    {isLoadingComentarios && <Loading />}

                    {!isLoadingComentarios && comentarios?.length === 0 && (
                        <p>{t('bugs:comments.empty')}</p>
                    )}

                    {!isLoadingComentarios && comentarios?.length > 0 && (
                        <div className="bug-report-comentarios-list">
                            {comentarios.map((c) => (
                                <div key={c.id} className="bug-report-comentario">
                                    <span className="comentario-autor">{c.usuario?.nick ?? `Usuario#${c.usuario_id}`}</span>
                                    <p className="comentario-texto">{c.comentario}</p>
                                    <span className="comentario-fecha">{fmtDate(i18n.language, c.created_at, { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    {(user?.id === c.usuario_id || user?.es_admin) && (
                                        <button type="button" onClick={() => handleEliminarComentario(c.id)}>
                                            {t('bugs:comments.delete')}
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
                            placeholder={t('bugs:comments.placeholder')}
                        />
                        <button type="submit" disabled={isSendingComentario || !nuevoComentario.trim()}>
                            {isSendingComentario ? t('bugs:comments.sending') : t('bugs:comments.submit')}
                        </button>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}
export default BugReportPage
