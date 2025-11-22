
# Environment Variables Implementation - Complete

## Overview

This document summarizes the refactoring of the application to use environment variables instead of hardcoded values for all sensitive configuration.

## What Was Changed

### 1. **appConfig Module** (`config/appConfig.ts`)

The centralized configuration module now properly reads environment variables from multiple sources:

- `process.env` (for web and Node.js environments)
- `Constants.expoConfig.extra` (for native apps via app.json)
- Fallback values for development

**Key Features:**
- ✅ Environment detection (`dev` vs `production`)
- ✅ Admin email verification helper (`admin.isAdminEmail()`)
- ✅ SMTP configuration with validation
- ✅ Payment provider configuration (PayPal/Stripe)
- ✅ Conditional logging based on environment
- ✅ Configuration validation with detailed error/warning messages

**Usage Example:**
```typescript
import appConfig from '@/config/appConfig';

// Check environment
if (appConfig.isProduction) {
  // Production-specific logic
}

// Check if user is admin
if (appConfig.admin.isAdminEmail(user.email)) {
  // Admin-specific logic
}

// Access environment variables
const supabaseUrl = appConfig.env.SUPABASE_URL;
const paypalClientId = appConfig.env.PAYPAL_CLIENT_ID;

// Use logger (only logs in development)
appConfig.logger.debug('Debug message');
appConfig.logger.error('Error message'); // Always logs
```

### 2. **Supabase Client** (`app/integrations/supabase/client.ts`)

Already properly configured to use `appConfig` for Supabase credentials:

```typescript
const SUPABASE_URL = appConfig.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = appConfig.env.SUPABASE_ANON_KEY;
```

### 3. **Admin Context** (`contexts/AdminContext.tsx`)

Updated to use `appConfig` for admin email verification:

```typescript
// Get admin emails from environment variables
const adminEmails = appConfig.admin.emails;

// Check if user is admin
const isAdmin = user?.email ? appConfig.admin.isAdminEmail(user.email) : false;
```

**Before:**
```typescript
const ADMIN_EMAILS = [
  'cheikh@uss.com',
  'admin@uss.com',
  // ... hardcoded emails
];
```

**After:**
```typescript
// Reads from ADMIN_EMAILS environment variable
const adminEmails = appConfig.admin.emails;
```

### 4. **Supabase Edge Functions**

Both Edge Functions now properly use `Deno.env.get()` for all environment variables:

**`create-paypal-order/index.ts`:**
```typescript
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || '';
const PAYPAL_ENV = Deno.env.get('PAYPAL_ENV') || 'sandbox';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  // ...
);
```

**`paypal-webhook/index.ts`:**
```typescript
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || '';
const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID') || '';
const PAYPAL_ENV = Deno.env.get('PAYPAL_ENV') || 'sandbox';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

### 5. **Configuration Verification** (`config/configVerification.ts`)

Already properly uses `appConfig` to verify all services:

- ✅ Supabase connection
- ✅ PayPal configuration
- ✅ Stripe configuration (legacy)
- ✅ Google Maps API key
- ✅ SMTP configuration

## Environment Variables Reference

### Required Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `APP_ENV` | Application environment | `dev` or `production` | All |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Frontend + Edge Functions |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` | Frontend + Edge Functions |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGc...` | Edge Functions only |
| `ADMIN_EMAILS` | Comma-separated admin emails | `admin@example.com,admin2@example.com` | Frontend |

### Payment Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `PAYMENT_PROVIDER` | Active payment provider | `paypal` or `stripe` | All |
| `PAYPAL_CLIENT_ID` | PayPal client ID | `AXxxx...` | Frontend + Edge Functions |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | `ELxxx...` | Edge Functions only |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID | `WH-xxx...` | Edge Functions only |
| `PAYPAL_ENV` | PayPal environment | `sandbox` or `live` | All |

### Optional Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSy...` | Frontend |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` | Edge Functions |
| `SMTP_PORT` | SMTP server port | `587` | Edge Functions |
| `SMTP_USERNAME` | SMTP username | `noreply@example.com` | Edge Functions |
| `SMTP_PASSWORD` | SMTP password | `app_password` | Edge Functions |

## How to Configure

### 1. Local Development

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Natively Environment Variables

1. Go to your Natively project
2. Click on **Environment Variables** tab
3. Add each variable with its value
4. Mark sensitive variables (secrets) as **Secret**

**Variables to mark as Secret:**
- `SUPABASE_SERVICE_KEY`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `SMTP_PASSWORD`

### 3. Supabase Edge Functions

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add the following variables:
   - `SUPABASE_SERVICE_KEY`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_WEBHOOK_ID`
   - `PAYPAL_ENV`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `APP_ENV`
   - `ADMIN_EMAILS`

