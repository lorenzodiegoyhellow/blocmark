import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Zap
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { apiRequest } from "@/lib/queryClient";
import { Location, Booking, Addon } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Initialize Stripe - Force use of correct key
const CORRECT_STRIPE_KEY = "pk_test_51RneKqRJ1MlOxo83nWbUi7KILvFj3QzETYOsI0BcycKNR8LetsaSIk178KFR5rhxm85murW9beNNUp5J87G0mg94001ZaPCFoB";

console.log("Loading Stripe with key:", CORRECT_STRIPE_KEY.substring(0, 20) + "...");

// Load Stripe instance
const stripePromise = loadStripe(CORRECT_STRIPE_KEY);

interface BookingFormData {
  date: string;
  startTime: string;
  endTime: string;
  activityType: string;
  castAndCrew: string;
  projectName: string;
  renterCompany: string;
  projectDescription: string;
  guestCount: number;
  selectedAddons: number[];
}

interface PricingBreakdown {
  basePrice: number;
  hours: number;
  subtotal: number;
  addonsTotal: number;
  additionalFeesTotal: number;
  activityFeeTotal?: number;
  processingFee: number;
  total: number;
  fromBooking?: boolean;
  activityType?: string;
  activityPercentage?: number;
}

// New component to handle saved payment methods
function SavedPaymentMethods({ 
  selectedPaymentMethod, 
  onSelectPaymentMethod,
  onAddNewCard,
  paymentMethods
}: {
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
  onAddNewCard: () => void;
  paymentMethods: any[];
}) {
  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <RadioGroup 
      value={selectedPaymentMethod} 
      onValueChange={onSelectPaymentMethod}
      className="space-y-3"
    >
      {paymentMethods?.map((method: any) => (
        <div
          key={method.id}
          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
        >
          <RadioGroupItem value={method.id} id={method.id} />
          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatCardBrand(method.brand)} •••• {method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                {method.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </div>
          </Label>
        </div>
      ))}
      
      <div
        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
        onClick={onAddNewCard}
      >
        <RadioGroupItem value="new" id="new-card" />
        <Label htmlFor="new-card" className="flex-1 cursor-pointer">
          <div className="flex items-center space-x-3">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Add new card</p>
              <p className="text-sm text-muted-foreground">
                Use a different payment method
              </p>
            </div>
          </div>
        </Label>
      </div>
    </RadioGroup>
  );
}

