
# Assistant IA Multi-Documents - Documentation Technique

## Vue d'ensemble

Cette fonctionnalité transforme le chatbot UneBox d'un simple moteur de recherche en un véritable **Assistant Conversationnel** capable de traiter des requêtes portant sur plusieurs documents en une seule phrase.

## Architecture

### 1. Composants Principaux

#### A. Frontend (`app/(tabs)/ai-assistant.tsx`)
- Interface utilisateur conversationnelle
- Gestion des messages et de l'état
- Affichage des entités extraites et des documents trouvés
- **Rétrocompatibilité totale** avec les requêtes simples

#### B. Edge Function (`ai-assistant-query`)
- Extraction d'entités multiples via OpenAI GPT-4o-mini
- Génération de requêtes SQL combinées (UNION/OR)
- Recherche multi-documents optimisée
- Génération de réponses en langage naturel

### 2. Flux de Traitement

```
Utilisateur → Requête
    ↓
[Extraction d'Entités] (OpenAI GPT-4o-mini)
    ↓
[Entités Multiples] (max 4)
    ↓
[Requête SQL Combinée] (OR conditions)
    ↓
[Documents Trouvés]
    ↓
[Génération de Réponse] (formatée)
    ↓
Utilisateur ← Réponse + Documents
```

## Fonctionnalités Clés

### 1. Extraction d'Entités Multiples (NLP)

L'IA analyse la requête utilisateur et identifie automatiquement les entités de recherche distinctes.

**Exemple:**
```
Requête: "Je veux ma facture de téléphone et le contrat de mon assurance auto"

Entités extraites:
1. { type: "Facture", subject: "Téléphone" }
2. { type: "Contrat", subject: "Assurance Auto" }
```

**Limite de traitement:** Maximum 4 entités par requête pour garantir une faible latence.

### 2. Recherche SQL Combinée

L'Edge Function génère une requête SQL optimisée utilisant des opérateurs `OR` pour combiner les résultats:

```sql
SELECT * FROM documents
WHERE user_id = '...'
  AND processing_status = 'completed'
  AND (
    (document_type ILIKE '%Facture%' AND (
      title ILIKE '%Téléphone%' OR
      sender ILIKE '%Téléphone%' OR
      ai_summary ILIKE '%Téléphone%'
    ))
    OR
    (document_type ILIKE '%Contrat%' AND (
      title ILIKE '%Assurance Auto%' OR
      sender ILIKE '%Assurance Auto%' OR
      ai_summary ILIKE '%Assurance Auto%'
    ))
  )
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Format de Réponse Structuré

Les réponses sont formatées de manière claire et lisible:

```
J'ai trouvé 3 document(s) correspondant à vos recherches:

1. **Facture Orange Mobile - Janvier 2025**
   📤 Émetteur: Orange
   📄 Type: Facture - Téléphonie
   💰 Montant: 45.99 EUR
   ⏰ Échéance: 15/02/2025 (🔴 Dans 5 jours)
   📝 Facture mensuelle pour abonnement mobile...

2. **Contrat Assurance Auto AXA**
   📤 Émetteur: AXA Assurances
   📄 Type: Contrat - Assurance
   📅 Date: 01/01/2024
   📝 Contrat d'assurance automobile tous risques...

