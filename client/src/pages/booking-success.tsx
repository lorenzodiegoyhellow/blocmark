import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, ArrowRight, Calendar, MapPin, Users, Info, DollarSign, MessageSquare, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Booking, Location } from "@shared/schema";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function BookingSuccessPage() {
  const [location, setLocation] = useLocation();
  
  // Extract booking ID from multiple possible sources in order of preference
  // 1. From standard query parameters (most common case)
  const params = new URLSearchParams(location.split('?')[1] || '');
  const urlBookingId = params.get('booking_id');
  
  // 2. From hash fragment (sometimes Stripe appends to hash instead of query)
  const hashParams = location.includes('#') 
    ? new URLSearchParams(location.split('#')[1]?.split('?')[1] || '') 
    : new URLSearchParams('');
  const hashBookingId = hashParams.get('booking_id');
  
  // 3. From more complex hash structure (seen in some Stripe redirects)
  const complexHashBookingId = location.includes('#') && location.includes('booking_id=')
    ? location.split('booking_id=')[1]?.split('&')[0] 
    : null;
  
  // 4. From localStorage as another fallback layer
  const localStorageBookingId = typeof window !== 'undefined' ? localStorage.getItem('last_booking_id') : null;
  
  // 5. Try to extract just any number from the URL as a last-ditch effort
  const numbersInUrl = location.match(/\d+/g);
  const possibleIdFromUrl = numbersInUrl && numbersInUrl.length > 0 ? numbersInUrl[0] : null;
  
  // Use the first available booking ID from any source in priority order
  const bookingId = urlBookingId || hashBookingId || complexHashBookingId || localStorageBookingId || possibleIdFromUrl;
  
  // Debug all sources with comprehensive logging
  console.log("Booking sources (all discovery methods):", {
    url: urlBookingId,
    hash: hashBookingId,
    complexHash: complexHashBookingId,
    localStorage: localStorageBookingId,
    numbersInUrl: possibleIdFromUrl,
    finalBookingId: bookingId
  });
  
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [progressValue, setProgressValue] = useState(10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log("Booking-success: URL being processed:", location);
  console.log("Booking-success: URL parameters:", Object.fromEntries(params.entries()));
  console.log("Booking-success: urlBookingId:", urlBookingId);
  console.log("Booking-success: localStorageBookingId:", localStorageBookingId);
  console.log("Booking-success: final bookingId used:", bookingId);
  
  // Clean up localStorage after successful usage to prevent future conflicts
  useEffect(() => {
    if (bookingId && localStorageBookingId) {
      console.log("Clearing localStorage booking ID after successful usage");
      localStorage.removeItem('last_booking_id');
    }
  }, [bookingId, localStorageBookingId]);
  
  // If there's no booking ID, don't redirect immediately - show an error message
  useEffect(() => {
    if (!bookingId) {
      toast({
        title: "Missing booking information",
        description: "We couldn't find your booking details.",
        variant: "destructive",
      });
    }
  }, [bookingId, toast]);
  
  // Fetch the booking details with aggressive retrying
  const { 
    data: booking, 
    isLoading: isLoadingBooking, 
    error: bookingError,
    refetch: refetchBooking 
  } = useQuery({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
    retry: 5,  // Increased retry count
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2000 : 1000, 10000),  // Exponential backoff
    refetchInterval: retryCount < 6 ? 2500 : false, // Retry every 2.5 seconds for 6 times
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data always stale to force refetching
    queryFn: async ({ queryKey }) => {
      try {
        // Get clientId from localStorage as fallback
        const clientId = localStorage.getItem('user_id');
        
        // Create request URL with clientId as query parameter for fallback auth
        const url = clientId 
          ? `${queryKey[0]}?clientId=${encodeURIComponent(clientId)}` 
          : queryKey[0] as string;
        
        console.log(`Fetching booking details with URL: ${url}`);
        
        // Try server-side authenticated request with clientId fallback parameter
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (res.ok) {
          return await res.json();
        } else {
          throw new Error(`Failed to fetch booking: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        throw err;
      }
    }
  });
  
  // Update retry count and completion state based on query results
  useEffect(() => {
    if (booking) {
      setRetryCount(0);
      setInitialLoadComplete(true);
    } else if (bookingError) {
      setRetryCount(prev => prev + 1);
      // Mark as complete after several retries even if it failed
      if (retryCount >= 5) {
        setInitialLoadComplete(true);
      }
    }
  }, [booking, bookingError, retryCount]);
  
  // Fetch location details
  const { 
    data: locationData, 
    isLoading: isLoadingLocation,
    error: locationError,
    refetch: refetchLocation
  } = useQuery({
    queryKey: [`/api/locations/${booking?.locationId}`],
    enabled: !!booking?.locationId,
    retry: 3,
    refetchOnWindowFocus: true,
    queryFn: async ({ queryKey }) => {
      try {
        // Get clientId from localStorage as fallback
        const clientId = localStorage.getItem('user_id');
        
        // Create request URL with clientId as query parameter for fallback auth
        const url = clientId 
          ? `${queryKey[0]}?clientId=${encodeURIComponent(clientId)}` 
          : queryKey[0] as string;
        
        console.log(`Fetching location details with URL: ${url}`);
        
        // Try server-side authenticated request with clientId fallback parameter
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (res.ok) {
          return await res.json();
        } else {
          throw new Error(`Failed to fetch location: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        throw err;
      }
    }
  });

  // Set up progress bar animation for loading state
  useEffect(() => {
    if (isLoadingBooking || isLoadingLocation) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else {
      setProgressValue(100);
    }
  }, [isLoadingBooking, isLoadingLocation]);
  
  // Invalidate dashboard queries to ensure they're refreshed when user goes to dashboard
  useEffect(() => {
    if (booking) {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user'] });
    }
  }, [booking, queryClient]);
  
  // Show success toast when booking data loads and ensure user_id is saved
  useEffect(() => {
    if (booking && locationData) {
      // Show confirmation toast
      toast({
        title: "Payment successful!",
        description: `Your booking for ${locationData.title} has been confirmed.`,
      });
      
      // Ensure user_id is saved in localStorage for fallback authentication
      if (user?.id) {
        console.log("Saving user ID to localStorage after successful booking:", user.id);
        localStorage.setItem('user_id', user.id.toString());
      } else if (booking.clientId) {
        console.log("Saving client ID from booking to localStorage:", booking.clientId);
        localStorage.setItem('user_id', booking.clientId.toString());
      }
      
      // Also save the booking ID for reference
      localStorage.setItem('last_booking_id', booking.id.toString());
    }
  }, [booking, locationData, toast, user]);
  
  const handleMessageHost = () => {
    if (!user || !booking || !locationData) return;
    
    // Navigate to messages with pre-filled booking details
    setLocation(`/messages?otherUserId=${locationData.ownerId}&locationId=${booking.locationId}`);
  };
  
  const handleManualRefresh = () => {
    refetchBooking();
    if (booking?.locationId) {
      refetchLocation();
    }
    toast({
      title: "Refreshing booking data",
      description: "Please wait while we try to retrieve your booking again."
    });
  };
  
  // If we're still in the initial loading state, show an enhanced loading UI
  if ((isLoadingBooking || isLoadingLocation) && !initialLoadComplete) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Processing Your Booking</CardTitle>
            <CardDescription>
              We're retrieving your booking information. This might take up to 30 seconds...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Retrieving booking #{bookingId}</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                If this is taking longer than expected, your payment might still be processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If there was an error but we completed initial loading attempts
  if ((bookingError || locationError) && initialLoadComplete) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error retrieving booking information</AlertTitle>
          <AlertDescription>
            We encountered a problem while retrieving your booking details. This could be due to a temporary system issue.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Booking Reference</CardTitle>
            <CardDescription className="text-center">
              For your reference, your booking ID is: {bookingId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>If you've just completed payment, please be assured that your booking has been recorded. You can view it in your dashboard.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleManualRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry Loading Booking
              </Button>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setLocation("/")}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If we've tried loading but couldn't find the booking
  if ((!booking || !locationData) && initialLoadComplete) {
    // Try to query user bookings as a fallback to find the most recent one
    useEffect(() => {
      if (!booking && user && retryCount >= 3) {
        // Get all user bookings after several retries
        const checkUserBookings = async () => {
          try {
            const response = await fetch('/api/bookings/user');
            if (response.ok) {
              const userBookings = await response.json();
              // Find the most recent pending booking
              const recentBooking = userBookings
                .filter((b: any) => b.status === 'pending' || b.status === 'confirmed')
                .sort((a: any, b: any) => b.id - a.id)[0];
                
              if (recentBooking) {
                console.log("Found recent booking as fallback:", recentBooking);
                // Navigate to the proper booking success URL
                setLocation(`/booking-success?booking_id=${recentBooking.id}`);
              }
            }
          } catch (error) {
            console.error("Error fetching user bookings:", error);
          }
        };
        
        checkUserBookings();
      }
    }, [booking, user, retryCount, setLocation]);
    
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Booking Information</CardTitle>
            <CardDescription className="text-center">
              We couldn't find this booking. If you've just completed payment, it may take a moment to process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your payment might still be processing. Please check your dashboard in a few minutes to see your booking.
                {bookingId && <p className="mt-2 font-semibold">Booking ID: {bookingId}</p>}
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button 
                onClick={handleManualRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh Booking Data
              </Button>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/dashboard")}
              >
                Check Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setLocation("/")}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If we don't have a booking ID at all (invalid URL), try to auto-recover
  if (!bookingId) {
    // Immediate autorecovery - fetch latest pending booking
    useEffect(() => {
      // This special function tries multiple methods to recover the booking
      const autoRecoverBooking = async () => {
        if (user) {
          try {
            console.log("Auto-recovering booking from user dashboard");
            
            // First check for any locally stored booking ID
            const storedId = localStorage.getItem('last_booking_id');
            if (storedId && storedId !== 'null') {
              console.log("Found stored booking ID in localStorage:", storedId);
              
              // Clear the stored ID to prevent infinite loops
              localStorage.removeItem('last_booking_id');
              
              // Navigate directly to success page with the recovered ID
              setLocation(`/booking-success?booking_id=${storedId}`);
              return;
            }
            
            // If no localStorage data, try to get the most recent booking from the API
            console.log("Attempting to fetch most recent booking from server");
            const response = await fetch('/api/bookings/user');
            if (response.ok) {
              const userBookings = await response.json();
              // Find the most recent pending or confirmed booking (within the last hour)
              const oneHourAgo = new Date();
              oneHourAgo.setHours(oneHourAgo.getHours() - 1);
              
              const recentBookings = userBookings
                .filter((b: any) => (b.status === 'pending' || b.status === 'confirmed' || b.status === 'payment_pending'))
                .sort((a: any, b: any) => b.id - a.id);
              
              const recentBooking = recentBookings[0];
                
              if (recentBooking) {
                console.log("Found recent booking for auto-recovery:", recentBooking);
                toast({
                  title: "Found your booking",
                  description: "We found your most recent booking and are loading the details.",
                });
                // Navigate to the proper booking success URL
                setLocation(`/booking-success?booking_id=${recentBooking.id}`);
                return;
              } else {
                console.log("No recent bookings found for recovery");
                toast({
                  title: "No recent bookings found",
                  description: "We couldn't find any recent bookings. Please check your dashboard.",
                  variant: "destructive"
                });
              }
            }
          } catch (error) {
            console.error("Error auto-recovering booking:", error);
          }
        } else {
          console.log("User not authenticated, cannot recover booking");
          toast({
            title: "Authentication required",
            description: "Please log in to view your booking details",
            variant: "destructive"
          });
        }
      };
      
      // Execute recovery with a small delay to give localStorage time to sync
      const timeoutId = setTimeout(() => {
        autoRecoverBooking();
      }, 300);
      
      // Stop trying after 5 seconds and show fallback UI
      const fallbackTimeout = setTimeout(() => {
        console.log("Auto-recovery timeout reached, showing fallback UI");
        setInitialLoadComplete(true);
      }, 5000);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(fallbackTimeout);
      };
    }, [user, setLocation, toast]);
    
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Missing Booking Information</CardTitle>
            <CardDescription className="text-center">
              We couldn't find a booking ID in your URL. If you just made a payment, please check your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We're trying to auto-recover your most recent booking. Please wait...
              </AlertDescription>
            </Alert>
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => setLocation("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation("/")}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If we have both booking and location data, show the success page
  if (booking && locationData) {
    // Format date
    const startDate = new Date(booking.startDate as string);
    const endDate = new Date(booking.endDate as string);
    
    // Format time
    const startTime = format(startDate, "h:mm a");
    const endTime = format(endDate, "h:mm a");
    
    // Format date
    const bookingDate = format(startDate, "MMMM d, yyyy");
    
    // Determine UI based on booking status
    const isPending = booking.status === 'pending' || booking.status === 'payment_pending';
    const isConfirmed = booking.status === 'confirmed';
    
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card className={`${isPending ? 'border-amber-200' : 'border-green-200'} overflow-hidden`}>
          <div className={`${isPending ? 'bg-amber-50' : 'bg-green-50'} py-4`}>
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto w-14 h-14 rounded-full ${isPending ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center mb-4`}>
                {isPending ? (
                  <AlertCircle className="text-amber-600 h-7 w-7" />
                ) : (
                  <CheckCircle className="text-green-600 h-7 w-7" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isPending ? 'Payment Successful!' : 'Booking Confirmed!'}
              </CardTitle>
              <CardDescription>
                {isPending 
                  ? 'Your payment has been processed. Your booking is now pending host approval.'
                  : 'Thank you for booking with us. Your reservation has been confirmed.'
                }
              </CardDescription>
            </CardHeader>
          </div>
          
          <CardContent className="space-y-6 pt-6">
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="font-semibold">{locationData.title}</p>
                  <p className="text-sm text-muted-foreground">{locationData.address}</p>
                  {isConfirmed && (
                    <p className="text-xs font-medium text-green-600 mt-1">
                      ✓ Exact address is now available since your booking is confirmed
                    </p>
                  )}
                  {isPending && (
                    <p className="text-xs font-medium text-amber-600 mt-1">
                      ⏳ Full address details will be available once the host approves your booking
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Date & Time</h3>
                  <p className="font-semibold">{bookingDate}</p>
                  <p className="text-sm text-muted-foreground">{startTime} to {endTime}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Info className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Project</h3>
                  <p className="font-semibold">{booking.projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.activityType}
                    {booking.renterCompany && <> • {booking.renterCompany}</>}
                  </p>
                </div>
              </div>
              
              {booking.guestCount > 0 && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Guests</h3>
                    <p className="font-semibold">{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start pt-2 border-t">
                <DollarSign className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">Payment</h3>
                  <div className="flex justify-between w-full">
                    <p className="font-semibold">Total Paid</p>
                    <p className="font-semibold">${(booking.totalPrice / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {isPending && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <strong>Next Steps:</strong> The property host will review your booking request. 
                  You'll receive a notification when they respond. This typically happens within 24 hours.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Check-in Instructions - Only show for confirmed bookings */}
            {isConfirmed && locationData.checkInInstructions && (
              <div className="border rounded-md p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-2">Check-in Instructions</h3>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{locationData.checkInInstructions}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setLocation("/dashboard")}
              >
                View All Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleMessageHost}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Host
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setLocation("/")}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50 px-6 py-4 flex flex-col items-center">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p className="font-medium">
                {isPending ? `Booking Request #${booking.id}` : `Confirmation #${booking.id}`}
              </p>
              <p>
                {isPending 
                  ? 'A payment confirmation email has been sent to your registered email address.'
                  : 'A confirmation email has been sent to your registered email address.'
                }
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Fallback loading state (should rarely be shown)
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Loading Your Booking</CardTitle>
          <CardDescription>
            Please wait while we retrieve your booking information...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}