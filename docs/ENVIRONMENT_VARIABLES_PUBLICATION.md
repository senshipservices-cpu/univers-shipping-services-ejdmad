
# Universal Shipping Services - Environment Variables for Publication

## 🔐 Environment Variables Configuration

This document lists all environment variables required for the USS app to function properly in production.

---

## 📋 Required Environment Variables

### 1. Supabase Configuration

#### Client-Side (Expo)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Server-Side (Supabase Edge Functions)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find:**
- Go to [Supabase Dashboard](https://app.supabase.com/)
- Select your project
- Go to Settings → API
- Copy URL and keys

---

### 2. Payment Providers

#### PayPal (Recommended)

**Client-Side:**
```bash
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```

**Server-Side:**
```bash
PAYPAL_SANDBOX_CLIENT_ID=your-sandbox-client-id
PAYPAL_SANDBOX_SECRET=your-sandbox-secret
PAYPAL_LIVE_CLIENT_ID=your-live-client-id
PAYPAL_LIVE_SECRET=your-live-secret
PAYPAL_ENV=live
```

**Where to find:**
- Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
- Create or select your app
- Copy Client ID and Secret
- Use Sandbox credentials for testing
- Use Live credentials for production

#### Stripe (Optional)

**Client-Side:**
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key-here
```

**Server-Side:**
```bash
STRIPE_SECRET_KEY=sk_live_your-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

**Where to find:**
- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Go to Developers → API keys
- Copy Publishable key and Secret key
- For webhook secret: Developers → Webhooks → Add endpoint

---

### 3. Google Maps

**Client-Side:**
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Server-Side:**
```bash
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Where to find:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable Maps JavaScript API, Geocoding API, Places API
- Go to Credentials → Create credentials → API key
- Restrict key to your app (iOS bundle ID, Android package name, HTTP referrers)

**API Restrictions:**
- Maps JavaScript API (for web)
- Maps SDK for iOS
- Maps SDK for Android
- Geocoding API
- Places API

---

### 4. SMTP Email Configuration

**Server-Side:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@universal-shippingservices.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password: Google Account → Security → App passwords
3. Use the generated password (not your regular password)

**Alternative SMTP Providers:**
- **SendGrid**: smtp.sendgrid.net (port 587)
- **Mailgun**: smtp.mailgun.org (port 587)
- **AWS SES**: email-smtp.region.amazonaws.com (port 587)
- **Postmark**: smtp.postmarkapp.com (port 587)

---

### 5. App Environment

```bash
APP_ENV=production
PAYMENT_PROVIDER=paypal
```

**Options:**
- `APP_ENV`: development | staging | production
- `PAYMENT_PROVIDER`: paypal | stripe

---

## 🔧 Configuration Steps

### Step 1: Create .env File (Local Development)

Create a `.env` file in the project root:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PayPal
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Stripe (optional)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App Config
APP_ENV=development
PAYMENT_PROVIDER=paypal
```

### Step 2: Configure Supabase Edge Functions

Set environment variables in Supabase:

```bash
# Using Supabase CLI
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

supabase secrets set PAYPAL_SANDBOX_CLIENT_ID=your-sandbox-id
supabase secrets set PAYPAL_SANDBOX_SECRET=your-sandbox-secret
supabase secrets set PAYPAL_LIVE_CLIENT_ID=your-live-id
supabase secrets set PAYPAL_LIVE_SECRET=your-live-secret
supabase secrets set PAYPAL_ENV=live

supabase secrets set GOOGLE_MAPS_API_KEY=your-google-maps-key

supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USERNAME=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SMTP_FROM_EMAIL=noreply@universal-shippingservices.com
```

**Or via Supabase Dashboard:**
1. Go to your project in Supabase Dashboard
2. Navigate to Settings → Edge Functions
3. Add each secret manually

### Step 3: Configure EAS Build

Update `eas.json` with environment variables:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_ENV": "production",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_PAYPAL_CLIENT_ID": "your-paypal-client-id",
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "your-google-maps-key",
        "PAYMENT_PROVIDER": "paypal"
      }
    }
  }
}
```

**Or use EAS Secrets (Recommended):**

```bash
# Set secrets for EAS builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_PAYPAL_CLIENT_ID --value "your-paypal-client-id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "your-google-maps-key"
```

---

## ✅ Verification Checklist

### Before Building

- [ ] All client-side variables start with `EXPO_PUBLIC_`
- [ ] Supabase URL and keys are correct
- [ ] PayPal credentials are for LIVE environment (not sandbox)
- [ ] Google Maps API key is unrestricted or properly restricted
- [ ] SMTP credentials are valid and tested
- [ ] APP_ENV is set to "production"
- [ ] PAYMENT_PROVIDER is set correctly

### After Building

- [ ] Test Supabase connection in production build
- [ ] Test PayPal payment flow
- [ ] Test Google Maps display
- [ ] Test email notifications
- [ ] Verify no console errors related to missing variables

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore
.env
.env.local
.env.production
*.pem
*.p12
*.keystore
```

