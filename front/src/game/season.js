/**
 * Predicados puros de temporada estacional (sin React/DOM/azar).
 * El adaptador (SettingsProvider) llama con `new Date()` y aplica `data-theme`.
 */

export const THEME_STORAGE_KEY = 'sq_theme';

export const THEMES = {
    HALLOWEEN: 'halloween',
    DEFAULT: 'default',
};

export const THEME_PREFERENCES = {
    AUTO: 'auto',
    HALLOWEEN: 'halloween',
    DEFAULT: 'default',
};

/**
 * Dice si una fecha cae en temporada Halloween (1-31 octubre, hora local).
 *
 * @param {Date} [date=new Date()] Fecha a evaluar.
 * @returns {boolean} true del 1-oct 00:00 al 31-oct 23:59 inclusive.
 */
export const isHalloweenSeason = (date = new Date()) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
    return date.getMonth() === 9 && date.getDate() >= 1 && date.getDate() <= 31;
};

/**
 * Normaliza la preferencia guardada en localStorage.
 *
 * @param {unknown} value Valor leído.
 * @returns {'auto'|'halloween'|'default'} Preferencia válida ('auto' por defecto).
 */
export const normalizeThemePreference = (value) => {
    if (value === THEME_PREFERENCES.HALLOWEEN || value === THEME_PREFERENCES.DEFAULT) return value;
    return THEME_PREFERENCES.AUTO;
};

/**
 * Resuelve el tema efectivo: el override manual manda, si es 'auto' decide la fecha.
 *
 * @param {Date} [date=new Date()] Fecha a evaluar.
 * @param {'auto'|'halloween'|'default'} [preference='auto'] Override del usuario.
 * @returns {'halloween'|'default'} Tema a aplicar en `data-theme`.
 */
export const resolveSeasonalTheme = (date = new Date(), preference = THEME_PREFERENCES.AUTO) => {
    const normalized = normalizeThemePreference(preference);
    if (normalized === THEME_PREFERENCES.HALLOWEEN) return THEMES.HALLOWEEN;
    if (normalized === THEME_PREFERENCES.DEFAULT) return THEMES.DEFAULT;
    return isHalloweenSeason(date) ? THEMES.HALLOWEEN : THEMES.DEFAULT;
};
