import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User,
  Users,
  Clock,
  AlertTriangle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { PendingReviews } from "@/components/pending-reviews";
import { BookingStatusTabs, BookingStatusFilter, filterBookingsByStatus } from "@/components/bookings/booking-status-tabs";
import { BookingCard } from "@/components/bookings/booking-card";
import { CustomOfferBookingCard } from "@/components/bookings/custom-offer-booking-card";

export default function ClientDashboardNew() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [, navigate] = useLocation();
  
  // Get user bookings (as a client)
  const { 
    data: clientBookings, 
    isLoading: clientBookingsLoading,
    error: clientBookingsError
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/user"],
    enabled: !!user?.id,
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes 
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });
  
  // Get pending custom offers
  const { 
    data: pendingCustomOffers, 
    isLoading: customOffersLoading,
    error: customOffersError
  } = useQuery({
    queryKey: ["/api/messages/custom-offers/pending"],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      setBookingToCancel(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  // Check if the user is authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                You need to log in to view your bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Please log in to access your bookings and account information.</p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Log In or Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (clientBookingsLoading || customOffersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Check for errors and show error message
  if (clientBookingsError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Error Loading Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>There was a problem loading your booking data. Please try again later.</p>
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
                }} 
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Handler functions
  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id);
    }
  };

  // Status filtering state
  const [activeStatus, setActiveStatus] = useState<BookingStatusFilter>("all");
  
  // Organize bookings by status using the filter function from BookingStatusTabs
  const filteredBookings = filterBookingsByStatus(clientBookings || [], activeStatus);
  
  // Count bookings that need reviews (completed bookings without reviews)
  const pendingReviewsCount = clientBookings?.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) < new Date()
  ).length || 0;
  
  // Count pending bookings including custom offers
  const pendingBookingsCount = clientBookings?.filter(booking => 
    booking.status === "pending"
  ).length || 0;
  const pendingOffersCount = pendingCustomOffers?.length || 0;
  const pendingCount = pendingBookingsCount + pendingOffersCount;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your bookings and view their status
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary" /> 
                Upcoming Bookings Summary
              </CardTitle>
              <CardDescription>
                Your upcoming reservations and booking status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold">
                      {clientBookings?.filter(b => b.status === "pending").length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                    <p className="text-xl font-bold">
                      {clientBookings?.filter(b => b.status === "confirmed").length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                  <DollarSign className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-xl font-bold">
                      ${clientBookings
                        ?.filter(b => b.status === "confirmed")
                        .reduce((sum, booking) => sum + booking.totalPrice, 0)
                        .toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Booking Status Tabs Component */}
        <BookingStatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          pendingCount={pendingCount}
          isHost={false}
        />
        
        <div className="mt-8">
          {/* Content based on selected status */}
          {filteredBookings.length === 0 && (activeStatus !== 'pending' || pendingOffersCount === 0) ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium mb-1">No {activeStatus === "all" ? "" : activeStatus} Bookings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any {activeStatus === "all" ? "" : activeStatus} bookings at the moment.
                  </p>
                  <Button onClick={() => navigate('/search-results')}>
                    Find Locations to Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Show custom offers first if in pending tab */}
              {activeStatus === 'pending' && pendingCustomOffers && pendingCustomOffers.length > 0 && (
                <>
                  {pendingCustomOffers.map((offer) => (
                    <CustomOfferBookingCard 
                      key={`offer-${offer.id}`}
                      offer={offer}
                    />
                  ))}
                </>
              )}
              
              {/* Then show regular bookings */}
              {filteredBookings.map((booking) => (
                <BookingCard 
                  key={booking.id}
                  booking={booking}
                  isHost={false}
                  onCancel={() => handleCancelBooking(booking)}
                  showCancelButton={booking.status === "pending"}
                  showReviewButton={booking.status === "confirmed" && new Date(booking.endDate) < new Date()}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Pending Reviews Section (Always present but hidden when not selected) */}
        {pendingReviewsCount > 0 && activeStatus === "completed" && (
          <div className="mt-8">
            <div className="mb-4 p-4 bg-rose-50 rounded-lg border border-rose-100">
              <h3 className="font-medium text-rose-800 mb-1 flex items-center">
                <Star className="h-4 w-4 mr-2 text-rose-600" />
                Pending Reviews
              </h3>
              <p className="text-sm text-rose-700">
                Please complete reviews for your past bookings.
              </p>
            </div>
            <PendingReviews />
          </div>
        )}
      </div>

      {/* Confirmation dialog for cancelling a booking */}
      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {bookingToCancel && (
              <div className="space-y-2 text-sm">
                <p><strong>Booking ID:</strong> {bookingToCancel.id}</p>
                <p><strong>Date:</strong> {format(new Date(bookingToCancel.startDate), "MMMM d, yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(bookingToCancel.startDate), "h:mm a")} - {format(new Date(bookingToCancel.endDate), "h:mm a")}</p>
                <p><strong>Amount:</strong> ${(bookingToCancel.totalPrice / 100).toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBookingToCancel(null)}
            >
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelBooking}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}