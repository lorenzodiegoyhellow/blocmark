import { Link, useLocation } from "wouter";
import { Calendar, MessageSquare, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export function MobileNav() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // For non-admin users, check API for access
  const { data: accessData } = useQuery({
    queryKey: ['/api/secret-corners/access'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-corners/access');
        if (!response.ok) {
          throw new Error('Failed to check Secret Corners access');
        }
        return await response.json();
      } catch (error) {
        console.error('Error checking Secret Corners access for mobile menu:', error);
        return { hasAccess: false };
      }
    },
    enabled: !!user && !isAdmin,
  });
  
  // Check if the user has access to Secret Corners
  const hasAccess = isAdmin || accessData?.hasAccess || false;
  
  // Handle Secret Corners click
  const handleSecretCornersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hasAccess) {
      navigate("/secret-corners");
    } else {
      navigate("/secret-corners-landing");
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full md:hidden border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/bookings">
          <div className="flex flex-col items-center">
            <Calendar className={cn(
              "h-6 w-6",
              location.startsWith("/booking") ? "text-primary" : "text-gray-500"
            )} />
            <span className="text-xs mt-1">Bookings</span>
          </div>
        </Link>
        
        <Link href="/messages">
          <div className="flex flex-col items-center">
            <MessageSquare className={cn(
              "h-6 w-6",
              location.startsWith("/message") ? "text-primary" : "text-gray-500"
            )} />
            <span className="text-xs mt-1">Messages</span>
          </div>
        </Link>
        
        {user && (
          <button onClick={handleSecretCornersClick}>
            <div className="flex flex-col items-center">
              <Map className={cn(
                "h-6 w-6",
                location.startsWith("/secret-corners") ? "text-primary" : "text-gray-500"
              )} />
              <span className="text-xs mt-1">Secret Corners</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}