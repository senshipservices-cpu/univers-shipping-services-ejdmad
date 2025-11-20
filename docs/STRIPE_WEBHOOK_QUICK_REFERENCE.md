
# Stripe Webhook Quick Reference

## Webhook Endpoint

**URL**: `https://[your-project-ref].supabase.co/functions/v1/stripe-webhook`

**Method**: POST

**Authentication**: Stripe signature verification (no JWT required)

## Environment Variables

```bash
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...    # Already configured
SUPABASE_URL=...                 # Pre-configured
SUPABASE_SERVICE_ROLE_KEY=...    # Pre-configured
```

## Supported Events

| Event Type | Description | Action |
|------------|-------------|--------|
| `checkout.session.completed` | Payment completed | Update quote/subscription, create shipment, send email |
| `invoice.payment_succeeded` | Subscription payment succeeded | Renew subscription |
| `payment_intent.succeeded` | Payment intent succeeded | Log for audit |
| `payment_intent.payment_failed` | Payment failed | Mark quote as failed |
| `invoice.payment_failed` | Subscription payment failed | Cancel subscription |
| `customer.subscription.deleted` | Subscription cancelled | Update subscription status |

## Metadata Requirements

### Freight Quote Payment

```json
{
  "quote_id": "uuid",
  "user_id": "uuid",
  "context": "freight_quote"
}
```

### Pricing Plan Payment

```json
{
  "user_id": "uuid",
  "plan_code": "PLAN_CODE",
  "subscription_id": "uuid",
  "context": "pricing_plan"
}
```

## Database Tables

### payment_logs

Logs all webhook events:

```sql
SELECT * FROM payment_logs 
WHERE type = 'checkout.session.completed' 
ORDER BY created_at DESC 
LIMIT 10;
```

### freight_quotes

Payment status values:
- `unpaid`: Not paid yet
- `processing`: Payment in progress
- `paid`: Successfully paid
- `failed`: Payment failed
- `refunded`: Payment refunded

### subscriptions

Status values:
- `pending`: Awaiting payment
- `active`: Currently active
- `cancelled`: Cancelled by user or failed payment
- `expired`: Subscription period ended

## Common Queries

### View Recent Webhook Events

```sql
SELECT 
  type,
  status,
  stripe_event_id,
  created_at,
  error_message
FROM payment_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### View Failed Webhooks

```sql
SELECT * FROM payment_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;
```

### View Paid Quotes

```sql
SELECT 
  fq.id,
  fq.quote_amount,
  fq.payment_status,
  fq.stripe_payment_intent_id,
  fq.ordered_as_shipment,
  c.company_name
FROM freight_quotes fq
LEFT JOIN clients c ON fq.client = c.id
WHERE fq.payment_status = 'paid'
ORDER BY fq.updated_at DESC;
```

### View Active Subscriptions

```sql
SELECT 
  s.id,
  s.plan_code,
  s.status,
  s.start_date,
  s.end_date,
  s.stripe_subscription_id,
  c.company_name
FROM subscriptions s
LEFT JOIN clients c ON s.client = c.id
WHERE s.is_active = true
ORDER BY s.created_at DESC;
```

## Testing Commands

### Stripe CLI

```bash
# Forward webhooks to local
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger payment_intent.payment_failed
stripe trigger customer.subscription.deleted
```

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0025 0000 3155 | Requires authentication |

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL in Stripe Dashboard
2. Verify webhook is enabled
3. Check selected events
4. Test with "Send test webhook" button

### Signature Verification Failed

1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Check webhook endpoint secret in Stripe Dashboard
3. Ensure request body is not modified

### Database Update Failed

1. Check Edge Function logs
2. Verify service role key is configured
3. Check RLS policies (should be bypassed with service role)
4. Verify foreign key constraints

### Email Not Sent

1. Check `email_notifications` table
2. Verify `process-email-notifications` function is running
3. Check email service configuration

## Monitoring

### View Logs in Supabase

1. Go to **Edge Functions** → **stripe-webhook**
2. Click **Logs** tab
3. Filter by time range or search for errors

### Set Up Alerts

Monitor these metrics:
- Webhook failure rate
- Processing time
- Error count by event type
- Payment success rate

## Quick Actions

### Manually Process Failed Webhook

```sql
-- Find failed event
SELECT * FROM payment_logs 
WHERE status = 'error' 
AND type = 'checkout.session.completed'
ORDER BY created_at DESC 
LIMIT 1;

-- Get event details and manually process
-- (Use Stripe Dashboard to resend webhook)
```

### Retry Failed Payment

```sql
-- Update quote status to allow retry
UPDATE freight_quotes 
SET payment_status = 'unpaid'
WHERE id = 'quote-uuid';
```

### Cancel Subscription

```sql
-- Cancel subscription manually
UPDATE subscriptions 
SET 
  status = 'cancelled',
  is_active = false,
  end_date = CURRENT_DATE
WHERE id = 'subscription-uuid';
```

## Security Checklist

- [ ] Webhook secret is configured
- [ ] Signature verification is enabled
- [ ] Service role key is not exposed
- [ ] HTTPS is used for webhook endpoint
- [ ] Events are logged for audit
- [ ] Error handling is implemented
- [ ] Idempotency is considered
- [ ] Test mode is used for development

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Full Implementation Guide](./STRIPE_WEBHOOK_IMPLEMENTATION.md)
