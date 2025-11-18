
# Email Service Integration Guide

## Quick Start: Integrating with Resend (Recommended)

### Step 1: Sign up for Resend
1. Go to https://resend.com
2. Create a free account
3. Verify your email address

### Step 2: Get Your API Key
1. Go to API Keys section in Resend dashboard
2. Create a new API key
3. Copy the key (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)
1. Go to Domains section
2. Add your domain (e.g., `universalshipping.com`)
3. Add DNS records as instructed
4. Wait for verification

### Step 4: Set Supabase Secret
```bash
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Or via Supabase Dashboard:
# Project Settings > Edge Functions > Secrets
# Add: RESEND_API_KEY = re_your_api_key_here
```

### Step 5: Update Edge Function

Open the Edge Function file and update the email sending section:

```typescript
// In process-email-notifications/index.ts
// Find this section (around line 60):

// TODO: Integrate with email service (SendGrid, Resend, etc.)
// Example with Resend:

// REPLACE THE COMMENT WITH THIS CODE:
const resendApiKey = Deno.env.get('RESEND_API_KEY');
if (!resendApiKey) {
  throw new Error('RESEND_API_KEY not configured');
}

const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'UNIVERSAL SHIPPING SERVICES <noreply@universalshipping.com>',
    to: notification.recipient_email,
    subject: notification.subject,
    html: emailBody,
  }),
});

if (!emailResponse.ok) {
  const errorData = await emailResponse.json();
  throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
}

const emailResult = await emailResponse.json();
console.log('Email sent successfully:', emailResult);
```

### Step 6: Redeploy Edge Function

```bash
# Using Supabase CLI
supabase functions deploy process-email-notifications

# Or via Supabase Dashboard:
# Edge Functions > process-email-notifications > Deploy
```

### Step 7: Test

```bash
# Create a test shipment to trigger an email
curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/rest/v1/shipments \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "TEST-001",
    "client": "YOUR_CLIENT_ID",
    "origin_port": "PORT_ID_1",
    "destination_port": "PORT_ID_2",
    "current_status": "draft"
  }'

# Wait a few minutes, then check if email was sent
curl -X POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/process-email-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Alternative: Integrating with SendGrid

### Step 1: Sign up for SendGrid
1. Go to https://sendgrid.com
2. Create a free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key
1. Go to Settings > API Keys
2. Create API Key with "Mail Send" permissions
3. Copy the key (starts with `SG.`)

### Step 3: Verify Sender Identity
1. Go to Settings > Sender Authentication
2. Verify a single sender email OR
3. Authenticate your domain (recommended for production)

### Step 4: Set Supabase Secret
```bash
supabase secrets set SENDGRID_API_KEY=SG.your_api_key_here
```

### Step 5: Update Edge Function

```typescript
// In process-email-notifications/index.ts

const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
if (!sendgridApiKey) {
  throw new Error('SENDGRID_API_KEY not configured');
}

const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sendgridApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: notification.recipient_email }],
      subject: notification.subject,
    }],
    from: {
      email: 'noreply@universalshipping.com',
      name: 'UNIVERSAL SHIPPING SERVICES'
    },
    content: [{
      type: 'text/html',
      value: emailBody,
    }],
  }),
});

if (!emailResponse.ok) {
  const errorText = await emailResponse.text();
  throw new Error(`SendGrid API error: ${errorText}`);
}

console.log('Email sent successfully via SendGrid');
```

---

## Alternative: Integrating with AWS SES

### Step 1: Set up AWS SES
1. Go to AWS Console > SES
2. Verify your email address or domain
3. Request production access (if needed)

### Step 2: Create IAM User
1. Create IAM user with SES send permissions
2. Generate access key and secret key

### Step 3: Set Supabase Secrets
```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_access_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret_key
supabase secrets set AWS_REGION=us-east-1
```

### Step 4: Update Edge Function

```typescript
// In process-email-notifications/index.ts
// Note: AWS SES requires signing requests, so we'll use the AWS SDK

import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.0.0";

const sesClient = new SESClient({
  region: Deno.env.get('AWS_REGION') || 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
});

const command = new SendEmailCommand({
  Source: 'noreply@universalshipping.com',
  Destination: {
    ToAddresses: [notification.recipient_email],
  },
  Message: {
    Subject: {
      Data: notification.subject,
    },
    Body: {
      Html: {
        Data: emailBody,
      },
    },
  },
});

