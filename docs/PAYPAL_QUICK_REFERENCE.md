
# PayPal Integration - Quick Reference

## Environment Variables

### Frontend (Public)
```bash
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_ENV=sandbox  # or 'live'
PAYMENT_PROVIDER=paypal
```

### Backend (Secret - Supabase Edge Functions)
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_ENV=sandbox  # or 'live'
```

## Configuration Access

```typescript
import appConfig from '@/config/appConfig';

// Check payment provider
const provider = appConfig.payment.provider; // 'paypal' or 'stripe'

// Get PayPal configuration
const clientId = appConfig.env.PAYPAL_CLIENT_ID;
const environment = appConfig.payment.paypal.environment; // 'sandbox' or 'live'
const isSandbox = appConfig.payment.paypal.isSandbox;
const apiUrl = appConfig.payment.paypal.apiUrl;

// Check if configured
const isConfigured = appConfig.payment.isConfigured();
```

## Edge Functions

### Create PayPal Order
```typescript
const { data, error } = await supabase.functions.invoke('create-paypal-order', {
  body: {
    plan_code: 'BASIC_MONTHLY',  // For pricing plans
    // OR
    quote_id: 'quote-uuid',      // For freight quotes
    context: 'pricing_plan',     // or 'freight_quote'
  },
});

// Returns: { orderId, url }
```

### PayPal Webhook
- URL: `https://your-project.supabase.co/functions/v1/paypal-webhook`
- Events:
  - `CHECKOUT.ORDER.APPROVED`
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.DENIED`
  - `PAYMENT.CAPTURE.DECLINED`

## Utility Functions

```typescript
import {
  getPayPalClientId,
  getPayPalEnvironment,
  isPayPalSandbox,
  formatPrice,
  getBillingPeriodLabel,
} from '@/utils/paypal';

// Get client ID
const clientId = getPayPalClientId();

// Check environment
const env = getPayPalEnvironment(); // 'sandbox' or 'live'
const isSandbox = isPayPalSandbox();

// Format price
const formatted = formatPrice(99.99, 'EUR'); // "99,99 €"

// Get billing period label
const label = getBillingPeriodLabel('monthly', 'fr'); // "Par mois"
```

## Payment Flow

### 1. Create Order
```typescript
const { data } = await supabase.functions.invoke('create-paypal-order', {
  body: { plan_code: 'BASIC_MONTHLY' },
});
```

### 2. Redirect User
```typescript
if (data.url) {
  await Linking.openURL(data.url);
}
```

### 3. Handle Return
- Success: `/payment-success?context=pricing_plan`
- Cancel: `/payment-cancel?context=pricing_plan`

### 4. Webhook Processing
- PayPal sends webhook to Edge Function
- Edge Function verifies signature
- Updates database (quotes, subscriptions)
- Sends email notifications

## Environment Consistency

| Environment | APP_ENV | PAYPAL_ENV | PayPal Keys |
|-------------|---------|------------|-------------|
| Development | `dev` | `sandbox` | Sandbox credentials |
| Production | `production` | `live` | Live credentials |

## Validation

```typescript
import { validateConfig } from '@/config/appConfig';

const { valid, errors, warnings } = validateConfig();

if (!valid) {
  console.error('Configuration errors:', errors);
}

if (warnings.length > 0) {
  console.warn('Configuration warnings:', warnings);
}
```

## Logging

```typescript
import appConfig from '@/config/appConfig';

// Payment-specific logging (dev only)
appConfig.logger.payment('Order created:', orderId);

// General logging
appConfig.logger.log('Debug info');      // Dev only
appConfig.logger.info('Info message');   // Dev only
appConfig.logger.warn('Warning');        // Always
appConfig.logger.error('Error');         // Always
appConfig.logger.essential('Critical');  // Always
```

## Database Tables

### payment_logs
```sql
- type: text (event type)
- payload_raw: jsonb (full event data)
- stripe_event_id: text (reused for PayPal event ID)
- status: text (received, processing, processed, error)
- error_message: text
- created_at: timestamp
```

### events_log
```sql
- event_type: text (quote_paid, subscription_activated)
- user_id: uuid
- client_id: uuid
- quote_id: uuid
- shipment_id: uuid
- details: text
- created_at: timestamp
```

## Testing

### Sandbox Test Accounts
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Sandbox** → **Accounts**
3. Use test buyer accounts for payments

### Test Cards
PayPal sandbox accepts any valid credit card format for testing.

### Webhook Testing
1. Use [PayPal Webhook Simulator](https://developer.paypal.com/dashboard/webhooks/simulator)
2. Or trigger real events with sandbox payments

## Common Commands

### Deploy Edge Functions
```bash
# Deploy create-paypal-order
supabase functions deploy create-paypal-order

# Deploy paypal-webhook
supabase functions deploy paypal-webhook
```

### Set Secrets
```bash
supabase secrets set PAYPAL_CLIENT_ID=your_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_client_secret
supabase secrets set PAYPAL_WEBHOOK_ID=your_webhook_id
supabase secrets set PAYPAL_ENV=sandbox
```

### View Logs
```bash
supabase functions logs create-paypal-order
supabase functions logs paypal-webhook
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "PayPal client ID not configured" | Set `EXPO_PUBLIC_PAYPAL_CLIENT_ID` |
| "Webhook verification failed" | Check `PAYPAL_WEBHOOK_ID` matches PayPal Dashboard |
| "Using sandbox in production" | Change `PAYPAL_ENV` to `live` |
| "Payment not completing" | Check webhook events in PayPal Dashboard |

## Security Checklist

- [ ] All keys stored in environment variables
- [ ] No hardcoded credentials in code
- [ ] Webhook signature verification enabled
- [ ] Separate sandbox and live credentials
- [ ] Production logging excludes sensitive data
- [ ] HTTPS enabled for all endpoints
- [ ] Regular key rotation scheduled

## Support Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal REST API Reference](https://developer.paypal.com/docs/api/overview/)
- [PayPal Webhooks Guide](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
