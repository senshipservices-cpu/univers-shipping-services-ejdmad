
# PayPal Quote Payment Implementation - PARTIE 1

## Vue d'ensemble

Ce document décrit l'implémentation complète du flux de paiement PayPal pour les devis USS. Les clients peuvent payer un devis directement depuis l'application en utilisant soit leur carte bancaire via PayPal, soit leur compte PayPal.

## 1️⃣ Modèle de données Supabase

### Table `freight_quotes`

La table `freight_quotes` contient maintenant toutes les colonnes nécessaires pour gérer les paiements PayPal :

| Colonne | Type | Description |
|---------|------|-------------|
| `quote_amount` | numeric | Montant total du devis validé par USS |
| `quote_currency` | text | Devise (ex: "EUR", "USD") |
| `status` | enum | Statut du devis (voir ci-dessous) |
| `paypal_order_id` | text | Identifiant d'ordre PayPal |
| `paid_at` | timestamp | Date de paiement effectif |
| `payment_status` | text | Statut du paiement (pending, paid, failed, refunded) |

### Statuts du devis

Le champ `status` supporte les valeurs suivantes :

- **`pending`** : Demande reçue, pas encore chiffrée
- **`priced`** : Montant défini, devis prêt à être payé
- **`payment_pending`** : Ordre PayPal créé, en attente de paiement
- **`paid`** : Paiement confirmé
- **`cancelled`** : Annulé

### Flux de statut

```
pending → priced → payment_pending → paid
                ↓
            cancelled
```

### Row Level Security (RLS)

Les politiques RLS sont en place :

- ✅ **Clients** : Ne voient que leurs propres devis
- ✅ **Admins** : Peuvent voir tous les devis
- ✅ **Mise à jour** : Les clients peuvent mettre à jour les champs de paiement de leurs propres devis

## 2️⃣ Edge Function: `create-paypal-order`

### Endpoint

```
POST https://[PROJECT_URL]/functions/v1/create-paypal-order
```

### Input JSON

```json
{
  "quote_id": "<id du devis>",
  "success_url": "https://www.universal-shippingservices.com/paypal/success",
  "cancel_url": "https://www.universal-shippingservices.com/paypal/cancel"
}
```

### Validations

La fonction vérifie :

1. ✅ Que le devis existe
2. ✅ Que `status` est `"priced"` ou `"payment_pending"`
3. ✅ Que `quote_amount > 0`
4. ✅ Que `quote_currency` n'est pas vide

### Variables d'environnement PayPal

La fonction utilise automatiquement les bonnes variables selon `PAYPAL_ENV` :

**Mode Sandbox** (`PAYPAL_ENV=sandbox`) :
- `PAYPAL_SANDBOX_CLIENT_ID`
- `PAYPAL_SANDBOX_SECRET`
- API URL: `https://api-m.sandbox.paypal.com`

**Mode Live** (`PAYPAL_ENV=live`) :
- `PAYPAL_LIVE_CLIENT_ID`
- `PAYPAL_LIVE_SECRET`
- API URL: `https://api-m.paypal.com`

### Appel API PayPal

La fonction appelle l'API REST PayPal Orders v2 avec :

```json
{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "amount": {
        "currency_code": "EUR",
        "value": "1250.00"
      }
    }
  ],
  "application_context": {
    "return_url": "https://www.universal-shippingservices.com/paypal/success?quote_id=...",
    "cancel_url": "https://www.universal-shippingservices.com/paypal/cancel?quote_id=..."
  }
}
```

### Succès - Output JSON

```json
{
  "ok": true,
  "order_id": "<paypal_order_id>",
  "approval_url": "<url vers laquelle rediriger le client pour payer>",
  "environment": "sandbox" // ou "live"
}
```

### Actions en cas de succès

1. ✅ Enregistre `paypal_order_id` dans la ligne du devis
2. ✅ Met `status = "payment_pending"`
3. ✅ Met `payment_status = "pending"`
4. ✅ Renvoie l'URL d'approbation PayPal

### Erreur - Output JSON

```json
{
  "ok": false,
  "error": "message détaillé"
}
```

## 3️⃣ Edge Function: `capture-paypal-order`

### Endpoint

```
POST https://[PROJECT_URL]/functions/v1/capture-paypal-order
```

### Input JSON

```json
{
  "quote_id": "<id du devis>"
}
```

### Processus

1. ✅ Récupère le devis dans `freight_quotes`
2. ✅ Récupère le `paypal_order_id`
3. ✅ Appelle l'API PayPal capture pour cet ordre
4. ✅ Vérifie le statut de la capture (COMPLETED / APPROVED)

### Si capture réussie (COMPLETED / APPROVED)

La fonction :