function CheckoutForm({ 
  booking, 
  location, 
  pricing, 
  onSuccess 
}: { 
  booking: Booking;
  location: Location;
  pricing: PricingBreakdown;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Fetch saved payment methods only for authenticated users
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: !!user, // Only fetch if user is authenticated
  });
  
  const paymentMethods = (paymentMethodsData as any)?.paymentMethods || [];
  
  console.log('Payment methods data:', paymentMethodsData);
  console.log('Payment methods array:', paymentMethods);
  console.log('Payment methods loading:', paymentMethodsLoading);
  console.log('Show new card form:', showNewCardForm);
  console.log('Selected payment method:', selectedPaymentMethod);

  useEffect(() => {
    // Set default payment method when loaded
    if (paymentMethods && paymentMethods.length > 0 && !selectedPaymentMethod) {
      const defaultMethod = paymentMethods.find((m: any) => m.isDefault);
      setSelectedPaymentMethod(defaultMethod?.id || paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  useEffect(() => {
    console.log("CheckoutForm mounted");
    console.log("Stripe instance:", !!stripe);
    console.log("Elements instance:", !!elements);
    
    if (stripe && elements) {
      setPaymentReady(true);
      console.log("Payment form ready");
      setStripeError(null);
    } else if (stripe === null) {
      console.error("Stripe failed to initialize - stripe is null");
      setStripeError(t("booking.paymentFailed"));
    } else if (stripe === undefined) {
      console.log("Stripe is still loading...");
      setStripeError(null);
    }
  }, [stripe, elements, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('=== BOOKING CHECKOUT FLOW STARTED ===');

    setIsProcessing(true);

    try {
      // Check if using saved payment method
      if (selectedPaymentMethod && selectedPaymentMethod !== 'new') {
        console.log('Using saved payment method:', selectedPaymentMethod);
        
        // Process payment with saved payment method
        const paymentResponse = await fetch('/api/create-payment-with-saved-method', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking.id,
            paymentMethodId: selectedPaymentMethod,
            amount: Math.round(pricing.total * 100), // Convert to cents
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Payment failed');
        }

        const result = await paymentResponse.json();
        
        if (result.success) {
          console.log('Payment successful with saved method');
          onSuccess();
          return;
        }
      }
      
      // Otherwise use new payment method flow
      console.log('Processing with new payment method');
      
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      // Payment successful - now update booking status
      console.log('Payment confirmed, updating booking status...');
      
      // Check if this is a custom offer booking or instant booking location
      const isCustomOffer = booking.activity?.includes("Custom offer booking");
      const isInstantBooking = location?.instantBooking || false;
      
      // Determine status: confirmed for custom offers or instant booking, pending otherwise
      const newStatus = (isCustomOffer || isInstantBooking) ? 'confirmed' : 'pending';
      
      // Update booking status after payment
      const statusResponse = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: 'paid'
        }),
        credentials: 'include'
      });

      if (!statusResponse.ok) {
        console.error('Failed to update booking status after payment');
        // Don't throw error here since payment was successful
      }

      // Show success toast with appropriate message
      let toastDescription = "Your booking is pending approval from the host.";
      if (isCustomOffer) {
        toastDescription = "Your custom offer booking has been confirmed!";
      } else if (isInstantBooking) {
        toastDescription = "Your instant booking has been confirmed!";
      }
      
      toast({
        title: "Payment Successful!",
        description: toastDescription,
        duration: 5000,
      });

      console.log('=== BOOKING CHECKOUT COMPLETED ===');
      console.log('Calling onSuccess to show confirmation');
      
      // Trigger the success flow which should show confirmation
      onSuccess();
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: t("booking.paymentError"),
        description: error instanceof Error ? error.message : t("error.generic"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        
        {/* Show saved payment methods or new card form */}
        {paymentMethodsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading payment methods...</span>
          </div>
        ) : (
          <>
            {(!showNewCardForm && paymentMethods && paymentMethods.length > 0) ? (
              <SavedPaymentMethods
                selectedPaymentMethod={selectedPaymentMethod}
                paymentMethods={paymentMethods}
                onSelectPaymentMethod={(id) => {
                  setSelectedPaymentMethod(id);
                  setShowNewCardForm(id === 'new');
                }}
                onAddNewCard={() => {
                  setSelectedPaymentMethod('new');
                  setShowNewCardForm(true);
                }}
              />
            ) : (
              <div className="p-4 border rounded-lg">
                {stripeError ? (
                  <div className="flex items-center justify-center py-8">
                    <AlertCircle className="h-6 w-6 text-destructive mr-2" />
                    <span className="text-sm text-destructive">{stripeError}</span>
                  </div>
                ) : !paymentReady ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">{t("booking.paymentLoading")}</span>
                  </div>
                ) : (
                  <>
                    {showNewCardForm && paymentMethods && paymentMethods.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                        onClick={() => {
                          setShowNewCardForm(false);
                          const defaultMethod = paymentMethods.find((m: any) => m.isDefault);
                          setSelectedPaymentMethod(defaultMethod?.id || paymentMethods[0].id);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Use saved payment method
                      </Button>
                    )}
                    <PaymentElement 
                      options={{
                        layout: {
                          type: 'tabs',
                          defaultCollapsed: false,
                        },
                        fields: {
                          billingDetails: {
                            address: 'auto',
                          },
                        },
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* Terms and conditions */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">{t("booking.cancellationPolicy")}</p>
          <p className="mb-2">
            {t("booking.gracePeriod")}
          </p>
          <p className="mb-2">
            Please see our <a href="/cancellation-policy" className="text-primary hover:underline">cancellation policy</a> for more information.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">{t("booking.whatHappensNext")}</p>
          <p className="mb-2">
            {t("booking.instantBooking")}
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            By pressing "{t("booking.acceptAndPay")}", you agree to the <a href="/terms" className="text-primary hover:underline">{t("booking.locationAgreement")}</a>, 
            <a href="/booking-terms" className="text-primary hover:underline">{t("booking.bookingRules")}</a> and 
            Blocmark's <a href="/terms" className="text-primary hover:underline">{t("booking.termsOfService")}</a>.
          </p>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("booking.processingPayment")}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {t("booking.acceptAndPay")}
          </>
        )}
      </Button>
    </form>
  );
}

export default function BookingCheckout() {
  console.log('BookingCheckout component started loading...');
  
  // Test if the issue is in the initial component setup
  try {
    console.log('Getting URL params...');
    const { id } = useParams<{ id: string }>();
    
    // Get bookingId from URL if available (for custom offers)
    const urlSearchParams = new URLSearchParams(window.location.search);
    const bookingIdFromUrl = urlSearchParams.get('bookingId');
    
    // Quick test - if we can't even get this far, the issue is before any date logic
    if (!id && !bookingIdFromUrl) {
      console.error('No location ID or booking ID in params');
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Location or Booking ID</h2>
            <p className="text-muted-foreground mb-4">Missing required parameter in URL</p>
            <button onClick={() => window.location.href = '/'} className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    
    console.log('Location ID found:', id, 'Booking ID:', bookingIdFromUrl);
    
    const [, navigate] = useLocation();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
  
    // Get URL parameters with detailed logging
    const searchParams = new URLSearchParams(window.location.search);
    const urlDate = searchParams.get('date');
    const urlStartTime = searchParams.get('startTime');
    const urlEndTime = searchParams.get('endTime');
    const urlGroupSize = searchParams.get('groupSize');
    const urlGuestCount = searchParams.get('guestCount');
    const urlTotalPrice = searchParams.get('totalPrice');
    const urlBasePrice = searchParams.get('basePrice');
    const urlAdditionalFeesTotal = searchParams.get('additionalFeesTotal');
    const urlServiceFee = searchParams.get('serviceFee');
    

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    try {
      console.log('Converting time:', time12h);
      
      // If already in 24-hour format, return as-is
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time12h)) {
        return time12h;
      }
      
      // Handle 12-hour format (e.g., "4:00PM", "12:00AM")
      const time12hRegex = /^(\d{1,2}):(\d{2})(AM|PM)$/i;
      const match = time12h.match(time12hRegex);
      
      if (match) {
        let [, hours, minutes, ampm] = match;
        let hour24 = parseInt(hours);
        
        if (ampm.toUpperCase() === 'AM') {
          if (hour24 === 12) hour24 = 0; // 12 AM = 00:xx
        } else {
          if (hour24 !== 12) hour24 += 12; // PM hours except 12 PM
        }
        
        const result = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        console.log(`Converted ${time12h} to ${result}`);
        return result;
      }
      
      console.warn('Invalid time format, using default:', time12h);
      return "09:00"; // Default fallback
    } catch (error) {
      console.error('Error converting time:', error);
      return "09:00";
    }
  };

  // Helper function to parse various date formats
  const parseDate = (dateStr: string): string => {
    try {
      // If already in yyyy-MM-dd format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Try to parse human-readable dates like "October 7th, 2025"
      const parsed = new Date(dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1'));
      if (!isNaN(parsed.getTime())) {
        return format(parsed, "yyyy-MM-dd");
      }
      
      // Default to today if parsing fails
      return format(new Date(), "yyyy-MM-dd");
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return format(new Date(), "yyyy-MM-dd");
    }
  };

  // Check localStorage for booking data first
  const [bookingDataFromStorage] = useState(() => {
    try {
      const storedData = localStorage.getItem('complete_booking_data');
      if (storedData) {
        console.log('Found booking data in localStorage:', storedData);
        const parsed = JSON.parse(storedData);
        // Clear it after reading to prevent stale data
        localStorage.removeItem('complete_booking_data');
        return parsed;
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    return null;
  });

  const [formData, setFormData] = useState<BookingFormData>(() => {
    try {
      const today = new Date();
      const todayString = format(today, "yyyy-MM-dd");
      
      // If we have booking data from storage, use it
      if (bookingDataFromStorage) {
        return {
          date: bookingDataFromStorage.startDate || todayString,
          startTime: bookingDataFromStorage.startTime || "09:00",
          endTime: bookingDataFromStorage.endTime || "17:00",
          activityType: bookingDataFromStorage.activityType || "Filming",
          castAndCrew: bookingDataFromStorage.castAndCrew || "1 - 5 people", // Default to small group
          projectName: bookingDataFromStorage.projectName || "",
          renterCompany: bookingDataFromStorage.renterCompany || "",
          projectDescription: bookingDataFromStorage.projectDescription || "",
          guestCount: bookingDataFromStorage.guestCount || 3,
          selectedAddons: bookingDataFromStorage.selectedAddons || []
        };
      }
      
      // Otherwise use URL params
      return {
        date: urlDate ? parseDate(urlDate) : todayString,
        startTime: urlStartTime || "09:00",
        endTime: urlEndTime || "17:00",
        activityType: "Filming",
        castAndCrew: urlGroupSize === 'small' ? "1 - 5 people" : urlGroupSize === 'medium' ? "6 - 15 people" : urlGroupSize === 'large' ? "16 - 30 people" : urlGroupSize === 'extraLarge' ? "30+ people" : "6 - 15 people",
        projectName: "",
        renterCompany: "",
        projectDescription: "",
        guestCount: urlGuestCount ? parseInt(urlGuestCount) : 8,
        selectedAddons: []
      };
    } catch (error) {
      console.error("Error initializing form data:", error);
      return {
        date: "2025-07-23",
        startTime: "09:00",
        endTime: "17:00",
        activityType: "Filming",
        castAndCrew: "6 - 15 people",
        projectName: "",
        renterCompany: "",
        projectDescription: "",
        guestCount: 8,
        selectedAddons: []
      };
    }
  });

  // Fetch booking data if bookingId is provided - moved here before its usage
  const { data: bookingData, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingIdFromUrl}`],
    enabled: !!bookingIdFromUrl,
  });

  // Update form data when booking data is loaded
  useEffect(() => {
    if (bookingData) {
      console.log('Loading booking data:', { 
        bookingId: bookingData.id, 
        startDate: bookingData.startDate, 
        endDate: bookingData.endDate,
        activity: bookingData.activity 
      });
      
      // Parse the dates carefully to avoid timezone issues
      // The dates come from the database as UTC strings, we need to treat them as local
      const startDateStr = String(bookingData.startDate);
      const endDateStr = String(bookingData.endDate);
      
      // Extract date and time components from the UTC string
      // Format: "2025-08-20 00:00:00" or "2025-08-20T00:00:00"
      const startMatch = startDateStr.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
      const endMatch = endDateStr.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
      
      if (startMatch && endMatch) {
        const [, startDatePart, startTimePart] = startMatch;
        const [, endDatePart, endTimePart] = endMatch;
        
        console.log('Extracted date parts:', { startDatePart, startTimePart, endDatePart, endTimePart });
        
        setFormData(prev => ({
          ...prev,
          date: startDatePart, // Use the date part directly
          startTime: startTimePart, // Use the time part directly
          endTime: endTimePart, // Use the time part directly
          activityType: bookingData.activity || "Filming",
          guestCount: bookingData.guestCount || 8,
          // Keep existing values for fields not in booking
        }));

        // Calculate hours for pricing
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        
        // Update pricing with booking data - don't recalculate, use the booking's stored price
        setPricing(prev => ({
          ...prev,
          hours: hours > 0 ? hours : 1,
          total: bookingData.totalPrice,
          // Mark that this pricing came from booking data
          fromBooking: true
        }));
      } else {
        console.error('Failed to parse booking dates:', { startDateStr, endDateStr });
      }
    }
  }, [bookingData]);

  const [clientSecret, setClientSecret] = useState<string>("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown>(() => {
    
    // First try booking data from storage
    if (bookingDataFromStorage && bookingDataFromStorage.totalPrice) {
      const totalPrice = parseFloat(bookingDataFromStorage.totalPrice);
      const basePrice = parseFloat(bookingDataFromStorage.basePrice || totalPrice);
      const additionalFeesTotal = parseFloat(bookingDataFromStorage.additionalFeesTotal || '0');
      const serviceFee = parseFloat(bookingDataFromStorage.serviceFee || '0');
      
      
      // Calculate hours from start/end time if available
      let hours = 8; // default
      if (bookingDataFromStorage.startTime && bookingDataFromStorage.endTime) {
        try {
          const start = new Date(`1970-01-01T${bookingDataFromStorage.startTime}:00`);
          const end = new Date(`1970-01-01T${bookingDataFromStorage.endTime}:00`);
          hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          console.log('Calculated hours from storage:', hours);
        } catch (e) {
          console.error('Error calculating hours:', e);
        }
      }
      
      const result = {
        basePrice: basePrice / hours, // Calculate hourly rate
        hours: hours,
        subtotal: basePrice,
        addonsTotal: 0,
        additionalFeesTotal: additionalFeesTotal,
        processingFee: serviceFee,
        total: totalPrice
      };
      console.log('Final pricing from storage:', result);
      return result;
    }
    
    // Next try URL parameters
    if (urlTotalPrice && urlBasePrice) {
      const totalPrice = parseFloat(urlTotalPrice);
      const basePrice = parseFloat(urlBasePrice);
      const additionalFeesTotal = parseFloat(urlAdditionalFeesTotal || '0');
      const serviceFee = parseFloat(urlServiceFee || '0');
      
      
      // Calculate hours from URL times
      let hours = 8; // default
      if (urlStartTime && urlEndTime) {
        try {
          const start = new Date(`1970-01-01T${urlStartTime}`);
          const end = new Date(`1970-01-01T${urlEndTime}`);
          hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (hours <= 0 || isNaN(hours)) hours = 8; // fallback
          console.log('Calculated hours from URL:', hours);
        } catch (e) {
          console.error('Error calculating hours from URL:', e);
        }
      }
      
      const result = {
        basePrice: basePrice / hours, // Calculate hourly rate
        hours: hours,
        subtotal: basePrice,
        addonsTotal: 0,
        additionalFeesTotal: additionalFeesTotal,
        processingFee: serviceFee,
        total: totalPrice
      };
      console.log('Final pricing from URL:', result);
      return result;
    }
    
    // Otherwise use default values
    console.log('No pricing data found, using defaults');
    return {
      basePrice: 0,
      hours: 0,
      subtotal: 0,
      addonsTotal: 0,
      additionalFeesTotal: 0,
      processingFee: 0,
      total: 0
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showReviewRequirementDialog, setShowReviewRequirementDialog] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  // Determine location ID from either direct ID or from booking data
  const locationId = bookingData?.locationId || id;

  // Fetch location data
  const { data: location, error: locationError, isLoading: locationLoading } = useQuery<Location>({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId,
  });

  // Fetch addons
  const { data: addons } = useQuery<Addon[]>({
    queryKey: [`/api/locations/${locationId}/addons`],
    enabled: !!locationId,
  });
  
  // Fetch pending bookings for this location
  const { data: pendingBookings = [] } = useQuery<Booking[]>({
    queryKey: [`/api/locations/${locationId}/pending-bookings`],
    enabled: !!locationId,
  });
  
  // Fetch reviews for the location
  const { data: reviewsData } = useQuery<any[]>({
    queryKey: [`/api/reviews/location/${locationId}`],
    enabled: !!locationId,
  });
  
  // Calculate real rating and review count from actual guest reviews only
  const guestReviews = reviewsData?.filter((review: any) => review.reviewType === 'guest_to_host') || [];
  const reviewCount = guestReviews.length;
  const rating = reviewCount > 0
    ? guestReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount 
    : 0;


  // Calculate pricing with group size
  useEffect(() => {
    if (!location) return;
    
    // If we have pricing from an existing booking, use that instead of recalculating
    if (pricing.fromBooking && pricing.total > 0) {
      console.log('Using pricing from existing booking. Total:', pricing.total);
      return;
    }

    try {
      console.log('Calculating pricing for times:', formData.startTime, formData.endTime);
      
      // Validate time format before creating Date objects
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
        console.warn("Invalid time format, skipping pricing calculation:", formData.startTime, formData.endTime);
        return;
      }

      // Create date strings with proper ISO format
      const startDateString = `1970-01-01T${formData.startTime}:00.000Z`;
      const endDateString = `1970-01-01T${formData.endTime}:00.000Z`;
      
      console.log('Creating Date objects with:', startDateString, endDateString);
      
      const startTime = new Date(startDateString);
      const endTime = new Date(endDateString);
      
      // Check if dates are valid
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.warn("Invalid Date objects created:", startTime, endTime);
        console.warn("From time strings:", formData.startTime, formData.endTime);
        return;
      }
      
      console.log('Valid Date objects created successfully');

      let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // If hours is negative, it means the end time is on the next day
      if (hours < 0) {
        hours += 24;
      }
      
      console.log('Calculated hours:', hours);
    
    // Calculate base price using new pricing matrix or fallback to old system
    let basePrice = location.price;
    let groupSize = 'small';
    
    // Map cast and crew to group size
    if (formData.castAndCrew === "6 - 15 people") {
      groupSize = 'medium';
    } else if (formData.castAndCrew === "16 - 30 people") {
      groupSize = 'large';
    } else if (formData.castAndCrew === "31+ people") {
      groupSize = 'extraLarge';
    }
    
    // Check for pricing matrix first (new system)
    const pricingMatrix = location.pricingMatrix as Record<string, Record<string, number>> | undefined;
    let usedPricingMatrix = false;
    
    if (pricingMatrix) {
      // Map activity type from formData to pricing matrix key
      const activityTypeFormatted = formData.activityType.toLowerCase();
      const activityKey = 
        activityTypeFormatted === 'event' || activityTypeFormatted.includes('event') ? 'event' :
        activityTypeFormatted === 'photo' || activityTypeFormatted.includes('photo') ? 'photo' :
        activityTypeFormatted === 'video' || activityTypeFormatted.includes('video') || activityTypeFormatted.includes('filming') ? 'video' :
        activityTypeFormatted === 'meeting' || activityTypeFormatted.includes('meeting') ? 'meeting' :
        'photo';
      
      if (pricingMatrix[activityKey] && pricingMatrix[activityKey][groupSize]) {
        basePrice = pricingMatrix[activityKey][groupSize];
        usedPricingMatrix = true;
      }
    }
    
    // Fallback to old pricing system if matrix doesn't have the data
    if (!usedPricingMatrix) {
      const groupPricing = location.groupSizePricing as any;
      if (groupPricing) {
        if (groupSize === 'medium' && groupPricing.mediumGroup) {
          basePrice = location.price + groupPricing.mediumGroup;
        } else if (groupSize === 'large' && groupPricing.largeGroup) {
          basePrice = location.price + groupPricing.largeGroup;
        } else if (groupSize === 'extraLarge' && groupPricing.extraLargeGroup) {
          basePrice = location.price + groupPricing.extraLargeGroup;
        }
      }
    }
    
    const subtotal = basePrice * hours;
    
    const addonsTotal = addons?.reduce((total, addon) => {
      if (formData.selectedAddons.includes(addon.id)) {
        return total + addon.price * hours;
      }
      return total;
    }, 0) || 0;

    // Calculate additional fees
    const additionalFeesTotal = (location.additionalFees as any[])?.reduce((total, fee) => {
      if (fee.type === 'percentage') {
        const feeAmount = subtotal * fee.amount / 100;
        return total + feeAmount;
      } else {
        return total + fee.amount;
      }
    }, 0) || 0;

    const subtotalWithFees = subtotal + addonsTotal + additionalFeesTotal;

    // Activity-based pricing is now included in the base price with pricingMatrix
    // Only apply as percentage for old pricing system
    let activityFeeTotal = 0;
    let activityPercentage = 0;
    
    // Only apply activity percentage if using old pricing system (no pricingMatrix)
    if (!pricingMatrix && formData.activityType && location.activityPricing) {
      const activityPricing = location.activityPricing as Record<string, number>;
      // Map activity types to match the stored keys
      const activityKey = formData.activityType.toLowerCase().includes('photo') ? 'photo' :
                         formData.activityType.toLowerCase().includes('video') ? 'video' :
                         formData.activityType.toLowerCase().includes('event') ? 'event' :
                         formData.activityType.toLowerCase().includes('meeting') ? 'meeting' :
                         formData.activityType.toLowerCase();
      
      activityPercentage = activityPricing[activityKey];
      if (activityPercentage && activityPercentage > 0) {
        activityFeeTotal = subtotalWithFees * (activityPercentage / 100);
      }
    }

    const subtotalWithActivity = subtotalWithFees + activityFeeTotal;
    const processingFee = subtotalWithActivity * 0.05; // 5% service fee
    const total = subtotalWithActivity + processingFee;

      setPricing({
        basePrice,
        hours,
        subtotal,
        addonsTotal,
        additionalFeesTotal,
        activityFeeTotal,
        processingFee,
        total,
        activityType: formData.activityType,
        activityPercentage
      });
    } catch (error) {
      console.error("Error calculating pricing:", error);
      // Set default values if calculation fails
      setPricing({
        basePrice: location.price,
        hours: 8,
        subtotal: location.price * 8,
        addonsTotal: 0,
        additionalFeesTotal: 0,
        processingFee: location.price * 8 * 0.05, // 5% service fee
        total: location.price * 8 * 1.05
      });
    }
  }, [location, formData, addons]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      console.log("Making booking API request...");
      const response = await apiRequest({
        url: "/api/bookings",
        method: "POST",
        body: bookingData
      });
      
      return response;
    },
    onSuccess: (data) => {
      console.log("Booking created successfully:", data);
      setBooking(data.booking || data);
      
      // Create payment intent after booking creation
      const paymentData = {
        bookingId: (data.booking || data).id,
        amount: pricing.total,
        locationId: locationId
      };
      
      createPaymentIntentMutation.mutate(paymentData);
    },
    onError: (error: any) => {
      console.error("Booking creation error:", error);
      console.error("Error status:", error.status);
      console.error("Error message:", error.message);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      // Check if this is a pending reviews error
      // The error message contains "You must complete pending reviews"
      if (error.message && error.message.toLowerCase().includes("you must complete pending reviews")) {
        console.log("Detected pending reviews error - showing dialog");
        // Extract pending reviews count from the message if possible
        const match = error.message.match(/"pendingReviews":(\d+)/);
        const pendingCount = match ? parseInt(match[1]) : 0;
        setPendingReviewsCount(pendingCount);
        setShowReviewRequirementDialog(true);
      } else {
        // Show regular error toast for other errors
        toast({
          title: t("booking.bookingError"),
          description: `${t("error.booking")}: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      console.log("Making payment intent API request...");
      const response = await apiRequest({
        url: "/api/create-payment-intent",
        method: "POST",
        body: paymentData
      });
      
      return response;
    },
    onSuccess: (data) => {
      console.log("Payment intent created successfully:", data);
      console.log("Setting client secret:", data.clientSecret);
      console.log("Current step before:", currentStep);
      setClientSecret(data.clientSecret);
      setCurrentStep(2);
      console.log("Current step after setting to 2");
    },
    onError: (error) => {
      console.error("Payment intent creation error:", error);
      toast({
        title: t("booking.paymentError"),
        description: `${t("error.payment")}: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleProjectDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Form submit triggered");
      console.log("User state:", user);
      console.log("Existing booking from custom offer:", bookingData);
      
      // If we already have a booking from custom offer, skip to payment
      if (bookingData && bookingIdFromUrl) {
        console.log("Using existing booking from custom offer, proceeding to payment");
        setBooking(bookingData);
        
        // Create payment intent for existing booking
        const paymentData = {
          bookingId: bookingData.id,
          amount: pricing.total,
          locationId: locationId
        };
        
        createPaymentIntentMutation.mutate(paymentData);
        return;
      }
      
      // Otherwise create new booking
      const newBookingData = {
        locationId: Number(locationId),
        clientId: user?.id || 8, // Use authenticated user ID or fallback to test user
        startDate: new Date(`${formData.date}T${formData.startTime}`),
        endDate: new Date(`${formData.date}T${formData.endTime}`),
        totalPrice: Math.round(pricing.total * 100), // Convert to cents
        status: "payment_pending",
        activityType: formData.activityType,
        activity: formData.activityType,
        castAndCrew: formData.castAndCrew,
        projectName: formData.projectName,
        renterCompany: formData.renterCompany,
        projectDescription: formData.projectDescription,
        guestCount: formData.guestCount,
        addons: formData.selectedAddons
      };

      console.log("Booking data to submit:", newBookingData);
      
      // Use try-catch to prevent HMR errors
      try {
        createBookingMutation.mutate(newBookingData);
      } catch (mutationError) {
        console.error("Mutation error:", mutationError);
        throw mutationError;
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: t("booking.formError"),
        description: t("error.generic"),
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    console.log('=== PAYMENT SUCCESS - SHOWING CONFIRMATION ===');
    
    // Show confirmation overlay instead of redirecting
    setShowConfirmation(true);
    
    // Start countdown timer for automatic redirect to dashboard
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          try {
            navigate('/dashboard');
          } catch (error) {
            console.error("Navigation error:", error);
            window.location.href = '/dashboard';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!location) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (locationError) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("error.notFound")}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  // Success confirmation overlay
  if (showConfirmation && booking) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 min-h-screen">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40" />
          
          {/* Success Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Success Icon and Title */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <CheckCircle className="text-amber-600 h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Payment Successful!</h2>
                  <p className="text-muted-foreground mt-2">
                    {booking.activity?.includes("Custom offer booking") 
                      ? "Your custom offer booking has been confirmed!"
                      : "Your booking is pending approval from the host."
                    }
                  </p>
                </div>
                
                {/* Booking Details */}
                <div className="border rounded-lg p-4 space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{location.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time:</span>
                    <span>{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Project:</span>
                    <span>{formData.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Activity:</span>
                    <span>{formData.activityType}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total Paid:</span>
                    <span className="font-semibold">${pricing.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Next Steps Alert */}
                <Alert className="border-amber-200 bg-amber-50 mb-6">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    {booking.activity?.includes("Custom offer booking") ? (
                      <>
                        <strong>Next Steps:</strong> Your custom offer booking has been automatically confirmed! 
                        You can view the details in your dashboard. The host has been notified of your payment.
                        <br /><br />
                        <strong>Redirecting to dashboard in {countdown} seconds...</strong>
                      </>
                    ) : (
                      <>
                        <strong>Next Steps:</strong> The property host will review your booking request. 
                        You'll receive a notification when they approve or decline. This typically happens within 24 hours.
                        <br /><br />
                        <strong>Redirecting to dashboard in {countdown} seconds...</strong>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      try {
                        navigate('/dashboard');
                      } catch (error) {
                        window.location.href = '/dashboard';
                      }
                    }}
                  >
                    View All Bookings
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      try {
                        navigate('/messages');
                      } catch (error) {
                        window.location.href = '/messages';
                      }
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Host
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => {
                      try {
                        navigate('/');
                      } catch (error) {
                        window.location.href = '/';
                      }
                    }}
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show loading state while location or booking is being fetched
  if (locationLoading || bookingLoading || (!locationId && !bookingIdFromUrl)) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading booking details...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state if location not found or there's an error
  if ((locationError || (!location && !locationLoading)) && !locationLoading) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {locationError ? "Error Loading Location" : "Location Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {locationError 
                ? "There was an error loading the location details. Please try again." 
                : "The location you're trying to book doesn't exist."
              }
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                navigate(`/locations/${id}`);
              } catch (error) {
                console.error("Navigation error:", error);
                window.location.href = `/locations/${id}`;
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">{t("booking.completeBooking")}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Project Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                    currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
                  }`}>
                    {currentStep > 1 ? '1' : '1'}
                  </div>
                  <CardTitle>{t("booking.projectDetails")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProjectDetailsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity">{t("form.activity")}</Label>
                      <Input
                        id="activity"
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                        placeholder={t("form.activityPlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="castAndCrew">{t("form.castCrew")}</Label>
                      <select
                        id="castAndCrew"
                        className="w-full border rounded-md p-2 mt-1"
                        value={formData.castAndCrew}
                        onChange={(e) => {
                          // Update formData with new cast and crew value and guest count
                          const newCastAndCrew = e.target.value;
                          const newGuestCount = newCastAndCrew === "1 - 5 people" ? 5 : 
                                               newCastAndCrew === "6 - 15 people" ? 10 : 
                                               newCastAndCrew === "16 - 30 people" ? 20 : 35;
                          setFormData(prev => ({ 
                            ...prev, 
                            castAndCrew: newCastAndCrew,
                            guestCount: newGuestCount 
                          }));
                        }}
                        required
                      >
                        {/* Small group is always enabled */}
                        <option value="1 - 5 people">
                          Small Group (1-5 people) - Base Price
                        </option>
                        
                        {/* Only show other group sizes if they're enabled */}
                        {(!location?.enabledGroupSizes || location.enabledGroupSizes.includes('medium')) && (
                          <option value="6 - 15 people">
                            Medium Group (6-15 people) {location?.groupSizePricing?.mediumGroup ? 
                              `- +$${Math.round(location.groupSizePricing.mediumGroup / 100)}/hr` : 
                              '- Base Price'}
                          </option>
                        )}
                        
                        {(!location?.enabledGroupSizes || location.enabledGroupSizes.includes('large')) && (
                          <option value="16 - 30 people">
                            Large Group (16-30 people) {location?.groupSizePricing?.largeGroup ? 
                              `- +$${Math.round(location.groupSizePricing.largeGroup / 100)}/hr` : 
                              '- Base Price'}
                          </option>
                        )}
                        
                        {(!location?.enabledGroupSizes || location.enabledGroupSizes.includes('extraLarge')) && (
                          <option value="31+ people">
                            Extra Large Group (31+ people) {location?.groupSizePricing?.extraLargeGroup ? 
                              `- +$${Math.round(location.groupSizePricing.extraLargeGroup / 100)}/hr` : 
                              '- Base Price'}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">{t("form.projectName")}</Label>
                      <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        placeholder={t("form.projectNamePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="renterCompany">{t("form.company")}</Label>
                      <Input
                        id="renterCompany"
                        value={formData.renterCompany}
                        onChange={(e) => setFormData({ ...formData, renterCompany: e.target.value })}
                        placeholder={t("form.companyPlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">{t("form.description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder={t("form.descriptionPlaceholder")}
                      rows={4}
                      required
                    />
                  </div>

                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">{t("form.date")}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const selectedDateObj = new Date(selectedDate);
                          selectedDateObj.setHours(0, 0, 0, 0);
                          
                          // Check if date is blocked
                          if (location.availability) {
                            try {
                              const availabilityData = typeof location.availability === 'string' 
                                ? JSON.parse(location.availability) 
                                : location.availability;
                                
                              if (availabilityData.blockedDates) {
                                const isBlocked = availabilityData.blockedDates.some((blockedDateStr: string) => {
                                  const blockedDate = new Date(blockedDateStr);
                                  blockedDate.setHours(0, 0, 0, 0);
                                  return blockedDate.getTime() === selectedDateObj.getTime();
                                });
                                
                                if (isBlocked) {
                                  toast({
                                    title: "Date Unavailable",
                                    description: "This date has been blocked by the owner. Please select another date.",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                              }
                            } catch (error) {
                              console.error("Error checking blocked dates:", error);
                            }
                          }
                          
                          // Check if date overlaps with pending bookings
                          const hasPendingConflict = pendingBookings.some((booking) => {
                            const bookingStart = new Date(booking.startDate);
                            const bookingEnd = new Date(booking.endDate);
                            bookingStart.setHours(0, 0, 0, 0);
                            bookingEnd.setHours(0, 0, 0, 0);
                            
                            // Check if selected date falls within pending booking range
                            return selectedDateObj >= bookingStart && selectedDateObj <= bookingEnd;
                          });
                          
                          if (hasPendingConflict) {
                            toast({
                              title: "Date On Hold",
                              description: "This date is temporarily unavailable while waiting for host approval on another booking. Please select a different date.",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          setFormData({ ...formData, date: selectedDate });
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">{t("form.startTime")}</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">{t("form.endTime")}</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Add-ons */}
                  {addons && addons.length > 0 && (
                    <div className="space-y-2">
                      <Label>{t("booking.additionalServices")}</Label>
                      <div className="space-y-2">
                        {addons.map((addon) => (
                          <div key={addon.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`addon-${addon.id}`}
                              checked={formData.selectedAddons.includes(addon.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selectedAddons: [...formData.selectedAddons, addon.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedAddons: formData.selectedAddons.filter(id => id !== addon.id)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`addon-${addon.id}`} className="text-sm">
                              {addon.name} - ${addon.price}/{addon.priceUnit}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createBookingMutation.isPending}
                    >
                      {createBookingMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("booking.creatingBooking")}
                        </>
                      ) : (
                        t("common.next")
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Step 2: Payment */}
            {currentStep === 2 && clientSecret && booking ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm bg-primary text-primary-foreground">
                      2
                    </div>
                    <CardTitle>{t("booking.paymentStep")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">

                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#2563eb',
                          colorBackground: '#ffffff',
                          colorText: '#0f172a',
                          fontFamily: 'system-ui, sans-serif',
                          borderRadius: '8px',
                        },
                      },
                      loader: 'auto',
                    }}
                  >
                    <CheckoutForm
                      booking={booking}
                      location={location}
                      pricing={pricing}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </CardContent>
              </Card>
            ) : (
              currentStep === 2 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        {t("booking.paymentLoading")}... ClientSecret: {clientSecret ? "Present" : "Missing"}, Booking: {booking ? booking.id : "Missing"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">{t("booking.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Info */}
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {location.images && location.images.length > 0 ? (
                      <img 
                        src={location.images[0]} 
                        alt={location.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">{location.title}</h3>
                    {reviewCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.address?.split(',')[1]?.trim() || 'Location'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(formData.date + 'T12:00:00'), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.castAndCrew}</span>
                  </div>
                  {formData.projectName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("form.projectName")}:</span> {formData.projectName}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("time.hours")}:</span> {pricing.hours}
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>${pricing.basePrice.toFixed(2)} x {pricing.hours} {t("time.hours")}</span>
                    <span>${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.selectedAddons.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t("pricing.addons")}</span>
                      <span>${pricing.addonsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pricing.additionalFeesTotal > 0 && (
                    <div className="space-y-1">
                      {(location.additionalFees as any[])?.map((fee, index) => {
                        const amount = fee.type === 'percentage' 
                          ? (pricing.subtotal * fee.amount / 100) 
                          : fee.amount;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span title={fee.description}>{fee.name}</span>
                            <span>${amount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {pricing.activityFeeTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{pricing.activityType} Fee ({pricing.activityPercentage}%)</span>
                      <span>${pricing.activityFeeTotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>{t("pricing.serviceFee")}</span>
                    <span>${pricing.processingFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>{t("pricing.total")}</span>
                    <span>${pricing.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Instant Booking Alert */}
                {location.instantBooking && (
                  <Alert className="border-green-200 bg-green-50">
                    <Zap className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Instant Booking</strong> - Your booking will be automatically confirmed after payment. No waiting for host approval!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Review Requirements Dialog */}
      <Dialog open={showReviewRequirementDialog} onOpenChange={setShowReviewRequirementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Complete Your Reviews First
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                You have {pendingReviewsCount} pending review{pendingReviewsCount !== 1 ? 's' : ''} that must be completed before you can make new bookings.
              </p>
              <p>
                This helps maintain trust and quality in our community. Please take a moment to share your experience from your previous bookings.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowReviewRequirementDialog(false);
                navigate("/dashboard");
              }}
              className="w-full sm:w-auto"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
  
  } catch (error) {
    console.error("BookingCheckout Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Return to Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }
}