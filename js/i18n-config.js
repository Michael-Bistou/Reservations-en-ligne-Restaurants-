i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'en',
        debug: true,
        backend: {
            loadPath: '/locales/{{lng}}.json'
        }
    }, function(err, t) {
        // Mettre à jour les éléments HTML avec les traductions
        jqueryI18next.init(i18next, $);
        updateContent();
    });

// Fonction pour mettre à jour le contenu
function updateContent() {
    $('[data-i18n]').localize(); // Utiliser `data-i18n` pour identifier les éléments à traduire
}

// Fonction pour changer la langue
function changeLanguage(lng) {
    i18next.changeLanguage(lng, () => {
        updateContent(); // Mettre à jour le contenu après le changement de langue
    });
}
