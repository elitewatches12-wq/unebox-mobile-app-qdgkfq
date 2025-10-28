
# 🧪 GUIDE DE TEST - UneBox

## 📋 Tests à effectuer pour vérifier toutes les fonctionnalités

---

## 1. 🔐 TEST D'AUTHENTIFICATION

### Inscription
1. Ouvrir l'application
2. Cliquer sur "S'inscrire"
3. Remplir :
   - Nom complet
   - Email
   - Mot de passe
4. Cliquer sur "Créer un compte"
5. ✅ Vérifier : Message de confirmation
6. ✅ Vérifier : Email de vérification reçu

### Connexion
1. Cliquer sur "Se connecter"
2. Entrer email et mot de passe
3. Cliquer sur "Connexion"
4. ✅ Vérifier : Redirection vers l'accueil
5. ✅ Vérifier : Nom affiché dans l'accueil

---

## 2. 🏠 TEST ÉCRAN D'ACCUEIL

### Données dynamiques
1. Ouvrir l'écran d'accueil
2. ✅ Vérifier : Nom de l'utilisateur affiché
3. ✅ Vérifier : Stockage = "0 Mo utilisés sur 5 Go" (si nouveau compte)
4. ✅ Vérifier : Pourcentage = 0%
5. ✅ Vérifier : "Aucun document" affiché
6. ✅ Vérifier : "Aucun rappel" affiché

### Boutons fonctionnels
1. Cliquer sur "Téléverser"
   - ✅ Vérifier : Redirection vers Upload
2. Cliquer sur "Rechercher"
   - ✅ Vérifier : Redirection vers Documents
3. Cliquer sur "Assistant IA"
   - ✅ Vérifier : Redirection vers AI Assistant

### Pull-to-refresh
1. Tirer vers le bas sur l'écran
2. ✅ Vérifier : Indicateur de chargement
3. ✅ Vérifier : Données actualisées

---

## 3. 📤 TEST TÉLÉVERSEMENT

### Upload d'un document
1. Aller sur l'écran Upload
2. Cliquer sur "Sélectionner un document"
3. Choisir un fichier (PDF ou image)
4. ✅ Vérifier : Fichier ajouté à la liste
5. Cliquer sur "Traiter les documents"
6. ✅ Vérifier : Barre de progression
7. ✅ Vérifier : Étapes affichées :
   - Upload du fichier (20%)
   - Création du document (40%)
   - Traitement IA (60%)
   - Finalisation (100%)
8. ✅ Vérifier : Message de succès
9. Attendre 10-20 secondes
10. ✅ Vérifier : Document traité

### Prise de photo
1. Cliquer sur "Prendre une photo"
2. Autoriser l'accès à la caméra
3. Prendre une photo d'un document
4. ✅ Vérifier : Photo ajoutée
5. Traiter comme ci-dessus

---

## 4. 🤖 TEST TRAITEMENT IA

### Vérification du traitement
1. Après upload, aller sur Documents
2. Cliquer sur le document traité
3. ✅ Vérifier : Titre extrait
4. ✅ Vérifier : Catégorie assignée
5. ✅ Vérifier : Type de document
6. ✅ Vérifier : Émetteur détecté
7. ✅ Vérifier : Date du document
8. ✅ Vérifier : Montant (si applicable)
9. ✅ Vérifier : Résumé généré
10. ✅ Vérifier : Texte extrait (OCR)

### Exemples de documents à tester
- **Facture EDF** :
  - ✅ Catégorie = "Énergie"
  - ✅ Type = "Facture"
  - ✅ Émetteur = "EDF"
  - ✅ Montant détecté
  - ✅ Date d'échéance détectée

- **Contrat de travail** :
  - ✅ Catégorie = "Travail"
  - ✅ Type = "Contrat"
  - ✅ Dates détectées

- **Carte d'identité** :
  - ✅ Catégorie = "Administratif"
  - ✅ Type = "Pièce d'identité"
  - ✅ Informations extraites

---

## 5. ⏰ TEST RAPPELS AUTOMATIQUES

### Vérification des rappels
1. Après traitement d'un document avec échéance
2. Aller sur l'écran Rappels
3. ✅ Vérifier : Rappel créé automatiquement
4. ✅ Vérifier : Titre du rappel
5. ✅ Vérifier : Date d'échéance
6. ✅ Vérifier : Message du rappel
7. ✅ Vérifier : Priorité assignée