💵 **Montant total: 45.99 EUR**
⚠️ 1 document(s) avec échéance à venir
```

### 4. Rétrocompatibilité

Le système maintient une **compatibilité totale** avec les requêtes simples:

- Si l'Edge Function échoue, le système bascule automatiquement sur la recherche locale
- Les requêtes simples (un seul document) fonctionnent exactement comme avant
- Aucune régression de fonctionnalité

## Sécurité et Performance

### Sécurité

1. **Authentification JWT**: Toutes les requêtes sont authentifiées
2. **RLS (Row Level Security)**: Les utilisateurs ne peuvent accéder qu'à leurs propres documents
3. **Validation des entrées**: Toutes les entrées sont validées et nettoyées
4. **Limitation des entités**: Maximum 4 entités pour éviter les abus

### Performance

1. **Latence optimisée**:
   - Extraction d'entités: ~500-1000ms
   - Recherche SQL: ~100-300ms
   - Génération de réponse: ~200-500ms
   - **Total: ~1-2 secondes**

2. **Optimisations**:
   - Utilisation de GPT-4o-mini (plus rapide que GPT-4o)
   - Requêtes SQL indexées
   - Limite de 20 documents par recherche
   - Cache des résultats côté client

## Utilisation

### Exemples de Requêtes Multi-Documents

1. **Factures multiples:**
   ```
   "Montre-moi mes factures EDF et Orange"
   ```

2. **Types de documents différents:**
   ```
   "Je veux mon contrat d'assurance et ma dernière facture d'eau"
   ```

3. **Recherche complexe:**
   ```
   "Tous mes contrats d'assurance, ma facture de téléphone et mon attestation de sécurité sociale"
   ```

4. **Requête simple (rétrocompatible):**
   ```
   "Mes factures EDF"
   ```

### Actions Rapides

L'interface propose des actions rapides pour faciliter l'utilisation:

- "Factures EDF et téléphone"
- "Tous mes contrats"
- "Documents récents"
- "Montants à payer"

## Monitoring et Logs

### Logs Edge Function

L'Edge Function enregistre des logs détaillés:

```typescript
[ai-assistant-query] Request received
[ai-assistant-query] User authenticated: user-id
[ai-assistant-query] Processing query: "ma facture EDF et mon contrat auto"
[extractEntities] Analyzing query
[extractEntities] Extracted entities: 2
[searchDocuments] Searching for 2 entities
[searchDocuments] Found 3 documents
[generateResponse] Generating response for 3 documents
[ai-assistant-query] Total processing time: 1234ms
```

### Métriques

Les réponses incluent des métadonnées de performance:

```json
{
  "metadata": {
    "entitiesCount": 2,
    "documentsCount": 3,
    "processingTime": 1234
  }
}
```

## Gestion des Erreurs

### Stratégie de Fallback

1. **Erreur Edge Function** → Recherche locale
2. **Erreur extraction d'entités** → Entité unique avec requête originale
3. **Erreur recherche SQL** → Tableau vide + message d'erreur
4. **Erreur OpenAI** → Message d'erreur utilisateur

### Messages d'Erreur

Les messages d'erreur sont clairs et orientés utilisateur:

```
"Désolé, une erreur s'est produite lors du traitement de votre requête. Veuillez réessayer."
```

## Configuration

### Variables d'Environnement

L'Edge Function nécessite:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

### Paramètres Ajustables

```typescript
// Maximum d'entités à traiter
const MAX_ENTITIES = 4;

// Limite de documents retournés
const DOCUMENT_LIMIT = 20;

// Modèle OpenAI
const MODEL = 'gpt-4o-mini';
```

## Tests

### Scénarios de Test

1. **Requête simple (1 entité)**
   - Input: "mes factures EDF"
   - Expected: Liste des factures EDF

2. **Requête double (2 entités)**
   - Input: "ma facture EDF et mon contrat Orange"
   - Expected: Factures EDF + Contrats Orange

3. **Requête multiple (3-4 entités)**
   - Input: "mes factures EDF, Orange et Free"
   - Expected: Toutes les factures des 3 opérateurs

4. **Requête dépassant la limite (>4 entités)**
   - Input: "mes factures EDF, Orange, Free, SFR et Bouygues"
   - Expected: Seulement les 4 premières entités

5. **Requête sans résultat**
   - Input: "mon contrat Netflix"
   - Expected: Message "aucun document trouvé"

6. **Fallback sur erreur**
   - Scenario: Edge Function indisponible
   - Expected: Recherche locale fonctionne

## Évolutions Futures

### Améliorations Possibles

1. **Cache intelligent**: Mise en cache des entités fréquemment recherchées
2. **Suggestions proactives**: Suggestions basées sur l'historique
3. **Recherche sémantique**: Utilisation d'embeddings pour une recherche plus précise
4. **Filtres avancés**: Filtres par date, montant, catégorie
5. **Export de résultats**: Export des documents trouvés en PDF/ZIP
6. **Analyse de tendances**: Statistiques sur les documents les plus recherchés

### Scalabilité

- **Augmentation de MAX_ENTITIES**: Possible si la latence reste acceptable
- **Parallélisation**: Recherches parallèles pour chaque entité
- **Pagination**: Pagination des résultats pour les grandes listes

## Support et Maintenance

### Problèmes Connus

1. **Latence variable**: Dépend de la charge OpenAI
2. **Extraction imparfaite**: L'IA peut parfois mal interpréter les requêtes complexes
3. **Limite de tokens**: Les très longues requêtes peuvent être tronquées

### Contact

Pour toute question ou problème:
- GitHub Issues: [lien vers le repo]
- Email: support@unebox.app

## Conclusion

Cette fonctionnalité transforme UneBox en un véritable assistant conversationnel, offrant une expérience utilisateur "simple et humaine" tout en maintenant la stabilité et la sécurité du système existant.

**Statut**: ✅ Production Ready
**Version**: 1.0.0
**Date**: Janvier 2025
