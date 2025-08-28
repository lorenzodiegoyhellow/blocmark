import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PricingMatrixGrid } from "@/components/PricingMatrixGrid";
import { Clock, ImagePlus, Shield, Calculator, TrendingUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface SimplifiedPricingSectionProps {
  pricingForm: UseFormReturn<any>;
  propertyTypeForm: UseFormReturn<any>;
  onPricingSubmit: (values: any) => void;
  setStep: (step: number) => void;
}

export function SimplifiedPricingSection({
  pricingForm,
  propertyTypeForm,
  onPricingSubmit,
  setStep
}: SimplifiedPricingSectionProps) {
  
  // All activities are available by default in the new flow
  const allActivities = ['photo', 'video', 'event', 'meeting'];
  const [enabledActivities, setEnabledActivities] = React.useState<string[]>([]);
  const [enabledGroupSizes, setEnabledGroupSizes] = React.useState<string[]>(['small']);

  // Initialize enabled activities and group sizes from existing data on mount
  React.useEffect(() => {
    const matrix = pricingForm.getValues('pricingMatrix') || {};
    const existingGroupSizes = pricingForm.getValues('enabledGroupSizes');
    
    // Initialize enabled group sizes from existing data or default to just 'small'
    let finalGroupSizes = ['small']; // Default
    
    if (existingGroupSizes && Array.isArray(existingGroupSizes) && existingGroupSizes.length > 0) {
      finalGroupSizes = existingGroupSizes;
    } else {
      // Check which group sizes have prices set in the matrix
      const sizesWithPrices = new Set<string>();
      Object.values(matrix).forEach((activityPrices: any) => {
        if (activityPrices) {
          Object.entries(activityPrices).forEach(([size, price]) => {
            if ((price as number) > 0) sizesWithPrices.add(size);
          });
        }
      });
      
      // If sizes have prices, use them; otherwise default to 'small'
      if (sizesWithPrices.size > 0) {
        // Always include 'small' if any sizes have prices
        sizesWithPrices.add('small');
        finalGroupSizes = Array.from(sizesWithPrices);
      }
    }
    
    setEnabledGroupSizes(finalGroupSizes);
    // Also set the form value to ensure validation passes
    pricingForm.setValue('enabledGroupSizes', finalGroupSizes, { 
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false 
    });
    
    // Initialize activities with prices
    const activitiesWithPrices = allActivities.filter(activity => {
      const activityPrices = matrix[activity];
      if (!activityPrices) return false;
      // Check if any price is set for this activity
      return Object.values(activityPrices).some((price: any) => price > 0);
    });
    if (activitiesWithPrices.length > 0) {
      setEnabledActivities(activitiesWithPrices);
    }
  }, []); // Only run on mount

  const handlePriceChange = (activity: string, groupSize: string, price: number) => {
    const currentMatrix = pricingForm.getValues('pricingMatrix') || {};
    if (!currentMatrix[activity]) {
      currentMatrix[activity] = {};
    }
    currentMatrix[activity][groupSize] = price;
    pricingForm.setValue('pricingMatrix', currentMatrix, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const handleActivityToggle = (activity: string, enabled: boolean) => {
    if (enabled) {
      setEnabledActivities(prev => [...prev, activity]);
    } else {
      setEnabledActivities(prev => prev.filter(a => a !== activity));
    }
  };

  const handleGroupSizeToggle = (groupSize: string, enabled: boolean) => {
    // Don't allow disabling 'small' group size
    if (groupSize === 'small' && !enabled) return;
    
    if (enabled) {
      setEnabledGroupSizes(prev => [...prev, groupSize]);
    } else {
      setEnabledGroupSizes(prev => prev.filter(s => s !== groupSize));
      // Clear prices for disabled group size
      const currentMatrix = pricingForm.getValues('pricingMatrix') || {};
      Object.keys(currentMatrix).forEach(activity => {
        if (currentMatrix[activity] && currentMatrix[activity][groupSize]) {
          delete currentMatrix[activity][groupSize];
        }
      });
      pricingForm.setValue('pricingMatrix', currentMatrix, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    }
    
    // Update the form with enabled group sizes
    pricingForm.setValue('enabledGroupSizes', enabled 
      ? [...enabledGroupSizes, groupSize].filter(s => s !== groupSize || enabled)
      : enabledGroupSizes.filter(s => s !== groupSize),
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  const handleSubmit = (data: any) => {
    // Ensure enabledGroupSizes is included in the submission
    const submissionData = {
      ...data,
      enabledGroupSizes: enabledGroupSizes
    };
    onPricingSubmit(submissionData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...pricingForm}>
        <form onSubmit={pricingForm.handleSubmit(handleSubmit)} className="space-y-8">

          {/* Minimum Booking Hours */}
          <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Minimum Booking
            </h4>
            
            <div className="max-w-xs">
              <FormField
                control={pricingForm.control}
                name="minHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium text-slate-900">Minimum Hours Required</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="2"
                          className="pl-10 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 text-lg font-medium"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? 0 : Number(value));
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-600 mt-2">
                      Guests must book at least this many hours
                    </p>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Simplified Pricing Matrix */}
          <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              Activity-Based Flat Rates
            </h4>
            
            <PricingMatrixGrid
              allowedActivities={allActivities}
              pricingMatrix={pricingForm.watch('pricingMatrix') || {}}
              onPriceChange={handlePriceChange}
              onActivityToggle={handleActivityToggle}
              enabledActivities={enabledActivities}
              baseHourlyRate={100}
              enabledGroupSizes={enabledGroupSizes}
              onGroupSizeToggle={handleGroupSizeToggle}
            />
          </div>

          {/* Earnings Calculator */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-3 mb-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  Your Earnings Calculator
                </h4>
                <p className="text-slate-600">See how much you'll earn with simplified flat rates</p>
              </div>

              {/* Simple Example Calculation */}
              <div className="bg-white rounded-xl p-6 shadow-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Example Booking
                    </label>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Photo Shoot (1-5 people):</span>
                        <span className="font-semibold">
                          ${(() => {
                            const matrix = pricingForm.watch('pricingMatrix') || {};
                            return matrix?.photo?.small || 100;
                          })()} /hour
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-semibold">{pricingForm.watch("minHours") || 2} hours</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">
                          ${(() => {
                            const matrix = pricingForm.watch('pricingMatrix') || {};
                            const rate = matrix?.photo?.small || 100;
                            const hours = pricingForm.watch("minHours") || 2;
                            return rate * hours;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Your Earnings
                    </label>
                    <div className="bg-green-100 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Blocmark Fee (5%):</span>
                        <span className="text-red-600 font-semibold">
                          -${(() => {
                            const matrix = pricingForm.watch('pricingMatrix') || {};
                            const rate = matrix?.photo?.small || 100;
                            const hours = pricingForm.watch("minHours") || 2;
                            return (rate * hours * 0.05).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Processing (2.9% + $0.30):</span>
                        <span className="text-red-600 font-semibold">
                          -${(() => {
                            const matrix = pricingForm.watch('pricingMatrix') || {};
                            const rate = matrix?.photo?.small || 100;
                            const hours = pricingForm.watch("minHours") || 2;
                            return ((rate * hours * 0.029) + 0.30).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-lg">
                        <span className="text-green-800">You Earn:</span>
                        <span className="text-green-800">
                          ${(() => {
                            const matrix = pricingForm.watch('pricingMatrix') || {};
                            const rate = matrix?.photo?.small || 100;
                            const hours = pricingForm.watch("minHours") || 2;
                            const total = rate * hours;
                            return (total - (total * 0.05) - (total * 0.029) - 0.30).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tips */}
          <div className="bg-white rounded-xl p-6 border">
            <h5 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Simplified Pricing Benefits
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Clear & Transparent</p>
                    <p className="text-slate-600">Guests see exactly what they'll pay - no confusing calculations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Easy to Manage</p>
                    <p className="text-slate-600">Update prices anytime without complex formulas</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Activity-Specific</p>
                    <p className="text-slate-600">Charge appropriately for different use cases</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Group-Based</p>
                    <p className="text-slate-600">Fair pricing that scales with group size</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-6 flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(4)}
              className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl font-medium transition-all duration-200"
            >
              <Shield className="mr-2 h-5 w-5" />
              Back to Details
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Next: Photos
              <ImagePlus className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}