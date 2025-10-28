
# 🕐 Configuration du Cron Job pour les Rappels

## Objectif

Le système de rappels automatiques nécessite l'exécution périodique de l'Edge Function `reminder-scheduler` pour envoyer les notifications push aux utilisateurs.

---

## Option 1: Cron Job Externe (Recommandé)

### Utiliser un service de cron externe

**Services recommandés:**
- [cron-job.org](https://cron-job.org) - Gratuit, fiable
- [EasyCron](https://www.easycron.com) - Gratuit jusqu'à 100 tâches
- [Cronitor](https://cronitor.io) - Monitoring inclus

### Configuration

1. **Créer un compte** sur un service de cron

2. **Ajouter une nouvelle tâche:**
   - **URL:** `https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler`
   - **Méthode:** POST
   - **Headers:**
     ```
     Authorization: Bearer [VOTRE_ANON_KEY]
     Content-Type: application/json
     ```
   - **Fréquence:** Toutes les heures (recommandé)
   - **Body:** `{}` (vide)

3. **Tester** la tâche manuellement

4. **Activer** la tâche

### Exemple avec cURL

```bash
curl -X POST \
  https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler \
  -H "Authorization: Bearer [VOTRE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Option 2: Supabase Database Webhooks

### Utiliser pg_cron (si disponible)

**Note:** pg_cron n'est pas disponible sur tous les plans Supabase.

```sql
-- Créer une fonction qui appelle l'Edge Function
CREATE OR REPLACE FUNCTION trigger_reminder_scheduler()
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer [VOTRE_SERVICE_ROLE_KEY]',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Planifier l'exécution toutes les heures
SELECT cron.schedule(
  'reminder-scheduler-hourly',
  '0 * * * *',
  'SELECT trigger_reminder_scheduler();'
);
```

---

## Option 3: Serveur Personnel

### Si vous avez un serveur Linux

1. **Ouvrir crontab:**
```bash
crontab -e
```

2. **Ajouter la ligne:**
```bash
0 * * * * curl -X POST https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler -H "Authorization: Bearer [VOTRE_ANON_KEY]" -H "Content-Type: application/json" -d '{}'
```

3. **Sauvegarder et quitter**

---

## Option 4: GitHub Actions (Gratuit)

### Utiliser GitHub Actions comme cron

1. **Créer `.github/workflows/reminder-scheduler.yml`:**

```yaml
name: Reminder Scheduler

on:
  schedule:
    # Toutes les heures
    - cron: '0 * * * *'
  workflow_dispatch: # Permet l'exécution manuelle

jobs:
  trigger-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reminder Scheduler
        run: |
          curl -X POST \
            https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

2. **Ajouter le secret:**
   - Aller dans Settings → Secrets → Actions
   - Ajouter `SUPABASE_ANON_KEY`

3. **Commit et push**

---

## Fréquences Recommandées

### Toutes les heures (Recommandé)
```
0 * * * *
```
- Bon équilibre entre réactivité et coût
- Notifications envoyées dans l'heure

### Toutes les 30 minutes (Haute fréquence)
```
*/30 * * * *
```
- Plus réactif
- Plus de requêtes

### Toutes les 4 heures (Économique)
```
0 */4 * * *
```
- Moins de requêtes
- Moins réactif

---

## Vérification

### Tester manuellement

```bash
curl -X POST \
  https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler \
  -H "Authorization: Bearer [VOTRE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Réponse attendue

```json
{
  "success": true,
  "processed": 5,
  "sent": 5,
  "failed": 0
}
```

### Vérifier les logs

1. **Supabase Dashboard:**
   - Edge Functions → reminder-scheduler → Logs

2. **Base de données:**
```sql
SELECT * FROM notification_logs
ORDER BY sent_at DESC
LIMIT 10;
```

---

## Monitoring

### Alertes recommandées

1. **Échecs répétés:**
   - Si `failed > 0` pendant plusieurs exécutions
   - Vérifier les logs

2. **Pas d'exécution:**
   - Si aucune exécution pendant 2+ heures
   - Vérifier le cron job

3. **Erreurs de livraison:**
   - Si `delivered = false` fréquent
   - Vérifier les tokens push

### Dashboard Supabase

- **Edge Functions → reminder-scheduler**
  - Invocations
  - Erreurs
  - Temps d'exécution

- **Database → notification_logs**
  - Historique complet
  - Taux de succès

---

## Dépannage

### Le cron ne s'exécute pas

1. Vérifier l'URL
2. Vérifier l'Authorization header
3. Vérifier la syntaxe cron
4. Tester manuellement avec cURL

### Notifications non envoyées

1. Vérifier `user_preferences.notifications_enabled`
2. Vérifier `user_preferences.push_token`
3. Vérifier les permissions Expo
4. Consulter `notification_logs.error_message`

### Erreurs dans les logs

1. **"Unauthorized":**
   - Vérifier l'anon key
   - Vérifier que verify_jwt est activé

2. **"No reminders to process":**
   - Normal si aucun rappel à venir
   - Vérifier la table `reminders`

3. **"Failed to send push notification":**
   - Vérifier le token push
   - Vérifier les permissions Expo

---

## Coûts

### Supabase
- Edge Functions: Gratuit jusqu'à 500K requêtes/mois
- 1 exécution/heure = ~720 requêtes/mois
- **Coût: Gratuit** (largement dans les limites)

### Services Cron Externes
- cron-job.org: **Gratuit**
- EasyCron: **Gratuit** (jusqu'à 100 tâches)
- GitHub Actions: **Gratuit** (2000 minutes/mois)

---

## Recommandation Finale

**Pour UneBox, nous recommandons:**

1. **Option 1: cron-job.org** (le plus simple)
   - Gratuit
   - Fiable
   - Monitoring inclus
   - Pas de serveur nécessaire

2. **Fréquence: Toutes les heures**
   - Bon équilibre
   - Suffisant pour les rappels

3. **Monitoring: Supabase Dashboard**
   - Vérifier les logs régulièrement
   - Configurer des alertes si possible

---

## Configuration Rapide (5 minutes)

1. Aller sur [cron-job.org](https://cron-job.org)
2. Créer un compte gratuit
3. Cliquer "Create cronjob"
4. Remplir:
   - Title: "UneBox Reminder Scheduler"
   - URL: `https://ctymgbwdvasdghxxhhvo.supabase.co/functions/v1/reminder-scheduler`
   - Schedule: "Every hour"
   - Request method: POST
   - Headers: `Authorization: Bearer [VOTRE_ANON_KEY]`
5. Sauvegarder et activer
6. Tester avec "Run now"

**C'est tout! Les rappels seront maintenant envoyés automatiquement.**

---

**Date:** 26 Décembre 2024  
**Version:** 1.0.0
