
# Stripe Webhook Implementation

## Overview

This document describes the implementation of the Stripe webhook endpoint that automatically processes payment and subscription events. The webhook handles both freight quote payments and pricing plan subscriptions.

## Architecture

### Edge Function: stripe-webhook

**Location**: Supabase Edge Function
**Endpoint**: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
**Authentication**: No JWT required (uses Stripe signature verification)

### Database Tables

#### payment_logs

Stores all webhook events for audit and debugging purposes.

**Fields**:
- `id` (UUID): Primary key
- `type` (TEXT): Stripe event type (e.g., "checkout.session.completed")
- `payload_raw` (JSONB): Full event payload from Stripe
- `stripe_event_id` (TEXT): Unique Stripe event ID
- `status` (TEXT): Processing status ("received", "processing", "processed", "error", "unhandled")
- `error_message` (TEXT): Error message if processing failed
- `created_at` (TIMESTAMPTZ): Event timestamp

**RLS Policies**:
- Only admins can view payment logs

**Indexes**:
- `idx_payment_logs_type`: Index on event type
- `idx_payment_logs_stripe_event_id`: Index on Stripe event ID
- `idx_payment_logs_created_at`: Index on creation date (descending)
- `idx_payment_logs_status`: Index on processing status

## Webhook Events Handled

### 1. checkout.session.completed

Triggered when a Stripe Checkout session is successfully completed.

#### Freight Quote Payment (context = 'freight_quote')

**Metadata Required**:
- `quote_id`: UUID of the freight quote
- `user_id`: UUID of the user
- `context`: "freight_quote"

**Processing Steps**:

1. **Fetch Quote**: Retrieve the freight quote from the database
2. **Update Payment Status**: Set `payment_status` to "paid"
3. **Create Shipment**: Create a new shipment record with:
   - Status: "confirmed"
   - Tracking number: Auto-generated (format: `SHP-[timestamp]-[random]`)
   - Copy data from quote: client, ports, cargo type, incoterm, ETA
4. **Link Shipment**: Update quote with `ordered_as_shipment` reference
5. **Send Email**: Queue confirmation email to client with:
   - Subject: "Votre paiement a été reçu – Universal Shipping Services"
   - Quote details and tracking number
   - Link to client dashboard
6. **Log Event**: Create entry in `events_log` table

**Email Template**:
```
Bonjour,

Nous avons bien reçu votre paiement pour le devis #[quote_id].

Détails du devis:
- Origine: [origin_port]
- Destination: [destination_port]
- Type de cargo: [cargo_type]
- Montant payé: [amount] [currency]

Un suivi d'expédition a été créé avec le numéro: [tracking_number]

Vous pouvez suivre votre expédition depuis votre tableau de bord client:
https://natively.dev/client-dashboard

Merci de votre confiance.

Cordialement,
L'équipe Universal Shipping Services
```

#### Pricing Plan Payment (context = 'pricing_plan')

**Metadata Required**:
- `user_id`: UUID of the user
- `plan_code`: Code of the pricing plan
- `subscription_id`: UUID of the provisional subscription (optional)
- `context`: "pricing_plan"

**Processing Steps**:

1. **Fetch Plan**: Retrieve the pricing plan from the database
2. **Calculate Dates**:
   - Start date: Current date
   - End date: Calculated based on billing period
     - Monthly: +1 month
     - Yearly: +1 year
     - One-time: +1 year
3. **Update/Create Subscription**:
   - If `subscription_id` exists: Update existing subscription
   - Otherwise: Create new subscription
   - Set `status` to "active"
   - Set `is_active` to true
   - Store `stripe_subscription_id` (for recurring subscriptions)
4. **Send Email**: Queue activation email to user with:
   - Subject: "Votre plan [plan_name] est activé – Universal Shipping Services"
   - Subscription details
   - Link to client dashboard
5. **Log Event**: Create entry in `events_log` table

