import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function PaymentLinkPage() {
  const { checkoutUrl } = useParams<{ checkoutUrl?: string }>();
  const [, setLocation] = useLocation();
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to decode the URL if it exists
    if (checkoutUrl) {
      try {
        const decoded = decodeURIComponent(checkoutUrl);
        setDecodedUrl(decoded);
        console.log("Decoded checkout URL:", decoded);
      } catch (e) {
        console.error("Error decoding checkout URL:", e);
      }
    }
  }, [checkoutUrl]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Information</AlertTitle>
              <AlertDescription>
                Click the button below to proceed to our secure payment page. Your payment will be processed by Stripe.
              </AlertDescription>
            </Alert>
            
            {!decodedUrl && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Payment Link</AlertTitle>
                <AlertDescription>
                  No payment link was provided. Please go back to the booking page and try again.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Fallback to direct display if even the button doesn't work */}
            {decodedUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Your payment URL (if the button doesn't work, copy this URL manually):
                </p>
                <code className="block p-2 bg-muted rounded-md text-xs overflow-auto break-all">
                  {decodedUrl}
                </code>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {decodedUrl && (
              <Button 
                className="w-full"
                asChild
              >
                <a 
                  href={decodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Proceed to Secure Payment
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}