
# 📱 Guide de Publication - UneBox

Ce guide vous accompagne étape par étape pour publier UneBox sur l'App Store (iOS) et le Play Store (Android).

---

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Préparation](#préparation)
- [Configuration EAS](#configuration-eas)
- [Build iOS](#build-ios)
- [Build Android](#build-android)
- [Soumission App Store](#soumission-app-store)
- [Soumission Play Store](#soumission-play-store)
- [Après Publication](#après-publication)

---

## ✅ Prérequis

### Comptes Requis

- [ ] **Compte Apple Developer** ($99/an)
  - Inscription : https://developer.apple.com
  - Nécessaire pour publier sur l'App Store
  
- [ ] **Compte Google Play Console** ($25 unique)
  - Inscription : https://play.google.com/console
  - Nécessaire pour publier sur le Play Store
  
- [ ] **Compte Expo** (gratuit)
  - Inscription : https://expo.dev
  - Nécessaire pour EAS Build

### Outils Requis

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Vérifier la connexion
eas whoami
```

---

## 🎨 Préparation

### 1. Assets Requis

#### Icône de l'Application

- **Taille** : 1024x1024 px
- **Format** : PNG (sans transparence pour iOS)
- **Emplacement** : `./assets/images/icon.png`

#### Splash Screen

- **Taille** : 1242x2436 px (recommandé)
- **Format** : PNG
- **Emplacement** : `./assets/images/splash.png`

#### Screenshots

**iOS (App Store Connect) :**

- iPhone 6.7" (iPhone 15 Pro Max) : 1290 x 2796 px
- iPhone 6.5" (iPhone 11 Pro Max) : 1242 x 2688 px
- iPhone 5.5" (iPhone 8 Plus) : 1242 x 2208 px
- iPad Pro 12.9" : 2048 x 2732 px

**Android (Play Console) :**

- Phone : 1080 x 1920 px minimum
- 7" Tablet : 1200 x 1920 px
- 10" Tablet : 1600 x 2560 px

**Nombre requis :** 3-8 screenshots par taille d'écran

### 2. Textes Marketing

#### Description Courte (80 caractères max)

```
Gérez vos documents intelligemment avec l'IA
```

#### Description Longue

```markdown
🤖 UneBox - Votre Assistant Cloud IA pour Documents

Transformez la gestion de vos documents avec l'intelligence artificielle !

✨ FONCTIONNALITÉS PRINCIPALES

📤 Téléversement Intelligent
• Scannez vos documents avec l'appareil photo
• Importez depuis votre galerie ou vos fichiers
• Support PDF, JPEG, PNG

🤖 Analyse IA Avancée
• OCR automatique avec GPT-4o Vision
• Classification intelligente (facture, contrat, relevé...)
• Extraction automatique des données importantes
• Résumés IA pour comprendre instantanément

🔔 Rappels Automatiques
• Détection des dates d'échéance
• Notifications push intelligentes
• Ne manquez plus jamais un paiement

📊 Tableau de Bord Complet
• Vue d'ensemble de tous vos documents
• Statistiques en temps réel
• Gestion du stockage

🔍 Recherche Puissante
• Trouvez n'importe quel document instantanément
• Filtres avancés par type, catégorie, date
• Recherche dans le contenu OCR

🔒 Sécurité Maximale
• Chiffrement de bout en bout
• Authentification sécurisée
• Données hébergées en Europe (RGPD)

🎨 Interface Moderne
• Design épuré et intuitif
• Mode clair/sombre automatique
• Animations fluides

🌍 Multiplateforme
• iOS, Android, Web
• Synchronisation temps réel
• Accédez à vos documents partout

💡 POURQUOI UNEBOX ?

• Gagnez du temps avec l'automatisation IA
• Ne perdez plus jamais un document important
• Organisez-vous sans effort
• Respectez toutes vos échéances

📱 PARFAIT POUR

• Particuliers : factures, contrats, documents administratifs
• Professionnels : gestion documentaire simplifiée
• Étudiants : organisation des cours et documents

🚀 COMMENCEZ GRATUITEMENT

Téléchargez UneBox maintenant et découvrez la puissance de l'IA pour gérer vos documents !

---

🔐 Confidentialité et Sécurité
Vos données sont chiffrées et stockées de manière sécurisée. Nous respectons votre vie privée et sommes conformes au RGPD.

📧 Support
Des questions ? Contactez-nous à support@unebox.app

🌐 En savoir plus
https://unebox.app
```

#### Mots-clés (App Store)

```
documents, scanner, OCR, IA, intelligence artificielle, factures, contrats, organisation, gestion documentaire, rappels, notifications, cloud, stockage, PDF, scan
```

#### Catégories

- **Principale** : Productivité
- **Secondaire** : Utilitaires

### 3. Informations Légales

#### Politique de Confidentialité

Créer une page sur votre site web : `https://unebox.app/privacy`

**Points à inclure :**
- Données collectées
- Utilisation des données
- Stockage et sécurité
- Droits des utilisateurs (RGPD)
- Contact

#### Conditions d'Utilisation

Créer une page : `https://unebox.app/terms`

**Points à inclure :**
- Utilisation du service
- Compte utilisateur
- Propriété intellectuelle
- Limitation de responsabilité
- Résiliation

#### URL de Support

Créer une page : `https://unebox.app/support`

---

## ⚙️ Configuration EAS

### 1. Initialiser EAS

```bash
# Configurer le projet
eas build:configure

# Cela créera/mettra à jour eas.json
```

### 2. Configurer les Identifiants

#### iOS

```bash
# Créer les identifiants Apple
eas credentials

# Suivre les instructions pour :
# - Distribution Certificate
# - Provisioning Profile
# - Push Notification Key
```

#### Android

```bash
# Créer le keystore
eas credentials

# Suivre les instructions pour :
# - Keystore
# - Key Alias
# - Passwords
```

### 3. Variables d'Environnement

Créer un fichier `.env.production` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-production
EXPO_PUBLIC_ENV=production
```

**⚠️ Important :** Ne jamais commiter ce fichier ! Ajouter à `.gitignore`.

---

## 🍎 Build iOS

### 1. Build de Production

```bash
# Build pour l'App Store
eas build --platform ios --profile production

# Attendre la fin du build (15-30 minutes)
# Vous recevrez un email quand c'est prêt
```

### 2. Télécharger le Build

```bash
# Lister les builds
eas build:list --platform ios

# Télécharger le .ipa (optionnel, pour tests)
eas build:download --platform ios
```

### 3. Tester le Build

#### TestFlight (Recommandé)

```bash
# Soumettre à TestFlight
eas submit --platform ios --latest

# Ou spécifier un build
eas submit --platform ios --id [build-id]
```

**Testeurs internes :**
- Ajoutez des testeurs dans App Store Connect
- Ils recevront une invitation TestFlight
- Testez toutes les fonctionnalités

---

## 🤖 Build Android

### 1. Build de Production

```bash
# Build pour le Play Store (AAB)
eas build --platform android --profile production

# Attendre la fin du build (15-30 minutes)
```

### 2. Télécharger le Build

```bash
# Lister les builds
eas build:list --platform android

# Télécharger le .aab
eas build:download --platform android
```

### 3. Tester le Build

#### Internal Testing

```bash
# Soumettre au Play Store (track internal)
eas submit --platform android --latest --track internal
```

**Testeurs internes :**
- Ajoutez des testeurs dans Play Console
- Partagez le lien de test
- Testez toutes les fonctionnalités

---

## 📱 Soumission App Store

### 1. App Store Connect

1. **Aller sur** : https://appstoreconnect.apple.com
2. **Mes Apps** → **+** → **Nouvelle App**

### 2. Informations de l'App

**Général :**
- **Nom** : UneBox
- **Langue principale** : Français
- **Bundle ID** : com.unebox.app
- **SKU** : unebox-app-001

**Catégories :**
- **Principale** : Productivité
- **Secondaire** : Utilitaires

### 3. Informations de Version

**Version 1.0.1 :**

- **Nouveautés** :
```
🎉 Première version d'UneBox !

✨ Fonctionnalités :
• Analyse IA de documents avec OCR
• Classification automatique
• Rappels intelligents
• Synchronisation temps réel
• Interface moderne et intuitive

🔒 Sécurité maximale avec chiffrement de bout en bout
```

- **Description** : [Utiliser la description longue ci-dessus]
- **Mots-clés** : [Utiliser les mots-clés ci-dessus]
- **URL de support** : https://unebox.app/support
- **URL marketing** : https://unebox.app
- **Politique de confidentialité** : https://unebox.app/privacy

### 4. Screenshots

Uploader les screenshots pour chaque taille d'écran requise.

**Ordre recommandé :**
1. Écran d'accueil avec statistiques
2. Liste de documents
3. Détails d'un document analysé
4. Rappels
5. Upload de document

### 5. Informations de Build

- **Build** : Sélectionner le build uploadé via EAS
- **Informations d'exportation** : Non (ITSAppUsesNonExemptEncryption = false)

### 6. Informations Générales

**Âge minimum :** 4+

**Informations de contact :**
- **Nom** : Votre nom
- **Email** : support@unebox.app
- **Téléphone** : Votre numéro

**Informations de confidentialité :**
- **Politique de confidentialité** : https://unebox.app/privacy
- **Collecte de données** : Oui
  - Identifiants utilisateur
  - Données de documents (chiffrées)
  - Données d'utilisation

### 7. Tarification

- **Prix** : Gratuit
- **Disponibilité** : Tous les pays

### 8. Soumettre pour Review

1. **Vérifier** toutes les informations
2. **Ajouter des notes** pour l'équipe de review :

```
Bonjour,

UneBox est une application de gestion de documents avec IA.

Compte de test :
Email : test@unebox.app
Mot de passe : TestUneBox2025!

Fonctionnalités à tester :
1. Créer un compte
2. Uploader un document (PDF ou image)
3. Voir l'analyse IA automatique
4. Consulter les rappels créés automatiquement
5. Recevoir une notification de rappel

L'application utilise :
- Supabase pour le backend
- OpenAI GPT-4o Vision pour l'OCR et l'analyse
- Expo Notifications pour les push

Merci !
```

3. **Soumettre** pour review

**Délai de review :** 1-3 jours généralement

---

## 🤖 Soumission Play Store

### 1. Play Console

1. **Aller sur** : https://play.google.com/console
2. **Créer une application**

### 2. Informations de l'App

**Détails de l'application :**
- **Nom** : UneBox
- **Description courte** : [Utiliser la description courte ci-dessus]
- **Description complète** : [Utiliser la description longue ci-dessus]

**Catégorie :**
- **Application** : Productivité
- **Tags** : Documents, Scanner, IA, Organisation

### 3. Graphiques de la Fiche

**Icône :**
- 512 x 512 px
- PNG 32 bits
- Pas de transparence

**Image de présentation :**
- 1024 x 500 px
- PNG ou JPEG

**Screenshots :**
- Minimum 2, maximum 8
- Formats : Phone, 7" Tablet, 10" Tablet

**Vidéo (optionnel) :**
- Lien YouTube de démo

### 4. Fiche du Store

**Coordonnées :**
- **Site web** : https://unebox.app
- **Email** : support@unebox.app
- **Téléphone** : Votre numéro
- **Politique de confidentialité** : https://unebox.app/privacy

**Catégorie et tags :**
- **Catégorie** : Productivité
- **Tags** : documents, scanner, ocr, ia

### 5. Contenu de l'Application

**Classification du contenu :**
- Répondre au questionnaire
- UneBox est adapté à tous les âges

**Public cible :**
- **Âge** : 13 ans et plus
- **Contenu pour enfants** : Non

**Déclaration de confidentialité :**
- **Collecte de données** : Oui
  - Informations personnelles (email)
  - Fichiers et documents
  - Données d'utilisation
- **Partage de données** : Non
- **Chiffrement** : Oui
- **Suppression de données** : Oui (sur demande)

### 6. Tarification et Distribution

**Tarification :**
- **Gratuit** : Oui
- **Achats intégrés** : Non (pour l'instant)
- **Publicités** : Non

**Pays :**
- Sélectionner tous les pays

**Conformité :**
- Cocher toutes les cases de conformité

### 7. Version de Production

**Créer une version :**
1. **Production** → **Créer une version**
2. **Uploader l'AAB** (via EAS Submit ou manuellement)
3. **Nom de la version** : 1.0.1 (2)
4. **Notes de version** :

```
🎉 Première version d'UneBox !

✨ Nouveautés :
• Analyse IA de documents avec OCR
• Classification automatique intelligente
• Rappels automatiques pour les échéances
• Synchronisation en temps réel
• Interface moderne et intuitive
• Mode clair/sombre

🔒 Sécurité maximale avec chiffrement de bout en bout
```

### 8. Soumettre pour Review

1. **Vérifier** toutes les informations
2. **Soumettre** pour review

**Délai de review :** 1-7 jours généralement

---

## 🚀 Après Publication

### 1. Monitoring

#### App Store Connect

- **Ventes et tendances** : Téléchargements, revenus
- **Analyses** : Engagement, rétention
- **Avis** : Répondre aux avis utilisateurs

#### Play Console

- **Statistiques** : Installations, désinstallations
- **Avis** : Répondre aux avis
- **Rapports de plantage** : Corriger les bugs

### 2. Mises à Jour

#### Processus de Mise à Jour

```bash
# 1. Incrémenter la version dans app.json
# version: "1.0.2"
# buildNumber: "3" (iOS)
# versionCode: 3 (Android)

# 2. Build
eas build --platform all --profile production

# 3. Soumettre
eas submit --platform all --latest
```

#### Fréquence Recommandée

- **Corrections de bugs** : Dès que possible
- **Nouvelles fonctionnalités** : Toutes les 2-4 semaines
- **Mises à jour mineures** : Mensuel

### 3. Marketing

#### Lancement

- [ ] Communiqué de presse
- [ ] Posts sur les réseaux sociaux
- [ ] Email aux beta testeurs
- [ ] Article de blog
- [ ] Vidéo de démo sur YouTube

#### Promotion Continue

- [ ] ASO (App Store Optimization)
- [ ] Publicité (Google Ads, Apple Search Ads)
- [ ] Partenariats
- [ ] Content marketing
- [ ] Community management

### 4. Support Utilisateurs

#### Canaux de Support

- **Email** : support@unebox.app
- **FAQ** : https://unebox.app/faq
- **Documentation** : https://docs.unebox.app
- **Discord** : https://discord.gg/unebox

#### Temps de Réponse

- **Critique** : < 4 heures
- **Important** : < 24 heures
- **Normal** : < 48 heures

---

## 📊 Checklist Finale

### Avant Soumission

- [ ] Tous les tests passent
- [ ] Pas de bugs critiques
- [ ] Performance optimale
- [ ] Screenshots de qualité
- [ ] Descriptions complètes
- [ ] Politique de confidentialité publiée
- [ ] Conditions d'utilisation publiées
- [ ] Page de support créée
- [ ] Compte de test créé
- [ ] Variables d'environnement configurées

### iOS

- [ ] Build production créé
- [ ] Testé sur TestFlight
- [ ] App Store Connect configuré
- [ ] Screenshots uploadés
- [ ] Informations complètes
- [ ] Soumis pour review

### Android

- [ ] Build production créé (AAB)
- [ ] Testé en internal testing
- [ ] Play Console configuré
- [ ] Screenshots uploadés
- [ ] Informations complètes
- [ ] Soumis pour review

### Post-Publication

- [ ] Monitoring configuré
- [ ] Support en place
- [ ] Marketing lancé
- [ ] Réseaux sociaux actifs
- [ ] Plan de mises à jour défini

---

## 🎉 Félicitations !

Votre application est maintenant publiée ! 🚀

**Prochaines étapes :**

1. Surveiller les premiers retours utilisateurs
2. Corriger rapidement les bugs critiques
3. Planifier les prochaines fonctionnalités
4. Engager avec votre communauté
5. Itérer et améliorer continuellement

**Bonne chance avec UneBox ! 💙**

---

## 📞 Besoin d'Aide ?

- **Documentation Expo** : https://docs.expo.dev
- **EAS Build** : https://docs.expo.dev/build/introduction/
- **EAS Submit** : https://docs.expo.dev/submit/introduction/
- **App Store Connect** : https://developer.apple.com/app-store-connect/
- **Play Console** : https://support.google.com/googleplay/android-developer/

---

**Version du guide :** 1.0.0  
**Dernière mise à jour :** Janvier 2025
