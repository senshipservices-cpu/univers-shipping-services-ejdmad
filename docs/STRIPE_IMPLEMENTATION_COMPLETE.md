
# Stripe Implementation - Complete Guide

## Overview

This document provides a complete overview of the Stripe payment integration for Universal Shipping Services (3S Global), including:

1. **Pricing Plan Payments** - Subscription and one-time plan purchases
2. **Freight Quote Payments** - One-time payments for freight quotes
3. **Webhook Processing** - Automatic payment and subscription handling

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Pricing    │  │    Quote     │  │  Client Dashboard    │  │
│  │     Page     │  │   Details    │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                  │                                     │
└─────────┼──────────────────┼─────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         create-checkout-session                          │   │
│  │  • Validates user authentication                         │   │
│  │  • Creates Stripe Checkout session                       │   │
│  │  • Returns checkout URL                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         stripe-webhook                                   │   │
│  │  • Verifies Stripe signature                             │   │
│  │  • Processes payment events                              │   │
│  │  • Updates database                                      │   │
│  │  • Sends email notifications                             │   │
│  │  • Logs all events                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Stripe API                               │
│  • Checkout Sessions                                             │
│  • Payment Intents                                               │
│  • Subscriptions                                                 │
│  • Webhooks                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Client-Side Integration

#### StripeContext

**Files**:
- `contexts/StripeContext.tsx` - Main context
- `contexts/StripeContext.web.tsx` - Web-specific implementation
- `contexts/StripeContext.native.tsx` - Native-specific implementation

**Purpose**: Provides Stripe functionality throughout the app

**Usage**:
```typescript
import { useStripe } from '@/contexts/StripeContext';

const { publishableKey, isReady } = useStripe();
```

#### Custom Hooks

**usePricingPlans** (`hooks/usePricingPlans.ts`):
- Fetches pricing plans from database
- Provides plan filtering and selection

**useSubscription** (`hooks/useSubscription.ts`):
- Manages user subscriptions
- Checks subscription status
- Creates and updates subscriptions

#### Pages

**Pricing Page** (`app/(tabs)/pricing.tsx`):
- Displays available pricing plans
- Handles plan selection and payment initiation
- Redirects to Stripe Checkout

**Quote Details Page** (`app/(tabs)/quote-details.tsx`):
- Shows freight quote details
- Displays payment status
- Provides "Pay this Quote" button

**Payment Success** (`app/(tabs)/payment-success.tsx`):
- Confirmation page after successful payment
- Displays payment details
- Links to dashboard

**Payment Cancel** (`app/(tabs)/payment-cancel.tsx`):
- Shown when user cancels payment
- Provides option to retry

### 2. Server-Side Integration

#### Edge Function: create-checkout-session

**Purpose**: Creates Stripe Checkout sessions for both pricing plans and freight quotes

**Endpoint**: `POST /functions/v1/create-checkout-session`

**Request Body** (Pricing Plan):
```json
{
  "plan_code": "GLOBAL_BASIC",
  "context": "pricing_plan"
}
```

