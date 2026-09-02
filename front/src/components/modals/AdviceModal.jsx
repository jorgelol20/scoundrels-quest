import './AdviceModal.css';
const AdviceModal = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                        onClick={handleConfirmClick}
                        className="confirm-button"
                    >
                        Vale
                    </button>
                </div >
            </div>
        </div>
    );
};

export default AdviceModal;