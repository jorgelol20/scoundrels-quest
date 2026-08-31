import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useUser } from '../../hooks/useUser.js';
import { useNavigate, useParams } from 'react-router-dom';

import { settingsContext } from "../../context/SettingsProvider.jsx";
import Placeholder from '/images/placeholder.webp'
import VisibilityOn from '/images/visibility_on.svg'
import VisibilityOff from '/images/visibility_off.svg'
import Folder from '/images/folder.svg'
import './SignupPage.css'
import Loading from "../Loading.jsx";
import Banner from "../structure/Banner.jsx";

import GoogleLogo from '/images/google-icon.svg'
import XLogo from '/images/x-icon.svg'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SignupPage = () => {
    const navigate = useNavigate();
    const { user, isLoading, signup, signupError, isSingingup } = useUser();
    const [isGettingUser, setIsGettingUser] = useState(true);

    const { startButtonSound } = useContext(settingsContext)

    // Estados del formulario
    const nickRef = useRef();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('');
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false)
    const [passwordsAreSame, setPasswordsAreSame] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const [color, setColor] = useState("#FFF")
    const [preview, setPreview] = useState(Placeholder);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setPasswordsAreSame(true)
            const form = new FormData();
            if (password === confirmPassword) {
                setPasswordsAreSame(true)
                form.append('nick', nickRef.current)
                form.append('email', email)
                form.append('password', password);
                if (avatar !== undefined && avatar !== null) {
                    form.append('avatar', avatar);
                }
                form.append('color', color);
                signup(form);
            }
        } else {
            setPasswordsAreSame(false)
        }
    };
    useEffect(() => {
        if (!isLoading) {
            if (user) {
                navigate("/")
            }
        }
    }, [isLoading])

    const loginWithGoogle = () => {
        window.location.href = BACKEND_URL+'/auth/google/redirect';
    };

    const loginWithX = () => {
        window.location.href = BACKEND_URL+'/auth/x/redirect';
    };

    if (isLoading) return (<> <Loading /></>);
    const formErrors = signupError?.response?.data?.errors;
    return (
        <Fragment>

            <div className="form">
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-fields">

                        {formErrors?.nick ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.nick[0]} </label><br /></> : <></>}
                        <input
                            type="text"
                            ref={nickRef}
                            onChange={(e) => { nickRef.current = e.target.value }}
                            placeholder="Nick"
                            onInvalid={(e) => e.target.setCustomValidity("Este campo es obligatorio")}
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                        />

                        {formErrors?.email ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.email[0]} </label><br /></> : <></>}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            onInvalid={(e) => e.target.setCustomValidity("Este campo es obligatorio")}
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                        />

                        {formErrors?.password ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.password[0]} </label><br /></> : <></>}
                        {passwordsAreSame ? <></> : <><br /><label className='form-error'>Las contraseñas no coinciden</label><br /></>}
                        <div className='password-field'>
                            <input
                                type={viewPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="newPassword"
                                placeholder="Contraseña"
                                onInvalid={(e) => e.target.setCustomValidity("Este campo es obligatorio")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            /><button type="button" className='seePassword' onClick={() => { setViewPassword(!viewPassword) }}><img src={viewPassword ? VisibilityOn : VisibilityOff} /></button>
                        </div>
                        <div className='password-field'>
                            <input
                                type={viewConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmar contraseña"
                                onInvalid={(e) => e.target.setCustomValidity("Este campo es obligatorio")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            /><button type="button" className='seePassword' onClick={() => { setViewConfirmPassword(!viewConfirmPassword) }}><img src={viewConfirmPassword ? VisibilityOn : VisibilityOff} /></button>
                        </div>

                        {formErrors?.avatar ? <><br /><label className='form-error' htmlFor="newPassword"> {formErrors.avatar[0]} </label><br /></> : <></>}
                        <div className="custom-file-container">
                            <label htmlFor="file-upload" className="file-button">
                                <span className="icon"><img src={Folder} /></span>
                                <span className="text">Seleccionar Archivo</span>
                            </label>
                            <input type="file" id="file-upload" onChange={handleFileChange} />
                            <span id="file-name" className="file-status">{avatar?.name}</span>
                        </div>

                        <br />
                        <input type="color" className="color-input" defaultValue={color} value={color} name="color" onChange={(e) => { setColor(e.target.value) }} />

                        <div className="loginButton">
                            <button type="submit" disabled={isSingingup} onClick={(event) => { startButtonSound(true) }}>
                                {isSingingup ? 'Procesando...' : 'Registrarse'}
                            </button>
                            <p>¿Ya tienes cuenta? <a onClick={() => { navigate('/login') }}>¡Inicia sesión!</a></p>
                            <div className='social-login'>
                                <button type='button' className='google-login' onClick={loginWithGoogle}>Google <img className='google-icon' src={GoogleLogo} /></button>
                                <button type='button' className='google-login' onClick={loginWithX}>X <img className='google-icon' src={XLogo} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="avatar-preview-container">
                        <img
                            src={preview}
                            alt="Avatar"
                            style={{ borderColor: color }}
                            onError={(e) => { e.target.src = Placeholder; }}
                            className="avatar-preview"
                        />
                    </div>
                </form>
            </div >
        </Fragment >
    );
}

export default SignupPage;