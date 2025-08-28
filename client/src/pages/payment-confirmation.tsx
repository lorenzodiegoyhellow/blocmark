import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

/**
 * This is a simple standalone payment confirmation page
 * It doesn't rely on URL parameters or complex redirects
 * Instead, it just shows a success message and links to view bookings
 */
export default function PaymentConfirmation() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment-confirmation/:bookingId");
  const bookingId = params?.bookingId;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Fetch booking data to determine if it's instant booking
  const { data: booking } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    enabled: !!bookingId,
  });

  // Fetch location data if we have a booking
  const { data: location } = useQuery({
    queryKey: ["/api/locations", booking?.locationId],
    enabled: !!booking?.locationId,
  });

  useEffect(() => {
    // Determine the appropriate success message based on booking type
    let description = "Your booking is pending approval from the owner.";
    let title = "Payment Successful!";
    
    if (location?.instantBooking || booking?.status === 'confirmed') {
      description = "Your instant booking has been confirmed!";
      title = "Booking Confirmed!";
    } else if (booking?.activity?.toLowerCase().includes("custom offer")) {
      description = "Your custom offer booking has been confirmed!";
      title = "Booking Confirmed!";
    }

    // Show success message
    toast({
      title,
      description,
      duration: 5000,
    });

    // Save booking ID to local storage as a fallback
    if (bookingId) {
      localStorage.setItem("last_booking_id", bookingId);
    }
    
    // Invalidate the bookings queries to refresh data on dashboard
    queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
    
    console.log("Booking queries invalidated after successful payment");

    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [toast, bookingId, location?.instantBooking, booking?.status, booking?.activity]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-10 px-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {location?.instantBooking || booking?.status === 'confirmed' ? 'Booking Confirmed!' : 'Payment Successful - Booking Pending'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg">
              Your payment was successful. Thank you!
            </p>
            {loading ? (
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 mt-4">
                {location?.instantBooking || booking?.status === 'confirmed' ? (
                  <p>Your booking has been automatically confirmed! You can start planning your visit.</p>
                ) : booking?.activity?.toLowerCase().includes("custom offer") ? (
                  <p>Your custom offer booking has been confirmed!</p>
                ) : (
                  <p>Your booking is pending. We will notify you when the location owner accepts the booking.</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => setLocation("/dashboard")} 
              className="w-full"
            >
              View My Bookings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Footer section */}
      <div className="mt-auto border-t pt-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            © 2025 Blocmark. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/terms" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Terms</a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Privacy</a>
            <a href="/sitemap" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Sitemap</a>
            <a href="/accessibility" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Accessibility</a>
          </div>
        </div>
      </div>
    </div>
  );
}