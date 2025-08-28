import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  content: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters"),
  cleanlinessRating: z.number().min(1).max(5).optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  bookingId: number;
  locationId: number;
  reviewType: 'guest_to_host' | 'host_to_guest';
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ bookingId, locationId, reviewType, onSuccess, onCancel }: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCleanlinessRating, setSelectedCleanlinessRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredCleanlinessRating, setHoveredCleanlinessRating] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      content: "",
      cleanlinessRating: undefined
    }
  });

  const content = watch("content");

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const reviewData = {
        bookingId,
        locationId,
        reviewType,
        rating: data.rating,
        comment: data.content, // Map 'content' to 'comment' for backend
        cleanlinessRating: reviewType === 'guest_to_host' ? data.cleanlinessRating : undefined
      };

      return apiRequest({
        url: '/api/reviews',
        method: 'POST',
        body: reviewData
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted successfully",
        description: "Thank you for your feedback!"
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting review",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate(data);
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const handleCleanlinessRatingClick = (rating: number) => {
    setSelectedCleanlinessRating(rating);
    setValue("cleanlinessRating", rating);
  };

  const renderStars = (
    currentRating: number,
    hoveredRating: number,
    onStarClick: (rating: number) => void,
    onStarHover: (rating: number) => void,
    onStarLeave: () => void,
    size: string = "w-8 h-8"
  ) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || currentRating);
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => onStarClick(starValue)}
          onMouseEnter={() => onStarHover(starValue)}
          onMouseLeave={onStarLeave}
          className={`${size} transition-colors duration-150 ${
            isFilled 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          <Star className="w-full h-full" />
        </button>
      );
    });
  };

  const isGuestReview = reviewType === 'guest_to_host';
  const isHostReview = reviewType === 'host_to_guest';

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-blue-900">
          {isGuestReview ? 'Review Your Stay' : 'Review Your Guest'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-blue-700 hover:text-blue-900"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-900">
              Overall Rating *
            </Label>
            <div className="flex items-center gap-1">
              {renderStars(
                selectedRating,
                hoveredRating,
                handleRatingClick,
                setHoveredRating,
                () => setHoveredRating(0)
              )}
              <span className="ml-2 text-sm text-blue-700">
                {selectedRating > 0 && (
                  <>
                    {selectedRating} star{selectedRating > 1 ? 's' : ''}
                    {selectedRating === 1 && ' - Poor'}
                    {selectedRating === 2 && ' - Fair'}
                    {selectedRating === 3 && ' - Good'}
                    {selectedRating === 4 && ' - Very Good'}
                    {selectedRating === 5 && ' - Excellent'}
                  </>
                )}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Cleanliness Rating (only for guest reviews) */}
          {isGuestReview && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-900">
                Cleanliness Rating
              </Label>
              <div className="flex items-center gap-1">
                {renderStars(
                  selectedCleanlinessRating,
                  hoveredCleanlinessRating,
                  handleCleanlinessRatingClick,
                  setHoveredCleanlinessRating,
                  () => setHoveredCleanlinessRating(0),
                  "w-6 h-6"
                )}
                <span className="ml-2 text-sm text-blue-700">
                  {selectedCleanlinessRating > 0 && (
                    <>
                      {selectedCleanlinessRating} star{selectedCleanlinessRating > 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-blue-900">
              {isGuestReview ? 'Share your experience' : 'How was your guest?'} *
            </Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder={
                isGuestReview 
                  ? "Tell future guests about your experience at this location..."
                  : "Share your experience hosting this guest..."
              }
              className="min-h-[120px] resize-none border-blue-200 focus:border-blue-500"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-blue-600">
              <span>
                {errors.content && (
                  <span className="text-red-600">{errors.content.message}</span>
                )}
              </span>
              <span>{content?.length || 0}/1000</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-blue-100 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {isGuestReview ? (
                <>
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Mention specific aspects like location, amenities, and communication</li>
                  <li>• Help other guests make informed decisions</li>
                </>
              ) : (
                <>
                  <li>• Be respectful and professional</li>
                  <li>• Mention communication, cleanliness, and adherence to rules</li>
                  <li>• Help other hosts make informed decisions</li>
                </>
              )}
              <li>• Avoid personal information or inappropriate content</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitReviewMutation.isPending}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending || selectedRating === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}