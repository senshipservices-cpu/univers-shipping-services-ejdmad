
# Email Automation System

## Overview

The UNIVERSAL SHIPPING SERVICES app now includes a comprehensive email automation system that handles:

1. **Shipment Creation Notifications** - Automatic emails when new shipments are created
2. **Shipment Status Change Notifications** - Automatic emails when shipment status changes
3. **Agent Validation Notifications** - Automatic emails when agent applications are approved
4. **Daily Subscription Expiration Checks** - Automated job that expires subscriptions and sends notifications

## Architecture

### Database Components

#### 1. Email Notifications Table
```sql
email_notifications (
  id uuid PRIMARY KEY,
  recipient_email text NOT NULL,
  email_type text NOT NULL,
  subject text,
  body text,
  metadata jsonb,
  sent_at timestamptz,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
)
```

This table acts as a queue for all email notifications. Database triggers insert records here, and the Edge Function processes them.

#### 2. Database Triggers

**Shipment Creation Trigger**
- Fires on INSERT to `shipments` table
- Extracts client email and shipment details
- Creates a `shipment_created` notification record

**Shipment Status Change Trigger**
- Fires on UPDATE to `shipments` table
- Only triggers if `current_status` actually changed
- Creates a `shipment_status_changed` notification record

**Agent Validation Trigger**
- Fires on UPDATE to `global_agents` table
- Only triggers when status changes to 'validated'
- Creates an `agent_validated` notification record

#### 3. Scheduled Jobs (pg_cron)

**Daily Subscription Expiration Check**
- Runs daily at 2:00 AM
- Finds subscriptions where `end_date < CURRENT_DATE` and `is_active = true`
- Updates subscription to `is_active = false` and `status = 'expired'`
- Creates a `subscription_expired` notification record for each expired subscription

**Email Processing Job**
- Runs every 5 minutes
- Calls the `process-email-notifications` Edge Function

### Edge Function: process-email-notifications

This Edge Function:
1. Fetches up to 50 pending email notifications from the database
2. For each notification:
   - Generates HTML email body based on email type
   - Sends email (currently logs to console - needs email service integration)
   - Updates notification status to 'sent' or 'failed'
3. Returns summary of processed notifications

#### Email Types and Templates

**shipment_created**
- Subject: "New Shipment Created - {tracking_number}"
- Includes: tracking number, status, shipment ID
- Call to action: View in client dashboard

**shipment_status_changed**
- Subject: "Shipment Status Update - {tracking_number}"
- Includes: tracking number, old status, new status, ETA
- Call to action: View details in dashboard

**agent_validated**
- Subject: "Your Global Agent Application Has Been Approved"
- Includes: company name, port, activities, premium status
- Call to action: Welcome message

**subscription_expired**
- Subject: "Your Subscription Has Expired"
- Includes: plan type, expiration date
- Call to action: Renew subscription

## Email Service Integration

### Current Status
The system is fully functional but currently **logs emails to console** instead of sending them. This allows testing without an email service.

### Integration Steps

To integrate with an email service provider (e.g., Resend, SendGrid, AWS SES):

1. **Set up environment variable** in Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=your_api_key_here
   # or
   supabase secrets set SENDGRID_API_KEY=your_api_key_here
   ```

2. **Update the Edge Function** (`process-email-notifications/index.ts`):
   
   Uncomment and configure the email sending code:
   
   ```typescript
   // Example with Resend
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

3. **Redeploy the Edge Function**:
   ```bash
   supabase functions deploy process-email-notifications
   ```

### Recommended Email Service Providers

1. **Resend** (Recommended)
   - Modern API
   - Good deliverability
   - Generous free tier
   - Easy integration

2. **SendGrid**
   - Established provider
   - Comprehensive features
   - Good documentation

3. **AWS SES**
   - Cost-effective for high volume
   - Requires more setup

## Testing

### Manual Testing

1. **Test Shipment Creation Email**:
   ```sql
   INSERT INTO shipments (
     tracking_number, client, origin_port, destination_port, 
     current_status, cargo_type
   ) VALUES (
     'TEST-' || gen_random_uuid()::text,
     (SELECT id FROM clients LIMIT 1),
     (SELECT id FROM ports LIMIT 1),
     (SELECT id FROM ports OFFSET 1 LIMIT 1),
     'draft',
     'Test Cargo'
   );
   ```

