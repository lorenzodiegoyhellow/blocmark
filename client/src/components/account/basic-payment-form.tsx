import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BasicPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BasicPaymentForm({ isOpen, onClose, onSuccess }: BasicPaymentFormProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const paymentElementRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    let stripeInstance: any = null;
    let elementsInstance: any = null;

    const loadPaymentForm = async () => {
      try {
        setStatus('loading');
        setErrorMessage("");

        // Check if Stripe is available
        if (!window.Stripe) {
          throw new Error("Stripe hasn't loaded yet. Please refresh the page.");
        }

        // Create setup intent
        const response = await fetch("/api/payment-methods/setup-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server returned ${response.status}: ${text}`);
        }

        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error("No payment setup available");
        }

        if (!mounted) return;

        // Initialize Stripe with publishable key (use same key as StripeContext)
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
          "pk_test_51RneKqRJ1MlOxo83nWbUi7KILvFj3QzETYOsI0BcycKNR8LetsaSIk178KFR5rhxm85murW9beNNUp5J87G0mg94001ZaPCFoB";
        
        console.log("Initializing Stripe with key:", publishableKey);
        stripeInstance = window.Stripe(publishableKey);
        
        console.log("Creating Stripe elements with clientSecret:", data.clientSecret);
        // Create elements
        elementsInstance = stripeInstance.elements({
          clientSecret: data.clientSecret,
          appearance: {
            theme: 'stripe',
          },
        });

        console.log("Creating payment element");
        // Create payment element
        const paymentElement = elementsInstance.create('payment');
        paymentElementRef.current = paymentElement;
        
        if (!mounted) return;

        // Use ref to mount the element
        const mountElement = () => {
          console.log("Attempting to mount payment element. Container ref:", containerRef.current);
          if (containerRef.current && mounted) {
            try {
              console.log("Mounting payment element to container");
              paymentElement.mount(containerRef.current);
              
              // Store stripe and elements for form submission
              (window as any).__stripe = stripeInstance;
              (window as any).__elements = elementsInstance;
              
              console.log("Payment element mounted successfully");
              setStatus('ready');
            } catch (mountError) {
              console.error("Error mounting payment element:", mountError);
              throw mountError;
            }
          } else if (mounted) {
            console.log("Container not ready, retrying in 50ms");
            // Retry after a short delay
            setTimeout(mountElement, 50);
          }
        };

        // Start mounting process
        mountElement();

      } catch (err) {
        console.error("Payment form error:", err);
        if (mounted) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load payment form");
          setStatus('error');
        }
      }
    };

    // Start loading immediately
    loadPaymentForm();
    
    return () => {
      mounted = false;
      // Clean up Stripe elements when unmounting
      if (paymentElementRef.current) {
        paymentElementRef.current.destroy();
      }
      if ((window as any).__stripe) {
        delete (window as any).__stripe;
      }
      if ((window as any).__elements) {
        delete (window as any).__elements;
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stripe = (window as any).__stripe;
    const elements = (window as any).__elements;

    if (!stripe || !elements) {
      setErrorMessage("Payment form not ready");
      return;
    }

    try {
      setStatus('loading');

      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account-settings`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setStatus('ready');
      } else {
        await queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
        onSuccess();
      }
    } catch (err) {
      setErrorMessage("Failed to add payment method");
      setStatus('ready');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-md my-8 max-h-[85vh] flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Add Payment Method</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              {/* Always render the container so the ref is available */}
              <div ref={containerRef} className="mb-6 border rounded-md p-4" style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }} />
              
              {/* Overlay loading/error states */}
              {status === 'loading' && (
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading secure payment form...</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <div className="mb-4 text-red-600">
                      <svg className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">Unable to load payment form</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                      Refresh Page
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={status !== 'ready'}>
                Add Payment Method
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}