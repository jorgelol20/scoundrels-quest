// Inicializa i18next y fija 'es' para que los tests de componentes que usan
// useTranslation reciban las cadenas en español (el fallback de la app es
// 'en', pero las aserciones de GameHud/GameOverMenu están en español).
import i18n from './i18n/index.js';

await i18n.changeLanguage('es');
