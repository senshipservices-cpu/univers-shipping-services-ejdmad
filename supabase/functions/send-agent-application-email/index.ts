
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@universal-shippingservices.com';

interface AgentApplicationPayload {
  applicationId: string;
  companyName: string;
  email: string;
  portName: string;
  portCity: string;
  portCountry: string;
  activities: string[];
  yearsExperience?: number;
  whatsapp?: string;
  website?: string;
  certifications?: string;
}

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
    const payload: AgentApplicationPayload = await req.json();

    console.log('Processing agent application email:', payload);

    // Prepare email content for admin
    const adminEmailSubject = `Nouvelle candidature agent - ${payload.companyName}`;
    const adminEmailBody = `
Nouvelle candidature d'agent reçue sur Universal Shipping Services

Entreprise: ${payload.companyName}
Email: ${payload.email}
Port: ${payload.portName}, ${payload.portCity}, ${payload.portCountry}
Activités: ${payload.activities.join(', ')}
${payload.yearsExperience ? `Années d'expérience: ${payload.yearsExperience}` : ''}
${payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : ''}
${payload.website ? `Site web: ${payload.website}` : ''}
${payload.certifications ? `Certifications: ${payload.certifications}` : ''}

ID de candidature: ${payload.applicationId}

Connectez-vous à l'espace admin pour examiner cette candidature:
${SUPABASE_URL.replace('.supabase.co', '')}/admin-agents-ports

---
Universal Shipping Services - 3S Global
    `.trim();

    // Prepare email content for applicant
    const applicantEmailSubject = 'Candidature reçue - Universal Shipping Services';
    const applicantEmailBody = `
Bonjour,

Nous avons bien reçu votre candidature pour devenir agent partenaire de Universal Shipping Services.

Détails de votre candidature:
- Entreprise: ${payload.companyName}
- Port: ${payload.portName}, ${payload.portCity}, ${payload.portCountry}
- Activités: ${payload.activities.join(', ')}

Notre équipe va examiner votre candidature et vous contactera sous 48 à 72 heures ouvrables.

Merci de votre intérêt pour notre réseau d'agents.

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
        email_type: 'agent_application_admin',
        subject: adminEmailSubject,
        body: adminEmailBody,
        metadata: {
          application_id: payload.applicationId,
          company_name: payload.companyName,
          applicant_email: payload.email,
        },
        status: 'pending',
      },
      {
        recipient_email: payload.email,
        email_type: 'agent_application_confirmation',
        subject: applicantEmailSubject,
        body: applicantEmailBody,
        metadata: {
          application_id: payload.applicationId,
          company_name: payload.companyName,
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
        message: 'Agent application emails queued successfully',
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
    console.error('Error in send-agent-application-email:', error);
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
