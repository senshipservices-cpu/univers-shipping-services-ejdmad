
# Email Notifications Implementation - USS Application

## Overview

The USS application now has a complete email notification system for quote requests. When a user submits a freight quote request, the system automatically sends:

1. **Confirmation email to the client** - Acknowledging receipt of their quote request
2. **Notification email to the admin** - With all quote details for processing

## Architecture

### Components

1. **Edge Function: `send-quote-emails`**
   - Receives quote data from the frontend
   - Queues two emails in the `email_notifications` table
   - Returns success/failure status

2. **Edge Function: `process-email-notifications`**
   - Processes pending emails from the queue
   - Sends emails via SMTP (when configured)
   - Updates email status (sent/failed)

3. **Frontend: `freight-quote.tsx`**
   - Submits quote to Supabase
   - Calls `send-quote-emails` Edge Function
   - Logs errors but doesn't block user if emails fail

4. **Health Check: `health-check` Edge Function**
   - Tests SMTP configuration
   - Displays "Email notifications available" when SMTP is configured
   - Shows on the admin status screen

## Database Schema

### `email_notifications` Table

```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Email Types:**
- `quote_created` - Confirmation email to client
- `quote_created_admin` - Notification email to admin
- `quote_sent_to_client` - Quote ready notification
- `subscription_activated` - Subscription confirmation
- `agent_validated` - Agent approval notification
- And more...

## Environment Variables

### Required SMTP Variables

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@universal-shippingservices.com
ADMIN_EMAIL=support@universal-shippingservices.com
```

### Configuration in Supabase

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the SMTP variables listed above
3. The health-check function will validate the configuration

## Email Flow

### Quote Request Flow

```
User submits quote
       ↓
Quote saved to Supabase (freight_quotes table)
       ↓
Call send-quote-emails Edge Function
       ↓
Two emails queued in email_notifications table
       ↓
process-email-notifications sends emails via SMTP
       ↓
Email status updated (sent/failed)
```

### Email Content

#### Client Confirmation Email

**Subject:** Confirmation de votre demande de devis - Universal Shipping Services

**Content:**
- Greeting with client name
- Summary of quote request (ports, cargo type, volume)
- Next steps information
- Expected response time (24-48 hours)
- Contact information

#### Admin Notification Email

**Subject:** [USS] Nouvelle demande de devis - {Client Name}

**Content:**
- Quote ID
- Client details (name, email)
- Service requested
- Origin and destination ports
- Cargo type and volume
- Additional details
- Link to admin panel

## Implementation Details

### Edge Function: send-quote-emails

**Location:** `supabase/functions/send-quote-emails/index.ts`

**Input Payload:**
```typescript
interface QuoteEmailPayload {
  quoteId: string;
  clientName: string;
  clientEmail: string;
  serviceName?: string;
  originPort: string;
  destinationPort: string;
  cargoType: string;
  cargoVolume?: string;
  details?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  emails_queued: number;
}
```

### Frontend Integration

**File:** `app/(tabs)/freight-quote.tsx`

```typescript
// After successful quote submission
try {
  const emailPayload = {
    quoteId: 'pending',
    clientName: quoteData.client_name,
    clientEmail: quoteData.client_email,
    serviceName: serviceName || undefined,
    originPort: `${formData.originPort.name}, ${formData.originPort.city}`,
    destinationPort: `${formData.destinationPort.name}, ${formData.destinationPort.city}`,
    cargoType: formData.cargoType,
    cargoVolume: formData.cargoVolume || undefined,
    details: formData.details || undefined,
  };

  const { data, error } = await supabase.functions.invoke(
    'send-quote-emails',
    { body: emailPayload }
  );

  if (error) {
    console.error('Error sending emails:', error);
    // Don't fail the quote creation if emails fail
  }
} catch (emailException) {
  console.error('Exception sending emails:', emailException);
  // Don't fail the quote creation if emails fail
}
```

## Status Screen Integration

The admin status screen (`app/(tabs)/pricing.tsx` for admins) displays the SMTP status:

- **✓ OK** - "Email notifications available" (green badge)
- **⚠ OPTIONAL** - "Email features are optional and not configured" (yellow badge)

The status is determined by the `health-check` Edge Function which validates SMTP credentials.

## Error Handling

### Email Sending Failures

