
# Environment Variables Setup - Complete

## Summary

The application has been fully configured to use environment variables for all sensitive data and configuration settings. This document summarizes the implementation and provides guidance for setting up the variables in Natively.

## What Was Done

### 1. Updated Configuration Files

#### `.env.example`
- Comprehensive example file with all 15 required environment variables
- Detailed comments explaining each variable
- Setup instructions and security checklist
- Environment-specific examples (dev vs production)
- Troubleshooting tips

#### `config/appConfig.ts`
- Centralized configuration module
- Reads environment variables from multiple sources
- Provides environment flags (`isProduction`, `isDev`)
- Includes payment provider configuration
- Conditional logging based on environment
- Automatic configuration validation

#### `app.json`
- Configured to inject environment variables
- Maps variables to `extra` config for Expo Constants
- Supports both public and secret variables

### 2. Created Documentation

#### `docs/NATIVELY_ENVIRONMENT_SETUP.md`
- Complete step-by-step guide for setting up variables in Natively
- Detailed instructions for each variable
- Where to get values (Supabase, PayPal, Google, etc.)
- Environment-specific configuration
- Verification checklist
- Troubleshooting section

#### `docs/ENVIRONMENT_VARIABLES_QUICK_SETUP.md`
- Quick reference for copy-paste setup
- Checklist format for easy tracking
- All 15 variables with types and descriptions
- Links to get values
- Verification steps

#### `docs/ENVIRONMENT_VARIABLES_SETUP_COMPLETE.md` (this file)
- Summary of implementation
- What was done
- How to use
- Next steps

### 3. Updated Existing Documentation

#### `docs/ENVIRONMENT_VARIABLES_REFERENCE.md`
- Already existed, now referenced in new docs
- Complete variable reference
- Usage examples
- Security best practices

#### `docs/PAYPAL_CONFIGURATION.md`
- Already existed, now referenced in new docs
- PayPal-specific setup
- Webhook configuration
- Testing guide

## Environment Variables List

### Required Variables (15 total)

#### General (2)
1. `APP_ENV` - Application environment (dev/production)
2. `ADMIN_EMAILS` - Admin email addresses

#### Supabase (3)
3. `SUPABASE_URL` - Supabase project URL
4. `SUPABASE_ANON_KEY` - Supabase anonymous key
5. `SUPABASE_SERVICE_KEY` - Supabase service role key

#### PayPal (5)
6. `PAYMENT_PROVIDER` - Active payment provider (paypal)
7. `PAYPAL_ENV` - PayPal environment (sandbox/live)
8. `PAYPAL_CLIENT_ID` - PayPal client ID
9. `PAYPAL_CLIENT_SECRET` - PayPal client secret
10. `PAYPAL_WEBHOOK_ID` - PayPal webhook ID

#### Google Maps (1)
11. `GOOGLE_MAPS_API_KEY` - Google Maps API key

#### SMTP (4)
12. `SMTP_HOST` - SMTP server hostname
13. `SMTP_PORT` - SMTP server port
14. `SMTP_USERNAME` - SMTP username
15. `SMTP_PASSWORD` - SMTP password

## How to Use

### Step 1: Set Variables in Natively

1. Open Natively project
2. Go to **Environment Variables** tab
3. Add all 15 variables using the quick reference guide
4. Mark Secret variables as Secret
5. Mark Public variables as Public

**Quick Reference:** See `docs/ENVIRONMENT_VARIABLES_QUICK_SETUP.md`

### Step 2: Set Variables in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Add SECRET variables (not EXPO_PUBLIC_ ones)
4. Required for Edge Functions to work

**Variables needed:**
- `SUPABASE_SERVICE_KEY`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `APP_ENV`
- `ADMIN_EMAILS`
- `PAYMENT_PROVIDER`

### Step 3: Verify Configuration

1. **Automatic validation:**
   ```typescript
   import appConfig from '@/config/appConfig';
   const validation = appConfig.validateConfig();
   console.log('Valid:', validation.valid);
   console.log('Errors:', validation.errors);
   console.log('Warnings:', validation.warnings);
   ```

2. **Check ConfigStatus component** (dev mode only)
   - Shows current environment
   - Shows active payment provider
   - Shows PayPal environment
   - Shows validation results

3. **Test each service:**
   - Supabase: Try database query
   - PayPal: Create test order
   - Google Maps: Load map component
   - SMTP: Send test email

## Configuration Access

### In Code

```typescript
import appConfig from '@/config/appConfig';

// Access environment variables
const supabaseUrl = appConfig.env.SUPABASE_URL;
const paypalClientId = appConfig.env.PAYPAL_CLIENT_ID;
const isProduction = appConfig.isProduction;

// Check payment provider
if (appConfig.payment.provider === 'paypal') {
  const environment = appConfig.payment.paypal.environment; // 'sandbox' or 'live'
  const apiUrl = appConfig.payment.paypal.apiUrl;
}

// Use conditional logger
appConfig.logger.info('This only logs in development');
appConfig.logger.error('This always logs');
appConfig.logger.payment('Payment info - dev only');

// Check features
if (appConfig.features.enablePayPalPayments) {
  // PayPal is configured and enabled
}
```

### In Edge Functions

```typescript
// Access environment variables in Supabase Edge Functions
const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
const smtpHost = Deno.env.get('SMTP_HOST');
```

## Environment-Specific Configuration

### Development Environment

