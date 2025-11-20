
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string | null;
  client: string;
  plan_code: string | null;
  plan_type: string;
  stripe_subscription_id: string | null;
  status: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch active subscription for the current user
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not an error in this case
        throw fetchError;
      }

      setSubscription(data || null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = (): boolean => {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
    
    return subscription.is_active && 
           subscription.status === 'active' &&
           (!endDate || endDate > now);
  };

  const createSubscription = async (
    clientId: string,
    planCode: string,
    stripeSubscriptionId?: string
  ): Promise<Subscription | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          client: clientId,
          plan_code: planCode,
          stripe_subscription_id: stripeSubscriptionId || null,
          status: 'pending',
          is_active: false,
          start_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSubscription(data);
      return data;
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      return null;
    }
  };

  const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (updateError) {
        throw updateError;
      }

      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Error updating subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      return false;
    }
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription: hasActiveSubscription(),
    refetch: fetchSubscription,
    createSubscription,
    updateSubscriptionStatus,
  };
};
