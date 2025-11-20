
# 🧪 Guide de Test des Emails

## Test Rapide - Tous les Workflows

Ce guide vous permet de tester rapidement tous les workflows d'emails automatiques.

---

## 🚀 Préparation

### 1. Vérifier la Configuration

```sql
-- Vérifier que tous les triggers sont actifs
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  CASE WHEN t.tgenabled = 'O' THEN '✅ Actif' ELSE '❌ Inactif' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname LIKE '%notify%'
ORDER BY c.relname, t.tgname;
```

### 2. Préparer une Adresse Email de Test

Remplacez `YOUR_TEST_EMAIL@example.com` par votre adresse email personnelle dans tous les tests ci-dessous.

---

## 📧 Tests des Workflows

### Test 1: Demande de Devis

```sql
-- Créer un devis de test
INSERT INTO freight_quotes (
  client_email,
  client_name,
  origin_port,
  destination_port,
  cargo_type,
  volume_details,
  incoterm,
  desired_eta
) VALUES (
  'YOUR_TEST_EMAIL@example.com',
  'Test Client',
  (SELECT id FROM ports WHERE country = 'France' LIMIT 1),
  (SELECT id FROM ports WHERE country = 'Morocco' LIMIT 1),
  'Conteneurs 40HC',
  '2 x 40HC',
  'FOB',
  NOW() + INTERVAL '30 days'
);

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'quote_created' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Votre demande de devis – Universal Shipping Services"
- Contenu : Détails du devis, ports, cargo

---

### Test 2: Devis Envoyé avec Prix

```sql
-- Récupérer l'ID du dernier devis créé
DO $$
DECLARE
  last_quote_id uuid;
BEGIN
  SELECT id INTO last_quote_id 
  FROM freight_quotes 
  ORDER BY created_at DESC LIMIT 1;
  
  -- Mettre à jour le devis avec un prix
  UPDATE freight_quotes
  SET 
    status = 'sent_to_client',
    quoted_price = 2500.00,
    quote_amount = 2500.00,
    currency = 'EUR',
    quote_currency = 'EUR',
    can_pay_online = true
  WHERE id = last_quote_id;
  
  RAISE NOTICE 'Devis mis à jour: %', last_quote_id;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'quote_sent_to_client' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Votre devis est prêt – Universal Shipping Services"
- Contenu : Prix 2,500.00 EUR, bouton "Accepter et payer"

---

### Test 3: Candidature Agent

```sql
-- Créer une candidature agent de test
INSERT INTO global_agents (
  company_name,
  port,
  activities,
  years_experience,
  email,
  whatsapp,
  website,
  certifications
) VALUES (
  'Test Shipping Agency',
  (SELECT id FROM ports WHERE country = 'Morocco' LIMIT 1),
  ARRAY['consignation', 'customs', 'freight_forwarding']::agent_activity[],
  10,
  'YOUR_TEST_EMAIL@example.com',
  '+212612345678',
  'https://testshipping.com',
  'ISO 9001, FIATA'
);

-- Note: L'email est envoyé via l'Edge Function notify-agent-application
-- Vérifier les logs de l'Edge Function pour confirmer
```

**Email attendu :**
- Sujet : "Votre candidature a été reçue – Universal Shipping Services"
- Contenu : Confirmation de réception, délai de traitement

---

### Test 4: Agent Validé

