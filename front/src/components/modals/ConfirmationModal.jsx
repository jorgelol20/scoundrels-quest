import './ConfirmationModal.css';
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                onClick={(e) => e.stopPropagation()}
            >
                <h3>{title}</h3>
                <p>{message}</p>

                <div className="confirmation-buttons">
                    <button 
                        onClick={onClose} 
                        
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmClick}
                        className="confirm-button"
                    >
                        Confirmar
                    </button>
                </div >
            </div>
        </div>
    );
};

export default ConfirmationModal;