import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
    //URL del servidor de Laravel
    baseURL : BACKEND_URL,
});

/**
 * Cada vez que se haga una petición, de forma automática insertará el 
 * token de sanctum en el header.
 */
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
