import React, { Fragment, useContext, useEffect, useState } from "react";
import { useUser } from '../../hooks/useUser.js';
import { useNavigate, useParams } from 'react-router-dom';

import {  settingsContext } from "../../context/SettingsProvider.jsx";


import Placeholder from '/images/placeholder.webp'
import VisibilityOn from '/images/visibility_on.svg'
import VisibilityOff from '/images/visibility_off.svg'
import Folder from '/images/folder.svg'


import './ProfileEditPage.css'
import Loading from "../Loading.jsx";
import Banner from "../structure/Banner.jsx";

const ProfileEdit = () => {
    const navigate = useNavigate();
    const { user, update, updateError, isLoading, getUsuario, isUpdating, error } = useUser();
    const [isGettingUser, setIsGettingUser] = useState(true);
    const { nick } = useParams();

    const {startButtonSound} = useContext( settingsContext)

    // Estados del formulario
    const [newPassword, setNewPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false)
    const [newConfirmPassword, setNewConfirmPassword] = useState('');
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false)
    const [passwordsAreSame, setPasswordsAreSame] = useState(true);
    const [newAvatar, setNewAvatar] = useState(null);
    const [newColor, setNewColor] = useState(null)
    const [preview, setPreview] = useState(Placeholder);

    const checking = async () => {
        let data;
        user;
        if (user) {
            if (user.avatar) setPreview(user.avatar);
            if (user.color) setNewColor(user.color);
        }
        setIsGettingUser(false);
    };
    useEffect(() => {
        if (!isLoading) {
            if (user.nick !== nick) {
                navigate('/perfil');
            } else {
                checking();
            }
        }
    }, [isLoading]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword === newConfirmPassword) {
            setPasswordsAreSame(true)
            const form = new FormData();
            if (newPassword === newConfirmPassword) {
                if (newPassword) {
                    form.append('password', newPassword);
                }
                if (newAvatar !== undefined && newAvatar !== null) {
                    form.append('avatar', newAvatar);
                }
                form.append('color', newColor);
                form.append('_method', 'PUT');

                update({ nick, form });
            }
        } else {
            setPasswordsAreSame(false)
        }
    };

    if (isLoading || isGettingUser) return (<> <Loading /></>);
    const formErrors = updateError?.response?.data?.errors;
    return (
        <Fragment>
             
            <div className="form">
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-fields">

                        <div className='password-field'>
                            <input
                                type={viewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="newPassword"
                                placeholder="Nueva contraseña"
                            /><button type="button" className='seePassword' onClick={() => { setViewPassword(!viewPassword) }}><img src={viewPassword ? VisibilityOn : VisibilityOff} /></button>
                        </div>
                        {formErrors?.password ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.password[0]} </label><br /></> : <></>}
                        <br />
                        <div className='password-field'>
                            <input
                                type={viewConfirmPassword ? 'text' : 'password'}
                                value={newConfirmPassword}
                                onChange={(e) => setNewConfirmPassword(e.target.value)}
                                placeholder="Confirmar nueva contraseña"
                            /><button type="button" className='seePassword' onClick={() => { setViewConfirmPassword(!viewConfirmPassword) }}><img src={viewConfirmPassword ? VisibilityOn : VisibilityOff} /></button>
                        </div>
                        {formErrors?.password ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.password[0]} </label><br /></> : <></>}
                        {passwordsAreSame ? <></> : <label  className='form-error'>Las contraseñas no coinciden</label>}
                        <br />
                        <div className="custom-file-container">
                            <label htmlFor="file-upload" className="file-button">
                                <span className="icon"><img src={Folder}/></span>
                                <span className="text">Seleccionar Archivo</span>
                            </label>
                            <input type="file" id="file-upload" onChange={handleFileChange} />
                            <span id="file-name" className="file-status">{newAvatar?.name}</span>
                        </div>
                        {formErrors?.avatar ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.avatar[0]} </label><br /></> : <></>}
                        <br />
                        <input type="color" className="color-input" value={newColor} name="color" onChange={(e) => { setNewColor(e.target.value) }} />

                        <button type="submit" onClick={(event)=>{startButtonSound(true)}} disabled={isUpdating}>
                            {isUpdating ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </div>

                    <div className="avatar-preview-container">
                        <img
                            src={preview}
                            alt="Avatar"
                            style={{ borderColor: newColor }}
                            onError={(e) => { e.target.src = Placeholder; }}
                            className="avatar-preview"
                        />
                    </div>
                </form>
            </div >
        </Fragment >
    );
}

export default ProfileEdit;