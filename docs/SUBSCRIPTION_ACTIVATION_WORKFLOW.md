
# Subscription Activation Workflow

## Overview

This document describes the automated subscription activation workflow that simulates payment processing. When a user subscribes to a plan, the subscription is automatically activated and a confirmation email is sent.

## Architecture

The workflow consists of three main components:

1. **Database Trigger**: Automatically activates pending subscriptions
2. **Email Notification System**: Queues confirmation emails
3. **Edge Function**: Processes and sends email notifications

## How It Works

### 1. Subscription Creation

When a user confirms a subscription in the app (`subscription-confirm.tsx`), a new record is created in the `subscriptions` table with:

```typescript
{
  client: client.id,
  plan_type: 'digital_portal', // or other plan types
  start_date: '2024-01-15',
  end_date: '2024-02-14',
  is_active: false,
  status: 'pending',
  payment_provider: 'manual',
  notes: 'Subscription created via app on ...'
}
```

### 2. Automatic Activation (Database Trigger)

The `activate_pending_subscription()` trigger function automatically:

1. **Detects** new subscriptions with `status = 'pending'` and `is_active = false`
2. **Updates** the subscription:
   - Sets `is_active = true`
   - Sets `status = 'active'`
   - Updates `updated_at` timestamp
3. **Creates** an email notification record in `email_notifications` table
4. **Logs** the activation for monitoring

#### Trigger Function Details

```sql
CREATE OR REPLACE FUNCTION activate_pending_subscription()
RETURNS TRIGGER AS $$
DECLARE
  client_record RECORD;
  client_email TEXT;
  client_name TEXT;
BEGIN
  IF NEW.status = 'pending' AND NEW.is_active = false THEN
    -- Get client information
    SELECT c.email, c.company_name, c.contact_name
    INTO client_record
    FROM clients c
    WHERE c.id = NEW.client;
    
    -- Update subscription to active
    UPDATE subscriptions
    SET 
      is_active = true,
      status = 'active',
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Create email notification
    IF client_email != '' THEN
      INSERT INTO email_notifications (
        recipient_email,
        email_type,
        subject,
        metadata,
        status
      ) VALUES (
        client_email,
        'subscription_activated',
        'Votre abonnement a été activé',
        jsonb_build_object(
          'subscription_id', NEW.id,
          'client_name', client_name,
          'company_name', client_record.company_name,
          'plan_type', NEW.plan_type,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date
        ),
        'pending'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Email Notification Processing

The `process-email-notifications` Edge Function:

1. **Fetches** pending email notifications from the database
2. **Generates** HTML email content based on email type
3. **Sends** emails (currently logs to console, ready for email service integration)
4. **Updates** notification status to 'sent' or 'failed'

#### Email Template for Subscription Activation

The email includes:
- Congratulations message
- Subscription details (plan type, dates, status)
- List of plan features
- Call-to-action to access client dashboard

## Database Schema

### Subscriptions Table

```sql
subscriptions (
  id UUID PRIMARY KEY,
  client UUID REFERENCES clients(id),
  plan_type plan_type ENUM,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  payment_provider TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Email Notifications Table

```sql
email_notifications (
  id UUID PRIMARY KEY,
  recipient_email TEXT,
  email_type TEXT,
  subject TEXT,
  body TEXT,
  metadata JSONB,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP
)
```

## Workflow Sequence

```
User subscribes
    ↓
Subscription record created (status='pending', is_active=false)
    ↓
Database trigger fires
    ↓
Subscription updated (status='active', is_active=true)
    ↓
Email notification created (status='pending')
    ↓
Edge Function processes notification
    ↓
Email sent to user
    ↓
Notification updated (status='sent')
    ↓
User receives confirmation email
```

## Testing the Workflow

### 1. Create a Test Subscription

```typescript
// In the app or via SQL
const { data, error } = await supabase
  .from('subscriptions')
  .insert({
    client: 'client-uuid',
    plan_type: 'digital_portal',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: false,
    status: 'pending',
  })
  .select()
  .single();
```

### 2. Verify Activation

Check that the subscription was automatically activated:

```sql
SELECT * FROM subscriptions WHERE id = 'subscription-uuid';
-- Should show: is_active = true, status = 'active'
```

### 3. Check Email Notification

Verify that an email notification was created:

```sql
SELECT * FROM email_notifications 
WHERE email_type = 'subscription_activated' 
ORDER BY created_at DESC 
LIMIT 1;
```

### 4. Process Email Notifications

Call the Edge Function to process pending emails:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-email-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or set up a cron job to run this automatically.

## Email Service Integration

To integrate with a real email service (e.g., Resend, SendGrid):

1. **Add API Key** to Supabase secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_api_key
   ```

2. **Uncomment email sending code** in `process-email-notifications/index.ts`:
   ```typescript
   const resendApiKey = Deno.env.get('RESEND_API_KEY');
   const response = await fetch('https://api.resend.com/emails', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${resendApiKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       from: 'noreply@universalshipping.com',
       to: notification.recipient_email,
       subject: notification.subject,
       html: emailBody,
     }),
   });
   ```

3. **Set up a cron job** to process emails regularly:
   - Use Supabase Edge Functions with cron triggers
   - Or use an external service like GitHub Actions

## Plan Types and Features

The system supports the following plan types:

- **basic**: Free access to basic services
- **premium_tracking**: Advanced shipment tracking (€49/month)
- **enterprise_logistics**: Full logistics solution (€99/month)
- **digital_portal**: Complete digital maritime portal (€149/month)
- **agent_listing**: Global agent listing (€99/year)

Each plan has specific features that are included in the confirmation email.

## Future Enhancements

### Payment Integration

When integrating with Stripe or PayPal:

1. **Remove automatic activation**: Modify the trigger to only activate after payment confirmation
2. **Add payment webhook**: Create an Edge Function to handle payment provider webhooks
3. **Update subscription status**: Set `is_active = true` only after successful payment
4. **Add payment reference**: Store payment ID in `payment_reference` field

### Example Stripe Integration

```typescript
// Edge Function: handle-stripe-webhook
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    signature,
    webhookSecret
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Update subscription
    await supabase
      .from('subscriptions')
      .update({
        is_active: true,
        status: 'active',
        payment_reference: paymentIntent.id,
      })
      .eq('id', paymentIntent.metadata.subscription_id);
  }
});
```

## Monitoring and Logs

### Check Trigger Execution

```sql
-- View recent subscription activations
SELECT 
  s.id,
  s.client,
  s.plan_type,
  s.status,
  s.is_active,
  s.created_at,
  s.updated_at
