
# Environment Variables Reference

## Complete List of Environment Variables

This document provides a comprehensive reference for all environment variables used in the Universal Shipping Services (3S Global) application.

## General Configuration

### APP_ENV
- **Description:** Application environment
- **Values:** `dev` | `production`
- **Required:** Yes
- **Default:** `dev`
- **Used by:** All modules
- **Example:** `APP_ENV=production`

### ADMIN_EMAILS
- **Description:** Comma-separated list of admin email addresses
- **Required:** Yes
- **Default:** `cheikh@universalshipping.com`
- **Used by:** Admin notifications, access control
- **Example:** `ADMIN_EMAILS=admin1@example.com,admin2@example.com`

## Supabase Configuration

### EXPO_PUBLIC_SUPABASE_URL
- **Description:** Supabase project URL
- **Required:** Yes
- **Visibility:** Public (frontend)
- **Used by:** Database, Auth, Storage
- **Example:** `EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co`

### EXPO_PUBLIC_SUPABASE_ANON_KEY
- **Description:** Supabase anonymous key
- **Required:** Yes
- **Visibility:** Public (frontend)
- **Used by:** Database, Auth, Storage
- **Example:** `EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...`

### SUPABASE_SERVICE_ROLE_KEY
- **Description:** Supabase service role key (admin access)
- **Required:** Yes (for Edge Functions)
- **Visibility:** Secret (backend only)
- **Used by:** Edge Functions, Admin operations
- **Example:** `SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...`

## Payment Configuration

### PAYMENT_PROVIDER
- **Description:** Active payment provider
- **Values:** `paypal` | `stripe`
- **Required:** Yes
- **Default:** `paypal`
- **Used by:** Payment processing
- **Example:** `PAYMENT_PROVIDER=paypal`

## PayPal Configuration

### EXPO_PUBLIC_PAYPAL_CLIENT_ID
- **Description:** PayPal REST API client ID
- **Required:** Yes (if using PayPal)
- **Visibility:** Public (frontend)
- **Used by:** PayPal SDK, Order creation
- **Example:** `EXPO_PUBLIC_PAYPAL_CLIENT_ID=AeB1234567890...`
- **Notes:** 
  - Use sandbox client ID for development
  - Use live client ID for production

### PAYPAL_CLIENT_SECRET
- **Description:** PayPal REST API client secret
- **Required:** Yes (if using PayPal)
- **Visibility:** Secret (backend only)
- **Used by:** Edge Functions, API authentication
- **Example:** `PAYPAL_CLIENT_SECRET=EFG1234567890...`
- **Notes:** 
  - Never expose to frontend
  - Use sandbox secret for development
  - Use live secret for production

### PAYPAL_WEBHOOK_ID
- **Description:** PayPal webhook ID for signature verification
- **Required:** Yes (for production)
- **Visibility:** Secret (backend only)
- **Used by:** Webhook verification
- **Example:** `PAYPAL_WEBHOOK_ID=1AB23456CD789...`
- **Notes:** 
  - Get from PayPal Dashboard after creating webhook
  - Different ID for sandbox and live

### PAYPAL_ENV
- **Description:** PayPal environment
- **Values:** `sandbox` | `live`
- **Required:** Yes (if using PayPal)
- **Default:** `sandbox` (dev), `live` (production)
- **Used by:** API URL selection
- **Example:** `PAYPAL_ENV=sandbox`
- **Notes:** 
  - Must match APP_ENV
  - `sandbox` for development
  - `live` for production

## Stripe Configuration (Legacy)

### EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Description:** Stripe publishable key
- **Required:** Yes (if using Stripe)
- **Visibility:** Public (frontend)
- **Used by:** Stripe SDK
- **Example:** `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

### STRIPE_SECRET_KEY
- **Description:** Stripe secret key
- **Required:** Yes (if using Stripe)
- **Visibility:** Secret (backend only)
- **Used by:** Edge Functions, API calls
- **Example:** `STRIPE_SECRET_KEY=sk_test_...`

### STRIPE_WEBHOOK_SECRET
- **Description:** Stripe webhook signing secret
- **Required:** Yes (if using Stripe)
- **Visibility:** Secret (backend only)
- **Used by:** Webhook verification
- **Example:** `STRIPE_WEBHOOK_SECRET=whsec_...`

## Google Maps Configuration

### EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
- **Description:** Google Maps API key
- **Required:** Yes (for map features)
- **Visibility:** Public (frontend)
- **Used by:** Port maps, Location services
- **Example:** `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...`

## SMTP Configuration

### SMTP_HOST
- **Description:** SMTP server hostname
- **Required:** Yes (for email)
- **Visibility:** Secret (backend only)
- **Used by:** Email notifications
- **Example:** `SMTP_HOST=smtp.gmail.com`

### SMTP_PORT
- **Description:** SMTP server port
- **Required:** Yes (for email)
- **Default:** `587`
- **Visibility:** Secret (backend only)
- **Used by:** Email notifications
- **Example:** `SMTP_PORT=587`

### SMTP_USERNAME
- **Description:** SMTP authentication username
- **Required:** Yes (for email)
- **Visibility:** Secret (backend only)
- **Used by:** Email notifications
- **Example:** `SMTP_USERNAME=noreply@example.com`

### SMTP_PASSWORD
- **Description:** SMTP authentication password
- **Required:** Yes (for email)
- **Visibility:** Secret (backend only)
- **Used by:** Email notifications
- **Example:** `SMTP_PASSWORD=your_password`

## Environment-Specific Configuration

### Development Environment

```bash
# General
APP_ENV=dev

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment
PAYMENT_PROVIDER=paypal

