import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esCommon from '../locales/es/common.json';
import enCommon from '../locales/en/common.json';
import esNav from '../locales/es/nav.json';
import enNav from '../locales/en/nav.json';
import esSettings from '../locales/es/settings.json';
import enSettings from '../locales/en/settings.json';
import esHome from '../locales/es/home.json';
import enHome from '../locales/en/home.json';
import esRanking from '../locales/es/ranking.json';
import enRanking from '../locales/en/ranking.json';
import esMatch from '../locales/es/match.json';
import enMatch from '../locales/en/match.json';
import esProfile from '../locales/es/profile.json';
import enProfile from '../locales/en/profile.json';
import esAuth from '../locales/es/auth.json';
import enAuth from '../locales/en/auth.json';
import esModals from '../locales/es/modals.json';
import enModals from '../locales/en/modals.json';
import esBugs from '../locales/es/bugs.json';
import enBugs from '../locales/en/bugs.json';
import esGame from '../locales/es/game.json';
import enGame from '../locales/en/game.json';
import esCharacters from '../locales/es/characters.json';
import enCharacters from '../locales/en/characters.json';
import esCredits from '../locales/es/credits.json';
import enCredits from '../locales/en/credits.json';
import esSeo from '../locales/es/seo.json';
import enSeo from '../locales/en/seo.json';
import esTutorial from '../locales/es/tutorial.json';
import enTutorial from '../locales/en/tutorial.json';
import esLegal from '../locales/es/legal.json';
import enLegal from '../locales/en/legal.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './detector.js';

/**
 * Todos los namespaces van en el bundle inicial vía `resources`.
 *
 * NOTA: `tutorial` y `legal` fueron lazy (import() dinámico con backend
 * propio) y mostraban las claves crudas (p. ej. `legal.s1.li1.label`)
 * cuando su chunk no cargaba (despliegue parcial, 404 del chunk).
 * Van en el bundle inicial a cambio de cero claves crudas.
 */
if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources: {
            es: { common: esCommon, nav: esNav, settings: esSettings, home: esHome, ranking: esRanking, match: esMatch, profile: esProfile, auth: esAuth, modals: esModals, bugs: esBugs, game: esGame, characters: esCharacters, credits: esCredits, seo: esSeo, tutorial: esTutorial, legal: esLegal },
            en: { common: enCommon, nav: enNav, settings: enSettings, home: enHome, ranking: enRanking, match: enMatch, profile: enProfile, auth: enAuth, modals: enModals, bugs: enBugs, game: enGame, characters: enCharacters, credits: enCredits, seo: enSeo, tutorial: enTutorial, legal: enLegal },
        },
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: SUPPORTED_LOCALES,
        defaultNS: 'common',
        ns: ['common', 'nav', 'settings', 'home', 'ranking', 'match', 'profile', 'auth', 'modals', 'bugs', 'game', 'legal', 'tutorial', 'characters', 'credits', 'seo'],
        interpolation: { escapeValue: false },
        react: { useSuspense: true },
    });
}

export default i18n;