### Test de complétion
1. Cliquer sur un rappel
2. Marquer comme complété
3. ✅ Vérifier : Rappel disparaît de la liste
4. ✅ Vérifier : Compteur mis à jour

---

## 6. 💾 TEST CALCUL DU STOCKAGE

### Vérification du stockage
1. Téléverser un document de taille connue (ex: 2 Mo)
2. Aller sur l'écran d'accueil
3. ✅ Vérifier : Stockage mis à jour (~2 Mo)
4. ✅ Vérifier : Pourcentage correct
5. Aller sur l'écran Profil
6. ✅ Vérifier : Même valeur affichée
7. Téléverser un autre document (ex: 3 Mo)
8. ✅ Vérifier : Stockage = ~5 Mo
9. ✅ Vérifier : Pourcentage mis à jour

### Test de synchronisation
1. Pull-to-refresh sur l'accueil
2. ✅ Vérifier : Stockage toujours correct
3. Redémarrer l'application
4. ✅ Vérifier : Stockage persistant

---

## 7. 🔍 TEST RECHERCHE

### Recherche simple
1. Aller sur l'écran Documents
2. Taper "EDF" dans la barre de recherche
3. ✅ Vérifier : Documents EDF affichés
4. ✅ Vérifier : Autres documents masqués

### Filtres
1. Cliquer sur "Filtrer"
2. Sélectionner une catégorie (ex: "Énergie")
3. ✅ Vérifier : Seuls les documents de cette catégorie
4. Changer le tri (ex: "Plus récents")
5. ✅ Vérifier : Ordre correct

---

## 8. 💬 TEST ASSISTANT IA

### Questions simples
1. Aller sur l'écran AI Assistant
2. Taper "Montre-moi mes factures"
3. ✅ Vérifier : Réponse de l'IA
4. ✅ Vérifier : Documents trouvés affichés

### Questions complexes
1. Taper "Quels documents expirent ce mois-ci ?"
2. ✅ Vérifier : Réponse pertinente
3. ✅ Vérifier : Documents avec échéances

### Actions rapides
1. Cliquer sur "Mes factures EDF"
2. ✅ Vérifier : Recherche automatique
3. ✅ Vérifier : Résultats affichés

---

## 9. 👤 TEST ÉCRAN PROFIL

### Statistiques
1. Aller sur l'écran Profil
2. ✅ Vérifier : Nombre de documents correct
3. ✅ Vérifier : Stockage utilisé correct
4. ✅ Vérifier : Nombre de rappels correct
5. ✅ Vérifier : Pourcentage de stockage correct

### Informations utilisateur
1. ✅ Vérifier : Nom affiché
2. ✅ Vérifier : Email affiché
3. ✅ Vérifier : Initiales dans l'avatar
4. ✅ Vérifier : Plan d'abonnement

---

## 10. ⚙️ TEST PARAMÈTRES

### Thème
1. Aller sur Paramètres
2. Changer le thème (Clair/Sombre/Auto)
3. ✅ Vérifier : Changement immédiat
4. Redémarrer l'application
5. ✅ Vérifier : Thème persistant

### Langue
1. Changer la langue (FR/EN)
2. ✅ Vérifier : Textes traduits
3. Redémarrer l'application
4. ✅ Vérifier : Langue persistante

### Notifications
1. Activer/désactiver les notifications
2. ✅ Vérifier : Changement enregistré
3. Configurer l'heure des notifications
4. ✅ Vérifier : Heure sauvegardée

---

## 11. 🔄 TEST SYNCHRONISATION

### Synchronisation temps réel
1. Téléverser un document
2. Aller sur l'accueil
3. ✅ Vérifier : Document dans "Récents"
4. Aller sur Documents
5. ✅ Vérifier : Document dans la liste
6. Aller sur Profil
7. ✅ Vérifier : Compteur mis à jour

### Pull-to-refresh
1. Sur chaque écran, tirer vers le bas
2. ✅ Vérifier : Données actualisées
3. ✅ Vérifier : Indicateur de chargement

---

## 12. 🚪 TEST DÉCONNEXION

