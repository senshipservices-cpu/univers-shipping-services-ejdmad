
# 📧 Audit des Emails et Workflows Automatiques

## ✅ Statut Global : COMPLET

Tous les workflows d'emails automatiques ont été implémentés et configurés pour utiliser l'adresse professionnelle **contact@universalshipping.com** avec le nom d'expéditeur **"Universal Shipping Services"**.

---

## 📋 Configuration Email

### ✅ Adresse d'Expédition
- **Email :** `contact@universalshipping.com`
- **Nom :** `Universal Shipping Services`
- **Statut :** ✅ Configuré dans l'Edge Function

### 📝 Service d'Envoi
- **Statut actuel :** En mode test (logs console)
- **Services supportés :** Resend, SendGrid, AWS SES
- **Action requise :** Configurer une clé API pour activer l'envoi réel

---

## 🔄 Workflows Implémentés

### 1. ✅ Demande de Devis (Quote Created)

**Déclencheur :** Création d'un nouveau devis dans `freight_quotes`

**Email envoyé :**
- **À :** Email du client (ou email fourni dans le formulaire)
- **Sujet :** "Votre demande de devis – Universal Shipping Services"
- **Contenu :**
  - Nom du client
  - Port d'origine et destination
  - Type de cargo
  - Volume et détails
  - Incoterm
  - Date souhaitée
  - Lien vers l'espace client

**Implémentation :**
- Trigger : `trigger_notify_freight_quote_created`
- Fonction : `notify_freight_quote_created()`
- Type d'email : `quote_created`

**Test :**
```sql
-- Créer un devis de test
INSERT INTO freight_quotes (
  client_email,
  client_name,
  origin_port,
  destination_port,
  cargo_type,
  volume_details
) VALUES (
  'test@example.com',
  'Test Client',
  (SELECT id FROM ports LIMIT 1),
  (SELECT id FROM ports OFFSET 1 LIMIT 1),
  'Conteneurs',
  '2 x 40HC'
);

-- Vérifier l'email créé
SELECT * FROM email_notifications WHERE email_type = 'quote_created' ORDER BY created_at DESC LIMIT 1;
```

---

### 2. ✅ Devis Envoyé au Client (Quote Sent with Price)

**Déclencheur :** Changement du statut du devis à `sent_to_client`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Votre devis est prêt – Universal Shipping Services"
- **Contenu :**
  - Nom du client
  - Détails du trajet
  - Type de cargo et volume
  - **Prix du devis** (montant et devise)
  - Incoterm
  - Bouton "Accepter et payer" (si paiement en ligne activé)
  - Lien vers l'espace client

**Implémentation :**
- Trigger : `trigger_notify_quote_sent_to_client`
- Fonction : `notify_quote_sent_to_client()`
- Type d'email : `quote_sent_to_client`

**Test :**
```sql
-- Mettre à jour un devis existant
UPDATE freight_quotes
SET 
  status = 'sent_to_client',
  quoted_price = 2500.00,
  currency = 'EUR',
  can_pay_online = true
WHERE id = 'YOUR_QUOTE_ID';

-- Vérifier l'email créé
SELECT * FROM email_notifications WHERE email_type = 'quote_sent_to_client' ORDER BY created_at DESC LIMIT 1;
```

---

### 3. ✅ Candidature Agent (Agent Application)

**Déclencheur :** Soumission d'une candidature dans `global_agents`

**Email envoyé :**
- **À :** Email de l'agent candidat
- **Sujet :** "Votre candidature a été reçue – Universal Shipping Services"
- **Contenu :**
  - Nom de l'entreprise
  - Port sélectionné
  - Activités
  - Message de confirmation
  - Délai de traitement

**Implémentation :**
- Trigger : Existant (via Edge Function `notify-agent-application`)
- Type d'email : `agent_application_received`

**Test :**
```sql
-- Créer une candidature de test
INSERT INTO global_agents (
  company_name,
  port,
  activities,
  email,
  whatsapp
) VALUES (
  'Test Shipping Co.',
  (SELECT id FROM ports LIMIT 1),
  ARRAY['consignation', 'customs']::agent_activity[],
  'agent@test.com',
  '+33612345678'
);
```

---

### 4. ✅ Abonnement Activé (Subscription Activated)

**Déclencheur :** Changement de `is_active` de `false` à `true` dans `subscriptions`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Votre accès est actif – Universal Shipping Services"
- **Contenu :**
  - Nom du client et entreprise
  - Type de plan
  - Date de début et fin
  - **Liste des fonctionnalités incluses**
  - Bouton "Accéder à mon espace"
  - Lien vers l'application

**Implémentation :**
- Trigger : `trigger_notify_subscription_activated`
- Fonction : `notify_subscription_activated()`
- Type d'email : `subscription_activated`

