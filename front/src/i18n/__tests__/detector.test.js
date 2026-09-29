import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    resolveInitialLocale,
    normalizeLocale,
    persistLocale,
    DEFAULT_LOCALE,
    LOCALE_STORAGE_KEY,
} from '../detector.js';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('resolveInitialLocale', () => {
    it('inglés por defecto sin ninguna pista', () => {
        expect(DEFAULT_LOCALE).toBe('en');
        // Node 26 expone navigator con el idioma del SO: se fija a francés
        // para simular "sin pista de español".
        vi.stubGlobal('navigator', { language: 'fr-FR' });
        expect(resolveInitialLocale(null)).toBe('en');
        expect(resolveInitialLocale(undefined)).toBe('en');
        vi.stubGlobal('navigator', undefined);
        expect(resolveInitialLocale(null)).toBe('en');
    });

    it('español si el navegador es español', () => {
        vi.stubGlobal('navigator', { language: 'es-ES' });
        expect(resolveInitialLocale(null)).toBe('es');
    });

    it('inglés para cualquier otro idioma de navegador', () => {
        for (const language of ['en-US', 'fr-FR', 'de-DE', 'pt-BR', '']) {
            vi.stubGlobal('navigator', { language });
            expect(resolveInitialLocale(null), language).toBe('en');
        }
    });

    it('user.locale válido tiene prioridad sobre el navegador', () => {
        vi.stubGlobal('navigator', { language: 'es-ES' });
        expect(resolveInitialLocale('en')).toBe('en');
        vi.stubGlobal('navigator', { language: 'en-US' });
        expect(resolveInitialLocale('es')).toBe('es');
    });

    it('localStorage tiene prioridad sobre user.locale y navegador', () => {
        const store = {};
        vi.stubGlobal('localStorage', {
            getItem: (k) => store[k] ?? null,
            setItem: (k, v) => { store[k] = v; },
        });
        vi.stubGlobal('navigator', { language: 'es-ES' });
        store[LOCALE_STORAGE_KEY] = 'en';
        expect(resolveInitialLocale('es')).toBe('en');
    });

    it('?lang= tiene la máxima prioridad', () => {
        const store = {};
        vi.stubGlobal('localStorage', {
            getItem: (k) => store[k] ?? null,
            setItem: (k, v) => { store[k] = v; },
        });
        vi.stubGlobal('navigator', { language: 'es-ES' });
        vi.stubGlobal('window', { location: { search: '?lang=en' } });
        store[LOCALE_STORAGE_KEY] = 'es';
        expect(resolveInitialLocale('es')).toBe('en');
    });

    it('?lang= inválido se ignora', () => {
        vi.stubGlobal('navigator', { language: 'fr-FR' });
        vi.stubGlobal('window', { location: { search: '?lang=fr' } });
        expect(resolveInitialLocale(null)).toBe('en');
    });
});

describe('normalizeLocale', () => {
    it('normaliza a inglés lo no soportado', () => {
        expect(normalizeLocale('es')).toBe('es');
        expect(normalizeLocale('en')).toBe('en');
        expect(normalizeLocale('fr')).toBe('en');
        expect(normalizeLocale(null)).toBe('en');
    });
});

describe('persistLocale', () => {
    it('guarda solo locales soportados', () => {
        const store = {};
        vi.stubGlobal('localStorage', {
            getItem: (k) => store[k] ?? null,
            setItem: (k, v) => { store[k] = v; },
        });
        persistLocale('es');
        expect(store[LOCALE_STORAGE_KEY]).toBe('es');
        persistLocale('fr');
        expect(store[LOCALE_STORAGE_KEY]).toBe('es');
    });
});
