
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingRequest {
  tracking_number: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse request body
    const trackingRequest: TrackingRequest = await req.json();

    if (!trackingRequest.tracking_number) {
      return new Response(
        JSON.stringify({ error: 'Numéro de suivi requis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tracking number format
    const trackingPattern = /^USS-[A-Z0-9]{7}$/;
    if (!trackingPattern.test(trackingRequest.tracking_number)) {
      return new Response(
        JSON.stringify({ error: 'Format de numéro de suivi invalide.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get shipment from database
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .select('id, tracking_number, current_status, origin_port, destination_port, estimated_arrival, actual_arrival, created_at')
      .eq('tracking_number', trackingRequest.tracking_number)
      .single();

    if (shipmentError || !shipment) {
      return new Response(
        JSON.stringify({ error: 'Expédition introuvable.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get tracking timeline (status history)
    const { data: timeline } = await supabaseClient
      .from('shipment_status_history')
      .select('status, location, timestamp, notes')
      .eq('shipment_id', shipment.id)
      .order('timestamp', { ascending: true });

    // SECURITY: Return LIMITED data for public tracking
    // DO NOT expose: sender name, recipient name, phone, email, package value
    const publicData = {
      tracking_number: shipment.tracking_number,
      status: shipment.current_status,
      origin: shipment.origin_port,
      destination: shipment.destination_port,
      estimated_arrival: shipment.estimated_arrival,
      actual_arrival: shipment.actual_arrival,
      created_at: shipment.created_at,
      timeline: timeline?.map(event => ({
        status: event.status,
        location: event.location,
        date: event.timestamp,
        // Only include public-safe notes
        notes: event.notes?.includes('public:') ? event.notes.replace('public:', '') : null,
      })) || [],
    };

    return new Response(
      JSON.stringify(publicData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return new Response(
      JSON.stringify({ error: 'Service indisponible.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
