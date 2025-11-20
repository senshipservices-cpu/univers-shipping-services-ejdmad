
# Stripe Integration Troubleshooting Guide

## Common Issues and Solutions

### 🔑 API Key Issues

#### Issue: "Stripe publishable key not found"
**Symptoms:**
- App shows warning in console
- Stripe functionality not working
- StripeProvider not initializing

**Solutions:**
1. Check `.env` file exists and contains `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Restart development server after adding environment variables
3. Verify key starts with `pk_test_` (test mode) or `pk_live_` (production)
4. Check for typos in environment variable name

**Verification:**
```typescript
import Constants from 'expo-constants';
console.log('Stripe Key:', Constants.expoConfig?.extra?.stripePublishableKey);
```

#### Issue: "Invalid API key provided"
**Symptoms:**
- Stripe API calls fail with 401 error
- Checkout session creation fails

**Solutions:**
1. Verify you're using the correct key (publishable vs secret)
2. Check key hasn't been deleted or rotated in Stripe Dashboard
3. Ensure no extra spaces or characters in key
4. Verify key is from correct Stripe account

---

### 🔔 Webhook Issues

#### Issue: "Webhook signature verification failed"
**Symptoms:**
- Webhook events not processing
- 400 error in Edge Function logs
- Subscriptions not activating

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches webhook endpoint secret
2. Check webhook endpoint URL is correct
3. Ensure webhook secret is set in Edge Function
4. Verify webhook is enabled in Stripe Dashboard

**Verification:**
```bash
# Check Edge Function secrets
supabase secrets list

# Test webhook locally
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

#### Issue: "Webhook events not received"
**Symptoms:**
- Payments succeed but subscriptions not created
- No webhook events in logs

**Solutions:**
1. Check webhook endpoint is publicly accessible
2. Verify webhook URL in Stripe Dashboard
3. Check selected events include required types
4. Review webhook delivery attempts in Stripe Dashboard
5. Check Edge Function is deployed and running

**Verification:**
- Go to Stripe Dashboard > Developers > Webhooks
- Click on your endpoint
- Check "Recent deliveries" section
- Look for failed attempts and error messages

---

### 💳 Payment Issues

#### Issue: "Checkout session creation fails"
**Symptoms:**
- Error when clicking "Choose plan"
- No redirect to Stripe Checkout
- Edge Function returns error

**Solutions:**
1. Check Edge Function logs for specific error
2. Verify user is authenticated
3. Ensure pricing plan exists and is active
4. Check `stripe_price_id` is set for recurring plans
5. Verify Edge Function has correct Stripe secret key

**Verification:**
```sql
-- Check pricing plan
SELECT * FROM pricing_plans WHERE code = 'GLOBAL_BASIC';

-- Check if stripe_price_id is set
SELECT code, stripe_price_id FROM pricing_plans WHERE billing_period != 'one_time';
```

#### Issue: "Payment succeeds but subscription not created"
**Symptoms:**
- Payment completed in Stripe
- No subscription in database
- User can't access paid features

**Solutions:**
1. Check webhook was received and processed
2. Review Edge Function logs for errors
3. Verify subscription creation logic in webhook handler
4. Check database RLS policies allow insertion
5. Manually create subscription if needed

**Manual Fix:**
```sql
-- Create subscription manually
INSERT INTO subscriptions (
  user_id,
  client,
  plan_code,
  stripe_subscription_id,
  status,
  is_active,
  start_date,
  payment_provider
) VALUES (
  'user-uuid',
  'client-uuid',
  'GLOBAL_BASIC',
  'sub_stripe_id',
  'active',
  true,
  NOW(),
  'stripe'
);
```

---

### 🗄️ Database Issues

#### Issue: "RLS policy prevents subscription creation"
**Symptoms:**
- Webhook processes but subscription not saved
- "insufficient privileges" error in logs

**Solutions:**
1. Use Supabase service role key in webhook handler
2. Verify RLS policies allow admin operations
3. Check foreign key constraints are satisfied
4. Ensure user_id and client_id exist

**Verification:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';

-- Test with service role
-- (Use service role key in Edge Function)
```

#### Issue: "Pricing plan not found"
**Symptoms:**
- Error when fetching pricing plans
- Empty pricing page

**Solutions:**
1. Verify pricing plans exist in database
2. Check `is_active` is true
3. Verify RLS policies allow public read
4. Check database connection

**Verification:**
```sql
-- Check pricing plans
SELECT * FROM pricing_plans WHERE is_active = true;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'pricing_plans';
```

---

### 🔄 Subscription Status Issues

#### Issue: "Subscription shows as pending after payment"
**Symptoms:**
- Payment completed
- Subscription exists but status is "pending"
- User can't access paid features

**Solutions:**
1. Check webhook processed `checkout.session.completed` event
2. Manually update subscription status
3. Verify webhook handler updates status correctly
4. Check for errors in webhook processing

**Manual Fix:**
```sql
-- Update subscription status
UPDATE subscriptions
SET status = 'active', is_active = true
WHERE stripe_subscription_id = 'sub_stripe_id';
```

#### Issue: "Subscription not cancelled after cancellation"
**Symptoms:**
- Cancelled in Stripe but still active in app
- User still has access to paid features

**Solutions:**
1. Check webhook received `customer.subscription.deleted` event
2. Verify webhook handler processes cancellation
3. Manually update subscription status
4. Check subscription end_date is set

**Manual Fix:**
```sql
-- Cancel subscription
UPDATE subscriptions
SET 
  status = 'cancelled',
  is_active = false,
  end_date = NOW()
