
# Vérification de l'implémentation PayPal pour les devis

## 🔍 Checklist de vérification complète

### 1. Vérification de la base de données

#### Vérifier les colonnes de la table `freight_quotes`

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'freight_quotes'
  AND column_name IN (
    'quote_amount',
    'quote_currency',
    'status',
    'paypal_order_id',
    'paid_at',
    'payment_status'
  )
ORDER BY column_name;
```

**Résultat attendu** :
```
column_name       | data_type | is_nullable | column_default
------------------+-----------+-------------+---------------
paid_at           | timestamp | YES         | NULL
payment_status    | text      | YES         | 'pending'
paypal_order_id   | text      | YES         | NULL
quote_amount      | numeric   | YES         | NULL
quote_currency    | text      | YES         | 'EUR'
status            | enum      | NO          | 'received'
```

#### Vérifier les valeurs possibles du statut

```sql
SELECT 
  enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'freight_quote_status'
)
ORDER BY enumlabel;
```

**Résultat attendu** :
```
enumlabel
-----------------
accepted
cancelled
in_progress
paid
payment_pending
pending
priced
received
refused
sent_to_client
```

#### Vérifier les politiques RLS

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'freight_quotes'
ORDER BY policyname;
```

**Résultat attendu** : Plusieurs politiques incluant :
- Admins have full access
- Users can view their own quotes
- Users can update payment fields

---

### 2. Vérification des Edge Functions

#### Lister les Edge Functions

```bash
# Via Supabase CLI
supabase functions list

# Ou via API
curl https://[PROJECT_URL]/functions/v1/ \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

**Résultat attendu** :
```
✓ create-paypal-order (ACTIVE)
✓ capture-paypal-order (ACTIVE)
```

#### Tester `create-paypal-order`

```bash
curl -X POST https://[PROJECT_URL]/functions/v1/create-paypal-order \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID]",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'
```

**Résultat attendu** :
```json
{
  "ok": true,
  "order_id": "...",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "environment": "sandbox"
}
```

#### Tester `capture-paypal-order`

```bash
curl -X POST https://[PROJECT_URL]/functions/v1/capture-paypal-order \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID]"
  }'
```

**Résultat attendu** :
```json
{
  "ok": true,
  "new_status": "paid",
  "capture_id": "..."
}
```

---

### 3. Vérification des variables d'environnement

#### Dans Supabase Dashboard

Aller dans : **Project Settings > Edge Functions > Secrets**

Vérifier que les variables suivantes existent :

```
✓ PAYPAL_ENV
✓ PAYPAL_SANDBOX_CLIENT_ID
✓ PAYPAL_SANDBOX_SECRET
✓ PAYPAL_LIVE_CLIENT_ID (si mode live)
✓ PAYPAL_LIVE_SECRET (si mode live)
✓ SMTP_HOST
✓ SMTP_PORT
✓ SMTP_USERNAME
✓ SMTP_PASSWORD
✓ SMTP_FROM_EMAIL
```

#### Tester la configuration PayPal

```sql
-- Créer un devis de test
INSERT INTO freight_quotes (
  status,
  quote_amount,
  quote_currency,
  client_email,
  client_name,
  origin_port,
  destination_port,
  cargo_type
) VALUES (
  'priced',
  100.00,
  'EUR',
  'test@example.com',
  'Test User',
  (SELECT id FROM ports LIMIT 1),
  (SELECT id FROM ports LIMIT 1 OFFSET 1),
  'Test Cargo'
)
RETURNING id;
```

Utiliser l'ID retourné pour tester `create-paypal-order`.

---

### 4. Vérification du flux complet

#### Scénario de test complet

1. **Créer un devis de test**

```sql
INSERT INTO freight_quotes (
  status,
  quote_amount,
  quote_currency,
  client_email,
  client_name,
  cargo_type
) VALUES (
  'priced',
  50.00,
  'EUR',
  'test@example.com',
  'Test Client',
  'Test Cargo'
)
RETURNING id, status, quote_amount, quote_currency;
```

2. **Créer un ordre PayPal**

```bash
curl -X POST https://[PROJECT_URL]/functions/v1/create-paypal-order \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID_FROM_STEP_1]",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'
```

3. **Vérifier le statut du devis**

```sql
SELECT 
  id,
  status,
  payment_status,
  paypal_order_id,
  quote_amount,
  quote_currency
FROM freight_quotes
WHERE id = '[QUOTE_ID]';
```

**Résultat attendu** :
```
status: payment_pending
payment_status: pending
paypal_order_id: [PayPal Order ID]
```

4. **Payer sur PayPal Sandbox**

- Ouvrir l'URL `approval_url` dans un navigateur
- Se connecter avec un compte test PayPal Sandbox
- Compléter le paiement

5. **Capturer le paiement**

```bash
curl -X POST https://[PROJECT_URL]/functions/v1/capture-paypal-order \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID]"
  }'
