
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

interface Subscription {
  id: string;
  plan_type: string;
  is_active: boolean;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface SubscriptionAccess {
  hasActiveSubscription: boolean;
  hasPremiumTracking: boolean;
  hasEnterpriseLogistics: boolean;
  hasAgentListing: boolean;
  hasDigitalPortalAccess: boolean;
  hasFullTrackingAccess: boolean;
  subscription: Subscription | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSubscriptionAccess(): SubscriptionAccess {
  const { user, client } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    if (!client?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get active subscription for this client
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client', client.id)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          console.log('No active subscription found');
          setSubscription(null);
        } else {
          console.error('Error loading subscription:', error);
        }
      } else {
        console.log('Active subscription found:', data);
        setSubscription(data);
      }
    } catch (error) {
      console.error('Exception loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [client?.id]);

  const refresh = async () => {
    await loadSubscription();
  };

  // Calculate access levels
  const hasActiveSubscription = !!subscription && subscription.is_active && subscription.status === 'active';
  const hasPremiumTracking = hasActiveSubscription && subscription.plan_type === 'premium_tracking';
  const hasEnterpriseLogistics = hasActiveSubscription && subscription.plan_type === 'enterprise_logistics';
  const hasAgentListing = hasActiveSubscription && subscription.plan_type === 'agent_listing';
  
  // Digital portal access: premium_tracking OR enterprise_logistics
  const hasDigitalPortalAccess = hasPremiumTracking || hasEnterpriseLogistics;
  
  // Full tracking access: premium_tracking OR enterprise_logistics
  const hasFullTrackingAccess = hasPremiumTracking || hasEnterpriseLogistics;

  return {
    hasActiveSubscription,
    hasPremiumTracking,
    hasEnterpriseLogistics,
    hasAgentListing,
    hasDigitalPortalAccess,
    hasFullTrackingAccess,
    subscription,
    loading,
    refresh,
  };
}
