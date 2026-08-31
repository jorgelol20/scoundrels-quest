import React, { Fragment, useEffect, useState } from "react";
import './Comentario.css'
import { useUser } from "../hooks/useUser";
import Placeholder from '/images/placeholder.webp'
import { useNavigate } from "react-router-dom";
import DeleteIcon from '/images/delete-icon.svg'
import ConfirmationModal from "./modals/ConfirmationModal";

const Comentario = ({ comentario, requestMatch }) => {
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
                title="Eliminar comentario"
                message={"¿Seguro que quieres eliminar el comentario?"}
            />
            <div className={user.id == comentario.id ? "owner box" : "user box"}>
                <div className="comment" id={user.id == comentario.id ? "owner" : "user"}>
                    <div className="comment-info">
                        <div>
                            <img className='user-avatar' onClick={() => { navigate(`/perfil/${comentario.nick}`) }} style={{ borderColor: comentario.color }} src={comentario.avatar !== "" && comentario.avatar ? comentario.avatar : Placeholder} alt={`Avatar de ${comentario.nick}`} />
                            <p className="date">{new Date(comentario.pivot.created_at).toLocaleDateString('es-ES')}</p>
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