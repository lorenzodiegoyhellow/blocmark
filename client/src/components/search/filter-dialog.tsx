import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROPERTY_FEATURES } from "@shared/property-features";

interface FilterDialogProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SearchFilters {
  priceRange: [number, number];
  capacity?: number;
  amenities: string[];
  activity?: string;
  city?: string;
  location?: string;
  minHours?: number;
  recentlyAdded?: boolean;
  instantBook?: boolean;
  keywords?: string;
  houseStyles?: string[];
  propertyFeatures?: string[];
  parkingFeatures?: string[];
  accessFeatures?: string[];
}

const AMENITIES = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Heating",
  "Natural Light",
  "Blackout Curtains",
  "Sound System",
  "Changing Room",
  "Kitchen",
  "Restroom",
  "Elevator",
  "Loading Dock",
];

const PARKING_FEATURES = [
  { value: "onsiteParking", label: "On-Site Parking" },
  { value: "adaAccessible", label: "ADA Accessible Parking" },
  { value: "evCharging", label: "EV Charging Station" },
  { value: "coveredGarage", label: "Covered Garage" },
  { value: "gatedSecured", label: "Gated/Secured Parking" },
  { value: "valetService", label: "Valet Service" },
  { value: "twentyFourSeven", label: "24/7 Access" },
  { value: "nearbyPaidLot", label: "Nearby Paid Lot" },
  { value: "loadingZone", label: "Loading Zone" },
  { value: "streetParking", label: "Street Parking" },
  { value: "busCoachParking", label: "Bus/Coach Parking" },
  { value: "basecampCrewArea", label: "Basecamp/Crew Area" },
  { value: "pullThrough", label: "Pull-Through Access" },
  { value: "levelSurface", label: "Level Surface" },
  { value: "overnightAllowed", label: "Overnight Parking Allowed" },
  { value: "shorePower", label: "Shore Power Available" },
  { value: "waterSewer", label: "Water/Sewer Hookups" },
  { value: "trailerStorage", label: "Trailer Storage" }
];

const ACCESS_FEATURES = [
  { value: "elevator", label: "Elevator" },
  { value: "stairs", label: "Stairs Only" },
  { value: "streetLevel", label: "Street Level Entry" },
  { value: "wheelchairAccess", label: "Wheelchair Accessible" },
  { value: "freightElevator", label: "Freight Elevator" },
  { value: "stepFreeRamp", label: "Step-Free Ramp" },
  { value: "loadingDock", label: "Loading Dock" },
  { value: "rollUpDoor", label: "Roll-Up Door" },
  { value: "doubleWideDoors", label: "Double-Wide Doors" },
  { value: "driveInAccess", label: "Drive-In Access" },
  { value: "corridorMinWidth", label: "Wide Corridors" },
  { value: "freightElevatorCapacity", label: "High Capacity Freight Elevator" },
  { value: "keylessEntry", label: "Keyless Entry" },
  { value: "onSiteSecurity", label: "On-Site Security" },
  { value: "dolliesAvailable", label: "Dollies/Carts Available" }
];

const POPULAR_CITIES = [
  // American Cities
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Chicago, IL, USA",
  "Houston, TX, USA",
  "Phoenix, AZ, USA",
  "Philadelphia, PA, USA",
  "San Antonio, TX, USA",
  "San Diego, CA, USA",
  "Dallas, TX, USA",
  "San Jose, CA, USA",
  "Austin, TX, USA",
  "Jacksonville, FL, USA",
  "Fort Worth, TX, USA",
  "Columbus, OH, USA",
  "Indianapolis, IN, USA",
  "Charlotte, NC, USA",
  "San Francisco, CA, USA",
  "Seattle, WA, USA",
  "Denver, CO, USA",
  "Boston, MA, USA",
  "Nashville, TN, USA",
  "Las Vegas, NV, USA",
  "Miami, FL, USA",
  "Atlanta, GA, USA",
  
  // Italian Cities
  "Rome, Italy",
  "Milan, Italy",
  "Naples, Italy",
  "Turin, Italy",
  "Palermo, Italy",
  "Genoa, Italy",
  "Bologna, Italy",
  "Florence, Italy",
  "Bari, Italy",
  "Catania, Italy",
  "Venice, Italy",
  "Verona, Italy",
  "Messina, Italy",
  "Padua, Italy",
  "Trieste, Italy",
  "Brescia, Italy",
  "Taranto, Italy",
  "Prato, Italy",
  "Parma, Italy",
  "Modena, Italy",
  "Reggio Calabria, Italy",
  "Reggio Emilia, Italy",
  "Perugia, Italy",
  "Livorno, Italy",
  "Ravenna, Italy",
  "Cagliari, Italy",
  "Foggia, Italy",
  "Rimini, Italy",
  "Salerno, Italy",
  "Ferrara, Italy"
];

