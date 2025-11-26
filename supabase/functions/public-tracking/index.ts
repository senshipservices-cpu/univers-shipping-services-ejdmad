
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

    // Validate tracking number format (minimum 6 characters)
    if (trackingRequest.tracking_number.length < 6) {
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

    // Parse origin and destination (assuming format "City, Country")
    const parseLocation = (location: string) => {
      const parts = location.split(',').map(s => s.trim());
      return {
        city: parts[0] || location,
        country: parts[1] || '',
      };
    };

    // SECURITY: Return LIMITED data for public tracking
    // DO NOT expose: sender name, recipient name, phone, email, package value
    const publicData = {
      tracking_number: shipment.tracking_number,
      status: shipment.current_status,
      origin: parseLocation(shipment.origin_port),
      destination: parseLocation(shipment.destination_port),
      estimated_delivery_date: shipment.estimated_arrival,
      events: timeline?.map(event => ({
        date: event.timestamp,
        location: event.location,
        description: event.status,
        // Only include public-safe notes
        notes: event.notes?.includes('public:') ? event.notes.replace('public:', '').trim() : null,
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
    
    // SECURITY: Never expose stack trace or technical details
    return new Response(
      JSON.stringify({ error: 'Service indisponible.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
