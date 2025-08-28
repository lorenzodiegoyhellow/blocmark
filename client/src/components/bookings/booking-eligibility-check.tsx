import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

interface BookingEligibilityCheckProps {
  onEligibilityChange: (isEligible: boolean) => void;
  className?: string;
}

export function BookingEligibilityCheck({ onEligibilityChange, className }: BookingEligibilityCheckProps) {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/booking-eligibility'],
    queryFn: async () => {
      return apiRequest({ url: '/api/user/booking-eligibility' });
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Call callback whenever eligibility changes
  React.useEffect(() => {
    if (data) {
      onEligibilityChange(data.eligible);
    }
  }, [data, onEligibilityChange]);

  // Handle loading and error states silently
  if (isLoading || error || !data) {
    return null;
  }

  // If user is eligible, don't show anything
  if (data.eligible) {
    return null;
  }

  // Only show alert when there's an eligibility issue
  return (
    <div className={className}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Action Required</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{data.message}</p>
          <p>You have {data.pendingReviews} pending {data.pendingReviews === 1 ? 'review' : 'reviews'} to complete.</p>
          <p>{data.nextSteps}</p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}