import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VerifiedAvatar } from '@/components/ui/verified-avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  booking: {
    id: number;
    locationId: number;
    locationTitle?: string;
  };
  reviewer: {
    id: number;
    username: string;
    profileImage?: string | null;
  };
}

interface GuestReviewsProps {
  userId: number;
}

export function GuestReviews({ userId }: GuestReviewsProps) {
  const { data: reviews, isLoading } = useQuery<GuestReview[]>({
    queryKey: [`/api/users/${userId}/guest-reviews`],
    queryFn: async () => {
      return apiRequest({ url: `/api/users/${userId}/guest-reviews` });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Reviews as Guest</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
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
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Reviews as Guest</h2>
        <p className="text-muted-foreground text-center py-8">
          No reviews received yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reviews as Guest</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <VerifiedAvatar
                    src={review.reviewer.profileImage || undefined}
                    alt={review.reviewer.username}
                    fallback={review.reviewer.username.slice(0, 2).toUpperCase()}
                    isVerified={false}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold">{review.reviewer.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Host at {review.booking.locationTitle || 'Location'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}