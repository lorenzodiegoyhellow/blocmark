import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CreditCard, Building, Trash2, Check, Upload, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { PayoutMethodForm } from "./payout-method-form";

interface PayoutMethod {
  id: string;
  type: string;
  last4: string;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
  createdAt: string;
}

export function PayoutMethodsSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploadingW9, setIsUploadingW9] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payout methods
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/payout-methods"],
  });

  const payoutMethods = data?.payoutMethods || [];

  // Delete payout method mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        url: `/api/payout-methods/${id}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
      toast({
        title: "Success",
        description: "Payout method removed successfully",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove payout method",
        variant: "destructive",
      });
    },
  });

  // Set default payout method mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        url: `/api/payout-methods/${id}/default`,
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
      toast({
        title: "Success",
        description: "Default payout method updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update default payout method",
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
  };

  const handleW9Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingW9(true);

    try {
      const formData = new FormData();
      formData.append('w9', file);

      const response = await fetch('/api/payout-methods/upload-w9', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload W9 form');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "W9 form uploaded successfully",
      });

      // Refresh the payout methods data
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
    } catch (error) {
      console.error('Failed to upload W9:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload W9 form",
        variant: "destructive",
      });
    } finally {
      setIsUploadingW9(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatPayoutMethod = (method: PayoutMethod) => {
    if (method.type === "bank_account") {
      return {
        icon: <Building className="h-5 w-5" />,
        title: method.bankName || "Bank Account",
        subtitle: `${method.accountType === "savings" ? "Savings" : "Checking"} ••••${method.last4}`,
      };
    }
    // Fallback for other types
    return {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Payout Method",
      subtitle: `••••${method.last4}`,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Payout Settings</h2>
          <p className="text-muted-foreground">
            Manage your payout methods to receive payments from bookings.
          </p>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Payout Settings</h2>
          <p className="text-muted-foreground">
            Manage your payout methods to receive payments from bookings.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load payout methods. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Payout Settings</h2>
        <p className="text-muted-foreground">
          Manage your payout methods to receive payments from bookings.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payout Methods</h3>
            <Button onClick={() => setShowAddForm(true)}>Add Payout Method</Button>
          </div>

          {payoutMethods.length === 0 ? (
            <p className="text-muted-foreground py-4">
              No payout method added yet. Add a bank account to receive payments.
            </p>
          ) : (
            <div className="space-y-3">
              {payoutMethods.map((method) => {
                const formatted = formatPayoutMethod(method);
                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {formatted.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{formatted.title}</p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatted.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          {setDefaultMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Set as default
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(method.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tax Documents</h3>
          <p className="text-muted-foreground">
            Upload your W-9 form for tax compliance. This is required to receive payouts.
          </p>
          
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleW9Upload}
              className="hidden"
              id="w9-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingW9}
              className="flex items-center gap-2"
            >
              {isUploadingW9 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload W-9 Form
                </>
              )}
            </Button>
            
            {data?.w9Uploaded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-green-600">W-9 form uploaded</span>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Only PDF files up to 10MB are accepted. Your tax information is encrypted and stored securely.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payout History</h3>
          <p className="text-muted-foreground">
            View your recent payouts and transaction history.
          </p>
          <div className="text-center py-8 text-muted-foreground">
            No payout history available yet.
          </div>
        </div>
      </Card>

      {/* Add payout method form */}
      <PayoutMethodForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payout method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payout method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}