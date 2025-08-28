import React from 'react';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface IntercomFallbackButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  text?: string;
}

export const IntercomFallbackButton: React.FC<IntercomFallbackButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className,
  text = 'Chat with us',
}) => {
  const handleClick = () => {
    console.log('Chat button clicked, checking Intercom availability...');
    console.log('Environment App ID:', import.meta.env.VITE_INTERCOM_APP_ID);
    console.log('Intercom load failed flag:', (window as any).intercomLoadFailed);
    
    // Check if Intercom is loaded
    if (typeof window !== 'undefined' && (window as any).intercomInitialized && !(window as any).intercomLoadFailed) {
      console.log('Intercom found, attempting to show...');
      try {
        // Import and use the show function from the SDK
        import('@intercom/messenger-js-sdk').then(({ show }) => {
          show();
          console.log('Intercom show command sent');
        });
      } catch (e) {
        console.error('Error showing Intercom:', e);
        // Fallback to email support
        console.log('Falling back to email support');
        window.location.href = 'mailto:support@blocmark.co?subject=Support Request';
      }
    } else {
      console.log('Intercom not available, reason:', 
        !(window as any).intercomInitialized ? 'Not initialized' : 
        (window as any).intercomLoadFailed ? 'Script failed to load' : 'Unknown');
      // Open email client as fallback  
      window.location.href = 'mailto:support@blocmark.co?subject=Support Request';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      <MessageCircle className="h-4 w-4" />
      {text}
    </Button>
  );
};