
# Universal Shipping Services - Setup Guide

## Overview

This guide will help you set up the Universal Shipping Services application with PayPal payment integration.

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- Supabase account and project
- PayPal Developer account
- SMTP server for email notifications (optional)

## Step 1: Clone and Install

```bash
# Clone the repository (if applicable)
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and keys

### 2.2 Create Database Tables

The application requires the following tables:
- `clients`
- `freight_quotes`
- `shipments`
- `pricing_plans`
- `subscriptions`
- `payment_logs`
- `events_log`
- `email_notifications`

(Tables should already exist if you're using the existing project)

### 2.3 Deploy Edge Functions

The following Edge Functions are already deployed:
- `create-paypal-order`
- `paypal-webhook`

To redeploy if needed:
```bash
supabase functions deploy create-paypal-order
supabase functions deploy paypal-webhook
```

## Step 3: PayPal Setup

### 3.1 Create PayPal App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Apps & Credentials**
3. Switch to **Sandbox** for development
4. Click **Create App**
5. Note down:
   - Client ID
   - Client Secret

### 3.2 Configure Webhooks

1. In your PayPal app, go to **Webhooks**
2. Click **Add Webhook**
3. Enter webhook URL:
   ```
   https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook
   ```
4. Select event types:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`
5. Click **Save**
6. Note down the **Webhook ID**

### 3.3 For Production

Repeat the above steps in the **Live** environment when ready for production.

## Step 4: Environment Variables

### 4.1 Create .env File

Copy the example file:
```bash
cp .env.example .env
```

### 4.2 Fill in Values

Edit `.env` with your actual values:

```bash
# Application Environment
APP_ENV=dev

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_key

# Payment Provider
PAYMENT_PROVIDER=paypal

# PayPal Configuration (Sandbox)
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
PAYPAL_ENV=sandbox

# Google Maps (Optional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# SMTP Configuration (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# Admin Emails
ADMIN_EMAILS=admin@universalshipping.com
```

### 4.3 Set Supabase Secrets

Set secrets for Edge Functions:

```bash
# Using Supabase CLI
supabase secrets set PAYPAL_CLIENT_ID=your_sandbox_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
supabase secrets set PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
supabase secrets set PAYPAL_ENV=sandbox
supabase secrets set PAYMENT_PROVIDER=paypal
```

Or set them in the Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add each secret manually

## Step 5: Run the Application

### 5.1 Start Development Server

```bash
npm run dev
```

This will start the Expo development server.

### 5.2 Run on Device/Emulator

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Step 6: Test Payment Flow

### 6.1 Create Test Account

1. Sign up in the app
2. Verify email
3. Log in

### 6.2 Test Pricing Plan Payment

1. Navigate to **Pricing** page
2. Select a plan
3. Click **Choisir ce plan**
4. You'll be redirected to PayPal sandbox
5. Log in with a PayPal sandbox test account
6. Complete the payment
7. You'll be redirected back to the app
8. Check that subscription is activated

### 6.3 Test Freight Quote Payment

1. Navigate to **Freight Quote** page
2. Fill in quote details
3. Submit quote
4. Admin approves quote (via admin panel)
5. Client receives quote
6. Client clicks **Pay Now**
7. Complete PayPal payment
8. Check that shipment is created

### 6.4 Verify Webhooks

1. Go to PayPal Developer Dashboard
2. Navigate to **Webhooks**
3. Check webhook events
4. Verify events are being received

## Step 7: Verify Configuration

### 7.1 Check Configuration Status

The app includes a configuration status component (visible in dev mode):

1. Open the app
2. Navigate to **Pricing** page
3. Look for the configuration status banner at the top
4. Verify all services show as "configured"

### 7.2 Check Logs

View Edge Function logs:

```bash
# View create-paypal-order logs
supabase functions logs create-paypal-order

# View paypal-webhook logs
supabase functions logs paypal-webhook
```

### 7.3 Check Database

Verify data in Supabase:

