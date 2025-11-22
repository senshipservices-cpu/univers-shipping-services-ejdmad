
# Environment Setup Guide for Natively

## 🚨 Current Issue: Invalid Supabase URL

The error you're seeing indicates that the Supabase environment variables are not properly configured in Natively.

### Error Message
```
Uncaught Error
Invalid Supabase URL: Must be a valid HTTP or HTTPS URL
```

## ✅ Solution: Configure Environment Variables in Natively

### Step 1: Access Environment Variables

1. Open your project in Natively
2. Navigate to the **Environment Variables** tab
3. You should see a list of environment variables (or an empty list if none are configured)

### Step 2: Add Required Variables

Add the following environment variables one by one:

#### 1. EXPO_PUBLIC_SUPABASE_URL

- **Name:** `EXPO_PUBLIC_SUPABASE_URL`
- **Value:** `https://lnfsjpuffrcyenuuoxxk.supabase.co`
- **Type:** Public (not secret)
- **Description:** Your Supabase project URL

#### 2. EXPO_PUBLIC_SUPABASE_ANON_KEY

- **Name:** `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU`
- **Type:** Public (not secret)
- **Description:** Your Supabase anonymous key

### Step 3: Save and Restart

1. Click **Save** after adding each variable
2. **Restart the app** to apply the changes
3. The error should be resolved

## 📋 Complete Environment Variables List

For full functionality, you should also add these optional variables:

### Payment Configuration (Optional)

```
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Google Maps (Optional)

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Admin Configuration (Optional)

```
ADMIN_EMAILS=cheikh@universalshipping.com
APP_ENV=dev
```

## 🔍 Verification

After adding the environment variables and restarting:

1. The app should start without errors
2. You should see a success message in the console:
   ```
   ✓ Supabase configuration validated
   ✓ Initializing Supabase client...
   ✓ Supabase client initialized successfully
   ```

## 🐛 Troubleshooting

### Issue: Variables not being recognized

**Solution:**
- Make sure you've saved the variables in Natively
- Restart the app completely (not just refresh)
- Check that variable names are exactly as specified (case-sensitive)

### Issue: Still getting "Invalid URL" error

**Solution:**
- Verify the URL starts with `https://`
- Check for extra spaces or characters
- Make sure the variable name is `EXPO_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)

### Issue: Variables work locally but not in Natively

**Solution:**
- Natively uses `app.json` extra configuration
- Variables must be prefixed with `EXPO_PUBLIC_` for frontend access
- Backend-only variables (like secrets) don't need the prefix

## 📚 Additional Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES_REFERENCE.md)
- [PayPal Configuration](./PAYPAL_CONFIGURATION.md)

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check the console logs for detailed error messages
2. Verify your Supabase project is active
3. Ensure your API keys haven't expired
4. Contact support with the error logs

---

**Last Updated:** January 2025
**Project:** 3S Global / Universal Shipping Services
**Supabase Project ID:** lnfsjpuffrcyenuuoxxk
