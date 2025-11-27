
# Google Maps & PayPal Integration - Implementation Complete

## Overview

This document describes the implementation of real Google Maps and PayPal credentials in the USS application, including server-side validation and proper security practices.

## Architecture

### Environment Variables

#### Supabase (Server-side)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key for server-side validation
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_SECRET` - PayPal secret (never exposed to client)
- `PAYPAL_ENV` - PayPal environment (sandbox or live)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

#### Expo/Natively (Client-side)
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key for client-side map display
- `EXPO_PUBLIC_PAYPAL_CLIENT_ID` - PayPal client ID for client-side SDK initialization
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Implementation Details

### 1. Health-Check Edge Function

**Location:** `supabase/functions/health-check/index.ts`

**Purpose:** Server-side validation of API keys and credentials

**Features:**
- ✅ Validates Supabase connectivity (CRITICAL service)
- ✅ Validates Google Maps API key by making a test Geocoding API request
- ✅ Validates PayPal credentials by obtaining an access token
- ✅ Validates SMTP configuration (optional service)
- ✅ Returns detailed status for each service
- ✅ Distinguishes between critical and optional services

**Response Format:**
```json
{
  "overall": "healthy" | "degraded" | "critical",
  "results": [
    {
      "service": "Service Name",
      "ok": true/false,
      "message": "Status message",
      "details": {},
      "isCritical": true/false
    }
  ],
  "timestamp": "2024-01-27T12:00:00.000Z"
}
```

**Status Logic:**
- `critical` - Only when Supabase (critical service) fails
- `degraded` - When optional services (Google Maps, PayPal, SMTP) are not configured or fail
- `healthy` - All services operational

### 2. Configuration Verification

**Location:** `config/configVerification.ts`

**Purpose:** Client-side interface to health-check function

**Features:**
- ✅ Calls health-check Edge Function for server-side validation
- ✅ Falls back to local verification if Edge Function fails
- ✅ Caches results to avoid excessive API calls
- ✅ Provides detailed error messages

**Usage:**
```typescript
import { getConfigStatus } from '@/config/configVerification';

const status = await getConfigStatus();
console.log(status.overall); // 'healthy' | 'degraded' | 'critical'
console.log(status.results); // Array of service statuses
```

### 3. Admin Status Screen

**Location:** `app/(tabs)/admin-config.tsx`

**Purpose:** Admin-only screen to view system status

**Features:**
- ✅ Displays overall system status
- ✅ Shows detailed status for each service
- ✅ Refresh button to re-check status
- ✅ Color-coded badges (green=OK, yellow=warning, red=error)
- ✅ Admin-only access (requires admin email)

**Status Display:**
- **Supabase** - Green "OK" or Red "CRITICAL"
- **Google Maps** - Green "OK" or Yellow "Optional"
- **PayPal** - Green "OK" or Yellow "Optional"
- **SMTP** - Green "OK" or Yellow "Optional"

**Messages:**
- Google Maps OK: "Map features are enabled"
- Google Maps Warning: "Map display may be limited."
- PayPal OK: "Online payment is enabled (sandbox/live mode)"
- PayPal Warning: "Online payment is optional and disabled."

### 4. Google Maps Integration

**Location:** `components/PortsMap.tsx`

**Purpose:** Display interactive map with port locations

**Features:**
- ✅ Uses `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` from app config
- ✅ Checks if API key is configured before rendering map
- ✅ Shows warning message if API key is missing
- ✅ Displays port markers with custom colors
- ✅ User location tracking
- ✅ Nearby ports calculation (within 500km)

**API Key Usage:**
```typescript
import appConfig from '@/config/appConfig';

const hasGoogleMapsKey = !!appConfig.env.GOOGLE_MAPS_API_KEY;

if (!hasGoogleMapsKey) {
  // Show warning message
  return <WarningView />;
}

