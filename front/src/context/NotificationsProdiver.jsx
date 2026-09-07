import React, { createContext, Fragment, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import NotificationModal from "../components/modals/NotificationsModal";

const notificationContext = createContext({});

const NotificationProvider = ({children}) => {
    const { notifications, markAsSeen, markAllAsSeen } = useUser();

    const [userNotifications, setUserNotifications] = useState([]);

    const [isOpen, setIsOpen] = useState(false);


    const markNotificationAsSeen = async (notificationId) => {
        markAsSeen(notificationId);
    }

    const markAllNotificationsAsSeen = async (notificationId) => {
        markAllAsSeen(notificationId);
    }

    const closeNotificationModal = () => {
        setIsOpen(false)
    }
    const openNotificationModal = () => {
        setIsOpen(true)
    }

    useEffect(()=>{
        if(notifications != null && notifications != undefined){
            setUserNotifications(notifications);
        }
    },[])
    useEffect(()=>{
        if(notifications != null){
            setUserNotifications(notifications);
        }
    },[notifications])

    const exports = {
        userNotifications,
        markNotificationAsSeen,
        markAllNotificationsAsSeen,
        openNotificationModal,
        closeNotificationModal
    }
    return (
        <Fragment>
            <notificationContext.Provider value={exports}>
                {children}
                {
                    isOpen ?
                    <NotificationModal onClose={closeNotificationModal} markAllNotificationsAsSeen={markAllNotificationsAsSeen} markNotificationAsSeen={markNotificationAsSeen} userNotifications={userNotifications}/>
                    :<></>
                }
            </notificationContext.Provider>
        </Fragment>
    )

}
export default NotificationProvider;
export { notificationContext };