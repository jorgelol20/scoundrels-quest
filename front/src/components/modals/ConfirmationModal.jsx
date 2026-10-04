import './ConfirmationModal.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Modal genérico de confirmación (textos vía i18n `modals:confirmation`).
 * Diálogo accesible: `role="dialog"`, `aria-modal` y cierre con `Escape`.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                aria-label={typeof title === 'string' ? title : t('confirmation.confirm')}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>{title}</h3>
                <p>{message}</p>

                <div className="confirmation-buttons">
                    <button 
                        onClick={onClose} 
                        
                    >
                        {t('confirmation.cancel')}
                    </button>
                    <button
                        onClick={handleConfirmClick}
                        className="confirm-button"
                    >
                        {t('confirmation.confirm')}
                    </button>
                </div >
            </div>
        </div>
    );
};

export default ConfirmationModal;