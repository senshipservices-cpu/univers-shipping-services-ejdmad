
# Stripe Payment Integration

## Overview

This document describes the Stripe payment integration for the Universal Shipping Services (3S Global) application. The integration is configured in **TEST MODE** for development and testing purposes.

## Environment Variables

The following environment variables must be configured:

### Client-Side (Public)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (starts with `pk_test_` for test mode)
  - Used in the React Native app for client-side operations
  - Safe to expose in client code

### Server-Side (Secret)
- `STRIPE_SECRET_KEY`: Stripe secret key (starts with `sk_test_` for test mode)
  - Used in Supabase Edge Functions for secure backend operations
  - **NEVER expose this in client code**

### Webhooks
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (starts with `whsec_`)
  - Used to verify webhook events from Stripe
  - Will be filled after creating the webhook in Stripe Dashboard

## Database Schema

### pricing_plans Table

Stores available pricing plans for subscriptions and one-time purchases.

**Fields:**
- `id` (UUID): Primary key
- `name` (TEXT): Display name of the plan (e.g., "Global Basic", "Global Pro")
- `code` (TEXT, UNIQUE): Unique identifier (e.g., "GLOBAL_BASIC", "GLOBAL_PRO")
- `description` (TEXT): Detailed description of the plan
- `price_eur` (NUMERIC): Price in EUR
- `currency` (TEXT): Currency code (default: "EUR")
- `billing_period` (TEXT): "one_time", "monthly", or "yearly"
- `stripe_price_id` (TEXT, OPTIONAL): Stripe Price ID for recurring subscriptions
- `is_active` (BOOLEAN): Whether the plan is currently available
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Anyone can view active pricing plans
- Only admins can create/update/delete pricing plans

### subscriptions Table (Updated)

Stores customer subscriptions with Stripe integration.

**New Fields Added:**
- `user_id` (UUID): Direct reference to auth.users for easier queries
- `plan_code` (TEXT): Reference to pricing_plans.code
- `stripe_subscription_id` (TEXT): Stripe subscription ID for recurring payments

**Existing Fields:**
- `id` (UUID): Primary key
- `client` (UUID): Reference to clients table
- `plan_type` (ENUM): Type of plan
- `status` (TEXT): "pending", "active", "cancelled", "expired"
- `is_active` (BOOLEAN): Whether subscription is currently active
- `start_date` (DATE): Subscription start date
- `end_date` (DATE): Subscription end date (null for active subscriptions)
- `payment_provider` (TEXT): Payment provider name (e.g., "stripe")
- `payment_reference` (TEXT): Payment reference/transaction ID
- `notes` (TEXT): Internal notes
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Users can view their own subscriptions
- Admins can view and manage all subscriptions

## React Native Integration

### StripeProvider Context

The `StripeProvider` wraps the entire app and provides Stripe functionality.

**Location:** `contexts/StripeContext.tsx`

**Usage:**
```typescript
import { useStripe } from '@/contexts/StripeContext';

const { publishableKey, isReady } = useStripe();
```

### Custom Hooks

#### usePricingPlans

Fetches and manages pricing plans.

**Location:** `hooks/usePricingPlans.ts`

**Usage:**
```typescript
import { usePricingPlans } from '@/hooks/usePricingPlans';

const { plans, loading, error, refetch, getPlanByCode } = usePricingPlans();
```

#### useSubscription

Manages user subscriptions.

**Location:** `hooks/useSubscription.ts`

**Usage:**
```typescript
import { useSubscription } from '@/hooks/useSubscription';

const { 
  subscription, 
  loading, 
  error, 
  hasActiveSubscription,
  createSubscription,
  updateSubscriptionStatus 
} = useSubscription();
```

## Stripe Utilities

**Location:** `utils/stripe.ts`

