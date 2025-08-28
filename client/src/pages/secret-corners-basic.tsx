import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SecretCornersBasic() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // If user is not logged in, redirect to auth page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/secret-corners');
    }
  }, [user, authLoading, navigate]);
  
  // Check user's access to Secret Corners
  const {
    data: accessData,
    isLoading: isCheckingAccess
  } = useQuery({
    queryKey: ['/api/secret-corners/access'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-corners/access');
        if (!response.ok) {
          throw new Error('Failed to check Secret Corners access');
        }
        const data = await response.json();
        
        // Extra debugging
        console.log('ACCESS CHECK RESPONSE:', {
          data, 
          hasAccess: data.hasAccess,
          status: data.status
        });
        
        // Force refresh without caching to ensure we have the latest access status
        queryClient.invalidateQueries({ queryKey: ['/api/secret-corners/access'] });
        
        return data;
      } catch (error) {
        console.error('Error checking Secret Corners access:', error);
        return { hasAccess: false, status: 'not_applied' };
      }
    },
    enabled: !!user, // Only run this query for logged-in users
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache this response (formerly called cacheTime)
  });

  // Redirect users without access
  useEffect(() => {
    if (isAdmin) {
      console.log('Admin access granted');
      return; // Admin bypass - always has access
    }
    
    if (!isCheckingAccess && accessData && !accessData.hasAccess) {
      console.log('No access, redirecting:', accessData);
      
      // Show appropriate toast message based on status
      if (accessData.status === 'pending') {
        toast({
          title: "Application In Review",
          description: "Your Secret Corners application is still being reviewed. We'll notify you when it's approved.",
        });
      } else if (accessData.status === 'rejected') {
        toast({
          title: "Access Denied",
          description: "Your Secret Corners application was not approved. You can apply again with more details.",
          variant: "destructive"
        });
      }
      
      // Redirect to application page
      navigate('/secret-corners-apply');
    }
  }, [accessData, isCheckingAccess, isAdmin, navigate, toast]);

  // Loading states
  if (authLoading || isCheckingAccess) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium mb-2">Checking access...</h2>
            <p className="text-muted-foreground">Please wait while we verify your access to Secret Corners.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // If user has no access, don't render content (redirect will happen)
  if (!isAdmin && (!accessData || !accessData.hasAccess)) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">You don't have access to Secret Corners. Redirecting to application page...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // User has access, show content
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Secret Corners</h1>
        <div className="p-6 bg-card rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Secret Corners!</h2>
          <p className="text-lg mb-6">
            You now have access to our exclusive network of hidden spots, secret viewpoints, and photography locations
            that aren't publicly advertised.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Placeholder cards */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted rounded-md mb-3"></div>
                <h3 className="text-lg font-medium mb-1">Secret Location #{item}</h3>
                <p className="text-muted-foreground text-sm">
                  An exclusive hidden spot with amazing views and photography opportunities.
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              This is a simplified version of the Secret Corners page. We're currently working on improving it.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}