WHERE stripe_subscription_id = 'sub_stripe_id';
```

---

### 🎨 UI/UX Issues

#### Issue: "Pricing plans not displaying"
**Symptoms:**
- Empty pricing page
- Loading state never ends

**Solutions:**
1. Check `usePricingPlans` hook is called correctly
2. Verify API response in network tab
3. Check for JavaScript errors in console
4. Ensure pricing plans exist in database

**Debug:**
```typescript
const { plans, loading, error } = usePricingPlans();

console.log('Plans:', plans);
console.log('Loading:', loading);
console.log('Error:', error);
```

#### Issue: "Checkout redirect not working"
**Symptoms:**
- Button click does nothing
- No redirect to Stripe Checkout
- Error in console

**Solutions:**
1. Check Edge Function URL is correct
2. Verify authentication token is sent
3. Check for CORS errors
4. Ensure Linking.openURL is working

**Debug:**
```typescript
try {
  const response = await fetch(url, options);
  console.log('Response:', response);
  const data = await response.json();
  console.log('Data:', data);
} catch (error) {
  console.error('Error:', error);
}
```

---

### 🧪 Testing Issues

#### Issue: "Test card not working"
**Symptoms:**
- Payment fails with test card
- Error message in Stripe Checkout

**Solutions:**
1. Verify using correct test card number: 4242 4242 4242 4242
2. Use any future expiry date
3. Use any 3-digit CVC
4. Use any postal code
5. Ensure test mode is enabled

**Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Auth required: 4000 0025 0000 3155

#### Issue: "Webhook not triggering in test mode"
**Symptoms:**
- Payment succeeds but webhook not called
- No events in webhook logs

**Solutions:**
1. Use Stripe CLI to forward webhooks locally
2. Check webhook endpoint is accessible
3. Verify webhook is enabled for test mode
4. Check selected events include test events

**Local Testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

### 🔐 Security Issues

#### Issue: "Secret key exposed in client code"
**Symptoms:**
- Secret key visible in browser/app
- Security warning from Stripe

**Solutions:**
1. Remove secret key from client code immediately
2. Rotate API keys in Stripe Dashboard
3. Use only publishable key in client
4. Move secret key operations to Edge Functions

**Prevention:**
- Never commit `.env` file
- Use environment variables
- Review code before deployment
- Use separate keys for test/production

---

### 📊 Monitoring and Debugging

#### Enable Detailed Logging

**Edge Functions:**
```typescript
console.log('Webhook event:', event.type);
console.log('Event data:', JSON.stringify(event.data));
console.log('Processing result:', result);
```

**React Native:**
```typescript
console.log('Creating checkout session for plan:', planCode);
console.log('API response:', response);
console.log('Subscription created:', subscription);
```

#### Check Logs

**Stripe Dashboard:**
- Go to Developers > Logs
- Filter by event type
- Check for errors

**Supabase Dashboard:**
- Go to Edge Functions
- Select function
- View logs

**React Native:**
- Check console output
- Use React Native Debugger
- Check network requests

---

### 🆘 Getting Help

#### Before Asking for Help

1. Check this troubleshooting guide
2. Review Stripe Dashboard logs
3. Check Edge Function logs
4. Review database state
5. Test with Stripe CLI

#### Information to Provide

- Error message (exact text)
- Steps to reproduce
- Environment (test/production)
- Relevant logs
- Code snippets
- Stripe event ID (if applicable)

#### Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Supabase Documentation:** https://supabase.com/docs
- **Project Documentation:** `/docs` folder

---

### 🔧 Quick Fixes

#### Reset Everything
```bash
# Clear app cache
expo start -c

# Restart development server
expo start

# Check environment variables
cat .env

# Verify database state
psql -h your-db-host -U postgres -d postgres
```

#### Verify Configuration
```typescript
// Check Stripe configuration
import { useStripe } from '@/contexts/StripeContext';
const { publishableKey, isReady } = useStripe();
console.log('Stripe ready:', isReady);
console.log('Has key:', !!publishableKey);
```

#### Test Database Connection
```sql
-- Test pricing plans
SELECT COUNT(*) FROM pricing_plans WHERE is_active = true;

-- Test subscriptions
SELECT COUNT(*) FROM subscriptions WHERE is_active = true;

-- Test RLS
SET ROLE authenticated;
SELECT * FROM pricing_plans;
```

---

## 📝 Logging Best Practices

### What to Log

✅ **Do Log:**
- Event types received
- Processing steps
- Success/failure status
- User IDs (hashed if sensitive)
- Timestamps

❌ **Don't Log:**
- Full credit card numbers
- Secret API keys
- Personal information
- Full webhook payloads (may contain sensitive data)

### Example Logging

```typescript
// Good logging
console.log('Processing webhook event:', {
  type: event.type,
  id: event.id,
  created: event.created,
});

// Bad logging
console.log('Full event:', event); // May contain sensitive data
```

---

## 🎯 Prevention Tips

1. **Test thoroughly** before production
2. **Monitor logs** regularly
3. **Set up alerts** for critical errors
4. **Document changes** to configuration
5. **Keep dependencies updated**
6. **Review security** periodically
7. **Backup database** regularly
8. **Test webhook handling** with Stripe CLI
9. **Validate input** in Edge Functions
10. **Use idempotency keys** for critical operations

---

## ✅ Health Check Checklist

Run this checklist regularly to ensure everything is working:

- [ ] Pricing plans loading correctly
- [ ] Checkout session creation works
- [ ] Payments processing successfully
- [ ] Webhooks being received
- [ ] Subscriptions being created
- [ ] Status updates working
- [ ] Email notifications sent
- [ ] No errors in logs
- [ ] Database queries fast
- [ ] RLS policies working

---

**Last Updated:** 2025-01-20

**Need more help?** Check the other documentation files or contact support.
