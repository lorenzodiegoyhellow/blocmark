import { useEffect, ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { SubscriptionModal } from "./subscription-modal";
import { queryClient } from "@/lib/queryClient";

interface SecretCornersAccessWrapperProps {
  children: ReactNode;
}

export function SecretCornersAccessWrapper({ children }: SecretCornersAccessWrapperProps) {
  // Get authentication and location state
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false); // Start with false
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user detected, redirecting to login page');
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
        return await response.json();
      } catch (error) {
        console.error('Error checking Secret Corners access:', error);
        return { hasAccess: false, status: 'not_applied' };
      }
    },
    enabled: !!user, // Only run this query for logged-in users
  });

  // Show loading state while checking
  if (authLoading || (user && isCheckingAccess)) {
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

  // If there's no user (after loading), don't render children
  if (!user) {
    return null;
  }

  // Check if user has active subscription
  const hasActiveSubscription = user?.secretCornersSubscriptionStatus === 'active' && 
    user?.secretCornersSubscriptionTier !== 'none';

  // Check access and subscription when data is available
  useEffect(() => {
    if (!isCheckingAccess && accessData && user) {
      // If user is approved but doesn't have active subscription
      if (accessData.hasAccess && !hasActiveSubscription && !isAdmin) {
        setShowSubscriptionModal(true);
        setIsBlurred(true);
      } else if (accessData.hasAccess && (hasActiveSubscription || isAdmin)) {
        // User has both approval and subscription (or is admin)
        setIsBlurred(false);
      }
    }
  }, [accessData, isCheckingAccess, hasActiveSubscription, isAdmin, user]);

  // Debug current state
  console.log('[SecretCornersAccessWrapper] Rendering Decision:', {
    isAdmin,
    hasAccessData: !!accessData,
    hasAccess: accessData?.hasAccess,
    hasActiveSubscription,
    isCheckingAccess
  });

  // If user is admin, always allow access
  if (isAdmin) {
    console.log('[SecretCornersAccessWrapper] Admin access granted - rendering children');
    return <>{children}</>;
  }

  // If still checking access (non-admin), wait
  if (isCheckingAccess && !isAdmin) {
    console.log('[SecretCornersAccessWrapper] Still checking access - showing loading');
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

  // If user has approval and active subscription, show content
  if (accessData?.hasAccess && hasActiveSubscription) {
    console.log('[SecretCornersAccessWrapper] User has access and subscription - rendering children');
    return <>{children}</>;
  }

  // If user has approval but no subscription, show blurred content with modal
  if (accessData?.hasAccess && !hasActiveSubscription) {
    console.log('[SecretCornersAccessWrapper] User has access but no subscription - showing subscription modal');
    return (
      <>
        <div className={isBlurred ? "blur-md pointer-events-none" : ""}>
          {children}
        </div>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => {
            // Don't allow closing without subscribing
            toast({
              title: "Subscription Required",
              description: "You need an active subscription to access Secret Corners",
              variant: "destructive"
            });
          }}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            setIsBlurred(false);
            // Refresh user data and access data
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient.invalidateQueries({ queryKey: ['/api/secret-corners/access'] });
          }}
        />
      </>
    );
  }

  // Otherwise redirect to the application page with an appropriate message
  useEffect(() => {
    if (!isCheckingAccess && accessData && !accessData.hasAccess && !isAdmin) {
      console.log('[SecretCornersAccessWrapper] No access - redirecting to apply page');
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
      
      navigate('/secret-corners-apply');
    }
  }, [accessData, isCheckingAccess, navigate, toast, isAdmin]);

  // Default: If no conditions met, show loading
  console.log('[SecretCornersAccessWrapper] No conditions met - showing loading state');
  return (
    <AppLayout>
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-medium mb-2">Loading Secret Corners...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your experience.</p>
        </div>
      </div>
    </AppLayout>
  );
}