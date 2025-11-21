
# PayPal Configuration Guide - Complete Implementation

## Overview

This document provides a comprehensive guide for configuring PayPal as the payment provider for Universal Shipping Services (3S Global). The application supports both **sandbox** (development/testing) and **live** (production) environments with proper separation of credentials.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Configuration Files](#configuration-files)
3. [Edge Functions](#edge-functions)
4. [Frontend Integration](#frontend-integration)
5. [Webhook Setup](#webhook-setup)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Environment Variables

### Required Variables

All environment variables must be configured in **both development and production** environments.

#### General Variables (Already Configured)

```bash
# Application Environment
APP_ENV=dev                    # Values: "dev" or "production"

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# SMTP Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# Admin Configuration
ADMIN_EMAILS=cheikh@universalshipping.com,admin@example.com
```

#### PayPal-Specific Variables

```bash
# Payment Provider Selection
PAYMENT_PROVIDER=paypal        # Values: "paypal" or "stripe"

# PayPal Configuration
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
PAYPAL_ENV=sandbox             # Values: "sandbox" or "live"
```

### Environment-Specific Configuration

#### Development Environment (Sandbox)

```bash
APP_ENV=dev
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
```

#### Production Environment (Live)

```bash
APP_ENV=production
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

### How to Set Environment Variables

#### In Supabase Dashboard

1. Go to **Project Settings** → **Edge Functions**
2. Click on **Environment Variables**
3. Add each variable with its value
4. Mark sensitive variables (CLIENT_SECRET, WEBHOOK_ID) as **Secret**

#### In app.json (for Expo)

The `app.json` file already includes environment variable placeholders:

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

---

## Configuration Files

### 1. appConfig.ts

Location: `config/appConfig.ts`

This is the **central configuration module** that manages all environment-specific settings.

**Key Features:**
- Reads environment variables from multiple sources
- Provides environment detection (dev vs production)
- Conditional logging based on environment
- Payment provider configuration
- Validation of configuration

**Usage Example:**

```typescript
import appConfig from '@/config/appConfig';

// Check environment
if (appConfig.isProduction) {
  // Production-specific logic
}

// Access PayPal configuration
const clientId = appConfig.env.PAYPAL_CLIENT_ID;
const environment = appConfig.payment.paypal.environment; // 'sandbox' or 'live'
const apiUrl = appConfig.payment.paypal.apiUrl;

// Use conditional logger
appConfig.logger.info('This only logs in development');
appConfig.logger.error('This always logs');
```

### 2. configVerification.ts

Location: `config/configVerification.ts`

This module provides **automatic verification** of all services and configurations.

**Key Functions:**
- `verifyPayPal()` - Validates PayPal configuration
- `verifySupabase()` - Validates Supabase connection
- `verifyGoogleMaps()` - Validates Google Maps API key
- `verifySMTP()` - Validates SMTP configuration
- `verifyAllServices()` - Runs all verifications

**Usage Example:**

```typescript
import { verifyAllServices, getConfigStatus } from '@/config/configVerification';

// Verify all services
const results = await verifyAllServices();

// Get overall status
const { overall, results } = await getConfigStatus();
// overall: 'healthy' | 'degraded' | 'critical'
```

### 3. paypal.ts

Location: `utils/paypal.ts`

This module provides **utility functions** for PayPal integration.

**Key Functions:**
- `getPayPalClientId()` - Get client ID from environment
- `getPayPalEnvironment()` - Get environment (sandbox/live)
- `getPayPalApiUrl()` - Get API URL based on environment
- `isPayPalSandbox()` - Check if in sandbox mode
- `formatPrice()` - Format price for display
- `getPayPalCurrency()` - Get supported currency code
- `formatPayPalAmount()` - Format amount for PayPal API

---

## Edge Functions

### 1. create-paypal-order

Location: `supabase/functions/create-paypal-order/index.ts`

**Purpose:** Creates a PayPal order for payment processing.

**Supported Contexts:**
- `freight_quote` - Payment for freight quotes
- `pricing_plan` - Payment for subscription plans

**Request Body:**

```typescript
{
  plan_code?: string,      // For pricing plans
  quote_id?: string,       // For freight quotes
  context: 'freight_quote' | 'pricing_plan'
}
```

**Response:**

```typescript
{
  orderId: string,         // PayPal order ID
  url: string             // Approval URL for payment
}
```

**Environment Variables Used:**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 2. paypal-webhook

Location: `supabase/functions/paypal-webhook/index.ts`

**Purpose:** Handles PayPal webhook events for payment notifications.

**Supported Events:**
- `CHECKOUT.ORDER.APPROVED` - Order approved by customer
- `PAYMENT.CAPTURE.COMPLETED` - Payment captured successfully
- `PAYMENT.CAPTURE.DENIED` - Payment denied
- `PAYMENT.CAPTURE.DECLINED` - Payment declined

**Webhook Verification:**
- Verifies webhook signature using `PAYPAL_WEBHOOK_ID`
- Validates event authenticity
- Logs all events to `payment_logs` table

**Actions Performed:**
- Updates payment status in database
- Creates shipments for paid quotes
- Activates subscriptions for paid plans
- Sends email notifications
- Logs events to `events_log` table

**Environment Variables Used:**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Frontend Integration

### 1. Pricing Screen

Location: `app/(tabs)/pricing.tsx`

**Features:**
- Displays pricing plans from database
- Handles plan selection
- Creates PayPal orders via Edge Function
- Redirects to PayPal for payment

**Payment Flow:**

```typescript
// 1. User selects a plan
handleSelectPlan(plan)

// 2. Call Edge Function to create PayPal order
const { data } = await supabase.functions.invoke('create-paypal-order', {
  body: { plan_code: plan.code }
});

// 3. Redirect to PayPal
await Linking.openURL(data.url);

// 4. User completes payment on PayPal
// 5. PayPal redirects to payment-success or payment-cancel
// 6. Webhook processes payment and updates database
```

### 2. Payment Success Screen

Location: `app/(tabs)/payment-success.tsx`

**Features:**
- Displays success message based on context
- Shows next steps for user
- Provides navigation to dashboard or quotes

**URL Parameters:**
- `context` - Payment context (freight_quote or pricing_plan)
- `quote_id` - Quote ID (for freight quotes)
- `subscription_id` - Subscription ID (for plans)

### 3. Payment Cancel Screen

Location: `app/(tabs)/payment-cancel.tsx`

**Features:**
- Displays cancellation message
- Provides options to retry or contact support
- Context-aware navigation

---

## Webhook Setup

### 1. Create Webhook in PayPal Dashboard

#### For Sandbox Environment

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Navigate to **Apps & Credentials** → **Sandbox**
3. Select your app
4. Scroll to **Webhooks**
5. Click **Add Webhook**
6. Enter webhook URL: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
7. Select events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`
8. Save and copy the **Webhook ID**

#### For Live Environment

1. Go to [PayPal Dashboard](https://www.paypal.com/)
2. Navigate to **Apps & Credentials** → **Live**
3. Follow the same steps as sandbox
4. Use the live webhook URL

### 2. Configure Webhook ID

Add the webhook ID to your environment variables:

```bash
# Sandbox
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id

# Live
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

### 3. Test Webhook

Use PayPal's webhook simulator to test events:

1. Go to **Webhooks** in PayPal Dashboard
2. Select your webhook
3. Click **Simulate Event**
4. Choose event type and send

---

## Testing

### 1. Test Accounts

Create test accounts in PayPal Sandbox:

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Navigate to **Sandbox** → **Accounts**
3. Create:
   - **Business Account** (for receiving payments)
   - **Personal Account** (for making payments)

### 2. Test Payment Flow

#### Test Freight Quote Payment

```bash
# 1. Create a freight quote
# 2. Admin sets quote amount
# 3. Client clicks "Pay Now"
# 4. Redirected to PayPal sandbox
# 5. Login with test personal account
# 6. Complete payment
# 7. Verify:
#    - Quote status updated to "paid"
#    - Shipment created
#    - Email sent
#    - Event logged
```

#### Test Pricing Plan Payment

```bash
# 1. Navigate to pricing page
# 2. Select a plan
# 3. Redirected to PayPal sandbox
# 4. Login with test personal account
# 5. Complete payment
# 6. Verify:
#    - Subscription status updated to "active"
#    - Email sent
#    - Event logged
```

### 3. Test Webhook Events

```bash
# 1. Use PayPal webhook simulator
# 2. Send test events
# 3. Check Supabase logs:
supabase functions logs paypal-webhook

# 4. Verify database updates
# 5. Check email notifications
```

### 4. Verify Configuration

Use the built-in configuration verification:

```typescript
import { verifyAllServices } from '@/config/configVerification';

const results = await verifyAllServices();
console.log(results);
```

Or use the `ConfigStatus` component (dev only):

```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

// In your component
{appConfig.isDev && <ConfigStatus />}
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] `APP_ENV=production`
- [ ] `PAYPAL_ENV=live`
- [ ] Live PayPal credentials configured
- [ ] Live webhook created and ID configured
- [ ] Test payment flow in production
- [ ] Verify webhook events are received
- [ ] Check email notifications
- [ ] Review logs for errors
- [ ] Verify no hardcoded keys in code
- [ ] Test both freight quote and plan payments

### Deployment Steps

1. **Set Production Environment Variables**

```bash
# In Supabase Dashboard
APP_ENV=production
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

2. **Deploy Edge Functions**

```bash
# Deploy create-paypal-order
supabase functions deploy create-paypal-order

# Deploy paypal-webhook
supabase functions deploy paypal-webhook
```

3. **Verify Configuration**

```bash
# Check function logs
supabase functions logs create-paypal-order
supabase functions logs paypal-webhook

# Test configuration endpoint
curl https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/create-paypal-order
```

4. **Test Payment Flow**

- Make a real payment with a small amount
- Verify all steps complete successfully
- Check database updates
- Verify email notifications

### Post-Deployment Monitoring

1. **Monitor Logs**

```bash
# Real-time logs
supabase functions logs paypal-webhook --follow

# Check for errors
supabase functions logs paypal-webhook | grep ERROR
```

2. **Check Payment Logs**

```sql
-- View recent payment logs
SELECT * FROM payment_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Check for errors
SELECT * FROM payment_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;
```

3. **Monitor Events**

```sql
-- View recent payment events
SELECT * FROM events_log 
WHERE event_type IN ('quote_paid', 'subscription_activated')
ORDER BY created_at DESC 
LIMIT 50;
```

---

## Troubleshooting

### Common Issues

#### 1. "PayPal client ID not configured"

**Cause:** Environment variable not set or not accessible.

**Solution:**
```bash
# Check if variable is set
echo $EXPO_PUBLIC_PAYPAL_CLIENT_ID

# Set in Supabase Dashboard
# Project Settings → Edge Functions → Environment Variables
```

#### 2. "Failed to get PayPal access token"

**Cause:** Invalid client ID or secret.

**Solution:**
- Verify credentials in PayPal Dashboard
- Ensure using correct environment (sandbox vs live)
- Check if credentials are properly set in environment variables

#### 3. "Webhook signature verification failed"

**Cause:** Invalid webhook ID or signature.

**Solution:**
- Verify `PAYPAL_WEBHOOK_ID` is correct
- Check webhook is active in PayPal Dashboard
- Ensure webhook URL is correct

#### 4. "Using PayPal sandbox in production"

**Cause:** `PAYPAL_ENV` not set to "live" in production.

**Solution:**
```bash
# Set in production environment
PAYPAL_ENV=live
```

#### 5. Payment succeeds but database not updated

**Cause:** Webhook not configured or not firing.

**Solution:**
- Check webhook is active in PayPal Dashboard
- Verify webhook URL is correct
- Check webhook logs in Supabase
- Test webhook with simulator

### Debug Mode

Enable debug logging in development:

```typescript
import appConfig from '@/config/appConfig';

// All logs will appear in development
appConfig.logger.debug('Debug information');
appConfig.logger.payment('Payment-specific log');
```

### Checking Configuration

```typescript
import appConfig from '@/config/appConfig';

// Check current configuration
console.log('Environment:', appConfig.appEnv);
console.log('Payment Provider:', appConfig.payment.provider);
console.log('PayPal Environment:', appConfig.payment.paypal.environment);
console.log('PayPal API URL:', appConfig.payment.paypal.apiUrl);

// Validate configuration
const validation = appConfig.validateConfig();
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);
```

---

## Security Best Practices

### 1. Never Hardcode Credentials

❌ **Bad:**
```typescript
const clientId = 'AeB1234567890';
const clientSecret = 'EFG1234567890';
```

✅ **Good:**
```typescript
const clientId = appConfig.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET; // Server-side only
```

### 2. Client-Side vs Server-Side

**Client-Side (Frontend):**
- ✅ `PAYPAL_CLIENT_ID` - Safe to expose
- ❌ `PAYPAL_CLIENT_SECRET` - Never expose
- ❌ `PAYPAL_WEBHOOK_ID` - Never expose

**Server-Side (Edge Functions):**
- ✅ All PayPal credentials
- ✅ Supabase service role key
- ✅ SMTP credentials

### 3. Environment Separation

- Always use **sandbox** for development
- Always use **live** for production
- Never mix credentials between environments

### 4. Webhook Verification

- Always verify webhook signatures
- Log all webhook events
- Monitor for suspicious activity

### 5. Logging

- Never log sensitive data in production
- Use `appConfig.logger` for conditional logging
- Always log errors and critical events

---

## Additional Resources

### PayPal Documentation

- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [Orders API](https://developer.paypal.com/docs/api/orders/v2/)
- [Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)

### Supabase Documentation

- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Environment Variables](https://supabase.com/docs/guides/functions/secrets)
- [Function Logs](https://supabase.com/docs/guides/functions/logging)

### Application Documentation

- [Environment Configuration](./ENVIRONMENT_CONFIGURATION.md)
- [Payment Integration](./STRIPE_PAYMENT_INTEGRATION.md)
- [Webhook Implementation](./STRIPE_WEBHOOK_IMPLEMENTATION.md)

---

## Summary

The PayPal integration is **fully configured** with:

✅ Environment variable management
✅ Centralized configuration module
✅ Automatic configuration verification
✅ Sandbox and live environment separation
✅ Edge Functions for order creation and webhooks
✅ Frontend integration for payments
✅ Webhook event processing
✅ Email notifications
✅ Event logging
✅ Security best practices

**No hardcoded credentials exist in the codebase.**

All sensitive keys are managed through environment variables and accessed via the centralized `appConfig` module.

---

## Quick Reference

### Environment Variables

```bash
# Required for PayPal
PAYMENT_PROVIDER=paypal
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_ENV=sandbox  # or "live"
```

### Configuration Access

```typescript
import appConfig from '@/config/appConfig';

// Environment
appConfig.appEnv              // 'dev' or 'production'
appConfig.isProduction        // boolean
appConfig.isDev               // boolean

// Payment
appConfig.payment.provider    // 'paypal' or 'stripe'
appConfig.payment.paypal.environment  // 'sandbox' or 'live'
appConfig.payment.paypal.apiUrl       // API URL

// Logging
appConfig.logger.info('message')      // Dev only
appConfig.logger.error('message')     // Always
appConfig.logger.payment('message')   // Dev only
```

### Edge Functions

```bash
# Create PayPal order
supabase functions invoke create-paypal-order --body '{"plan_code":"BASIC_MONTHLY"}'

# View webhook logs
supabase functions logs paypal-webhook
```

### Verification

```typescript
import { verifyAllServices } from '@/config/configVerification';

const results = await verifyAllServices();
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
