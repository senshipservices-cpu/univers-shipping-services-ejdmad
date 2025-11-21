
# PayPal Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get PayPal Credentials

#### For Development (Sandbox)
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Navigate to **Apps & Credentials** → **Sandbox**
3. Create or select an app
4. Copy:
   - **Client ID** (visible)
   - **Secret** (click "Show" to reveal)

#### For Production (Live)
1. Go to [PayPal Dashboard](https://www.paypal.com/)
2. Navigate to **Apps & Credentials** → **Live**
3. Create or select an app
4. Copy:
   - **Client ID** (visible)
   - **Secret** (click "Show" to reveal)

### Step 2: Set Environment Variables

#### In Supabase Dashboard
1. Go to **Project Settings** → **Edge Functions**
2. Click **Environment Variables**
3. Add these variables:

```bash
# Development
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id

# Production
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

### Step 3: Create Webhook

1. In PayPal Dashboard, go to **Webhooks**
2. Click **Add Webhook**
3. Enter URL: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
4. Select events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`
5. Save and copy **Webhook ID**
6. Add to environment variables as `PAYPAL_WEBHOOK_ID`

### Step 4: Deploy Edge Functions

```bash
# Deploy create-paypal-order
supabase functions deploy create-paypal-order

# Deploy paypal-webhook
supabase functions deploy paypal-webhook
```

### Step 5: Test

1. Go to pricing page in your app
2. Select a plan
3. Complete payment with PayPal sandbox account
4. Verify:
   - Payment redirects to success page
   - Database updated
   - Email sent

## ✅ Verification Checklist

- [ ] PayPal credentials obtained (sandbox and live)
- [ ] Environment variables set in Supabase
- [ ] Webhook created and ID configured
- [ ] Edge Functions deployed
- [ ] Test payment completed successfully
- [ ] Database updated correctly
- [ ] Email notification received
- [ ] Production credentials configured
- [ ] Production webhook created

## 🔧 Common Issues

### "PayPal client ID not configured"
**Solution:** Check environment variables are set correctly in Supabase Dashboard.

### "Failed to get PayPal access token"
**Solution:** Verify client ID and secret are correct for the environment (sandbox vs live).

### "Webhook signature verification failed"
**Solution:** Ensure webhook ID matches the webhook created in PayPal Dashboard.

### Payment succeeds but database not updated
**Solution:** Check webhook is active and URL is correct. View logs with:
```bash
supabase functions logs paypal-webhook
```

## 📚 Full Documentation

For complete documentation, see:
- [PAYPAL_CONFIGURATION_COMPLETE.md](./PAYPAL_CONFIGURATION_COMPLETE.md)
- [ENVIRONMENT_CONFIGURATION.md](./ENVIRONMENT_CONFIGURATION.md)

## 🆘 Support

If you encounter issues:
1. Check [Troubleshooting section](./PAYPAL_CONFIGURATION_COMPLETE.md#troubleshooting)
2. View Edge Function logs: `supabase functions logs paypal-webhook`
3. Verify configuration: Use `ConfigStatus` component in dev mode

---

**Last Updated:** January 2025
