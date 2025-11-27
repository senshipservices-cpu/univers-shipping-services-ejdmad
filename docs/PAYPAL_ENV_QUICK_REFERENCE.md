
# PayPal Environment Variables - Quick Reference

## Required Environment Variables

### Supabase Edge Functions (Server-Side)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal sandbox client ID | `AXXXXXXXXXXXXXXXXXXXx` | Yes (for sandbox) |
| `PAYPAL_SANDBOX_SECRET` | PayPal sandbox secret | `EYYYYYYYYYYYYYYYYYYYy` | Yes (for sandbox) |
| `PAYPAL_LIVE_CLIENT_ID` | PayPal live client ID | `AZZZZZZZZZZZZZZZZZZZz` | Yes (for live) |
| `PAYPAL_LIVE_SECRET` | PayPal live secret | `EWWWWWWWWWWWWWWWWWWWw` | Yes (for live) |
| `PAYPAL_ENV` | Environment selector | `sandbox` or `live` | Yes |

### Natively/Expo (Client-Side)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EXPO_PUBLIC_PAYPAL_CLIENT_ID` | Public PayPal client ID (must match PAYPAL_ENV) | `AXXXXXXXXXXXXXXXXXXXx` | Yes |

## Configuration Matrix

### Sandbox Mode

```bash
# Supabase
PAYPAL_ENV=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_SECRET=your_sandbox_secret

# Natively
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id  # Same as PAYPAL_SANDBOX_CLIENT_ID
```

### Live Mode

```bash
# Supabase
PAYPAL_ENV=live
PAYPAL_LIVE_CLIENT_ID=your_live_client_id
PAYPAL_LIVE_SECRET=your_live_secret

# Natively
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id  # Same as PAYPAL_LIVE_CLIENT_ID
```

## Quick Setup Commands

### 1. Set Supabase Secrets

```bash
# Using Supabase CLI
supabase secrets set PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
supabase secrets set PAYPAL_SANDBOX_SECRET=your_sandbox_secret
supabase secrets set PAYPAL_LIVE_CLIENT_ID=your_live_client_id
supabase secrets set PAYPAL_LIVE_SECRET=your_live_secret
supabase secrets set PAYPAL_ENV=sandbox
```

### 2. Set Natively Environment Variables

In your Natively project settings, add:
```bash
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

### 3. Verify Configuration

```bash
# Check health-check endpoint
curl https://your-project.supabase.co/functions/v1/health-check
```

## Switching Modes

### From Sandbox to Live

1. Update Supabase:
   ```bash
   supabase secrets set PAYPAL_ENV=live
   ```

2. Update Natively:
   ```bash
   EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
   ```

3. Rebuild app

### From Live to Sandbox

1. Update Supabase:
   ```bash
   supabase secrets set PAYPAL_ENV=sandbox
   ```

2. Update Natively:
   ```bash
   EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
   ```

3. Rebuild app

## Validation Checklist

- [ ] `PAYPAL_ENV` is set to either "sandbox" or "live"
- [ ] Sandbox credentials are set (if using sandbox)
- [ ] Live credentials are set (if using live)
- [ ] `EXPO_PUBLIC_PAYPAL_CLIENT_ID` matches the environment
- [ ] Health check returns OK for PayPal
- [ ] Status screen shows correct mode
- [ ] Test payment works in selected environment

## Common Issues

| Issue | Solution |
|-------|----------|
| "PayPal authentication failed" | Check credentials match PAYPAL_ENV |
| "Online payment is disabled" | Verify all required variables are set |
| Wrong mode displayed | Refresh status screen or check PAYPAL_ENV |
| Client ID mismatch | Ensure EXPO_PUBLIC_PAYPAL_CLIENT_ID matches environment |

## API Endpoints by Environment

| Environment | API URL | Web URL |
|-------------|---------|---------|
| Sandbox | `https://api-m.sandbox.paypal.com` | `https://www.sandbox.paypal.com` |
| Live | `https://api-m.paypal.com` | `https://www.paypal.com` |

## Status Messages

| Status | Message | Meaning |
|--------|---------|---------|
| ✅ OK | "Online payment is enabled (sandbox mode)" | Sandbox configured correctly |
| ✅ OK | "Online payment is enabled (live mode)" | Live configured correctly |
| ⚠️ Optional | "Online payment is optional and disabled" | PayPal not configured |
| ❌ Error | "PayPal authentication failed" | Invalid credentials |

## Security Notes

- ✅ **DO** keep secrets in Supabase Edge Functions only
- ✅ **DO** use sandbox for development and testing
- ✅ **DO** verify credentials before switching to live
- ❌ **DON'T** expose secrets in client-side code
- ❌ **DON'T** commit credentials to version control
- ❌ **DON'T** use live mode for testing

## Support

For issues or questions:
1. Check the health-check endpoint
2. Review Edge Function logs in Supabase
3. Verify environment variables are set correctly
4. Consult the full documentation: `PAYPAL_LIVE_MODE_CONFIGURATION.md`