const HOUSE_STYLES = [
  "Americana",
  "Art Deco",
  "Asian",
  "Baroque",
  "Beach House",
  "Beachfront",
  "Bohemian",
  "Brutalist",
  "Bungalow",
  "Cabin",
  "Cape Cod",
  "Castle/Chateau",
  "Colonial",
  "Contemporary Modern",
  "Craftsman",
  "Creole",
  "Dated",
  "Desert",
  "Dilapidated",
  "Dutch Colonial",
  "Exotic",
  "French",
  "Georgian",
  "Gothic",
  "Greek",
  "High Tech",
  "Industrial",
  "Lake House",
  "Maximalist",
  "Mediterranean",
  "Mid-century Modern",
  "Minimalist",
  "Moroccan",
  "Old Hollywood",
  "Postmodern",
  "Ranch Style",
  "Rustic",
  "Spanish",
  "Trailer Park",
  "Tudor",
  "Victorian",
  "Zen"
];

export function FilterDialog({ onFiltersChange, initialFilters, open, onOpenChange }: FilterDialogProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    priceRange: [0, 1000],
    capacity: 5,
    amenities: [],
    minHours: 1,
    location: '',
    recentlyAdded: false,
    instantBook: false,
    keywords: '',
    houseStyles: [],
    propertyFeatures: [],
    parkingFeatures: [],
    accessFeatures: [],
  });
  
  const [locationOpen, setLocationOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [houseStylesOpen, setHouseStylesOpen] = useState(false);
  const [parkingOpen, setParkingOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [styleSearch, setStyleSearch] = useState("");
  const [featureSearch, setFeatureSearch] = useState("");
  const [parkingSearch, setParkingSearch] = useState("");
  const [accessSearch, setAccessSearch] = useState("");

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number]
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    onOpenChange?.(false);
  };

  return (
    <Sheet open={open ?? false} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <Label>Location Search</Label>
            <div className="w-full relative">
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setLocationOpen(!locationOpen)}
              >
                {filters.location
                  ? POPULAR_CITIES.find((city) => city === filters.location) || filters.location
                  : "Select city or type custom location..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {locationOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setLocationOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search cities or type custom location..."
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        value={filters.location || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {filters.location && !POPULAR_CITIES.includes(filters.location) && (
                        <div className="p-2 border-b">
                          <div
                            className="w-full text-left px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocationOpen(false);
                            }}
                          >
                            Use "{filters.location}"
                          </div>
                        </div>
                      )}
                      <div className="text-xs font-semibold text-gray-500 px-2">Popular Cities</div>
                      <div 
                        className="max-h-[250px] overflow-y-scroll space-y-1"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1'
                        }}
                      >
                        {POPULAR_CITIES.filter(city => 
                          city.toLowerCase().includes((filters.location || '').toLowerCase())
                        ).map((city) => (
                          <div
                            key={city}
                            className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilters(prev => ({ 
                                ...prev, 
                                location: city === filters.location ? "" : city 
                              }));
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.location === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="text-sm">{city}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Select a popular city or type any location
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Keywords Search</Label>
            <div className="w-full">
              <Input
                type="text"
                placeholder="e.g., vintage, skyline, modern"
                value={filters.keywords || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                className="w-full"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Search in location titles and descriptions
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Price Range</Label>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>from ${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  min={0}
                  max={1000}
                  step={50}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Minimum Capacity</Label>
            <div className="px-2">
              <Slider
                value={[filters.capacity || 5]}
                min={5}
                max={100}
                step={5}
                onValueChange={(value) => setFilters(prev => ({ ...prev, capacity: value[0] }))}
              />
              <div className="mt-2 text-sm text-muted-foreground">
                <span>Minimum {filters.capacity} people</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Minimum Hours</Label>
            <div className="px-2">
              <Slider
                value={[filters.minHours || 1]}
                min={1}
                max={12}
                step={1}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minHours: value[0] }))}
              />
              <div className="mt-2 text-sm text-muted-foreground">
                <span>Minimum {filters.minHours || 1} hour{(filters.minHours || 1) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => {
                      const newAmenities = checked
                        ? [...filters.amenities, amenity]
                        : filters.amenities.filter((a) => a !== amenity);
                      setFilters(prev => ({ ...prev, amenities: newAmenities }));
                    }}
                  />
                  <label htmlFor={amenity} className="text-sm">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Property Style</Label>
            <div className="w-full relative">
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setHouseStylesOpen(!houseStylesOpen)}
              >
                {filters.houseStyles && filters.houseStyles.length > 0
                  ? `${filters.houseStyles.length} styles selected`
                  : "Select property styles..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {houseStylesOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setHouseStylesOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search property styles..."
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        value={styleSearch}
                        onChange={(e) => setStyleSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="max-h-[300px] overflow-y-scroll space-y-1"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1'
                        }}
                      >
                        {HOUSE_STYLES.filter(style => 
                          style.toLowerCase().includes(styleSearch.toLowerCase())
                        ).map((style) => {
                          const isSelected = filters.houseStyles?.includes(style);
                          return (
                            <div
                              key={style}
                              className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentStyles = filters.houseStyles || [];
                                if (isSelected) {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    houseStyles: currentStyles.filter(s => s !== style)
                                  }));
                                } else {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    houseStyles: [...currentStyles, style]
                                  }));
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {}}
                                className="mr-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm">{style}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Filter by architectural or design style
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Property Features</Label>
            <div className="w-full relative">
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setFeaturesOpen(!featuresOpen)}
              >
                {filters.propertyFeatures && filters.propertyFeatures.length > 0
                  ? `${filters.propertyFeatures.length} features selected`
                  : "Select property features..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {featuresOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setFeaturesOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search features..."
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        value={featureSearch}
                        onChange={(e) => setFeatureSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="max-h-[300px] overflow-y-scroll space-y-2"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1'
                        }}
                      >
                        {PROPERTY_FEATURES.map((category) => {
                          const filteredSubcategories = category.subcategories.slice(0, 5).filter(subcategory =>
                            subcategory.toLowerCase().includes(featureSearch.toLowerCase()) ||
                            category.name.toLowerCase().includes(featureSearch.toLowerCase())
                          );
                          
                          if (filteredSubcategories.length === 0) return null;
                          
                          return (
                            <div key={category.id} className="space-y-1">
                              <div className="text-xs font-semibold text-gray-500 px-2">{category.name}</div>
                              {filteredSubcategories.map((subcategory) => {
                                const feature = `${category.name}: ${subcategory}`;
                                const isSelected = filters.propertyFeatures?.includes(feature);
                                return (
                                  <div
                                    key={feature}
                                    className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentFeatures = filters.propertyFeatures || [];
                                      if (isSelected) {
                                        setFilters(prev => ({ 
                                          ...prev, 
                                          propertyFeatures: currentFeatures.filter(f => f !== feature)
                                        }));
                                      } else {
                                        setFilters(prev => ({ 
                                          ...prev, 
                                          propertyFeatures: [...currentFeatures, feature]
                                        }));
                                      }
                                    }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {}}
                                      className="mr-2"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-sm">{subcategory}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Select property features to filter by
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Parking Features</Label>
            <div className="w-full relative">
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setParkingOpen(!parkingOpen)}
              >
                {filters.parkingFeatures && filters.parkingFeatures.length > 0
                  ? `${filters.parkingFeatures.length} parking options selected`
                  : "Select parking features..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {parkingOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setParkingOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search parking features..."
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        value={parkingSearch}
                        onChange={(e) => setParkingSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="max-h-[300px] overflow-y-scroll space-y-1"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1'
                        }}
                      >
                        {PARKING_FEATURES.filter(feature => 
                          feature.label.toLowerCase().includes(parkingSearch.toLowerCase())
                        ).map((feature) => {
                          const isSelected = filters.parkingFeatures?.includes(feature.value);
                          return (
                            <div
                              key={feature.value}
                              className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentFeatures = filters.parkingFeatures || [];
                                if (isSelected) {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    parkingFeatures: currentFeatures.filter(f => f !== feature.value)
                                  }));
                                } else {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    parkingFeatures: [...currentFeatures, feature.value]
                                  }));
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {}}
                                className="mr-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm">{feature.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Filter by available parking options
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Access Features</Label>
            <div className="w-full relative">
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setAccessOpen(!accessOpen)}
              >
                {filters.accessFeatures && filters.accessFeatures.length > 0
                  ? `${filters.accessFeatures.length} access features selected`
                  : "Select access features..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {accessOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setAccessOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search access features..."
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        value={accessSearch}
                        onChange={(e) => setAccessSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="max-h-[300px] overflow-y-scroll space-y-1"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1'
                        }}
                      >
                        {ACCESS_FEATURES.filter(feature => 
                          feature.label.toLowerCase().includes(accessSearch.toLowerCase())
                        ).map((feature) => {
                          const isSelected = filters.accessFeatures?.includes(feature.value);
                          return (
                            <div
                              key={feature.value}
                              className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentFeatures = filters.accessFeatures || [];
                                if (isSelected) {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    accessFeatures: currentFeatures.filter(f => f !== feature.value)
                                  }));
                                } else {
                                  setFilters(prev => ({ 
                                    ...prev, 
                                    accessFeatures: [...currentFeatures, feature.value]
                                  }));
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {}}
                                className="mr-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm">{feature.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Filter by accessibility and access options
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recentlyAdded"
                checked={filters.recentlyAdded}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ ...prev, recentlyAdded: checked as boolean }));
                }}
              />
              <label htmlFor="recentlyAdded" className="text-sm font-medium">
                Recently Added (last 30 days)
              </label>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instantBook"
                  checked={filters.instantBook}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({ ...prev, instantBook: checked as boolean }));
                  }}
                />
                <label htmlFor="instantBook" className="text-sm font-medium">
                  Instant Book
                </label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Listings you can book without waiting for Host approval
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}