import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { config } from '../config/env';

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
  error: Error | null;
}

const defaultContext: StripeContextType = {
  stripe: null,
  isLoading: false,
  error: null
};

const StripeContext = createContext<StripeContextType>(defaultContext);

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Determine if we need Stripe on the current page
  const isStripeNeededPath = () => {
    const path = window.location.pathname;
    return path.includes('booking-summary') || 
           path.includes('booking-success') ||
           path.includes('locations') && path.includes('booking');
  };

  // When the path changes, check if we need to initialize Stripe
  useEffect(() => {
    const handleRouteChange = () => {
      if (isStripeNeededPath() && !initialized && !isLoading && !stripe) {
        loadStripeInstance();
      }
    };

    // Listen to path changes
    window.addEventListener('popstate', handleRouteChange);

    // Check on initial load
    if (isStripeNeededPath() && !initialized && !isLoading && !stripe) {
      loadStripeInstance();
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [initialized, isLoading, stripe]);

  async function loadStripeInstance() {
    if (initialized || isLoading) return;
    
    setIsLoading(true);
    setInitialized(true);
    
    try {
      console.log('Initializing Stripe...');
      
      // Use the config file which has fallback values
      const stripeKey = config.stripePublishableKey;
      
      if (!stripeKey) {
        console.warn('No Stripe key available, skipping Stripe initialization');
        setError(null);
        return;
      }
      
      console.log('Using Stripe key:', stripeKey.substring(0, 20) + '...');
      
      const stripePromise = await loadStripe(stripeKey);
      
      if (!stripePromise) {
        console.warn('Failed to load Stripe');
        throw new Error('Failed to initialize Stripe');
      }
      
      console.log('Stripe loaded successfully');
      setStripe(stripePromise);
      setError(null);
    } catch (err) {
      console.error('Stripe initialization error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading Stripe'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <StripeContext.Provider value={{ stripe, isLoading, error }}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  
  return context;
}