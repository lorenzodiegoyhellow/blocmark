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

export function SecretCornersAccessWrapperComplete({ children }: SecretCornersAccessWrapperProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/secret-corners');
    }
  }, [user, authLoading, navigate]);
  
  // Check Secret Corners access
  const {
    data: accessData,
    isLoading: accessLoading
  } = useQuery<{
    hasAccess: boolean;
    status: 'pending' | 'approved' | 'rejected' | null;
  }>({
    queryKey: ['/api/secret-corners/access'],
    enabled: !!user && !isAdmin, // Only check access for non-admin users
  });
  
  // Check subscription status - cast user to include subscription_status
  const userWithSubscription = user as typeof user & { subscription_status?: string };
  const hasActiveSubscription = userWithSubscription?.subscription_status === 'active' || false;
  
  // Loading state
  if (authLoading || (accessLoading && !isAdmin)) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium mb-2">Loading Secret Corners...</h2>
            <p className="text-muted-foreground">Please wait while we verify your access.</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  // Admin bypass - always show content
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Check if user has been approved for Secret Corners
  const hasApproval = accessData?.hasAccess || false;
  
  // User needs to apply first
  if (!hasApproval) {
    // Redirect to application page
    useEffect(() => {
      if (accessData?.status === 'pending') {
        toast({
          title: "Application Pending",
          description: "Your Secret Corners application is being reviewed.",
        });
      } else if (accessData?.status === 'rejected') {
        toast({
          title: "Access Denied",
          description: "Your application was not approved. You can apply again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Application Required",
          description: "You need to apply for Secret Corners access first.",
        });
      }
      navigate('/secret-corners-apply');
    }, []);
    
    return null;
  }
  
  // User has approval but needs subscription
  if (hasApproval && !hasActiveSubscription) {
    return (
      <>
        <div className={showSubscriptionModal ? "blur-md pointer-events-none" : ""}>
          {children}
        </div>
        <SubscriptionModal
          open={true}
          onClose={() => {
            toast({
              title: "Subscription Required",
              description: "An active subscription is required to access Secret Corners",
              variant: "destructive"
            });
            navigate('/');
          }}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient.invalidateQueries({ queryKey: ['/api/secret-corners/access'] });
          }}
        />
      </>
    );
  }
  
  // User has both approval and subscription - show content
  return <>{children}</>;
}