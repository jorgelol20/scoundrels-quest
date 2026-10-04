import './AdviceModal.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Modal informativo con un solo botón (texto vía i18n `modals:advice`).
 * Diálogo accesible: `role="dialog"`, `aria-modal` y cierre con `Escape`.
 */
const AdviceModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { t } = useTranslation('modals');

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleConfirmClick = () => {
        onConfirm();
        onClose();   
    };

    return (
        <div className="confirmation-container" onClick={onClose}>
            {/* Detiene la propagación del clic para que no se cierre al hacer click en el contenido */}
            <div 
                className="confirmation"
                role="dialog"
                aria-modal="true"
                aria-label={typeof title === 'string' ? title : t('advice.ok')}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>{title}</h3>
                <p>{message}</p>

                <div className="confirmation-buttons">
                    <button
                        onClick={handleConfirmClick}
                        className="confirm-button"
                    >
                        {t('advice.ok')}
                    </button>
                </div >
            </div>
        </div>
    );
};

export default AdviceModal;