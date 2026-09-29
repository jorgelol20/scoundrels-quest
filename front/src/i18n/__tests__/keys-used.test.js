import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '..', '..');
const LOCALES = resolve(SRC, 'locales');

/** Store construido desde disco (no depende de qué namespaces cargó i18next). */
const store = {};
for (const lang of ['es', 'en']) {
    store[lang] = {};
    for (const f of readdirSync(join(LOCALES, lang))) {
        if (!f.endsWith('.json')) continue;
        store[lang][f.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(LOCALES, lang, f), 'utf8'));
    }
}

const walk = (dir) => {
    const out = [];
    for (const entry of readdirSync(dir)) {
        if (['locales', '__tests__', 'i18n', 'game'].includes(entry)) continue;
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) out.push(...walk(p));
        else if (/\.jsx?$/.test(entry)) out.push(p);
    }
    return out;
};

const lookup = (lang, ns, key) => key.split('.').reduce((acc, part) => acc?.[part], store[lang]?.[ns]);

const files = walk(SRC);
const usages = files.flatMap((file) => {
    const code = readFileSync(file, 'utf8');
    const ns = /useTranslation\('([a-z]+)'\)/.exec(code)?.[1] ?? 'common';
    return [...code.matchAll(/\bt\(\s*'([a-z0-9_.]+)'/gi)].map((m) => ({ file, ns, key: m[1] }));
});

describe('i18n: claves usadas en el código', () => {
    it('hay usos que comprobar', () => {
        expect(usages.length).toBeGreaterThan(100);
    });

    it.each(['es', 'en'])('toda clave estática usada existe en %s', (lang) => {
        const missing = usages
            .filter(({ ns, key }) => {
                // i18next plurales: count -> count_one / count_other
                if (lookup(lang, ns, key) !== undefined) return false;
                return lookup(lang, ns, `${key}_one`) === undefined
                    && lookup(lang, ns, `${key}_other`) === undefined;
            })
            .map(({ file, ns, key }) => `${ns}:${key} (${file})`);
        expect([...new Set(missing)]).toEqual([]);
    });
});