```sql
-- Valider le dernier agent créé
DO $$
DECLARE
  last_agent_id uuid;
BEGIN
  SELECT id INTO last_agent_id 
  FROM global_agents 
  ORDER BY created_at DESC LIMIT 1;
  
  -- Changer le statut à 'validated'
  UPDATE global_agents
  SET 
    status = 'validated',
    is_premium_listing = true
  WHERE id = last_agent_id;
  
  RAISE NOTICE 'Agent validé: %', last_agent_id;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'agent_validated' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Votre candidature a été approuvée – Universal Shipping Services"
- Contenu : Félicitations, statut validé, type premium

---

### Test 5: Création de Compte

```sql
-- Créer un compte client de test
-- Note: Nécessite un user_id valide de auth.users
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Récupérer un user_id existant ou créer un nouveau
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'Aucun utilisateur trouvé. Créez d''abord un utilisateur via l''interface.';
  ELSE
    -- Créer le client
    INSERT INTO clients (
      user_id,
      company_name,
      contact_name,
      email,
      phone,
      country,
      city,
      sector
    ) VALUES (
      test_user_id,
      'Test Company Ltd',
      'John Doe',
      'YOUR_TEST_EMAIL@example.com',
      '+33612345678',
      'France',
      'Paris',
      'Import/Export'
    );
    
    RAISE NOTICE 'Client créé pour user: %', test_user_id;
  END IF;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'account_created' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Bienvenue sur Universal Shipping Services"
- Contenu : Message de bienvenue, fonctionnalités disponibles

---

### Test 6: Abonnement Activé

```sql
-- Créer et activer un abonnement de test
DO $$
DECLARE
  test_client_id uuid;
  test_subscription_id uuid;
BEGIN
  -- Récupérer un client existant
  SELECT id INTO test_client_id FROM clients LIMIT 1;
  
  IF test_client_id IS NULL THEN
    RAISE NOTICE 'Aucun client trouvé. Créez d''abord un client.';
  ELSE
    -- Créer l'abonnement
    INSERT INTO subscriptions (
      client,
      plan_type,
      start_date,
      end_date,
      is_active,
      status
    ) VALUES (
      test_client_id,
      'premium_tracking',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year',
      true,
      'active'
    ) RETURNING id INTO test_subscription_id;
    
    RAISE NOTICE 'Abonnement créé et activé: %', test_subscription_id;
  END IF;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'subscription_activated' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Votre accès est actif – Universal Shipping Services"
- Contenu : Plan Premium Tracking, fonctionnalités incluses

---

### Test 7: Expédition Créée

```sql
-- Créer une expédition de test
DO $$
DECLARE
  test_client_id uuid;
  test_origin_port uuid;
  test_dest_port uuid;
BEGIN
  -- Récupérer les IDs nécessaires
  SELECT id INTO test_client_id FROM clients LIMIT 1;
  SELECT id INTO test_origin_port FROM ports WHERE country = 'France' LIMIT 1;
  SELECT id INTO test_dest_port FROM ports WHERE country = 'Morocco' LIMIT 1;
  
  IF test_client_id IS NULL THEN
    RAISE NOTICE 'Aucun client trouvé. Créez d''abord un client.';
  ELSE
    -- Créer l'expédition
    INSERT INTO shipments (
      tracking_number,
      client,
      origin_port,
      destination_port,
      cargo_type,
      container_type,
      incoterm,
      current_status,
      eta
    ) VALUES (
      'TEST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      test_client_id,
      test_origin_port,
      test_dest_port,
      'Conteneurs',
      'FCL_40HC',
      'FOB',
      'confirmed',
      NOW() + INTERVAL '15 days'
    );
    
    RAISE NOTICE 'Expédition créée';
  END IF;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'shipment_created' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Nouvelle expédition créée - [TRACKING_NUMBER]"
- Contenu : Numéro de suivi, statut

---

### Test 8: Changement de Statut d'Expédition

```sql
-- Mettre à jour le statut de la dernière expédition
DO $$
DECLARE
  last_shipment_id uuid;
BEGIN
  SELECT id INTO last_shipment_id 
  FROM shipments 
  ORDER BY created_at DESC LIMIT 1;
  
  IF last_shipment_id IS NULL THEN
    RAISE NOTICE 'Aucune expédition trouvée. Créez d''abord une expédition.';
  ELSE
    -- Changer le statut
    UPDATE shipments
    SET current_status = 'in_transit'
    WHERE id = last_shipment_id;
    
    RAISE NOTICE 'Statut mis à jour pour: %', last_shipment_id;
  END IF;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'shipment_status_changed' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Mise à jour de votre expédition - [TRACKING_NUMBER]"
- Contenu : Ancien statut → Nouveau statut

---

### Test 9: Abonnement Expiré

```sql
-- Expirer le dernier abonnement
DO $$
DECLARE
  last_subscription_id uuid;
