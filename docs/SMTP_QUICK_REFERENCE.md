
# SMTP Quick Reference - USS Application

## Quick Setup Checklist

### 1. Configure Environment Variables in Supabase

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@universal-shippingservices.com
```

### 2. Test Configuration

1. Open the USS app
2. Login as admin
3. Navigate to Configuration screen
4. Check SMTP status:
   - ✅ Green = Working
   - ❌ Red = Not configured or error

### 3. Test Email Sending

1. Submit a freight quote
2. Check client email inbox
3. Check team email inbox (support@universal-shippingservices.com)

## Edge Functions

### send-email

**Endpoint**: `https://[project-ref].supabase.co/functions/v1/send-email`

**Method**: POST

**Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>HTML content</p>"
}
```

**Response (Success)**:
```json
{
  "ok": true
}
```

**Response (Error)**:
```json
{
  "ok": false,
  "error": "Error message"
}
```

### health-check

**Endpoint**: `https://[project-ref].supabase.co/functions/v1/health-check`

**Method**: GET

**Response**:
```json
{
  "overall": "healthy",
  "results": [
    {
      "service": "SMTP",
      "ok": true,
      "message": "Email notifications available",
      "isCritical": false
    }
  ]
}
```

## Common SMTP Providers

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
```

**Note**: Enable 2FA and create an App Password in Google Account settings.

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx  # Your SendGrid API key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
```

### Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your-email@yourdomain.com
SMTP_PASSWORD=your-password
```

### Amazon SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## Troubleshooting

### SMTP Status Shows "Not Configured"

**Check**:
1. All environment variables are set in Supabase
2. Variable names are exactly correct (case-sensitive)
3. No extra spaces in values

**Fix**:
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Add/update variables
4. Redeploy health-check function

### Emails Not Being Sent

**Check**:
1. SMTP credentials are correct
2. SMTP provider allows connections from Supabase IPs
3. FROM email address is authorized
4. Check Edge Function logs for errors

**Fix**:
1. Test credentials with an email client
2. Check SMTP provider's security settings
3. Verify FROM email is verified with provider
4. Review logs in Supabase Dashboard

### Test Email Not Received

**Check**:
1. Spam/junk folder
2. Email address is correct
3. SMTP provider has no sending limits
4. Check Edge Function logs

**Fix**:
1. Whitelist sender address
2. Verify email address
3. Check provider quotas
4. Review error logs

### Authentication Failed

**Check**:
1. Username and password are correct
2. Using correct authentication method
3. Account is not locked

**Fix**:
1. Reset SMTP password
2. For Gmail, use App Password
3. Check provider's authentication requirements

## Code Examples

### Send Email from Client

```typescript
import { supabase } from '@/app/integrations/supabase/client';

const sendEmail = async () => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'client@example.com',
      subject: 'Welcome to USS',
      html: '<h1>Welcome!</h1><p>Thank you for choosing USS.</p>',
    }
  });

  if (error) {
    console.error('Email error:', error);
    return false;
  }

  console.log('Email sent successfully:', data);
  return true;
};
```

### Check SMTP Status

```typescript
import { supabase } from '@/app/integrations/supabase/client';

const checkSMTPStatus = async () => {
  const { data, error } = await supabase.functions.invoke('health-check');

  if (error) {
    console.error('Health check error:', error);
    return null;
  }

  const smtpResult = data.results.find(r => r.service === 'SMTP');
  return smtpResult?.ok;
};
```

## Email Templates

### Basic Template Structure

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0066cc; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Univers Shipping Services</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <h2 style="color: #0066cc;">Email Title</h2>
    <p>Email content goes here...</p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
    © 2025 Univers Shipping Services
  </div>
</div>
```

## Security Best Practices

### ✅ DO

- Store credentials in Supabase Edge Function secrets
- Use environment variables for all sensitive data
- Validate email addresses before sending
- Log email attempts for audit trail
- Use TLS/SSL for SMTP connections

### ❌ DON'T

- Hardcode credentials in code
- Expose SMTP credentials to client
- Store passwords in version control
- Send emails without validation
- Ignore error logs

## Monitoring

### Check Email Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select `send-email`
4. View logs for recent activity

### Monitor Health Status

1. Open USS app as admin
2. Go to Configuration screen
3. Check SMTP status badge
4. Refresh to get latest status

## Support

### Getting Help

1. Check Edge Function logs in Supabase Dashboard
2. Review error messages in app console
3. Verify SMTP provider documentation
4. Test credentials with email client

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "SMTP not configured" | Missing environment variables | Add SMTP variables in Supabase |
| "Authentication failed" | Wrong credentials | Verify username/password |
| "Connection timeout" | Can't reach SMTP server | Check host/port, firewall |
| "Invalid email address" | Malformed email | Validate email format |
| "Sender not authorized" | FROM address not verified | Verify sender with provider |

## Quick Commands

### Test SMTP with curl

```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test</p>"
  }'
```

### Check Health Status

```bash
curl https://[project-ref].supabase.co/functions/v1/health-check \
  -H "Authorization: Bearer [anon-key]"
```

## Next Steps

1. ✅ Configure SMTP environment variables
2. ✅ Test health check
3. ✅ Send test email
4. ✅ Monitor logs
5. ✅ Customize email templates
6. ✅ Set up monitoring alerts

---

**Last Updated**: 2025-01-27
**Version**: 1.0
**Status**: Production Ready