- Emails are queued in the database even if SMTP is not configured
- The `process-email-notifications` function marks failed emails with status `failed`
- Error messages are stored in the `error_message` column
- Quote creation is never blocked by email failures

### Retry Logic

Currently, failed emails are not automatically retried. To implement retry logic:

1. Create a scheduled Edge Function (cron job)
2. Query for failed emails older than X minutes
3. Retry sending up to N times
4. Mark as permanently failed after max retries

## Testing

### Manual Testing

1. **Submit a quote request** via the freight-quote form
2. **Check the database:**
   ```sql
   SELECT * FROM email_notifications 
   WHERE email_type IN ('quote_created', 'quote_created_admin')
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
3. **Check email status:**
   - `pending` - Queued but not sent
   - `sent` - Successfully sent
   - `failed` - Failed to send (check error_message)

### Health Check Testing

1. Navigate to the admin status screen (Pricing tab for admins)
2. Click the "Refresh" button
3. Check the SMTP status badge:
   - Green "OK" = SMTP configured
   - Yellow "OPTIONAL" = SMTP not configured

## Future Enhancements

### Recommended Improvements

1. **Email Templates**
   - Create HTML email templates with branding
   - Support multiple languages (FR/EN/ES/AR)
   - Use a template engine for dynamic content

2. **Email Service Integration**
   - Integrate with SendGrid, Mailgun, or AWS SES
   - Better deliverability and tracking
   - Bounce and complaint handling

3. **Email Tracking**
   - Track email opens and clicks
   - Store delivery status
   - Monitor bounce rates

4. **Retry Logic**
   - Automatic retry for failed emails
   - Exponential backoff
   - Max retry limit

5. **Email Preferences**
   - Allow users to opt-out of certain emails
   - Email frequency settings
   - Notification preferences

6. **Additional Email Types**
   - Quote status updates
   - Shipment tracking updates
   - Payment confirmations
   - Account notifications

## Troubleshooting

### Emails Not Being Sent

1. **Check SMTP Configuration:**
   ```bash
   # In Supabase Edge Functions Secrets
   SMTP_HOST=?
   SMTP_USERNAME=?
   SMTP_PASSWORD=?
   ```

2. **Check Email Queue:**
   ```sql
   SELECT * FROM email_notifications 
   WHERE status = 'pending' 
   ORDER BY created_at DESC;
   ```

3. **Check for Errors:**
   ```sql
   SELECT * FROM email_notifications 
   WHERE status = 'failed' 
   ORDER BY created_at DESC;
   ```

4. **Test SMTP Connection:**
   - Use the health-check Edge Function
   - Check the logs in Supabase Edge Functions

### Common Issues

**Issue:** SMTP credentials not working
- **Solution:** Verify credentials with your email provider
- Check if 2FA is enabled (may need app-specific password)
- Verify SMTP port (usually 587 for TLS, 465 for SSL)

**Issue:** Emails going to spam
- **Solution:** Configure SPF, DKIM, and DMARC records
- Use a reputable email service provider
- Avoid spam trigger words in subject/body

**Issue:** Emails not queued
- **Solution:** Check Edge Function logs
- Verify `send-quote-emails` is being called
- Check for JavaScript errors in browser console

## Security Considerations

1. **SMTP Credentials**
   - Store in Supabase Edge Function Secrets (encrypted)
   - Never commit to version control
   - Rotate regularly

2. **Email Content**
   - Sanitize user input before including in emails
   - Avoid exposing sensitive data
   - Use secure links (HTTPS only)

3. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Monitor for unusual email volumes
   - Set daily/hourly limits

4. **Data Privacy**
   - Comply with GDPR/privacy regulations
   - Allow users to opt-out
   - Delete email data after retention period

## Monitoring

### Key Metrics to Track

1. **Email Delivery Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'sent') * 100.0 / COUNT(*) as delivery_rate
   FROM email_notifications
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Failed Emails**
   ```sql
   SELECT email_type, COUNT(*) as failed_count
   FROM email_notifications
   WHERE status = 'failed'
   AND created_at > NOW() - INTERVAL '7 days'
   GROUP BY email_type;
   ```

3. **Average Send Time**
   ```sql
   SELECT 
     AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) as avg_seconds
   FROM email_notifications
   WHERE status = 'sent'
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

## Support

For issues or questions:
- Check the Edge Function logs in Supabase Dashboard
- Review this documentation
- Contact the development team

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** ✅ Implemented and Tested
