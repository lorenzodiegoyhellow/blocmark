import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PayoutMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayoutMethodForm({ isOpen, onClose, onSuccess }: PayoutMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    method: "direct_deposit",
    businessName: "",
    accountType: "checking",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    routingNumber: "",
    accountNumber: "",
    setAsDefault: false,
    w9BusinessName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.businessName || !formData.address || !formData.city || 
        !formData.state || !formData.zipCode || !formData.routingNumber || 
        !formData.accountNumber || !formData.w9BusinessName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate routing number (9 digits)
    if (!/^\d{9}$/.test(formData.routingNumber)) {
      toast({
        title: "Error",
        description: "Routing number must be 9 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest({
        url: "/api/payout-methods",
        method: "POST",
        body: formData,
      });
      
      toast({
        title: "Success",
        description: "Payout method added successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to add payout method:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payout method",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">Add payout method</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Method</Label>
              <Select value={formData.method} onValueChange={(value) => handleInputChange("method", value)}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_deposit">Direct deposit (ACH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="w9BusinessName">W-9</Label>
              <Input
                id="w9BusinessName"
                placeholder="Business legal name"
                value={formData.w9BusinessName}
                onChange={(e) => handleInputChange("w9BusinessName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Business Name and Account Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Full name / Business name</Label>
              <Input
                id="businessName"
                placeholder="e.g. LUMINA LLC"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="accountType">Type</Label>
              <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter a location"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>
          </div>

          {/* State and ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                placeholder="ZIP code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routingNumber">Routing number</Label>
              <Input
                id="routingNumber"
                placeholder="Bottom left of check"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                maxLength={9}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Bottom left of check</p>
            </div>
            
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Bottom center of check"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Bottom center of check</p>
            </div>
          </div>

          {/* Set as default */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="setAsDefault"
              checked={formData.setAsDefault}
              onCheckedChange={(checked) => handleInputChange("setAsDefault", checked as boolean)}
            />
            <Label htmlFor="setAsDefault" className="text-sm font-normal cursor-pointer">
              Set as default
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add payout method"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}