**Test :**
```sql
-- Activer un abonnement
UPDATE subscriptions
SET is_active = true
WHERE id = 'YOUR_SUBSCRIPTION_ID';

-- Vérifier l'email créé
SELECT * FROM email_notifications WHERE email_type = 'subscription_activated' ORDER BY created_at DESC LIMIT 1;
```

---

### 5. ✅ Création de Compte (Account Created)

**Déclencheur :** Création d'un nouveau client dans `clients`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Bienvenue sur Universal Shipping Services"
- **Contenu :**
  - Message de bienvenue
  - Nom de l'entreprise
  - Liste des fonctionnalités disponibles
  - Bouton "Découvrir mon espace"
  - Lien vers l'application

**Implémentation :**
- Trigger : `trigger_notify_account_created`
- Fonction : `notify_account_created()`
- Type d'email : `account_created`

**Test :**
```sql
-- Créer un compte client de test
INSERT INTO clients (
  user_id,
  company_name,
  contact_name,
  email
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test Company',
  'John Doe',
  'john@testcompany.com'
);

-- Vérifier l'email créé
SELECT * FROM email_notifications WHERE email_type = 'account_created' ORDER BY created_at DESC LIMIT 1;
```

---

### 6. ✅ Création d'Expédition (Shipment Created)

**Déclencheur :** Création d'une nouvelle expédition dans `shipments`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Nouvelle expédition créée - [TRACKING_NUMBER]"
- **Contenu :**
  - Numéro de suivi
  - Statut actuel
  - Lien vers le suivi

**Implémentation :**
- Trigger : `trigger_notify_shipment_created`
- Fonction : `notify_shipment_created()`
- Type d'email : `shipment_created`

**Statut :** ✅ Déjà implémenté

---

### 7. ✅ Changement de Statut d'Expédition (Shipment Status Changed)

**Déclencheur :** Modification du `current_status` dans `shipments`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Mise à jour de votre expédition - [TRACKING_NUMBER]"
- **Contenu :**
  - Numéro de suivi
  - Ancien statut
  - Nouveau statut
  - ETA (si disponible)
  - Lien vers le suivi

**Implémentation :**
- Trigger : `trigger_notify_shipment_status_changed`
- Fonction : `notify_shipment_status_changed()`
- Type d'email : `shipment_status_changed`

**Statut :** ✅ Déjà implémenté

---

### 8. ✅ Agent Validé (Agent Validated)

**Déclencheur :** Changement du statut à `validated` dans `global_agents`

**Email envoyé :**
- **À :** Email de l'agent
- **Sujet :** "Votre candidature a été approuvée – Universal Shipping Services"
- **Contenu :**
  - Message de félicitations
  - Nom de l'entreprise
  - Statut validé
  - Type de listing (premium ou standard)
  - Message de bienvenue

**Implémentation :**
- Trigger : `trigger_notify_agent_validated`
- Fonction : `notify_agent_validated()`
- Type d'email : `agent_validated`

**Statut :** ✅ Déjà implémenté

---

### 9. ✅ Abonnement Expiré (Subscription Expired)

**Déclencheur :** Changement de `is_active` de `true` à `false` dans `subscriptions`

**Email envoyé :**
- **À :** Email du client
- **Sujet :** "Votre abonnement a expiré – Universal Shipping Services"
- **Contenu :**
  - Type de plan
  - Date d'expiration
  - Bouton "Renouveler mon abonnement"
  - Lien vers la page pricing

**Implémentation :**
- Trigger : `trigger_notify_subscription_expired`
- Fonction : `notify_subscription_expired()`
- Type d'email : `subscription_expired`

**Test :**
```sql
-- Expirer un abonnement
UPDATE subscriptions
SET is_active = false
WHERE id = 'YOUR_SUBSCRIPTION_ID';

-- Vérifier l'email créé
SELECT * FROM email_notifications WHERE email_type = 'subscription_expired' ORDER BY created_at DESC LIMIT 1;
```

---

## 📧 Templates Email

### ✅ Langues Disponibles
- **Français :** ✅ Tous les templates
- **Anglais :** ⚠️ À implémenter (structure prête)

### ✅ Éléments Communs à Tous les Emails

**Header :**
- Logo Universal Shipping Services (dégradé bleu)
- Slogan : "Global Maritime & Logistics Solutions"

**Footer :**
- Nom de l'entreprise
- Email de contact : contact@universalshipping.com
- Lien vers le site web
- Mention légale

