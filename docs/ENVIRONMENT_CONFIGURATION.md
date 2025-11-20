
# Environment Configuration Guide

## Overview

This guide explains how to configure and manage environment variables for the Universal Shipping Services application. The app supports multiple environments (dev/staging and production) with proper separation of sensitive keys.

## Table of Contents

1. [Environment Structure](#environment-structure)
2. [Environment Variables](#environment-variables)
3. [Configuration Files](#configuration-files)
4. [Usage in Code](#usage-in-code)
5. [Verification System](#verification-system)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Environment Structure

The application supports two main environments:

- **Development/Staging** (`dev` or `staging`)
  - Verbose logging enabled
  - Debug features available
  - Test API keys (Stripe test mode, etc.)
  - Configuration status visible

- **Production** (`production`)
  - Minimal logging (errors and essential only)
  - Debug features disabled
  - Live API keys
  - Optimized performance

## Environment Variables

### Required Variables

These variables **must** be set for the application to function:

```bash
# App Environment
APP_ENV=dev  # or 'production'

# Supabase (Required)
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional Variables

These variables enable specific features:

```bash
# Stripe (for payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Backend only
STRIPE_WEBHOOK_SECRET=whsec_...  # Backend only

# Google Maps (for map features)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# SMTP (for email features)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password

# Admin Configuration
ADMIN_EMAILS=cheikh@universalshipping.com,admin@example.com
```

### Variable Naming Convention

- **`EXPO_PUBLIC_*`**: Variables prefixed with `EXPO_PUBLIC_` are safe to expose to the client
- **No prefix**: Variables without prefix are server-side only (Edge Functions)

## Configuration Files

### 1. `config/appConfig.ts`

Central configuration module that provides:

```typescript
import appConfig from '@/config/appConfig';

// Environment detection
appConfig.appEnv        // 'dev' | 'staging' | 'production'
appConfig.isProduction  // boolean
appConfig.isDev         // boolean

// Environment variables
appConfig.env.SUPABASE_URL
appConfig.env.STRIPE_PUBLIC_KEY
// ... etc

// Conditional logger
appConfig.logger.log('Debug message')      // Only in dev
appConfig.logger.error('Error message')    // Always logged
appConfig.logger.essential('Important')    // Always logged

// Feature flags
appConfig.features.enableStripePayments
appConfig.features.showDebugInfo
// ... etc
```

### 2. `config/configVerification.ts`

Automatic verification system that checks:

- Supabase connection
- Stripe configuration
- Google Maps API key
- SMTP settings

```typescript
import { verifyAllServices, getConfigStatus } from '@/config/configVerification';

// Verify all services
const results = await verifyAllServices();

// Get overall status
const { overall, results } = await getConfigStatus();
// overall: 'healthy' | 'degraded' | 'critical'
```

### 3. `.env.example`

Template file showing all available environment variables with descriptions.

## Usage in Code

### Accessing Environment Variables

**✅ Correct:**

```typescript
import appConfig from '@/config/appConfig';

// Access environment variables
const supabaseUrl = appConfig.env.SUPABASE_URL;
const stripeKey = appConfig.env.STRIPE_PUBLIC_KEY;
```

**❌ Incorrect:**

```typescript
// Don't hardcode keys
const supabaseUrl = "https://lnfsjpuffrcyenuuoxxk.supabase.co";

// Don't access process.env directly
const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

### Conditional Logging

**✅ Correct:**

```typescript
import appConfig from '@/config/appConfig';

// Logs only in development
appConfig.logger.log('User clicked button');
appConfig.logger.debug('Detailed debug info');

// Always logs (even in production)
appConfig.logger.error('Payment failed:', error);
appConfig.logger.essential('App started');
```

**❌ Incorrect:**

```typescript
// Don't use console.log directly
console.log('This will appear in production!');

// Don't use conditional checks manually
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### Feature Flags

```typescript
import appConfig from '@/config/appConfig';

// Check if feature is enabled
if (appConfig.features.enableStripePayments) {
  // Show payment button
}

if (appConfig.features.showDebugInfo) {
  // Show debug panel
}
```

### Environment-Specific Behavior

```typescript
import appConfig from '@/config/appConfig';

// Different timeout for dev vs production
const timeout = appConfig.api.defaultTimeout;

// Show different UI based on environment
if (appConfig.isDev) {
  return <ConfigStatus />;
}
```

## Verification System

### Automatic Verification on Startup

The app automatically verifies all services when it starts:

```typescript
// In app/_layout.tsx
useEffect(() => {
  verifyAllServices().catch(error => {
    appConfig.logger.error('Service verification failed:', error);
  });
}, []);
```

### Manual Verification

You can manually verify configuration:

```typescript
import { verifySupabase, verifyStripe } from '@/config/configVerification';

// Verify individual services
const supabaseResult = await verifySupabase();
const stripeResult = await verifyStripe();

// Check result
if (supabaseResult.status === 'error') {
  console.error(supabaseResult.message);
}
```

### Configuration Status Component

In development mode, the `ConfigStatus` component shows real-time configuration status:

```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

// Shows configuration status (dev only)
<ConfigStatus />
```

## Best Practices

### 1. Never Hardcode Sensitive Keys

**❌ Bad:**
```typescript
const STRIPE_KEY = "pk_live_abc123...";
```

**✅ Good:**
```typescript
import appConfig from '@/config/appConfig';
const stripeKey = appConfig.env.STRIPE_PUBLIC_KEY;
```

### 2. Use Appropriate Logging

**❌ Bad:**
```typescript
console.log('User data:', userData);  // Will log in production!
```

**✅ Good:**
```typescript
appConfig.logger.debug('User data:', userData);  // Only in dev
appConfig.logger.error('Failed to load user');   // Always logged
```

### 3. Validate Configuration Early

```typescript
// At app startup
const validation = appConfig.validateConfig();
if (!validation.valid) {
  validation.errors.forEach(error => {
    appConfig.logger.error(error);
  });
}
```

### 4. Use Feature Flags

```typescript
// Instead of checking environment directly
if (appConfig.features.enableBetaFeatures) {
  // Show beta feature
}
```

### 5. Separate Client and Server Keys

- **Client-side**: Use `EXPO_PUBLIC_*` variables
- **Server-side** (Edge Functions): Use non-prefixed variables

```typescript
// Edge Function
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
```

## Troubleshooting

### Issue: "Supabase configuration is missing"

**Solution:**
1. Check that `.env` file exists
2. Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
3. Restart the development server

### Issue: Stripe payments not working

**Solution:**
1. Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Check key format (should start with `pk_test_` or `pk_live_`)
3. Ensure environment matches key type (test keys in dev, live keys in production)
4. Check Edge Function has `STRIPE_SECRET_KEY` set

### Issue: Environment variables not updating

**Solution:**
1. Stop the development server
2. Clear Metro bundler cache: `npx expo start -c`
3. Restart the development server

### Issue: Logs appearing in production

**Solution:**
1. Use `appConfig.logger.*` instead of `console.log`
2. Check `APP_ENV` is set to `production`
3. Verify `appConfig.isProduction` returns `true`

### Issue: Configuration verification failing

**Solution:**
1. Check the ConfigStatus component in dev mode
2. Review verification results for specific errors
3. Ensure all required services are properly configured
4. Check network connectivity

## Environment Setup Checklist

### Development Environment

- [ ] Set `APP_ENV=dev`
- [ ] Configure Supabase URL and anon key
- [ ] Use Stripe test keys (`pk_test_*`, `sk_test_*`)
- [ ] Optional: Configure Google Maps API key
- [ ] Optional: Configure SMTP for email testing

### Production Environment

- [ ] Set `APP_ENV=production`
- [ ] Configure Supabase URL and anon key
- [ ] Use Stripe live keys (`pk_live_*`, `sk_live_*`)
- [ ] Configure Google Maps API key
- [ ] Configure SMTP for production emails
- [ ] Set admin emails
- [ ] Verify all services are working
- [ ] Test payment flow end-to-end

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** as a template (without real keys)
3. **Rotate keys regularly** in production
4. **Use different keys** for dev and production
5. **Limit key permissions** to minimum required
6. **Monitor key usage** in service dashboards
7. **Revoke compromised keys** immediately

## Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Google Maps API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Support

For issues or questions about environment configuration:

1. Check this documentation
2. Review the ConfigStatus component in dev mode
3. Check application logs
4. Contact the development team
