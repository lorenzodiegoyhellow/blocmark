import React from 'react';
import { Button } from './ui/button';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { useIntercom } from '../lib/intercom-provider';
import { cn } from '../lib/utils';

interface IntercomHelpButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  preMessage?: string;
  showIcon?: boolean;
  text?: string;
}

export const IntercomHelpButton: React.FC<IntercomHelpButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className,
  preMessage,
  showIcon = true,
  text = 'Chat with us',
}) => {
  const intercom = useIntercom();

  const handleClick = () => {
    if (preMessage) {
      intercom.showNewMessage(preMessage);
    } else {
      intercom.show();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      {showIcon && <MessageCircle className="h-4 w-4" />}
      {text}
    </Button>
  );
};

interface FloatingIntercomButtonProps {
  position?: 'bottom-right' | 'bottom-left';
  hideDefault?: boolean;
}

export const FloatingIntercomButton: React.FC<FloatingIntercomButtonProps> = ({
  position = 'bottom-right',
  hideDefault = false,
}) => {
  const intercom = useIntercom();

  React.useEffect(() => {
    if (hideDefault) {
      intercom.hide();
    }
  }, [hideDefault, intercom]);

  if (hideDefault) {
    const positionClasses = position === 'bottom-right' 
      ? 'bottom-4 right-4' 
      : 'bottom-4 left-4';

    return (
      <div className={cn('fixed z-50', positionClasses)}>
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => intercom.show()}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Need Help?
        </Button>
      </div>
    );
  }

  return null;
};