FROM subscriptions s
WHERE s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 10;
```

### Check Email Notifications

```sql
-- View pending emails
SELECT * FROM email_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View sent emails
SELECT * FROM email_notifications 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;

-- View failed emails
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Edge Function Logs

View logs in Supabase Dashboard:
1. Go to Edge Functions
2. Select `process-email-notifications`
3. View logs tab

Or use the CLI:
```bash
supabase functions logs process-email-notifications
```

## Security Considerations

1. **Trigger Security**: The trigger function uses `SECURITY DEFINER` to ensure it has the necessary permissions
2. **Email Validation**: Client email is validated before sending notifications
3. **RLS Policies**: Ensure proper RLS policies are in place for the `subscriptions` and `email_notifications` tables
4. **API Keys**: Store email service API keys as Supabase secrets, never in code

## Troubleshooting

### Subscription Not Activating

1. Check if trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_activate_pending_subscription';
   ```

2. Check trigger function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'activate_pending_subscription';
   ```

3. View trigger logs:
   ```sql
   -- Enable logging
   SET client_min_messages TO NOTICE;
   ```

### Email Not Sending

1. Check if notification was created:
   ```sql
   SELECT * FROM email_notifications WHERE email_type = 'subscription_activated';
   ```

2. Check notification status:
   - `pending`: Waiting to be processed
   - `sent`: Successfully sent
   - `failed`: Error occurred (check `error_message` field)

3. Manually trigger email processing:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/process-email-notifications
   ```

## Related Documentation

- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)
- [Subscription Access Control](./SUBSCRIPTION_ACCESS_CONTROL.md)
- [Digital Portal Implementation](./DIGITAL_PORTAL_IMPLEMENTATION.md)