### Déconnexion
1. Aller sur Profil
2. Cliquer sur "Déconnexion"
3. Confirmer
4. ✅ Vérifier : Redirection vers Login
5. ✅ Vérifier : Session terminée

### Reconnexion
1. Se reconnecter
2. ✅ Vérifier : Données toujours présentes
3. ✅ Vérifier : Documents conservés
4. ✅ Vérifier : Rappels conservés

---

## 📊 CHECKLIST COMPLÈTE

### Authentification
- [ ] Inscription fonctionnelle
- [ ] Connexion fonctionnelle
- [ ] Déconnexion fonctionnelle
- [ ] Email de vérification reçu

### Écran d'accueil
- [ ] Nom utilisateur affiché
- [ ] Stockage correct
- [ ] Documents récents
- [ ] Rappels à venir
- [ ] Boutons fonctionnels
- [ ] Pull-to-refresh

### Upload
- [ ] Sélection de fichier
- [ ] Prise de photo
- [ ] Barre de progression
- [ ] Message de succès

### Traitement IA
- [ ] OCR fonctionnel
- [ ] Classification correcte
- [ ] Métadonnées extraites
- [ ] Résumé généré

### Rappels
- [ ] Création automatique
- [ ] Dates correctes
- [ ] Priorités assignées
- [ ] Complétion fonctionnelle

### Stockage
- [ ] Calcul précis
- [ ] Mise à jour automatique
- [ ] Affichage cohérent
- [ ] Pourcentage correct

### Recherche
- [ ] Recherche par texte
- [ ] Filtres fonctionnels
- [ ] Tri fonctionnel
- [ ] Résultats corrects

### Assistant IA
- [ ] Questions simples
- [ ] Questions complexes
- [ ] Actions rapides
- [ ] Résultats pertinents

### Profil
- [ ] Statistiques correctes
- [ ] Informations utilisateur
- [ ] Stockage affiché
- [ ] Paramètres accessibles

### Paramètres
- [ ] Changement de thème
- [ ] Changement de langue
- [ ] Configuration notifications
- [ ] Persistance des préférences

---

## 🎯 SCÉNARIO COMPLET

### Test de bout en bout (30 minutes)

1. **Inscription** (2 min)
   - Créer un compte
   - Vérifier l'email

2. **Premier document** (5 min)
   - Téléverser une facture
   - Attendre le traitement
   - Vérifier les métadonnées

3. **Vérification accueil** (2 min)
   - Vérifier le stockage
   - Vérifier le document récent
   - Vérifier le rappel créé

4. **Recherche** (3 min)
   - Rechercher le document
   - Tester les filtres
   - Tester le tri

5. **Assistant IA** (5 min)
   - Poser des questions
   - Tester les actions rapides
   - Vérifier les résultats

6. **Deuxième document** (5 min)
   - Téléverser un autre type
   - Vérifier le traitement
   - Vérifier le stockage mis à jour

7. **Rappels** (3 min)
   - Vérifier les rappels créés
   - Marquer un comme complété
   - Vérifier la mise à jour

8. **Paramètres** (3 min)
   - Changer le thème
   - Changer la langue
   - Configurer les notifications

9. **Profil** (2 min)
   - Vérifier les statistiques
   - Vérifier le stockage
   - Vérifier les informations

10. **Déconnexion/Reconnexion** (2 min)
    - Se déconnecter
    - Se reconnecter
    - Vérifier la persistance

---

## ✅ RÉSULTAT ATTENDU

À la fin de ces tests, vous devriez avoir :
- ✅ Un compte utilisateur fonctionnel
- ✅ Au moins 2 documents traités
- ✅ Des rappels automatiques créés
- ✅ Un stockage calculé précisément
- ✅ Une interface réactive et fluide
- ✅ Toutes les fonctionnalités opérationnelles

---

## 🐛 EN CAS DE PROBLÈME

### Document non traité
1. Vérifier les logs dans Supabase
2. Vérifier l'Edge Function
3. Vérifier la clé OpenAI
4. Réessayer avec un autre document

### Stockage incorrect
1. Pull-to-refresh
2. Vérifier la base de données
3. Vérifier le trigger SQL
4. Redémarrer l'application

### Bouton ne fonctionne pas
1. Vérifier la console
2. Vérifier la navigation
3. Redémarrer l'application

---

**Bon test ! 🚀**
