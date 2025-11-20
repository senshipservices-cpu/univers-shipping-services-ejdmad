
# Stripe Edge Function Examples

This document provides example Edge Functions for Stripe integration.

## Create Checkout Session

This Edge Function creates a Stripe Checkout Session for one-time payments or subscriptions.

**File:** `supabase/functions/create-checkout-session/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { planCode, mode = 'subscription' } = await req.json()

    if (!planCode) {
      throw new Error('Plan code is required')
    }

    // Get pricing plan from database
    const { data: plan, error: planError } = await supabaseClient
      .from('pricing_plans')
      .select('*')
      .eq('code', planCode)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      throw new Error('Pricing plan not found')
    }

    // Get or create Stripe customer
    const { data: client } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let customerId: string | undefined

    // Check if customer already has a Stripe customer ID
    // You might want to add a stripe_customer_id field to the clients table
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          client_id: client?.id || '',
        },
      })
      customerId = customer.id

      // Save Stripe customer ID to database
      // await supabaseClient
      //   .from('clients')
      //   .update({ stripe_customer_id: customerId })
      //   .eq('user_id', user.id)
    }

    // Create Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: mode as 'payment' | 'subscription',
      success_url: `${req.headers.get('origin')}/subscription-confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        user_id: user.id,
        client_id: client?.id || '',
        plan_code: planCode,
      },
    }

    if (mode === 'subscription' && plan.stripe_price_id) {
      // Subscription mode
      sessionParams.line_items = [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ]
    } else {
      // One-time payment mode
      sessionParams.line_items = [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(plan.price_eur * 100), // Convert to cents
          },
          quantity: 1,
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Create pending subscription record
    await supabaseClient.from('subscriptions').insert({
      user_id: user.id,
      client: client?.id,
      plan_code: planCode,
      status: 'pending',
      is_active: false,
      start_date: new Date().toISOString(),
      payment_provider: 'stripe',
      payment_reference: session.id,
    })

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

## Stripe Webhook Handler

This Edge Function handles Stripe webhook events.

**File:** `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planCode = session.metadata?.plan_code

        if (!userId || !planCode) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update subscription status
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            is_active: true,
            stripe_subscription_id: session.subscription as string,
            payment_reference: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_reference', session.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription activated for user:', userId)
        }

        // Send confirmation email
        await supabaseAdmin.from('email_notifications').insert({
          recipient_email: session.customer_email || '',
          email_type: 'subscription_activated',
          subject: 'Subscription Activated',
          metadata: {
            plan_code: planCode,
            session_id: session.id,
          },
          status: 'pending',
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription metadata')
          break
        }

        // Update subscription status based on Stripe status
        let status = 'active'
        let isActive = true

        if (subscription.status === 'canceled') {
          status = 'cancelled'
          isActive = false
        } else if (subscription.status === 'past_due') {
          status = 'pending'
          isActive = false
        }

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status,
            is_active: isActive,
            end_date: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as cancelled
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            is_active: false,
            end_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)

        // Log successful payment
        await supabaseAdmin.from('events_log').insert({
          event_type: 'payment_succeeded',
          details: JSON.stringify({
            invoice_id: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
          }),
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)

        // Log failed payment
        await supabaseAdmin.from('events_log').insert({
          event_type: 'payment_failed',
          details: JSON.stringify({
            invoice_id: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
          }),
        })

        // Send payment failed email
        if (invoice.customer_email) {
          await supabaseAdmin.from('email_notifications').insert({
            recipient_email: invoice.customer_email,
            email_type: 'payment_failed',
            subject: 'Payment Failed',
            metadata: {
              invoice_id: invoice.id,
              amount: invoice.amount_due,
            },
            status: 'pending',
          })
        }

        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

## Deploy Edge Functions

To deploy these Edge Functions:

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

## Usage in React Native

```typescript
import { supabase } from '@/app/integrations/supabase/client';

// Create checkout session
const createCheckoutSession = async (planCode: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ planCode, mode: 'subscription' }),
      }
    );

    const { url } = await response.json();
    
    // Open Stripe Checkout in browser
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
};
```
