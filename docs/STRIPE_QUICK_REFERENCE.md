
# Stripe Integration - Quick Reference

## Environment Variables

```env
# Client-side (public)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side (secret - use in Edge Functions only)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Tables

### pricing_plans
```sql
SELECT * FROM pricing_plans WHERE is_active = true;
```

### subscriptions
```sql
SELECT * FROM subscriptions WHERE user_id = 'user-uuid' AND is_active = true;
```

## React Hooks

### Get Pricing Plans
```typescript
import { usePricingPlans } from '@/hooks/usePricingPlans';

const { plans, loading, error } = usePricingPlans();
```

### Get User Subscription
```typescript
import { useSubscription } from '@/hooks/useSubscription';

const { subscription, hasActiveSubscription } = useSubscription();
```

## Stripe Context
```typescript
import { useStripe } from '@/contexts/StripeContext';

const { publishableKey, isReady } = useStripe();
```

## Utility Functions
```typescript
import { formatPrice, getBillingPeriodLabel } from '@/utils/stripe';

formatPrice(29.99, 'EUR'); // "29,99 €"
getBillingPeriodLabel('monthly', 'fr'); // "Par mois"
```

## Common Operations

### Create Subscription
```typescript
const { createSubscription } = useSubscription();

await createSubscription(clientId, 'GLOBAL_BASIC', stripeSubscriptionId);
```

### Update Subscription Status
```typescript
const { updateSubscriptionStatus } = useSubscription();

await updateSubscriptionStatus(subscriptionId, 'active', true);
```

### Check Active Subscription
```typescript
const { hasActiveSubscription } = useSubscription();

if (hasActiveSubscription) {
  // User has active subscription
}
```

## Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Auth Required:** 4000 0025 0000 3155

Use any future expiry, any CVC, any postal code.

## Stripe Dashboard Links

- **API Keys:** https://dashboard.stripe.com/test/apikeys
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Products:** https://dashboard.stripe.com/test/products
- **Customers:** https://dashboard.stripe.com/test/customers
- **Payments:** https://dashboard.stripe.com/test/payments

## Common Issues

| Issue | Solution |
|-------|----------|
| Key not found | Check `.env` file and restart app |
| Webhook failed | Verify webhook secret matches Stripe |
| Payment not recorded | Check Edge Function logs |
| Test mode mismatch | Ensure all keys are from same mode |

## Next Steps

1. ✅ Configure environment variables
2. ✅ Create pricing plans in database
3. ⏳ Create Stripe products and prices
4. ⏳ Set up webhook endpoint
5. ⏳ Deploy Edge Functions
6. ⏳ Test payment flow
7. ⏳ Switch to production mode
