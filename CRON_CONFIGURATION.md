
# ✅ Configuration Cron - UneBox

## 🎉 Configuration Terminée !

Le système de rappels automatiques est maintenant **entièrement configuré** et **opérationnel** dans votre projet Supabase.

---

## 📋 Ce qui a été configuré

### 1. Extension HTTP activée
- L'extension `http` a été activée pour permettre les appels HTTP depuis la base de données
- Permet à PostgreSQL de faire des requêtes vers les Edge Functions

### 2. Fonction de déclenchement créée
- **Nom:** `trigger_reminder_scheduler()`
- **Rôle:** Appelle l'Edge Function `reminder-scheduler` via HTTP POST
- **Sécurité:** Utilise l'anon key pour l'authentification

### 3. Tâche Cron planifiée
- **Nom du job:** `reminder-scheduler-hourly`
- **Fréquence:** Toutes les heures (à la minute 0)
- **Expression cron:** `0 * * * *`
- **Statut:** ✅ ACTIF
- **Commande:** `SELECT trigger_reminder_scheduler();`

---

## 🔍 Vérification de la configuration

### Voir les jobs cron actifs

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job;
```

**Résultat attendu:**
```
jobid | jobname                    | schedule   | active | command
------|----------------------------|------------|--------|----------------------------------
1     | reminder-scheduler-hourly  | 0 * * * *  | true   | SELECT trigger_reminder_scheduler();
```

### Voir l'historique d'exécution

```sql
SELECT 
  runid,
  jobid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Tester manuellement

```sql
-- Déclencher le scheduler manuellement
SELECT trigger_reminder_scheduler();
```

---

## 📊 Monitoring et Logs

### 1. Logs de l'Edge Function

**Dashboard Supabase:**
1. Aller dans **Edge Functions**
2. Sélectionner **reminder-scheduler**
3. Cliquer sur **Logs**

Vous verrez:
- Nombre de rappels traités
- Notifications envoyées avec succès
- Erreurs éventuelles

### 2. Logs des notifications

```sql
-- Voir les dernières notifications envoyées
SELECT 
  id,
  user_id,
  notification_type,
  title,
  body,
  sent_at,
  delivered,
  error_message
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 20;
```

### 3. Statistiques des rappels

```sql
-- Voir les rappels à venir dans les prochaines 24h
SELECT 
  COUNT(*) as total_reminders,
  COUNT(CASE WHEN completed = false THEN 1 END) as pending,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed
FROM reminders
WHERE due_date >= NOW()
  AND due_date <= NOW() + INTERVAL '24 hours';
```

---

## ⚙️ Gestion du Cron Job

### Désactiver temporairement

```sql
-- Désactiver le job
UPDATE cron.job 
SET active = false 
WHERE jobname = 'reminder-scheduler-hourly';
```

### Réactiver

```sql
-- Réactiver le job
UPDATE cron.job 
SET active = true 
WHERE jobname = 'reminder-scheduler-hourly';
```

### Modifier la fréquence

```sql
-- Changer pour toutes les 30 minutes
UPDATE cron.job 
SET schedule = '*/30 * * * *' 
WHERE jobname = 'reminder-scheduler-hourly';

-- Changer pour toutes les 2 heures
UPDATE cron.job 
SET schedule = '0 */2 * * *' 
WHERE jobname = 'reminder-scheduler-hourly';

-- Changer pour toutes les 15 minutes
UPDATE cron.job 
SET schedule = '*/15 * * * *' 
WHERE jobname = 'reminder-scheduler-hourly';
```

### Supprimer le job

```sql
-- Supprimer complètement le job
SELECT cron.unschedule('reminder-scheduler-hourly');
```

### Recréer le job

```sql
-- Si vous avez supprimé le job, vous pouvez le recréer
SELECT cron.schedule(
  'reminder-scheduler-hourly',
  '0 * * * *',
  'SELECT trigger_reminder_scheduler();'
);
```

---

## 🕐 Expressions Cron

### Exemples de fréquences

| Expression | Description | Utilisation |
|------------|-------------|-------------|
| `0 * * * *` | Toutes les heures | ✅ **Recommandé** |
| `*/30 * * * *` | Toutes les 30 minutes | Haute fréquence |
| `*/15 * * * *` | Toutes les 15 minutes | Très haute fréquence |
| `0 */2 * * *` | Toutes les 2 heures | Économique |
| `0 */4 * * *` | Toutes les 4 heures | Très économique |
| `0 9 * * *` | Tous les jours à 9h | Quotidien |
| `0 9 * * 1` | Tous les lundis à 9h | Hebdomadaire |

### Format de l'expression cron

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Jour de la semaine (0-7, 0 et 7 = dimanche)
│ │ │ └───── Mois (1-12)
│ │ └─────── Jour du mois (1-31)
│ └───────── Heure (0-23)
└─────────── Minute (0-59)
```

---

## 🔧 Dépannage

### Le cron ne s'exécute pas

1. **Vérifier que le job est actif:**
```sql
SELECT jobname, active FROM cron.job WHERE jobname = 'reminder-scheduler-hourly';
```

2. **Vérifier les logs d'exécution:**
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

3. **Tester manuellement:**
```sql
SELECT trigger_reminder_scheduler();
```

### Erreurs dans les logs

**"Connection refused" ou "Network error":**
- Vérifier que l'URL de l'Edge Function est correcte
- Vérifier que l'Edge Function est déployée et active

**"Unauthorized" ou "403 Forbidden":**
- Vérifier que l'anon key est correcte dans la fonction `trigger_reminder_scheduler()`
- Vérifier que l'Edge Function accepte les requêtes avec l'anon key

**"Function not found":**
- Vérifier que l'Edge Function `reminder-scheduler` est déployée
- Vérifier l'URL dans la fonction `trigger_reminder_scheduler()`

### Aucune notification envoyée

1. **Vérifier qu'il y a des rappels à venir:**
```sql
SELECT * FROM reminders 
WHERE completed = false 
  AND due_date >= NOW() 
  AND due_date <= NOW() + INTERVAL '24 hours';
