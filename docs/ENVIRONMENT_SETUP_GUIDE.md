
# Environment Setup Guide

## Overview

This guide explains how to properly configure environment variables for the Universal Shipping Services application.

## The Issue

The error "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL" occurs when the Supabase URL is not properly configured in your environment.

## Solution

### 1. Environment Variables Configuration

The application uses the following environment variables:

#### Required Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### Optional Variables

- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google OAuth client ID

### 2. Current Configuration

The application is configured with the following defaults:

```
SUPABASE_URL: https://lnfsjpuffrcyenuuoxxk.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU
```

These are hardcoded as fallbacks in `config/appConfig.ts` to ensure the app works even without environment variables.

### 3. How Environment Variables Are Read

The application reads environment variables in the following order:

1. **process.env** - For web and development environments
2. **Constants.expoConfig.extra** - For native apps (iOS/Android)
3. **Fallback values** - Hardcoded defaults in `config/appConfig.ts`

### 4. Setting Environment Variables

#### For Development (Local)

Create a `.env` file in the root of your project:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU

# Stripe (optional)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Google Maps (optional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Google OAuth (optional)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

#### For Production (Natively Platform)

In the Natively platform:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Other optional variables as needed

### 5. Verification

The application automatically validates the configuration on startup. Check the console logs for:

```
[ESSENTIAL] ==================================================
[ESSENTIAL] Universal Shipping Services - Starting
[ESSENTIAL] Environment: dev
[ESSENTIAL] Mode: Development
[ESSENTIAL] ==================================================
[INFO] Initializing Supabase client
[DEBUG] Supabase URL: https://lnfsjpuffrcyenuuoxxk.supabase.co
[INFO] Supabase client initialized successfully
```

If you see errors, check:

1. The URL starts with `http://` or `https://`
2. The anon key is not empty
3. The values are correctly set in your environment

### 6. Troubleshooting

#### Error: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**Cause**: The Supabase URL is empty or doesn't start with http:// or https://

**Solution**: 
- Check that `EXPO_PUBLIC_SUPABASE_URL` is set correctly
- Ensure the URL includes the protocol (https://)
- Restart the development server after changing environment variables

#### Error: "Supabase configuration is missing"

**Cause**: Either the URL or anon key is not set

**Solution**:
- Verify both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
- Check the `.env` file exists and is in the root directory
- Restart the development server

### 7. Best Practices

1. **Never commit `.env` files** - Add `.env` to `.gitignore`
2. **Use different keys for dev/staging/production** - Keep environments separate
3. **Rotate keys regularly** - Update keys periodically for security
4. **Use environment-specific configurations** - Set `APP_ENV` to control behavior

### 8. Configuration Files

The configuration is managed in these files:

- `config/appConfig.ts` - Main configuration module with fallbacks
- `app/integrations/supabase/client.ts` - Supabase client initialization
- `app.json` - Expo configuration with environment variable mapping
- `.env` - Local environment variables (not committed to git)

### 9. Current Status

✅ **Fixed**: The application now has proper fallback values for Supabase URL and anon key
✅ **Fixed**: Environment variable reading logic improved with multiple fallback sources
✅ **Fixed**: Better error messages for configuration issues

The app should now work without requiring environment variables to be set, as it uses the correct hardcoded fallbacks.
