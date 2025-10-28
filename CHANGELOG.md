
# 📝 Changelog - UneBox

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Non publié]

### À venir

- Support DOCX et XLSX
- OCR multilingue (EN, ES, DE)
- Recherche full-text avancée
- Export de documents (ZIP, PDF)
- Partage de documents
- Mode hors-ligne

---

## [1.0.1] - 2025-01-XX

### 🎉 Première Version Publique

#### ✨ Ajouté

**Fonctionnalités Principales**

- Téléversement de documents (PDF, JPEG, PNG)
- Analyse IA avec OCR (GPT-4o Vision)
- Classification automatique des documents
- Extraction de données structurées
- Génération de résumés IA
- Création automatique de rappels
- Notifications push intelligentes
- Synchronisation temps réel
- Tableau de bord avec statistiques
- Recherche et filtres avancés

**Interface Utilisateur**

- Design moderne et épuré
- Mode clair/sombre automatique
- Animations fluides
- Navigation intuitive
- Feedback visuel complet

**Sécurité**

- Authentification JWT
- Row Level Security (RLS)
- Chiffrement de bout en bout
- URLs signées pour le stockage
- Isolation complète entre utilisateurs

**Backend**

- Edge Functions Supabase
  - `process-document` : Analyse IA
  - `reminder-scheduler` : Notifications automatiques
- Base de données PostgreSQL
- Stockage sécurisé Supabase Storage
- Système de cron job (pg_cron)

**Écrans**

- Authentification (login, register, reset password)
- Accueil / Dashboard
- Téléversement
- Documents
- Rappels
- Assistant IA
- Profil
- Paramètres
- Historique des notifications

#### 🔧 Technique

- React Native 0.81.4
- Expo SDK 54
- Supabase (Backend as a Service)
- OpenAI GPT-4o Vision API
- TypeScript
- Expo Router (file-based routing)

#### 📱 Plateformes

- iOS 13.0+
- Android 6.0+
- Web (Progressive Web App)

---

## [1.0.0] - 2024-12-26

### 🚧 Version Beta Interne

#### ✨ Ajouté

- Architecture de base
- Authentification Supabase
- Upload de fichiers
- Traitement IA basique
- Interface utilisateur initiale

#### 🐛 Corrigé

- Problèmes de synchronisation
- Bugs d'upload
- Erreurs de traitement IA

#### 🔒 Sécurité

- Implémentation RLS
- Sécurisation du stockage
- Validation des entrées

---

## [0.9.0] - 2024-12-20

### 🧪 Version Alpha

#### ✨ Ajouté

- Proof of concept
- Tests initiaux
- Validation du concept

---

## Types de Changements

- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔧 Modifié` : Changements dans les fonctionnalités existantes
- `🗑️ Déprécié` : Fonctionnalités bientôt supprimées
- `🔥 Supprimé` : Fonctionnalités supprimées
- `🐛 Corrigé` : Corrections de bugs
- `🔒 Sécurité` : Corrections de vulnérabilités
- `⚡ Performance` : Améliorations de performance
- `📝 Documentation` : Changements dans la documentation

---

## Liens

- [Code source](https://github.com/yourusername/unebox)
- [Issues](https://github.com/yourusername/unebox/issues)
- [Pull Requests](https://github.com/yourusername/unebox/pulls)
- [Releases](https://github.com/yourusername/unebox/releases)

---

**Légende des versions :**

- **[Non publié]** : Changements en cours de développement
- **[X.Y.Z]** : Version publiée (MAJOR.MINOR.PATCH)
  - **MAJOR** : Changements incompatibles avec les versions précédentes
  - **MINOR** : Nouvelles fonctionnalités rétrocompatibles
  - **PATCH** : Corrections de bugs rétrocompatibles