BEGIN
  SELECT id INTO last_subscription_id 
  FROM subscriptions 
  WHERE is_active = true
  ORDER BY created_at DESC LIMIT 1;
  
  IF last_subscription_id IS NULL THEN
    RAISE NOTICE 'Aucun abonnement actif trouvé.';
  ELSE
    -- Désactiver l'abonnement
    UPDATE subscriptions
    SET 
      is_active = false,
      status = 'expired',
      end_date = CURRENT_DATE - INTERVAL '1 day'
    WHERE id = last_subscription_id;
    
    RAISE NOTICE 'Abonnement expiré: %', last_subscription_id;
  END IF;
END $$;

-- Vérifier que l'email a été créé
SELECT * FROM email_notifications 
WHERE email_type = 'subscription_expired' 
ORDER BY created_at DESC LIMIT 1;
```

**Email attendu :**
- Sujet : "Votre abonnement a expiré – Universal Shipping Services"
- Contenu : Date d'expiration, bouton renouveler

---

## 📊 Vérification Globale

### Voir Tous les Emails Créés

```sql
SELECT 
  email_type,
  recipient_email,
  subject,
  status,
  created_at,
  sent_at,
  error_message
FROM email_notifications
ORDER BY created_at DESC
LIMIT 20;
```

### Statistiques par Type

```sql
SELECT 
  email_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_notifications
GROUP BY email_type
ORDER BY total DESC;
```

---

## 🚀 Traiter les Emails en Attente

### Appeler l'Edge Function Manuellement

```bash
# Remplacez YOUR_ANON_KEY par votre clé Supabase
curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Voir les Logs de l'Edge Function

1. Aller sur le Dashboard Supabase
2. Edge Functions → process-email-notifications
3. Onglet "Logs"
4. Vérifier les emails traités

---

## 🧹 Nettoyage Après Tests

```sql
-- Supprimer tous les emails de test
DELETE FROM email_notifications 
WHERE recipient_email = 'YOUR_TEST_EMAIL@example.com';

-- Supprimer les devis de test
DELETE FROM freight_quotes 
WHERE client_email = 'YOUR_TEST_EMAIL@example.com';

-- Supprimer les agents de test
DELETE FROM global_agents 
WHERE email = 'YOUR_TEST_EMAIL@example.com';

-- Note: Soyez prudent avec les suppressions en production !
```

---

## ✅ Checklist de Test

- [ ] Test 1: Demande de devis → Email créé
- [ ] Test 2: Devis envoyé avec prix → Email créé
- [ ] Test 3: Candidature agent → Email créé
- [ ] Test 4: Agent validé → Email créé
- [ ] Test 5: Création de compte → Email créé
- [ ] Test 6: Abonnement activé → Email créé
- [ ] Test 7: Expédition créée → Email créé
- [ ] Test 8: Changement de statut → Email créé
- [ ] Test 9: Abonnement expiré → Email créé
- [ ] Tous les emails utilisent contact@universalshipping.com
- [ ] Tous les sujets sont clairs et en français
- [ ] Tous les emails contiennent un lien vers l'app
- [ ] Edge Function traite les emails sans erreur

---

## 🆘 Dépannage

### Les Emails ne Sont Pas Créés

1. Vérifier que les triggers sont actifs :
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';
```

2. Vérifier les logs PostgreSQL :
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Les Emails Restent en "Pending"

1. Appeler manuellement l'Edge Function (voir ci-dessus)
2. Vérifier les logs de l'Edge Function
3. Vérifier que la clé API email est configurée (si envoi réel activé)

### Erreurs dans l'Edge Function

1. Vérifier les logs dans le Dashboard Supabase
2. Vérifier que SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis
3. Redéployer l'Edge Function si nécessaire

---

**Bon test ! 🚀**
