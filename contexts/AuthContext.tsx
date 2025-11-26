
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '@/app/integrations/supabase/types';
import { logLogin, logLogout } from '@/utils/eventLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import appConfig from '@/config/appConfig';

type Client = Tables<'clients'>;

interface SignUpMetadata {
  full_name?: string;
  company?: string;
  phone?: string;
  preferred_language?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  client: Client | null;
  loading: boolean;
  currentUserIsAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshClient: () => Promise<void>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  // Prevent multiple Google Sign-In configurations
  const hasConfiguredGoogle = useRef(false);
  
  // Configure Google Sign-In (only once)
  useEffect(() => {
    if (hasConfiguredGoogle.current) {
      return;
    }
    
    hasConfiguredGoogle.current = true;
    
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
      console.log('[AUTH] Google Sign-In configured');
    } catch (error) {
      console.error('[AUTH] Error configuring Google Sign-In:', error);
    }
  }, []);
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Prevent multiple simultaneous client fetches
  const isFetchingClient = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);

  // Compute admin status based on user email
  const currentUserIsAdmin = appConfig.isAdmin(user?.email);

  // Fetch client record for the current user
  const fetchClient = useCallback(async (userId: string) => {
    // Guard: Prevent multiple simultaneous fetches for the same user
    if (isFetchingClient.current || lastFetchedUserId.current === userId) {
      console.log('[AUTH] Skipping duplicate client fetch for user:', userId);
      return;
    }

    try {
      isFetchingClient.current = true;
      lastFetchedUserId.current = userId;
      
      console.log('[AUTH] Fetching client record for user:', userId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[AUTH] Error fetching client:', error);
        setClient(null);
        return;
      }

      console.log('[AUTH] Client record fetched:', data);
      setClient(data);
      
      // Load user's preferred language if available, default to 'en' if not specified
      const userLanguage = data.preferred_language || 'en';
      console.log('[AUTH] Loading user preferred language:', userLanguage);
      
      // Save language preference to AsyncStorage
      try {
        await AsyncStorage.setItem('@3s_global_language', userLanguage);
        await AsyncStorage.setItem('lang', userLanguage);
      } catch (storageError) {
        console.error('[AUTH] Error saving language preference:', storageError);
      }
    } catch (error) {
      console.error('[AUTH] Exception fetching client:', error);
      setClient(null);
    } finally {
      isFetchingClient.current = false;
    }
  }, []);

  const refreshClient = useCallback(async () => {
    if (user?.id) {
      // Reset the last fetched user ID to allow refresh
      lastFetchedUserId.current = null;
      await fetchClient(user.id);
    }
  }, [user?.id, fetchClient]);

  const isEmailVerified = useCallback(() => {
    // Check if user exists and has email_confirmed_at field
    if (!user) {
      console.log('[AUTH] isEmailVerified: No user');
      return false;
    }

    // If email_confirmed_at exists and is not null, email is verified
    const isVerified = !!user.email_confirmed_at;
    console.log('[AUTH] isEmailVerified check:', {
      userId: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      isVerified
    });

    return isVerified;
  }, [user]);

  // Prevent multiple session initializations
  const hasInitializedSession = useRef(false);

  useEffect(() => {
    // Guard: Only initialize session once
    if (hasInitializedSession.current) {
      return;
    }
    
    hasInitializedSession.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session:', session ? 'Found' : 'Not found');
      if (session) {
        console.log('[AUTH] Session user email_confirmed_at:', session.user.email_confirmed_at);
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        fetchClient(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AUTH] Auth state changed:', _event);
      if (session) {
        console.log('[AUTH] New session user email_confirmed_at:', session.user.email_confirmed_at);
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        // Reset last fetched user ID on auth state change
        lastFetchedUserId.current = null;
        fetchClient(session.user.id);
      } else {
        setClient(null);
        lastFetchedUserId.current = null;
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchClient]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AUTH] Sign in error:', error);
        return { error };
      }
      
      console.log('[AUTH] Sign in successful');
      console.log('[AUTH] User email_confirmed_at:', data.user?.email_confirmed_at);
      
      // Fetch client record after successful sign in
      if (data.user?.id) {
        // Reset last fetched user ID
        lastFetchedUserId.current = null;
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
      console.error('[AUTH] Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: SignUpMetadata
  ) => {
    try {
      // Default to 'en' (English) if no language is specified
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            full_name: metadata?.full_name || '',
            company: metadata?.company || 'To be specified',
            phone: metadata?.phone || '',
            preferred_language: metadata?.preferred_language || 'en',
          },
        },
      });
      
      if (error) {
        console.error('[AUTH] Sign up error:', error);
        return { error };
      }
      
      console.log('[AUTH] Sign up successful:', data);
      
      // Note: The client record will be created automatically by the database trigger
      // after the user confirms their email
      
      return { error: null };
    } catch (error) {
      console.error('[AUTH] Sign up exception:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[AUTH] Starting Google Sign-In...');
      
      // Get the current app language for new users
      const currentLanguage = await AsyncStorage.getItem('lang') || 'en';
      
      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('[AUTH] Google Sign-In successful:', userInfo);

      // Check if we have an ID token
      if (!userInfo.data?.idToken) {
        console.error('[AUTH] No ID token received from Google');
        return { error: { message: 'Aucun jeton d\'identification reçu de Google' } };
      }

      // Sign in to Supabase with the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
        options: {
          data: {
            full_name: userInfo.data.user?.name || '',
            preferred_language: currentLanguage,
          },
        },
      });

      if (error) {
        console.error('[AUTH] Supabase sign-in error:', error);
        return { error };
      }

      console.log('[AUTH] Supabase sign-in successful:', data);

      // Fetch or create client record
      if (data.user?.id) {
        // Reset last fetched user ID
        lastFetchedUserId.current = null;
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
    } catch (error: any) {
      console.error('[AUTH] Google sign-in exception:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { error: { message: 'Connexion annulée par l\'utilisateur' } };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { error: { message: 'Une connexion est déjà en cours' } };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { error: { message: 'Google Play Services n\'est pas disponible ou est obsolète' } };
      }
      
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
      lastFetchedUserId.current = null;
      console.log('[AUTH] Sign out successful');
    } catch (error) {
      console.error('[AUTH] Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    client,
    loading,
    currentUserIsAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshClient,
    isEmailVerified,
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
