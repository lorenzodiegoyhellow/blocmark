import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { NoReviewsAlert } from '@/components/no-reviews-alert';

type Review = {
  id: number;
  userId: number;
  locationId: number;
  bookingId: number;
  rating: number;
  review: string;
  title: string;
  helpful: number;
  createdAt: string;
  response?: string;
  responseDate?: string;
  // Enhanced fields from backend
  username?: string;
  userImage?: string | null;
};

interface ReviewsListProps {
  locationId: number;
  locationOwnerId?: number;
}

export function ReviewsList({ locationId, locationOwnerId }: ReviewsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [responseText, setResponseText] = React.useState('');
  const [respondingToReviewId, setRespondingToReviewId] = React.useState<number | null>(null);
  const [submittingResponse, setSubmittingResponse] = React.useState(false);

  const { data: reviews, isLoading, error, refetch } = useQuery<Review[]>({
    queryKey: ['/api/reviews', locationId],
    queryFn: async () => {
      return apiRequest({ url: `/api/reviews/${locationId}` });
    },
  });

  const isLocationOwner = user?.id === locationOwnerId;

  async function handleMarkHelpful(reviewId: number) {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to mark reviews as helpful.',
      });
      return;
    }

    try {
      await apiRequest({
        url: `/api/reviews/${reviewId}/helpful`,
        method: 'POST',
      });
      refetch();
      toast({
        title: 'Thanks for your feedback!',
        description: 'You marked this review as helpful.',
      });
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark review as helpful. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmitResponse(reviewId: number) {
    if (!user || !isLocationOwner) {
      toast({
        title: 'Unauthorized',
        description: 'Only the location owner can respond to reviews.',
        variant: 'destructive',
      });
      return;
    }

    if (!responseText.trim()) {
      toast({
        title: 'Response required',
        description: 'Please write a response before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingResponse(true);
    try {
      await apiRequest({
        url: `/api/reviews/${reviewId}/response`,
        method: 'POST',
        data: { response: responseText },
      });
      
      refetch();
      setResponseText('');
      setRespondingToReviewId(null);
      
      toast({
        title: 'Response submitted',
        description: 'Your response has been added to the review.',
      });
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingResponse(false);
    }
  }

  function formatDate(dateString: string) {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    // If we're on a location details page, don't show an error message at all
    if (locationId) {
      return null;
    }
    
    // For other pages, show a simple error message
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h3 className="font-semibold">Error loading reviews</h3>
        <p>We couldn't load the reviews. Please try again later.</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    // For location details page, show a detailed prompt
    if (locationId) {
      return (
        <NoReviewsAlert 
          locationId={locationId}
          variant="detailed"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none"
        />
      );
    }
    
    // For other contexts like user profiles or review lists, show a more compact message
    return (
      <NoReviewsAlert 
        variant="profile"
        locationName="location"
      />
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="mb-4">
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={review.userImage || undefined} />
                    <AvatarFallback>{(review.username || 'U')[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{review.title}</CardTitle>
                    <CardDescription>
                      {review.username || 'Anonymous'} • {formatDate(review.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{review.review}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkHelpful(review.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful {review.helpful > 0 && `(${review.helpful})`}
              </Button>
              
              {isLocationOwner && !review.response && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRespondingToReviewId(review.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Respond
                </Button>
              )}
            </CardFooter>

            {/* Owner Response Section */}
            {review.response && (
              <div className="bg-gray-50 p-4 mx-4 mb-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-blue-600 bg-blue-50">
                    Owner Response
                  </Badge>
                  {review.responseDate && (
                    <span className="text-xs text-gray-500">{formatDate(review.responseDate)}</span>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{review.response}</p>
              </div>
            )}

            {/* Response Form */}
            {respondingToReviewId === review.id && (
              <div className="p-4 mx-4 mb-4 border-t">
                <h4 className="font-medium mb-2">Respond to this review</h4>
                <Textarea
                  placeholder="Write your response..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="mb-3"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRespondingToReviewId(null);
                      setResponseText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitResponse(review.id)}
                    disabled={submittingResponse}
                  >
                    {submittingResponse ? 'Submitting...' : 'Submit Response'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}