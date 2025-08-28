import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Users, ThumbsUp } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  cleanlinessRating?: number | null;
  helpful?: number | null;
  reviewType: string;
  createdAt: string;
}

interface ReviewStatsProps {
  reviews: Review[];
}

export function ReviewStats({ reviews }: ReviewStatsProps) {
  const guestReviews = reviews.filter(review => review.reviewType === 'guest_to_host');
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return null;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  // Calculate average cleanliness rating from guest reviews
  const cleanlinessReviews = guestReviews.filter(review => review.cleanlinessRating);
  const averageCleanlinessRating = cleanlinessReviews.length > 0
    ? cleanlinessReviews.reduce((sum, review) => sum + (review.cleanlinessRating || 0), 0) / cleanlinessReviews.length
    : null;

  // Calculate total helpful votes
  const totalHelpfulVotes = reviews.reduce((sum, review) => sum + (review.helpful || 0), 0);

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const renderStars = (rating: number, size: string = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 
          i < rating ? 'fill-yellow-200 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Review Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-1">
              {renderStars(averageRating)}
            </div>
            <div className="text-sm text-gray-600">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cleanliness Rating */}
          {averageCleanlinessRating && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Cleanliness</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {averageCleanlinessRating.toFixed(1)}
              </div>
              <div className="flex justify-center">
                {renderStars(averageCleanlinessRating, "w-3 h-3")}
              </div>
            </div>
          )}

          {/* Helpful Votes */}
          {totalHelpfulVotes > 0 && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <ThumbsUp className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Helpful Votes</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {totalHelpfulVotes}
              </div>
              <div className="text-sm text-purple-700">
                total votes
              </div>
            </div>
          )}
        </div>

        {/* Quality Badges */}
        <div className="flex flex-wrap gap-2">
          {averageRating >= 4.5 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              ⭐ Highly Rated
            </Badge>
          )}
          {averageCleanlinessRating && averageCleanlinessRating >= 4.5 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ✨ Exceptionally Clean
            </Badge>
          )}
          {totalReviews >= 10 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              📈 Established Listing
            </Badge>
          )}
          {totalHelpfulVotes >= 5 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              👍 Community Favorite
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}