**Email Template**:
```
Bonjour,

Votre plan [plan_name] a été activé avec succès.

Détails de votre abonnement:
- Plan: [plan_name]
- Prix: [price] [currency]
- Période: [billing_period]
- Date de début: [start_date]
- Date de fin: [end_date]

Vous pouvez maintenant profiter de tous les avantages de votre plan depuis votre espace client:
https://natively.dev/client-dashboard

Merci de votre confiance.

Cordialement,
L'équipe Universal Shipping Services
```

### 2. invoice.payment_succeeded

Triggered when a subscription invoice is successfully paid (for recurring subscriptions).

**Processing Steps**:

1. **Find Subscription**: Locate subscription by `stripe_subscription_id`
2. **Update Status**: Set `status` to "active" and `is_active` to true
3. **Log Event**: Create entry in `events_log` with type "subscription_renewed"

### 3. payment_intent.succeeded

Triggered when a payment intent succeeds. This is logged for audit purposes but the main processing is done in `checkout.session.completed`.

### 4. payment_intent.payment_failed

Triggered when a payment intent fails.

**Processing Steps**:

1. **Check Metadata**: Look for `quote_id` in metadata
2. **Update Quote**: If found, set `payment_status` to "failed"
3. **Log Event**: Record the failure in `payment_logs`

### 5. invoice.payment_failed

Triggered when a subscription invoice payment fails.

**Processing Steps**:

1. **Find Subscription**: Locate subscription by `stripe_subscription_id`
2. **Update Status**: Set `status` to "cancelled" and `is_active` to false
3. **Log Event**: Record the failure in `payment_logs`

### 6. customer.subscription.deleted

Triggered when a subscription is cancelled or deleted.

**Processing Steps**:

1. **Find Subscription**: Locate subscription by `stripe_subscription_id`
2. **Update Status**: Set `status` to "cancelled", `is_active` to false, and `end_date` to current date
3. **Log Event**: Record the cancellation in `payment_logs`

## Security

### Webhook Signature Verification

All webhook requests are verified using Stripe's signature verification:

```typescript
const signature = req.headers.get('stripe-signature');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

**Benefits**:
- Ensures requests are genuinely from Stripe
- Prevents replay attacks
- Protects against man-in-the-middle attacks

### Service Role Key

The webhook uses Supabase's service role key to bypass RLS policies and perform administrative operations:

```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

**Important**: The service role key should NEVER be exposed in client code.

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your Supabase Edge Function secrets:

```bash
# Set Stripe webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

The following are already pre-configured:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

### 2. Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the webhook URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your environment variables (step 1)

### 3. Test the Webhook

#### Using Stripe CLI (Local Testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger payment_intent.payment_failed
```

#### Using Stripe Dashboard (Production Testing)

1. Go to **Developers** → **Webhooks** → Your webhook
2. Click **Send test webhook**
3. Select an event type
4. Click **Send test webhook**
5. Check the response and logs

## Monitoring and Debugging

### View Webhook Logs

#### In Supabase Dashboard

1. Go to **Edge Functions** → **stripe-webhook**
2. Click **Logs** tab
3. View real-time logs and errors

#### Query payment_logs Table

```sql
-- View recent webhook events
SELECT * FROM payment_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- View failed events
SELECT * FROM payment_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;

-- View events by type
SELECT type, COUNT(*), 
       SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as processed,
       SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
FROM payment_logs 
GROUP BY type;
```

### Common Issues

#### Issue: Webhook signature verification failed

**Causes**:
- Wrong webhook secret
- Request body was modified
- Replay attack detected

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe Dashboard
2. Ensure the webhook URL is correct
3. Check that no middleware is modifying the request body

#### Issue: Quote/Subscription not found

**Causes**:
- Missing metadata in Stripe session
- Database record was deleted
- Wrong ID in metadata

**Solution**:
1. Check the `payment_logs` table for the event payload
2. Verify metadata was correctly set when creating the checkout session
3. Check database for the referenced record

#### Issue: Email not sent

**Causes**:
- Email address not found
- Email notification queue failed
- Email service not configured

**Solution**:
1. Check `email_notifications` table for queued emails
2. Verify the `process-email-notifications` Edge Function is running
3. Check email service configuration

#### Issue: Shipment not created

**Causes**:
- Missing required fields in quote
- Database constraint violation
- RLS policy blocking insert

