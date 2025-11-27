
# PayPal Live Mode Configuration

## Overview

The USS application now supports both PayPal **sandbox** (test) and **live** (production) modes through environment variable configuration. Switching between modes requires only changing the `PAYPAL_ENV` variable without any code modifications.

## Environment Variables

### Required Variables (Supabase Edge Functions)

Configure these in your Supabase project settings under **Edge Functions Secrets**:

#### Sandbox Credentials
```bash
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_SECRET=your_sandbox_secret
```

#### Live Credentials
```bash
PAYPAL_LIVE_CLIENT_ID=your_live_client_id
PAYPAL_LIVE_SECRET=your_live_secret
```

#### Environment Selector
```bash
PAYPAL_ENV=sandbox  # or "live" for production
```

### Client-Side Variable (Natively/Expo)

Configure this in your Natively environment variables:

```bash
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_matching_PAYPAL_ENV
```

**Important:** The `EXPO_PUBLIC_PAYPAL_CLIENT_ID` must match the environment specified in `PAYPAL_ENV`:
- If `PAYPAL_ENV=sandbox`, use your sandbox client ID
- If `PAYPAL_ENV=live`, use your live client ID

## How It Works

### Server-Side (Edge Functions)

The Edge Functions (`health-check` and `create-paypal-order`) automatically select the correct credentials and API endpoints based on `PAYPAL_ENV`:

```typescript
// Automatic selection in Edge Functions
if (PAYPAL_ENV === 'live') {
  clientId = PAYPAL_LIVE_CLIENT_ID
  clientSecret = PAYPAL_LIVE_SECRET
  apiUrl = 'https://api-m.paypal.com'
} else {
  clientId = PAYPAL_SANDBOX_CLIENT_ID
  clientSecret = PAYPAL_SANDBOX_SECRET
  apiUrl = 'https://api-m.sandbox.paypal.com'
}
```

### Client-Side (Mobile/Web App)

The app uses only the public client ID exposed via `EXPO_PUBLIC_PAYPAL_CLIENT_ID`. This value should correspond to the environment set in `PAYPAL_ENV`.

## Configuration Steps

### Step 1: Set Up PayPal Credentials

1. **Sandbox Credentials:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Navigate to **Apps & Credentials** → **Sandbox**
   - Create or select an app
   - Copy the **Client ID** and **Secret**

2. **Live Credentials:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Navigate to **Apps & Credentials** → **Live**
   - Create or select an app
   - Copy the **Client ID** and **Secret**

### Step 2: Configure Supabase Edge Functions

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Manage secrets**
3. Add the following secrets:

```bash
PAYPAL_SANDBOX_CLIENT_ID=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
PAYPAL_SANDBOX_SECRET=EYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYy
PAYPAL_LIVE_CLIENT_ID=AZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZz
PAYPAL_LIVE_SECRET=EWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw
PAYPAL_ENV=sandbox
```

### Step 3: Configure Natively Environment

1. In your Natively project settings
2. Add or update the environment variable:

```bash
EXPO_PUBLIC_PAYPAL_CLIENT_ID=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
```

**Note:** Use the sandbox client ID if `PAYPAL_ENV=sandbox`, or the live client ID if `PAYPAL_ENV=live`.

### Step 4: Rebuild the App

After changing environment variables, rebuild your app:

```bash
# For development
npm run dev

# For production builds
# Rebuild iOS and Android apps with new environment variables
```

## Switching Between Sandbox and Live

To switch from sandbox to live mode:

1. **Update Supabase:**
   ```bash
   PAYPAL_ENV=live
   ```

2. **Update Natively:**
   ```bash
   EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
   ```

3. **Rebuild the app** to apply the new client ID

4. **Verify** using the health-check endpoint or status screen

## Health Check and Status Screen

The application includes a health-check system that validates PayPal configuration:

### Health Check Endpoint

The `health-check` Edge Function tests PayPal credentials by obtaining an access token:

```bash
GET https://your-project.supabase.co/functions/v1/health-check
```

Response:
```json
{
  "overall": "healthy",
  "results": [
    {
      "service": "PayPal",
      "ok": true,
      "message": "Online payment is enabled (sandbox mode)",
      "details": {
        "environment": "sandbox",
        "apiUrl": "https://api-m.sandbox.paypal.com"
      },
      "isCritical": false
    }
  ]
}
```

### Status Screen (Admin Only)

Admins can view the system status screen which displays:

- **Sandbox Mode:** "Online payment is enabled (sandbox mode)" with OK badge
- **Live Mode:** "Online payment is enabled (live mode)" with OK badge
- **Not Configured:** "Online payment is optional and disabled" with Optional badge

The status screen automatically refreshes and shows the current PayPal environment.

## Testing

### Sandbox Testing

1. Set `PAYPAL_ENV=sandbox`
2. Use PayPal sandbox test accounts
3. Test payments with sandbox credentials
4. Verify in PayPal Developer Dashboard → Sandbox → Accounts

### Live Testing

1. Set `PAYPAL_ENV=live`
2. Use real PayPal accounts
3. Process real payments
4. Verify in PayPal Dashboard → Activity

**Warning:** Live mode processes real payments. Always test thoroughly in sandbox before switching to live.

## Troubleshooting

### Issue: "PayPal authentication failed"

**Solution:**
- Verify credentials are correct for the selected environment
- Check that `PAYPAL_ENV` matches the credentials being used
- Ensure no extra spaces in environment variables

### Issue: "Online payment is optional and disabled"

**Solution:**
- Check that all required environment variables are set
- Verify `PAYPAL_ENV` is either "sandbox" or "live"
- Ensure credentials match the environment

### Issue: Status screen shows wrong environment

**Solution:**
- Click the **Refresh** button to reload the status
- Verify `PAYPAL_ENV` is set correctly in Supabase
- Check Edge Function logs for errors

## Security Best Practices

1. **Never expose secrets client-side:**
   - Only `EXPO_PUBLIC_PAYPAL_CLIENT_ID` should be in the app
   - Keep `PAYPAL_SANDBOX_SECRET` and `PAYPAL_LIVE_SECRET` in Supabase only

2. **Use sandbox for development:**
   - Always use sandbox mode during development
   - Only switch to live for production deployments

3. **Rotate credentials regularly:**
   - Update PayPal credentials periodically
   - Use different credentials for different environments

4. **Monitor transactions:**
   - Regularly check PayPal dashboard for suspicious activity
   - Set up alerts for unusual payment patterns

## API Endpoints

### Sandbox
- API: `https://api-m.sandbox.paypal.com`
- Web: `https://www.sandbox.paypal.com`

### Live
- API: `https://api-m.paypal.com`
- Web: `https://www.paypal.com`

## Summary

The PayPal Live mode implementation provides:

- ✅ Environment-based configuration (sandbox/live)
- ✅ Automatic credential selection based on `PAYPAL_ENV`
- ✅ Health check validation for both modes
- ✅ Admin status screen showing current mode
- ✅ No code changes required to switch modes
- ✅ Secure credential management (secrets stay server-side)

Simply change `PAYPAL_ENV` to switch between sandbox and live modes!