## Verification

### Check Configuration Status

In development mode, the app displays a configuration status component that verifies all services:

```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

// In your component
<ConfigStatus />
```

### Manual Verification

```typescript
import appConfig from '@/config/appConfig';

// Validate configuration
const { valid, errors, warnings } = appConfig.validateConfig();

if (!valid) {
  console.error('Configuration errors:', errors);
}

if (warnings.length > 0) {
  console.warn('Configuration warnings:', warnings);
}
```

## Admin Access Control

### How It Works

1. Admin emails are defined in the `ADMIN_EMAILS` environment variable
2. The `AdminContext` checks if the current user's email matches any admin email
3. Admin-only pages use the `useAdmin()` hook to verify access

### Usage in Components

```typescript
import { useAdmin } from '@/contexts/AdminContext';

function MyComponent() {
  const { isAdmin } = useAdmin();
  
  if (!isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }
  
  // Admin-only content
  return <AdminPanel />;
}
```

### Adding Admin Users

Simply add their email to the `ADMIN_EMAILS` environment variable:

```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

## Production Checklist

Before deploying to production:

- [ ] Set `APP_ENV=production`
- [ ] Set `PAYPAL_ENV=live`
- [ ] Use live PayPal credentials (not sandbox)
- [ ] Configure all SMTP variables for email sending
- [ ] Add all admin emails to `ADMIN_EMAILS`
- [ ] Verify all environment variables are set in Natively
- [ ] Verify all Edge Function environment variables are set in Supabase
- [ ] Test configuration with `appConfig.validateConfig()`
- [ ] Check ConfigStatus component shows all green

## Troubleshooting

### "Environment variable not set" error

**Solution:** Check that the variable is set in:
1. `.env` file (local development)
2. Natively Environment Variables tab
3. Supabase Edge Functions settings (for backend variables)

### "Using PayPal sandbox in production"

**Solution:** Set `PAYPAL_ENV=live` and use live PayPal credentials.

### "Admin access denied"

**Solution:** Verify that the user's email is in the `ADMIN_EMAILS` environment variable.

### "SMTP configuration incomplete"

**Solution:** Set all SMTP variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`.

## Security Best Practices

1. ✅ **Never commit `.env` to version control** - It's already in `.gitignore`
2. ✅ **Use different credentials for dev and production**
3. ✅ **Rotate credentials regularly** (every 3-6 months)
4. ✅ **Mark sensitive variables as "Secret" in Natively**
5. ✅ **Use sandbox credentials for development**
6. ✅ **Restrict API keys to specific domains/apps**
7. ✅ **Monitor API usage and set up billing alerts**
8. ✅ **Enable webhook signature verification in production**

## Summary

All hardcoded values have been replaced with environment variables:

- ✅ Supabase credentials
- ✅ PayPal configuration
- ✅ Google Maps API key
- ✅ SMTP configuration
- ✅ Admin emails
- ✅ Environment detection

The application now uses a centralized `appConfig` module that:

- ✅ Reads from multiple sources (process.env, Expo config)
- ✅ Provides type-safe access to all configuration
- ✅ Validates configuration on startup
- ✅ Provides environment-aware logging
- ✅ Includes admin email verification helpers
- ✅ Supports both development and production modes

All Edge Functions use `Deno.env.get()` to access environment variables securely.