2. **Test Status Change Email**:
   ```sql
   UPDATE shipments 
   SET current_status = 'in_transit'
   WHERE tracking_number = 'YOUR_TRACKING_NUMBER';
   ```

3. **Test Agent Validation Email**:
   ```sql
   UPDATE global_agents 
   SET status = 'validated'
   WHERE id = 'YOUR_AGENT_ID';
   ```

4. **Test Subscription Expiration**:
   ```sql
   -- Manually call the expiration function
   SELECT expire_subscriptions();
   ```

5. **Process Pending Emails**:
   ```bash
   # Call the Edge Function directly
   curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

### View Email Queue

```sql
-- View pending emails
SELECT * FROM email_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View sent emails
SELECT * FROM email_notifications 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 20;

-- View failed emails
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

## Monitoring

### Check Email Processing Status

```sql
-- Email statistics
SELECT 
  email_type,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM email_notifications
GROUP BY email_type, status
ORDER BY email_type, status;

-- Recent activity
SELECT 
  email_type,
  recipient_email,
  status,
  created_at,
  sent_at,
  error_message
FROM email_notifications
ORDER BY created_at DESC
LIMIT 50;
```

### Check Scheduled Jobs

```sql
-- View cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

## Troubleshooting

### Emails Not Being Created

1. Check if triggers are active:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname LIKE '%notify%';
   ```

2. Check trigger functions exist:
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname LIKE '%notify%';
   ```

### Emails Not Being Sent

1. Check pending emails:
   ```sql
   SELECT COUNT(*) FROM email_notifications WHERE status = 'pending';
   ```

2. Check Edge Function logs:
   - Go to Supabase Dashboard > Edge Functions > process-email-notifications > Logs

3. Manually trigger email processing:
   ```bash
   curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```

### Subscription Expiration Not Running

1. Check if pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check cron schedule:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'expire-subscriptions-daily';
   ```

3. Manually run expiration:
   ```sql
   SELECT expire_subscriptions();
   ```

## Security Considerations

1. **RLS Policies**: Email notifications table has RLS enabled
   - Authenticated users can view notifications
   - Only service role can insert/update

2. **Email Content**: Never include sensitive data like passwords or payment details in emails

3. **Rate Limiting**: The Edge Function processes max 50 emails per invocation to prevent overload

4. **Error Handling**: Failed emails are marked with error messages for debugging

## Future Enhancements

1. **Email Templates**: Move HTML templates to a separate file or database table
2. **Retry Logic**: Implement exponential backoff for failed emails
3. **Email Preferences**: Allow users to opt-out of certain notification types
4. **Localization**: Send emails in user's preferred language
5. **Rich Notifications**: Add attachments (PDFs, documents)
6. **SMS Integration**: Add SMS notifications for critical updates
7. **Webhook Support**: Allow external systems to subscribe to events
8. **Analytics**: Track email open rates and click-through rates

## API Reference

### Edge Function Endpoint

```
POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications
```

**Headers**:
- `Authorization: Bearer {ANON_KEY or SERVICE_ROLE_KEY}`

**Response**:
```json
{
  "message": "Email notifications processed",
  "processed": 5,
  "results": [
    {
      "id": "uuid",
      "status": "sent"
    }
  ]
}
```

### Database Functions

**expire_subscriptions()**
- No parameters
- Returns: void
- Side effects: Updates subscriptions, creates email notifications

**trigger_email_processing()**
- No parameters
- Returns: void
- Side effects: Logs notification about pending emails

## Maintenance

### Regular Tasks

1. **Weekly**: Review failed emails and investigate errors
2. **Monthly**: Archive old email notifications (>90 days)
3. **Quarterly**: Review email templates and update as needed

### Archiving Old Notifications

```sql
-- Archive notifications older than 90 days
DELETE FROM email_notifications 
WHERE created_at < NOW() - INTERVAL '90 days' 
AND status IN ('sent', 'failed');
```

## Support

For issues or questions about the email automation system:
1. Check the logs in Supabase Dashboard
2. Review this documentation
3. Contact the development team
