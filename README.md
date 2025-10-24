# 📍 Mes Bonnes Adresses

Une application mobile React Native avec Expo permettant aux utilisateurs de sauvegarder, gérer et partager leurs adresses favorites.

## 🎯 Fonctionnalités

### Gestion d'utilisateurs (✅ 25 pts)
- ✅ Projet Firebase Sécurisé avec règles de sécurité Firestore et Storage
- ✅ Inscription avec email et mot de passe
- ✅ Connexion/Déconnexion sécurisée
- ✅ Gestion de photo de profil avec upload vers Firebase Storage

### Carte et Localisation (✅ 15 pts)
- ✅ Affichage d'une carte MapView (Google Maps sur Android, Apple Maps sur iOS)
- ✅ Centrage automatique sur la position de l'utilisateur
- ✅ Marqueurs colorés selon le type d'adresse :
  - 🔴 Rouge : Mes adresses
  - 🟢 Vert : Adresses publiques
  - 🔵 Bleu : Adresses privées

### Gestion des Adresses (✅ 30 pts)
- ✅ Création d'adresses avec :
  - Option Privé/Publique
  - Nom, Description et Photo
  - Sélection de la position sur la carte
- ✅ Suppression d'adresses
- ✅ Visualisation :
  - Mes adresses (publiques et privées)
  - Adresses publiques des autres utilisateurs

### Commentaires et Avis (✅ 10 pts)
- ✅ Système de commentaires sur les adresses
- ✅ Upload de photos multiples par commentaire (max 3)
- ✅ Affichage en temps réel des commentaires
- ✅ Suppression de ses propres commentaires

### Tests et Qualité (✅ 25 pts)
- ✅ Tests unitaires pour l'authentification et les services
- ✅ Tests E2E avec Detox
- ✅ Storybook pour les composants UI

## 🚀 Installation

### Prérequis
- Node.js LTS (20.18.0)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Pour iOS : Xcode et simulateur iOS
- Pour Android : Android Studio et émulateur Android

### Installation des dépendances

```bash
# Cloner le repository
git clone https://github.com/your-username/my-good-addresses.git
cd my-good-addresses

# Installer les dépendances
npm install

# Pour iOS, installer les pods
cd ios && pod install && cd ..
```

### Configuration Firebase

