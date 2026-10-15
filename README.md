# Portfolio — Charles ABED

Portfolio présentant mon parcours de la pharmacie vers le numérique, avec pour objectif le pilotage de projets de santé numérique. Le site est conçu pour être consulté par des recruteurs sur ordinateur comme sur mobile.

## Fonctionnalités

- Page d’accueil défilante (parcours, objectif, compétences, expériences, formation, projets, contact) et une page de détail par projet.
- Mise en page responsive avec menu mobile.
- Affichage en français ou en anglais, avec mémorisation du choix dans le navigateur.
- Animations d’introduction et apparition progressive des sections (désactivées si l’utilisateur réduit les animations).
- Formulaire de contact envoyé avec EmailJS, avec validation et message de confirmation.
- Identité visuelle santé : caducée pharmaceutique, vert pharmacie et bleu numérique.

## Technologies

- HTML et CSS pour la structure et la présentation.
- JavaScript pour la traduction et le formulaire.
- React pour les animations pilotées depuis `src/main.jsx`.
- Motion pour les animations.
- Vite pour le serveur de développement et le build.
- EmailJS pour l’envoi du formulaire.

## Installation et lancement

Prérequis : Node.js et npm.

```bash
npm ci
npm run dev
```

Vite affiche l’adresse locale du site dans le terminal.

## Commandes

```bash
npm run dev      # Lance le serveur de développement
npm run build    # Génère la version de production dans dist/
npm run preview  # Prévisualise le contenu de dist/
```

## Organisation du projet

mon-cv/
├── index.html                  # Page d’accueil (texte français)
├── projets/
│   ├── hangman.html            # Page du projet Hangman
│   ├── cv-en-ligne.html        # Page du projet portfolio
│   └── alternatech.html        # Page du projet AlternaTech
├── css/style.css               # Styles (couleurs définies dans :root)
├── js/script.js                # Langue, menu mobile, formulaire EmailJS
├── js/translations.js          # Textes anglais (clé = attribut data-i18n)
├── src/main.jsx                # Animations React + Motion
├── public/
│   ├── caducee-pharmaceutique.svg  # Logo et favicon
│   └── icons.svg               # Icônes (Lucide)
├── package.json
└── vite.config.js              # Vite, plugin React et pages multiples

## Ajouter ou modifier un texte

Le français est écrit directement dans le HTML. Chaque texte traduisible porte un attribut `data-i18n="cle"` ; la version anglaise se trouve sous la même clé dans `js/translations.js`.

## Ajouter un projet

Dupliquer `projets/hangman.html`, adapter son contenu, ajouter la page dans `vite.config.js` (`build.rollupOptions.input`) et une carte dans la section `#projets` de `index.html`.

React est monté dans l’élément `#react-root` uniquement pour les animations ; il ne remplace pas la page.

## Formulaire de contact

Le formulaire utilise EmailJS. Les identifiants du service et du modèle se trouvent dans `js/script.js`. La clé publique est visible dans le navigateur par conception.

## Vérifications

La consigne du mini-projet ne demande pas de tests automatisés. Avant une présentation ou un déploiement, vérifier manuellement la navigation, les deux langues, le formulaire, l’affichage mobile et la version compilée avec `npm run build`.