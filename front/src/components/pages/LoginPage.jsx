import { Fragment, useContext, useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import VisibilityOn from '/images/visibility_on.svg'
import VisibilityOff from '/images/visibility_off.svg'
import Banner from '../structure/Banner.jsx';
import './LoginPage.css'
import { useNavigate } from 'react-router-dom';
import { settingsContext } from '../../context/SettingsProvider.jsx';

import GoogleLogo from '/images/google-icon.svg'
import XLogo from '/images/x-icon.svg'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false)
    const navigate = useNavigate()
    const { startButtonSound } = useContext(settingsContext)

    const { user, login, isLoading, isLogin, loginError } = useUser();

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ email, password });
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

    return (
        <Fragment>

            <div className="form">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Iniciar Sesión</h2>
                    {loginError ? <><br /><label className='form-error' htmlFor="newPassword"> {loginError.response?.errors?.email[0] ?? 'Credenciales no válidas'} </label><br /></> : <></>}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <br />
                    <div className='password-field'>
                        <input
                            type={viewPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                        /><button type="button" className='seePassword' onClick={() => { setViewPassword(!viewPassword) }}><img src={viewPassword ? VisibilityOn : VisibilityOff} /></button>
                    </div>
                    <br />
                    <div>
                        <button type="submit" onClick={(event) => { startButtonSound(true) }} disabled={isLogin}>
                            {isLogin ? 'Entrando...' : 'Login'}
                        </button>
                        <p>¿No tienes cuenta? <a onClick={() => { navigate('/signup') }}>¡Registrate!</a></p>
                        <div className='social-login'>
                            <button type='button' className='google-login' onClick={loginWithGoogle}>Google <img className='google-icon' src={GoogleLogo} /></button>
                            <button type='button' className='google-login' onClick={loginWithX}>X <img className='google-icon' src={XLogo} /></button>
                        </div>
                    </div>

                </form>
            </div>
        </Fragment>
    );
};
export default Login;