### 2. Use Different Keys for Development and Production
- Development: Use sandbox/test keys
- Production: Use live/production keys

### 3. Restrict API Keys
- **Google Maps**: Restrict to your app's bundle ID and package name
- **Supabase**: Use anon key for client, service role key only in Edge Functions
- **PayPal**: Use separate apps for sandbox and live

### 4. Rotate Keys Regularly
- Change keys every 90 days
- Immediately rotate if compromised
- Keep old keys for 24 hours during transition

### 5. Monitor Usage
- Set up billing alerts
- Monitor API usage
- Check for unusual activity

---

## 🐛 Troubleshooting

### Issue: "Supabase URL not found"
**Solution:**
- Ensure variable name is exactly `EXPO_PUBLIC_SUPABASE_URL`
- Rebuild the app after adding the variable
- Check that the URL includes `https://`

### Issue: "PayPal payment fails in production"
**Solution:**
- Verify you're using LIVE credentials, not sandbox
- Check `PAYPAL_ENV` is set to "live"
- Ensure PayPal app is approved for live transactions

### Issue: "Google Maps not displaying"
**Solution:**
- Verify API key is valid
- Check API restrictions (bundle ID, package name)
- Ensure Maps JavaScript API is enabled
- Check billing is enabled in Google Cloud

### Issue: "Emails not sending"
**Solution:**
- Verify SMTP credentials
- Check SMTP_PORT (usually 587 or 465)
- Ensure "Less secure app access" is enabled (Gmail)
- Use App Password instead of regular password (Gmail)

---

## 📊 Environment Variables Summary

| Variable | Type | Required | Where Used |
|----------|------|----------|------------|
| EXPO_PUBLIC_SUPABASE_URL | Client | Yes | App |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Client | Yes | App |
| SUPABASE_SERVICE_ROLE_KEY | Server | Yes | Edge Functions |
| EXPO_PUBLIC_PAYPAL_CLIENT_ID | Client | Yes | App |
| PAYPAL_LIVE_CLIENT_ID | Server | Yes | Edge Functions |
| PAYPAL_LIVE_SECRET | Server | Yes | Edge Functions |
| PAYPAL_ENV | Server | Yes | Edge Functions |
| EXPO_PUBLIC_GOOGLE_MAPS_API_KEY | Client | Yes | App |
| GOOGLE_MAPS_API_KEY | Server | Optional | Edge Functions |
| SMTP_HOST | Server | Yes | Edge Functions |
| SMTP_PORT | Server | Yes | Edge Functions |
| SMTP_USERNAME | Server | Yes | Edge Functions |
| SMTP_PASSWORD | Server | Yes | Edge Functions |
| SMTP_FROM_EMAIL | Server | Yes | Edge Functions |
| APP_ENV | Both | Yes | App & Edge Functions |
| PAYMENT_PROVIDER | Client | Yes | App |

---

## 📞 Support

If you encounter issues with environment variables:

1. Check the [Expo documentation](https://docs.expo.dev/guides/environment-variables/)
2. Review [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions)
3. Consult the USS development team
4. Check the health-check endpoint: `/api/health-check`

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