```bash
APP_ENV=dev
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_client_secret>
PAYPAL_WEBHOOK_ID=<sandbox_webhook_id>
```

**Characteristics:**
- Verbose logging enabled
- Debug info visible
- Test mode enabled
- Sandbox credentials
- Development features enabled

### Production Environment

```bash
APP_ENV=production
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=<live_client_id>
PAYPAL_CLIENT_SECRET=<live_client_secret>
PAYPAL_WEBHOOK_ID=<live_webhook_id>
```

**Characteristics:**
- Minimal logging (errors only)
- No debug info
- Live mode
- Live credentials
- Production optimizations

## Security Features

### Implemented

1. **No hardcoded keys** - All keys in environment variables
2. **Separate environments** - Different keys for dev/production
3. **Secret variables** - Marked as Secret in Natively
4. **Conditional logging** - Sensitive data only logged in dev
5. **Webhook verification** - PayPal signatures verified
6. **Environment validation** - Automatic consistency checks
7. **Access control** - Service keys only in backend

### Best Practices

- ✓ Use sandbox credentials for development
- ✓ Use live credentials for production only
- ✓ Rotate credentials every 3-6 months
- ✓ Never commit .env to version control
- ✓ Use App Passwords for Gmail SMTP
- ✓ Restrict Google Maps API key
- ✓ Monitor API usage
- ✓ Enable webhook verification

## Validation & Monitoring

### Automatic Validation

The app validates configuration on startup:

```typescript
const validation = appConfig.validateConfig();

if (!validation.valid) {
  // Configuration errors found
  console.error('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  // Configuration warnings
  console.warn('Warnings:', validation.warnings);
}
```

### Common Validations

- ✓ Required variables are set
- ✓ URLs are valid
- ✓ Environment consistency (APP_ENV matches PAYPAL_ENV)
- ✓ Credentials match environment (sandbox vs live)
- ✓ Payment provider is configured
- ✓ SMTP is configured (production)

### ConfigStatus Component

In development mode, shows:
- Current environment (dev/production)
- Active payment provider (PayPal/Stripe)
- PayPal environment (sandbox/live)
- Configuration validation results
- Warnings and errors

## Troubleshooting

### Variable Not Found

**Error:** "Environment variable not set"

**Solution:**
1. Check variable is set in Natively
2. Verify variable name (case-sensitive)
3. Restart app after adding variables

### Environment Mismatch

**Warning:** "Using PayPal sandbox in production"

**Solution:**
1. Set `APP_ENV=production`
2. Set `PAYPAL_ENV=live`
3. Use live PayPal credentials

### PayPal Authentication Failed

**Error:** "Failed to authenticate with PayPal"

**Solution:**
1. Verify client ID and secret are correct
2. Check using correct environment (sandbox/live)
3. Ensure credentials match PAYPAL_ENV

### Webhook Not Working

**Error:** "Webhook signature verification failed"

**Solution:**
1. Check PAYPAL_WEBHOOK_ID is correct
2. Verify webhook URL in PayPal Dashboard
3. Ensure webhook is active

## Next Steps

### 1. Set Variables in Natively

Follow the quick setup guide:
- `docs/ENVIRONMENT_VARIABLES_QUICK_SETUP.md`

### 2. Set Variables in Supabase

For Edge Functions to work:
- Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

### 3. Test Configuration

- Run validation: `appConfig.validateConfig()`
- Check ConfigStatus component
- Test each service individually

### 4. Deploy

- Verify all variables are set
- Test in sandbox/dev first
- Switch to live/production when ready

## Documentation Reference

### Quick Setup
- `docs/ENVIRONMENT_VARIABLES_QUICK_SETUP.md` - Copy-paste checklist

### Detailed Setup
- `docs/NATIVELY_ENVIRONMENT_SETUP.md` - Step-by-step guide

### Reference
- `docs/ENVIRONMENT_VARIABLES_REFERENCE.md` - Complete variable reference
- `docs/PAYPAL_CONFIGURATION.md` - PayPal-specific setup
- `.env.example` - Example environment file

### Code
- `config/appConfig.ts` - Configuration module
- `app.json` - Expo configuration

## Support

If you need help:

1. **Check documentation** - See files listed above
2. **Run validation** - `appConfig.validateConfig()`
3. **Check logs** - Console, Supabase Edge Functions
4. **Test individually** - Test each service separately

## Summary

✅ **Configuration files updated**
- `.env.example` with all 15 variables
- `config/appConfig.ts` with validation
- `app.json` with variable injection

✅ **Documentation created**
- Quick setup guide
- Detailed setup guide
- This summary document

✅ **Ready to use**
- Set variables in Natively
- Set variables in Supabase
- Test and deploy

---

**Status:** ✅ Complete  
**Last Updated:** January 2025  
**Version:** 1.0.0  
**Project:** 3S Global / Universal Shipping Services

## What You Need to Do

1. **Go to Natively** → Environment Variables tab
2. **Add all 15 variables** using `docs/ENVIRONMENT_VARIABLES_QUICK_SETUP.md`
3. **Paste your values** from your local files (Variables générales, Variables PayPal)
4. **Verify:**
   - `APP_ENV` = `dev` or `production`
   - `PAYPAL_ENV` = `sandbox` (for dev) or `live` (for production)
   - `PAYMENT_PROVIDER` = `paypal`
5. **Test** the configuration

That's it! The application is now ready to use environment variables properly.
