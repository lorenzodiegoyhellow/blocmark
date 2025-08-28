import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, DollarSign } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type CustomOfferDetails = {
  date?: string;
  startTime?: string;
  endTime?: string;
  attendees?: number | string;
  customPrice: number;
  locationTitle: string;
  locationId: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  offerDetails: CustomOfferDetails;
  onPaymentSuccess: () => void;
};

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

function PaymentForm({ bookingId, onSuccess }: { bookingId: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("new");

  // Fetch saved payment methods
  const { data: paymentMethods, isLoading: loadingMethods } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    enabled: !!stripe
  });

  // Create payment intent
  const { data: paymentIntent, isLoading: loadingIntent } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/create-payment-intent`],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/bookings/${bookingId}/create-payment-intent`,
        method: 'POST'
      });
      return response;
    },
    enabled: selectedPaymentMethod === "new"
  });

  // Pay with saved method mutation
  const payWithSavedMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest({
        url: `/api/bookings/${bookingId}/pay-with-saved-method`,
        method: 'POST',
        data: { paymentMethodId }
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed!"
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe) return;

    if (selectedPaymentMethod !== "new" && selectedPaymentMethod) {
      // Use saved payment method
      payWithSavedMethod.mutate(selectedPaymentMethod);
      return;
    }

    // Use new payment method
    if (!elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success?bookingId=${bookingId}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!"
        });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: err.message || "An error occurred during payment"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const defaultMethod = paymentMethods?.find(m => m.is_default);
  
  useEffect(() => {
    if (defaultMethod && selectedPaymentMethod === "new") {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [defaultMethod]);

  if (loadingMethods || (selectedPaymentMethod === "new" && loadingIntent)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentMethods && paymentMethods.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Payment Method</Label>
          <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="capitalize">{method.brand}</span>
                  <span>•••• {method.last4}</span>
                  <span className="text-sm text-gray-500">
                    Expires {method.exp_month}/{method.exp_year}
                  </span>
                  {method.is_default && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="new" id="new-method" />
              <Label htmlFor="new-method" className="cursor-pointer">
                Add new payment method
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {selectedPaymentMethod === "new" && paymentIntent?.clientSecret && (
        <div className="pt-4">
          <PaymentElement />
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing || payWithSavedMethod.isPending}
      >
        {isProcessing || payWithSavedMethod.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
}

export function CustomOfferPaymentDialog({ open, onClose, bookingId, offerDetails, onPaymentSuccess }: Props) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not specified";
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const handlePaymentSuccess = () => {
    onPaymentSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location</span>
                <span className="font-medium">{offerDetails.locationTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(offerDetails.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">
                  {offerDetails.startTime || "N/A"} - {offerDetails.endTime || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Group Size</span>
                <span className="font-medium">{offerDetails.attendees || 1} guests</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ${offerDetails.customPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm bookingId={bookingId} onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
}