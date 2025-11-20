
# Stripe Setup Checklist

Use this checklist to ensure proper Stripe integration setup.

## 🔐 Step 1: Stripe Account Setup

### Create Stripe Account
- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Verify your email address
- [ ] Complete business information
- [ ] Enable test mode

### Get API Keys
- [ ] Navigate to **Developers > API keys**
- [ ] Copy **Publishable key** (pk_test_...)
- [ ] Copy **Secret key** (sk_test_...)
- [ ] Store keys securely

## 📝 Step 2: Environment Configuration

### Update .env File
- [ ] Copy `.env.example` to `.env`
- [ ] Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] Add `STRIPE_SECRET_KEY=sk_test_...` (for Edge Functions)
- [ ] Restart development server

### Verify Configuration
- [ ] Check that Stripe keys are loaded in app
- [ ] Verify StripeProvider is initialized
- [ ] Check console for any Stripe-related errors

## 💳 Step 3: Create Stripe Products

### For Each Recurring Plan
- [ ] Go to **Products** in Stripe Dashboard
- [ ] Click **Add product**
- [ ] Enter product name (e.g., "Global Basic")
- [ ] Add description
- [ ] Set pricing:
  - [ ] Amount: 29.99
  - [ ] Currency: EUR
  - [ ] Billing period: Monthly/Yearly
- [ ] Save product
- [ ] Copy Price ID (price_...)

### Update Database
```sql
-- Update each plan with its Stripe Price ID
UPDATE pricing_plans 
SET stripe_price_id = 'price_1234567890abcdef'
WHERE code = 'GLOBAL_BASIC';

UPDATE pricing_plans 
SET stripe_price_id = 'price_abcdef1234567890'
WHERE code = 'GLOBAL_PRO';

-- Repeat for all recurring plans
```

- [ ] Update GLOBAL_BASIC plan
- [ ] Update GLOBAL_PRO plan
- [ ] Update GLOBAL_ENTERPRISE plan
- [ ] Update GLOBAL_BASIC_YEARLY plan
- [ ] Update GLOBAL_PRO_YEARLY plan

### Verify Products
- [ ] Check all products are visible in Stripe Dashboard
- [ ] Verify prices are correct
- [ ] Confirm billing periods are set correctly

## 🔧 Step 4: Create Edge Functions

### Create Checkout Session Function
- [ ] Create file: `supabase/functions/create-checkout-session/index.ts`
- [ ] Copy code from `STRIPE_EDGE_FUNCTION_EXAMPLE.md`
- [ ] Deploy function: `supabase functions deploy create-checkout-session`
- [ ] Test function with curl or Postman

### Create Webhook Handler Function
- [ ] Create file: `supabase/functions/stripe-webhook/index.ts`
- [ ] Copy code from `STRIPE_EDGE_FUNCTION_EXAMPLE.md`
- [ ] Deploy function: `supabase functions deploy stripe-webhook`
- [ ] Note the function URL

### Set Edge Function Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

- [ ] Set STRIPE_SECRET_KEY
- [ ] Set STRIPE_WEBHOOK_SECRET (after webhook creation)
- [ ] Verify secrets are set: `supabase secrets list`

## 🔔 Step 5: Configure Webhooks

### Create Webhook Endpoint
- [ ] Go to **Developers > Webhooks** in Stripe Dashboard
- [ ] Click **Add endpoint**
- [ ] Enter endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Select API version: Latest

### Select Events
- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

### Configure Webhook
- [ ] Save webhook endpoint
- [ ] Copy **Signing secret** (whsec_...)
- [ ] Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Update Edge Function secret
- [ ] Test webhook with Stripe CLI or Dashboard

## 🧪 Step 6: Testing

### Test Payment Flow
- [ ] Open pricing page in app
- [ ] Select a plan
- [ ] Click "Choose this plan"
- [ ] Verify checkout session is created
- [ ] Complete payment with test card: 4242 4242 4242 4242
- [ ] Verify redirect to success page
- [ ] Check subscription created in database

