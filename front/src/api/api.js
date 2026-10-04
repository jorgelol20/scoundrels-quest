import axios from 'axios';
import i18n from '../i18n/index.js';
import { DEFAULT_LOCALE, normalizeLocale } from '../i18n/detector.js';
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
    // Fase 0 i18n: el back resuelve el idioma con Accept-Language (fallback 'en')
    try {
        config.headers['Accept-Language'] = normalizeLocale(i18n.language?.split('-')[0]);
    } catch {
        config.headers['Accept-Language'] = DEFAULT_LOCALE;
    }
    return config;
});

export default api;
