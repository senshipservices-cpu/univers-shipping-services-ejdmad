
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

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return cleanPhone.length >= 8 && /^[\d+]+$/.test(cleanPhone);
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
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

    // Parse request body
    const quoteRequest: QuoteRequest = await req.json();

    // SECURITY: Validate all required fields
    if (!quoteRequest.sender || !quoteRequest.pickup || !quoteRequest.delivery || !quoteRequest.parcel) {
      return new Response(
        JSON.stringify({ error: 'Informations incorrectes.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate email format
    if (!validateEmail(quoteRequest.sender.email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate phone format
    if (!validatePhone(quoteRequest.sender.phone)) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone incorrect.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate weight
    if (quoteRequest.parcel.weight_kg <= 0 || quoteRequest.parcel.weight_kg > 100) {
      return new Response(
        JSON.stringify({ error: 'Poids non valide (doit être > 0 et <= 100 kg).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate declared value
    if (quoteRequest.parcel.declared_value < 0) {
      return new Response(
        JSON.stringify({ error: 'Valeur déclarée invalide.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Sanitize all string inputs
    const sanitizedRequest = {
      sender: {
        ...quoteRequest.sender,
        name: sanitizeInput(quoteRequest.sender.name),
        email: sanitizeInput(quoteRequest.sender.email),
        phone: sanitizeInput(quoteRequest.sender.phone),
      },
      pickup: {
        address: sanitizeInput(quoteRequest.pickup.address),
        city: sanitizeInput(quoteRequest.pickup.city),
        country: sanitizeInput(quoteRequest.pickup.country),
      },
      delivery: {
        address: sanitizeInput(quoteRequest.delivery.address),
        city: sanitizeInput(quoteRequest.delivery.city),
        country: sanitizeInput(quoteRequest.delivery.country),
      },
      parcel: quoteRequest.parcel,
    };

    // Calculate quote (SERVER-SIDE ONLY - prevent manipulation)
    let basePrice = 50; // Base price in EUR

    // Add weight-based pricing
    basePrice += sanitizedRequest.parcel.weight_kg * 5;

    // Add parcel type pricing
    const typeMultipliers = {
      document: 1.0,
      standard: 1.2,
      fragile: 1.5,
      express: 2.0,
    };
    basePrice *= typeMultipliers[sanitizedRequest.parcel.type];

    // Add options pricing
    if (sanitizedRequest.parcel.options.includes('insurance')) {
      basePrice += sanitizedRequest.parcel.declared_value * 0.02; // 2% of declared value
    }
    if (sanitizedRequest.parcel.options.includes('express')) {
      basePrice *= 1.5;
    }
    if (sanitizedRequest.parcel.options.includes('signature')) {
      basePrice += 10;
    }

    // Calculate estimated delivery date
    const daysToDeliver = sanitizedRequest.parcel.options.includes('express') ? 3 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToDeliver);

    // Generate quote ID
    const quoteId = crypto.randomUUID();

    // Store quote in database with user_id association
    const { error: insertError } = await supabaseClient
      .from('freight_quotes')
      .insert({
        id: quoteId,
        client_email: sanitizedRequest.sender.email,
        client_name: sanitizedRequest.sender.name,
        cargo_type: sanitizedRequest.parcel.type,
        volume_details: `${sanitizedRequest.parcel.weight_kg} kg`,
        quote_amount: basePrice.toFixed(2),
        quote_currency: 'EUR',
        status: 'received',
        payment_status: 'unpaid',
        can_pay_online: true,
        // SECURITY: Associate with authenticated user
        created_by_user_id: user.id,
      });

    if (insertError) {
      console.error('Error storing quote:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du devis.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
          weight: sanitizedRequest.parcel.weight_kg * 5,
          type_multiplier: typeMultipliers[sanitizedRequest.parcel.type],
          options: sanitizedRequest.parcel.options,
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