// Render map with PROVIDER_GOOGLE
<MapView provider={PROVIDER_GOOGLE} ... />
```

### 5. PayPal Integration

**Client-side:**
- Uses `EXPO_PUBLIC_PAYPAL_CLIENT_ID` for SDK initialization
- Never exposes `PAYPAL_SECRET` to client

**Server-side:**
- Edge Functions use `PAYPAL_SECRET` for sensitive operations
- Examples:
  - `create-paypal-order` - Creates payment orders
  - `paypal-webhook` - Handles payment webhooks
  - `health-check` - Validates credentials

**Payment Flow:**
1. Client initializes PayPal SDK with `EXPO_PUBLIC_PAYPAL_CLIENT_ID`
2. User selects PayPal payment method
3. Client calls Edge Function to create order (uses `PAYPAL_SECRET` server-side)
4. PayPal SDK handles payment UI
5. Webhook receives payment confirmation (validated with `PAYPAL_SECRET`)
6. Database updated with payment status

## Security Best Practices

### ✅ Implemented

1. **Separation of Concerns**
   - Public keys (EXPO_PUBLIC_*) exposed to client
   - Secret keys (no prefix) kept server-side only

2. **Server-side Validation**
   - API keys validated on server before use
   - Credentials never exposed in client code

3. **Admin-only Access**
   - Status screen restricted to admin users
   - Admin emails configured in `ADMIN_EMAILS` environment variable

4. **Error Handling**
   - Graceful degradation when services unavailable
   - Clear error messages for debugging
   - No sensitive information in error messages

5. **Environment Consistency**
   - Warnings when using sandbox in production
   - Warnings when using live in development

## Testing Checklist

### After Deployment

- [ ] Navigate to Admin Config screen (admin-only)
- [ ] Click "Refresh" button
- [ ] Verify Supabase shows "OK" (green badge)
- [ ] Verify Google Maps shows "OK" (green badge) with message "Map features are enabled"
- [ ] Verify PayPal shows "OK" (green badge) with message "Online payment is enabled"
- [ ] Verify overall status shows "Operational" (green)
- [ ] Test map display on Port Coverage screen
- [ ] Test PayPal payment flow (if applicable)

### Expected Results

**With Valid Credentials:**
```
Overall Status: Operational

✓ Supabase - OK
  Database operational

✓ Google Maps - OK
  Map features are enabled

✓ PayPal - OK
  Online payment is enabled (sandbox mode)

⚠ SMTP - Optional
  Email features are optional and not configured.
```

**Without Credentials:**
```
Overall Status: Operational (with warnings)

✓ Supabase - OK
  Database operational

⚠ Google Maps - Optional
  Map display may be limited.

⚠ PayPal - Optional
  Online payment is optional and disabled.

⚠ SMTP - Optional
  Email features are optional and not configured.
```

## Troubleshooting

### Google Maps Not Working

1. Check `GOOGLE_MAPS_API_KEY` is set in Supabase secrets
2. Check `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set in app.json extra
3. Verify API key has Geocoding API enabled
4. Check API key restrictions (HTTP referrers, IP addresses)
5. View health-check logs for detailed error messages

### PayPal Not Working

1. Check `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` are set in Supabase secrets
2. Check `EXPO_PUBLIC_PAYPAL_CLIENT_ID` is set in app.json extra
3. Verify `PAYPAL_ENV` is set to "sandbox" or "live"
4. Test credentials in PayPal Developer Dashboard
5. View health-check logs for authentication errors

### Status Screen Shows Critical

1. This means Supabase is offline or misconfigured
2. Check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Verify Supabase project is active
4. Check network connectivity

## API Endpoints

### Health Check
```
POST https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/health-check
Authorization: Bearer <anon_key>
```

**Response:**
```json
{
  "overall": "healthy",
  "results": [...],
  "timestamp": "2024-01-27T12:00:00.000Z"
}
```

## Environment Variables Reference

### Required (Critical)
- `SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Optional (Enhanced Features)
- `GOOGLE_MAPS_API_KEY` / `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `PAYPAL_CLIENT_ID` / `EXPO_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET` (server-only)
- `PAYPAL_ENV`
- `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`

## Next Steps

1. ✅ Deploy health-check Edge Function
2. ✅ Update config verification to use health-check
3. ✅ Update status screen with new messages
4. ✅ Update map component to use API key
5. ⏳ Test with real credentials
6. ⏳ Monitor health-check logs
7. ⏳ Implement PayPal payment flow (if not already done)

## Support

For issues or questions:
1. Check health-check Edge Function logs
2. Review this documentation
3. Check Supabase dashboard for environment variables
4. Verify API keys in respective provider dashboards