Provides utility functions for Stripe operations:
- `getStripePublishableKey()`: Get publishable key from environment
- `formatPrice(amount, currency)`: Format price for display
- `getBillingPeriodLabel(period, language)`: Get localized billing period label
- `isValidStripePublishableKey(key)`: Validate key format
- `isStripeTestMode(key)`: Check if using test mode

## Implementation Steps

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API keys**
3. Copy the **Publishable key** (starts with `pk_test_`)
4. Copy the **Secret key** (starts with `sk_test_`)
5. Add them to your `.env` file

### 2. Configure Environment Variables

Update your `.env` file:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Create Pricing Plans

Insert pricing plans into the database:

```sql
INSERT INTO pricing_plans (name, code, description, price_eur, billing_period, is_active)
VALUES 
  ('Basic Plan', 'GLOBAL_BASIC', 'Basic features for small businesses', 29.99, 'monthly', true),
  ('Pro Plan', 'GLOBAL_PRO', 'Advanced features for growing businesses', 99.99, 'monthly', true),
  ('Enterprise Plan', 'GLOBAL_ENTERPRISE', 'Full features for large organizations', 299.99, 'monthly', true);
```

### 4. Set Up Stripe Products and Prices

For recurring subscriptions:

1. Go to **Products** in Stripe Dashboard
2. Create a product for each plan
3. Add a price for each product
4. Copy the Price ID (starts with `price_`)
5. Update the `stripe_price_id` field in `pricing_plans` table

```sql
UPDATE pricing_plans 
SET stripe_price_id = 'price_your_stripe_price_id'
WHERE code = 'GLOBAL_BASIC';
```

### 5. Create Stripe Webhooks

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL (will be a Supabase Edge Function)
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables

### 6. Create Supabase Edge Function for Webhooks

Create an Edge Function to handle Stripe webhooks:

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  
  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!)
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        break
      case 'customer.subscription.created':
        // Handle new subscription
        break
      case 'customer.subscription.updated':
        // Handle subscription update
        break
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break
      case 'invoice.payment_failed':
        // Handle failed payment
        break
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

## Payment Flow

### One-Time Payment

1. User selects a plan
2. App creates a Checkout Session via Edge Function
3. User is redirected to Stripe Checkout
4. After payment, Stripe redirects back to app
5. Webhook confirms payment
6. Subscription is activated in database

### Recurring Subscription

1. User selects a subscription plan
2. App creates a Checkout Session with subscription mode
3. User completes payment setup
4. Stripe creates subscription
5. Webhook confirms subscription creation
6. Subscription is recorded in database
7. Stripe automatically charges on renewal dates

## Testing

### Test Cards

Use these test card numbers in TEST MODE:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Testing Webhooks Locally

Use Stripe CLI to forward webhooks to your local development:

```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

## Security Best Practices

1. **Never expose secret keys** in client code
2. **Always validate webhook signatures** to ensure events are from Stripe
3. **Use HTTPS** for all webhook endpoints
4. **Implement idempotency** for webhook handlers
5. **Log all payment events** for audit trail
6. **Use test mode** during development
7. **Validate amounts** on the server before creating charges

## Switching to Production

When ready to go live:

1. Get production API keys from Stripe Dashboard
2. Update environment variables with production keys
3. Update webhook endpoints to production URLs
4. Test thoroughly with small amounts
5. Monitor the Stripe Dashboard for issues

## Troubleshooting

### Common Issues

**Issue:** Stripe publishable key not found
- **Solution:** Ensure `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env`

**Issue:** Webhook signature verification failed
- **Solution:** Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret

**Issue:** Payment succeeds but subscription not created
- **Solution:** Check webhook logs in Stripe Dashboard and Edge Function logs

**Issue:** Test mode vs production mode mismatch
- **Solution:** Ensure all keys (publishable, secret, webhook) are from the same mode

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native SDK](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

For issues related to:
- **Stripe integration:** Check Stripe Dashboard logs
- **Database issues:** Check Supabase logs
- **App issues:** Check React Native logs
- **Webhook issues:** Check Edge Function logs
