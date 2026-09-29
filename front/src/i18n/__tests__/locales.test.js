import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import i18n from '../index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCALES = resolve(HERE, '..', '..', 'locales');

const readNs = (lang, ns) => JSON.parse(readFileSync(join(LOCALES, lang, `${ns}.json`), 'utf8'));

/** Namespaces = ficheros en disco (fuente de verdad, incluye los lazy). */
const namespaces = readdirSync(join(LOCALES, 'es'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

const keys = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

const variables = (value) => [...String(value).matchAll(/{{\s*([\w.]+)\s*}}/g)].map((m) => m[1]).sort();

describe('i18n: paridad es/en', () => {
    it('index.js declara todos los namespaces que existen en disco', () => {
        for (const ns of namespaces) {
            expect(i18n.options.ns, `ns '${ns}' no registrado en index.js`).toContain(ns);
        }
    });

    it.each(namespaces)('%s existe en es y en', (ns) => {
        expect(() => readNs('es', ns), `falta es/${ns}.json`).not.toThrow();
        expect(() => readNs('en', ns), `falta en/${ns}.json`).not.toThrow();
    });

    it.each(namespaces)('%s tiene las mismas claves en es y en', (ns) => {
        expect(keys(readNs('en', ns)).sort()).toEqual(keys(readNs('es', ns)).sort());
    });

    it.each(namespaces)('%s no usa el texto español como clave', (ns) => {
        // Se permiten guiones para códigos estables (p. ej. ids de misión);
        // lo que se prohíbe es texto libre con espacios o tildes.
        for (const key of keys(readNs('es', ns))) {
            expect(key, `clave inválida: ${key}`).toMatch(/^[a-z0-9_.-]+$/i);
        }
    });

    it.each(namespaces)('%s usa las mismas variables {{var}} en es y en', (ns) => {
        const flatten = (obj, prefix = '', acc = {}) => {
            for (const [k, v] of Object.entries(obj)) {
                const key = prefix ? `${prefix}.${k}` : k;
                if (v && typeof v === 'object') flatten(v, key, acc);
                else acc[key] = v;
            }
            return acc;
        };
        const esValues = flatten(readNs('es', ns));
        const enValues = flatten(readNs('en', ns));
        for (const [key, value] of Object.entries(esValues)) {
            expect(variables(enValues[key]), `variables distintas en ${key}`).toEqual(variables(value));
            expect(value, `HTML dentro del valor de ${key}`).not.toMatch(/<[a-z/][\s\S]*>/i);
        }
    });
});
