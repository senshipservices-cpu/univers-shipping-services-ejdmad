
# Natively Environment Variables Setup Guide

## Overview

This guide provides step-by-step instructions for setting up environment variables in Natively for the 3S Global / Universal Shipping Services application.

## Quick Reference

### Variables to Set in Natively

| Variable Name | Type | Required | Example Value |
|--------------|------|----------|---------------|
| `SUPABASE_URL` | Public | Yes | `https://lnfsjpuffrcyenuuoxxk.supabase.co` |
| `SUPABASE_ANON_KEY` | Public | Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_KEY` | Secret | Yes | `eyJhbGc...` |
| `GOOGLE_MAPS_API_KEY` | Public | Yes | `AIzaSy...` |
| `SMTP_HOST` | Secret | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | Secret | Yes | `587` |
| `SMTP_USERNAME` | Secret | Yes | `noreply@universalshipping.com` |
| `SMTP_PASSWORD` | Secret | Yes | `your_app_password` |
| `APP_ENV` | Secret | Yes | `dev` or `production` |
| `ADMIN_EMAILS` | Secret | Yes | `cheikh@universalshipping.com` |
| `PAYPAL_CLIENT_ID` | Public | Yes | `AeB123...` |
| `PAYPAL_CLIENT_SECRET` | Secret | Yes | `EFG456...` |
| `PAYPAL_WEBHOOK_ID` | Secret | Yes | `1AB234...` |
| `PAYPAL_ENV` | Secret | Yes | `sandbox` or `live` |
| `PAYMENT_PROVIDER` | Secret | Yes | `paypal` |

## Step-by-Step Setup

### Step 1: Access Natively Environment Variables

1. Open your Natively project
2. Navigate to the **Environment Variables** tab
3. You should see a list of existing variables (if any)

### Step 2: Add General Configuration Variables

#### APP_ENV
- **Name:** `APP_ENV`
- **Value:** `dev` (for testing) or `production` (for live)
- **Type:** Secret
- **Description:** Application environment

#### ADMIN_EMAILS
- **Name:** `ADMIN_EMAILS`
- **Value:** `cheikh@universalshipping.com` (or your admin emails, comma-separated)
- **Type:** Secret
- **Description:** Admin email addresses for notifications

### Step 3: Add Supabase Configuration

#### SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://lnfsjpuffrcyenuuoxxk.supabase.co`
- **Type:** Public
- **Description:** Supabase project URL
- **Where to get:** Supabase Dashboard → Project Settings → API → Project URL

#### SUPABASE_ANON_KEY
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** Paste your anon key from Supabase
- **Type:** Public
- **Description:** Supabase anonymous key
- **Where to get:** Supabase Dashboard → Project Settings → API → Project API keys → anon public

#### SUPABASE_SERVICE_KEY
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** Paste your service role key from Supabase
- **Type:** Secret ⚠️
- **Description:** Supabase service role key (admin access)
- **Where to get:** Supabase Dashboard → Project Settings → API → Project API keys → service_role

### Step 4: Add PayPal Configuration

#### PAYMENT_PROVIDER
- **Name:** `PAYMENT_PROVIDER`
- **Value:** `paypal`
- **Type:** Secret
- **Description:** Active payment provider

#### PAYPAL_ENV
- **Name:** `PAYPAL_ENV`
- **Value:** `sandbox` (for testing) or `live` (for production)
- **Type:** Secret
- **Description:** PayPal environment
- **Important:** Must match `APP_ENV` (sandbox for dev, live for production)

#### PAYPAL_CLIENT_ID
- **Name:** `PAYPAL_CLIENT_ID`
- **Value:** Paste your PayPal client ID
- **Type:** Public
- **Description:** PayPal REST API client ID
- **Where to get:** 
  1. Go to https://developer.paypal.com/dashboard/
  2. Navigate to **Apps & Credentials**
  3. Select **Sandbox** tab (for testing) or **Live** tab (for production)
  4. Click on your app or create a new one
  5. Copy the **Client ID**

#### PAYPAL_CLIENT_SECRET
- **Name:** `PAYPAL_CLIENT_SECRET`
- **Value:** Paste your PayPal client secret
- **Type:** Secret ⚠️
- **Description:** PayPal REST API client secret
- **Where to get:** Same location as Client ID, click "Show" under Secret

#### PAYPAL_WEBHOOK_ID
- **Name:** `PAYPAL_WEBHOOK_ID`
- **Value:** Paste your PayPal webhook ID
- **Type:** Secret ⚠️
- **Description:** PayPal webhook ID for signature verification
- **Where to get:**
  1. Go to https://developer.paypal.com/dashboard/
  2. Navigate to **Apps & Credentials**
  3. Click on your app
  4. Go to **Webhooks** section
  5. Create a new webhook with URL: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
  6. Subscribe to events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
  7. Copy the **Webhook ID** from the webhook details

### Step 5: Add Google Maps Configuration

