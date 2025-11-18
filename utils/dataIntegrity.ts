
/**
 * Data Integrity Utilities
 * Functions to ensure data consistency and integrity
 */

import { supabase } from '@/app/integrations/supabase/client';

/**
 * Check if a client exists
 */
export async function clientExists(clientId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking client existence:', error);
    return false;
  }
}

/**
 * Check if a port exists
 */
export async function portExists(portId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ports')
      .select('id')
      .eq('id', portId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking port existence:', error);
    return false;
  }
}

/**
 * Check if a shipment exists
 */
export async function shipmentExists(shipmentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('id')
      .eq('id', shipmentId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking shipment existence:', error);
    return false;
  }
}

/**
 * Check if a tracking number is unique
 */
export async function isTrackingNumberUnique(trackingNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('id')
      .eq('tracking_number', trackingNumber)
      .single();

    // If error code is PGRST116, it means no rows found, so it's unique
    if (error && error.code === 'PGRST116') {
      return true;
    }

    return !data;
  } catch (error) {
    console.error('Error checking tracking number uniqueness:', error);
    return false;
  }
}

/**
 * Verify shipment ownership
 */
export async function verifyShipmentOwnership(shipmentId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('client:clients!inner(user_id)')
      .eq('id', shipmentId)
      .single();

    if (error || !data) {
      return false;
    }

    return (data.client as any)?.user_id === userId;
  } catch (error) {
    console.error('Error verifying shipment ownership:', error);
    return false;
  }
}

/**
 * Verify subscription ownership
 */
export async function verifySubscriptionOwnership(subscriptionId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('client:clients!inner(user_id)')
      .eq('id', subscriptionId)
      .single();

    if (error || !data) {
      return false;
    }

    return (data.client as any)?.user_id === userId;
  } catch (error) {
    console.error('Error verifying subscription ownership:', error);
    return false;
  }
}

/**
 * Check for orphaned records (records with missing foreign key references)
 */
export async function checkOrphanedShipments(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('id, client')
      .is('client', null);

    if (error) {
      console.error('Error checking orphaned shipments:', error);
      return [];
    }

    return data?.map(s => s.id) || [];
  } catch (error) {
    console.error('Error checking orphaned shipments:', error);
    return [];
  }
}

/**
 * Validate foreign key relationships before insert
 */
export async function validateShipmentReferences(
  clientId: string,
  originPortId: string,
  destinationPortId: string
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  const [clientValid, originValid, destinationValid] = await Promise.all([
    clientExists(clientId),
    portExists(originPortId),
    portExists(destinationPortId),
  ]);

  if (!clientValid) {
    errors.push('Invalid client reference');
  }
  if (!originValid) {
    errors.push('Invalid origin port reference');
  }
  if (!destinationValid) {
    errors.push('Invalid destination port reference');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check data consistency for a client
 */
export async function checkClientDataConsistency(clientId: string): Promise<{
  isConsistent: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    // Check if client has valid user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      issues.push('Client not found');
      return { isConsistent: false, issues };
    }

    // Check if user exists in auth.users
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(client.user_id);

    if (userError || !user) {
      issues.push('Associated user account not found');
    }

    // Check for duplicate subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, plan_type, is_active')
      .eq('client', clientId)
      .eq('is_active', true);

    if (!subsError && subscriptions && subscriptions.length > 1) {
      issues.push('Multiple active subscriptions found');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  } catch (error) {
    console.error('Error checking client data consistency:', error);
    return {
      isConsistent: false,
      issues: ['Error checking data consistency'],
    };
  }
}

/**
 * Generate unique tracking number
 */
export async function generateUniqueTrackingNumber(): Promise<string> {
  const prefix = 'USS'; // UNIVERSAL SHIPPING SERVICES
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const trackingNumber = `${prefix}${randomPart}`;

    const isUnique = await isTrackingNumberUnique(trackingNumber);
    if (isUnique) {
      return trackingNumber;
    }
  }

  // Fallback with timestamp
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}${timestamp}`;
}
