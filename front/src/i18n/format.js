/**
 * Wrappers finos sobre Intl para fechas/números/relativos.
 * Un único punto de formato parametrizado por locale ('es' | 'en').
 */

/**
 * @param {'es'|'en'} locale
 */
const dateLocale = (locale) => (locale === 'en' ? 'en-GB' : 'es-ES');

/**
 * Parsea a Date tolerando ISO (`2026-09-24`, lo que devuelve la API) y
 * `DD-MM-YYYY` (formato de VITE_LAST_COMMIT_DATE). Devuelve null si no es
 * parseable: los formateadores deben fallar a un fallback, no lanzar.
 *
 * @param {Date|string|number} value
 * @returns {Date|null}
 */
const parseDate = (value) => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value !== 'string') return null;

    const dmy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
    if (dmy) {
        const [, day, month, year] = dmy;
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return Number.isNaN(date.getTime()) ? null : date;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * @param {'es'|'en'} locale
 * @param {Date|string|number} value
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export const fmtDate = (locale, value, options) => {
    const date = parseDate(value);
    if (!date) return '';
    return new Intl.DateTimeFormat(dateLocale(locale), options).format(date);
};

/**
 * @param {'es'|'en'} locale
 * @param {number} value
 * @param {Intl.NumberFormatOptions} [options]
 */
export const fmtNum = (locale, value, options) =>
    new Intl.NumberFormat(dateLocale(locale), options).format(value);

/**
 * @param {'es'|'en'} locale
 * @param {number} value
 * @param {Intl.RelativeTimeFormatUnit} unit
 */
export const fmtRel = (locale, value, unit) =>
    new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