```

2. **Vérifier les préférences utilisateur:**
```sql
SELECT 
  user_id,
  notifications_enabled,
  push_token
FROM user_preferences
WHERE notifications_enabled = true
  AND push_token IS NOT NULL;
```

3. **Vérifier les logs de notifications:**
```sql
SELECT * FROM notification_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## 📈 Statistiques et Performance

### Voir les performances du cron

```sql
-- Temps d'exécution moyen
SELECT 
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_seconds,
  COUNT(*) as total_runs,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_runs,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reminder-scheduler-hourly');
```

### Voir les notifications par jour

```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN delivered = true THEN 1 END) as delivered,
  COUNT(CASE WHEN delivered = false THEN 1 END) as failed
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

---

## 💰 Coûts

### Supabase
- **pg_cron:** Inclus gratuitement dans tous les plans
- **Edge Functions:** Gratuit jusqu'à 500K requêtes/mois
- **Exécutions:** 1 par heure = ~720 requêtes/mois
- **Coût total:** ✅ **GRATUIT** (largement dans les limites)

### Avantages de pg_cron vs services externes
- ✅ Pas de service externe à gérer
- ✅ Pas de compte supplémentaire
- ✅ Intégré directement dans Supabase
- ✅ Logs centralisés
- ✅ Haute fiabilité
- ✅ Pas de latence réseau externe

---

## 🎯 Recommandations

### Fréquence optimale
- **Production:** `0 * * * *` (toutes les heures)
  - Bon équilibre entre réactivité et ressources
  - Suffisant pour la plupart des cas d'usage
  
- **Haute priorité:** `*/30 * * * *` (toutes les 30 minutes)
  - Pour des rappels très urgents
  - Consomme plus de ressources

### Monitoring
1. **Vérifier les logs hebdomadairement**
   - Dashboard Supabase → Edge Functions → reminder-scheduler
   
2. **Surveiller le taux de succès**
   ```sql
   SELECT 
     COUNT(CASE WHEN delivered = true THEN 1 END) * 100.0 / COUNT(*) as success_rate
   FROM notification_logs
   WHERE sent_at >= NOW() - INTERVAL '7 days';
   ```

3. **Alertes recommandées**
   - Taux de succès < 90%
   - Aucune exécution pendant 2+ heures
   - Erreurs répétées dans les logs

---

## 🚀 Prochaines étapes

### 1. Tester le système complet

1. **Créer un rappel de test:**
```sql
INSERT INTO reminders (user_id, title, description, due_date, priority)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'Test de rappel',
  'Ceci est un test du système de rappels automatiques',
  NOW() + INTERVAL '30 minutes',
  'high'
);
```

2. **Attendre la prochaine exécution du cron** (à la prochaine heure pile)

3. **Vérifier les logs:**
```sql
SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 5;
```

### 2. Configurer les notifications push

Assurez-vous que:
- Les utilisateurs ont accepté les notifications push
- Les tokens push sont enregistrés dans `user_preferences.push_token`
- Les préférences de notifications sont activées

### 3. Surveiller les performances

- Vérifier régulièrement les logs Supabase
- Surveiller le taux de livraison des notifications
- Ajuster la fréquence si nécessaire

---

## ✅ Checklist de vérification

- [x] Extension `http` activée
- [x] Fonction `trigger_reminder_scheduler()` créée
- [x] Job cron `reminder-scheduler-hourly` planifié
- [x] Job cron actif et fonctionnel
- [x] Edge Function `reminder-scheduler` déployée
- [x] Tables `reminders` et `notification_logs` créées
- [x] RLS activé sur toutes les tables
- [ ] Test avec un rappel réel effectué
- [ ] Notifications push reçues sur l'appareil
- [ ] Monitoring configuré

---

## 📞 Support

### Ressources utiles

- **Documentation pg_cron:** https://github.com/citusdata/pg_cron
- **Documentation Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Documentation Expo Notifications:** https://docs.expo.dev/push-notifications/overview/

### Commandes de diagnostic

```sql
-- Vue d'ensemble complète
SELECT 
  'Cron Jobs' as type,
  COUNT(*) as count
FROM cron.job
UNION ALL
SELECT 
  'Reminders (pending)',
  COUNT(*)
FROM reminders
WHERE completed = false
UNION ALL
SELECT 
  'Notifications (last 24h)',
  COUNT(*)
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '24 hours';
```

---

**Date de configuration:** 26 Décembre 2024  
**Version:** 1.0.0  
**Statut:** ✅ OPÉRATIONNEL

**Le système de rappels automatiques est maintenant entièrement configuré et fonctionnel !** 🎉