**Design :**
- Couleurs de la marque (#002C5F, #0084FF, #00C2FF)
- Responsive (adapté mobile)
- Boutons CTA clairs et visibles

---

## 🧪 Tests Réalisés

### ✅ Tests de Création d'Emails

| Workflow | Test | Résultat |
|----------|------|----------|
| Quote Created | ✅ | Email créé dans `email_notifications` |
| Quote Sent to Client | ✅ | Email créé avec prix |
| Agent Application | ✅ | Email créé via Edge Function |
| Subscription Activated | ✅ | Email créé avec détails du plan |
| Account Created | ✅ | Email de bienvenue créé |
| Shipment Created | ✅ | Email créé avec tracking |
| Shipment Status Changed | ✅ | Email créé avec ancien/nouveau statut |
| Agent Validated | ✅ | Email de félicitations créé |
| Subscription Expired | ✅ | Email d'expiration créé |

### ⚠️ Tests d'Envoi Réel

**Statut :** En attente de configuration du service d'envoi

**Pour tester l'envoi réel :**

1. Configurer une clé API (Resend recommandé)
2. Ajouter la clé dans les secrets Supabase
3. Décommenter le code d'envoi dans l'Edge Function
4. Redéployer l'Edge Function
5. Tester avec une adresse email personnelle

---

## 📊 Statistiques

### Emails dans la Queue

```sql
-- Voir les emails en attente
SELECT 
  email_type,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM email_notifications
WHERE status = 'pending'
GROUP BY email_type;
```

### Emails Envoyés

```sql
-- Voir les emails envoyés
SELECT 
  email_type,
  COUNT(*) as count,
  MAX(sent_at) as last_sent
FROM email_notifications
WHERE status = 'sent'
GROUP BY email_type
ORDER BY count DESC;
```

### Emails Échoués

```sql
-- Voir les emails en erreur
SELECT 
  email_type,
  error_message,
  COUNT(*) as count
FROM email_notifications
WHERE status = 'failed'
GROUP BY email_type, error_message;
```

---

## 🚀 Prochaines Étapes

### 1. Activer l'Envoi Réel d'Emails

**Option A : Resend (Recommandé)**
```bash
# 1. Créer un compte sur https://resend.com
# 2. Obtenir une clé API
# 3. Configurer dans Supabase
supabase secrets set RESEND_API_KEY=re_your_key_here

# 4. L'Edge Function est déjà configurée, il suffit de décommenter le code
```

**Option B : SendGrid**
```bash
supabase secrets set SENDGRID_API_KEY=SG.your_key_here
```

**Option C : AWS SES**
```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret
supabase secrets set AWS_REGION=us-east-1
```

### 2. Vérifier le Domaine

Pour éviter que les emails soient marqués comme spam :
- Vérifier le domaine `universalshipping.com` avec le service d'envoi
- Configurer les enregistrements DNS (SPF, DKIM, DMARC)

### 3. Tester en Conditions Réelles

```bash
# Appeler l'Edge Function pour traiter les emails en attente
curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 4. Automatiser le Traitement

Configurer un cron job pour traiter les emails automatiquement :
```sql
-- Traiter les emails toutes les 5 minutes
SELECT cron.schedule(
  'process-emails-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### 5. Ajouter la Version Anglaise

Créer des templates en anglais pour tous les types d'emails en détectant la langue préférée du client.

---

## 📝 Résumé

### ✅ Emails OK (Workflows Implémentés)

1. ✅ **Demande de devis** - Confirmation envoyée au client
2. ✅ **Devis envoyé** - Email avec le prix
3. ✅ **Candidature agent** - Confirmation de réception
4. ✅ **Abonnement activé** - Email "Votre accès est actif"
5. ✅ **Création de compte** - Email de bienvenue
6. ✅ **Expédition créée** - Notification avec tracking
7. ✅ **Statut expédition** - Mise à jour du statut
8. ✅ **Agent validé** - Félicitations
9. ✅ **Abonnement expiré** - Notification d'expiration

### ⚠️ Actions Requises

1. **Configurer un service d'envoi d'emails** (Resend, SendGrid, ou AWS SES)
2. **Vérifier le domaine** pour améliorer la délivrabilité
3. **Tester l'envoi réel** avec une adresse personnelle
4. **Automatiser le traitement** avec un cron job
5. **Ajouter les templates en anglais** (optionnel)

### 📈 Métriques

- **Workflows implémentés :** 9/9 (100%)
- **Templates français :** 9/9 (100%)
- **Templates anglais :** 0/9 (0%)
- **Configuration email :** ✅ Complète
- **Envoi réel :** ⚠️ En attente de clé API

---

## 🆘 Support

### Vérifier les Triggers

```sql
-- Lister tous les triggers email
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE '%notify%'
ORDER BY c.relname, t.tgname;
```

### Vérifier les Emails en Attente

```sql
-- Voir les 10 derniers emails créés
SELECT 
  email_type,
  recipient_email,
  subject,
  status,
  created_at
FROM email_notifications
ORDER BY created_at DESC
LIMIT 10;
```

### Forcer le Traitement

```sql
-- Marquer tous les emails 'failed' comme 'pending' pour réessayer
UPDATE email_notifications
SET status = 'pending', error_message = NULL
WHERE status = 'failed';
```

---

**Date de l'audit :** 2024-01-18  
**Version :** 1.0  
**Statut :** ✅ COMPLET - Prêt pour l'activation
