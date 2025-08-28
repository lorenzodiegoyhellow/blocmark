import React, { useEffect, createContext, useContext } from 'react';
import { useAuth } from '../hooks/use-auth';
import Intercom, { 
  update, 
  show, 
  hide, 
  shutdown, 
  showMessages, 
  showNewMessage, 
  trackEvent 
} from '@intercom/messenger-js-sdk';

interface IntercomConfig {
  app_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  created_at?: number;
  custom_attributes?: Record<string, any>;
}

interface IntercomContextType {
  boot: (config?: Partial<IntercomConfig>) => void;
  shutdown: () => void;
  update: (config: Partial<IntercomConfig>) => void;
  show: () => void;
  hide: () => void;
  showMessages: () => void;
  showNewMessage: (preMessage?: string) => void;
  trackEvent: (eventName: string, metadata?: Record<string, any>) => void;
}

// Declare Intercom as a global variable
declare global {
  interface Window {
    Intercom: any;
    intercomSettings: IntercomConfig;
  }
}

const IntercomContext = createContext<IntercomContextType | null>(null);

export const useIntercom = () => {
  const context = useContext(IntercomContext);
  if (!context) {
    throw new Error('useIntercom must be used within IntercomProvider');
  }
  return context;
};

interface IntercomProviderProps {
  appId: string;
  children: React.ReactNode;
  enabled?: boolean;
}

export const IntercomProvider: React.FC<IntercomProviderProps> = ({ 
  appId, 
  children,
  enabled = true 
}) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!enabled || !appId) {
      console.log('Intercom is disabled or no app ID provided');
      return;
    }

    const initializeIntercom = async () => {
      try {
        console.log('Initializing Intercom with App ID:', appId);
        
        // Boot Intercom with user data if authenticated
        const intercomConfig = {
          app_id: appId,
          ...(isAuthenticated && user ? {
            user_id: String(user.id),
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
            email: user.email,
            created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : undefined,
            custom_attributes: {
              user_type: user.role || 'guest',
              host_mode: user.isHost || false,
              listings_count: user.listingsCount || 0,
              bookings_count: user.bookingsCount || 0,
              verified: user.emailVerified || false,
              preferred_language: user.preferredLanguage || 'en',
            }
          } : {})
        };

        await Intercom(intercomConfig);
        console.log('Intercom initialized successfully');
        (window as any).intercomLoadFailed = false;
        
        // Store initialization state
        (window as any).intercomInitialized = true;
        
        // Ensure the launcher is visible
        await update({ hide_default_launcher: false });
        console.log('Intercom launcher should now be visible');
        
        // Check if the launcher is actually in the DOM after a short delay
        setTimeout(() => {
          const launcher = document.querySelector('#intercom-container, .intercom-launcher, iframe#intercom-frame');
          if (launcher) {
            console.log('✅ Intercom launcher found in DOM:', launcher);
          } else {
            console.log('⚠️ Intercom launcher not found in DOM - it may be hidden by settings or CSS');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Failed to initialize Intercom:', error);
        (window as any).intercomLoadFailed = true;
      }
    };

    initializeIntercom();

    // Cleanup function
    return () => {
      try {
        if ((window as any).intercomInitialized) {
          shutdown();
        }
      } catch (e) {
        console.error('Error shutting down Intercom:', e);
      }
    };
  }, [appId, enabled]);

  // Update Intercom when user data changes
  useEffect(() => {
    if (!enabled || !(window as any).intercomInitialized || (window as any).intercomLoadFailed) return;

    try {
      if (isAuthenticated && user) {
        console.log('Updating Intercom with user data');
        update({
          user_id: String(user.id),
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
          email: user.email,
          created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : undefined,
          custom_attributes: {
            user_type: user.role || 'guest',
            host_mode: user.isHost || false,
            listings_count: user.listingsCount || 0,
            bookings_count: user.bookingsCount || 0,
            verified: user.emailVerified || false,
            preferred_language: user.preferredLanguage || 'en',
          }
        });
      }
    } catch (error) {
      console.error('Error updating Intercom user data:', error);
    }
  }, [user, isAuthenticated, enabled]);

  const contextValue: IntercomContextType = {
    boot: (config = {}) => {
      try {
        if ((window as any).intercomInitialized) {
          // Re-initialize with new config
          Intercom({ app_id: appId, ...config });
        } else {
          console.log('Intercom not yet loaded, queuing boot command');
        }
      } catch (e) {
        console.error('Error booting Intercom:', e);
      }
    },
    shutdown: () => {
      try {
        if ((window as any).intercomInitialized) {
          shutdown();
        }
      } catch (e) {
        console.error('Error shutting down Intercom:', e);
      }
    },
    update: (config) => {
      try {
        if ((window as any).intercomInitialized) {
          update(config);
        }
      } catch (e) {
        console.error('Error updating Intercom:', e);
      }
    },
    show: () => {
      try {
        if ((window as any).intercomInitialized && !(window as any).intercomLoadFailed) {
          console.log('Showing Intercom messenger');
          show();
        } else {
          console.log('Intercom not available - showing fallback');
          // Fallback to email support
          window.location.href = 'mailto:support@blocmark.co?subject=Support Request';
        }
      } catch (e) {
        console.error('Error showing Intercom:', e);
        // Fallback to email support
        window.location.href = 'mailto:support@blocmark.co?subject=Support Request';
      }
    },
    hide: () => {
      try {
        if ((window as any).intercomInitialized) {
          hide();
        }
      } catch (e) {
        console.error('Error hiding Intercom:', e);
      }
    },
    showMessages: () => {
      try {
        if ((window as any).intercomInitialized) {
          showMessages();
        } else {
          console.log('Intercom not yet loaded');
        }
      } catch (e) {
        console.error('Error showing Intercom messages:', e);
      }
    },
    showNewMessage: (preMessage) => {
      try {
        if ((window as any).intercomInitialized) {
          showNewMessage(preMessage);
        } else {
          console.log('Intercom not yet loaded');
        }
      } catch (e) {
        console.error('Error showing new Intercom message:', e);
      }
    },
    trackEvent: (eventName, metadata) => {
      try {
        if ((window as any).intercomInitialized) {
          trackEvent(eventName, metadata);
        }
      } catch (e) {
        console.error('Error tracking Intercom event:', e);
      }
    },
  };

  return (
    <IntercomContext.Provider value={contextValue}>
      {children}
    </IntercomContext.Provider>
  );
};