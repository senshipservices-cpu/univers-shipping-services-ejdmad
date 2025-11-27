
# PayPal Quote Payment - Quick Reference

## 🚀 Quick Start

### 1. Créer un ordre PayPal pour un devis

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/create-paypal-order`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      quote_id: 'uuid-du-devis',
      success_url: 'https://www.universal-shippingservices.com/paypal/success',
      cancel_url: 'https://www.universal-shippingservices.com/paypal/cancel',
    }),
  }
);

const data = await response.json();

if (data.ok) {
  // Rediriger l'utilisateur vers l'URL d'approbation PayPal
  window.location.href = data.approval_url;
}
```

### 2. Capturer le paiement après retour PayPal

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/capture-paypal-order`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      quote_id: 'uuid-du-devis',
    }),
  }
);

const data = await response.json();

if (data.ok && data.new_status === 'paid') {
  // Paiement confirmé !
  console.log('Paiement réussi');
}
```

## 📋 Prérequis

### Variables d'environnement Supabase

```bash
# Mode PayPal (sandbox ou live)
PAYPAL_ENV=sandbox

# Sandbox credentials
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_SECRET=your_sandbox_secret

# Live credentials
PAYPAL_LIVE_CLIENT_ID=your_live_client_id
PAYPAL_LIVE_SECRET=your_live_secret

# SMTP (pour les emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_username
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@universal-shippingservices.com
```

### Structure du devis

Avant de créer un ordre PayPal, le devis doit avoir :

```typescript
{
  id: 'uuid',
  status: 'priced', // ou 'payment_pending'
  quote_amount: 1250.00, // > 0
  quote_currency: 'EUR', // non vide
  client_email: 'client@example.com',
  client_name: 'John Doe',
  // ... autres champs
}
```

## 🔄 Flux de paiement complet

```
1. Admin définit le montant du devis
   └─> status = 'priced'
   └─> quote_amount = 1250.00
   └─> quote_currency = 'EUR'

2. Client clique sur "Payer"
   └─> Appel à create-paypal-order
   └─> status = 'payment_pending'
   └─> paypal_order_id enregistré

3. Client redirigé vers PayPal
   └─> Paiement sur PayPal

4. Client revient sur success_url
   └─> Appel à capture-paypal-order
   └─> status = 'paid'
   └─> paid_at = now()
   └─> Emails envoyés
```

## ⚠️ Erreurs courantes

### "Quote is not ready for payment"

**Cause** : Le statut du devis n'est pas `priced` ou `payment_pending`

**Solution** : Vérifier que l'admin a bien défini le montant et mis le statut à `priced`

```sql
UPDATE freight_quotes 
SET status = 'priced', 
    quote_amount = 1250.00, 
    quote_currency = 'EUR'
WHERE id = 'uuid-du-devis';
```

### "Quote does not have a valid amount"

**Cause** : `quote_amount` est NULL ou <= 0

**Solution** : Définir un montant valide

```sql
UPDATE freight_quotes 
SET quote_amount = 1250.00
WHERE id = 'uuid-du-devis';
```

### "Quote does not have a valid currency"

**Cause** : `quote_currency` est NULL ou vide

**Solution** : Définir une devise

```sql
UPDATE freight_quotes 
SET quote_currency = 'EUR'
WHERE id = 'uuid-du-devis';
```

### "PayPal credentials not configured"

**Cause** : Variables d'environnement PayPal manquantes

**Solution** : Configurer les variables dans Supabase Dashboard

## 🧪 Tests rapides

### Test Sandbox

```bash
# 1. Configurer l'environnement
PAYPAL_ENV=sandbox

# 2. Créer un devis de test
curl -X POST https://[PROJECT_URL]/rest/v1/freight_quotes \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "priced",
    "quote_amount": 100.00,
    "quote_currency": "EUR",
    "client_email": "test@example.com",
    "client_name": "Test User"
  }'

# 3. Créer un ordre PayPal
curl -X POST https://[PROJECT_URL]/functions/v1/create-paypal-order \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID]",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'

# 4. Payer avec un compte sandbox PayPal

# 5. Capturer le paiement
curl -X POST https://[PROJECT_URL]/functions/v1/capture-paypal-order \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "[QUOTE_ID]"
  }'
```

## 📊 Requêtes SQL utiles

### Vérifier les devis prêts à payer

```sql
SELECT 
  id,
  client_name,
  quote_amount,
  quote_currency,
  status,
  created_at
FROM freight_quotes
WHERE status = 'priced'
  AND quote_amount > 0
  AND quote_currency IS NOT NULL
ORDER BY created_at DESC;
```

### Vérifier les paiements en attente

```sql
SELECT 
  id,
  client_name,
  quote_amount,
  paypal_order_id,
  status,
  created_at
FROM freight_quotes
WHERE status = 'payment_pending'
ORDER BY created_at DESC;
```

### Vérifier les paiements réussis

```sql
SELECT 
  id,
  client_name,
  quote_amount,
  quote_currency,
  paypal_order_id,
  paid_at
FROM freight_quotes
WHERE status = 'paid'
ORDER BY paid_at DESC
LIMIT 10;
```

### Statistiques de paiement

```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(quote_amount) as total_amount,
  quote_currency
FROM freight_quotes
WHERE quote_amount IS NOT NULL
GROUP BY status, quote_currency
ORDER BY status;
```

## 🔐 Sécurité

### ✅ Bonnes pratiques

- Toujours utiliser `SUPABASE_SERVICE_ROLE_KEY` pour `capture-paypal-order`
- Ne jamais exposer les secrets PayPal côté client
- Valider le statut du devis avant de créer un ordre
- Vérifier la propriété du devis avant capture

### ❌ À éviter

- Ne pas appeler `capture-paypal-order` côté client
- Ne pas stocker les secrets PayPal dans le code
- Ne pas permettre la capture sans validation du statut
- Ne pas ignorer les erreurs de validation

## 📧 Emails

### Format des emails

Les emails sont envoyés automatiquement après capture :

1. **Email client** : Confirmation de paiement
2. **Email admin** : Notification de nouveau paiement

### Désactiver les emails (dev)

Pour désactiver temporairement les emails en développement, commenter l'appel à `sendEmailNotification` dans `capture-paypal-order/index.ts`.

## 🔗 Liens utiles

- [PayPal Sandbox Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Test Accounts](https://developer.paypal.com/tools/sandbox/accounts/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Edge Functions Logs](https://supabase.com/dashboard/project/_/functions)

## 💡 Tips

1. **Toujours tester en sandbox** avant de passer en live
2. **Surveiller les logs** des Edge Functions pour déboguer
3. **Vérifier les emails** dans les logs SMTP
4. **Utiliser des montants de test** (ex: 1.00 EUR) en sandbox
5. **Documenter les transactions** pour audit
