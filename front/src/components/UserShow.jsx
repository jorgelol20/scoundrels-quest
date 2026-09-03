import React, { Fragment, useState } from "react";

import './UserShow.css';
import Placeholder from '/images/placeholder.webp'
import ConfirmationModal from "./modals/ConfirmationModal.jsx";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";

const UserShow = ({ userInfo, admin = false }) => {
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
        adminChangeMessage = "El usuario dejará de ser administrador. ¿Estás seguro?";
    } else {
        adminChangeMessage = "El usuario pasará a ser administrador. ¿Estás seguro?";
    }

    let testerChangeMessage;
    if (userInfo.is_tester) {
        testerChangeMessage = "El usuario dejará de ser tester. ¿Estás seguro?";
    } else {
        testerChangeMessage = "El usuario pasará a ser tester. ¿Estás seguro?";
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
                title="Confirmar Eliminación"
                message="¿Estás seguro de que deseas eliminar la foto de perfil? Esta acción es irreversible."
            />
            <ConfirmationModal
                isOpen={isAdminChangeModalOpen}
                onClose={() => setIsAdminChangeModalOpen(false)}
                onConfirm={() => handleChangeAdmin(userInfo.nick, userInfo.es_admin)}
                title="Cambiar Rol de Administrador"
                message={adminChangeMessage}
            />
            <ConfirmationModal
                isOpen={isTesterChangeModalOpen}
                onClose={() => setIsTesterChangeModalOpen(false)}
                onConfirm={() => handleChangeTester(userInfo.nick, userInfo.is_tester)}
                title="Cambiar Rol de Administrador"
                message={testerChangeMessage}
            />
            <div className={admin ? "show-admin" : "show"}>
                <img
                    className="show-avatar"
                    src={userInfo.avatar}
                    alt={'Avatar de ' +  userInfo.nick}
                    style={{ borderColor: userInfo.color }}
                    onError={(e) => {
                        e.currentTarget.src = Placeholder;
                    }}
                />
                <h1 className={userInfo.es_admin ? "admin" : userInfo.is_tester? "tester" : "user"}>{userInfo.nick}</h1>
                {admin ?
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <h1>Admin: <span className={userInfo.es_admin ? "admin" : "user"}>{userInfo.es_admin ? "Si" : "No"}</span></h1>
                            <h1>Tester: <span className={userInfo.is_tester ? "tester" : "user"}>{userInfo.is_tester ? "Si" : "No"}</span></h1>
                            <h1>Jugadas: {userInfo?.tiene_jugadas_count??0}</h1>
                        </div>
                        <div className="show-buttons">
                            <button onClick={() => setIsDeleteModalOpen(true)}>Eliminar foto</button>
                            <button
                                onClick={() => {
                                    setIsAdminChangeModalOpen(true);
                                }}
                            >
                                Cambiar estado admin
                            </button>
                            <button
                                onClick={() => {
                                    setIsTesterChangeModalOpen(true);
                                }}
                            >
                                Cambiar estado tester
                            </button>
                            <button onClick={() => { navigate(`/perfil/${userInfo.nick}`) }}>Ver perfil</button>
                        </div>
                    </div>
                    : <></>
                }
            </div >
        </Fragment>
    )
}
export default UserShow