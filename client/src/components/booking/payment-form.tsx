import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  locationId: number;
  locationTitle: string;
  startDate: Date;
  endDate: Date;
  guestCount: number;
  totalPrice: number;
  activityType: string;
  activity: string;
  castAndCrew: string;
  projectName: string;
  renterCompany: string;
  projectDescription: string;
  addons?: {id: number, name: string, price: number}[];
}

export function PaymentForm({
  locationId,
  locationTitle,
  startDate,
  endDate,
  guestCount,
  totalPrice,
  activityType,
  activity,
  castAndCrew,
  projectName,
  renterCompany,
  projectDescription,
  addons = []
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is logged in
      if (!user) {
        throw new Error("You must be logged in to make a booking. Please sign in and try again.");
      }

      console.log("Starting payment process...");
      toast({
        title: "Creating your booking...",
        description: "Please wait while we prepare your payment.",
      });
      
      // Then create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId,
          locationTitle,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guestCount,
          totalPrice,
          activityType,
          activity,
          castAndCrew,
          projectName,
          renterCompany,
          projectDescription,
          addons: addons.map(addon => addon.id)
        }),
        // Include credentials to ensure session cookies are sent
        credentials: "include"
      });

      if (!response.ok) {
        // Improved error handling - try to read response as text first
        const errorText = await response.text();
        let errorMessage = "Failed to create checkout session";
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Checkout error data:", errorData);
        } catch (parseError) {
          // If not JSON, use the raw text
          console.error("Raw error response:", errorText);
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!data || !data.url) {
        console.error("Invalid response data:", data);
        throw new Error("No checkout URL returned from the server");
      }

      console.log("Redirecting to checkout:", data.url);
      toast({
        title: "Redirecting to secure payment",
        description: "You're being redirected to our secure payment processor.",
      });
      
      // Store the booking ID in local storage as a primary fallback mechanism
      // This is critical for recovering the booking ID if Stripe redirect URL parameters get lost
      if (data && data.bookingId) {
        localStorage.setItem('last_booking_id', data.bookingId.toString());
        console.log("Saved booking ID to localStorage:", data.bookingId);
      }
      
      // Log detailed debug information about the booking creation
      console.log("Payment flow debug information:", {
        bookingCreated: !!data.bookingId,
        bookingId: data.bookingId,
        hasStripeCheckoutUrl: !!data.url,
        localStorageSaved: data.bookingId ? true : false
      });
      
      // Enhanced redirect to Stripe checkout with improved reliability
      setTimeout(() => {
        try {
          // Primary redirect method
          window.location.href = data.url;
          
          // Secondary fallback redirect if first method fails
          setTimeout(() => {
            console.log("Attempting secondary redirect method...");
            try {
              // Use _self to replace the current window rather than opening a new tab
              window.open(data.url, '_self');
            } catch (err) {
              console.error("Secondary redirect failed:", err);
              // If all else fails, show manual instructions
              toast({
                title: "Redirect issue detected",
                description: "If you're not redirected automatically, please click the payment button again.",
                duration: 10000
              });
            }
          }, 1500);
        } catch (err) {
          console.error("Primary redirect failed:", err);
        }
      }, 200);

    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process payment. Please try again.";
      
      // Set local error state
      setError(errorMessage);
      
      // Show toast notification
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handlePayment} 
        disabled={isLoading || !user}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Payment
          </>
        )}
      </Button>
      
      {!user && (
        <Alert variant="destructive">
          <AlertDescription>
            You must be logged in to make a booking. Please sign in and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
        <ShieldCheck className="h-3 w-3 mr-1" />
        <span>Secure payment processed by Stripe</span>
      </div>
    </div>
  );
}