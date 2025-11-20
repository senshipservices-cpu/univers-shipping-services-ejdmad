
# 📧 Référence Rapide - Emails & Workflows

## Configuration Email

```
Expéditeur: contact@universalshipping.com
Nom: Universal Shipping Services
Statut: ✅ Configuré
```

## 9 Workflows Actifs

| # | Workflow | Déclencheur | Email Type | Statut |
|---|----------|-------------|------------|--------|
| 1 | Demande de devis | INSERT `freight_quotes` | `quote_created` | ✅ |
| 2 | Devis envoyé | UPDATE status → `sent_to_client` | `quote_sent_to_client` | ✅ |
| 3 | Candidature agent | INSERT `global_agents` | `agent_application_received` | ✅ |
| 4 | Agent validé | UPDATE status → `validated` | `agent_validated` | ✅ |
| 5 | Compte créé | INSERT `clients` | `account_created` | ✅ |
| 6 | Abonnement activé | UPDATE `is_active` → `true` | `subscription_activated` | ✅ |
| 7 | Abonnement expiré | UPDATE `is_active` → `false` | `subscription_expired` | ✅ |
| 8 | Expédition créée | INSERT `shipments` | `shipment_created` | ✅ |
| 9 | Statut expédition | UPDATE `current_status` | `shipment_status_changed` | ✅ |

## Commandes Rapides

### Voir les Emails en Attente
```sql
SELECT email_type, COUNT(*) 
FROM email_notifications 
WHERE status = 'pending' 
GROUP BY email_type;
```

### Traiter les Emails
```bash
curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Voir les Derniers Emails
```sql
SELECT email_type, recipient_email, subject, status, created_at
FROM email_notifications
ORDER BY created_at DESC
LIMIT 10;
```

## Activer l'Envoi Réel

### Option 1: Resend (Recommandé)
```bash
# 1. Créer compte sur https://resend.com
# 2. Obtenir clé API
# 3. Configurer
supabase secrets set RESEND_API_KEY=re_your_key

# 4. Décommenter le code dans l'Edge Function
# 5. Redéployer
supabase functions deploy process-email-notifications
```

### Option 2: SendGrid
```bash
supabase secrets set SENDGRID_API_KEY=SG.your_key
```

### Option 3: AWS SES
```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret
supabase secrets set AWS_REGION=us-east-1
```

## Test Rapide

```sql
-- Créer un devis de test
INSERT INTO freight_quotes (
  client_email, client_name, origin_port, destination_port, cargo_type
) VALUES (
  'test@example.com', 'Test', 
  (SELECT id FROM ports LIMIT 1),
  (SELECT id FROM ports OFFSET 1 LIMIT 1),
  'Test Cargo'
);

-- Vérifier l'email créé
SELECT * FROM email_notifications 
WHERE email_type = 'quote_created' 
ORDER BY created_at DESC LIMIT 1;
```

## Triggers Actifs

```sql
-- Vérifier tous les triggers
SELECT t.tgname, c.relname, p.proname
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE '%notify%'
ORDER BY c.relname;
```

## Statistiques

```sql
-- Emails par type et statut
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_notifications
GROUP BY email_type, status
ORDER BY email_type, status;
```

## Documentation Complète

- **Audit complet :** `docs/EMAIL_WORKFLOWS_AUDIT_REPORT.md`
- **Guide de test :** `docs/EMAIL_TESTING_GUIDE.md`
- **Intégration email :** `docs/EMAIL_SERVICE_INTEGRATION_GUIDE.md`
- **Système d'automation :** `docs/EMAIL_AUTOMATION_SYSTEM.md`

## Support

### Problème: Emails non créés
→ Vérifier les triggers avec la commande ci-dessus

### Problème: Emails non envoyés
→ Configurer une clé API et appeler l'Edge Function

### Problème: Emails en erreur
```sql
SELECT email_type, error_message, COUNT(*)
FROM email_notifications
WHERE status = 'failed'
GROUP BY email_type, error_message;
```

---

**Statut Global:** ✅ Tous les workflows sont opérationnels  
**Action requise:** Configurer un service d'envoi pour l'envoi réel
