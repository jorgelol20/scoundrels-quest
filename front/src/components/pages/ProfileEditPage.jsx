import React, { Fragment, useContext, useEffect, useState } from "react";
import { useUser } from '../../hooks/useUser.js';
import { useNavigate, useParams } from 'react-router-dom';

import { settingsContext } from "../../context/SettingsProvider.jsx";

import Placeholder from '/images/placeholder.webp';
import VisibilityOn from '/images/visibility_on.svg';
import VisibilityOff from '/images/visibility_off.svg';
import Folder from '/images/folder.svg';

import './ProfileEditPage.css';
import Loading from "../Loading.jsx";
import Banner from "../structure/Banner.jsx";

const ProfileEdit = () => {
    const navigate = useNavigate();
    const {
        user,
        update,
        updateError,
        isLoading,
        getUsuario,
        isUpdating,
        error
    } = useUser();

    const [isGettingUser, setIsGettingUser] = useState(true);
    const { nick } = useParams();

    const { startButtonSound } = useContext(settingsContext);

    // Estados del formulario
    const [newPassword, setNewPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false);

    const [newConfirmPassword, setNewConfirmPassword] = useState('');
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false);

    const [passwordsAreSame, setPasswordsAreSame] = useState(true);

    const [newAvatar, setNewAvatar] = useState(null);
    const [newBanner, setNewBanner] = useState(null);

    const [newColor, setNewColor] = useState(null);
    const [preview, setPreview] = useState(Placeholder);

    const checking = async () => {
        if (user) {
            if (user.avatar) {
                setPreview(user.avatar);
            }

            if (user.color) {
                setNewColor(user.color);
            }
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

    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setNewAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setNewBanner(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword === newConfirmPassword) {
            setPasswordsAreSame(true);

            const form = new FormData();

            if (newPassword) {
                form.append('password', newPassword);
            }

            if (newAvatar !== undefined && newAvatar !== null) {
                form.append('avatar', newAvatar);
            }

            if (newBanner !== undefined && newBanner !== null) {
                form.append('banner', newBanner);
            }

            form.append('color', newColor);
            form.append('_method', 'PUT');

            update({ nick, form });
        } else {
            setPasswordsAreSame(false);
        }
    };

    if (isLoading || isGettingUser) {
        return (
            <>
                <Loading />
            </>
        );
    }

    const formErrors = updateError?.response?.data?.errors;

    return (
        <Fragment>
            <div className="form">
                <form className="edit-form" onSubmit={handleSubmit}>

                    <div className="form-fields">

                        {/* NUEVA CONTRASEÑA */}
                        <div className="password-field">
                            <input
                                type={viewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="newPassword"
                                placeholder="Nueva contraseña"
                            />

                            <button
                                type="button"
                                className="seePassword"
                                onClick={() => {
                                    setViewPassword(!viewPassword);
                                }}
                            >
                                <img
                                    src={viewPassword ? VisibilityOn : VisibilityOff}
                                    alt="Mostrar contraseña"
                                />
                            </button>
                        </div>

                        {formErrors?.password && (
                            <>
                                <br />
                                <label className="form-error">
                                    {formErrors.password[0]}
                                </label>
                                <br />
                            </>
                        )}

                        <br />

                        {/* CONFIRMAR CONTRASEÑA */}
                        <div className="password-field">
                            <input
                                type={viewConfirmPassword ? 'text' : 'password'}
                                value={newConfirmPassword}
                                onChange={(e) => setNewConfirmPassword(e.target.value)}
                                placeholder="Confirmar nueva contraseña"
                            />

                            <button
                                type="button"
                                className="seePassword"
                                onClick={() => {
                                    setViewConfirmPassword(!viewConfirmPassword);
                                }}
                            >
                                <img
                                    src={viewConfirmPassword ? VisibilityOn : VisibilityOff}
                                    alt="Mostrar contraseña"
                                />
                            </button>
                        </div>

                        {formErrors?.password && (
                            <>
                                <br />
                                <label className="form-error">
                                    {formErrors.password[0]}
                                </label>
                                <br />
                            </>
                        )}

                        {!passwordsAreSame && (
                            <label className="form-error">
                                Las contraseñas no coinciden
                            </label>
                        )}

                        <br />

                        {/* AVATAR */}
                        <label htmlFor="file-upload-avatar">
                            Avatar
                        </label>

                        <div className="custom-file-container">

                            <label
                                htmlFor="file-upload-avatar"
                                className="file-button"
                            >
                                <span className="icon">
                                    <img src={Folder} alt="Carpeta" />
                                </span>

                                <span className="text">
                                    Seleccionar Archivo
                                </span>
                            </label>

                            <input
                                type="file"
                                id="file-upload-avatar"
                                onChange={handleAvatarFileChange}
                            />

                            <span
                                id="file-name-avatar"
                                className="file-status"
                            >
                                {newAvatar?.name}
                            </span>

                        </div>

                        {formErrors?.avatar && (
                            <>
                                <br />
                                <label className="form-error">
                                    {formErrors.avatar[0]}
                                </label>
                                <br />
                            </>
                        )}

                        {/* BANNER */}
                        <label htmlFor="file-upload-banner">
                            Banner Fondo
                        </label>

                        <div className="custom-file-container">

                            <label
                                htmlFor="file-upload-banner"
                                className="file-button"
                            >
                                <span className="icon">
                                    <img src={Folder} alt="Carpeta" />
                                </span>

                                <span className="text">
                                    Seleccionar Archivo
                                </span>
                            </label>

                            <input
                                type="file"
                                id="file-upload-banner"
                                onChange={handleBannerFileChange}
                            />

                            <span
                                id="file-name-banner"
                                className="file-status"
                            >
                                {newBanner?.name}
                            </span>

                        </div>

                        {formErrors?.banner && (
                            <>
                                <br />
                                <label className="form-error">
                                    {formErrors.banner[0]}
                                </label>
                                <br />
                            </>
                        )}

                        <br />

                        {/* COLOR */}
                        <input
                            type="color"
                            className="color-input"
                            value={newColor || '#000000'}
                            name="color"
                            onChange={(e) => {
                                setNewColor(e.target.value);
                            }}
                        />

                        {/* BOTÓN ACTUALIZAR */}
                        <button
                            type="submit"
                            onClick={() => {
                                startButtonSound(true);
                            }}
                            disabled={isUpdating}
                        >
                            {isUpdating
                                ? 'Actualizando...'
                                : 'Actualizar'
                            }
                        </button>

                    </div>

                    {/* PREVISUALIZACIÓN DEL AVATAR */}
                    <div className="avatar-preview-container">
                        <img
                            src={preview}
                            alt="Avatar"
                            style={{ borderColor: newColor }}
                            onError={(e) => {
                                e.target.src = Placeholder;
                            }}
                            className="avatar-preview"
                        />
                    </div>

                </form>
            </div>
        </Fragment>
    );
};

export default ProfileEdit;