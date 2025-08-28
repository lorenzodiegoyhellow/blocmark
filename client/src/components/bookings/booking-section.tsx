import React from "react";
import { useLocation } from "wouter";
import { Location, Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { InfoIcon, Calendar, Zap, Clock, AlertTriangle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from 'date-fns';

export function BookingSection({ location }: { location: Location }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEligible, setIsEligible] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Fetch eligibility data
  const { data: eligibilityData } = useQuery({
    queryKey: ['/api/user/booking-eligibility'],
    queryFn: async () => {
      return apiRequest({ url: '/api/user/booking-eligibility' });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
  
  // Fetch pending bookings for this location
  const { data: pendingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/locations/${location.id}/pending-bookings`],
    queryFn: async () => {
      return apiRequest({ url: `/api/locations/${location.id}/pending-bookings` });
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  // Update eligibility state when data changes
  React.useEffect(() => {
    if (eligibilityData) {
      setIsEligible(eligibilityData.eligible);
    }
  }, [eligibilityData]);
  
  // Check if the current user is the owner of this location
  const isOwner = user?.id === location.ownerId;
  
  // Handle booking button click - go to new booking checkout page
  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book this location",
        variant: "destructive"
      });
      return;
    }
    
    if (!isEligible && eligibilityData) {
      // Show dialog instead of toast
      setShowReviewDialog(true);
      return;
    }
    
    // Navigate to the new comprehensive booking page
    navigate(`/locations/${location.id}/booking-checkout`);
  };

  return (
    <div id="booking" className="space-y-6">
      {/* Pending bookings warning */}
      {pendingBookings && pendingBookings.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              Location has pending bookings on hold
            </p>
            <p className="text-xs text-amber-700">
              The following dates are temporarily unavailable while waiting for host approval:
            </p>
            <ul className="text-xs text-amber-700 space-y-0.5 mt-2">
              {pendingBookings.map((booking) => (
                <li key={booking.id}>
                  • {format(new Date(booking.startDate), 'MMM d, yyyy')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Instant Book indicator - show at the top if enabled */}
      {location.instantBooking && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <Zap className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-800">⚡ Instant Book - No approval needed</span>
        </div>
      )}
      
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">Starting from ${location.price}</span>
          <span className="text-muted-foreground">/hr</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {location.minHours || 1} {(location.minHours || 1) > 1 ? 'hrs.' : 'hr.'} minimum
        </div>
        
        {/* Booking Buffer indicator */}
        {location.bookingBuffer > 0 && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{location.bookingBuffer} minute buffer between bookings</span>
          </div>
        )}
      </div>

      {isOwner ? (
        <div className="flex items-center p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-700">
          <InfoIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">You cannot book your own location</span>
        </div>
      ) : (
        <div className="flex flex-col">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleBooking}
            variant="default"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reserve
          </Button>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Exact address will be revealed after booking is confirmed
          </p>
        </div>
      )}
      
      {/* Review requirement dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Complete Your Reviews First
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-3">
              <p>You need to complete your pending reviews before making new bookings.</p>
              {eligibilityData && (
                <p className="font-medium">
                  You have {eligibilityData.pendingReviews} pending {eligibilityData.pendingReviews === 1 ? 'review' : 'reviews'} to complete.
                </p>
              )}
              <p className="text-sm">This helps maintain trust and quality in our community.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowReviewDialog(false);
                navigate("/dashboard");
              }}
              className="bg-primary"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
