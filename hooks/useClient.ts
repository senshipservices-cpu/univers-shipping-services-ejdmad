
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Client = Tables<'clients'>;

export function useClient() {
  const { user, client, refreshClient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update client profile
  const updateClient = async (updates: Partial<Client>) => {
    if (!user?.id || !client?.id) {
      setError('User not authenticated or client not found');
      return { error: 'User not authenticated or client not found' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating client:', updateError);
        setError(updateError.message);
        setLoading(false);
        return { error: updateError };
      }

      console.log('Client updated successfully:', data);
      
      // Refresh the client data in AuthContext
      await refreshClient();
      
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      console.error('Exception updating client:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  };

  return {
    client,
    loading,
    error,
    updateClient,
    refreshClient,
  };
}
