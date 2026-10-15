import { englishCopy, dynamicText } from './translations.js';

const EMAILJS_PUBLIC_KEY = 'GN3JGMK9pn0p0qFbB';
const EMAILJS_SERVICE_ID = 'service_t9lmvkj';
const EMAILJS_TEMPLATE_ID = 'template_gqd3spm';
const LANGUAGE_STORAGE_KEY = 'cv-language';

/* ---------- Traduction FR / EN ---------- */

// Le français est la langue du HTML : on mémorise les textes d'origine
// pour pouvoir y revenir après un passage en anglais.
const frenchText = new Map(
    [...document.querySelectorAll('[data-i18n]')].map((element) => [element, element.textContent])
);
const frenchAria = new Map(
    [...document.querySelectorAll('[data-i18n-aria]')].map((element) => [element, element.getAttribute('aria-label')])
);
const frenchContent = new Map(
    [...document.querySelectorAll('[data-i18n-content]')].map((element) => [element, element.getAttribute('content')])
);
const frenchTitle = document.title;

let currentLanguage = 'fr';

function t(key) {
    return dynamicText[currentLanguage][key];
}

function applyLanguage(language, persist = true) {
    currentLanguage = language === 'en' ? 'en' : 'fr';
    const isEnglish = currentLanguage === 'en';

    document.documentElement.lang = currentLanguage;
    document.title = isEnglish
        ? document.body.dataset.titleEn ?? englishCopy.pageTitle
        : frenchTitle;

    frenchText.forEach((text, element) => {
        element.textContent = isEnglish ? englishCopy[element.dataset.i18n] ?? text : text;
    });

    frenchAria.forEach((label, element) => {
        element.setAttribute('aria-label', isEnglish ? englishCopy[element.dataset.i18nAria] ?? label : label);
    });

    frenchContent.forEach((content, element) => {
        element.setAttribute('content', isEnglish ? englishCopy[element.dataset.i18nContent] ?? content : content);
    });

    document.querySelectorAll('[data-language]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage));
    });

    if (persist) {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
        } catch {}
    }
}

let savedLanguage = 'fr';
try {
    savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'fr';
} catch {}

applyLanguage(savedLanguage, false);

document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.language));
});

/* ---------- En-tête et menu mobile ---------- */

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');

function updateHeaderShadow() {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
}

updateHeaderShadow();
window.addEventListener('scroll', updateHeaderShadow, { passive: true });

function setMenuOpen(isOpen) {
    if (!menuToggle || !navPanel) {
        return;
    }

    navPanel.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', t(isOpen ? 'menuClose' : 'menuOpen'));
    menuToggle.querySelector('use')?.setAttribute('href', isOpen ? '/icons.svg#close' : '/icons.svg#menu');
}

menuToggle?.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navPanel?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuToggle.focus();
    }
});

/* ---------- Lien actif dans la navigation (page d'accueil) ---------- */

const sectionLinks = new Map(
    [...document.querySelectorAll('.nav-links a[href^="#"]')].map((link) => [link.getAttribute('href').slice(1), link])
);

if (sectionLinks.size > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                sectionLinks.forEach((link, id) => {
                    const isActive = id === entry.target.id;
                    link.classList.toggle('is-active', isActive);
                    if (isActive) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        },
        { rootMargin: '-45% 0px -50% 0px' }
    );

    sectionLinks.forEach((link, id) => {
        const section = document.getElementById(id);
        if (section) {
            observer.observe(section);
        }
    });
}

/* ---------- Formulaire de contact (EmailJS) ---------- */

const form = document.getElementById('contact-form');

if (form) {
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton.querySelector('[data-i18n="formSubmit"]');
    const fields = [...form.querySelectorAll('input, textarea')];

    function showStatus(message, type) {
        status.textContent = message;
        status.classList.toggle('is-success', type === 'success');
        status.classList.toggle('is-error', type === 'error');
    }

    fields.forEach((field) => {
        field.addEventListener('input', () => {
            if (field.checkValidity()) {
                field.removeAttribute('aria-invalid');
            }
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const invalidFields = fields.filter((field) => !field.value.trim() || !field.checkValidity());
        fields.forEach((field) => {
            if (invalidFields.includes(field)) {
                field.setAttribute('aria-invalid', 'true');
            } else {
                field.removeAttribute('aria-invalid');
            }
        });

        if (invalidFields.length > 0) {
            showStatus(t('formInvalid'), 'error');
            invalidFields[0].focus();
            return;
        }

        if (!window.emailjs) {
            showStatus(t('formError'), 'error');
            return;
        }

        submitButton.disabled = true;
        submitLabel.textContent = t('formSending');
        showStatus('', null);

        const templateParams = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value,
            time: new Date().toLocaleString(currentLanguage === 'en' ? 'en-GB' : 'fr-FR'),
            reply_to: form.email.value,
            from_name: form.name.value,
            sender_email: form.email.value,
            sender_name: form.name.value,
            contact_email: form.email.value,
            contact_name: form.name.value
        };

        window.emailjs
            .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY })
            .then(() => {
                showStatus(t('formSuccess'), 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('Erreur EmailJS :', error);
                showStatus(t('formError'), 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitLabel.textContent = currentLanguage === 'en'
                    ? englishCopy.formSubmit
                    : frenchText.get(submitLabel);
            });
    });
}
