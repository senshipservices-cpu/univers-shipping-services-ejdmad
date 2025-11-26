
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

interface PaymentRequest {
  quote_id: string;
  payment_method: 'card' | 'mobile_money' | 'cash_on_delivery';
  payment_token: string;
}

// Generate non-sequential tracking number
function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'USS-';
  
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
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

    // SECURITY: Verify authentication
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

    // SECURITY: Get idempotency key to prevent duplicate payments
    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return new Response(
        JSON.stringify({ error: 'Idempotency-Key header required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this idempotency key was already processed
    const { data: existingPayment } = await supabaseClient
      .from('payment_idempotency')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .eq('user_id', user.id)
      .single();

    if (existingPayment) {
      // Return the existing result to prevent duplicate payment
      return new Response(
        JSON.stringify(existingPayment.response_data),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const paymentRequest: PaymentRequest = await req.json();

    // SECURITY: Validate request
    if (!paymentRequest.quote_id || !paymentRequest.payment_method) {
      return new Response(
        JSON.stringify({ error: 'Informations de paiement manquantes.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Get quote from database and verify ownership
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

    // SECURITY: Verify quote belongs to user or is accessible
    if (quote.created_by_user_id && quote.created_by_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Accès non autorisé à ce devis.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate amount (SERVER-SIDE - prevent front-end manipulation)
    if (!quote.quote_amount || parseFloat(quote.quote_amount) <= 0) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Check if quote was already paid
    if (quote.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Ce devis a déjà été payé.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process payment (simplified - in production, integrate with payment provider)
    let paymentStatus = 'pending';
    let paymentIntentId = null;

    if (paymentRequest.payment_method === 'card') {
      // SECURITY: In production, use Stripe/Paystack/CinetPay
      // Never handle card numbers directly in the app
      // Payment token should come from payment provider SDK
      paymentStatus = 'paid';
      paymentIntentId = `pi_${crypto.randomUUID()}`;
    } else if (paymentRequest.payment_method === 'mobile_money') {
      paymentStatus = 'processing';
      paymentIntentId = `mm_${crypto.randomUUID()}`;
    } else if (paymentRequest.payment_method === 'cash_on_delivery') {
      paymentStatus = 'pending';
    }

    // SECURITY: Generate non-sequential tracking number
    const trackingNumber = generateTrackingNumber();

    // Get client ID
    const { data: client } = await supabaseClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Create shipment with user_id association
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .insert({
        tracking_number: trackingNumber,
        client: client?.id,
        cargo_type: quote.cargo_type,
        current_status: 'confirmed',
        internal_notes: `Created from quote ${paymentRequest.quote_id}`,
        // SECURITY: Associate with user
        created_by_user_id: user.id,
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

    // Prepare response
    const responseData = {
      shipment_id: shipment.id,
      tracking_number: trackingNumber,
      payment_status: paymentStatus,
      payment_intent_id: paymentIntentId,
    };

    // SECURITY: Store idempotency key to prevent duplicate payments
    await supabaseClient
      .from('payment_idempotency')
      .insert({
        idempotency_key: idempotencyKey,
        user_id: user.id,
        quote_id: paymentRequest.quote_id,
        shipment_id: shipment.id,
        response_data: responseData,
      });

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
      JSON.stringify(responseData),
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