```

6. **Vérifier le statut final**

```sql
SELECT 
  id,
  status,
  payment_status,
  paypal_order_id,
  paid_at,
  quote_amount,
  quote_currency
FROM freight_quotes
WHERE id = '[QUOTE_ID]';
```

**Résultat attendu** :
```
status: paid
payment_status: paid
paid_at: [timestamp]
```

---

### 5. Vérification des emails

#### Vérifier la configuration SMTP

```bash
curl -X POST https://[PROJECT_URL]/functions/v1/send-email \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

**Résultat attendu** :
```json
{
  "ok": true
}
```

#### Vérifier les logs d'email

```sql
SELECT 
  recipient_email,
  email_type,
  subject,
  status,
  sent_at,
  error_message
FROM email_notifications
ORDER BY sent_at DESC
LIMIT 10;
```

---

### 6. Vérification des logs

#### Logs des Edge Functions

Dans Supabase Dashboard : **Edge Functions > [Function Name] > Logs**

Rechercher :
- ✅ "Creating PayPal order"
- ✅ "PayPal order created"
- ✅ "Capturing PayPal order"
- ✅ "Payment captured successfully"
- ✅ "Email sent successfully"

#### Logs d'erreurs

Rechercher les erreurs potentielles :
- ❌ "PayPal credentials not configured"
- ❌ "Quote not found"
- ❌ "Quote is not ready for payment"
- ❌ "Failed to capture PayPal order"

---

### 7. Tests de validation

#### Test 1 : Devis sans montant

```sql
-- Créer un devis sans montant
INSERT INTO freight_quotes (status, client_email)
VALUES ('priced', 'test@example.com')
RETURNING id;

-- Essayer de créer un ordre PayPal
-- Résultat attendu : Erreur "Quote does not have a valid amount"
```

#### Test 2 : Devis avec mauvais statut

```sql
-- Créer un devis avec statut "pending"
INSERT INTO freight_quotes (
  status,
  quote_amount,
  quote_currency,
  client_email
)
VALUES ('pending', 100.00, 'EUR', 'test@example.com')
RETURNING id;

-- Essayer de créer un ordre PayPal
-- Résultat attendu : Erreur "Quote is not ready for payment"
```

#### Test 3 : Double paiement

```sql
-- Créer un devis déjà payé
INSERT INTO freight_quotes (
  status,
  payment_status,
  quote_amount,
  quote_currency,
  client_email
)
VALUES ('paid', 'paid', 100.00, 'EUR', 'test@example.com')
RETURNING id;

-- Essayer de créer un ordre PayPal
-- Résultat attendu : Erreur "Quote is already paid"
```

---

### 8. Checklist finale

#### Base de données
- [ ] Toutes les colonnes existent
- [ ] Les statuts sont corrects
- [ ] Les politiques RLS fonctionnent
- [ ] Les contraintes sont en place

#### Edge Functions
- [ ] `create-paypal-order` est déployée
- [ ] `capture-paypal-order` est déployée
- [ ] Les deux fonctions sont ACTIVE
- [ ] Les logs sont accessibles

#### Configuration
- [ ] Variables PayPal configurées
- [ ] Variables SMTP configurées
- [ ] Mode sandbox/live correct
- [ ] Secrets sécurisés

#### Tests
- [ ] Création d'ordre fonctionne
- [ ] Capture de paiement fonctionne
- [ ] Emails sont envoyés
- [ ] Validations fonctionnent
- [ ] Gestion d'erreurs fonctionne

#### Documentation
- [ ] Documentation complète disponible
- [ ] Guide de référence rapide disponible
- [ ] Exemples de code fournis
- [ ] Requêtes SQL documentées

---

## ✅ Validation finale

Si tous les tests ci-dessus passent, l'implémentation PayPal pour les devis est **complète et fonctionnelle**.

## 🚨 En cas de problème

### Problème : Edge Function ne se déploie pas

**Solution** :
1. Vérifier les logs de déploiement
2. Vérifier la syntaxe TypeScript
3. Vérifier les imports

### Problème : PayPal retourne une erreur

**Solution** :
1. Vérifier les credentials PayPal
2. Vérifier le mode (sandbox vs live)
3. Vérifier les logs PayPal

### Problème : Emails ne sont pas envoyés

**Solution** :
1. Vérifier la configuration SMTP
2. Tester avec `send-email` directement
3. Vérifier les logs SMTP

### Problème : RLS bloque l'accès

**Solution** :
1. Vérifier les politiques RLS
2. Utiliser le service role key pour les tests
3. Vérifier l'authentification de l'utilisateur

---

## 📞 Support

Pour toute question :
1. Consulter la documentation complète
2. Vérifier les logs des Edge Functions
3. Tester en mode sandbox
4. Contacter le support Supabase si nécessaire
