
# Environment Variables - Quick Setup Guide

## Step 1: Copy Environment Variables Template

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

## Step 2: Fill in Your Values

Edit the `.env` file with your actual values:

```bash
# =============================================================================
# GENERAL CONFIGURATION
# =============================================================================

APP_ENV=dev
ADMIN_EMAILS=your-admin-email@example.com,another-admin@example.com

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================

EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# =============================================================================
# PAYMENT CONFIGURATION
# =============================================================================

PAYMENT_PROVIDER=paypal

# =============================================================================
# PAYPAL CONFIGURATION
# =============================================================================

PAYPAL_ENV=sandbox
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here

# =============================================================================
# GOOGLE MAPS CONFIGURATION
# =============================================================================

EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# =============================================================================
# SMTP CONFIGURATION (Email Notifications)
# =============================================================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@universalshipping.com
SMTP_PASSWORD=your_smtp_password_here
```

## Step 3: Configure in Natively

1. Go to your Natively project
2. Click on **Environment Variables** tab
3. Add each variable:

### Public Variables (Safe to expose to frontend)

| Variable | Value | Secret? |
|----------|-------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://lnfsjpuffrcyenuuoxxk.supabase.co` | No |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | No |
| `EXPO_PUBLIC_PAYPAL_CLIENT_ID` | Your PayPal client ID | No |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | No |

### Private Variables (Backend only - mark as Secret)

| Variable | Value | Secret? |
|----------|-------|---------|
| `APP_ENV` | `dev` or `production` | No |
| `ADMIN_EMAILS` | `admin1@example.com,admin2@example.com` | No |
| `PAYMENT_PROVIDER` | `paypal` | No |
| `PAYPAL_ENV` | `sandbox` or `live` | No |
| `SUPABASE_SERVICE_KEY` | Your service role key | **Yes** |
| `PAYPAL_CLIENT_SECRET` | Your PayPal client secret | **Yes** |
| `PAYPAL_WEBHOOK_ID` | Your PayPal webhook ID | **Yes** |
| `SMTP_HOST` | `smtp.gmail.com` | No |
| `SMTP_PORT` | `587` | No |
| `SMTP_USERNAME` | Your SMTP username | No |
| `SMTP_PASSWORD` | Your SMTP password | **Yes** |

## Step 4: Configure Supabase Edge Functions

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add these variables (all are secrets):

```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
PAYPAL_ENV=sandbox
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@universalshipping.com
SMTP_PASSWORD=your_smtp_password_here
APP_ENV=dev
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Step 5: Verify Configuration

Run the app in development mode and check the ConfigStatus component:

```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

// Add to your development screen
<ConfigStatus />
```

Or manually verify:

```typescript
import appConfig from '@/config/appConfig';

const { valid, errors, warnings } = appConfig.validateConfig();
console.log('Valid:', valid);
console.log('Errors:', errors);
console.log('Warnings:', warnings);
```

## Common Issues

### Issue: "SUPABASE_URL is not set"

**Solution:** Make sure you're using the correct variable name:
- Frontend: `EXPO_PUBLIC_SUPABASE_URL`
- Backend: `SUPABASE_URL`

### Issue: "Admin access denied"

**Solution:** 
1. Check that `ADMIN_EMAILS` is set
2. Verify your email is in the list
3. Make sure there are no spaces in the comma-separated list
4. Example: `admin1@example.com,admin2@example.com` ✅
5. Wrong: `admin1@example.com, admin2@example.com` ❌ (space after comma)

### Issue: "PayPal authentication failed"

**Solution:**
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
2. Check that `PAYPAL_ENV` matches your credentials (sandbox vs live)
3. Make sure credentials are from the correct environment in PayPal Dashboard

### Issue: "Email not sending"

**Solution:**
1. Verify all SMTP variables are set
2. For Gmail, use an App Password (not your regular password)
3. Enable "Less secure app access" or use OAuth2

## Production Deployment

When deploying to production:

1. **Change environment:**
   ```bash
   APP_ENV=production
   PAYPAL_ENV=live
   ```

2. **Use live credentials:**
   - PayPal: Use credentials from "Live" tab in PayPal Dashboard
   - SMTP: Use production email server

3. **Verify all variables are set:**
   ```typescript
   const { valid, errors } = appConfig.validateConfig();
   if (!valid) {
     console.error('Configuration errors:', errors);
   }
   ```

4. **Test thoroughly:**
   - Test admin access
   - Test payment flow
   - Test email sending
   - Verify all features work

## Security Reminders

- ✅ Never commit `.env` to version control
- ✅ Use different credentials for dev and production
- ✅ Rotate credentials every 3-6 months
- ✅ Mark sensitive variables as "Secret" in Natively
- ✅ Use sandbox credentials for development
- ✅ Restrict API keys to specific domains/apps
- ✅ Monitor API usage and set up billing alerts

## Need Help?

See the full documentation:
- `docs/ENVIRONMENT_VARIABLES_IMPLEMENTATION.md` - Complete implementation details
- `docs/ENVIRONMENT_VARIABLES_REFERENCE.md` - Full variable reference
- `docs/PAYPAL_CONFIGURATION.md` - PayPal-specific setup
- `.env.example` - Template with all variables
