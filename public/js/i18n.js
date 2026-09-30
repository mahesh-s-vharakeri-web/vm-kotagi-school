// i18n - Language switching system
let currentLang = localStorage.getItem('school_lang') || 'en';
let translations = {};

async function loadTranslations(lang) {
  try {
    const res = await fetch(`/locales/${lang}.json`);
    translations = await res.json();
    applyTranslations();
    updateLangButtons(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('school_lang', lang);
    currentLang = lang;
  } catch (e) {
    console.error('Failed to load translations for:', lang);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });
}

function switchLang(lang) {
  loadTranslations(lang);
}

function updateLangButtons(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const map = { en: 0, kn: 1, hi: 2 };
  const btns = document.querySelectorAll('.lang-btn');
  if (btns[map[lang]]) btns[map[lang]].classList.add('active');
}

function t(key) {
  return translations[key] || key;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLang);
});
