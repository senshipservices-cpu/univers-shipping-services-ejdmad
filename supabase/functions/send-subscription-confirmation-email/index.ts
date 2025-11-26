
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@universal-shippingservices.com';

interface SubscriptionPayload {
  subscriptionId: string;
  clientName: string;
  clientEmail: string;
  planType: string;
  planName: string;
  startDate: string;
  endDate?: string;
  status: string;
}

const getPlanDescription = (planType: string): string => {
  const descriptions: Record<string, string> = {
    basic: 'Accès aux services de base, suivi des devis et demandes',
    premium_tracking: 'Suivi avancé des expéditions en temps réel + Portail Digital Maritime',
    enterprise_logistics: 'Solution complète pour entreprises + Portail Digital Maritime',
    digital_portal: 'Accès au Portail Digital Maritime',
    agent_listing: 'Inscription dans l\'annuaire des agents',
  };
  return descriptions[planType] || 'Abonnement personnalisé';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: SubscriptionPayload = await req.json();

    console.log('Processing subscription confirmation email:', payload);

    // Prepare email content for admin
    const adminEmailSubject = `Nouvel abonnement - ${payload.planName}`;
    const adminEmailBody = `
Nouvel abonnement créé sur Universal Shipping Services

Client: ${payload.clientName}
Email: ${payload.clientEmail}
Plan: ${payload.planName} (${payload.planType})
Statut: ${payload.status}
Date de début: ${payload.startDate}
${payload.endDate ? `Date de fin: ${payload.endDate}` : 'Durée: Indéterminée'}

ID d'abonnement: ${payload.subscriptionId}

Connectez-vous à l'espace admin pour gérer cet abonnement:
${SUPABASE_URL.replace('.supabase.co', '')}/admin-subscriptions

---
Universal Shipping Services - 3S Global
    `.trim();

    // Prepare email content for client
    const clientEmailSubject = `Confirmation d'abonnement - ${payload.planName}`;
    const clientEmailBody = `
Bonjour ${payload.clientName},

Votre abonnement à Universal Shipping Services a été activé avec succès !

Détails de votre abonnement:
- Plan: ${payload.planName}
- Type: ${payload.planType}
- Description: ${getPlanDescription(payload.planType)}
- Date d'activation: ${payload.startDate}
${payload.endDate ? `- Date d'expiration: ${payload.endDate}` : ''}
- Statut: ${payload.status === 'active' ? 'Actif' : 'En attente'}

${payload.status === 'active' ? `
Vous pouvez maintenant accéder à tous les services inclus dans votre plan.
Connectez-vous à votre espace client pour commencer:
${SUPABASE_URL.replace('.supabase.co', '')}/client-dashboard
` : `
Votre abonnement est en cours d'activation. Vous recevrez un email de confirmation dès qu'il sera actif.
`}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Universal Shipping Services - 3S Global

---
Universal Shipping Services
Email: ${ADMIN_EMAIL}
    `.trim();

    // Insert email notifications into the queue
    const emailsToSend = [
      {
        recipient_email: ADMIN_EMAIL,
        email_type: 'subscription_admin',
        subject: adminEmailSubject,
        body: adminEmailBody,
        metadata: {
          subscription_id: payload.subscriptionId,
          client_name: payload.clientName,
          client_email: payload.clientEmail,
          plan_type: payload.planType,
        },
        status: 'pending',
      },
      {
        recipient_email: payload.clientEmail,
        email_type: 'subscription_confirmation',
        subject: clientEmailSubject,
        body: clientEmailBody,
        metadata: {
          subscription_id: payload.subscriptionId,
          plan_type: payload.planType,
        },
        status: 'pending',
      },
    ];

    const { data, error } = await supabase
      .from('email_notifications')
      .insert(emailsToSend)
      .select();

    if (error) {
      console.error('Error inserting email notifications:', error);
      throw error;
    }

    console.log('Email notifications queued successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription confirmation emails queued successfully',
        emails_queued: data.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-subscription-confirmation-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