### Test Webhook Events
- [ ] Trigger `checkout.session.completed` event
- [ ] Verify subscription status updated to "active"
- [ ] Check email notification sent
- [ ] Test subscription update event
- [ ] Test subscription cancellation
- [ ] Test payment failure with card: 4000 0000 0000 0002

### Test Edge Functions
- [ ] Check Edge Function logs in Supabase Dashboard
- [ ] Verify no errors in function execution
- [ ] Test error handling with invalid data
- [ ] Verify webhook signature validation

### Test Database
- [ ] Verify pricing_plans table has correct data
- [ ] Check subscriptions table for test subscription
- [ ] Verify RLS policies work correctly
- [ ] Test queries with different user roles

## 📱 Step 7: UI Integration

### Create Pricing Page
- [ ] Display pricing plans using `usePricingPlans` hook
- [ ] Show plan details (name, price, description)
- [ ] Add "Choose plan" buttons
- [ ] Implement plan selection logic

### Create Checkout Flow
- [ ] Call Edge Function to create checkout session
- [ ] Open Stripe Checkout in browser
- [ ] Handle success/cancel redirects
- [ ] Show loading states

### Create Success Page
- [ ] Create subscription confirmation page
- [ ] Display subscription details
- [ ] Show next steps
- [ ] Add link to dashboard

### Update User Dashboard
- [ ] Display current subscription status
- [ ] Show subscription details (plan, billing period, next payment)
- [ ] Add "Manage subscription" button
- [ ] Show payment history

## 🔒 Step 8: Security Review

### Code Review
- [ ] Verify no secret keys in client code
- [ ] Check webhook signature verification
- [ ] Ensure proper error handling
- [ ] Verify user authentication required

### Database Security
- [ ] Verify RLS policies are enabled
- [ ] Test policies with different user roles
- [ ] Check foreign key constraints
- [ ] Verify indexes are created

### API Security
- [ ] Verify Edge Functions require authentication
- [ ] Check CORS configuration
- [ ] Test rate limiting (if implemented)
- [ ] Verify input validation

## 📊 Step 9: Monitoring Setup

### Stripe Dashboard
- [ ] Set up email notifications for failed payments
- [ ] Configure alerts for unusual activity
- [ ] Review payment analytics
- [ ] Monitor webhook delivery

### Supabase Dashboard
- [ ] Check Edge Function logs regularly
- [ ] Monitor database performance
- [ ] Review error logs
- [ ] Set up alerts for critical errors

### Application Monitoring
- [ ] Add logging for payment events
- [ ] Track conversion rates
- [ ] Monitor subscription churn
- [ ] Set up analytics for pricing page

## 🚀 Step 10: Production Preparation

### Before Going Live
- [ ] Test entire flow end-to-end
- [ ] Review all documentation
- [ ] Train support team
- [ ] Prepare customer communication

### Switch to Production
- [ ] Get production API keys from Stripe
- [ ] Update environment variables
- [ ] Update webhook endpoints
- [ ] Deploy to production
- [ ] Test with small real payment
- [ ] Monitor closely for first 24 hours

### Post-Launch
- [ ] Monitor payment success rate
- [ ] Review customer feedback
- [ ] Check for any errors
- [ ] Optimize based on data

## ✅ Final Verification

- [ ] All test payments successful
- [ ] Webhooks working correctly
- [ ] Database updates properly
- [ ] Email notifications sent
- [ ] UI displays correct information
- [ ] Error handling works
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Team trained
- [ ] Ready for production

## 📞 Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Supabase Documentation:** https://supabase.com/docs
- **Project Documentation:** See `/docs` folder

## 🎉 Completion

Once all items are checked, your Stripe integration is complete and ready for use!

**Current Status:** ⏳ Configuration Complete - Awaiting Stripe Account Setup

**Next Action:** Complete Step 1 - Stripe Account Setup
