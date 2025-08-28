import React from 'react';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface NoReviewsAlertProps {
  locationId?: number;
  locationName?: string;
  className?: string;
  variant?: 'detailed' | 'compact' | 'profile';
  onBookNowClick?: () => void;
}

/**
 * A component for displaying a message when there are no reviews
 * Has different variants for different contexts
 */
export function NoReviewsAlert({ 
  locationId, 
  locationName, 
  className = '',
  variant = 'detailed',
  onBookNowClick 
}: NoReviewsAlertProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Most basic version for profiles or lists
  if (variant === 'profile') {
    return (
      <div className={`p-6 bg-gray-50 rounded-md ${className}`}>
        <div className="flex flex-col items-center gap-2 text-center">
          <BookOpen className="h-8 w-8 text-gray-400" />
          <h3 className="font-semibold text-lg">No Reviews Yet</h3>
          <p className="text-gray-500 text-sm">
            No reviews have been left for this {locationName ? `location` : 'user'} yet.
          </p>
        </div>
      </div>
    );
  }
  
  // Compact version for smaller spaces
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-md ${className}`}>
        <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />
        <div>
          <p className="font-medium text-sm">No Reviews Yet</p>
          <p className="text-xs text-gray-500">
            Be the first to {user ? 'leave a review' : 'book and review'} for this space.
          </p>
        </div>
      </div>
    );
  }
  
  // Detailed version (default) for location pages
  return (
    <Card className={className}>
      <CardHeader className="text-center pb-2">
        <CardTitle>No Reviews Yet</CardTitle>
        <CardDescription>
          This space doesn't have any reviews yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0 pb-4">
        <p className="text-sm text-gray-600">
          Be the first to book this space and share your experience with our community!
          Your feedback helps others make informed decisions.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button 
          variant="default"
          onClick={() => {
            if (onBookNowClick) {
              onBookNowClick();
            } else if (locationId) {
              // Check if user is logged in first
              if (!user) {
                toast({
                  title: "Sign in required",
                  description: "Please sign in to book this location",
                  variant: "destructive"
                });
                return;
              }
              
              // Navigate to payment page like the Book Now button does
              navigate(`/locations/${locationId}/payment`);
            }
          }}
        >
          Book This Space
        </Button>
      </CardFooter>
    </Card>
  );
}