import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n/detector.js';

const SITE_URL = 'https://scoundrels-quest.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-image.webp`;

const OG_LOCALES = { es: 'es_ES', en: 'en_US' };

/** Rutas con SEO propio; el resto cae en home (ver getRouteKey). */
const getRouteKey = (pathname) => {
    if (pathname === '/') return 'home';
    const map = {
        '/jugar': 'jugar',
        '/jugar/tutorial': 'tutorial',
        '/login': 'login',
        '/signup': 'signup',
        '/creditos': 'creditos',
        '/privacy': 'privacy',
        '/cookies': 'cookies',
        '/terms': 'terms',
        '/legal': 'legal',
    };
    if (map[pathname]) return map[pathname];
    if (pathname.startsWith('/partida/')) return 'partida';
    if (pathname.startsWith('/perfil')) return 'perfil';
    return 'home';
};

const upsertMeta = (selector, create) => {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = create();
        document.head.appendChild(el);
    }
    return el;
};

/**
 * Actualiza title, description, canonical, hreflang y OG/Twitter por ruta
 * en el idioma activo (namespace `seo`: src/locales/{es,en}/seo.json).
 * SPA sin SSR: Google ejecuta JS, así que esto + el HTML estático de index.html
 * cubre el SEO para "scoundrel", "scoundrel game", "scoundrel web game",
 * "scoundrel games", "scoundrel's quest" y "scoundrels quest".
 * Las variantes de idioma se señalan con ?lang= + hreflang (sin SSR no hay
 * URLs /es/ o /en/: es el límite conocido de este enfoque).
 */
const Seo = () => {
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation('seo');
    const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'es';

    useEffect(() => {
        const routeKey = getRouteKey(pathname);
        const title = t(`routes.${routeKey}.title`);
        const description = t(`routes.${routeKey}.description`);
        const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}${pathname.includes('?') ? '&' : '?'}lang=${lang}`;
        const urlNoQuery = `${SITE_URL}${pathname}`;

        document.title = title;
        document.documentElement.lang = lang;

        upsertMeta('meta[name="description"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('name', 'description');
            return m;
        }).setAttribute('content', description);

        upsertMeta('link[rel="canonical"]', () => {
            const l = document.createElement('link');
            l.setAttribute('rel', 'canonical');
            return l;
        }).setAttribute('href', canonicalUrl);

        // hreflang: una variante por idioma + x-default (es)
        SUPPORTED_LOCALES.forEach((lng) => {
            upsertMeta(`link[rel="alternate"][hreflang="${lng}"]`, () => {
                const l = document.createElement('link');
                l.setAttribute('rel', 'alternate');
                l.setAttribute('hreflang', lng);
                return l;
            }).setAttribute('href', `${urlNoQuery}?lang=${lng}`);
        });
        upsertMeta('link[rel="alternate"][hreflang="x-default"]', () => {
            const l = document.createElement('link');
            l.setAttribute('rel', 'alternate');
            l.setAttribute('hreflang', 'x-default');
            return l;
        }).setAttribute('href', `${urlNoQuery}?lang=es`);

        const ogTitle = upsertMeta('meta[property="og:title"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('property', 'og:title');
            return m;
        });
        ogTitle.setAttribute('content', title);

        const ogDesc = upsertMeta('meta[property="og:description"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('property', 'og:description');
            return m;
        });
        ogDesc.setAttribute('content', description);

        const ogUrl = upsertMeta('meta[property="og:url"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('property', 'og:url');
            return m;
        });
        ogUrl.setAttribute('content', canonicalUrl);

        // og:locale del idioma activo; :alternate para el resto
        upsertMeta('meta[property="og:locale"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('property', 'og:locale');
            return m;
        }).setAttribute('content', OG_LOCALES[lang]);

        document.head
            .querySelectorAll('meta[property="og:locale:alternate"]')
            .forEach((el) => el.remove());
        SUPPORTED_LOCALES.filter((lng) => lng !== lang).forEach((lng) => {
            const m = document.createElement('meta');
            m.setAttribute('property', 'og:locale:alternate');
            m.setAttribute('content', OG_LOCALES[lng]);
            document.head.appendChild(m);
        });

        const twTitle = upsertMeta('meta[name="twitter:title"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('name', 'twitter:title');
            return m;
        });
        twTitle.setAttribute('content', title);

        const twDesc = upsertMeta('meta[name="twitter:description"]', () => {
            const m = document.createElement('meta');
            m.setAttribute('name', 'twitter:description');
            return m;
        });
        twDesc.setAttribute('content', description);

        // FAQ schema solo en la home: refuerza "scoundrel / scoundrel game / scoundrel games"
        const FAQ_ID = 'seo-faq-jsonld';
        if (pathname === '/') {
            let faq = document.head.querySelector(`#${FAQ_ID}`);
            if (!faq) {
                faq = document.createElement('script');
                faq.id = FAQ_ID;
                faq.type = 'application/ld+json';
                document.head.appendChild(faq);
            }
            const qa = (n) => ({
                '@type': 'Question',
                name: t(`schema.q${n}`),
                acceptedAnswer: { '@type': 'Answer', text: t(`schema.a${n}`) },
            });
            faq.textContent = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                inLanguage: lang,
                mainEntity: [qa(1), qa(2), qa(3)],
            });
        } else {
            document.head.querySelector(`#${FAQ_ID}`)?.remove();
        }
    }, [pathname, lang, t]);

    return null;
};

export default Seo;
