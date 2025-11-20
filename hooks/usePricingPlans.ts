
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface PricingPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_eur: number;
  currency: string;
  billing_period: 'one_time' | 'monthly' | 'yearly';
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_eur', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanByCode = (code: string): PricingPlan | undefined => {
    return plans.find(plan => plan.code === code);
  };

  return {
    plans,
    loading,
    error,
    refetch: fetchPricingPlans,
    getPlanByCode,
  };
};