#### GOOGLE_MAPS_API_KEY
- **Name:** `GOOGLE_MAPS_API_KEY`
- **Value:** Paste your Google Maps API key
- **Type:** Public
- **Description:** Google Maps API key for maps and location services
- **Where to get:**
  1. Go to https://console.cloud.google.com/
  2. Create a project or select existing one
  3. Navigate to **APIs & Services** → **Credentials**
  4. Click **Create Credentials** → **API Key**
  5. Enable required APIs: Maps JavaScript API, Geocoding API, Places API
  6. Restrict the key to your app (recommended)
  7. Copy the API key

### Step 6: Add SMTP Configuration

#### SMTP_HOST
- **Name:** `SMTP_HOST`
- **Value:** `smtp.gmail.com` (or your SMTP server)
- **Type:** Secret
- **Description:** SMTP server hostname

#### SMTP_PORT
- **Name:** `SMTP_PORT`
- **Value:** `587` (for TLS)
- **Type:** Secret
- **Description:** SMTP server port

#### SMTP_USERNAME
- **Name:** `SMTP_USERNAME`
- **Value:** Your email address (e.g., `noreply@universalshipping.com`)
- **Type:** Secret ⚠️
- **Description:** SMTP authentication username

#### SMTP_PASSWORD
- **Name:** `SMTP_PASSWORD`
- **Value:** Your SMTP password or App Password
- **Type:** Secret ⚠️
- **Description:** SMTP authentication password
- **For Gmail:**
  1. Go to Google Account → Security
  2. Enable 2-Step Verification
  3. Go to **App Passwords**
  4. Generate a new app password for "Mail"
  5. Use this password (not your regular Gmail password)

### Step 7: Verify Configuration

After adding all variables:

1. **Check the list:** Ensure all 15 variables are present
2. **Verify types:** Public variables should be marked as Public, Secret variables as Secret
3. **Check values:** Ensure no typos or extra spaces
4. **Environment consistency:**
   - If `APP_ENV=dev`, then `PAYPAL_ENV=sandbox`
   - If `APP_ENV=production`, then `PAYPAL_ENV=live`

## Environment-Specific Configuration

### Development/Testing Environment

```
APP_ENV=dev
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_client_secret>
PAYPAL_WEBHOOK_ID=<sandbox_webhook_id>
```

### Production Environment

```
APP_ENV=production
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=<live_client_id>
PAYPAL_CLIENT_SECRET=<live_client_secret>
PAYPAL_WEBHOOK_ID=<live_webhook_id>
```

## Supabase Edge Functions Setup

In addition to Natively, you need to set environment variables in Supabase for Edge Functions:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk)
2. Navigate to **Project Settings** → **Edge Functions**
3. Click **Environment Variables**
4. Add the following variables (SECRET ones only):

```
SUPABASE_SERVICE_KEY=<your_service_key>
PAYPAL_CLIENT_SECRET=<your_client_secret>
PAYPAL_WEBHOOK_ID=<your_webhook_id>
PAYPAL_ENV=sandbox (or live)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your_email>
SMTP_PASSWORD=<your_app_password>
APP_ENV=dev (or production)
ADMIN_EMAILS=<your_admin_emails>
PAYMENT_PROVIDER=paypal
```

## Verification Checklist

Use this checklist to ensure everything is configured correctly:

### General
- [ ] All 15 variables are set in Natively
- [ ] Secret variables are marked as Secret
- [ ] Public variables are marked as Public
- [ ] No typos in variable names (case-sensitive)
- [ ] No extra spaces in values

### Environment Consistency
- [ ] `APP_ENV` matches deployment environment (dev/production)
- [ ] `PAYPAL_ENV` matches `APP_ENV` (sandbox for dev, live for production)
- [ ] PayPal credentials match the environment (sandbox/live)

### Supabase
- [ ] `SUPABASE_URL` is correct
- [ ] `SUPABASE_ANON_KEY` is valid
- [ ] `SUPABASE_SERVICE_KEY` is set (for Edge Functions)
- [ ] Edge Functions have all required variables

### PayPal
- [ ] `PAYPAL_CLIENT_ID` is correct for the environment
- [ ] `PAYPAL_CLIENT_SECRET` is correct for the environment
- [ ] `PAYPAL_WEBHOOK_ID` matches the webhook in PayPal Dashboard
- [ ] Webhook URL is correct: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
- [ ] Webhook events are subscribed

### Google Maps
- [ ] `GOOGLE_MAPS_API_KEY` is valid
- [ ] Required APIs are enabled (Maps JavaScript, Geocoding, Places)
- [ ] API key restrictions are set (optional but recommended)

### SMTP
- [ ] `SMTP_HOST` is correct
- [ ] `SMTP_PORT` is correct (587 for TLS)
- [ ] `SMTP_USERNAME` is valid
- [ ] `SMTP_PASSWORD` is correct (App Password for Gmail)
- [ ] Test email can be sent

## Testing

### 1. Configuration Validation

The app automatically validates configuration on startup. Check the console for:

```
✓ Configuration valid
⚠ Warnings: [list of warnings]
✗ Errors: [list of errors]
```

### 2. Manual Testing

Test each service:

