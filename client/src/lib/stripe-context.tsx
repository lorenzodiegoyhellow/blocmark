import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

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
      
      // Force use of correct key
      const CORRECT_STRIPE_KEY = "pk_test_51RneKqRJ1MlOxo83nWbUi7KILvFj3QzETYOsI0BcycKNR8LetsaSIk178KFR5rhxm85murW9beNNUp5J87G0mg94001ZaPCFoB";
      const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      
      console.log('Environment key:', envKey ? envKey.substring(0, 20) + '...' : 'Missing');
      console.log('Using correct key:', CORRECT_STRIPE_KEY.substring(0, 20) + '...');
      
      const stripePromise = await loadStripe(CORRECT_STRIPE_KEY);
      
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