import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldCheck, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RneKqRJ1MlAzlJQGN8MQCcmD6bNUhwyuNiQ9WdKVXxYRNJXDJHhPuwJ7FFpbw0w4HJN63Tse8l9zFKA52N2c2J8006YLXSUX3');

interface VerificationStatus {
  status: "not_started" | "pending" | "verified" | "failed" | "expired";
  verifiedAt?: string;
  method?: string;
  failureReason?: string;
}

interface VerificationSession {
  sessionId: string;
  clientSecret: string;
  url?: string;
}

export function IdentityVerification({ userId, isOwnProfile }: { userId: number; isOwnProfile: boolean }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current verification status
  const { data: verificationStatus, isLoading: statusLoading } = useQuery<VerificationStatus>({
    queryKey: [`/api/identity/verification-status`],
    enabled: isOwnProfile,
  });

  // Create verification session mutation
  const createVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest({
        url: "/api/identity/create-verification-session",
        method: "POST",
      });
      return response as VerificationSession;
    },
    onSuccess: async (data) => {
      try {
        setIsLoading(true);
        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error("Stripe failed to load");
        }

        // If we have a URL, redirect to it
        if (data.url) {
          window.location.href = data.url;
        } else if (data.clientSecret) {
          // Otherwise, use the client secret to continue verification
          toast({
            title: "Verification Started",
            description: "Please complete the identity verification process.",
          });
        }
      } catch (error) {
        console.error("Error starting verification:", error);
        toast({
          title: "Error",
          description: "Failed to start verification process",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create verification session",
        variant: "destructive",
      });
    },
  });

  // Show verified badge for non-owners
  if (!isOwnProfile) {
    if (verificationStatus?.status === "verified") {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <ShieldCheck className="w-3 h-3 mr-1" />
          ID Verified
        </Badge>
      );
    }
    return null;
  }

  // Loading state
  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render based on verification status
  const renderContent = () => {
    switch (verificationStatus?.status) {
      case "verified":
        return (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your identity has been verified successfully!
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Identity Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Verified on {new Date(verificationStatus.verifiedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <ShieldCheck className="w-3 h-3 mr-1" />
                ID Verified
              </Badge>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your verification is in progress. Please complete the verification process if you haven't already.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => createVerificationMutation.mutate()} 
              disabled={isLoading || createVerificationMutation.isPending}
              className="w-full"
            >
              {isLoading || createVerificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Continue Verification
                </>
              )}
            </Button>
          </div>
        );

      case "failed":
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {verificationStatus.failureReason || "Your verification was unsuccessful. Please try again with valid documents."}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => createVerificationMutation.mutate()} 
              disabled={isLoading || createVerificationMutation.isPending}
              className="w-full"
            >
              {isLoading || createVerificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        );

      case "expired":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your verification session has expired. Please start a new verification.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => createVerificationMutation.mutate()} 
              disabled={isLoading || createVerificationMutation.isPending}
              className="w-full"
            >
              {isLoading || createVerificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Start New Verification
                </>
              )}
            </Button>
          </div>
        );

      default: // not_started
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Verify your identity to build trust with other users and get a verified badge on your profile.
              </p>
            </div>
            <Button 
              onClick={() => createVerificationMutation.mutate()} 
              disabled={isLoading || createVerificationMutation.isPending}
              className="w-full"
            >
              {isLoading || createVerificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Identity
                </>
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Verify your identity to increase trust and safety
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}