**Solution**:
1. Check Edge Function logs for error details
2. Verify quote has all required fields (ports, client, etc.)
3. Ensure service role key is being used (bypasses RLS)

## Testing Scenarios

### Test 1: Successful Freight Quote Payment

1. Create a freight quote with a valid amount
2. Set `payment_status` to "unpaid"
3. Navigate to quote details page
4. Click "Pay this Quote"
5. Complete payment with test card: `4242 4242 4242 4242`
6. Verify:
   - Quote `payment_status` is "paid"
   - Shipment is created with tracking number
   - Email notification is queued
   - Event is logged in `events_log`
   - Webhook event is logged in `payment_logs`

### Test 2: Successful Pricing Plan Payment

1. Navigate to pricing page
2. Click "Choisir ce plan" for a plan
3. Complete payment with test card: `4242 4242 4242 4242`
4. Verify:
   - Subscription `status` is "active"
   - Subscription `is_active` is true
   - Start and end dates are set correctly
   - Email notification is queued
   - Event is logged in `events_log`
   - Webhook event is logged in `payment_logs`

### Test 3: Failed Payment

1. Start payment process
2. Use declined test card: `4000 0000 0000 0002`
3. Verify:
   - Quote `payment_status` is "failed" (for quotes)
   - Subscription `status` is "cancelled" (for subscriptions)
   - Failure is logged in `payment_logs`

### Test 4: Subscription Renewal

1. Create a recurring subscription
2. Wait for invoice to be generated (or trigger manually)
3. Verify:
   - Subscription remains "active"
   - Event is logged in `events_log`
   - Webhook event is logged in `payment_logs`

### Test 5: Subscription Cancellation

1. Cancel a subscription in Stripe Dashboard
2. Verify:
   - Subscription `status` is "cancelled"
   - Subscription `is_active` is false
   - End date is set to current date
   - Webhook event is logged in `payment_logs`

## Performance Considerations

### Idempotency

Stripe may send the same webhook event multiple times. The webhook handler should be idempotent:

- Use `stripe_event_id` to detect duplicate events
- Check current status before updating (e.g., don't process if already "paid")
- Use database transactions for critical operations

### Async Processing

For long-running tasks, consider using background jobs:

```typescript
// Queue email for background processing
await supabaseClient.from('email_notifications').insert({
  recipient_email: email,
  email_type: 'quote_payment_received',
  subject: subject,
  body: body,
  status: 'pending',
});
```

### Error Handling

All errors are caught and logged:

```typescript
try {
  // Process webhook
} catch (error) {
  console.error('Error processing webhook:', error);
  await logWebhookEvent(
    supabaseClient,
    event.type,
    event.data.object,
    event.id,
    'error',
    error.message
  );
}
```

## Best Practices

1. **Always verify webhook signatures** - Never trust incoming requests without verification
2. **Log all events** - Use `payment_logs` table for audit trail
3. **Handle failures gracefully** - Don't throw errors that would cause Stripe to retry indefinitely
4. **Use idempotent operations** - Ensure duplicate events don't cause issues
5. **Monitor webhook health** - Set up alerts for failed webhooks
6. **Test thoroughly** - Use Stripe CLI and test mode before going live
7. **Keep secrets secure** - Never expose webhook secrets or service role keys
8. **Document metadata** - Always include necessary context in Stripe metadata
9. **Validate data** - Check that all required fields exist before processing
10. **Return 200 quickly** - Acknowledge receipt immediately, process asynchronously if needed

## Related Documentation

- [Stripe Payment Integration](./STRIPE_PAYMENT_INTEGRATION.md)
- [Freight Quote Payment](./FREIGHT_QUOTE_PAYMENT.md)
- [Subscription Management Module](./SUBSCRIPTION_MANAGEMENT_MODULE.md)
- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## Support

For issues related to:
- **Webhook processing**: Check Edge Function logs and `payment_logs` table
- **Stripe events**: Check Stripe Dashboard webhook logs
- **Database updates**: Check Supabase logs and RLS policies
- **Email delivery**: Check `email_notifications` table and email service logs
