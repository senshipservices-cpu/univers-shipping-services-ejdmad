
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  quote_id: string;
  payment_method: 'card' | 'mobile_money' | 'cash_on_delivery';
  payment_token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const paymentRequest: PaymentRequest = await req.json();

    // Validate request
    if (!paymentRequest.quote_id || !paymentRequest.payment_method) {
      return new Response(
        JSON.stringify({ error: 'Informations de paiement manquantes.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get quote from database
    const { data: quote, error: quoteError } = await supabaseClient
      .from('freight_quotes')
      .select('*')
      .eq('id', paymentRequest.quote_id)
      .single();

    if (quoteError || !quote) {
      return new Response(
        JSON.stringify({ error: 'Devis introuvable.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount (prevent front-end manipulation)
    if (!quote.quote_amount || parseFloat(quote.quote_amount) <= 0) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process payment (simplified - in production, integrate with payment provider)
    let paymentStatus = 'pending';
    let paymentIntentId = null;

    if (paymentRequest.payment_method === 'card') {
      // Simulate card payment processing
      // In production, integrate with Stripe, PayPal, etc.
      paymentStatus = 'paid';
      paymentIntentId = `pi_${crypto.randomUUID()}`;
    } else if (paymentRequest.payment_method === 'mobile_money') {
      // Simulate mobile money processing
      paymentStatus = 'processing';
      paymentIntentId = `mm_${crypto.randomUUID()}`;
    } else if (paymentRequest.payment_method === 'cash_on_delivery') {
      // Cash on delivery - no immediate payment
      paymentStatus = 'pending';
    }

    // Generate tracking number
    const trackingNumber = `USS${Date.now().toString().slice(-8)}`;

    // Get client ID
    const { data: client } = await supabaseClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Create shipment
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .insert({
        tracking_number: trackingNumber,
        client: client?.id,
        cargo_type: quote.cargo_type,
        current_status: 'confirmed',
        internal_notes: `Created from quote ${paymentRequest.quote_id}`,
      })
      .select()
      .single();

    if (shipmentError) {
      console.error('Error creating shipment:', shipmentError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'expédition.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update quote with payment information
    const { error: updateError } = await supabaseClient
      .from('freight_quotes')
      .update({
        payment_status: paymentStatus,
        stripe_payment_intent_id: paymentIntentId,
        ordered_as_shipment: shipment.id,
        status: 'accepted',
      })
      .eq('id', paymentRequest.quote_id);

    if (updateError) {
      console.error('Error updating quote:', updateError);
    }

    // Log event
    await supabaseClient
      .from('events_log')
      .insert({
        event_type: 'shipment_created',
        user_id: user.id,
        client_id: client?.id,
        shipment_id: shipment.id,
        quote_id: paymentRequest.quote_id,
        details: `Shipment created with tracking number ${trackingNumber}`,
      });

    // Return success response
    return new Response(
      JSON.stringify({
        shipment_id: shipment.id,
        tracking_number: trackingNumber,
        payment_status: paymentStatus,
        payment_intent_id: paymentIntentId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: 'Service indisponible.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
