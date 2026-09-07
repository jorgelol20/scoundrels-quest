import './NotificationModal.css';
import { Fragment } from 'react';
import ReportIcon from '/images/report_icon.svg'
import CommentsIcon from '/images/comment_noti_icon.svg'
import { useNavigate } from 'react-router-dom';

const NotificationModal = ({ onClose, userNotifications, markNotificationAsSeen, markAllNotificationsAsSeen }) => {
    const location = useNavigate();
    return (
        <Fragment>
            <div className='notification-container' onClick={(event) => {
                if (event.target.classList.contains("notification-container")) {
                    onClose();
                }

            }}>
                <div className='notification-list'>
                    <div className='window-bar'>
                        <button
                            onClick={markAllNotificationsAsSeen}
                        >
                            Marcar todas como vistas
                        </button>
                        <button
                            className='close-button'
                            onClick={onClose}
                        >
                            X
                        </button>

                    </div>
                    <div className='notifications'>
                        {console.log(userNotifications[0])}
                        {
                            userNotifications.map((notification) =>
                                <div key={notification.id + "-notification"}
                                    className='notification'
                                    style={{ borderColor: notification.vista ? '#685a5a' : '#D4AF37' }}
                                    onClick={() => {
                                        markNotificationAsSeen(notification.id);
                                        if(notification.tipo === 'comentario'){
                                            location(`/partida/${notification.partida_id}`)
                                        }else{
                                            location(`/reportes-bug/${notification.reporte_id}`)
                                        }
                                        onClose();
                                    }}>
                                    <div className='notification-content'>
                                        <img src={notification.tipo === `reporte` ? ReportIcon : CommentsIcon} alt="" />
                                        <h1>{notification.descripcion}</h1>
                                    </div>
                                    <p>Clic para ir {notification.tipo === `reporte` ? 'al reporte' : 'a la partida'}</p>
                                    <span>{new Date(notification.updated_at).toLocaleDateString('es-ES')} {new Date(notification.updated_at).toLocaleTimeString('es-ES')}</span>
                                </div>)
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    )

}
export default NotificationModal;