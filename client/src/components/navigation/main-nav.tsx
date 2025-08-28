import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link, useLocation } from "wouter";
import { MessageSquare, CalendarDays, LayoutGrid, PlusCircle, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostMode } from "@/hooks/use-host-mode";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { usePendingBookings } from "@/hooks/use-pending-bookings";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { useTranslation } from "@/hooks/use-translation";
import { SecretCornersMenuItem } from "./secret-corners/secret-corners-menu-item";
import { useQuery } from "@tanstack/react-query";

interface MainNavProps {
  scrolled?: boolean;
}

// We're using a separate component for the Secret Corners menu item

export function MainNav({ scrolled = false }: MainNavProps) {
  const { isHostMode } = useHostMode();
  const { user } = useAuth();
  const unreadCount = useUnreadMessages();
  const { pendingCount } = usePendingBookings();
  const [location] = useLocation();
  const isHomePage = location === "/";
  const isTransparent = isHomePage && !scrolled;
  const { t } = useTranslation();
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // Check for exact match
    if (location === path) return true;
    
    // Check for subpaths like dashboard/123
    if (path !== '/' && location.startsWith(`${path}/`)) return true;
    
    // Special cases
    if (path === '/dashboard' && location.includes('booking-details')) return true;
    if (path === '/messages' && location.includes('conversation')) return true;
    if (path === '/listings' && (location.includes('add-listing') || location.includes('location-addons'))) return true;
    if (path === '/secret-corners' && location.includes('blocmap')) return true;
    
    return false;
  };

  if (!user) return null;

  return (
    <NavigationMenu className="max-w-none hidden md:block mx-auto">
      <NavigationMenuList className="justify-center">
        <NavigationMenuItem>
          <Link 
            href="/dashboard" 
            className={cn(
              navigationMenuTriggerStyle(), 
              "cursor-pointer flex items-center gap-2 relative",
              isActive("/dashboard") ? "text-gray-700 font-medium" : "",
              isTransparent && !isActive("/dashboard") ? "text-white hover:text-white/90 hover:bg-white/10 bg-black/20" : "bg-white"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            {t("nav.bookings")}
            {isHostMode && pendingCount > 0 && (
              <Badge 
                variant="outline" 
                className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center text-[10px] px-1 bg-amber-500 text-white border-0 z-10"
              >
                {pendingCount}
              </Badge>
            )}
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            href="/messages" 
            className={cn(
              navigationMenuTriggerStyle(), 
              "cursor-pointer flex items-center gap-2 relative",
              isActive("/messages") ? "text-gray-700 font-medium" : "",
              isTransparent && !isActive("/messages") ? "text-white hover:text-white/90 hover:bg-white/10 bg-black/20" : "bg-white"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {t("nav.messages")}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center text-[10px] px-1 z-10"
              >
                {unreadCount}
              </Badge>
            )}
          </Link>
        </NavigationMenuItem>
        {isHostMode && (
          <NavigationMenuItem>
            <Link 
              href="/listings" 
              className={cn(
                navigationMenuTriggerStyle(), 
                "cursor-pointer flex items-center",
                isActive("/listings") ? "text-gray-700 font-medium" : "",
                isTransparent && !isActive("/listings") ? "text-white hover:text-white/90 hover:bg-white/10 bg-black/20" : "bg-white"
              )}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              {t("nav.listings")}
            </Link>
          </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          {/* We'll show this menu item conditionally based on server-side check for permission */}
          <SecretCornersMenuItem 
            isTransparent={isTransparent} 
          />
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  );
}