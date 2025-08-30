// Environment configuration for client-side
export const config = {
  // Google Maps API Keys
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDVU-SnbOjH1HyVPrdZ-AjJjPV5VDnhXh8',
  googlePlacesApiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyDVU-SnbOjH1HyVPrdZ-AjJjPV5VDnhXh8',
  
  // Stripe keys
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  stripeWandererMonthlyPriceId: import.meta.env.VITE_STRIPE_WANDERER_MONTHLY_PRICE_ID,
  stripeWandererYearlyPriceId: import.meta.env.VITE_STRIPE_WANDERER_YEARLY_PRICE_ID,
  stripeExplorerMonthlyPriceId: import.meta.env.VITE_STRIPE_EXPLORER_MONTHLY_PRICE_ID,
  stripeExplorerYearlyPriceId: import.meta.env.VITE_STRIPE_EXPLORER_YEARLY_PRICE_ID,
  stripeArchitectMonthlyPriceId: import.meta.env.VITE_STRIPE_ARCHITECT_MONTHLY_PRICE_ID,
  stripeArchitectYearlyPriceId: import.meta.env.VITE_STRIPE_ARCHITECT_YEARLY_PRICE_ID,
};

// Debug logging
console.log('🔍 Environment config loaded:', {
  googleMapsApiKey: config.googleMapsApiKey ? '✅ Set' : '❌ Missing',
  googlePlacesApiKey: config.googlePlacesApiKey ? '✅ Set' : '❌ Missing',
  hasStripeKey: !!config.stripePublishableKey,
});