1. Go to **Table Editor**
2. Check `payment_logs` for webhook events
3. Check `events_log` for business events
4. Check `subscriptions` for activated subscriptions
5. Check `freight_quotes` for paid quotes
6. Check `shipments` for created shipments

## Step 8: Production Deployment

### 8.1 Update Environment Variables

For production:

```bash
# Update .env
APP_ENV=production
PAYPAL_ENV=live
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id

# Update Supabase secrets
supabase secrets set PAYPAL_CLIENT_ID=your_live_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_live_client_secret
supabase secrets set PAYPAL_WEBHOOK_ID=your_live_webhook_id
supabase secrets set PAYPAL_ENV=live
```

### 8.2 Update PayPal Webhook

1. Go to PayPal Dashboard (Live environment)
2. Update webhook URL if needed
3. Verify webhook is active

### 8.3 Build for Production

```bash
# Build for web
npm run build:web

# Build for Android
npm run build:android

# Build for iOS (requires Mac)
expo build:ios
```

## Troubleshooting

### Issue: "PayPal client ID not configured"

**Solution:**
- Verify `EXPO_PUBLIC_PAYPAL_CLIENT_ID` is set in `.env`
- Restart the development server
- Clear Expo cache: `expo start -c`

### Issue: "Webhook signature verification failed"

**Solution:**
- Verify `PAYPAL_WEBHOOK_ID` matches the webhook in PayPal Dashboard
- Check that webhook URL is correct
- Ensure webhook is active

### Issue: "Using PayPal sandbox in production"

**Solution:**
- Change `PAYPAL_ENV` to `live` in production
- Update PayPal credentials to live keys
- Redeploy Edge Functions with updated secrets

### Issue: "Payment not completing"

**Solution:**
- Check webhook events in PayPal Dashboard
- Verify webhook is receiving events
- Check Supabase Edge Function logs
- Ensure `payment_logs` table exists

### Issue: "Email notifications not sending"

**Solution:**
- Verify SMTP configuration
- Check `email_notifications` table for pending emails
- Ensure email processing Edge Function is running

## Security Checklist

Before going to production:

- [ ] All environment variables set correctly
- [ ] No hardcoded credentials in code
- [ ] Webhook signature verification enabled
- [ ] Using live PayPal credentials
- [ ] HTTPS enabled for all endpoints
- [ ] Database RLS policies enabled
- [ ] Admin emails configured
- [ ] Error logging configured
- [ ] Backup strategy in place

## Monitoring

### Key Metrics to Monitor

1. **Payment Success Rate**
   - Query `payment_logs` for success/failure ratio

2. **Webhook Processing**
   - Monitor `payment_logs` for processing errors

3. **Subscription Activations**
   - Track `subscriptions` table for new activations

4. **Email Delivery**
   - Monitor `email_notifications` for delivery status

### Set Up Alerts

Consider setting up alerts for:
- Payment failures
- Webhook processing errors
- Email delivery failures
- Configuration issues

## Support

### Documentation

- [PayPal Configuration Guide](./PAYPAL_CONFIGURATION.md)
- [PayPal Quick Reference](./PAYPAL_QUICK_REFERENCE.md)
- [PayPal Implementation Summary](./PAYPAL_IMPLEMENTATION_SUMMARY.md)

### External Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Documentation](https://docs.expo.dev/)

### Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the documentation
3. Check Supabase Edge Function logs
4. Review PayPal webhook events
5. Contact support

## Next Steps

After successful setup:

1. **Customize Branding**
   - Update logo and colors
   - Customize email templates

2. **Add More Features**
   - Implement refund functionality
   - Add payment analytics
   - Create admin dashboard

3. **Optimize Performance**
   - Enable caching
   - Optimize database queries
   - Add rate limiting

4. **Enhance Security**
   - Implement 2FA
   - Add fraud detection
   - Regular security audits

## Conclusion

You now have a fully functional payment system with PayPal integration. The system is configured to:

- Accept payments for freight quotes and pricing plans
- Process webhook events automatically
- Send email notifications
- Log all payment events
- Separate sandbox and live environments
- Validate configuration automatically

For any questions or issues, refer to the documentation or contact support.
