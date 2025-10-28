
# 🔒 Politique de Sécurité - UneBox

## 📋 Versions Supportées

Nous fournissons des mises à jour de sécurité pour les versions suivantes :

| Version | Supportée          |
| ------- | ------------------ |
| 1.0.x   | ✅ Oui             |
| < 1.0   | ❌ Non             |

## 🐛 Signaler une Vulnérabilité

La sécurité de UneBox est notre priorité absolue. Si vous découvrez une vulnérabilité de sécurité, merci de nous la signaler de manière responsable.

### 📧 Contact

**Email de sécurité :** security@unebox.app

**⚠️ Important :** Ne créez PAS d'issue publique pour les vulnérabilités de sécurité.

### 📝 Informations à Fournir

Pour nous aider à comprendre et résoudre rapidement le problème, veuillez inclure :

1. **Description détaillée** de la vulnérabilité
2. **Étapes pour reproduire** le problème
3. **Impact potentiel** (qui est affecté, quelles données sont à risque)
4. **Versions affectées**
5. **Proof of Concept** (si disponible)
6. **Suggestions de correction** (si vous en avez)

### 🔄 Processus de Traitement

1. **Accusé de réception** : Sous 24 heures
2. **Évaluation initiale** : Sous 48 heures
3. **Mise à jour régulière** : Tous les 3-5 jours
4. **Résolution** : Selon la gravité
   - Critique : < 7 jours
   - Haute : < 14 jours
   - Moyenne : < 30 jours
   - Basse : < 90 jours

### 🏆 Programme de Reconnaissance

Nous reconnaissons et remercions publiquement (avec votre permission) les chercheurs en sécurité qui nous aident à améliorer la sécurité de UneBox.

**Hall of Fame :** [À venir]

---

## 🔐 Mesures de Sécurité Implémentées

### Authentification

- ✅ JWT (JSON Web Tokens)
- ✅ Hashing sécurisé des mots de passe (bcrypt)
- ✅ Vérification email obligatoire
- ✅ Rate limiting sur les tentatives de connexion
- ✅ Tokens de réinitialisation à usage unique

### Données

- ✅ Chiffrement au repos (AES-256)
- ✅ Chiffrement en transit (TLS 1.3)
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Isolation complète entre utilisateurs
- ✅ Validation et sanitization des entrées

### Stockage

- ✅ Bucket privé (pas d'accès public)
- ✅ URLs signées avec expiration (1 heure)
- ✅ Validation des types de fichiers
- ✅ Limite de taille de fichier (50 MB)
- ✅ Scan antivirus (à venir)

### API

- ✅ Rate limiting
- ✅ CORS configuré strictement
- ✅ Validation des requêtes
- ✅ Logging des accès
- ✅ Protection CSRF

### Infrastructure

- ✅ Hébergement sécurisé (Supabase)
- ✅ Backups automatiques quotidiens
- ✅ Monitoring 24/7
- ✅ Mises à jour de sécurité automatiques
- ✅ Isolation des environnements (dev/staging/prod)

---

## 🛡️ Bonnes Pratiques pour les Utilisateurs

### Mots de Passe

- Utilisez un mot de passe fort (12+ caractères)
- Mélangez majuscules, minuscules, chiffres et symboles
- N'utilisez pas le même mot de passe ailleurs
- Utilisez un gestionnaire de mots de passe

### Compte

- Activez la vérification email
- Ne partagez jamais vos identifiants
- Déconnectez-vous sur les appareils partagés
- Vérifiez régulièrement l'activité de votre compte

### Documents

- Ne téléversez pas de documents ultra-sensibles
- Vérifiez les permissions de partage (à venir)
- Supprimez les documents dont vous n'avez plus besoin
- Utilisez des noms de fichiers non-identifiants

---

## 📜 Conformité

### RGPD (Règlement Général sur la Protection des Données)

- ✅ Données hébergées en Europe
- ✅ Consentement explicite
- ✅ Droit d'accès aux données
- ✅ Droit de rectification
- ✅ Droit à l'oubli
- ✅ Portabilité des données
- ✅ Notification de violation sous 72h

### Autres Réglementations

- ✅ ePrivacy Directive
- ✅ CCPA (California Consumer Privacy Act)
- ✅ ISO 27001 (en cours)

---

## 🔍 Audits de Sécurité

### Audits Internes

- **Fréquence** : Mensuel
- **Scope** : Code, infrastructure, processus
- **Outils** : 
  - Snyk (dépendances)
  - ESLint Security Plugin
  - OWASP ZAP
  - Supabase Security Advisor

### Audits Externes

- **Fréquence** : Annuel
- **Scope** : Pentest complet
- **Dernier audit** : [À venir]

---

## 📚 Ressources

### Documentation

- [Politique de Confidentialité](https://unebox.app/privacy)
- [Conditions d'Utilisation](https://unebox.app/terms)
- [Guide de Sécurité](https://docs.unebox.app/security)

### Standards

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Outils

- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [React Native Security](https://reactnative.dev/docs/security)

---

## 🚨 Incidents de Sécurité

### Historique

Aucun incident de sécurité à ce jour.

### Notification

En cas d'incident de sécurité affectant vos données :

1. **Notification immédiate** par email
2. **Détails de l'incident** (ce qui s'est passé, données affectées)
3. **Actions prises** (mesures correctives)
4. **Recommandations** (ce que vous devez faire)

---

## 📞 Contact

### Équipe Sécurité

- **Email** : security@unebox.app
- **PGP Key** : [À venir]
- **Response Time** : < 24 heures

### Signalement Anonyme

Si vous préférez rester anonyme, vous pouvez utiliser :
- [ProtonMail](https://protonmail.com) pour un email chiffré
- [Tor Browser](https://www.torproject.org) pour masquer votre IP

---

## 🙏 Remerciements

Merci à tous les chercheurs en sécurité et contributeurs qui nous aident à maintenir UneBox sécurisé.

**Contributeurs Sécurité :**
- [À venir]

---

## 📄 Licence

Cette politique de sécurité est sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Dernière mise à jour :** Janvier 2025  
**Version :** 1.0.0

---

**Ensemble, construisons une application plus sûre ! 🔒**
