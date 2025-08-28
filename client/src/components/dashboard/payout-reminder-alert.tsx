import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function PayoutReminderAlert() {
  const { user } = useAuth();

  // Check if user has locations (is a host)
  const { data: userLocations } = useQuery<any[]>({
    queryKey: ["/api/locations/owner"],
    enabled: !!user?.id && user?.roles?.includes("owner"),
  });

  // Check payout method status
  const { data: payoutData } = useQuery<{ payoutMethods?: any[] }>({
    queryKey: ["/api/payout-methods"],
    enabled: !!user?.id && user?.roles?.includes("owner"),
  });

  // Don't show if user has no locations (not really a host yet)
  if (!userLocations || userLocations.length === 0) {
    return null;
  }

  // Don't show if user already has payout methods set up
  if (payoutData?.payoutMethods && payoutData.payoutMethods.length > 0) {
    return null;
  }

  // Don't show if we haven't loaded the data yet
  if (!payoutData) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800">Set up your payout method to receive payments</AlertTitle>
      <AlertDescription className="text-amber-700 mt-2">
        <p className="mb-3">
          You need to add a payout method to receive payments from your bookings. 
          Set up your bank account details and upload your W-9 form to start getting paid.
        </p>
        <Link href="/account-settings#payout">
          <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Set up payout method
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}