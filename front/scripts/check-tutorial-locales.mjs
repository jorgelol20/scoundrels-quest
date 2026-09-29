/**
 * Verificación del namespace `tutorial` (registrado eager en src/i18n/index.js,
 * ver imports y `resources` — ya no es lazy ni lo ignora el test de paridad
 * de src/i18n/__tests__/locales.test.js).
 *
 *   node scripts/check-tutorial-locales.mjs
 *
 * Comprueba:
 *   1. Paridad 1:1 de claves hoja es/en.
 *   2. Mismas variables {{var}} en cada valor es/en.
 *   3. Claves válidas (sin acentos, guiones ni caracteres raros) y sin HTML.
 *   4. Que todas las claves estáticas t('...') usadas en un JSX existan en el JSON.
 *   5. Que los prefijos de clave dinámicos t(`prefix.${x}`) resuelvan al menos
 *      una clave real, enumerando los valores posibles que aparecen en el JSX.
 *   6. Que el JSON no contenga claves huérfanas (nadie las usa en el JSX).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NS = 'tutorial';
const es = JSON.parse(fs.readFileSync(path.join(root, `src/locales/es/${NS}.json`), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, `src/locales/en/${NS}.json`), 'utf8'));

const errors = [];
const fail = (msg) => errors.push(msg);

const leaves = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object' ? leaves(v, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

const flatten = (obj, prefix = '', acc = {}) => {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object') flatten(v, key, acc);
        else acc[key] = v;
    }
    return acc;
};

const variables = (value) =>
    [...String(value).matchAll(/{{\s*([\w.]+)\s*}}/g)].map((m) => m[1]).sort();

const esKeys = leaves(es);
const enKeys = leaves(en);

// 1. Paridad 1:1
for (const key of esKeys) if (!enKeys.includes(key)) fail(`solo en es: ${key}`);
for (const key of enKeys) if (!esKeys.includes(key)) fail(`solo en en: ${key}`);

// 2/3. Variables, formato de clave y HTML
const flatEs = flatten(es);
const flatEn = flatten(en);
for (const key of esKeys) {
    if (variables(flatEs[key]).join() !== variables(flatEn[key]).join()) {
        fail(`variables distintas en ${key}: es[${variables(flatEs[key])}] en[${variables(flatEn[key])}]`);
    }
    if (!/^[a-z0-9_.]+$/i.test(key)) fail(`clave no válida: ${key}`);
    if (/<[a-z/][\s\S]*>/i.test(String(flatEs[key]))) fail(`HTML dentro del valor de ${key}`);
}

// 4/5/6. Uso real desde el JSX
const files = fs
    .readdirSync(path.join(root, 'src/components/pages'))
    .filter((f) => f === 'Tutorial.jsx')
    .map((f) => path.join(root, 'src/components/pages', f));

const staticKeys = new Set();
const dynamicPrefixes = new Set();
for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([a-z0-9_.]+)'/gi)) staticKeys.add(m[1]);
    for (const m of src.matchAll(/\bt\(\s*`([^`$]+?)\./g)) dynamicPrefixes.add(m[1]);
}

for (const key of staticKeys) {
    if (!esKeys.includes(key)) fail(`t('${key}') no existe en ${NS}.json`);
}

// Los prefijos dinámicos se resuelven con los valores que el propio JSX genera.
const srcText = fs.readFileSync(files[0], 'utf8');
const arrayOfStrings = (name) => {
    const block = srcText.match(new RegExp(`const ${name} = \\[([^\\]]+)\\]`));
    return block ? [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
};
const minibossIds = [...srcText.matchAll(/^ {4}'([a-z_]+)',$/gm)].map((m) => m[1]);
const cardEffectIds = [...srcText.matchAll(/\{ 'id': '([a-z_]+)', 'image':/g)].map((m) => m[1]);
const effectTargets = [...new Set([...srcText.matchAll(/'target': '([a-z]+)'/g)].map((m) => m[1]))];
const characterCodes = [...srcText.matchAll(/code === '([a-z]+)'/g)].map((m) => m[1]);
const slideIds = [...srcText.matchAll(/\{ id: '([a-z]+)', render:/g)].map((m) => m[1]);
const referenceIds = [...srcText.matchAll(/\{ id: '(spade|diamond|heart|club)', icon:/g)].map((m) => m[1]);

const dynamicCandidates = {
    'slides': slideIds,
    'sections.cards.reference': referenceIds,
    'minibosses.list': minibossIds,
    'simulator.scenarios': arrayOfStrings('simulatorScenarios'),
    'simulator.effectOptions': arrayOfStrings('simulatorEffectOptions'),
    'simulator.enemyEffectOptions': arrayOfStrings('simulatorEnemyEffectOptions'),
    'filters.modifier': arrayOfStrings('modifierFilters'),
    'filters.effect': arrayOfStrings('effectFilters'),
    'filters.targets': effectTargets,
    'effects.items': cardEffectIds,
    'effects.details': arrayOfStrings('effectsWithDetails'),
    'characters.strategies': characterCodes,
};

for (const [prefix, values] of Object.entries(dynamicCandidates)) {
    if (!dynamicPrefixes.has(prefix)) continue;
    if (!values.length) {
        fail(`no se han podido extraer los valores de \`${prefix}.\${...}\``);
        continue;
    }
    for (const value of [...new Set(values)]) {
        if (!esKeys.some((k) => k.startsWith(`${prefix}.${value}.`))) {
            fail(`t(\`${prefix}.\${...}\`) no resuelve para '${value}'`);
        }
    }
}

// 6. Claves huérfanas: todo prefijo dinámico debe tener al menos una clave usada.
const usedPrefixes = [...staticKeys].map((k) => k.split('.').slice(0, 2).join('.'));
for (const key of esKeys) {
    const parent = key.split('.').slice(0, -1).join('.');
    const used =
        staticKeys.has(key) ||
        [...dynamicPrefixes].some((p) => key.startsWith(`${p}.`)) ||
        usedPrefixes.includes(parent);
    if (!used) fail(`clave huérfana (no usada en el JSX): ${key}`);
}

// 7. Texto español residual en el JSX (literales que no pasan por t()).
//    Los códigos de datos de cartas (Pica, Trebol, Diamante, Corazon) son
//    intencionadamente literales y están en la lista blanca.
const DATA_CODES = new Set(['Pica', 'Trebol', 'Diamante', 'Corazon', 'Miniboss', 'Diamante', 'heal_roulete', 'restore_ability', 'progresive_heal', 'dmg_reduction', 'invincibility', 'health_steal', 'revive', 'thorny', 'poison', 'weapon_breaker', 'plunder', 'extra_gold', 'souleater', 'antiheal', 'mitosis', 'seal', 'blocked', 'black', 'white', 'center', 'page', 'auto', 'base']);
const SPANISH = /[áéíóúñÁÉÍÓÚ¿¡]|\b(el|la|los|las|una|unos|mazo|mano|descartes|reiniciar|todos|enemigos?|armas?|curaciones?|minibosses?|escenarios?|efectos?|modificadores?|tienda|combate|rondas?|oro|vida|personaje|buscar|aqu[ií]|n[uú]mero|poder|valor)\b/i;
for (const [index, line] of srcText.split(/\r?\n/).entries()) {
    if (/^\s*import\b/.test(line) || /require\(|url\(/.test(line)) continue;
    for (const m of line.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
        const literal = m[1] ?? m[2] ?? m[3];
        if (literal === undefined || DATA_CODES.has(literal)) continue;
        // Se ignoran className/keys CSS, rutas y claves de traducción.
        if (/^[a-z0-9_.\-\s[\]]+$/i.test(literal)) continue;
        if (/^[a-z0-9_]+(\.[a-z0-9_$]+|\.\$\{[^}]+\})+$/.test(literal)) continue;
        if (SPANISH.test(literal)) fail(`texto sin traducir en la línea ${index + 1}: "${literal}"`);
    }
}

console.log(`namespace ${NS}: ${esKeys.length} claves hoja en es y ${enKeys.length} en en`);
if (errors.length) {
    console.error(`\n${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
}
console.log('OK: paridad 1:1, variables, formato de clave y uso en el JSX correctos.');
