
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface StripeContextType {
  publishableKey: string | null;
  isReady: boolean;
}

const StripeContext = createContext<StripeContextType>({
  publishableKey: null,
  isReady: false,
});

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get Stripe publishable key from environment variables
    const key = Constants.expoConfig?.extra?.stripePublishableKey || 
                process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (key) {
      console.log('Stripe publishable key loaded');
      setPublishableKey(key);
      setIsReady(true);
    } else {
      console.warn('Stripe publishable key not found in environment variables');
      setIsReady(true); // Still set ready to avoid blocking the app
    }
  }, []);

  const value: StripeContextType = {
    publishableKey,
    isReady,
  };

  // On web, we don't use the native Stripe provider
  // Instead, we'll use Stripe.js in components that need it
  if (Platform.OS === 'web') {
    return (
      <StripeContext.Provider value={value}>
        {children}
      </StripeContext.Provider>
    );
  }

  // For native platforms, dynamically import the Stripe provider
  // This prevents the web build from trying to import native modules
  const StripeProviderNative = require('@stripe/stripe-react-native').StripeProvider;

  // If no publishable key, render children without Stripe provider
  if (!publishableKey) {
    return (
      <StripeContext.Provider value={value}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <StripeContext.Provider value={value}>
      <StripeProviderNative
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.universalshipping.3sglobal"
      >
        {children}
      </StripeProviderNative>
    </StripeContext.Provider>
  );
};
