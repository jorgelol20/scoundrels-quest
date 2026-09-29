export const SUPPORTED_LOCALES = ['es', 'en'];
export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'sq_locale';

/**
 * Orden de resolución: ?lang= (entrada desde SEO/hreflang) > localStorage >
 * locale de usuario > navigator (español si empieza por 'es') > 'en'.
 *
 * El juego sale en español solo si hay señal de español; por defecto sale
 * en inglés para captar audiencia internacional.
 *
 * @param {string|null|undefined} userLocale locale persistido del usuario (p. ej. 'en')
 * @returns {'es'|'en'}
 */
export const resolveInitialLocale = (userLocale) => {
    let fromUrl = null;
    if (typeof window !== 'undefined') {
        try {
            fromUrl = new URLSearchParams(window.location.search).get('lang');
        } catch {
            fromUrl = null;
        }
    }
    if (SUPPORTED_LOCALES.includes(fromUrl)) return fromUrl;

    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    if (SUPPORTED_LOCALES.includes(stored)) return stored;
    if (SUPPORTED_LOCALES.includes(userLocale)) return userLocale;
    if (typeof navigator !== 'undefined' && (navigator.language || '').toLowerCase().startsWith('es')) return 'es';
    return DEFAULT_LOCALE;
};

/**
 * @param {'es'|'en'} locale
 */
export const persistLocale = (locale) => {
    if (typeof localStorage !== 'undefined' && SUPPORTED_LOCALES.includes(locale)) {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
};

/**
 * @param {unknown} locale
 * @returns {'es'|'en'}
 */
export const normalizeLocale = (locale) => (SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE);