**Request Body** (Freight Quote):
```json
{
  "quote_id": "uuid",
  "context": "freight_quote"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Features**:
- User authentication and authorization
- Ownership verification (for quotes)
- Provisional subscription creation
- Metadata attachment for webhook processing
- Support for one-time and recurring payments

#### Edge Function: stripe-webhook

**Purpose**: Processes Stripe webhook events automatically

**Endpoint**: `POST /functions/v1/stripe-webhook`

**Events Handled**:
- `checkout.session.completed` - Payment completed
- `invoice.payment_succeeded` - Subscription payment succeeded
- `payment_intent.succeeded` - Payment intent succeeded
- `payment_intent.payment_failed` - Payment failed
- `invoice.payment_failed` - Subscription payment failed
- `customer.subscription.deleted` - Subscription cancelled

**Features**:
- Stripe signature verification
- Automatic database updates
- Shipment creation (for quotes)
- Email notification queuing
- Comprehensive event logging
- Error handling and retry logic

### 3. Database Schema

#### pricing_plans

Stores available pricing plans.

**Key Fields**:
- `code` (TEXT, UNIQUE): Plan identifier
- `name` (TEXT): Display name
- `price_eur` (NUMERIC): Price in EUR
- `billing_period` (TEXT): "one_time", "monthly", or "yearly"
- `stripe_price_id` (TEXT): Stripe Price ID (for recurring)
- `is_active` (BOOLEAN): Whether plan is available

#### subscriptions

Stores user subscriptions.

**Key Fields**:
- `user_id` (UUID): Reference to auth.users
- `plan_code` (TEXT): Reference to pricing_plans.code
- `status` (TEXT): "pending", "active", "cancelled", "expired"
- `is_active` (BOOLEAN): Current activation status
- `start_date` (DATE): Subscription start
- `end_date` (DATE): Subscription end
- `stripe_subscription_id` (TEXT): Stripe subscription ID

#### freight_quotes

Stores freight quote requests.

**Payment Fields**:
- `quote_amount` (NUMERIC): Quoted amount
- `quote_currency` (TEXT): Currency (default: EUR)
- `payment_status` (TEXT): "unpaid", "processing", "paid", "failed", "refunded"
- `stripe_payment_intent_id` (TEXT): Stripe session/intent ID
- `can_pay_online` (BOOLEAN): Whether online payment is enabled
- `ordered_as_shipment` (UUID): Reference to created shipment

#### shipments

Stores shipment records.

**Key Fields**:
- `tracking_number` (TEXT, UNIQUE): Auto-generated tracking number
- `client` (UUID): Reference to clients
- `origin_port` (UUID): Origin port
- `destination_port` (UUID): Destination port
- `current_status` (TEXT): Shipment status
- `cargo_type` (TEXT): Type of cargo

#### payment_logs

Logs all webhook events.

**Fields**:
- `type` (TEXT): Stripe event type
- `payload_raw` (JSONB): Full event payload
- `stripe_event_id` (TEXT): Unique event ID
- `status` (TEXT): Processing status
- `error_message` (TEXT): Error details (if any)

#### email_notifications

Queues email notifications.

**Fields**:
- `recipient_email` (TEXT): Recipient address
- `email_type` (TEXT): Type of email
- `subject` (TEXT): Email subject
- `body` (TEXT): Email body
- `metadata` (JSONB): Additional data
- `status` (TEXT): "pending", "sent", "failed"

## Payment Flows

### Flow 1: Pricing Plan Payment

```
1. User clicks "Choisir ce plan" on pricing page
   ↓
2. App checks if user is authenticated
   ↓
3. App calls create-checkout-session Edge Function
   ↓
4. Edge Function creates provisional subscription (status: pending)
   ↓
5. Edge Function creates Stripe Checkout session
   ↓
6. User is redirected to Stripe Checkout
   ↓
7. User completes payment
   ↓
8. Stripe sends checkout.session.completed webhook
   ↓
9. Webhook handler:
   - Updates subscription (status: active, is_active: true)
   - Calculates start_date and end_date
   - Stores stripe_subscription_id (if recurring)
   - Queues activation email
   - Logs event
   ↓
10. User is redirected to payment-success page
    ↓
11. Email is sent to user
```

### Flow 2: Freight Quote Payment

```
1. User clicks "Pay this Quote" on quote details page
   ↓
2. App verifies user owns the quote
   ↓
3. App calls create-checkout-session Edge Function
   ↓
4. Edge Function updates quote (payment_status: processing)
   ↓
5. Edge Function creates Stripe Checkout session
   ↓
6. User is redirected to Stripe Checkout
   ↓
7. User completes payment
   ↓
8. Stripe sends checkout.session.completed webhook
   ↓
9. Webhook handler:
   - Updates quote (payment_status: paid)
   - Creates shipment with tracking number
   - Links shipment to quote
   - Queues confirmation email
   - Logs event
   ↓
10. User is redirected to payment-success page
    ↓
11. Email is sent to user with tracking number
```

### Flow 3: Subscription Renewal

```
1. Stripe automatically charges subscription
   ↓
2. Stripe sends invoice.payment_succeeded webhook
   ↓
3. Webhook handler:
   - Finds subscription by stripe_subscription_id
   - Updates subscription (status: active)
   - Logs renewal event
   ↓
