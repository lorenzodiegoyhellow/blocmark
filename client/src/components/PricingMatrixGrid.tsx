import { Input } from "@/components/ui/input";
import { Camera, Calendar, Users, Video, DollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PricingMatrixGridProps {
  allowedActivities: string[];
  pricingMatrix: Record<string, Record<string, number>>;
  onPriceChange: (activity: string, groupSize: string, price: number) => void;
  onActivityToggle: (activity: string, enabled: boolean) => void;
  enabledActivities: string[];
  baseHourlyRate: number;
  enabledGroupSizes: string[];
  onGroupSizeToggle: (groupSize: string, enabled: boolean) => void;
}

const activityIcons: Record<string, any> = {
  photo: Camera,
  video: Video,
  event: Calendar,
  meeting: Users
};

const activityLabels: Record<string, string> = {
  photo: "Photo Shoot",
  video: "Video Production",
  event: "Event",
  meeting: "Meeting"
};

const groupSizes = [
  { key: "small", label: "1-5 people", description: "Individual or small team" },
  { key: "medium", label: "6-15 people", description: "Medium sized group" },
  { key: "large", label: "16-30 people", description: "Large group" },
  { key: "extraLarge", label: "31+ people", description: "Production or major event" }
];

export function PricingMatrixGrid({ 
  allowedActivities, 
  pricingMatrix, 
  onPriceChange,
  onActivityToggle,
  enabledActivities,
  baseHourlyRate,
  enabledGroupSizes,
  onGroupSizeToggle
}: PricingMatrixGridProps) {
  
  // Define fixed order for activities
  const activityOrder = ['photo', 'video', 'event', 'meeting'];
  
  // Sort allowed activities based on the fixed order
  const sortedActivities = [...allowedActivities].sort((a, b) => {
    return activityOrder.indexOf(a) - activityOrder.indexOf(b);
  });
  
  const getPrice = (activity: string, groupSize: string): number => {
    return pricingMatrix?.[activity]?.[groupSize] || baseHourlyRate || 0;
  };
  
  const isActivityEnabled = (activity: string) => {
    return enabledActivities.includes(activity);
  };

  // No need to check for empty activities since we always show all 4

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 font-medium mb-2">💡 Select Activities & Set Pricing</p>
        <p className="text-blue-700 text-sm">
          Check the activities you want to allow at your space, then set hourly rates for each activity type and group size. Activities with prices will be available for booking.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 bg-slate-100 rounded-tl-lg font-semibold text-slate-700">
                Activity Type
              </th>
              {groupSizes.map((size, index) => {
                const isRequired = size.key === "small";
                const isEnabled = (enabledGroupSizes || ['small']).includes(size.key);
                return (
                  <th key={size.key} className={`p-3 bg-slate-100 text-center ${index === groupSizes.length - 1 ? 'rounded-tr-lg' : ''}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Checkbox
                        checked={isEnabled}
                        disabled={isRequired}
                        onCheckedChange={(checked) => onGroupSizeToggle(size.key, checked as boolean)}
                        className="data-[state=checked]:bg-green-600"
                      />
                      <div className="font-semibold text-slate-700">
                        {size.label}
                        {isRequired && <span className="text-xs text-green-600 ml-1">(Required)</span>}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-normal">{size.description}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity, activityIndex) => {
              const Icon = activityIcons[activity] || Camera;
              return (
                <tr key={activity} className={activityIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className={`p-3 font-medium ${activityIndex === sortedActivities.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isActivityEnabled(activity)}
                        onCheckedChange={(checked) => onActivityToggle(activity, checked as boolean)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <Icon className={`w-5 h-5 ${isActivityEnabled(activity) ? 'text-slate-600' : 'text-slate-400'}`} />
                      <span className={`${isActivityEnabled(activity) ? 'text-slate-800' : 'text-slate-400'}`}>
                        {activityLabels[activity]}
                      </span>
                    </div>
                  </td>
                  {groupSizes.map((size, sizeIndex) => {
                    const isGroupSizeEnabled = (enabledGroupSizes || ['small']).includes(size.key);
                    const isDisabled = !isActivityEnabled(activity) || !isGroupSizeEnabled;
                    return (
                      <td key={size.key} className={`p-3 ${activityIndex === sortedActivities.length - 1 && sizeIndex === groupSizes.length - 1 ? 'rounded-br-lg' : ''}`}>
                        <div className="relative">
                          <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${!isDisabled ? 'text-slate-400' : 'text-slate-300'}`} />
                          <Input
                            type="number"
                            min="1"
                            placeholder="150"
                            className={`pl-8 w-full ${isDisabled ? 'bg-slate-100 text-slate-400' : ''}`}
                            disabled={isDisabled}
                            value={getPrice(activity, size.key) || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              onPriceChange(activity, size.key, value === '' ? 0 : Number(value));
                            }}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Fill Options */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-800 font-medium mb-3">⚡ Quick Fill Options</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              // Fill all cells with base rate (only for enabled group sizes)
              allowedActivities.forEach(activity => {
                groupSizes.forEach(size => {
                  if ((enabledGroupSizes || ['small']).includes(size.key)) {
                    onPriceChange(activity, size.key, baseHourlyRate || 100);
                  }
                });
              });
            }}
            className="px-3 py-1.5 bg-white border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors"
          >
            Fill all with base rate (${baseHourlyRate || 100})
          </button>
          <button
            type="button"
            onClick={() => {
              // Progressive pricing: increase by group size based on actual small group value (only for enabled group sizes)
              allowedActivities.forEach(activity => {
                const baseRate = getPrice(activity, "small") || baseHourlyRate || 100;
                const safeEnabledGroupSizes = enabledGroupSizes || ['small'];
                if (safeEnabledGroupSizes.includes("small")) onPriceChange(activity, "small", baseRate);
                if (safeEnabledGroupSizes.includes("medium")) onPriceChange(activity, "medium", Math.round(baseRate * 1.5));
                if (safeEnabledGroupSizes.includes("large")) onPriceChange(activity, "large", Math.round(baseRate * 2));
                if (safeEnabledGroupSizes.includes("extraLarge")) onPriceChange(activity, "extraLarge", Math.round(baseRate * 2.5));
              });
            }}
            className="px-3 py-1.5 bg-white border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors"
          >
            Progressive (+50% per size)
          </button>
          <button
            type="button"
            onClick={() => {
              // Event premium: events cost more based on current values (only for enabled group sizes)
              allowedActivities.forEach(activity => {
                const multiplier = activity === 'event' ? 1.5 : 1;
                groupSizes.forEach(size => {
                  if ((enabledGroupSizes || ['small']).includes(size.key)) {
                    const currentValue = getPrice(activity, size.key) || baseHourlyRate || 100;
                    onPriceChange(activity, size.key, Math.round(currentValue * multiplier));
                  }
                });
              });
            }}
            className="px-3 py-1.5 bg-white border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors"
          >
            Event Premium (+50%)
          </button>
        </div>
      </div>
    </div>
  );
}