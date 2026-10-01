import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Lee el token de Sanctum que devuelve el callback OAuth.
 *
 * El backend lo entrega en el FRAGMENTO de la URL (#token=...), no en el
 * query string: el fragmento no viaja en la petición HTTP, por lo que no
 * acaba en los logs del servidor, en la cabecera Referer ni en el historial
 * de navegación compartido.
 *
 * Se mantiene la lectura por query como fallback para no romper durante el
 * despliegue si aún queda algún redireccionamiento antiguo.
 */
const leerToken = () => {
    const delFragmento = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
    if (delFragmento) return delFragmento;

    const deLaQuery = new URLSearchParams(window.location.search).get('token');
    if (deLaQuery) return deLaQuery;

    return null;
};

const GoogleCallback = () => {
    const { t } = useTranslation('auth');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const error = new URLSearchParams(window.location.search).get('reason');
        if (error) {
            // p. ej. email_not_verified | email_required
            navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
            return;
        }

        const token = leerToken();
        if (token) {
            localStorage.setItem('auth_token', token);
            // Limpia el fragmento para no dejar el token en la barra de direcciones.
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);

    return (<Fragment><div>{t('callbackLoading')}</div></Fragment>)
};

export default GoogleCallback;
