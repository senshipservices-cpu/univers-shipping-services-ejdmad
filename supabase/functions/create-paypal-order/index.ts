
// @deno-types="npm:@supabase/supabase-js@2"
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PayPal API configuration
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || '';
const PAYPAL_ENV = Deno.env.get('PAYPAL_ENV') || 'sandbox';
const PAYPAL_API_URL = PAYPAL_ENV === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal auth error:', error);
    throw new Error('Failed to get PayPal access token');
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Create PayPal order
 */
async function createPayPalOrder(accessToken: string, orderData: any): Promise<any> {
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal order creation error:', error);
    throw new Error('Failed to create PayPal order');
  }
  
  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { plan_code, quote_id, context } = body;

    console.log('Creating PayPal order - context:', context, 'user:', user.id);

    // Get client record
    const { data: client } = await supabaseClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const baseUrl = req.headers.get('origin') || 'https://natively.dev';

    let orderData: any;
    let metadata: any = {
      user_id: user.id,
      context,
    };

    // Handle freight quote payment
    if (context === 'freight_quote' && quote_id) {
      console.log('Processing freight quote payment for quote:', quote_id);

      // Fetch the freight quote
      const { data: quote, error: quoteError } = await supabaseClient
        .from('freight_quotes')
        .select('*')
        .eq('id', quote_id)
        .single();

      if (quoteError || !quote) {
        console.error('Quote not found:', quoteError);
        return new Response(
          JSON.stringify({ error: 'Quote not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      // Verify ownership
      if (quote.client !== client?.id) {
        console.error('User does not own this quote');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - You do not own this quote' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }

      // Check if quote has an amount
      if (!quote.quote_amount || quote.quote_amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Quote does not have a valid amount' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Check if quote is already paid
      if (quote.payment_status === 'paid') {
        return new Response(
          JSON.stringify({ error: 'Quote is already paid' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Update payment status to processing
      await supabaseClient
        .from('freight_quotes')
        .update({ payment_status: 'processing' })
        .eq('id', quote_id);

      console.log('Updated quote payment status to processing');

      // Prepare PayPal order data
      const currency = (quote.quote_currency || 'EUR').toUpperCase();
      const amount = parseFloat(quote.quote_amount).toFixed(2);

      metadata.quote_id = quote.id;

      orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: quote.id,
            description: `Devis #${quote.id.substring(0, 8)} – Universal Shipping Services`,
            custom_id: JSON.stringify(metadata),
            amount: {
              currency_code: currency,
              value: amount,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amount,
                },
              },
            },
            items: [
              {
                name: `Fret: ${quote.cargo_type || 'N/A'}`,
                description: `${quote.origin_port || 'N/A'} → ${quote.destination_port || 'N/A'}`,
                unit_amount: {
                  currency_code: currency,
                  value: amount,
                },
                quantity: '1',
              },
            ],
          },
        ],
        application_context: {
          brand_name: 'Universal Shipping Services',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}/payment-success?context=freight_quote&quote_id=${quote_id}`,
          cancel_url: `${baseUrl}/payment-cancel?context=freight_quote`,
        },
      };
    } 
    // Handle pricing plan payment
    else if (plan_code) {
      console.log('Creating PayPal order for plan:', plan_code);

      // Fetch the pricing plan from the database
      const { data: plan, error: planError } = await supabaseClient
        .from('pricing_plans')
        .select('*')
        .eq('code', plan_code)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        console.error('Plan not found:', planError);
        return new Response(
          JSON.stringify({ error: 'Plan not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      // Create a provisional subscription record
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          client: client?.id || null,
          plan_code: plan_code,
          status: 'pending',
          is_active: false,
          start_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription record' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      console.log('Created provisional subscription:', subscription.id);

      // Prepare PayPal order data
      const currency = plan.currency.toUpperCase();
      const amount = parseFloat(plan.price_eur).toFixed(2);

      metadata.plan_code = plan_code;
      metadata.subscription_id = subscription.id;

      orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: subscription.id,
            description: plan.name,
            custom_id: JSON.stringify(metadata),
            amount: {
              currency_code: currency,
              value: amount,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amount,
                },
              },
            },
            items: [
              {
                name: plan.name,
                description: plan.description || '',
                unit_amount: {
                  currency_code: currency,
                  value: amount,
                },
                quantity: '1',
              },
            ],
          },
        ],
        application_context: {
          brand_name: 'Universal Shipping Services',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}/payment-success?context=pricing_plan&subscription_id=${subscription.id}`,
          cancel_url: `${baseUrl}/payment-cancel?context=pricing_plan`,
        },
      };

      // Update subscription with payment reference
      await supabaseClient
        .from('subscriptions')
        .update({
          payment_provider: 'paypal',
        })
        .eq('id', subscription.id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing plan_code or quote_id' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const order = await createPayPalOrder(accessToken, orderData);

    console.log('PayPal order created:', order.id);

    // Store order ID in the appropriate record
    if (context === 'freight_quote' && quote_id) {
      await supabaseClient
        .from('freight_quotes')
        .update({ stripe_payment_intent_id: order.id })
        .eq('id', quote_id);
    } else if (metadata.subscription_id) {
      await supabaseClient
        .from('subscriptions')
        .update({ payment_reference: order.id })
        .eq('id', metadata.subscription_id);
    }

    // Find the approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({
        orderId: order.id,
        url: approvalUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
