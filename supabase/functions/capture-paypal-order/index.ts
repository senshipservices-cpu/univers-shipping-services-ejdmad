
// @deno-types="npm:@supabase/supabase-js@2"
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get PayPal configuration based on PAYPAL_ENV
 */
function getPayPalConfig(): {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  environment: string;
} {
  const paypalEnv = Deno.env.get('PAYPAL_ENV') || 'sandbox';

  let clientId: string;
  let clientSecret: string;
  let apiUrl: string;

  if (paypalEnv === 'live') {
    clientId = Deno.env.get('PAYPAL_LIVE_CLIENT_ID') || '';
    clientSecret = Deno.env.get('PAYPAL_LIVE_SECRET') || '';
    apiUrl = 'https://api-m.paypal.com';
  } else {
    clientId = Deno.env.get('PAYPAL_SANDBOX_CLIENT_ID') || '';
    clientSecret = Deno.env.get('PAYPAL_SANDBOX_SECRET') || '';
    apiUrl = 'https://api-m.sandbox.paypal.com';
  }

  console.log(`Using PayPal ${paypalEnv} environment for capture`);

  if (!clientId || !clientSecret) {
    throw new Error(`PayPal ${paypalEnv} credentials not configured`);
  }

  return {
    clientId,
    clientSecret,
    apiUrl,
    environment: paypalEnv,
  };
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const config = getPayPalConfig();
  const auth = btoa(`${config.clientId}:${config.clientSecret}`);
  
  const response = await fetch(`${config.apiUrl}/v1/oauth2/token`, {
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
    throw new Error(`Failed to get PayPal access token (${config.environment} mode)`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Capture PayPal order
 */
async function capturePayPalOrder(accessToken: string, orderId: string): Promise<any> {
  const config = getPayPalConfig();
  
  const response = await fetch(`${config.apiUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal capture error:', error);
    throw new Error(`Failed to capture PayPal order (${config.environment} mode)`);
  }
  
  return await response.json();
}

/**
 * Send email notification using send-email Edge Function
 */
async function sendEmailNotification(
  supabaseClient: any,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully to:', to);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
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

    // Get the user from the request (optional for public success page)
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();
      if (!userError && authUser) {
        user = authUser;
      }
    }

    // Parse request body
    const body = await req.json();
    const { quote_id, order_id, token } = body;

    console.log('Capture PayPal order request:', { quote_id, order_id, token, hasUser: !!user });

    // Validate input
    if (!quote_id && !order_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing quote_id or order_id' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get quote details
    let quote;
    if (quote_id) {
      const { data: quoteData, error: quoteError } = await supabaseClient
        .from('freight_quotes')
        .select('*, origin_port:ports!freight_quotes_origin_port_fkey(name), destination_port:ports!freight_quotes_destination_port_fkey(name)')
        .eq('id', quote_id)
        .single();

      if (quoteError || !quoteData) {
        console.error('Quote not found:', quoteError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Quote not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      quote = quoteData;
    } else {
      // Find quote by PayPal order ID
      const { data: quoteData, error: quoteError } = await supabaseClient
        .from('freight_quotes')
        .select('*, origin_port:ports!freight_quotes_origin_port_fkey(name), destination_port:ports!freight_quotes_destination_port_fkey(name)')
        .eq('paypal_order_id', order_id)
        .single();

      if (quoteError || !quoteData) {
        console.error('Quote not found by order_id:', quoteError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Quote not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      quote = quoteData;
    }

    // Check if already paid
    if (quote.payment_status === 'paid') {
      console.log('Quote already paid:', quote.id);
      return new Response(
        JSON.stringify({ ok: true, new_status: 'paid', message: 'Quote already paid' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get PayPal order ID
    const paypalOrderId = quote.paypal_order_id || order_id;
    
    if (!paypalOrderId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No PayPal order ID found for this quote' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Capturing PayPal order:', paypalOrderId);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(accessToken, paypalOrderId);

    console.log('PayPal capture result:', JSON.stringify(captureResult, null, 2));

    // Check capture status
    const captureStatus = captureResult.status;
    
    if (captureStatus === 'COMPLETED') {
      // Update quote status to paid
      const { error: updateError } = await supabaseClient
        .from('freight_quotes')
        .update({
          payment_status: 'paid',
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', quote.id);

      if (updateError) {
        console.error('Error updating quote:', updateError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Failed to update quote status' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      console.log('Quote marked as paid:', quote.id);

      // Send email notifications
      const clientEmail = quote.client_email;
      const adminEmail = Deno.env.get('SMTP_FROM_EMAIL') || 'contact@universal-shippingservices.com';

      // Email to client
      if (clientEmail) {
        const clientEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">Paiement confirmé - Universal Shipping Services</h2>
            <p>Bonjour ${quote.client_name || 'Client'},</p>
            <p>Nous avons bien reçu votre paiement pour le devis <strong>#${quote.id.substring(0, 8).toUpperCase()}</strong>.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0066cc;">Détails du devis</h3>
              <p><strong>Origine :</strong> ${quote.origin_port?.name || 'N/A'}</p>
              <p><strong>Destination :</strong> ${quote.destination_port?.name || 'N/A'}</p>
              <p><strong>Type de cargo :</strong> ${quote.cargo_type || 'N/A'}</p>
              <p><strong>Montant payé :</strong> ${quote.quote_amount} ${quote.quote_currency || 'EUR'}</p>
            </div>

            <p>Votre demande est maintenant en cours de traitement par notre équipe. Nous vous contacterons prochainement pour les prochaines étapes.</p>
            
            <p>Merci de votre confiance,</p>
            <p><strong>L'équipe Universal Shipping Services</strong></p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement. Pour toute question, contactez-nous à ${adminEmail}
            </p>
          </div>
        `;

        await sendEmailNotification(
          supabaseClient,
          clientEmail,
          `Paiement confirmé - Devis #${quote.id.substring(0, 8).toUpperCase()}`,
          clientEmailHtml
        );
      }

      // Email to admin
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Nouveau paiement reçu - USS</h2>
          <p>Un paiement a été confirmé via PayPal.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #10b981;">Détails du paiement</h3>
            <p><strong>Devis ID :</strong> ${quote.id}</p>
            <p><strong>Client :</strong> ${quote.client_name || 'N/A'} (${clientEmail || 'N/A'})</p>
            <p><strong>Origine :</strong> ${quote.origin_port?.name || 'N/A'}</p>
            <p><strong>Destination :</strong> ${quote.destination_port?.name || 'N/A'}</p>
            <p><strong>Type de cargo :</strong> ${quote.cargo_type || 'N/A'}</p>
            <p><strong>Montant :</strong> ${quote.quote_amount} ${quote.quote_currency || 'EUR'}</p>
            <p><strong>PayPal Order ID :</strong> ${paypalOrderId}</p>
            <p><strong>Date de paiement :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <p><strong>Action requise :</strong> Traiter cette demande et contacter le client pour les prochaines étapes.</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Notification automatique du système USS
          </p>
        </div>
      `;

      await sendEmailNotification(
        supabaseClient,
        adminEmail,
        `Nouveau paiement PayPal - Devis #${quote.id.substring(0, 8).toUpperCase()}`,
        adminEmailHtml
      );

      return new Response(
        JSON.stringify({
          ok: true,
          new_status: 'paid',
          quote_id: quote.id,
          capture_id: captureResult.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Payment not completed
      console.error('PayPal capture not completed:', captureStatus);
      
      // Update quote status to failed
      await supabaseClient
        .from('freight_quotes')
        .update({
          payment_status: 'failed',
        })
        .eq('id', quote.id);

      return new Response(
        JSON.stringify({
          ok: false,
          error: `Payment capture failed with status: ${captureStatus}`,
          status: captureStatus,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