const response = await sesClient.send(command);
console.log('Email sent successfully via AWS SES:', response.MessageId);
```

---

## Email Template Customization

### Adding Your Logo

Update the email templates in the Edge Function:

```typescript
function generateEmailBody(notification: EmailNotification): string {
  const { email_type, metadata } = notification;

  // Common header with logo
  const emailHeader = `
    <div style="text-align: center; padding: 20px; background-color: #0066cc;">
      <img src="https://your-domain.com/logo.png" alt="UNIVERSAL SHIPPING SERVICES" style="height: 50px;">
    </div>
  `;

  // Common footer
  const emailFooter = `
    <div style="text-align: center; padding: 20px; background-color: #f5f5f5; margin-top: 30px;">
      <p style="color: #666; font-size: 12px;">
        UNIVERSAL SHIPPING SERVICES<br/>
        Your Address Here<br/>
        <a href="https://your-domain.com">Visit our website</a>
      </p>
    </div>
  `;

  // Then wrap your email content with header and footer
  switch (email_type) {
    case 'shipment_created':
      return `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${emailHeader}
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Your email content here -->
            </div>
            ${emailFooter}
          </body>
        </html>
      `;
    // ... other cases
  }
}
```

### Localization

To send emails in the user's preferred language:

```typescript
// Add language parameter to metadata when creating notification
INSERT INTO email_notifications (
  recipient_email,
  email_type,
  subject,
  metadata
) VALUES (
  client_email,
  'shipment_created',
  'New Shipment Created',
  jsonb_build_object(
    'shipment_id', NEW.id,
    'language', 'fr'  -- Add language preference
  )
);

// Then in Edge Function:
function generateEmailBody(notification: EmailNotification): string {
  const language = notification.metadata.language || 'en';
  
  const translations = {
    en: {
      greeting: 'Dear',
      shipmentCreated: 'Your shipment has been successfully created',
      // ... more translations
    },
    fr: {
      greeting: 'Cher',
      shipmentCreated: 'Votre expédition a été créée avec succès',
      // ... more translations
    },
  };

  const t = translations[language];
  
  // Use translations in your template
  return `
    <p>${t.greeting} ${metadata.client_name},</p>
    <p>${t.shipmentCreated}</p>
  `;
}
```

---

## Testing Checklist

- [ ] Email service API key configured in Supabase secrets
- [ ] Edge Function updated with email sending code
- [ ] Edge Function redeployed
- [ ] Sender email/domain verified with email service
- [ ] Test shipment creation email
- [ ] Test shipment status change email
- [ ] Test agent validation email
- [ ] Test subscription expiration email
- [ ] Check email deliverability (not in spam)
- [ ] Verify email formatting on mobile devices
- [ ] Test with different email clients (Gmail, Outlook, etc.)

---

## Troubleshooting

### Emails Not Sending

1. **Check Edge Function logs**:
   ```bash
   # View recent logs
   supabase functions logs process-email-notifications
   ```

2. **Verify API key is set**:
   ```bash
   # List secrets (values are hidden)
   supabase secrets list
   ```

3. **Test API key directly**:
   ```bash
   # Test Resend API
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@yourdomain.com",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

### Emails Going to Spam

1. **Verify sender domain** with SPF, DKIM, and DMARC records
2. **Use a professional sender name** (not "noreply")
3. **Include unsubscribe link** in emails
4. **Avoid spam trigger words** in subject lines
5. **Test with mail-tester.com** to check spam score

### Rate Limiting

If you're sending many emails:

1. **Resend**: 100 emails/day on free tier
2. **SendGrid**: 100 emails/day on free tier
3. **AWS SES**: 200 emails/day in sandbox, unlimited in production

Consider upgrading your plan or implementing batch processing with delays.

---

## Production Checklist

- [ ] Domain verified with email service provider
- [ ] SPF, DKIM, DMARC records configured
- [ ] Professional sender email (e.g., notifications@universalshipping.com)
- [ ] Email templates tested on multiple devices
- [ ] Unsubscribe functionality implemented
- [ ] Email analytics/tracking configured
- [ ] Error monitoring and alerting set up
- [ ] Backup email service configured (failover)
- [ ] Rate limiting and throttling implemented
- [ ] Email logs archived regularly

---

## Support

### Resend Support
- Documentation: https://resend.com/docs
- Support: support@resend.com

### SendGrid Support
- Documentation: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

### AWS SES Support
- Documentation: https://docs.aws.amazon.com/ses
- Support: AWS Support Console

---

## Cost Estimates

### Resend
- Free: 100 emails/day, 3,000/month
- Pro: $20/month for 50,000 emails
- Scale: Custom pricing

### SendGrid
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

### AWS SES
- $0.10 per 1,000 emails
- Very cost-effective for high volume
- Additional charges for data transfer

---

## Next Steps

1. Choose your email service provider
2. Follow the integration steps above
3. Test thoroughly in development
4. Deploy to production
5. Monitor email delivery and engagement
6. Iterate on email templates based on user feedback

Good luck! 🚀
