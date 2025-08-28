import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'wouter';
import { formatDate } from '@/lib/utils';

export function NotificationDropdown({ className }: { className?: string }) {
  const { 
    notifications = [] as Notification[], 
    unreadCount = 0, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const typedNotifications = (notifications || []) as Notification[];
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read
    markAsRead(notification.id);
    
    // Navigate to the action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setOpen(false);
    }
  };

  // Function to get notification type based icon
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_request':
        return '📅';
      case 'location_approved':
        return '✅';
      case 'location_rejected':
        return '❌';
      case 'booking_approved':
        return '✓';
      case 'booking_rejected':
        return '✗';
      case 'booking_cancelled':
        return '🚫';
      case 'message_received':
        return '💬';
      case 'admin_message':
        return '👑';
      case 'booking_refunded':
        return '💰';
      case 'location_spotlighted':
        return '🌟';
      case 'custom_offer_received':
        return '💸';
      case 'custom_offer_accepted':
        return '✅';
      case 'custom_offer_refused':
        return '❌';
      case 'custom_offer_cancelled':
        return '❌';
      case 'payout_method_required':
        return '💳';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 bg-white z-[9999]" align="end">
        <DropdownMenuLabel className="flex justify-between items-center p-3">
          <span>Notifications</span>
          {typedNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="text-xs h-6 px-2"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[min(80vh,500px)]">
          <DropdownMenuGroup className="p-1">
            {typedNotifications.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No notifications
              </div>
            ) : (
              typedNotifications.map((notification: Notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`flex flex-col items-start rounded-md p-3 cursor-pointer ${notification.read ? 'opacity-60' : 'bg-gray-100'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg" role="img" aria-label={notification.type}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium leading-none">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {notification.message}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-5 w-5 opacity-60 hover:opacity-100 -my-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        {typedNotifications && typedNotifications.length > 5 && (
          <div className="text-center p-1 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // TODO: Navigate to full notifications page when available
                setOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}