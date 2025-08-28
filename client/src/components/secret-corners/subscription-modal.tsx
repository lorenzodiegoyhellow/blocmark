import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { Globe, Search, Rocket, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Pricing data
const pricingTiers = [
  {
    name: "Wanderer",
    monthlyPrice: 4,
    yearlyPrice: 40, // ~17% discount
    stripeMonthlyPriceId: import.meta.env.VITE_STRIPE_WANDERER_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: import.meta.env.VITE_STRIPE_WANDERER_YEARLY_PRICE_ID,
    icon: <Globe className="w-6 h-6 text-green-600" />,
    color: "green",
    tagline: "🌍 Discover at your own pace",
    features: [
      "Access up to 30 hidden locations monthly",
      "Community discussions",
      "Save favorite spots to your secret list",
      "No upload or monetization access"
    ],
    bottomNote: "Best for casual explorers and weekend creators",
  },
  {
    name: "Explorer", 
    monthlyPrice: 14,
    yearlyPrice: 140, // ~17% discount  
    stripeMonthlyPriceId: import.meta.env.VITE_STRIPE_EXPLORER_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: import.meta.env.VITE_STRIPE_EXPLORER_YEARLY_PRICE_ID,
    icon: <Search className="w-6 h-6 text-primary" />,
    color: "primary",
    isPopular: true,
    tagline: "🔎 Explore deeper. Start earning.",
    features: [
      "Access up to 100 locations per month",
      "Upload and monetize your own locations", 
      "Get basic listing insights",
      "Photography and scouting tips",
      "All Wanderer features included"
    ],
    bottomNote: "Great for content creators and side hustlers",
  },
  {
    name: "Architect",
    monthlyPrice: 34,
    yearlyPrice: 340, // ~17% discount
    stripeMonthlyPriceId: import.meta.env.VITE_STRIPE_ARCHITECT_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: import.meta.env.VITE_STRIPE_ARCHITECT_YEARLY_PRICE_ID,
    icon: <Rocket className="w-6 h-6 text-yellow-600" />,
    color: "yellow",
    tagline: "🚀 Full access. Full potential.",
    features: [
      "Access up to 1000 locations per month",
      "Featured placement for your best listings",
      "Advanced analytics (views, saves, trends)", 
      "Submit custom scout requests",
      "Priority support + trend reports",
      "All Explorer features included"
    ],
    bottomNote: "Made for professionals, producers, and power users",
  }
];

function SubscriptionForm({ open, onClose, onSuccess }: SubscriptionModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<typeof pricingTiers[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (!selectedTier) {
      toast({
        title: "Please select a tier",
        description: "Choose a subscription tier to continue",
        variant: "destructive"
      });
      return;
    }

    if (!stripe || !elements) {
      toast({
        title: "Payment system not ready",
        description: "Please wait a moment and try again",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription on backend
      const response = await apiRequest({
        url: `/api/secret-corners/subscribe`,
        method: "POST",
        body: {
          tier: selectedTier.name.toLowerCase(),
          priceId: isYearly ? selectedTier.stripeYearlyPriceId : selectedTier.stripeMonthlyPriceId,
          isYearly
        }
      });

      const { clientSecret } = response;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: user?.email,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Subscription successful!",
        description: `Welcome to Secret Corners ${selectedTier.name}!`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "There was an error processing your subscription",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPrice = (tier: typeof pricingTiers[0]) => {
    return isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  };

  const getSavings = (tier: typeof pricingTiers[0]) => {
    const yearlyMonthly = tier.yearlyPrice / 12;
    const savings = Math.round(((tier.monthlyPrice - yearlyMonthly) / tier.monthlyPrice) * 100);
    return savings;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Secret Corners Subscription
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Get exclusive access to hidden locations and photography spots
          </p>
        </DialogHeader>

        <div className="mt-6">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
              Yearly <Badge variant="secondary" className="ml-2">Save up to 17%</Badge>
            </span>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative p-6 cursor-pointer transition-all ${
                  selectedTier?.name === tier.name
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                } ${tier.isPopular ? "border-primary" : ""}`}
                onClick={() => setSelectedTier(tier)}
              >
                {tier.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-4 flex items-center justify-between">
                  {tier.icon}
                  {selectedTier?.name === tier.name && (
                    <Check className="w-6 h-6 text-primary" />
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.tagline}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold">${getPrice(tier)}</span>
                  <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  {isYearly && (
                    <p className="text-sm text-green-600 mt-1">
                      Save {getSavings(tier)}% with yearly billing
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground italic">{tier.bottomNote}</p>
              </Card>
            ))}
          </div>

          {/* Payment section */}
          {selectedTier && (
            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-4">Payment Information</h4>
              <div className="p-3 border rounded-md bg-background">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your payment information is secure and encrypted
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={!selectedTier || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe to {selectedTier?.name || "Secret Corners"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper component to provide Stripe context
export function SubscriptionModal(props: SubscriptionModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm {...props} />
    </Elements>
  );
}