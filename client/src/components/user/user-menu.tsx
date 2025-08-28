import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { useLocation } from "wouter";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { usePendingBookings } from "@/hooks/use-pending-bookings";
import { formatUsername } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@/../../shared/schema";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Heart,
  ArrowLeftRight,
  HelpCircle,
  LogOut,
  ChevronDown,
  PlusCircle,
  MessageSquare,
  CalendarDays,
  LayoutGrid,
  BarChart2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  scrolled?: boolean;
}

export function UserMenu({ scrolled = false }: UserMenuProps) {
  const { user, logoutMutation } = useAuth();
  const { isHostMode, toggleHostMode, setHostMode } = useHostMode();
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isHomePage = location === "/";
  const isSecretCornersPage = location === "/secret-corners" || location.startsWith("/secret-corners/");
  const isTransparent = isHomePage && !scrolled;
  const unreadCount = useUnreadMessages();
  const { pendingCount } = usePendingBookings();
  
  // Check if user has admin or editor privileges
  const isAdmin = user?.roles?.includes("admin") || user?.roles?.includes("editor");
  
  // Check if the user has any locations (for host mode eligibility)
  const { 
    data: userOwnedLocations,
    isLoading: locationsLoading 
  } = useQuery<Location[]>({
    queryKey: ["/api/locations/owner"],
    enabled: !!user?.id && user?.roles?.includes("owner"),
  });
  
  // Derive if user can be a host
  const hasLocations = !!userOwnedLocations && userOwnedLocations.length > 0;

  // Show login button if user is not authenticated
  if (!user) {
    return (
      <Button onClick={() => navigate('/auth')} size="sm">
        Login
      </Button>
    );
  }

  const handleToggleMode = () => {
    // Pass authenticated flag as true since we've verified user exists
    const success = toggleHostMode(
      user?.roles?.includes("owner"), 
      hasLocations, 
      true // User is authenticated
    );
    
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="default" 
          className={cn(
            "relative rounded-lg flex items-center gap-2",
            isTransparent ? "text-white hover:bg-white/10 bg-black/20" : ""
          )}
        >
          <div className="relative">
            <Avatar className={cn(
              "h-8 w-8",
              isTransparent && "border border-white/20"
            )}>
              {user.profileImage ? (
                <AvatarImage 
                  src={user.profileImage} 
                  alt={user.username}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className={isTransparent ? "bg-white/20 text-white" : ""}>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
            )}
          </div>
          <ChevronDown className={`h-4 w-4 hidden sm:block ${isTransparent ? "text-white/70" : "text-muted-foreground"}`} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] bg-white z-[9999]">
        <div className="py-6 space-y-6">
          {/* Mobile Navigation Items - Only shown below SM breakpoint */}
          <div className="block md:hidden">
            <h3 className="text-lg font-semibold mb-3">Navigation</h3>
            <nav className="space-y-3 mb-4">
              {/* Menu Section - Mobile */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground px-2">Menu</h4>
                
                {/* Bookings */}
                <Button
                  variant="ghost"
                  className="w-full justify-start relative"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Bookings
                  {isHostMode && pendingCount > 0 && (
                    <Badge 
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 min-w-4 flex items-center justify-center text-[10px] px-1 bg-amber-500"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Messages */}
                <Button
                  variant="ghost"
                  className="w-full justify-start relative"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/messages");
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </Button>
                
                {/* Listings - Only visible in host mode */}
                {isHostMode && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/listings");
                    }}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Listings
                  </Button>
                )}
                
                {/* Saved Locations */}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/saved-locations");
                  }}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Saved Locations
                </Button>
              </div>

              {/* Host-specific navigation - Mobile */}
              {isHostMode && hasLocations && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground px-2">Host</h4>
                  
                  {/* Listings */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/listings");
                    }}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Listings
                  </Button>
                  
                  {/* Analytics */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/analytics");
                    }}
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
              )}
            </nav>
            <Separator className="mb-4" />
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {user.profileImage ? (
                <AvatarImage 
                  src={user.profileImage} 
                  alt={user.username}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{formatUsername(user.username)}</h3>
              <p className="text-sm text-muted-foreground">
                {isHostMode ? "Hosting Mode" : "Booking Mode"}
              </p>
            </div>
          </div>
          <Separator />
          <nav className="space-y-3">
            {/* Menu Section */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-2">Menu</h4>
              
              {/* Bookings */}
              <Button
                variant="ghost"
                className="w-full justify-start relative"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Bookings
                {isHostMode && pendingCount > 0 && (
                  <Badge 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 min-w-4 flex items-center justify-center text-[10px] px-1 bg-amber-500"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
              
              {/* Messages */}
              <Button
                variant="ghost"
                className="w-full justify-start relative"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/messages");
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-destructive" />
                )}
              </Button>
              
              {/* Listings - Only visible in host mode */}
              {isHostMode && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/listings");
                  }}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Listings
                </Button>
              )}
              
              {/* Saved Locations */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/saved-locations");
                }}
              >
                <Heart className="mr-2 h-4 w-4" />
                Saved Locations
              </Button>
            </div>

            <Separator />

            {/* Account Section */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-2">Account</h4>
              
              {/* Switch Mode Button */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleToggleMode}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Switch to {isHostMode ? "Booking" : "Hosting"}
              </Button>
              
              {/* Profile */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/users/${user.id}`);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              
              {/* Analytics Dashboard (only visible in host mode and if user has locations) */}
              {isHostMode && hasLocations && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/analytics");
                  }}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Analytics Dashboard
                </Button>
              )}
              
              {/* Account Settings */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/account-settings");
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </div>

            <Separator />

            {/* Help and Support Section */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-2">Help and Support</h4>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/help-support");
                }}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </div>
            
            {/* Admin Dashboard - Only visible for admin users */}
            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground px-2">Admin</h4>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </div>
              </>
            )}
            
            <Separator />
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={() => {
                setIsOpen(false);
                // Try to logout, then redirect even if it fails
                try {
                  logoutMutation.mutate();
                } catch (err) {
                  console.error("Error triggering logout:", err);
                  // Force reload as fallback
                  window.location.href = '/';
                }
              }}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}