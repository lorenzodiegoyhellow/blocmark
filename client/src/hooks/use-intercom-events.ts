import { useEffect } from 'react';
import { useIntercom } from '../lib/intercom-provider';
import { useLocation } from 'wouter';

/**
 * Custom hook to track Intercom events throughout the application
 * This automatically tracks page views and can be extended for other events
 */
export const useIntercomEvents = () => {
  const intercom = useIntercom();
  const [location] = useLocation();

  // Track page views
  useEffect(() => {
    if (intercom && location) {
      intercom.update({
        current_page: location,
      });
    }
  }, [location, intercom]);

  // Helper functions for common events
  const trackBookingStarted = (locationId: number, locationName: string) => {
    intercom.trackEvent('booking_started', {
      location_id: locationId,
      location_name: locationName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackBookingCompleted = (bookingId: number, amount: number, locationName: string) => {
    intercom.trackEvent('booking_completed', {
      booking_id: bookingId,
      amount: amount,
      location_name: locationName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackListingCreated = (listingId: number, listingName: string) => {
    intercom.trackEvent('listing_created', {
      listing_id: listingId,
      listing_name: listingName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSupportRequest = (topic: string) => {
    intercom.trackEvent('support_request', {
      topic: topic,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSearchPerformed = (query: string, resultsCount: number) => {
    intercom.trackEvent('search_performed', {
      query: query,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackBookingStarted,
    trackBookingCompleted,
    trackListingCreated,
    trackSupportRequest,
    trackSearchPerformed,
    showMessenger: intercom.show,
    hideMessenger: intercom.hide,
    showNewMessage: intercom.showNewMessage,
  };
};