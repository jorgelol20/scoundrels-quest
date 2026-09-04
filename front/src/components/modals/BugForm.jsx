import { Fragment, useState, useMemo, useEffect } from 'react';
import { useReportBugs } from './../../hooks/useReportBugs.js';
import './BugForm.css';

import Folder from '/images/folder.svg'
import { useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';

const TIPOS = [
    { value: 'visual', label: 'Visual' },
    { value: 'jugabilidad', label: 'Jugabilidad' },
    { value: 'rendimiento', label: 'Rendimiento' },
    { value: 'error', label: 'Error' },
    { value: 'usuario', label: 'Usuario' },
    { value: 'otro', label: 'Otro' },
];

/**
 * Genera un string de plataforma legible a partir del navegador,
 * sin pedirle nada al usuario.
 */
const detectarPlataforma = () => {
    const ua = navigator.userAgent;

    let so = 'Desconocido';
    if (/Windows/i.test(ua)) so = 'Windows';
    else if (/Mac OS/i.test(ua)) so = 'MacOS';
    else if (/Linux/i.test(ua)) so = 'Linux';
    else if (/Android/i.test(ua)) so = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) so = 'iOS';

    let navegador = 'Desconocido';
    if (/Edg\//i.test(ua)) navegador = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) navegador = 'Chrome';
    else if (/Firefox\//i.test(ua)) navegador = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) navegador = 'Safari';

    return `${so} - ${navegador}`;
};

/**
 * Parsea el string JSON recibido en bugInfo ({ modificadores, error, personaje, logs }).
 * Si no es JSON válido (bugInfo null o formato inesperado), devuelve null.
 */
const parseBugInfo = (bugInfo) => {
    
    if (!bugInfo) return null;
    try {
        const parsed = JSON.parse(bugInfo);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
};

const BugForm = ({ bugInfo, onClose }) => {
    const { newReporte } = useReportBugs();

    const { searchUsuario } = useUser();
    const [reportedUserInfo, setReportedUserInfo] = useState(null);

    const parsedBugInfo = useMemo(() => parseBugInfo(bugInfo), [bugInfo]);

    const [formData, setFormData] = useState({
        tipo: 'error',
        descripcion: parsedBugInfo?.error ?? '',
    });

    const location = useLocation();

    const [screenshot, setScreenshot] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setScreenshot(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('tipo', formData.tipo);
            payload.append('descripcion', formData.descripcion);
            payload.append('plataforma', detectarPlataforma());
            // Se envía el JSON completo tal cual llegó, para conservar modificadores/personaje/logs
            if (bugInfo) payload.append('logs_partida', bugInfo)
                else payload.append('logs_partida', JSON.stringify(reportedUserInfo));
            if (screenshot) payload.append('screenshot', screenshot);

            await newReporte(payload);
            setSuccess(true);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                console.error('Error al enviar el reporte:', error.response?.data?.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportUser = async () => {
        setFormData((prev) => ({ ...prev, ["tipo"]: "usuario" }));
        const temp = location.pathname.split('/');
        const user = temp[temp.length - 1]
        const reportedUser = await searchUsuario(user);
        setReportedUserInfo(reportedUser);
        setFormData((prev) => ({ ...prev, ["descripcion"]: `El usuario '${reportedUser[0]['nick']}' inclumple la normativa de imagenes de avatar/banner.` }));
    }

    useEffect(() => {
        if (location.pathname.startsWith('/perfil/')) {
            handleReportUser();
        }
    }, [location])

    if (success) {
        return (
            <Fragment>
                <div className="bug-form-success">
                    <p>¡Gracias! Tu reporte ha sido enviado correctamente.</p>
                    <button type="button" onClick={onClose}>Cerrar</button>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <form className="bug-form" onSubmit={handleSubmit}>
                <h2>Reportar</h2>

                {parsedBugInfo?.personaje && (
                    <p className="bug-form-context">
                        Detectado durante la partida con <strong>{parsedBugInfo.personaje}</strong>
                    </p>
                )}

                <div className="bug-form-field">
                    <label htmlFor="tipo">Tipo<span>*</span></label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                    >
                        {TIPOS.map((t) => (
                            <option key={t.label} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    {errors.tipo && <span className="bug-form-error">{errors.tipo[0]}</span>}
                </div>

                <div className="bug-form-field">
                    <label htmlFor="descripcion">Descripción<span>* ({formData.descripcion.length}/2000)</span></label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        maxLength={2000}
                        rows={5}
                        placeholder="Describe qué ha pasado, qué esperabas que pasara y cómo reproducirlo"
                        required

                    />
                    {errors.descripcion && <span className="bug-form-error">{errors.descripcion[0]}</span>}
                </div>

                <div className="bug-form-field">
                    <label htmlFor="screenshot">Captura de pantalla</label>
                    <div className="custom-file-container">
                        <label htmlFor="file-upload" className="file-button">
                            <span className="icon"><img src={Folder} /></span>
                            <span className="text">Seleccionar Archivo</span>
                        </label>
                        <input type="file" id="file-upload" onChange={handleFileChange} />
                        <span id="file-name" className="file-status">{screenshot?.name}</span>
                    </div>
                </div>


                {parsedBugInfo?.logs && (
                    <div className="bug-form-field">
                        <label htmlFor="logs_preview">Logs de la partida (adjuntos automáticamente)</label>
                        <textarea
                            id="logs_preview"
                            value={parsedBugInfo.logs}
                            rows={4}
                            readOnly
                        />
                    </div>
                )}

                <div className="bug-form-actions">
                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
                    </button>
                </div>
            </form>
        </Fragment>
    );
};

export default BugForm;