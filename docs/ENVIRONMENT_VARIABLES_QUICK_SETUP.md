
# Environment Variables Quick Setup

## Quick Copy-Paste List for Natively

Use this checklist when setting up environment variables in Natively's Environment Variables tab.

## ✅ Setup Checklist

### 1. General Configuration (2 variables)

```
Name: APP_ENV
Value: dev (or production)
Type: Secret
```

```
Name: ADMIN_EMAILS
Value: cheikh@universalshipping.com
Type: Secret
```

### 2. Supabase Configuration (3 variables)

```
Name: SUPABASE_URL
Value: https://lnfsjpuffrcyenuuoxxk.supabase.co
Type: Public
```

```
Name: SUPABASE_ANON_KEY
Value: [Paste from Supabase Dashboard → Project Settings → API]
Type: Public
```

```
Name: SUPABASE_SERVICE_KEY
Value: [Paste from Supabase Dashboard → Project Settings → API]
Type: Secret ⚠️
```

### 3. PayPal Configuration (5 variables)

```
Name: PAYMENT_PROVIDER
Value: paypal
Type: Secret
```

```
Name: PAYPAL_ENV
Value: sandbox (or live for production)
Type: Secret
```

```
Name: PAYPAL_CLIENT_ID
Value: [Paste from PayPal Developer Dashboard]
Type: Public
```

```
Name: PAYPAL_CLIENT_SECRET
Value: [Paste from PayPal Developer Dashboard]
Type: Secret ⚠️
```

```
Name: PAYPAL_WEBHOOK_ID
Value: [Paste from PayPal Developer Dashboard → Webhooks]
Type: Secret ⚠️
```

### 4. Google Maps Configuration (1 variable)

```
Name: GOOGLE_MAPS_API_KEY
Value: [Paste from Google Cloud Console]
Type: Public
```

### 5. SMTP Configuration (4 variables)

```
Name: SMTP_HOST
Value: smtp.gmail.com
Type: Secret
```

```
Name: SMTP_PORT
Value: 587
Type: Secret
```

```
Name: SMTP_USERNAME
Value: [Your email address]
Type: Secret ⚠️
```

```
Name: SMTP_PASSWORD
Value: [Your SMTP password or App Password]
Type: Secret ⚠️
```

## 📋 Total: 15 Variables

- ✓ 2 General Configuration
- ✓ 3 Supabase Configuration
- ✓ 5 PayPal Configuration
- ✓ 1 Google Maps Configuration
- ✓ 4 SMTP Configuration

## 🔑 Where to Get Values

### Supabase Keys
1. Go to: https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk
2. Navigate to: **Project Settings** → **API**
3. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_KEY`

### PayPal Keys
1. Go to: https://developer.paypal.com/dashboard/
2. Navigate to: **Apps & Credentials**
3. Select: **Sandbox** (for dev) or **Live** (for production)
4. Copy:
   - Client ID → `PAYPAL_CLIENT_ID`
   - Secret → `PAYPAL_CLIENT_SECRET`
5. For Webhook ID:
   - Go to **Webhooks** section
   - Create webhook with URL: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
   - Copy Webhook ID → `PAYPAL_WEBHOOK_ID`

### Google Maps Key
1. Go to: https://console.cloud.google.com/
2. Navigate to: **APIs & Services** → **Credentials**
3. Create or select API key
4. Copy: API Key → `GOOGLE_MAPS_API_KEY`

### SMTP Password (Gmail)
1. Go to: https://myaccount.google.com/security
2. Enable: **2-Step Verification**
3. Navigate to: **App Passwords**
4. Generate: New app password for "Mail"
5. Copy: Generated password → `SMTP_PASSWORD`

## ⚙️ Environment-Specific Values

### For Development/Testing:
```
APP_ENV=dev
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_client_secret>
PAYPAL_WEBHOOK_ID=<sandbox_webhook_id>
```

### For Production:
```
APP_ENV=production
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=<live_client_id>
PAYPAL_CLIENT_SECRET=<live_client_secret>
PAYPAL_WEBHOOK_ID=<live_webhook_id>
```

## ⚠️ Important Notes

1. **Never expose Secret variables** - Mark them as Secret in Natively
2. **Match environments** - sandbox for dev, live for production
3. **Use App Password for Gmail** - Not your regular password
4. **No spaces** - Ensure no extra spaces in variable names or values
5. **Case-sensitive** - Variable names must match exactly
6. **Restart required** - Restart app after adding variables

## ✅ Verification

After setting all variables, verify:

1. **Count**: All 15 variables are present
2. **Types**: Secret variables marked as Secret
3. **Values**: No typos or extra spaces
4. **Consistency**: `APP_ENV` matches `PAYPAL_ENV` (dev→sandbox, production→live)

## 🔧 Also Set in Supabase

Don't forget to set these in Supabase Dashboard for Edge Functions:

**Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Environment Variables**

Add these SECRET variables:
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
- `PAYMENT_PROVIDER`

## 📚 Full Documentation

For detailed setup instructions, see:
- `docs/NATIVELY_ENVIRONMENT_SETUP.md` - Complete step-by-step guide
- `docs/ENVIRONMENT_VARIABLES_REFERENCE.md` - Full variable reference
- `docs/PAYPAL_CONFIGURATION.md` - PayPal-specific setup

---

**Last Updated:** January 2025  
**Quick Reference Version:** 1.0.0