#### Supabase
```typescript
import { supabase } from '@/app/integrations/supabase/client';

const { data, error } = await supabase.from('clients').select('count');
console.log('Supabase:', error ? 'Failed' : 'Connected');
```

#### PayPal
```typescript
import appConfig from '@/config/appConfig';

console.log('PayPal Client ID:', appConfig.env.PAYPAL_CLIENT_ID);
console.log('PayPal Environment:', appConfig.payment.paypal.environment);
console.log('PayPal Configured:', appConfig.payment.isConfigured());
```

#### Google Maps
- Open a page with a map component
- Verify the map loads correctly
- Check console for API errors

#### SMTP
- Trigger an email notification (e.g., create a quote)
- Check if email is received
- Check Supabase Edge Function logs for errors

### 3. ConfigStatus Component

In development mode, the app shows a `ConfigStatus` component with:
- Current environment
- Active payment provider
- PayPal environment
- Configuration validation results

## Troubleshooting

### Issue: Variable not found

**Symptoms:** Error message "Environment variable not set"

**Solutions:**
1. Check variable is set in Natively Environment Variables tab
2. Verify variable name is correct (case-sensitive)
3. Ensure no extra spaces in variable name
4. Restart the app after adding variables

### Issue: PayPal authentication failed

**Symptoms:** Error when creating PayPal order

**Solutions:**
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
2. Check using correct environment (sandbox vs live)
3. Ensure credentials match the `PAYPAL_ENV` setting
4. Verify credentials in PayPal Developer Dashboard

### Issue: Webhook not working

**Symptoms:** Payments complete but database not updated

**Solutions:**
1. Check `PAYPAL_WEBHOOK_ID` is correct
2. Verify webhook URL in PayPal Dashboard
3. Ensure webhook is active
4. Check Supabase Edge Function logs
5. Verify webhook events are subscribed

### Issue: Environment mismatch warning

**Symptoms:** Warning "Using PayPal sandbox in production"

**Solutions:**
1. Set `APP_ENV=production` for production
2. Set `PAYPAL_ENV=live` for production
3. Use live PayPal credentials
4. Restart the app

### Issue: Email not sending

**Symptoms:** No email notifications received

**Solutions:**
1. Check SMTP credentials are correct
2. For Gmail, use App Password (not regular password)
3. Verify SMTP port is 587 (TLS)
4. Check Supabase Edge Function logs
5. Test SMTP connection separately

### Issue: Google Maps not loading

**Symptoms:** Map shows error or doesn't load

**Solutions:**
1. Verify `GOOGLE_MAPS_API_KEY` is correct
2. Check required APIs are enabled in Google Cloud Console
3. Verify API key restrictions allow your app
4. Check browser console for specific error messages

## Security Best Practices

### Do's ✓
- Use sandbox credentials for development
- Use live credentials for production only
- Mark sensitive variables as Secret in Natively
- Rotate credentials every 3-6 months
- Use App Passwords for Gmail SMTP
- Restrict Google Maps API key to specific domains/apps
- Enable webhook signature verification
- Monitor API usage and set billing alerts

### Don'ts ✗
- Never commit .env file to version control
- Never expose secret keys in frontend code
- Never use live credentials in development
- Never share credentials in chat or email
- Never log sensitive data in production
- Never use regular Gmail password for SMTP
- Never disable webhook verification in production

## Support

If you encounter issues:

1. **Check documentation:**
   - `docs/ENVIRONMENT_VARIABLES_REFERENCE.md`
   - `docs/PAYPAL_CONFIGURATION.md`
   - `docs/ENVIRONMENT_SETUP_GUIDE.md`

2. **Check logs:**
   - Natively console logs
   - Supabase Edge Function logs
   - Browser console (for frontend issues)

3. **Verify configuration:**
   - Run `appConfig.validateConfig()`
   - Check ConfigStatus component (dev mode)
   - Test each service individually

4. **External resources:**
   - [PayPal Developer Documentation](https://developer.paypal.com/docs/)
   - [Supabase Documentation](https://supabase.com/docs)
   - [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)

## Summary

You should now have all 15 environment variables configured in Natively:

1. ✓ `SUPABASE_URL`
2. ✓ `SUPABASE_ANON_KEY`
3. ✓ `SUPABASE_SERVICE_KEY`
4. ✓ `GOOGLE_MAPS_API_KEY`
5. ✓ `SMTP_HOST`
6. ✓ `SMTP_PORT`
7. ✓ `SMTP_USERNAME`
8. ✓ `SMTP_PASSWORD`
9. ✓ `APP_ENV`
10. ✓ `ADMIN_EMAILS`
11. ✓ `PAYPAL_CLIENT_ID`
12. ✓ `PAYPAL_CLIENT_SECRET`
13. ✓ `PAYPAL_WEBHOOK_ID`
14. ✓ `PAYPAL_ENV`
15. ✓ `PAYMENT_PROVIDER`

The application is now ready to use these environment variables for:
- Database operations (Supabase)
- Payment processing (PayPal)
- Map services (Google Maps)
- Email notifications (SMTP)
- Environment-specific behavior

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Project:** 3S Global / Universal Shipping Services
