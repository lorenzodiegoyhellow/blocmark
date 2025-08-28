import { Calendar, Clock, Users, DollarSign, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CustomOfferPaymentDialog } from "@/components/payments/custom-offer-payment-dialog";

type CustomOfferDetails = {
  date?: string;
  startTime?: string;
  endTime?: string;
  attendees?: number | string;
  groupSize?: string;
  customPrice: number;
  locationTitle: string;
  locationId: number;
  selectedAddons?: number[];
  additionalFees?: Array<{
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }>;
};

type Props = {
  details: CustomOfferDetails;
  isReceiver: boolean;
  messageId: number;
  status?: 'pending' | 'accepted' | 'refused' | 'expired' | 'cancelled';
};

export function CustomOfferCard({ details, isReceiver, messageId, status = 'pending' }: Props) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [offerStatus, setOfferStatus] = useState(status);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const acceptOfferMutation = useMutation({
    mutationFn: () => apiRequest({
      url: `/api/messages/custom-offer/${messageId}/accept`,
      method: 'POST'
    }),
    onSuccess: (response: any) => {
      if (response?.bookingId) {
        setBookingId(response.bookingId);
        setShowPaymentDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create booking"
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept offer"
      });
    }
  });

  const refuseOfferMutation = useMutation({
    mutationFn: () => apiRequest({
      url: `/api/messages/custom-offer/${messageId}/refuse`,
      method: 'POST'
    }),
    onSuccess: () => {
      setOfferStatus('refused');
      toast({
        title: "Offer Refused",
        description: "The custom offer has been declined."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to refuse offer"
      });
    }
  });

  const cancelOfferMutation = useMutation({
    mutationFn: () => apiRequest({
      url: `/api/messages/custom-offer/${messageId}/cancel`,
      method: 'POST'
    }),
    onSuccess: () => {
      setOfferStatus('cancelled');
      toast({
        title: "Offer Cancelled",
        description: "The custom offer has been cancelled."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel offer"
      });
    }
  });

  const handlePaymentSuccess = () => {
    setOfferStatus('accepted');
    setShowPaymentDialog(false);
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed!"
    });
    queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    queryClient.invalidateQueries({ queryKey: ['/api/bookings/client'] });
  };

  return (
    <>
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-2">
            {isReceiver ? 'Custom Offer Received' : 'Custom Offer Sent'}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Property:</span>
              <span>{details.locationTitle}</span>
            </div>
            
            {details.date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{details.date}</span>
              </div>
            )}
            
            {(details.startTime || details.endTime) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {details.startTime && details.endTime 
                    ? `${details.startTime} - ${details.endTime}`
                    : details.startTime || details.endTime}
                </span>
              </div>
            )}
            
            {details.attendees && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {typeof details.attendees === 'string' 
                    ? `${details.attendees.charAt(0).toUpperCase() + details.attendees.slice(1)} group`
                    : `${details.attendees} attendees`}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 font-semibold text-primary">
              <DollarSign className="h-4 w-4" />
              <span>${details.customPrice}</span>
            </div>
          </div>
          
          {isReceiver && offerStatus === 'pending' && (
            <div className="flex gap-2 mt-3">
              <Button 
                className="flex-1 sm:flex-initial" 
                size="sm"
                onClick={() => acceptOfferMutation.mutate()}
                disabled={acceptOfferMutation.isPending || refuseOfferMutation.isPending}
              >
                {acceptOfferMutation.isPending ? (
                  "Accepting..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Accept Offer
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                className="flex-1 sm:flex-initial" 
                size="sm"
                onClick={() => refuseOfferMutation.mutate()}
                disabled={acceptOfferMutation.isPending || refuseOfferMutation.isPending}
              >
                {refuseOfferMutation.isPending ? (
                  "Refusing..."
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Refuse
                  </>
                )}
              </Button>
            </div>
          )}
          
          {offerStatus === 'accepted' && (
            <div className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
              <Check className="h-4 w-4" />
              Offer Accepted
            </div>
          )}
          
          {offerStatus === 'refused' && (
            <div className="mt-3 text-sm text-red-600 font-medium flex items-center gap-1">
              <X className="h-4 w-4" />
              Offer Refused
            </div>
          )}
          
          {offerStatus === 'expired' && (
            <div className="mt-3 text-sm text-muted-foreground font-medium">
              ⏱️ Offer Expired
            </div>
          )}
          
          {offerStatus === 'cancelled' && (
            <div className="mt-3 text-sm text-gray-600 font-medium">
              ❌ Offer Cancelled
            </div>
          )}
          
          {!isReceiver && offerStatus === 'pending' && (
            <div className="mt-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => cancelOfferMutation.mutate()}
                disabled={cancelOfferMutation.isPending}
              >
                {cancelOfferMutation.isPending ? (
                  "Cancelling..."
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Cancel Offer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
    
    {showPaymentDialog && bookingId && (
      <CustomOfferPaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        bookingId={bookingId}
        offerDetails={details}
        onPaymentSuccess={handlePaymentSuccess}
      />
    )}
    </>
  );
}