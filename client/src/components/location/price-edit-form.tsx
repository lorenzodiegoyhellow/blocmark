import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Location } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PricingMatrixGrid } from "@/components/PricingMatrixGrid";
import { Calculator, Plus, Info, TrendingUp } from "lucide-react";

const editPriceSchema = z.object({
  pricingMatrix: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  minHours: z.number().min(1, "Minimum hours must be at least 1").max(24, "Maximum allowed is 24 hours").default(3),
  additionalFees: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    type: z.enum(['flat', 'percentage'])
  })).optional(),
});

type Props = {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
};

export function PriceEditForm({ location, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingMatrix, setPricingMatrix] = useState<Record<string, Record<string, number>>>({});
  const [allowedActivities, setAllowedActivities] = useState<string[]>(['photo', 'video', 'event', 'meeting']);
  const [enabledActivities, setEnabledActivities] = useState<string[]>([]);
  const [enabledGroupSizes, setEnabledGroupSizes] = useState<string[]>(['small']); // Add state for enabled group sizes
  const [additionalFees, setAdditionalFees] = useState<Array<{name: string, amount: number, type: 'flat' | 'percentage'}>>([]);
  const [showAddFeeForm, setShowAddFeeForm] = useState(true);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [newFeeType, setNewFeeType] = useState<'flat' | 'percentage'>('flat');

  const form = useForm<z.infer<typeof editPriceSchema>>({
    resolver: zodResolver(editPriceSchema),
    defaultValues: {
      pricingMatrix: {},
      minHours: location.minHours || 3,
    },
  });

  // Initialize pricing matrix from location data
  useEffect(() => {
    if (isOpen && location) {
      // Always show all 4 activities
      const allActivities = ['photo', 'video', 'event', 'meeting'];
      
      // Use pricingMatrix if available, otherwise create one from old pricing structure
      if (location.pricingMatrix) {
        // Ensure all 4 activities are in the matrix, even if they weren't previously
        const existingMatrix = location.pricingMatrix as Record<string, Record<string, number>>;
        const basePrice = location.price || 0;
        const newMatrix: Record<string, Record<string, number>> = {};
        
        allActivities.forEach(activity => {
          if (existingMatrix[activity]) {
            newMatrix[activity] = existingMatrix[activity];
          } else {
            // Add default prices for activities that weren't in the matrix
            newMatrix[activity] = {
              small: basePrice,
              medium: basePrice * 1.25,
              large: basePrice * 1.5,
              extraLarge: basePrice * 2,
            };
          }
        });
        
        setPricingMatrix(newMatrix);
      } else {
        // Convert old pricing to new matrix format for backward compatibility
        const basePrice = location.price || 0;
        const newMatrix: Record<string, Record<string, number>> = {};
        
        allActivities.forEach(activity => {
          newMatrix[activity] = {
            small: basePrice,
            medium: basePrice * 1.25,
            large: basePrice * 1.5,
            extraLarge: basePrice * 2,
          };
        });
        
        setPricingMatrix(newMatrix);
      }
      
      // Always allow all activities in the UI
      setAllowedActivities(allActivities);
      
      // Only enable activities that have prices > 0 in the existing data
      const enabledList = location.allowedActivities || [];
      setEnabledActivities(enabledList);
      
      // Load enabled group sizes from location data
      const groupSizes = (location.enabledGroupSizes as string[]) || ['small'];
      setEnabledGroupSizes(groupSizes);
      
      form.reset({
        pricingMatrix: location.pricingMatrix as Record<string, Record<string, number>> || {},
        minHours: location.minHours || 3,
      });
    }
  }, [location, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof editPriceSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Derive allowedActivities from enabled activities (those with prices > 0)
      const finalAllowedActivities = enabledActivities;
      
      // Include the pricing matrix and enabled group sizes in the submission
      const submitData = {
        ...values,
        pricingMatrix,
        allowedActivities: finalAllowedActivities,
        enabledActivities,
        enabledGroupSizes, // Include enabled group sizes
      };
      
      await apiRequest({
        url: `/api/locations/${location.id}`,
        method: "PATCH",
        body: submitData
      });

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      
      // Force refetch the specific location
      await queryClient.refetchQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });

      toast({
        title: "Success",
        description: "Pricing updated successfully",
      });

      onClose();
    } catch (error: any) {
      console.error("Failed to update price:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update price",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePricingChange = (activity: string, groupSize: string, value: number) => {
    setPricingMatrix(prev => ({
      ...prev,
      [activity]: {
        ...prev[activity],
        [groupSize]: value
      }
    }));
  };

  const handleActivityToggle = (activity: string, enabled: boolean) => {
    if (enabled) {
      setEnabledActivities(prev => [...prev, activity]);
    } else {
      setEnabledActivities(prev => prev.filter(a => a !== activity));
    }
  };
  
  const handleGroupSizeToggle = (groupSize: string, enabled: boolean) => {
    // Don't allow disabling 'small' as it's required
    if (groupSize === 'small' && !enabled) return;
    
    if (enabled) {
      setEnabledGroupSizes(prev => [...prev, groupSize]);
    } else {
      setEnabledGroupSizes(prev => prev.filter(s => s !== groupSize));
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Pricing</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Pricing Matrix Grid */}
            <PricingMatrixGrid
              pricingMatrix={pricingMatrix}
              allowedActivities={allowedActivities}
              enabledActivities={enabledActivities}
              enabledGroupSizes={enabledGroupSizes} // Pass enabled group sizes
              onPriceChange={handlePricingChange}
              onActivityToggle={handleActivityToggle}
              onGroupSizeToggle={handleGroupSizeToggle} // Pass group size toggle handler
              baseHourlyRate={location.price || 100}
            />

            {/* Minimum Booking Hours */}
            <div className="bg-slate-50 rounded-lg p-4">
              <label className="text-sm font-medium mb-2 block">Minimum Booking Hours</label>
              <input
                type="number"
                min="1"
                max="24"
                value={form.watch('minHours') || 3}
                onChange={(e) => form.setValue('minHours', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum number of hours users must book your space for.
              </p>
            </div>

            {/* Additional Fees Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Plus className="w-4 h-4" />
                Additional Fees
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    Add extra fees like cleaning, security deposit, or site representative charges that will be shown at checkout.
                  </p>
                  
                  {additionalFees.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                      <span className="text-sm font-medium">{fee.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {fee.type === 'flat' ? '$' : ''}{fee.amount}{fee.type === 'percentage' ? '%' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdditionalFees(fees => fees.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Fee name"
                      value={newFeeName}
                      onChange={(e) => setNewFeeName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      className="w-24 px-3 py-2 border rounded-md text-sm"
                    />
                    <select
                      value={newFeeType}
                      onChange={(e) => setNewFeeType(e.target.value as 'flat' | 'percentage')}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="flat">Flat ($)</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newFeeName && newFeeAmount) {
                          setAdditionalFees([...additionalFees, {
                            name: newFeeName,
                            amount: Number(newFeeAmount),
                            type: newFeeType
                          }]);
                          setNewFeeName('');
                          setNewFeeAmount('');
                        }
                      }}
                    >
                      Add Additional Fee
                    </Button>
                  </div>
                </div>
            </div>

            {/* Earnings Calculator */}
            <div className="bg-blue-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Earnings Calculator</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['small', 'medium', 'large', 'extraLarge'].map((size) => {
                  const sizeLabels: Record<string, string> = {
                    small: '1-5 people',
                    medium: '6-15 people',
                    large: '16-30 people',
                    extraLarge: '31+ people'
                  };
                  
                  // Get average price from all enabled activities for this group size
                  const enabledPrices = enabledActivities
                    .map(activity => pricingMatrix[activity]?.[size])
                    .filter(price => price > 0);
                  
                  const rate = enabledPrices.length > 0 
                    ? Math.round(enabledPrices.reduce((sum, price) => sum + price, 0) / enabledPrices.length)
                    : 0;
                  
                  const hours = form.watch('minHours') || 1;
                  const total = rate * hours;
                  const blocmarkFee = total * 0.05;
                  const processingFee = (total * 0.029) + 0.30;
                  const earnings = total > 0 ? total - blocmarkFee - processingFee : 0;
                  
                  return (
                    <div key={size} className="text-center">
                      <p className="text-sm text-gray-600 mb-1">{sizeLabels[size]}</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${earnings > 0 ? earnings.toFixed(0) : '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rate > 0 ? `per ${hours}h booking` : 'Set prices above'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-xs text-gray-600 mt-2">
                <p>Average earnings after 5% Blocmark fee and payment processing (2.9% + $0.30)</p>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-900">Market Insights</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Average rates in your area: $120-$200/hour</li>
                    <li>• Monthly earnings potential: $1292 with regular bookings</li>
                    <li>• After 5% Blocmark fee, you keep 95% of all earnings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Pricing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
