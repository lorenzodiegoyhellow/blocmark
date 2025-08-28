import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatUsername } from "@/lib/utils";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  login: (user: SelectUser) => void;
  register: (user: SelectUser) => void;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    onError: (err) => {
      console.log("Auth error:", err);
      // Only show auth errors if we're on a page that requires auth
      if (window.location.pathname.includes('/dashboard') || 
          window.location.pathname.includes('/messages') ||
          window.location.pathname.includes('/listings')) {
        toast({
          title: "Authentication issue",
          description: "Could not verify your account. You may need to log in again.",
          variant: "destructive",
        });
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Use direct fetch for login to handle response properly
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Login failed with status: ${response.status}`);
        }
        
        // Only try to parse JSON if we have JSON content
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          // Fallback if no JSON is returned
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Store username in localStorage for use in other parts of the app
      localStorage.setItem('user_name', user.username);
      localStorage.setItem('user_id', user.id.toString());
      
      // Show welcome toast
      toast({
        title: "Welcome back!",
        description: `You're now signed in as ${formatUsername(user.username)}`,
      });
      
      // Check for redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      // Navigate to redirect path if provided, otherwise go to homepage
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    },
    onError: (error: Error) => {
      console.error("Login error in mutation handler:", error);
      toast({
        title: "Login failed",
        description: error.message || "Check your username and password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        // Use direct fetch for registration to handle response properly
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Registration failed with status: ${response.status}`);
        }
        
        // Only try to parse JSON if we have JSON content
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          // Fallback if no JSON is returned
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Store username in localStorage for use in other parts of the app
      localStorage.setItem('user_name', user.username);
      localStorage.setItem('user_id', user.id.toString());
      
      // Show welcome toast for new user
      toast({
        title: "Welcome to Blocmark!",
        description: `Your account has been created successfully. You are now signed in as ${formatUsername(user.username)}.`,
      });
      
      // Navigate to homepage
      navigate("/");
    },
    onError: (error: Error) => {
      console.error("Registration error in mutation handler:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Use the special logout handling in apiRequest
      return await apiRequest({
        url: "/api/logout",
        method: "POST"
      });
    },
    onSuccess: () => {
      // Clear user data from the query cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Clear user data from localStorage
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_id');
      
      // Show logout confirmation
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out of your account.",
      });
      
      // Navigate to homepage and reset the app state
      navigate("/");
      
      // Force page reload after a brief delay to ensure all state is cleared
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error: Error) => {
      console.error("Logout error in mutation:", error);
      toast({
        title: "Session ended",
        description: "Your session has been ended. Some server operations may have failed.",
        variant: "default",
      });
      
      // Even if server logout failed, clear local state
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries();
      
      // Clear all localStorage cache items as a fallback
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          console.log(`Clearing cached data: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Navigate to homepage and reset the app state
      navigate("/");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
  });

  // Helper functions to make auth actions cleaner
  const login = (user: SelectUser) => {
    queryClient.setQueryData(["/api/user"], user);
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    
    // Store username in localStorage for use in other parts of the app
    localStorage.setItem('user_name', user.username);
    localStorage.setItem('user_id', user.id.toString());
    
    // Show welcome toast
    toast({
      title: "Welcome back!",
      description: `You're now signed in as ${formatUsername(user.username)}`,
    });
    
    // Check for redirect parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirect');
    
    // Navigate to redirect path if provided, otherwise go to homepage
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate("/");
    }
  };
  
  const register = (user: SelectUser) => {
    queryClient.setQueryData(["/api/user"], user);
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    
    // Store username in localStorage for use in other parts of the app
    localStorage.setItem('user_name', user.username);
    localStorage.setItem('user_id', user.id.toString());
    
    // Show welcome toast for new user
    toast({
      title: "Welcome to Blocmark!",
      description: `Your account has been created successfully. You are now signed in as ${formatUsername(user.username)}.`,
    });
    
    // Check for redirect parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirect');
    
    // Navigate to redirect path if provided, otherwise go to homepage
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
