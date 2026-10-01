import React, { Fragment, useState } from "react";

import './UserShow.css';
import Placeholder from '/images/placeholder.webp'
import ConfirmationModal from "./modals/ConfirmationModal.jsx";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const UserShow = ({ userInfo, admin = false }) => {
    const { t } = useTranslation('profile');
    const { deleteProfilePhoto, update } = useUser();
    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const handleDeleteProfile = (nick) => {
        deleteProfilePhoto(nick);
        setIsDeleteModalOpen(false);
    };

    const [isAdminChangeModalOpen, setIsAdminChangeModalOpen] = useState(false);

    const [isTesterChangeModalOpen, setIsTesterChangeModalOpen] = useState(false);

    let adminChangeMessage;
    if (userInfo.es_admin) {
        adminChangeMessage = t('revokeAdmin');
    } else {
        adminChangeMessage = t('grantAdmin');
    }

    let testerChangeMessage;
    if (userInfo.is_tester) {
        testerChangeMessage = t('revokeTester');
    } else {
        testerChangeMessage = t('grantTester');
    }

    const handleChangeAdmin = (nick, isAdmin) => {
        const form = new FormData();
        form.append('es_admin', isAdmin ? 0 : 1);
        form.append('_method', 'PUT');

        update({ nick, form });
    };
    const handleChangeTester = (nick, isTester) => {
        const form = new FormData();
        form.append('is_tester', isTester ? 0 : 1);
        form.append('_method', 'PUT');

        update({ nick, form });
    };

    return (
        <Fragment>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleDeleteProfile(userInfo.nick)}
                title={t('confirmDeleteTitle')}
                message={t('confirmDeleteMessage')}
            />
            <ConfirmationModal
                isOpen={isAdminChangeModalOpen}
                onClose={() => setIsAdminChangeModalOpen(false)}
                onConfirm={() => handleChangeAdmin(userInfo.nick, userInfo.es_admin)}
                title={t('changeAdminTitle')}
                message={adminChangeMessage}
            />
            <ConfirmationModal
                isOpen={isTesterChangeModalOpen}
                onClose={() => setIsTesterChangeModalOpen(false)}
                onConfirm={() => handleChangeTester(userInfo.nick, userInfo.is_tester)}
                title={t('changeAdminTitle')}
                message={testerChangeMessage}
            />
            <div className={admin ? "show-admin" : "show"}>
                <img
                    className="show-avatar"
                    src={userInfo.avatar}
                    alt={t('avatarOf', { nick: userInfo.nick })}
                    style={{ borderColor: userInfo.color }}
                    onError={(e) => {
                        e.currentTarget.src = Placeholder;
                    }}
                />
                <h1 className={userInfo.es_admin ? "admin" : userInfo.is_tester? "tester" : "user"}>{userInfo.nick}</h1>
                {admin ?
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <h1>{t('admin')} <span className={userInfo.es_admin ? "admin" : "user"}>{userInfo.es_admin ? t('yes') : t('no')}</span></h1>
                            <h1>{t('tester')} <span className={userInfo.is_tester ? "tester" : "user"}>{userInfo.is_tester ? t('yes') : t('no')}</span></h1>
                            <h1>{t('played')} {userInfo?.tiene_jugadas_count??0}</h1>
                        </div>
                        <div className="show-buttons">
                            <button onClick={() => setIsDeleteModalOpen(true)}>{t('deletePhoto')}</button>
                            <button
                                onClick={() => {
                                    setIsAdminChangeModalOpen(true);
                                }}
                            >
                                {t('changeAdminState')}
                            </button>
                            <button
                                onClick={() => {
                                    setIsTesterChangeModalOpen(true);
                                }}
                            >
                                {t('changeTesterState')}
                            </button>
                            <button onClick={() => { navigate(`/perfil/${userInfo.nick}`) }}>{t('viewProfile')}</button>
                        </div>
                    </div>
                    : <></>
                }
            </div >
        </Fragment>
    )
}
export default UserShow