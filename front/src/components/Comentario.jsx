import React, { Fragment, useEffect, useState } from "react";
import './Comentario.css'
import { useUser } from "../hooks/useUser";
import Placeholder from '/images/placeholder.webp'
import { useNavigate } from "react-router-dom";
import DeleteIcon from '/images/delete-icon.svg'
import ConfirmationModal from "./modals/ConfirmationModal";
import { useTranslation } from 'react-i18next';
import { fmtDate } from '../i18n/format.js';

const Comentario = ({ comentario, requestMatch }) => {
    const { t, i18n } = useTranslation('profile');
    const { user, isLoading: userLoading, isError, deleteComment, deleteCommentError, isDeletingComment } = useUser();
    const [deleteCommentModal, setdeleteCommentModal] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        if (!isDeletingComment) {
            requestMatch()
        }
    }, [isDeletingComment])

    if (user == undefined) {
        return <></>
    }


    const handleDelete = () => {
        deleteComment(comentario.pivot.id);
    }



    return (
        <Fragment>
            <ConfirmationModal
                isOpen={deleteCommentModal}
                onClose={() => setdeleteCommentModal(false)}
                onConfirm={() => handleDelete() }
                title={t('comments.deleteTitle')}
                message={t('comments.deleteMessage')}
            />
            <div className={user.id == comentario.id ? "owner box" : "user box"}>
                <div className="comment" id={user.id == comentario.id ? "owner" : "user"}>
                    <div className="comment-info">
                        <div>
                            <img className='user-avatar' onClick={() => { navigate(`/perfil/${comentario.nick}`) }} style={{ borderColor: comentario.color }} src={comentario.avatar !== "" && comentario.avatar ? comentario.avatar : Placeholder} alt={t('avatarOf', { nick: comentario.nick })} />
                            <p className="date">{fmtDate(i18n.language, comentario.pivot.created_at)}</p>
                            {user.es_admin ? <button className="delete-button" onClick={() => setdeleteCommentModal(true) }><img className="delete-icon" src={DeleteIcon} alt="" /></button> : <></>}
                        </div>
                    </div>
                    <div className="comment-content">
                        <p className={comentario.es_admin ? "admin_nick" : "user_nick"}>{comentario.nick}</p>
                        <p>{comentario.pivot.comentario}</p>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default Comentario