
// @deno-types="npm:@supabase/supabase-js@2"
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo',
};

// PayPal API configuration
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || '';
const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID') || '';
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
    throw new Error('Failed to get PayPal access token');
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhookSignature(
  accessToken: string,
  webhookId: string,
  headers: Headers,
  body: string
): Promise<boolean> {
  const verificationData = {
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_time: headers.get('paypal-transmission-time'),
    cert_url: headers.get('paypal-cert-url'),
    auth_algo: headers.get('paypal-auth-algo'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  };

  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationData),
  });

  if (!response.ok) {
    console.error('Webhook verification failed:', await response.text());
    return false;
  }

  const result = await response.json();
  return result.verification_status === 'SUCCESS';
}

/**
 * Helper function to log webhook events
 */
async function logWebhookEvent(
  supabaseClient: any,
  type: string,
  payload: any,
  eventId: string,
  status: string = 'received',
  errorMessage?: string
) {
  try {
    await supabaseClient.from('payment_logs').insert({
      type,
      payload_raw: payload,
      stripe_event_id: eventId, // Reusing this field for PayPal event ID
      status,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

/**
 * Helper function to send email notification
 */
async function sendEmailNotification(
  supabaseClient: any,
  recipientEmail: string,
  emailType: string,
  subject: string,
  body: string,
  metadata: any
) {
  try {
    await supabaseClient.from('email_notifications').insert({
      recipient_email: recipientEmail,
      email_type: emailType,
      subject,
      body,
      metadata,
      status: 'pending',
    });
    console.log(`Email notification queued for ${recipientEmail}`);
  } catch (error) {
    console.error('Error queuing email notification:', error);
  }
}

/**
 * Helper function to calculate end date based on billing period
 */
function calculateEndDate(startDate: Date, billingPeriod: string): Date {
  const endDate = new Date(startDate);
  if (billingPeriod === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingPeriod === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    // For one_time, set end date to 1 year from now
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return endDate;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the raw body for signature verification
    const body = await req.text();
    const event = JSON.parse(body);

    console.log('PayPal webhook event received:', event.event_type, 'ID:', event.id);

    // Create Supabase admin client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature if webhook ID is configured
    if (PAYPAL_WEBHOOK_ID) {
      const accessToken = await getPayPalAccessToken();
      const isValid = await verifyWebhookSignature(
        accessToken,
        PAYPAL_WEBHOOK_ID,
        req.headers,
        body
      );

      if (!isValid) {
        console.error('Webhook signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('PAYPAL_WEBHOOK_ID not configured - skipping signature verification');
    }

    // Log the webhook event
    await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'processing');

    // Handle different event types
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        console.log('Processing payment completion:', event.id);

        const resource = event.resource;
        const customId = resource.purchase_units?.[0]?.custom_id;

        if (!customId) {
          console.error('No custom_id in webhook payload');
          await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', 'No custom_id in payload');
          break;
        }

        let metadata;
        try {
          metadata = JSON.parse(customId);
        } catch (e) {
          console.error('Failed to parse custom_id:', e);
          await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', 'Invalid custom_id format');
          break;
        }

        const context = metadata.context;

        if (context === 'freight_quote') {
          // Handle freight quote payment
          const quoteId = metadata.quote_id;
          if (!quoteId) {
            console.error('No quote_id in metadata');
            await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', 'No quote_id in metadata');
            break;
          }

          console.log('Processing freight quote payment for quote:', quoteId);

          // Fetch the quote
          const { data: quote, error: quoteError } = await supabaseClient
            .from('freight_quotes')
            .select('*, clients!freight_quotes_client_fkey(user_id, email, company_name)')
            .eq('id', quoteId)
            .single();

          if (quoteError || !quote) {
            console.error('Quote not found:', quoteError);
            await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', `Quote not found: ${quoteError?.message}`);
            break;
          }

          // Update quote payment status to paid
          const { error: updateError } = await supabaseClient
            .from('freight_quotes')
            .update({
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', quoteId);

          if (updateError) {
            console.error('Error updating quote:', updateError);
            await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', `Error updating quote: ${updateError.message}`);
            break;
          }

          console.log('Quote payment status updated to paid');

          // Create shipment from quote
          const { data: shipment, error: shipmentError } = await supabaseClient
            .from('shipments')
            .insert({
              client: quote.client,
              origin_port: quote.origin_port,
              destination_port: quote.destination_port,
              cargo_type: quote.cargo_type,
              incoterm: quote.incoterm,
              current_status: 'confirmed',
              eta: quote.desired_eta,
              tracking_number: `SHP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            })
            .select()
            .single();

          if (shipmentError) {
            console.error('Error creating shipment:', shipmentError);
          } else {
            console.log('Shipment created:', shipment.id);
            // Link shipment to quote
            await supabaseClient
              .from('freight_quotes')
              .update({ ordered_as_shipment: shipment.id })
              .eq('id', quoteId);
          }

          // Get client email
          const clientEmail = quote.client_email || quote.clients?.email;
          if (clientEmail) {
            // Send confirmation email
            const emailSubject = 'Votre paiement a été reçu – Universal Shipping Services';
            const emailBody = `
Bonjour,

Nous avons bien reçu votre paiement pour le devis #${quoteId.substring(0, 8)}.

Détails du devis:
- Origine: ${quote.origin_port || 'N/A'}
- Destination: ${quote.destination_port || 'N/A'}
- Type de cargo: ${quote.cargo_type || 'N/A'}
- Montant payé: ${quote.quote_amount} ${quote.quote_currency || 'EUR'}

${shipment ? `Un suivi d'expédition a été créé avec le numéro: ${shipment.tracking_number}` : ''}

Vous pouvez suivre votre expédition depuis votre tableau de bord client:
https://natively.dev/client-dashboard

Merci de votre confiance.

Cordialement,
L'équipe Universal Shipping Services
            `.trim();

            await sendEmailNotification(
              supabaseClient,
              clientEmail,
              'quote_payment_received',
              emailSubject,
              emailBody,
              {
                quote_id: quoteId,
                shipment_id: shipment?.id,
                amount: quote.quote_amount,
                currency: quote.quote_currency,
              }
            );
          }

          // Log event
          await supabaseClient.from('events_log').insert({
            event_type: 'quote_paid',
            user_id: quote.clients?.user_id,
            client_id: quote.client,
            quote_id: quoteId,
            shipment_id: shipment?.id,
            details: `Quote paid via PayPal. Amount: ${quote.quote_amount} ${quote.quote_currency}`,
          });

          await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'processed');
        } else if (context === 'pricing_plan') {
          // Handle pricing plan payment
          const userId = metadata.user_id;
          const planCode = metadata.plan_code;
          const subscriptionId = metadata.subscription_id;

          if (!userId || !planCode) {
            console.error('Missing user_id or plan_code in metadata');
            await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', 'Missing user_id or plan_code in metadata');
            break;
          }

          console.log('Processing pricing plan payment for user:', userId, 'plan:', planCode);

          // Fetch the pricing plan
          const { data: plan, error: planError } = await supabaseClient
            .from('pricing_plans')
            .select('*')
            .eq('code', planCode)
            .single();

          if (planError || !plan) {
            console.error('Plan not found:', planError);
            await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', `Plan not found: ${planError?.message}`);
            break;
          }

          // Calculate dates
          const startDate = new Date();
          const endDate = calculateEndDate(startDate, plan.billing_period);

          // Update subscription
          if (subscriptionId) {
            const { error: updateError } = await supabaseClient
              .from('subscriptions')
              .update({
                status: 'active',
                is_active: true,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                payment_provider: 'paypal',
                payment_reference: resource.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscriptionId);

            if (updateError) {
              console.error('Error updating subscription:', updateError);
              await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'error', `Error updating subscription: ${updateError.message}`);
              break;
            }

            console.log('Subscription updated:', subscriptionId);
          }

          // Get user email
          const { data: userData } = await supabaseClient.auth.admin.getUserById(userId);
          const userEmail = userData?.user?.email;

          if (userEmail) {
            // Send activation email
            const emailSubject = `Votre plan ${plan.name} est activé – Universal Shipping Services`;
            const emailBody = `
Bonjour,

Votre plan ${plan.name} a été activé avec succès.

Détails de votre abonnement:
- Plan: ${plan.name}
- Prix: ${plan.price_eur} ${plan.currency}
- Période: ${plan.billing_period === 'monthly' ? 'Mensuel' : plan.billing_period === 'yearly' ? 'Annuel' : 'Paiement unique'}
- Date de début: ${startDate.toLocaleDateString('fr-FR')}
- Date de fin: ${endDate.toLocaleDateString('fr-FR')}

Vous pouvez maintenant profiter de tous les avantages de votre plan depuis votre espace client:
https://natively.dev/client-dashboard

Merci de votre confiance.

Cordialement,
L'équipe Universal Shipping Services
            `.trim();

            await sendEmailNotification(
              supabaseClient,
              userEmail,
              'subscription_activated',
              emailSubject,
              emailBody,
              {
                plan_code: planCode,
                plan_name: plan.name,
                amount: plan.price_eur,
                currency: plan.currency,
                billing_period: plan.billing_period,
              }
            );
          }

          // Log event
          await supabaseClient.from('events_log').insert({
            event_type: 'subscription_activated',
            user_id: userId,
            details: `Subscription activated for plan ${plan.name} via PayPal. Amount: ${plan.price_eur} ${plan.currency}`,
          });

          await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'processed');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        console.log('Processing payment failure:', event.event_type);

        const resource = event.resource;
        const customId = resource.purchase_units?.[0]?.custom_id;

        if (customId) {
          try {
            const metadata = JSON.parse(customId);

            if (metadata.quote_id) {
              // Handle failed quote payment
              await supabaseClient
                .from('freight_quotes')
                .update({
                  payment_status: 'failed',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', metadata.quote_id);
              console.log('Quote payment status updated to failed');
            } else if (metadata.subscription_id) {
              // Handle failed subscription payment
              await supabaseClient
                .from('subscriptions')
                .update({
                  status: 'cancelled',
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', metadata.subscription_id);
              console.log('Subscription status updated to cancelled');
            }
          } catch (e) {
            console.error('Failed to parse custom_id:', e);
          }
        }

        await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'processed');
        break;
      }

      default:
        console.log('Unhandled event type:', event.event_type);
        await logWebhookEvent(supabaseClient, event.event_type, event.resource, event.id, 'unhandled');
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
