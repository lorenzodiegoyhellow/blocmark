import { useState, useEffect } from "react";
import { Map } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface SecretCornersMenuItemProps {
  isTransparent: boolean;
}

/**
 * A menu item that appears for all logged-in users.
 * When clicked, it will redirect to Secret Corners if the user has access,
 * or to the Secret Corners landing page if they don't have access.
 */
export function SecretCornersMenuItem({ isTransparent }: SecretCornersMenuItemProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  
  // Check if the current page is Secret Corners related
  const isSecretCornersActive = location === "/secret-corners" || 
                              location.startsWith("/secret-corners/") || 
                              location.includes("blocmap");
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // For non-admin users, check API for access
  const { data: accessData, isLoading } = useQuery({
    queryKey: ['/api/secret-corners/access'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-corners/access');
        if (!response.ok) {
          throw new Error('Failed to check Secret Corners access');
        }
        return await response.json();
      } catch (error) {
        console.error('Error checking Secret Corners access for menu:', error);
        return { hasAccess: false };
      }
    },
    refetchOnWindowFocus: true,
    // Only run query for non-admin logged-in users
    enabled: !!user && !isAdmin,
  });
  
  // Check if the user has access to Secret Corners
  const hasAccess = isAdmin || accessData?.hasAccess || false;
  
  // Handle click - redirect based on access
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hasAccess) {
      // User has access, go to Secret Corners page
      navigate("/secret-corners");
    } else {
      // User doesn't have access, go to landing page
      navigate("/secret-corners-landing");
    }
  };
  
  // Show loading skeleton while checking access
  if (isLoading) {
    return (
      <div className={cn(
        navigationMenuTriggerStyle(),
        "flex items-center min-w-[120px]", 
        isTransparent ? "bg-black/20" : "bg-white"
      )}>
        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }
  
  // Don't show menu item if user is not logged in
  if (!user) {
    return null;
  }
  
  // Always show the menu item for logged-in users
  return (
    <button 
      onClick={handleClick}
      className={cn(
        navigationMenuTriggerStyle(), 
        "cursor-pointer flex items-center",
        isSecretCornersActive ? "text-teal-500 font-medium" : "",
        isTransparent && !isSecretCornersActive ? "text-white hover:text-white/90 hover:bg-white/10 bg-black/20" : "bg-white"
      )}
    >
      <Map className="w-4 h-4 mr-2" />
      Secret Corners
    </button>
  );
}