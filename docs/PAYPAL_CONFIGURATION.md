
# PayPal Configuration Guide

## Overview

This application now supports PayPal as the primary payment provider, with proper separation between development (sandbox) and production (live) environments. All sensitive keys are stored in environment variables for security.

## Environment Variables

### Required Variables

#### General Configuration
- `APP_ENV`: Application environment (`dev` or `production`)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Supabase service role key (backend only)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `ADMIN_EMAILS`: Comma-separated list of admin emails

#### SMTP Configuration
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_USERNAME`: SMTP username
- `SMTP_PASSWORD`: SMTP password

#### PayPal Configuration
- `EXPO_PUBLIC_PAYPAL_CLIENT_ID`: PayPal REST API Client ID (public, used in frontend)
- `PAYPAL_CLIENT_SECRET`: PayPal REST API Client Secret (secret, backend only)
- `PAYPAL_WEBHOOK_ID`: PayPal Webhook ID for signature verification
- `PAYPAL_ENV`: PayPal environment (`sandbox` for dev, `live` for production)
- `PAYMENT_PROVIDER`: Active payment provider (`paypal` or `stripe`)

#### Legacy Stripe Configuration (Optional)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

## Environment Setup

### Development Environment

```bash
# .env.development
APP_ENV=dev
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
```

### Production Environment

```bash
# .env.production
APP_ENV=production
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

## PayPal Setup

### 1. Create PayPal App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Apps & Credentials**
3. Create a new app or use an existing one
4. Note down the **Client ID** and **Client Secret**

### 2. Configure Webhooks

1. In your PayPal app settings, go to **Webhooks**
2. Create a new webhook with the following URL:
   - Sandbox: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
   - Live: `https://lnfsjpuffrcyenuuoxxk.supabase.co/functions/v1/paypal-webhook`
3. Subscribe to the following events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`
4. Note down the **Webhook ID**

### 3. Set Environment Variables

#### In Supabase Dashboard

1. Go to **Project Settings** → **Edge Functions**
2. Add the following secrets:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_WEBHOOK_ID`
   - `PAYPAL_ENV`
   - `PAYMENT_PROVIDER`

#### In Expo/React Native App

1. Create `.env` file in project root
2. Add the public variables:
   ```
   EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_ENV=sandbox
   PAYMENT_PROVIDER=paypal
   ```

## Architecture

### Configuration Module (`config/appConfig.ts`)

Centralized configuration that:
- Reads environment variables from multiple sources
- Provides environment flags (`isProduction`, `isDev`)
- Exposes payment provider configuration
- Includes conditional logging
- Validates configuration

### Payment Utilities (`utils/paypal.ts`)

Helper functions for:
- Getting PayPal client ID and environment
- Formatting prices and currencies
- Validating PayPal configuration
- Logging PayPal events (dev only)

### Edge Functions

#### `create-paypal-order`
- Creates PayPal orders for freight quotes and pricing plans
- Handles authentication with PayPal API
- Stores order metadata in Supabase
- Returns approval URL for user redirection

#### `paypal-webhook`
- Receives and verifies PayPal webhook events
- Processes payment completions
- Updates database records (quotes, subscriptions, shipments)
- Sends email notifications
- Logs all events for audit

## Payment Flow

### Freight Quote Payment

1. User requests quote payment
2. Frontend calls `create-paypal-order` Edge Function
3. Edge Function creates PayPal order with quote details
4. User is redirected to PayPal for payment
5. After payment, PayPal sends webhook to `paypal-webhook`
6. Webhook updates quote status to "paid"
7. Webhook creates shipment from quote
8. Email confirmation sent to user

### Pricing Plan Payment

1. User selects pricing plan
2. Frontend calls `create-paypal-order` Edge Function
3. Edge Function creates provisional subscription
4. Edge Function creates PayPal order with plan details
5. User is redirected to PayPal for payment
6. After payment, PayPal sends webhook to `paypal-webhook`
7. Webhook activates subscription
8. Email confirmation sent to user