1. ✅ Met à jour le devis :
   - `status = "paid"`
   - `payment_status = "paid"`
   - `paid_at = now()`

2. ✅ Envoie un email au client :
   - Sujet : "Paiement confirmé - Universal Shipping Services"
   - Contenu : Confirmation de paiement + détails du devis

3. ✅ Envoie un email à l'admin USS :
   - Sujet : "Nouveau paiement reçu - Devis #..."
   - Contenu : Détails complets du devis et du paiement

### Succès - Output JSON

```json
{
  "ok": true,
  "new_status": "paid",
  "capture_id": "<paypal_capture_id>"
}
```

### Erreur - Output JSON

```json
{
  "ok": false,
  "error": "message détaillé"
}
```

### Gestion des erreurs email

⚠️ **Important** : Si l'envoi d'email échoue, la fonction ne bloque pas la confirmation du paiement. L'erreur est simplement loggée pour analyse.

## 🔒 Sécurité

- ✅ Les secrets PayPal ne sont jamais exposés côté client
- ✅ Toutes les opérations PayPal sont effectuées côté serveur (Edge Functions)
- ✅ Les politiques RLS protègent l'accès aux devis
- ✅ Validation stricte des statuts et montants avant création d'ordre
- ✅ Vérification de propriété du devis avant capture

## 📧 Notifications Email

### Email au client

```html
<h2>Paiement confirmé - Universal Shipping Services</h2>
<p>Bonjour [Client],</p>
<p>Nous avons bien reçu votre paiement pour le devis #[ID].</p>

<h3>Détails du devis</h3>
<p><strong>Montant:</strong> [amount] [currency]</p>
<p><strong>Origine:</strong> [origin_port]</p>
<p><strong>Destination:</strong> [destination_port]</p>
<p><strong>Type de cargo:</strong> [cargo_type]</p>

<p>Votre demande est maintenant en cours de traitement.</p>
```

### Email à l'admin

```html
<h2>Nouveau paiement reçu</h2>
<p>Un paiement a été confirmé pour le devis #[ID].</p>

<h3>Détails du paiement</h3>
<p><strong>ID Devis:</strong> [quote_id]</p>
<p><strong>Client:</strong> [client_name] ([client_email])</p>
<p><strong>Montant:</strong> [amount] [currency]</p>
<p><strong>PayPal Order ID:</strong> [paypal_order_id]</p>
<p><strong>Origine:</strong> [origin_port]</p>
<p><strong>Destination:</strong> [destination_port]</p>
<p><strong>Type de cargo:</strong> [cargo_type]</p>
<p><strong>Volume:</strong> [volume_details]</p>
<p><strong>Incoterm:</strong> [incoterm]</p>

<p>Veuillez traiter cette demande dans les plus brefs délais.</p>
```

## 🧪 Tests

### Test en mode Sandbox

1. Configurer `PAYPAL_ENV=sandbox`
2. Créer un devis avec `status="priced"` et `quote_amount > 0`
3. Appeler `create-paypal-order` avec le `quote_id`
4. Utiliser les comptes de test PayPal Sandbox pour payer
5. Appeler `capture-paypal-order` avec le `quote_id`
6. Vérifier que le statut passe à `"paid"`

### Test en mode Live

1. Configurer `PAYPAL_ENV=live`
2. Suivre le même processus avec de vrais paiements

## 📊 Monitoring

### Logs à surveiller

- ✅ Création d'ordres PayPal
- ✅ Captures d'ordres PayPal
- ✅ Échecs d'envoi d'emails (non-bloquants)
- ✅ Erreurs de validation de devis

### Requêtes SQL utiles

```sql
-- Devis en attente de paiement
SELECT * FROM freight_quotes 
WHERE status = 'payment_pending' 
ORDER BY created_at DESC;

-- Devis payés aujourd'hui
SELECT * FROM freight_quotes 
WHERE status = 'paid' 
AND paid_at::date = CURRENT_DATE;

-- Devis avec ordre PayPal mais non capturés
SELECT * FROM freight_quotes 
WHERE paypal_order_id IS NOT NULL 
AND status != 'paid';
```

## 🚀 Prochaines étapes (PARTIE 2)

La PARTIE 2 concernera l'intégration côté client (React Native) :

- Écran de paiement de devis
- Intégration du SDK PayPal
- Gestion du retour après paiement
- Affichage du statut de paiement

## 📝 Notes importantes

1. **Environnement** : Toujours vérifier que `PAYPAL_ENV` est correctement configuré
2. **Montants** : PayPal attend des montants avec 2 décimales maximum
3. **Devises** : Vérifier que la devise est supportée par PayPal
4. **Emails** : Les échecs d'email ne bloquent pas le paiement
5. **RLS** : Les politiques RLS protègent l'accès aux devis

## 🔗 Ressources

- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
