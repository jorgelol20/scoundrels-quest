import { Fragment, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Guarda el token en localStorage
            localStorage.setItem('auth_token', token);
            // Redirige al usuario al dashboard o inicio
            navigate('/');
        } else {
            // Manejar error si no llega el token
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (<Fragment><div>Cargando...</div></Fragment>)
};

export default GoogleCallback;