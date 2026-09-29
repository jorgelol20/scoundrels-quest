import { describe, it, expect } from 'vitest';
import { fmtDate, fmtNum, fmtRel } from '../format.js';

describe('fmtDate', () => {
    it('formatea ISO de la API', () => {
        expect(fmtDate('es', '2026-09-24T10:30:00Z')).toMatch(/24/);
        expect(fmtDate('en', '2026-09-24T10:30:00Z')).toMatch(/24/);
    });

    it('formatea DD-MM-YYYY de VITE_LAST_COMMIT_DATE', () => {
        expect(fmtDate('es', '24-09-2026')).toBe('24/9/2026');
        expect(fmtDate('en', '24-09-2026')).toBe('24/09/2026');
    });

    it('devuelve cadena vacía ante fechas inválidas (no lanza)', () => {
        expect(fmtDate('es', 'no-es-fecha')).toBe('');
        expect(fmtDate('es', '2026-13-45')).toBe('');
        expect(fmtDate('es', '')).toBe('');
        expect(fmtDate('es', null)).toBe('');
    });

    it('respeta opciones de formato', () => {
        expect(fmtDate('es', '2026-09-24', { dateStyle: 'long' })).toBe('24 de septiembre de 2026');
        expect(fmtDate('en', '2026-09-24', { dateStyle: 'long' })).toBe('24 September 2026');
    });
});

describe('fmtNum', () => {
    it('formatea números por locale', () => {
        expect(fmtNum('es', 1234567)).toBe('1.234.567');
        expect(fmtNum('en', 1234567)).toBe('1,234,567');
    });
});

describe('fmtRel', () => {
    it('tiempo relativo en ambos idiomas', () => {
        expect(fmtRel('es', -1, 'day')).toBe('ayer');
        expect(fmtRel('en', -1, 'day')).toBe('yesterday');
        expect(fmtRel('es', -3, 'day')).toBe('hace 3 días');
        expect(fmtRel('en', -3, 'day')).toBe('3 days ago');
    });
});
