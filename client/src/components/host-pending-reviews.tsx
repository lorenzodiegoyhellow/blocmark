import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CalendarClock, Star, User } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ReviewForm } from './review-form';
import { formatDate } from '@/lib/utils';

type PendingHostReviewBooking = {
  id: number;
  locationId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  status: string;
  // Enhanced fields from backend
  locationTitle?: string;
  locationImage?: string | null;
  clientName?: string;
  clientImage?: string | null;
};

export function HostPendingReviews() {
  const [selectedBooking, setSelectedBooking] = useState<PendingHostReviewBooking | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: pendingReviews, isLoading, error, refetch } = useQuery<PendingHostReviewBooking[]>({
    queryKey: ['/api/reviews/host/pending'],
    queryFn: async () => {
      return apiRequest({ url: '/api/reviews/host/pending' });
    }
  });

  const handleLeaveReview = (booking: PendingHostReviewBooking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false);
    setSelectedBooking(null);
    // Invalidate the host pending reviews query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['/api/reviews/host/pending'] });
    // Also invalidate any other related queries
    queryClient.invalidateQueries({ queryKey: ['/api/user/booking-eligibility'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Pending Guest Reviews</h3>
        {[1, 2].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h3 className="font-semibold">Error loading pending reviews</h3>
        <p>We couldn't load your pending reviews. Please try again later.</p>
      </div>
    );
  }

  if (!pendingReviews || pendingReviews.length === 0) {
    return null; // Don't show anything if there are no pending reviews
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold">Pending Guest Reviews</h3>
        <Badge variant="destructive" className="ml-2">
          {pendingReviews.length} Remaining
        </Badge>
      </div>
      
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
        <div className="flex items-start gap-3">
          <CalendarClock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Action required</p>
            <p className="text-amber-700 text-sm">
              You have {pendingReviews.length} recent {pendingReviews.length === 1 ? 'guest' : 'guests'} who {pendingReviews.length === 1 ? 'needs' : 'need'} a review. 
              Please leave a review to help build trust in our community.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {pendingReviews.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <div className="flex h-full flex-col">
              <CardHeader className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    {booking.clientImage ? (
                      <img 
                        src={booking.clientImage} 
                        alt={booking.clientName || 'Guest'} 
                        className="h-12 w-12 object-cover rounded-full mb-1"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <span className="text-xs text-gray-600">Guest</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{booking.clientName || 'Guest'}</CardTitle>
                    <CardDescription className="text-sm">
                      Stayed at {booking.locationTitle}
                    </CardDescription>
                    <CardDescription className="text-xs">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </CardDescription>
                  </div>
                  {booking.locationImage && (
                    <img 
                      src={booking.locationImage} 
                      alt={booking.locationTitle || 'Location'} 
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="text-sm text-gray-600">
                  Share your experience hosting this guest to help other hosts.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  onClick={() => handleLeaveReview(booking)}
                  className="w-full"
                >
                  Review Guest
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Your Guest</DialogTitle>
            <DialogDescription>
              Share your experience hosting {selectedBooking?.clientName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <ReviewForm
              bookingId={selectedBooking.id}
              locationId={selectedBooking.locationId}
              locationName={selectedBooking.locationTitle || 'your property'}
              reviewType="host_to_guest"
              guestName={selectedBooking.clientName}
              onSuccess={handleReviewSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}