import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  X, 
  Bath, 
  Home, 
  DoorOpen, 
  Car, 
  ArrowUpFromLine,
  TreePine,
  Flame,
  Layers,
  Trees,
  Building,
  Utensils,
  Fence,
  Activity,
  TrendingUp,
  Mountain,
  Square,
  Droplets,
  Grid3x3,
  Check,
  Sparkles,
  Search
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PROPERTY_FEATURES, formatFeature } from "@shared/property-features";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PropertyFeaturesSelectorProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  className?: string;
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "bathroom": Bath,
  "ceiling": Home,
  "doors": DoorOpen,
  "driveway": Car,
  "elevator": ArrowUpFromLine,
  "exterior": Building,
  "fireplace": Flame,
  "floor": Layers,
  "garden-yard": Trees,
  "interior": Home,
  "kitchen": Utensils,
  "porch": Fence,
  "sports-activity": Activity,
  "stairs": TrendingUp,
  "view": Mountain,
  "walls": Square,
  "water-features": Droplets,
  "windows": Grid3x3
};

export function PropertyFeaturesSelector({
  selectedFeatures,
  onFeaturesChange,
  className
}: PropertyFeaturesSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleFeature = (categoryName: string, subcategory: string) => {
    const formattedFeature = formatFeature(categoryName, subcategory);
    const newFeatures = [...selectedFeatures];
    const index = newFeatures.indexOf(formattedFeature);
    
    if (index > -1) {
      newFeatures.splice(index, 1);
    } else {
      newFeatures.push(formattedFeature);
    }
    
    onFeaturesChange(newFeatures);
  };

  const removeFeature = (feature: string) => {
    const newFeatures = selectedFeatures.filter(f => f !== feature);
    onFeaturesChange(newFeatures);
  };

  const getCategorySelectedCount = (categoryName: string) => {
    return selectedFeatures.filter(f => f.startsWith(`${categoryName}: `)).length;
  };

  const getTotalSubcategories = () => {
    return PROPERTY_FEATURES.reduce((total, category) => total + category.subcategories.length, 0);
  };

  // Filter categories and subcategories based on search term
  const filteredCategories = PROPERTY_FEATURES.map(category => {
    if (!searchTerm) return category;
    
    const matchingSubcategories = category.subcategories.filter(sub =>
      sub.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Include category if name matches or has matching subcategories
    if (category.name.toLowerCase().includes(searchTerm.toLowerCase()) || matchingSubcategories.length > 0) {
      return {
        ...category,
        subcategories: searchTerm ? matchingSubcategories : category.subcategories
      };
    }
    
    return null;
  }).filter(Boolean) as typeof PROPERTY_FEATURES;

  return (
    <Card className={cn("w-full border-2 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Property Features</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select from {getTotalSubcategories()} available features across {PROPERTY_FEATURES.length} categories
              </p>
            </div>
          </div>
          {selectedFeatures.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <Check className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {selectedFeatures.length} selected
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Selected Features Display */}
        {selectedFeatures.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-sm font-semibold text-gray-700">
                  Your Selected Features
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeaturesChange([])}
                className="text-xs hover:bg-white/50 transition-colors"
              >
                Clear All
              </Button>
            </div>
            <ScrollArea className="max-h-32">
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="cursor-pointer bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 py-1.5 px-3 shadow-sm"
                    onClick={() => removeFeature(feature)}
                  >
                    <span className="text-xs">{feature}</span>
                    <X className="ml-1.5 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Categories with Subcategories */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No features found matching "{searchTerm}"</p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const selectedCount = getCategorySelectedCount(category.name);
                const isExpanded = expandedCategories.has(category.id) || searchTerm !== "";
                const Icon = categoryIcons[category.id] || Home;
                const hasVisibleSubcategories = searchTerm ? category.subcategories.length > 0 : true;
                
                if (!hasVisibleSubcategories && searchTerm) return null;
                
                return (
                  <Collapsible
                    key={category.id}
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between hover:bg-gray-50 transition-all duration-200 py-3",
                          selectedCount > 0 && "bg-blue-50/50 hover:bg-blue-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            selectedCount > 0 ? "bg-blue-100" : "bg-gray-100"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              selectedCount > 0 ? "text-blue-600" : "text-gray-600"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium",
                            selectedCount > 0 && "text-blue-900"
                          )}>
                            {category.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({category.subcategories.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-2 py-0.5"
                            >
                              {selectedCount}
                            </Badge>
                          )}
                          <div className={cn(
                            "transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-12 pr-4 pt-2 pb-4 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.subcategories.map((subcategory) => {
                          const formattedFeature = formatFeature(category.name, subcategory);
                          const isSelected = selectedFeatures.includes(formattedFeature);
                          
                          return (
                            <div
                              key={subcategory}
                              className={cn(
                                "flex items-center space-x-2.5 py-2 px-3 rounded-lg transition-all duration-150 hover:bg-gray-50",
                                isSelected && "bg-blue-50 hover:bg-blue-100"
                              )}
                            >
                              <Checkbox
                                id={`${category.id}-${subcategory}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleFeature(category.name, subcategory)}
                                className={cn(
                                  "border-gray-300",
                                  isSelected && "border-blue-500 bg-blue-500"
                                )}
                              />
                              <label
                                htmlFor={`${category.id}-${subcategory}`}
                                className={cn(
                                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none",
                                  isSelected ? "text-blue-900" : "text-gray-700"
                                )}
                              >
                                {subcategory}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}