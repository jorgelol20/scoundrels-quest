import './NotificationModal.css';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import ReportIcon from '/images/report_icon.svg'
import CommentsIcon from '/images/comment_noti_icon.svg'
import { useNavigate } from 'react-router-dom';
import { fmtDate } from '../../i18n/format.js';

const NotificationModal = ({ onClose, userNotifications, markNotificationAsSeen, markAllNotificationsAsSeen }) => {
    const location = useNavigate();
    const { t, i18n } = useTranslation('modals');
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
                            {t('modals:notifications.markAllRead')}
                        </button>
                        <button
                            className='close-button'
                            onClick={onClose}
                        >
                            X
                        </button>

                    </div>
                    <div className='notifications'>
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
                                    <p>{notification.tipo === `reporte` ? t('modals:notifications.goToReport') : t('modals:notifications.goToMatch')}</p>
                                    <span>{fmtDate(i18n.language, notification.updated_at, { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>)
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    )

}
export default NotificationModal;