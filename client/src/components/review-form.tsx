import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Review form schema
// Note: This should match the database schema requirements in shared/schema.ts
// The frontend uses 'review', but the backend uses 'comment' for the same field
const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  review: z.string().min(10, "Please provide a more detailed review (minimum 10 characters)").max(2000, "Review is too long (maximum 2000 characters)"),
  title: z.string().min(3, "Title is required").max(100, "Title is too long"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  bookingId: number;
  locationId: number;
  onSuccess?: () => void;
  locationName: string;
  reviewType?: "guest_to_host" | "host_to_guest";
  guestName?: string;
}

export function ReviewForm({ bookingId, locationId, onSuccess, locationName, reviewType = "guest_to_host", guestName }: ReviewFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      review: '',
      title: '',
    },
  });

  async function onSubmit(data: ReviewFormValues) {
    setSubmitting(true);
    try {
      // Log the data we're sending to help with debugging
      console.log('Submitting review with data:', {
        ...data,
        bookingId,
        locationId
      });
      
      // Validate the data before sending
      if (!data.review || data.review.length < 10) {
        throw new Error('Please provide a more detailed review (minimum 10 characters)');
      }
      
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new Error('Please provide a rating between 1 and 5');
      }
      
      // Make the API request with properly mapped fields
      await apiRequest({
        url: '/api/reviews',
        method: 'POST',
        body: {
          // The server expects 'review' field but maps it to 'comment' in the database
          // Note: The new review schema expects 'comment' field, not 'review'
          comment: data.review, // Map 'review' to 'comment' for the new schema
          rating: data.rating,
          bookingId,
          locationId,
          reviewType: reviewType, // Use the passed reviewType parameter
          // Note: title is not in the schema, so we don't send it
        },
      });
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for sharing your experience!',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      
      // Provide a more descriptive error message if available
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Failed to submit your review. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>Share your experience at {locationName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => {
                          setRating(value);
                          field.onChange(value);
                        }}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            (hoverRating || rating) >= value
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summarize your experience" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell others about your experience"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-xs text-gray-500">
              Your review will be visible to location owners and other users. Please be respectful and follow our community guidelines.
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            form.reset();
            setRating(0);
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}