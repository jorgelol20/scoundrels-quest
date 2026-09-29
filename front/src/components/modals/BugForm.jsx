import { Fragment, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportBugs } from './../../hooks/useReportBugs.js';
import './BugForm.css';

import Folder from '/images/folder.svg'
import { useLocation } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal.jsx';

// `value` es el identificador que se envía al backend: NO se traduce.
// `labelKey` es la clave de traducción del texto visible.
const TIPOS = [
    { value: 'visual', labelKey: 'types.visual' },
    { value: 'jugabilidad', labelKey: 'types.jugabilidad' },
    { value: 'rendimiento', labelKey: 'types.rendimiento' },
    { value: 'error', labelKey: 'types.error' },
    { value: 'otro', labelKey: 'types.otro' },
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

const BugForm = ({ bugInfo, onClose, reportUser, reportedUserInfo }) => {
    const { newReporte } = useReportBugs();
    const { t } = useTranslation('modals');


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
    const [detallesTrampas, setDetallesTrampas] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTrampasChange = (e) => {
        const detalles = e.target.value;
        setDetallesTrampas(detalles);

        // El valor es el propio texto traducido: se usa la misma clave en el <option>
        // y aquí, para que la comparación siga funcionando en ambos idiomas.
        const baseValue = t('modals:bugForm.cheatBase');
        setFormData(prev => ({
            ...prev,
            descripcion: detalles ? `${baseValue}: ${detalles}` : baseValue
        }));
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

    useEffect(() => {
        if (reportUser) {
            setFormData((prev) => ({ ...prev, ['tipo']: 'usuario' }))
        }
    }, [reportUser])

    if (success) {
        return (
            <Fragment>
                <div className="bug-form-success">
                    <p>{t('modals:bugForm.successMessage')}</p>
                    <button type="button" onClick={onClose}>{t('modals:bugForm.close')}</button>
                </div>
            </Fragment>
        );
    }
    if (reportUser) {

        return (
            <Fragment>
                <div className='bug-form-container'>
                    <div className='bug-form-window'>
                        <div className='window-bar'>
                            <button
                                className='close-button'
                                onClick={onClose}
                            >
                                X
                            </button>
                        </div>
                        <form className="bug-form" onSubmit={handleSubmit}>
                            <div className='window-bar'>
                                <button
                                    className='close-button'
                                    onClick={onClose}
                                >
                                    X
                                </button>
                            </div>
                            <h2>{t('modals:bugForm.reportUserTitle', { nick: reportedUserInfo.nick })}</h2>
                            <div className="bug-form-field">
                                <label htmlFor="descripcion">{t('modals:bugForm.reason')}</label>
                                <select
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                >
                                    <option value="">{t('modals:bugForm.selectReason')}</option>
                                    <option value={t('modals:bugForm.reasons.badBanner')}>
                                        {t('modals:bugForm.reasons.badBanner')}
                                    </option>
                                    <option value={t('modals:bugForm.reasons.badAvatar')}>
                                        {t('modals:bugForm.reasons.badAvatar')}
                                    </option>
                                    <option value={t('modals:bugForm.reasons.badBoth')}>
                                        {t('modals:bugForm.reasons.badBoth')}
                                    </option>
                                    <option value={t('modals:bugForm.cheatBase')}>
                                        {t('modals:bugForm.cheatBase')}
                                    </option>
                                    <option value={t('modals:bugForm.otherReason')}>
                                        {t('modals:bugForm.otherReason')}
                                    </option>
                                </select>

                                {(formData.descripcion.startsWith(t('modals:bugForm.cheatBase')) || formData.descripcion.startsWith(t('modals:bugForm.otherReason'))) && (
                                    <textarea
                                        value={detallesTrampas}
                                        onChange={handleTrampasChange}
                                        placeholder={t('modals:bugForm.cheatPlaceholder')}
                                        rows="4"
                                        style={{ marginTop: '10px', width: '100%' }}
                                    />
                                )}
                            </div>

                            <div className="bug-form-field">
                                <label htmlFor="screenshot">{t('modals:bugForm.screenshot')}</label>
                                <div className="custom-file-container">
                                    <label htmlFor="file-upload" className="file-button">
                                        <span className="icon"><img src={Folder} /></span>
                                        <span className="text">{t('modals:bugForm.selectFile')}</span>
                                    </label>
                                    <input type="file" id="file-upload" onChange={handleFileChange} />
                                    <span id="file-name" className="file-status">{screenshot?.name}</span>
                                </div>
                            </div>


                            {parsedBugInfo?.logs && (
                                <div className="bug-form-field">
                                    <label htmlFor="logs_preview">{t('modals:bugForm.logsAttached')}</label>
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
                                    {t('modals:bugForm.cancel')}
                                </button>
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? t('modals:bugForm.sending') : t('modals:bugForm.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Fragment>
        )
    }
    return (
        <Fragment>
            <div className='bug-form-container'>
                <div className='bug-form-window'>
                    <div className='window-bar'>
                        <button
                            className='close-button'
                            onClick={onClose}
                        >
                            X
                        </button>
                    </div>
                    <form className="bug-form" onSubmit={handleSubmit}>

                        <h2>{t('modals:bugForm.title')}</h2>

                        {parsedBugInfo?.personaje && (
                            <p className="bug-form-context">
                                {t('modals:bugForm.detectedDuring')} <strong>{parsedBugInfo.personaje}</strong>
                            </p>
                        )}

                        <div className="bug-form-field">
                            <label htmlFor="tipo">{t('modals:bugForm.type')}<span>*</span></label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                            >
                                {TIPOS.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>{t(`modals:bugForm.${tipo.labelKey}`)}</option>
                                ))}
                            </select>
                            {errors.tipo && <span className="bug-form-error">{errors.tipo[0]}</span>}
                        </div>

                        <div className="bug-form-field">
                            <label htmlFor="descripcion">{t('modals:bugForm.descriptionCount', { len: formData.descripcion.length })}<span>*</span></label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                maxLength={2000}
                                rows={5}
                                placeholder={t('modals:bugForm.descriptionPlaceholder')}
                                required

                            />
                            {errors.descripcion && <span className="bug-form-error">{errors.descripcion[0]}</span>}
                        </div>

                        <div className="bug-form-field">
                            <label htmlFor="screenshot">{t('modals:bugForm.screenshot')}</label>
                            <div className="custom-file-container">
                                <label htmlFor="file-upload" className="file-button">
                                    <span className="icon"><img src={Folder} /></span>
                                    <span className="text">{t('modals:bugForm.selectFile')}</span>
                                </label>
                                <input type="file" id="file-upload" onChange={handleFileChange} />
                                <span id="file-name" className="file-status">{screenshot?.name}</span>
                            </div>
                        </div>


                        {parsedBugInfo?.logs && (
                            <div className="bug-form-field">
                                <label htmlFor="logs_preview">{t('modals:bugForm.logsAttached')}</label>
                                <textarea
                                    id="logs_preview"
                                    value={parsedBugInfo.logs}
                                    rows={4}
                                    readOnly
                                />
                            </div>
                        )}

                        <div className="bug-form-actions">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('modals:bugForm.sending') : t('modals:bugForm.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default BugForm;