4. Subscription remains active
```

### Flow 4: Payment Failure

```
1. Payment fails (card declined, insufficient funds, etc.)
   ↓
2. Stripe sends payment_intent.payment_failed or invoice.payment_failed
   ↓
3. Webhook handler:
   - For quotes: Updates payment_status to "failed"
   - For subscriptions: Updates status to "cancelled"
   - Logs failure event
   ↓
4. User can retry payment from dashboard
```

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy **Publishable key** (pk_test_...)
4. Copy **Secret key** (sk_test_...)

### 2. Configure Environment Variables

**Client-side** (`.env`):
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Server-side** (Supabase secrets):
```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Set webhook secret (after creating webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Create Stripe Products and Prices

For recurring subscriptions:

1. Go to **Products** in Stripe Dashboard
2. Create a product for each plan
3. Add a price for each product
4. Copy the Price ID (price_...)
5. Update `stripe_price_id` in `pricing_plans` table

```sql
UPDATE pricing_plans 
SET stripe_price_id = 'price_...'
WHERE code = 'GLOBAL_BASIC';
```

### 4. Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (whsec_...)
6. Add to Supabase secrets (step 2)

### 5. Test the Integration

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Test scenarios:
1. ✅ Successful pricing plan payment
2. ✅ Successful freight quote payment
3. ✅ Payment cancellation
4. ✅ Payment failure
5. ✅ Subscription renewal
6. ✅ Subscription cancellation

## Monitoring and Debugging

### View Logs

**Edge Function Logs**:
1. Supabase Dashboard → **Edge Functions**
2. Select function (create-checkout-session or stripe-webhook)
3. Click **Logs** tab

**Webhook Events**:
```sql
SELECT * FROM payment_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

**Failed Events**:
```sql
SELECT * FROM payment_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Webhook signature verification failed | Wrong webhook secret | Verify STRIPE_WEBHOOK_SECRET |
| Quote not found | Missing metadata | Check metadata in checkout session |
| Email not sent | Email service not configured | Check email_notifications table |
| Shipment not created | Missing required fields | Check quote has all required data |
| Payment status not updated | Webhook not received | Check webhook endpoint in Stripe |

## Security Best Practices

1. ✅ **Never expose secret keys** in client code
2. ✅ **Always verify webhook signatures** to ensure events are from Stripe
3. ✅ **Use HTTPS** for all webhook endpoints
4. ✅ **Implement idempotency** for webhook handlers
5. ✅ **Log all payment events** for audit trail
6. ✅ **Use test mode** during development
7. ✅ **Validate amounts** on the server before creating charges
8. ✅ **Verify ownership** before processing payments
9. ✅ **Use RLS policies** to protect sensitive data
10. ✅ **Monitor webhook health** and set up alerts

## Testing Checklist

- [ ] Pricing plan one-time payment works
- [ ] Pricing plan recurring subscription works
- [ ] Freight quote payment works
- [ ] Payment cancellation redirects correctly
- [ ] Payment failure is handled gracefully
- [ ] Subscription renewal works automatically
- [ ] Subscription cancellation updates status
- [ ] Shipment is created after quote payment
- [ ] Email notifications are sent
- [ ] Webhook events are logged
- [ ] Failed webhooks are retried
- [ ] Duplicate events are handled (idempotency)

## Production Checklist

- [ ] Switch to production Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real (small) amounts
- [ ] Set up monitoring and alerts
- [ ] Configure email service
- [ ] Review RLS policies
- [ ] Test all payment flows end-to-end
- [ ] Document customer support procedures
- [ ] Set up backup and recovery procedures
- [ ] Review security settings

## Related Documentation

- [Stripe Payment Integration](./STRIPE_PAYMENT_INTEGRATION.md)
- [Freight Quote Payment](./FREIGHT_QUOTE_PAYMENT.md)
- [Stripe Webhook Implementation](./STRIPE_WEBHOOK_IMPLEMENTATION.md)
- [Stripe Webhook Quick Reference](./STRIPE_WEBHOOK_QUICK_REFERENCE.md)
- [Stripe Setup Checklist](./STRIPE_SETUP_CHECKLIST.md)
- [Subscription Management Module](./SUBSCRIPTION_MANAGEMENT_MODULE.md)
- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native SDK](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
