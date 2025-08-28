import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CalendarClock, Star } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ReviewForm } from './review-form';
import { formatDate } from '@/lib/utils';

type PendingReviewBooking = {
  id: number;
  locationId: number;
  startDate: string;
  endDate: string;
  status: string;
  // Enhanced fields from backend
  locationTitle?: string;
  locationImage?: string | null;
};

export function PendingReviews() {
  const [selectedBooking, setSelectedBooking] = useState<PendingReviewBooking | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: pendingReviews, isLoading, error, refetch } = useQuery<PendingReviewBooking[]>({
    queryKey: ['/api/user/pending-reviews'],
    queryFn: async () => {
      return apiRequest({ url: '/api/user/pending-reviews' });
    }
  });

  const handleLeaveReview = (booking: PendingReviewBooking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false);
    setSelectedBooking(null);
    // Refetch pending reviews to update the list
    refetch();
    // Invalidate any other related queries
    queryClient.invalidateQueries({ queryKey: ['/api/user/booking-eligibility'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Pending Reviews</h3>
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
        <h3 className="text-xl font-semibold">Pending Reviews</h3>
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
              You have {pendingReviews.length} completed {pendingReviews.length === 1 ? 'booking' : 'bookings'} that {pendingReviews.length === 1 ? 'needs' : 'need'} a review. 
              Please leave a review to help others and to continue making new bookings.
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
                  {booking.locationImage ? (
                    <img 
                      src={booking.locationImage} 
                      alt={booking.locationTitle || 'Location'} 
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{booking.locationTitle || 'Location'}</CardTitle>
                    <CardDescription>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="text-sm text-gray-600">
                  Share your experience to help other users find great locations.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  onClick={() => handleLeaveReview(booking)}
                  className="w-full"
                >
                  Leave Review
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
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {selectedBooking?.locationTitle}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <ReviewForm
              bookingId={selectedBooking.id}
              locationId={selectedBooking.locationId}
              locationName={selectedBooking.locationTitle || 'this location'}
              onSuccess={handleReviewSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}