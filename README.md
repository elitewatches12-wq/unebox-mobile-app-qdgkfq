
# 📦 UneBox - Assistant Cloud IA pour Documents

<div align="center">

![UneBox Logo](./assets/images/4d3de452-cf93-4bd4-a7f2-9db8a94ef8b9.png)

**Votre assistant intelligent pour gérer, organiser et comprendre vos documents**

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/yourusername/unebox)
[![Expo SDK](https://img.shields.io/badge/Expo-54.0.1-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contribution](#-contribution)

</div>

---

## 🎯 À propos

**UneBox** est une application mobile moderne qui utilise l'intelligence artificielle pour transformer la gestion de vos documents. Téléversez vos factures, contrats, relevés ou tout autre document, et laissez l'IA les analyser, les classer et créer des rappels automatiques.

### ✨ Pourquoi UneBox ?

- 🤖 **IA Avancée** : OCR et analyse intelligente avec GPT-4o Vision
- 🔒 **Sécurité Maximale** : Chiffrement, RLS, authentification JWT
- ⚡ **Temps Réel** : Synchronisation instantanée sur tous vos appareils
- 🔔 **Rappels Intelligents** : Ne manquez plus jamais une échéance
- 🎨 **Interface Moderne** : Design épuré, animations fluides
- 🌍 **Multiplateforme** : iOS, Android, Web

---

## 🚀 Fonctionnalités

### 📤 Téléversement Intelligent

- **Multi-sources** : Fichiers, galerie photo, appareil photo
- **Formats supportés** : PDF, JPEG, PNG
- **Traitement automatique** : OCR et analyse IA en 3-10 secondes
- **Progression en temps réel** : Suivez chaque étape du traitement

### 🤖 Analyse IA Complète

- **OCR Avancé** : Extraction de texte avec GPT-4o Vision
- **Classification Automatique** : Facture, contrat, relevé, document administratif
- **Extraction de Données** :
  - Titre et émetteur
  - Dates (document et échéance)
  - Montants et devises
  - Catégories intelligentes
- **Résumés IA** : Compréhension instantanée du contenu
- **Chemin de Classement** : Organisation automatique

### 🔔 Rappels Automatiques

- **Détection Intelligente** : Création automatique depuis les dates d'échéance
- **Notifications Push** : Alertes contextuelles (urgent, dans Xh, etc.)
- **Gestion Flexible** : Marquer comme terminé, reporter, supprimer
- **Historique Complet** : Toutes vos notifications archivées

### 📊 Tableau de Bord

- **Statistiques en Temps Réel** : Documents, rappels, stockage
- **Documents Récents** : Accès rapide aux derniers fichiers
- **Rappels à Venir** : Vue d'ensemble des échéances
- **Utilisation du Stockage** : Graphique visuel de votre espace

### 🔍 Recherche & Filtres

- **Recherche Instantanée** : Trouvez n'importe quel document
- **Filtres Avancés** : Par type, catégorie, date, statut
- **Tri Personnalisé** : Date, nom, taille, pertinence

### ⚙️ Personnalisation

- **Thème** : Mode clair/sombre automatique
- **Notifications** : Contrôle granulaire par type
- **Langue** : Français (autres langues à venir)
- **Couleur d'Accent** : Personnalisez votre expérience

---

## 📱 Captures d'écran

<div align="center">

| Accueil | Documents | Rappels | Profil |
|---------|-----------|---------|--------|
| ![Home](docs/screenshots/home.png) | ![Documents](docs/screenshots/documents.png) | ![Reminders](docs/screenshots/reminders.png) | ![Profile](docs/screenshots/profile.png) |

</div>

---

## 🛠 Installation

### Prérequis

- Node.js 18+ et npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Compte Supabase (gratuit)
- Clé API OpenAI (pour l'IA)

### 1. Cloner le dépôt

```bash
git clone https://github.com/yourusername/unebox.git
cd unebox
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration Supabase

#### a. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

#### b. Appliquer les migrations

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Appliquer les migrations (déjà dans le projet)
supabase db push
```

#### c. Configurer les Edge Functions

```bash
# Déployer process-document
supabase functions deploy process-document

# Déployer reminder-scheduler
supabase functions deploy reminder-scheduler

# Configurer les secrets
supabase secrets set OPENAI_API_KEY=sk-votre-cle
supabase secrets set SUPABASE_URL=https://votre-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

#### d. Configurer le Cron Job

Le système de rappels utilise `pg_cron` (déjà configuré dans les migrations).

Vérifier que le job est actif :

```sql
SELECT * FROM cron.job WHERE jobname = 'reminder-scheduler-hourly';
```

### 4. Configuration de l'application

Créer un fichier `.env.local` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

### 5. Lancer l'application

```bash
# Développement
npm run dev

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 🏗 Architecture

### Stack Technique

- **Frontend** : React Native 0.81.4 + Expo 54
- **Navigation** : Expo Router (file-based routing)
- **Backend** : Supabase (PostgreSQL + Edge Functions)
- **IA** : OpenAI GPT-4o Vision API
- **Stockage** : Supabase Storage (privé, sécurisé)
- **Temps Réel** : Supabase Realtime
- **Notifications** : Expo Notifications
- **Authentification** : Supabase Auth (JWT)

### Structure du Projet

```
unebox/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Écrans d'authentification
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/                   # Navigation par onglets
│   │   ├── (home)/
│   │   │   └── index.tsx         # Tableau de bord
│   │   ├── upload.tsx            # Téléversement
│   │   ├── documents.tsx         # Liste des documents
│   │   ├── reminders.tsx         # Rappels
│   │   ├── ai-assistant.tsx      # Assistant IA
│   │   ├── profile.tsx           # Profil utilisateur
│   │   └── settings.tsx          # Paramètres
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts         # Client Supabase
│   │       └── types.ts          # Types TypeScript
│   └── _layout.tsx               # Layout racine
├── components/                   # Composants réutilisables
│   ├── FloatingTabBar.tsx
│   ├── IconSymbol.tsx
│   └── button.tsx
├── contexts/                     # Contextes React
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
├── hooks/                        # Hooks personnalisés
│   └── useDocumentProcessor.ts   # Traitement de documents
├── supabase/
│   ├── functions/                # Edge Functions
│   │   ├── process-document/     # Analyse IA
│   │   └── reminder-scheduler/   # Notifications automatiques
│   └── migrations/               # Migrations SQL
├── assets/                       # Images, fonts, etc.
├── constants/                    # Constantes (couleurs, etc.)
├── styles/                       # Styles globaux
└── utils/                        # Utilitaires
```

### Base de Données

#### Tables Principales

- **profiles** : Profils utilisateurs
- **documents** : Métadonnées et résultats d'analyse
- **reminders** : Rappels et échéances
- **user_preferences** : Préférences et notifications
- **document_processing_logs** : Historique de traitement
- **notification_logs** : Historique des notifications

#### Sécurité

- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ **Politiques strictes** : Isolation complète entre utilisateurs
- ✅ **Authentification JWT** : Vérification sur chaque requête
- ✅ **URLs signées** : Accès temporaire et sécurisé au stockage

### Flux de Traitement

```
1. Upload → Supabase Storage (privé)
2. Création document (status: pending)
3. Appel Edge Function process-document
4. Téléchargement fichier (URL signée)
5. Analyse IA (GPT-4o Vision)
   - OCR complet
   - Extraction données structurées
   - Génération résumé
   - Classification automatique
6. Mise à jour document (status: completed/failed)
7. Création rappel (si date limite détectée)
8. Notification utilisateur
9. Logging complet
10. Synchronisation temps réel UI
```

---

## 📚 Documentation

### Guides Complets

- [📋 Rapport de Vérification](VERIFICATION_REPORT.md) - État complet de l'application
- [🎯 Points Clés](POINTS_CLES.md) - Résumé des fonctionnalités
- [⏰ Configuration Cron](CRON_CONFIGURATION.md) - Système de rappels automatiques
- [🧪 Guide de Test](GUIDE_TEST.md) - Tests et validation

### API Documentation

#### Edge Functions

**process-document**

Analyse un document avec l'IA.

```typescript
POST /functions/v1/process-document
Authorization: Bearer <JWT>

{
  "documentId": "uuid",
  "fileUrl": "signed-url",
  "fileType": "application/pdf"
}

Response:
{
  "success": true,
  "analysis": {
    "titre": "Facture EDF octobre 2025",
    "categorie": "Énergie",
    "type_document": "Facture",
    "emetteur": "EDF",
    "date_document": "2025-10-01",
    "date_limite": "2025-11-10",
    "montant": 85.23,
    "devise": "EUR",
    "resume": "Facture EDF pour...",
    "rappel": {...},
    "chemin_classement": "/Documents/Factures/Énergie/EDF/2025-10.pdf",
    "extracted_text": "Texte complet OCR..."
  },
  "processingTime": 3456
}
```

**reminder-scheduler**

Envoie les notifications de rappels (appelé automatiquement par cron).

```typescript
POST /functions/v1/reminder-scheduler
Authorization: Bearer <ANON_KEY>

Response:
{
  "success": true,
  "remindersProcessed": 5,
  "notificationsSent": 5,
  "errors": []
}
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Linter
npm run lint
```

### Tests Manuels

Voir [GUIDE_TEST.md](GUIDE_TEST.md) pour les scénarios de test complets.

---

## 🚀 Déploiement

### Build de Production

#### iOS

```bash
# Build avec EAS
eas build --platform ios --profile production

# Soumettre à l'App Store
eas submit --platform ios
```

#### Android

```bash
# Build avec EAS
eas build --platform android --profile production

# Soumettre au Play Store
eas submit --platform android
```

### Variables d'Environnement

**Application (`.env.local`):**

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

**Edge Functions (Supabase Secrets):**

```bash
SUPABASE_URL=https://votre-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
OPENAI_API_KEY=sk-votre-cle
```

---

## 📊 Performance

### Métriques

- **Temps de traitement** : 3-10 secondes par document
- **Réactivité UI** : < 1 seconde pour toutes les opérations
- **Synchronisation** : < 500ms (temps réel)
- **Animations** : 60 FPS constant

### Scalabilité

- ✅ Edge Functions serverless (auto-scaling)
- ✅ Database indexée (requêtes optimisées)
- ✅ Storage illimité (Supabase)
- ✅ Realtime optimisé (channels dédiés)

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ **Authentification JWT** : Toutes les requêtes vérifiées
- ✅ **Row Level Security** : Isolation complète entre utilisateurs
- ✅ **URLs Signées** : Accès temporaire au stockage (1h)
- ✅ **Bucket Privé** : Pas d'accès public aux fichiers
- ✅ **Validation des Entrées** : Sanitization côté serveur
- ✅ **Rate Limiting** : Protection contre les abus
- ✅ **HTTPS Obligatoire** : Chiffrement de bout en bout

### Conformité

- 🇪🇺 **RGPD** : Données hébergées en Europe
- 🔐 **Chiffrement** : AES-256 au repos, TLS 1.3 en transit
- 🗑️ **Droit à l'oubli** : Suppression complète des données

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

### 1. Fork le projet

```bash
git clone https://github.com/yourusername/unebox.git
cd unebox
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Faire vos modifications

- Suivre les conventions de code (ESLint)
- Ajouter des tests si nécessaire
- Documenter les nouvelles fonctionnalités

### 3. Soumettre une Pull Request

```bash
git add .
git commit -m "feat: ajout de ma nouvelle fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite
```

### Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

---

## 📝 Roadmap

### Version 1.1 (Q1 2025)

- [ ] Support DOCX, XLSX
- [ ] OCR multilingue (EN, ES, DE)
- [ ] Recherche full-text avancée
- [ ] Export de documents (ZIP, PDF)
- [ ] Partage de documents

### Version 1.2 (Q2 2025)

- [ ] Mode hors-ligne
- [ ] Compression d'images
- [ ] Reconnaissance de signatures
- [ ] Intégration calendrier
- [ ] Widget iOS/Android

### Version 2.0 (Q3 2025)

- [ ] Assistant IA conversationnel
- [ ] Analyse de tendances
- [ ] Rapports automatiques
- [ ] API publique
- [ ] Version desktop (Electron)

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

Développé avec ❤️ par l'équipe UneBox.

- **Lead Developer** : [Votre Nom](https://github.com/yourusername)
- **UI/UX Designer** : [Designer](https://github.com/designer)
- **Backend Engineer** : [Backend Dev](https://github.com/backend)

---

## 🙏 Remerciements

- [Expo](https://expo.dev) - Framework React Native
- [Supabase](https://supabase.com) - Backend as a Service
- [OpenAI](https://openai.com) - API GPT-4o Vision
- [React Native](https://reactnative.dev) - Framework mobile
- Tous nos contributeurs et utilisateurs !

---

## 📞 Support

### Besoin d'aide ?

- 📧 **Email** : support@unebox.app
- 💬 **Discord** : [Rejoindre la communauté](https://discord.gg/unebox)
- 🐛 **Issues** : [GitHub Issues](https://github.com/yourusername/unebox/issues)
- 📖 **Documentation** : [docs.unebox.app](https://docs.unebox.app)

### Liens Utiles

- [Site Web](https://unebox.app)
- [Blog](https://blog.unebox.app)
- [Twitter](https://twitter.com/unebox)
- [LinkedIn](https://linkedin.com/company/unebox)

---

<div align="center">

**⭐ Si vous aimez UneBox, n'oubliez pas de mettre une étoile sur GitHub ! ⭐**

Made with ❤️ in France 🇫🇷

</div>
