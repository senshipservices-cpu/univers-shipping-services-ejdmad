
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  sender: {
    type: 'individual' | 'company';
    name: string;
    phone: string;
    email: string;
  };
  pickup: {
    address: string;
    city: string;
    country: string;
  };
  delivery: {
    address: string;
    city: string;
    country: string;
  };
  parcel: {
    type: 'document' | 'standard' | 'fragile' | 'express';
    weight_kg: number;
    declared_value: number;
    options: string[];
  };
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
    const quoteRequest: QuoteRequest = await req.json();

    // Validate request
    if (!quoteRequest.sender || !quoteRequest.pickup || !quoteRequest.delivery || !quoteRequest.parcel) {
      return new Response(
        JSON.stringify({ error: 'Informations incorrectes.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate quote (simplified pricing logic)
    let basePrice = 50; // Base price in EUR

    // Add weight-based pricing
    basePrice += quoteRequest.parcel.weight_kg * 5;

    // Add parcel type pricing
    const typeMultipliers = {
      document: 1.0,
      standard: 1.2,
      fragile: 1.5,
      express: 2.0,
    };
    basePrice *= typeMultipliers[quoteRequest.parcel.type];

    // Add options pricing
    if (quoteRequest.parcel.options.includes('insurance')) {
      basePrice += quoteRequest.parcel.declared_value * 0.02; // 2% of declared value
    }
    if (quoteRequest.parcel.options.includes('express')) {
      basePrice *= 1.5;
    }
    if (quoteRequest.parcel.options.includes('signature')) {
      basePrice += 10;
    }

    // Calculate estimated delivery date
    const daysToDeliver = quoteRequest.parcel.options.includes('express') ? 3 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToDeliver);

    // Generate quote ID
    const quoteId = crypto.randomUUID();

    // Store quote in database (optional - for tracking)
    const { error: insertError } = await supabaseClient
      .from('freight_quotes')
      .insert({
        id: quoteId,
        client_email: quoteRequest.sender.email,
        client_name: quoteRequest.sender.name,
        cargo_type: quoteRequest.parcel.type,
        volume_details: `${quoteRequest.parcel.weight_kg} kg`,
        quote_amount: basePrice.toFixed(2),
        quote_currency: 'EUR',
        status: 'received',
        payment_status: 'unpaid',
        can_pay_online: true,
      });

    if (insertError) {
      console.error('Error storing quote:', insertError);
    }

    // Return quote response
    return new Response(
      JSON.stringify({
        quote_id: quoteId,
        price: basePrice.toFixed(2),
        currency: 'EUR',
        estimated_delivery: estimatedDelivery.toISOString(),
        breakdown: {
          base: 50,
          weight: quoteRequest.parcel.weight_kg * 5,
          type_multiplier: typeMultipliers[quoteRequest.parcel.type],
          options: quoteRequest.parcel.options,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing quote:', error);
    return new Response(
      JSON.stringify({ error: 'Service indisponible.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