# PayPal (Sandbox)
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
PAYPAL_ENV=sandbox

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=dev@example.com
SMTP_PASSWORD=your_password

# Admin
ADMIN_EMAILS=admin@example.com
```

### Production Environment

```bash
# General
APP_ENV=production

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment
PAYMENT_PROVIDER=paypal

# PayPal (Live)
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_WEBHOOK_ID=your_live_webhook_id
PAYPAL_ENV=live

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@universalshipping.com
SMTP_PASSWORD=your_password

# Admin
ADMIN_EMAILS=cheikh@universalshipping.com,admin@universalshipping.com
```

## How to Set Environment Variables

### In Supabase Dashboard

1. Go to **Project Settings** → **Edge Functions**
2. Click **Environment Variables**
3. Add each variable:
   - Name: Variable name (e.g., `PAYPAL_CLIENT_ID`)
   - Value: Variable value
   - Mark as **Secret** if sensitive

### In app.json (for Expo)

```json
{
  "expo": {
    "extra": {
      "appEnv": "${APP_ENV}",
      "supabaseUrl": "${EXPO_PUBLIC_SUPABASE_URL}",
      "supabaseAnonKey": "${EXPO_PUBLIC_SUPABASE_ANON_KEY}",
      "paypalClientId": "${EXPO_PUBLIC_PAYPAL_CLIENT_ID}",
      "paypalEnv": "${PAYPAL_ENV}",
      "paymentProvider": "${PAYMENT_PROVIDER}",
      "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}"
    }
  }
}
```

### In Code (Access via appConfig)

```typescript
import appConfig from '@/config/appConfig';

// Access environment variables
const supabaseUrl = appConfig.env.SUPABASE_URL;
const paypalClientId = appConfig.env.PAYPAL_CLIENT_ID;
const paypalEnv = appConfig.payment.paypal.environment;

// Check environment
if (appConfig.isProduction) {
  // Production logic
}

// Use conditional logger
appConfig.logger.info('This only logs in development');
```

## Validation

### Automatic Validation

The application automatically validates all environment variables on startup:

```typescript
import appConfig from '@/config/appConfig';

const validation = appConfig.validateConfig();

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Configuration warnings:', validation.warnings);
}
```

### Manual Verification

```typescript
import { verifyAllServices } from '@/config/configVerification';

const results = await verifyAllServices();

results.forEach(result => {
  console.log(`${result.service}: ${result.status} - ${result.message}`);
});
```

## Security Best Practices

### Public vs Secret Variables

**Public (Safe to expose to frontend):**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_PAYPAL_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Secret (Backend only):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`

### Never Hardcode

❌ **Bad:**
```typescript
const clientId = 'AeB1234567890';
```

✅ **Good:**
```typescript
const clientId = appConfig.env.PAYPAL_CLIENT_ID;
```

### Environment Separation

- Always use **sandbox** credentials for development
- Always use **live** credentials for production
- Never mix credentials between environments

## Troubleshooting

### Variable Not Found

**Error:** `Environment variable not set`

**Solution:**
1. Check variable is set in Supabase Dashboard
2. Verify variable name is correct (case-sensitive)
3. Restart Edge Functions after setting variables

### Wrong Environment

**Warning:** `Using PayPal sandbox in production`

**Solution:**
1. Check `APP_ENV` is set to `production`
2. Check `PAYPAL_ENV` is set to `live`
3. Verify using live credentials

### Invalid Credentials

**Error:** `Failed to authenticate with PayPal`

**Solution:**
1. Verify client ID and secret are correct
2. Check using correct environment (sandbox vs live)
3. Ensure credentials match the environment

## Quick Reference

| Variable | Required | Public | Default | Environment |
|----------|----------|--------|---------|-------------|
| `APP_ENV` | Yes | No | `dev` | Both |
| `PAYMENT_PROVIDER` | Yes | No | `paypal` | Both |
| `EXPO_PUBLIC_PAYPAL_CLIENT_ID` | Yes* | Yes | - | Both |
| `PAYPAL_CLIENT_SECRET` | Yes* | No | - | Both |
| `PAYPAL_WEBHOOK_ID` | Yes** | No | - | Both |
| `PAYPAL_ENV` | Yes* | No | `sandbox` | Both |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Yes | - | Both |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | - | Both |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | No | - | Backend |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Yes | - | Both |
| `SMTP_HOST` | Yes | No | - | Backend |
| `SMTP_PORT` | Yes | No | `587` | Backend |
| `SMTP_USERNAME` | Yes | No | - | Backend |
| `SMTP_PASSWORD` | Yes | No | - | Backend |
| `ADMIN_EMAILS` | Yes | No | - | Both |

\* Required if `PAYMENT_PROVIDER=paypal`
\** Required for production webhook verification

---

**Last Updated:** January 2025
**Version:** 1.0.0
