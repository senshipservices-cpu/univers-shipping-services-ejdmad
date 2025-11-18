
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '@/app/integrations/supabase/types';
import { logLogin, logLogout } from '@/utils/eventLogger';
import { useLanguage } from '@/contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Client = Tables<'clients'>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  client: Client | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { companyName?: string; contactName?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useLanguage();

  // Fetch client record for the current user
  const fetchClient = async (userId: string) => {
    try {
      console.log('Fetching client record for user:', userId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        setClient(null);
        return;
      }

      console.log('Client record fetched:', data);
      setClient(data);
      
      // Load user's preferred language if available
      if (data.preferred_language) {
        console.log('Loading user preferred language:', data.preferred_language);
        await setLanguage(data.preferred_language as 'fr' | 'en');
        await AsyncStorage.setItem('lang', data.preferred_language);
      }
    } catch (error) {
      console.error('Exception fetching client:', error);
      setClient(null);
    }
  };

  const refreshClient = async () => {
    if (user?.id) {
      await fetchClient(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        fetchClient(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        fetchClient(session.user.id);
      } else {
        setClient(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data);
      
      // Fetch client record after successful sign in
      if (data.user?.id) {
        await fetchClient(data.user.id);
        
        // Log login event
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
        
        await logLogin(data.user.id, clientData?.id || null);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { companyName?: string; contactName?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            company_name: metadata?.companyName || 'À renseigner',
            contact_name: metadata?.contactName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      console.log('Sign up successful:', data);
      
      // Note: The client record will be created automatically by the database trigger
      // We'll fetch it after the user confirms their email and signs in
      
      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Log logout event before signing out
      if (user?.id) {
        await logLogout(user.id, client?.id || null);
      }
      
      await supabase.auth.signOut();
      setClient(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    client,
    loading,
    signIn,
    signUp,
    signOut,
    refreshClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
