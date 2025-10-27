# My Good Addresses

Application mobile / web pour partager, sauvegarder et découvrir des adresses (restaurants, lieux, points d'intérêt). Projet basé sur Expo + React Native + Firebase et pensé pour être multi-plateforme (iOS / Android / Web).

## Table des matières

- [Présentation](#Présentation)
- [Fonctionnalités](#Fonctionnalités)
- [Stack technique](#stack-technique)
- [Organisation du dépôt](#organisation-du-dépôt)
- [Installation & configuration](#installation--configuration)
    - [Prérequis](#prérequis)
    - [Variables d'environnement](#variables-denvironnement)
- [Lancement en développement](#lancement-en-développement)
    - [Mobile (Expo)](#mobile-expo-go)
    - [Web](#web)
- [Tests](#tests)
    - [Tests unitaires / d'intégration (Jest)](#tests-unitaires--composants-jest)
    - [Tests E2E (Detox)](#tests-e2e-detox)
- [Storybook](#storybook)
- [Règles Firebase](#règles-firebase)
- [Architecture / Composants clés](#architecture--composants-clés)
    - [Auth (AuthContext)](#authcontext-contextsauthcontexttsx)
    - [Cartographie (AddressMap, MobileMap, WebMap)](#cartographie-componentsmap)
    - [Services Firebase (addressService, commentService, firebase)](#services-firebase-servicesfirebase)
    - [Composants UI](#composants-ui)
    - [Images & Optimisations](#images--optimisation)
- [Modèles de données (types)](#modèles-de-données-types)
- [Bonnes pratiques](#bonnes-pratiques)
- [Déploiement rapide (notes)](#déploiement)

## Présentation

My Good Addresses permet aux utilisateurs d'ajouter des adresses (avec photo et description), de choisir si elles sont publiques ou privées, de parcourir les adresses publiques partagées par la communauté, de commenter et d'ajouter des photos aux commentaires. L'application prend en charge la navigation par onglets, l'authentification (email/mot de passe), et une carte interactive (Leaflet via WebView).

## Fonctionnalités

- Authentification (inscription, connexion, déconnexion)
- Profil utilisateur (nom, photo)
- Création / édition / suppression d'adresses
- Upload/optimisation d'images (profil, adresse, commentaires)
- Adresses publiques / privées
- Filtrage / recherche d'adresses publiques
- Carte interactive (web & mobile) avec marqueurs personnalisés
- Commentaires avec images
- Règles de sécurité Firebase pour Firestore & Storage
- Tests unitaires et E2E (Jest, Detox)
- Storybook pour composants UI

## Stack technique

- Framework : React Native + Expo (expo-router)
- Backend-as-a-service : Firebase (Authentication, Firestore, Storage)
- Cartes : Leaflet (via WebView pour mobile et iframe pour web)
- Tests : Jest (jest-expo), @testing-library/react-native, Detox (E2E)
- Storybook : @storybook/react-native
- Outils : TypeScript, ESLint

## Organisation du dépôt

- app/ — pages / routes (expo-router)
    - (auth)/login.tsx, register.tsx
    - (tabs)/index.tsx, my-addresses.tsx, public-addresses.tsx, profile.tsx
    - address/[id].tsx, address/create.tsx
- components/
    - common/ — Button, Input, etc.
    - map/ — AddressMap, MobileMap, WebMap
    - haptic-tab.tsx
- contexts/ — AuthContext.tsx
- services/
    - firebase/ — firebase.ts, addressService.ts, commentService.ts
    - imageService.ts
- constants/ — index.ts, theme.ts
- firebase/ — firestore.rules, storage.rules
- utils/ — permissions.ts
- types/ — types/index.ts
- __tests__/ — tests unitaires
- e2e/ — tests Detox

## Installation & configuration

### Prérequis

- Node.js (recommandé LTS)
- Yarn ou npm
- Expo CLI : npm i -g expo-cli (ou utiliser npx expo)
- Un projet Firebase (Authentication, Firestore, Storage) configuré
- (Pour iOS/Android natif) Xcode / Android Studio pour exécuter sur simulateurs

### Variables d'environnement

Copiez `.env.example` en `.env` ou configurez les variables d'environnement utilisées dans `services/firebase/firebase.ts`. Les noms exposés (ex : EXPO_PUBLIC_API_KEY, EXPO_PUBLIC_AUTH_DOMAIN...) sont attendus par le code.

Exemple (.env) — variables attendues :
- EXPO_PUBLIC_API_KEY
- EXPO_PUBLIC_AUTH_DOMAIN
- EXPO_PUBLIC_PROJECT_ID
- EXPO_PUBLIC_STORAGE_BUCKET
- EXPO_PUBLIC_MESSAGING_SENDER_ID
- EXPO_PUBLIC_APP_ID
- EXPO_PUBLIC_MEASUREMENT_ID

> Le fichier `.env.example` fournit un modèle. Ne committez pas vos clés privées.

## Lancement en développement

1. Installer les dépendances
    - npm install
    - ou yarn

2. Démarrer Expo
    - npm run start
    - ou yarn start

### Mobile (Expo Go)
- Lancez `expo start` puis scannez le QR code avec Expo Go.

### iOS / Android (simulation ou build local)
- iOS : npm run ios (nécessite Xcode)
- Android : npm run android (nécessite Android Studio + émulateur)

### Web
- npm run web
- L'application s'exécute dans le navigateur (WebMap utilise iframe/Leaflet).

## Tests

### Tests unitaires / composants (Jest)

- Lancer tous les tests :
    - npm run test
- Lancer en mode watch :
    - npm run test:watch

Les tests utilisent `jest-expo` comme preset et `@testing-library/react-native`.

### Tests E2E (Detox)

- Configuration Detox : voir `package.json` (script `test:e2e`).
- Exemple :
    - npm run test:e2e

Detox nécessite des configurations supplémentaires (simulators, builds natives). Vérifier la documentation Detox et les configurations CI pour l'exécution.

## Storybook

- Lancer Storybook :
    - npm run storybook

Permet d'inspecter les composants UI (`components/common`).

## Règles Firebase

Les règles Firestore et Storage essentielles sont fournies dans :
- `firebase/firestore.rules`
- `firebase/storage.rules`

Résumé des règles importantes :
- Seuls les utilisateurs authentifiés peuvent créer des adresses / commentaires.
- Les mises à jour / suppressions d'adresses et commentaires sont réservées au propriétaire (userId doit correspondre à request.auth.uid).
- Validation côté règle pour les champs essentiels (nom, location pour les adresses ; text pour les commentaires).
- Storage : vérification du contentType image/* et taille max (5 MB) pour les uploads.

Vérifiez et adaptez les règles à vos besoins de production (ex : vérification de métadonnées pour les images d'adresse si nécessaire).

## Architecture & composants clés

### AuthContext (contexts/AuthContext.tsx)
- Fournit le contexte d'authentification pour l'application :
    - user, loading
    - signIn, signUp, signOut
    - updateUserProfile, changePassword
- Écoute onAuthStateChanged pour synchroniser l'état local avec Firebase Auth.
- Stocke des données utilisateur basiques dans la collection `users` de Firestore.

### Services Firebase (services/firebase)
- `firebase.ts` : initialise Firebase (auth, firestore).
- `addressService.ts` :
    - createAddress, updateAddress, deleteAddress
    - getAddress, getUserAddresses, getPublicAddresses
    - subscribeToUserAddresses, subscribeToPublicAddresses (onSnapshot)
- `commentService.ts` :
    - createComment, deleteComment, getAddressComments, subscribeToAddressComments
      Ces modules sont le point d'entrée pour toutes les opérations Firestore.

### Cartographie (components/map)
- `AddressMap.tsx` : wrapper qui sélectionne `MobileMap` ou `WebMap` selon `Platform.OS`.
- `MobileMap.tsx` : WebView qui charge une page HTML Leaflet et communique via postMessage pour :
    - mettre à jour marqueurs
    - recevoir événements (click marker, click map)
- `WebMap.tsx` : iframe qui contient un document HTML Leaflet et communique via postMessage / window.postMessage.
- Les marqueurs héritent d'une couleur selon provenance (publique/privée/propre).

### Composants UI
- `components/common/Button.tsx`, `Input.tsx` : composants réutilisables stylés.
- `components/haptic-tab.tsx` : bouton d'onglet personnalisé avec retour haptique sur iOS.

### Images & optimisation
- `services/imageService.ts` :
    - conversion en base64, compression (expo-image-manipulator)
    - fonctions utilitaires : taille base64, validation, extension MIME
- `utils/permissions.ts` : demandes de permissions (localisation, caméra, galerie).

## Modèles de données (types)

Fichier : `types/index.ts`

Principaux type:
- User
    - id, email, displayName?, photoURL?, createdAt: Date

- Address
    - id, userId, name, description, photoURL?, location (latitude, longitude), isPublic (bool), createdAt, updatedAt

- Comment
    - id, addressId, userId, userDisplayName?, userPhotoURL?, text, photos[], createdAt

## Bonnes pratiques

- Ne pas stocker d'images brutes non optimisées : utiliser `imageService.compressImageToSize`.
- Vérifier les permissions avant d'utiliser la localisation / caméra / galerie (utils/permissions).
- Pour la carte mobile, la communication entre WebView et RN peut être sensible : logger les messages postés pour debug.
- Si l'authentification ne synchronise pas l'utilisateur, vérifier les variables Firebase dans `.env` et les règles Firestore.
- Pour debugging Firebase : activer la console et vérifier les requêtes échouées (erreurs de règles, permissions).

## Déploiement

- Web : `expo build:web` ou `expo export:web` puis héberger le dossier `web-build` sur un hébergeur (Netlify, Vercel...).
- Mobile : pour distribution sur stores, générer builds natifs via EAS (Expo Application Services) ou `expo prebuild` + builds natifs.
- Mettre à jour les règles Firebase en production (sécurité) et restreindre les domaines autorisés dans la console Firebase si besoin.