1. Créer un projet Firebase sur [Firebase Console](https://console.firebase.google.com)

2. Activer les services suivants :
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

3. Copier la configuration Firebase et remplacer dans `services/firebase/firebase.ts`

4. Appliquer les règles de sécurité :
   - Firestore : Copier le contenu de `firebase/firestore.rules`
   - Storage : Copier le contenu de `firebase/storage.rules`

### Configuration des clés API

Pour la carte Google Maps sur Android :
1. Obtenir une clé API Google Maps
2. Ajouter dans `android/app/src/main/AndroidManifest.xml` :
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

## 🏃‍♂️ Lancement de l'application

```bash
# Démarrer Metro Bundler
npx expo start

# Pour iOS
npx expo run:ios

# Pour Android
npx expo run:android

# Pour le web
npx expo start --web
```

## 🧪 Tests

### Tests unitaires
```bash
# Lancer tous les tests
npm test

# Mode watch
npm run test:watch

# Avec coverage
npm run test:coverage
```

### Tests E2E
```bash
# Build pour les tests iOS
detox build --configuration ios

# Lancer les tests iOS
detox test --configuration ios

# Build pour les tests Android
detox build --configuration android

# Lancer les tests Android
detox test --configuration android
```

### Storybook
```bash
# Lancer Storybook
npm run storybook

# Ouvrir dans le navigateur
# http://localhost:6006
```

## 📱 Structure du projet

```
my-good-addresses/
├── app/                        # Routes et écrans (Expo Router)
│   ├── (auth)/                # Écrans d'authentification
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                # Navigation par tabs
│   │   ├── index.tsx          # Carte principale
│   │   ├── my-addresses.tsx   # Mes adresses
│   │   ├── public-addresses.tsx # Découverte
│   │   └── profile.tsx        # Profil utilisateur
│   └── address/               # Gestion des adresses
│       ├── [id].tsx           # Détail d'une adresse
│       └── create.tsx         # Création d'adresse
├── components/                 # Composants réutilisables
│   ├── common/                # Composants génériques
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── map/                   # Composants carte
│       └── AddressMap.tsx
├── services/                  # Services et API
│   └── firebase/
│       ├── firebase.ts        # Configuration Firebase
│       ├── addressService.ts  # Service des adresses
│       └── commentService.ts  # Service des commentaires
├── contexts/                  # Contextes React
│   └── AuthContext.tsx        # Contexte d'authentification
├── constants/                 # Constantes de l'app
│   └── index.ts              # Couleurs, tailles, messages
├── types/                     # Types TypeScript
│   └── index.ts
├── utils/                     # Fonctions utilitaires
│   └── permissions.ts         # Gestion des permissions
├── __tests__/                 # Tests unitaires
├── e2e/                       # Tests E2E
└── firebase/                  # Règles de sécurité Firebase
```

## 🔒 Sécurité

### Règles Firestore
- Les utilisateurs peuvent uniquement lire/modifier leurs propres données
- Les adresses publiques sont visibles par tous les utilisateurs authentifiés
- Les adresses privées ne sont visibles que par leur propriétaire
- Les commentaires peuvent être supprimés uniquement par leur auteur

### Règles Storage
- Les photos de profil peuvent être modifiées uniquement par le propriétaire
- Les photos d'adresses et de commentaires nécessitent une authentification
- Taille maximale des images : 5MB
- Types acceptés : image/*

## 🎨 Personnalisation

### Couleurs et thème
Modifier les constantes dans `constants/index.ts` :

```typescript
export const COLORS = {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    // ...
};
```

### Tailles et espacements
```typescript
export const SIZES = {
    fontXl: 24,
    fontLg: 18,
    radiusMd: 8,
    // ...
};
```

## 📝 Barème d'évaluation

| Fonctionnalité | Points | Status |
|----------------|--------|--------|
| **Gestion d'utilisateurs** | **25** | ✅ |
| - Firebase Sécurisé | 5 | ✅ |
| - Inscription | 5 | ✅ |
| - Connexion | 5 | ✅ |
| - Déconnexion | 5 | ✅ |
| - Photo de profil | 5 | ✅ |
| **MapView** | **15** | ✅ |
| - Affichage carte | 10 | ✅ |
| - Centrage auto | 5 | ✅ |
| **Création d'adresse** | **25** | ✅ |
| - Option Privé/Public | 10 | ✅ |
| - Nom/Photo/Description | 15 | ✅ |
| **Suppression** | **5** | ✅ |
| **Visualisation** | **20** | ✅ |
| - Mes adresses | 10 | ✅ |
| - Adresses publiques | 10 | ✅ |
| **Commentaires** | **10** | ✅ |
| **Tests** | **25** | ✅ |
| - Tests unitaires | 10 | ✅ |
| - Tests E2E | 10 | ✅ |
| - Storybook | 5 | ✅ |
| **TOTAL** | **125** | **✅** |

## 🐛 Résolution des problèmes

### Erreur "Component auth has not been registered yet" sur web
- Solution implémentée : Utiliser `getAuth()` au lieu de `initializeAuth()` sur web
- Fichier corrigé : `services/firebase/firebase.ts`

### Double authentification lors de la déconnexion
- Solution implémentée : Gestion améliorée de l'état avec `isInitialized`
- Fichier corrigé : `contexts/AuthContext.tsx`

### Permissions refusées sur iOS/Android
- Vérifier les permissions dans `app.json`
- Pour iOS : Vérifier Info.plist
- Pour Android : Vérifier AndroidManifest.xml

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- Groupe de 2-3 étudiants
- Développé avec React Native, Expo et Firebase
- Tests avec Jest, Detox et Storybook

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---
Développé avec ❤️ pour le projet "Mes Bonnes Adresses"
