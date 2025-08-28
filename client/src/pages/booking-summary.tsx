import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ShieldAlert, AlertCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useStripe } from "@/lib/stripe-context";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/app-layout";

type BookingDetails = {
  startDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalPrice: number;
  basePrice: number;
  serviceFee: number;
  // Project details
  activityType: string;
  projectName: string;
  renterCompany: string;
  projectDescription: string;
  // Optional fields
  addons?: any[];
  timestamp?: string;
  source?: string;
};

export default function BookingSummary() {
  const { id } = useParams<{ id: string }>();
  const [locationPath, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { stripe, isLoading: isStripeLoading, error: stripeError } = useStripe();
  const [processError, setProcessError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loadingBookingData, setLoadingBookingData] = useState(true);

  console.log("BookingSummary component mounted, id:", id);

  // Super simplified approach - just check localStorage
  useEffect(() => {
    console.log("Checking localStorage for booking data");
    try {
      const storedData = localStorage.getItem('complete_booking_data');
      console.log("Found data in localStorage:", !!storedData);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Successfully parsed booking data", parsedData);
        setBookingDetails(parsedData);
      } else {
        console.error("No booking data found in localStorage");
        setProcessError("No booking data found. Please go back and try again.");
      }
    } catch (error) {
      console.error("Error retrieving booking details:", error);
      setProcessError("Error loading booking data. Please go back and try again.");
    } finally {
      setLoadingBookingData(false);
    }
  }, []);
  
  console.log("Booking details loaded:", bookingDetails);

  // Use the correct API endpoint format with URL parameters
  const { data: locationData, isLoading: locationLoading, error: locationError } = useQuery<Location>({
    queryKey: [`/api/locations/${id}`], // This format matches the server route
    enabled: !!id,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });
  
  // Log details about location query
  console.log("Location query details:", { 
    locationId: id, 
    isLoading: locationLoading, 
    hasData: !!locationData,
    error: locationError ? String(locationError) : null
  });

  // Removed the old checkout mutation implementation
  // We now use a direct form submission approach

  // Show auth warnings
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to complete this booking",
        variant: "destructive",
      });
    }
  }, [user, authLoading, toast]);

  // Show Stripe errors as a toast, but don't block the UI
  useEffect(() => {
    if (stripeError) {
      toast({
        title: "Payment system warning",
        description: "There might be an issue with the payment system. You can still proceed, but you may encounter issues at checkout.",
        variant: "destructive",
      });
      console.warn("Stripe error:", stripeError);
    }
  }, [stripeError, toast]);

  // Combined loading state
  const isLoading = locationLoading || authLoading || loadingBookingData;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-border mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Create a debug helper function for testing in the browser console
  useEffect(() => {
    // Add to window object with TypeScript support
    (window as any).debugBooking = {
      checkLocalStorage: () => {
        const data = localStorage.getItem('complete_booking_data');
        console.log('LocalStorage booking data:', data ? JSON.parse(data) : null);
        return data ? JSON.parse(data) : null;
      },
      saveTestData: () => {
        const testData = {
          startDate: "2025-04-25",
          startTime: "10:00",
          endTime: "16:00",
          guestCount: 5,
          totalPrice: 450,
          basePrice: 400,
          serviceFee: 50,
          activityType: "Photo Shoot",
          projectName: "Test Project",
          renterCompany: "Test Company",
          projectDescription: "This is a test project description.",
        };
        localStorage.setItem('complete_booking_data', JSON.stringify(testData));
        console.log('Test data saved to localStorage');
        return testData;
      },
      reloadPage: () => {
        window.location.reload();
      },
      currentComponentState: {
        bookingDetails,
        locationData,
        id,
        locationLoading,
        locationError: locationError ? String(locationError) : null
      }
    };
    console.log('Debug helper attached to window.debugBooking');
  }, [bookingDetails, locationData, id, locationLoading, locationError]);

  if (!locationData || !bookingDetails) {
    console.error("Missing critical data:", { 
      hasLocationData: !!locationData, 
      hasBookingDetails: !!bookingDetails,
      locationId: id
    });
    
    // Don't redirect immediately - show what's missing
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Loading Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We're having trouble loading your booking data.</p>
                <div className="mt-4 p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre">
                  {JSON.stringify({
                    locationId: id,
                    hasLocationData: !!locationData,
                    locationDataError: locationData ? null : "Missing location data",
                    hasBookingDetails: !!bookingDetails,
                    bookingError: bookingDetails ? null : "Missing booking details",
                    windowLocationPath: window.location.pathname,
                    timestamp: new Date().toISOString()
                  }, null, 2)}
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button onClick={() => {
                    // Try to recover with test data
                    const testData = {
                      startDate: "2025-04-25",
                      startTime: "10:00",
                      endTime: "16:00",
                      guestCount: 5,
                      totalPrice: 450,
                      basePrice: 400,
                      serviceFee: 50,
                      activityType: "Photo Shoot",
                      projectName: "Test Project",
                      renterCompany: "Test Company",
                      projectDescription: "This is a test project description.",
                    };
                    setBookingDetails(testData);
                  }}>
                    Load Test Data (For Debugging)
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="mt-2" 
                    onClick={() => setLocation(`/locations/${id}`)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Simplified approach - just show static Stripe payment setup
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Navigate to the booking checkout page
  const handleProceedToPayment = () => {
    console.log("Button clicked, preparing to navigate to checkout");
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to complete this booking",
        variant: "destructive",
      });
      return;
    }
    
    if (!bookingDetails) {
      toast({
        title: "Missing Booking Details",
        description: "Booking information is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Save booking data to localStorage for the checkout page
    localStorage.setItem('complete_booking_data', JSON.stringify(bookingDetails));
    
    // Navigate to booking checkout page with URL parameters
    const params = new URLSearchParams({
      date: bookingDetails.startDate,
      startTime: bookingDetails.startTime,
      endTime: bookingDetails.endTime,
      guestCount: bookingDetails.guestCount.toString(),
      totalPrice: bookingDetails.totalPrice.toString(),
      basePrice: bookingDetails.basePrice.toString(),
      serviceFee: bookingDetails.serviceFee.toString()
    });
    
    console.log("Navigating to checkout with params:", params.toString());
    
    // Navigate to the checkout page
    window.location.href = `/locations/${id}/booking-checkout?${params.toString()}`;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation(`/locations/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to location
          </Button>

          {!user && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You need to be logged in to complete this booking. Please <a href="/auth" className="underline font-medium">sign in or create an account</a> before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {processError && (
            <Alert variant="destructive" className="mb-6">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Payment Error</AlertTitle>
              <AlertDescription>{processError}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <p>{locationData.title}</p>
                <p className="text-sm text-muted-foreground">{locationData.address}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Project Details</h3>
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Activity Type:</span> {bookingDetails.activityType}</p>
                  <p><span className="text-muted-foreground">Project Name:</span> {bookingDetails.projectName}</p>
                  <p><span className="text-muted-foreground">Renter/Company:</span> {bookingDetails.renterCompany}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">About Your Project</h3>
                <p className="text-sm whitespace-pre-wrap">{bookingDetails.projectDescription}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Date & Time</h3>
                <p>{format(new Date(bookingDetails.startDate), "MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground">
                  {bookingDetails.startTime} - {bookingDetails.endTime}
                </p>

              </div>

              <div>
                <h3 className="font-medium mb-2">Guests</h3>
                <p>{bookingDetails.guestCount} guests</p>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base price</span>
                    <span>${bookingDetails.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${bookingDetails.serviceFee}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total (USD)</span>
                    <span>${bookingDetails.totalPrice}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="card-footer flex flex-col space-y-4">
              <Button
                className="w-full"
                onClick={handleProceedToPayment}
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening Payment Window...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
              
              {paymentStatus === 'success' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payment Window Opened</AlertTitle>
                  <AlertDescription>
                    If your payment window didn't open automatically, please try clicking the button again or turn off any popup blockers.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Show booking debugging information */}
              <div className="text-xs text-muted-foreground mt-4">
                Booking ID: {locationData.id} | User: {user?.id || 'Not logged in'} | Status: {paymentStatus}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}