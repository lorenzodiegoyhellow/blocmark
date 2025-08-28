import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BasicPaymentForm } from "./basic-payment-form";

export function PaymentMethodsSection() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const { toast } = useToast();

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: isLoadingMethods, refetch: refetchMethods } = useQuery({
    queryKey: ['/api/payment-methods'],
  });

  const paymentMethods = paymentMethodsData?.paymentMethods || [];

  // Delete payment method mutation
  const deletePaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return await apiRequest({
        url: `/api/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
      refetchMethods();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  // Set default payment method mutation
  const setDefaultPaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return await apiRequest({
        url: `/api/payment-methods/${paymentMethodId}/set-default`,
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
      refetchMethods();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    },
  });

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Payment Methods</h2>
        <p className="text-muted-foreground">
          Manage your payment methods for bookings and subscriptions.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
            <Button
              onClick={() => setIsAddingPayment(true)}
              disabled={isAddingPayment}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {isLoadingMethods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method: any) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
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
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefaultPaymentMethod.mutate(method.id)}
                        disabled={setDefaultPaymentMethod.isPending}
                      >
                        Set as Default
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this payment method? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePaymentMethod.mutate(method.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods added yet</p>
              <p className="text-sm mt-2">Add a payment method to make bookings easier</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Payment Method Dialog */}
      <BasicPaymentForm
        isOpen={isAddingPayment}
        onClose={() => setIsAddingPayment(false)}
        onSuccess={() => {
          setIsAddingPayment(false);
          refetchMethods();
        }}
      />
    </div>
  );
}