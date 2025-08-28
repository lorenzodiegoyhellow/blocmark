import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type HostModeContextType = {
  isHostMode: boolean;
  toggleHostMode: (isUserOwner?: boolean, hasLocations?: boolean, isAuthenticated?: boolean) => boolean;
  setHostMode: (value: boolean, isUserOwner?: boolean, hasLocations?: boolean, isAuthenticated?: boolean) => boolean;
};

const HostModeContext = createContext<HostModeContextType | null>(null);

export function HostModeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Initialize from localStorage but ensure we respect property ownership status
  const [isHostMode, setIsHostMode] = useState(() => {
    try {
      // We'll still read the preference, but it will be enforced in useEffect below
      const saved = localStorage.getItem("blocmark_host_mode");
      return saved === "true";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return false;
    }
  });
  
  // Save mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("blocmark_host_mode", isHostMode ? "true" : "false");
      // Debug log for mode changes
      console.log("Host mode changed:", isHostMode);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [isHostMode]);
  
  // Add a function to check for property ownership, but don't auto-disable host mode
  // This allows users to see the listings page and create their first listing
  useEffect(() => {
    // We'll implement a function to check for property ownership
    const checkPropertyOwnership = async () => {
      try {
        // Fetch user's properties to check ownership
        const response = await fetch("/api/locations/owner");
        if (!response.ok) {
          throw new Error("Failed to fetch user properties");
        }
        
        const locations = await response.json();
        const hasLocations = locations && locations.length > 0;
        
        // Log the properties status but don't auto-disable host mode
        // This allows users without properties to still access host-specific pages
        if (!hasLocations && isHostMode) {
          console.log("User is in host mode but has no properties yet");
          // We're intentionally NOT resetting to client mode here
        }
      } catch (error) {
        console.error("Error checking property ownership:", error);
        // Only log the error but don't change the mode automatically
      }
    };
    
    // Only run this check if user is in host mode
    if (isHostMode) {
      checkPropertyOwnership();
    }
  }, [isHostMode]);

  const toggleHostMode = (isUserOwner?: boolean, hasLocations?: boolean, isAuthenticated: boolean = false) => {
    // Check if user is authenticated before allowing host mode toggle
    if (!isAuthenticated) {
      console.log("Cannot toggle host mode - user not authenticated");
      
      // Show toast notification to guide user
      toast({
        title: "Authentication Required",
        description: "Please sign in to switch to host mode.",
        variant: "default",
        action: <a href="/auth" className="bg-primary text-white px-3 py-1 rounded-md text-xs">Sign In</a>
      });
      
      // Don't change mode state if not authenticated
      return false;
    }
    
    // If currently in client mode and trying to switch to host mode
    if (!isHostMode) {
      // Always allow toggle attempt, dashboard will show warning if needed
      setIsHostMode(true);
      console.log("Attempting to switch to host mode", { isUserOwner, hasLocations });
      
      // Show success toast
      toast({
        title: "Host Mode Activated",
        description: "You are now in host mode. You can manage your listings and bookings.",
      });
      
      return true;
    } 
    // If currently in host mode, always allow switching to client mode
    else {
      setIsHostMode(false);
      console.log("Switching to client mode");
      
      // Show success toast
      toast({
        title: "Guest Mode Activated",
        description: "You are now in guest mode. You can browse and book locations.",
      });
      
      return true;
    }
  };

  const setHostMode = (value: boolean, isUserOwner?: boolean, hasLocations?: boolean, isAuthenticated: boolean = false) => {
    // Check if user is authenticated before allowing host mode toggle
    if (!isAuthenticated) {
      console.log("Cannot set host mode - user not authenticated");
      
      // Show toast notification to guide user
      toast({
        title: "Authentication Required",
        description: "Please sign in to access host mode.",
        variant: "default",
        action: <a href="/auth" className="bg-primary text-white px-3 py-1 rounded-md text-xs">Sign In</a>
      });
      
      // Don't change mode state if not authenticated
      return false;
    }
    
    // If trying to set to host mode
    if (value) {
      // Always allow the attempt, dashboard will handle the warning display
      setIsHostMode(true);
      console.log("Setting to host mode", { isUserOwner, hasLocations });
      
      // Show success toast
      toast({
        title: "Host Mode Activated",
        description: "You are now in host mode. You can manage your listings and bookings.",
      });
      
      return true;
    } 
    // If setting to client mode, always allow
    else {
      setIsHostMode(false);
      console.log("Setting to client mode");
      
      // Show success toast
      toast({
        title: "Guest Mode Activated",
        description: "You are now in guest mode. You can browse and book locations.",
      });
      
      return true;
    }
  };

  return (
    <HostModeContext.Provider value={{ isHostMode, toggleHostMode, setHostMode }}>
      {children}
    </HostModeContext.Provider>
  );
}

export function useHostMode() {
  const context = useContext(HostModeContext);
  if (!context) {
    throw new Error("useHostMode must be used within a HostModeProvider");
  }
  return context;
}