## Security Features

### No Hardcoded Keys
- All sensitive keys stored in environment variables
- No keys visible in code or logs (production)
- Separate keys for sandbox and live environments

### Webhook Verification
- PayPal webhook signatures verified using `PAYPAL_WEBHOOK_ID`
- Invalid signatures rejected
- All webhook events logged for audit

### Environment Consistency Checks
- Automatic validation that `PAYPAL_ENV` matches `APP_ENV`
- Warnings if using sandbox in production or vice versa
- Configuration verification on app startup

### Conditional Logging
- Sensitive data only logged in development
- Production logs exclude payment details
- All errors logged regardless of environment

## Testing

### Development Testing (Sandbox)

1. Set `PAYPAL_ENV=sandbox`
2. Use sandbox credentials from PayPal Developer Dashboard
3. Test payments with [PayPal sandbox test accounts](https://developer.paypal.com/dashboard/accounts)
4. Verify webhook events in Supabase logs

### Production Testing

1. Set `PAYPAL_ENV=live`
2. Use live credentials from PayPal Dashboard
3. Test with small real payments
4. Monitor webhook events and email notifications

## Monitoring

### Configuration Status

The app includes a `ConfigStatus` component (dev only) that displays:
- Current environment (dev/production)
- Active payment provider (PayPal/Stripe)
- PayPal environment (sandbox/live)
- Configuration validation results

### Logs

All payment events are logged to:
- `payment_logs` table: Webhook events and processing status
- `events_log` table: Business events (quote paid, subscription activated)
- Console logs: Detailed debugging information (dev only)

### Email Notifications

Automatic emails sent for:
- Quote payment received
- Subscription activated
- Payment failures (optional)

## Troubleshooting

### Common Issues

#### "PayPal client ID not configured"
- Ensure `EXPO_PUBLIC_PAYPAL_CLIENT_ID` is set in environment
- Check that variable is properly injected in `app.json`

#### "Webhook signature verification failed"
- Verify `PAYPAL_WEBHOOK_ID` matches the webhook in PayPal Dashboard
- Ensure webhook URL is correct
- Check that webhook is active in PayPal

#### "Using PayPal sandbox in production"
- Change `PAYPAL_ENV` to `live` in production environment
- Update PayPal credentials to live keys

#### "Payment not completing"
- Check webhook events in PayPal Dashboard
- Verify webhook is receiving events
- Check Supabase Edge Function logs
- Ensure `payment_logs` table exists

### Debug Mode

Enable verbose logging by setting `APP_ENV=dev`:
```typescript
appConfig.logger.payment('PayPal order created:', orderId);
```

## Migration from Stripe

If migrating from Stripe to PayPal:

1. Update `PAYMENT_PROVIDER` to `paypal`
2. Set PayPal environment variables
3. Deploy PayPal Edge Functions
4. Update webhook URLs in PayPal Dashboard
5. Test thoroughly in sandbox before going live
6. Keep Stripe configuration for backward compatibility (optional)

## Best Practices

1. **Never commit secrets**: Use `.env` files and add to `.gitignore`
2. **Separate environments**: Use different PayPal apps for sandbox and live
3. **Verify webhooks**: Always verify webhook signatures in production
4. **Log everything**: Log all payment events for audit and debugging
5. **Test thoroughly**: Test all payment flows in sandbox before production
6. **Monitor actively**: Set up alerts for payment failures
7. **Rotate keys**: Regularly rotate PayPal credentials
8. **Backup data**: Regularly backup `payment_logs` and `events_log` tables

## Support

For issues or questions:
- Check PayPal Developer Documentation: https://developer.paypal.com/docs/
- Review Supabase Edge Function logs
- Contact PayPal Developer Support
- Review application logs in `payment_logs` table

## References

- [PayPal REST API Documentation](https://developer.paypal.com/docs/api/overview/)
- [PayPal Webhooks Guide](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
