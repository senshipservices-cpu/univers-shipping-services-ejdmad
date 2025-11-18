
import { supabase } from '@/app/integrations/supabase/client';

export type EventType =
  | 'service_view'
  | 'service_quote_click'
  | 'quote_created'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'quote_paid'
  | 'shipment_created'
  | 'shipment_status_changed'
  | 'portal_access'
  | 'portal_denied'
  | 'agent_application_submitted'
  | 'agent_validated'
  | 'subscription_created'
  | 'subscription_activated'
  | 'subscription_expired'
  | 'login'
  | 'logout'
  | 'contact_sent';

interface LogEventParams {
  eventType: EventType;
  userId?: string | null;
  clientId?: string | null;
  serviceId?: string | null;
  quoteId?: string | null;
  shipmentId?: string | null;
  portId?: string | null;
  details?: string | null;
}

/**
 * Log an event to the events_log table for analytics
 */
export async function logEvent(params: LogEventParams): Promise<void> {
  try {
    const { error } = await supabase.from('events_log').insert({
      event_type: params.eventType,
      user_id: params.userId || null,
      client_id: params.clientId || null,
      service_id: params.serviceId || null,
      quote_id: params.quoteId || null,
      shipment_id: params.shipmentId || null,
      port_id: params.portId || null,
      details: params.details || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging event:', error);
    } else {
      console.log(`Event logged: ${params.eventType}`);
    }
  } catch (error) {
    console.error('Exception logging event:', error);
  }
}

/**
 * Log service view event
 */
export async function logServiceView(
  serviceId: string,
  userId?: string | null,
  clientId?: string | null
): Promise<void> {
  await logEvent({
    eventType: 'service_view',
    serviceId,
    userId,
    clientId,
  });
}

/**
 * Log service quote click event (when user clicks "Demander un devis")
 */
export async function logServiceQuoteClick(
  serviceId: string | null,
  userId?: string | null,
  clientId?: string | null,
  details?: string | null
): Promise<void> {
  await logEvent({
    eventType: 'service_quote_click',
    serviceId,
    userId,
    clientId,
    details,
  });
}

/**
 * Log quote creation event
 */
export async function logQuoteCreated(
  quoteId: string,
  userId?: string | null,
  clientId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'quote_created',
    quoteId,
    userId,
    clientId,
    details,
  });
}

/**
 * Log shipment creation event
 */
export async function logShipmentCreated(
  shipmentId: string,
  clientId?: string | null,
  userId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'shipment_created',
    shipmentId,
    clientId,
    userId,
    details,
  });
}

/**
 * Log shipment status change event
 */
export async function logShipmentStatusChanged(
  shipmentId: string,
  clientId?: string | null,
  userId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'shipment_status_changed',
    shipmentId,
    clientId,
    userId,
    details,
  });
}

/**
 * Log portal access event
 */
export async function logPortalAccess(
  userId: string,
  clientId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'portal_access',
    userId,
    clientId,
    details,
  });
}

/**
 * Log portal denied event
 */
export async function logPortalDenied(
  userId: string,
  clientId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'portal_denied',
    userId,
    clientId,
    details,
  });
}

/**
 * Log agent application submission
 */
export async function logAgentApplicationSubmitted(
  userId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'agent_application_submitted',
    userId,
    details,
  });
}

/**
 * Log subscription creation
 */
export async function logSubscriptionCreated(
  clientId: string,
  userId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'subscription_created',
    clientId,
    userId,
    details,
  });
}

/**
 * Log login event
 */
export async function logLogin(
  userId: string,
  clientId?: string | null
): Promise<void> {
  await logEvent({
    eventType: 'login',
    userId,
    clientId,
  });
}

/**
 * Log logout event
 */
export async function logLogout(
  userId: string,
  clientId?: string | null
): Promise<void> {
  await logEvent({
    eventType: 'logout',
    userId,
    clientId,
  });
}

/**
 * Log contact form submission
 */
export async function logContactSent(
  userId?: string | null,
  clientId?: string | null,
  details?: string
): Promise<void> {
  await logEvent({
    eventType: 'contact_sent',
    userId,
    clientId,
    details,
  });
}
