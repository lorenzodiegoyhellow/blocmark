import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MessageCircle, ThumbsUp, Clock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewStats } from "@/components/reviews/review-stats";
import type { User as UserType } from "@shared/schema";

interface ReviewSectionProps {
  locationId: number;
  currentUser?: UserType;
  isOwner?: boolean;
}

interface ReviewWithUser {
  id: number;
  bookingId: number;
  locationId: number;
  userId: number;
  rating: number;
  reviewType: 'guest_to_host' | 'host_to_guest';
  content: string;
  cleanlinessRating?: number | null;
  helpful?: number | null;
  response?: string | null;
  responseDate?: string | null;
  createdAt: string;
  user?: UserType;
}

interface ReviewRequirement {
  bookingId: number;
  locationId: number;
  locationTitle: string;
  endDate: string;
  userRole: 'guest' | 'host';
  reviewType: 'guest_to_host' | 'host_to_guest';
}

export function ReviewSection({ locationId, currentUser, isOwner }: ReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedReviewType, setSelectedReviewType] = useState<'guest_to_host' | 'host_to_guest' | null>(null);
  const queryClient = useQueryClient();

  // Fetch reviews for this location
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ['/api/reviews/location', locationId],
    queryFn: () => apiRequest({ url: `/api/reviews/location/${locationId}` })
  });

  // Fetch user's review requirements if authenticated
  const { data: reviewRequirements = [], isLoading: requirementsLoading } = useQuery<ReviewRequirement[]>({
    queryKey: ['/api/reviews/requirements'],
    queryFn: () => apiRequest({ url: '/api/reviews/requirements' }),
    enabled: !!currentUser
  });

  // Get pending reviews for this specific location
  const pendingReviewsForLocation = reviewRequirements.filter(req => req.locationId === locationId);


  // Mutation for marking review as helpful
  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest({
        url: `/api/reviews/${reviewId}/helpful`,
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/location', locationId] });
    }
  });

  const handleStartReview = (requirement: ReviewRequirement) => {
    setSelectedBookingId(requirement.bookingId);
    setSelectedReviewType(requirement.reviewType);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setSelectedBookingId(null);
    setSelectedReviewType(null);
    queryClient.invalidateQueries({ queryKey: ['/api/reviews/location', locationId] });
    queryClient.invalidateQueries({ queryKey: ['/api/reviews/requirements'] });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const guestReviews = reviews.filter(review => review.reviewType === 'guest_to_host');
  const hostReviews = reviews.filter(review => review.reviewType === 'host_to_guest');

  if (reviewsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {guestReviews.length > 0 && <ReviewStats reviews={guestReviews} />}

      {/* Pending Review Requirements - Only show for guests, not for hosts viewing their own listing */}
      {currentUser && !isOwner && pendingReviewsForLocation.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              You have {pendingReviewsForLocation.length} pending review{pendingReviewsForLocation.length > 1 ? 's' : ''} for this location.
            </p>
            <div className="space-y-3">
              {pendingReviewsForLocation.map((requirement) => (
                <div key={requirement.bookingId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">
                      {requirement.userRole === 'guest' ? 'Review Your Stay' : 'Review Your Guest'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Booking completed on {formatDate(requirement.endDate)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleStartReview(requirement)}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Write Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && selectedBookingId && selectedReviewType && (
        <ReviewForm
          bookingId={selectedBookingId}
          locationId={locationId}
          reviewType={selectedReviewType}
          onSuccess={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Guest Reviews Section */}
      {guestReviews.length > 0 && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            {guestReviews.map((review, index) => (
              <div key={review.id}>
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user?.profileImage} alt={review.user?.username || 'User'} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user?.username || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => helpfulMutation.mutate(review.id)}
                        disabled={helpfulMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {(review.helpful || 0) > 0 && <span>{review.helpful}</span>}
                      </Button>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="pl-12">
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                    
                    {/* Cleanliness Rating */}
                    {review.cleanlinessRating && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm font-medium">Cleanliness:</span>
                        <div className="flex">{renderStars(review.cleanlinessRating)}</div>
                      </div>
                    )}

                    {/* Host Response */}
                    {review.response && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-600">Host Response</span>
                          {review.responseDate && (
                            <span className="text-xs text-gray-500">
                              {formatDate(review.responseDate)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{review.response}</p>
                      </div>
                    )}
                  </div>
                </div>
                {index < guestReviews.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Reviews Message */}
      {reviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">
              Be the first to book this location and leave a review!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}