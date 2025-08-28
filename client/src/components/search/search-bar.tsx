import { useState, useEffect, useRef, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Camera, ListFilter, Wand2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageSearch } from "@/components/search/image-search";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Import Google Maps types for TypeScript support
import type { } from "@/types/google-maps";

// City Autocomplete component
type CityAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const popularCities = [
  // North America
  "New York", "Los Angeles", "Chicago", "Toronto", "Vancouver", "Montreal",
  "Mexico City", "San Francisco", "Miami", "Calgary", "Seattle", "Boston",
  // South America
  "São Paulo", "Buenos Aires", "Rio de Janeiro", "Lima", "Bogotá", "Santiago",
  // Europe
  "London", "Paris", "Rome", "Milan", "Florence", "Venice", "Naples", "Turin",
  "Barcelona", "Madrid", "Berlin", "Munich", "Frankfurt", "Amsterdam", "Brussels",
  "Vienna", "Prague", "Warsaw", "Copenhagen", "Oslo", "Stockholm", "Helsinki",
  "Dublin", "Athens", "Lisbon", "Budapest", "Istanbul", "Zurich", "Geneva",
  // Asia
  "Tokyo", "Kyoto", "Osaka", "Shanghai", "Beijing", "Hong Kong", "Singapore", 
  "Seoul", "Bangkok", "Mumbai", "Delhi", "Dubai", "Abu Dhabi", "Kuala Lumpur", 
  "Jakarta", "Ho Chi Minh City",
  // Australia/Oceania
  "Sydney", "Melbourne", "Auckland", "Brisbane", "Perth", "Wellington",
  // Africa
  "Cairo", "Cape Town", "Johannesburg", "Nairobi", "Marrakech", "Lagos"
];

const CityAutocomplete = forwardRef<HTMLInputElement, CityAutocompleteProps>(({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}, ref) => {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Forward the ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // Fetch city predictions
  useEffect(() => {
    if (!value || value.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    const fetchPredictions = () => {
      setIsLoading(true);
      try {
        const searchTerm = value.toLowerCase();
        
        // Cities that start with the search term (higher priority)
        const exactMatches = popularCities.filter(city => 
          city.toLowerCase().startsWith(searchTerm)
        );
        
        // Cities that contain the search term anywhere (lower priority)
        const partialMatches = popularCities.filter(city => 
          !city.toLowerCase().startsWith(searchTerm) && 
          city.toLowerCase().includes(searchTerm)
        );
        
        // Combine results with exact matches first
        const filteredCities = [...exactMatches, ...partialMatches];
        
        setPredictions(filteredCities);
        setShowDropdown(filteredCities.length > 0);
      } catch (error) {
        console.error('Error fetching city predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // If Google Maps API is available, use it for better predictions
    if (window.google?.maps?.places?.AutocompleteService) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { 
            input: value,
            types: ['(cities)']
            // Removed country restriction to allow worldwide cities
          },
          (predictions, status) => {
            setIsLoading(false);
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
              // Fall back to our static list
              fetchPredictions();
              return;
            }
            
            const cityNames = predictions.map(p => 
              p.structured_formatting.main_text
            );
            setPredictions(cityNames);
            setShowDropdown(cityNames.length > 0);
          }
        );
      } catch (error) {
        // Fall back to our static list if Google API fails
        fetchPredictions();
      }
    } else {
      // Use our static list if Google API is not available
      fetchPredictions();
    }
  }, [value]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        // Also clear predictions when clicking outside to prevent them from reappearing later
        setPredictions([]);
      }
    };

    // Handle any clicks on the document (for better UI experience)
    const handleDocumentClick = () => {
      // Small delay to allow the prediction click to be processed first
      setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          setShowDropdown(false);
        }
      }, 100);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const handlePredictionClick = (city: string) => {
    onChange(city);
    setPredictions([]); // Clear predictions
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            // Only show dropdown when typing and has content
            if (newValue.length > 1) {
              setShowDropdown(true);
            } else {
              // Clear everything if empty
              setPredictions([]);
              setShowDropdown(false);
            }
          }}
          placeholder={placeholder || t("search.cityPlaceholder")}
          className={cn(className)}
          disabled={disabled}
          onFocus={() => value.length > 1 && predictions.length > 0 && setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500"></div>
          </div>
        )}
      </div>
      
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-72 overflow-y-auto border">
          <ul className="py-1">
            {predictions.map((city, index) => (
              <li
                key={`${city}-${index}`}
                className="px-4 py-2 flex items-center cursor-pointer hover:bg-muted"
                onClick={() => handlePredictionClick(city)}
              >
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                <span>{city}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

CityAutocomplete.displayName = "CityAutocomplete";

type SearchMode = "ai" | "classic";

interface SearchBarProps {
  onModeChange?: (mode: "ai" | "classic") => void;
}

export function SearchBar({ onModeChange }: SearchBarProps = {}) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("ai");

  // Notify parent component when search mode changes
  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    onModeChange?.(mode);
  };
  const [date, setDate] = useState<Date>();
  const [activityType, setActivityType] = useState<string>();
  const [isSearching, setIsSearching] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleImageSearchResults = (results: any) => {
    console.log("Image search results:", results);
    try {
      // Navigate to the AI search results page with the results
      // We'll use the existing ai-search-results page for simplicity
      localStorage.setItem('imageSearchResults', JSON.stringify(results));
      window.location.href = '/ai-search-results?type=image';
    } catch (error) {
      console.error("Error processing image search results:", error);
      toast({
        title: "Search failed",
        description: "Could not process search results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== SEARCH SUBMITTED ===");
    console.log("Query:", query);
    console.log("Search mode:", searchMode);
    
    // Allow empty searches to show all results
    // We'll still log if it's an empty search
    if (!query.trim()) {
      console.log("Empty search - showing all available locations");
    }
    
    // Set searching state
    setIsSearching(true);
    
    try {
      // Check if this is a visual feature search (special terms that trigger visual search)
      const visualFeaturePattern = /couch|sofa|chair|table|desk|wall|brick|hardwood|ceiling|window|light|palm|tree|mansion|studio|mirror|kitchen|bathroom|carpet|art|painting|plant|counter|cabinet|door|stair/i;
      const isVisualSearch = visualFeaturePattern.test(query);
      
      // Store search query in localStorage for improved reliability
      console.log("Storing search query in localStorage:", query.trim());
      localStorage.setItem('aiSearchQuery', query.trim());
      
      // Build URL parameters
      const params = new URLSearchParams();
      params.set("q", query);
      
      // Add optional parameters if provided
      if (date) params.set("date", date.toISOString());
      if (activityType) params.set("type", activityType);
      
      // If it's a visual search term, always use AI mode and show a notification
      if (isVisualSearch) {
        console.log("Visual feature search detected:", query);
        
        // Always use AI mode for visual searches
        params.set("mode", "ai");
        
        // Show a notification about visual search
        toast({
          title: "Visual Features Search",
          description: "Using AI to find locations with specific visual elements in their photos",
          duration: 2500,
        });
        
        // For visual search, always use simple-search with mode=ai
        console.log("Visual search - navigating to simple-search results");
        window.location.href = `/simple-search?${params.toString()}`;
        return;
      }
      
      // Set normal search mode
      params.set("mode", searchMode);
      
      // Debug log
      console.log(`SEARCH: ${searchMode} mode, query: "${query}"`);
      
      // IMPORTANT: For AI search, use simple search results which is a known good page
      // instead of the AI search results page that's having issues
      if (searchMode === "ai") {
        console.log("AI search mode - navigating to simple-search results");
        window.location.href = `/simple-search?${params.toString()}`;
        return;
      }
      
      // For classic search, use the regular search results page
      console.log("Classic search mode - navigating to search results");
      console.log("Query params:", params.toString());
      console.log("Full URL:", `/search-results?${params.toString()}`);
      window.location.href = `/search-results?${params.toString()}`;
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not perform search. Please try again.",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  };

  // List of visual features our AI can detect (used internally only)
  const visualFeatures = [
    "kitchen", "bathroom", "mirror", "sofa", "hardwood", 
    "studio", "ceiling", "brick", "window", "table", "chair"
  ];
  
  return (
    <Card className="w-full max-w-3xl mx-auto border-none bg-white/80 backdrop-blur-sm shadow-sm sm:border sm:shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3 sm:mb-4">
          <Button
            type="button"
            size="sm"
            className="text-xs sm:text-sm flex-1 sm:flex-none max-w-[130px] sm:max-w-none bg-white hover:bg-gray-50 border-gray-300 text-gray-600"
            variant="outline"
            data-active={searchMode === "ai"}
            onClick={() => handleModeChange("ai")}
          >
            <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {t("search.aiSearch")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs sm:text-sm flex-1 sm:flex-none max-w-[130px] sm:max-w-none bg-white hover:bg-gray-50 border-gray-300 text-gray-600"
            variant="outline"
            data-active={searchMode === "classic"}
            onClick={() => handleModeChange("classic")}
          >
            <ListFilter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {t("search.classicSearch")}
          </Button>
        </div>
        
        {searchMode === "ai" ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-7 sm:pl-9 h-9 sm:h-10 text-sm bg-gray-50 border-gray-200 focus-visible:ring-turquoise"
                placeholder={t("search.featurePlaceholder")}
                disabled={isSearching}
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              variant="outline"
              className="relative overflow-hidden px-3 sm:px-4 group border-none shadow-sm h-9 sm:h-10" 
              disabled={isSearching}
              style={{
                background: "linear-gradient(90deg, #ff47a8, #6d47ff, #00d0ff, #00ffd5, #00ff83, #ffd600)",
                backgroundSize: "1200% 1200%",
                animation: "gradientShift 10s ease infinite"
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes gradientShift {
                  0% { background-position: 0% 50% }
                  50% { background-position: 100% 50% }
                  100% { background-position: 0% 50% }
                }
                
                @keyframes shimmer {
                  0% { transform: translateX(-100%) }
                  100% { transform: translateX(100%) }
                }
              `}} />
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/5 transition-all duration-300"></span>
              <span className="absolute inset-0 overflow-hidden">
                <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_ease] bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </span>
              {isSearching ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-white" />
              ) : (
                <span className="flex items-center relative z-10 text-white font-medium">
                  <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 drop-shadow-sm" />
                  <span className="hidden sm:inline drop-shadow-sm">{t("search.magicSearch")}</span>
                </span>
              )}
            </Button>
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-600 border-gray-300"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DialogTrigger>
              <ImageSearch onResults={(results) => {
                handleImageSearchResults(results);
                setIsImageDialogOpen(false);
              }} />
            </Dialog>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 z-10" />
                <CityAutocomplete 
                  value={query}
                  onChange={setQuery}
                  placeholder={t("search.cityPlaceholder")}
                  className="pl-7 sm:pl-9 h-9 sm:h-10 text-sm bg-gray-50 border-gray-200 focus-visible:ring-turquoise"
                />
              </div>

              <Popover 
                open={isDatePickerOpen} 
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 sm:h-10 justify-start text-left font-normal text-sm bg-gray-50 border-gray-200 hover:bg-gray-50",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : t("common.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      // Close the popover when a date is selected
                      setIsDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select onValueChange={setActivityType}>
                <SelectTrigger className="h-9 sm:h-10 text-sm bg-gray-50 border-gray-200 hover:bg-gray-50">
                  <SelectValue placeholder={t("search.activityType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">{t("activity.photoShoot")}</SelectItem>
                  <SelectItem value="video">{t("activity.videoProduction")}</SelectItem>
                  <SelectItem value="event">{t("activity.event")}</SelectItem>
                  <SelectItem value="meeting">{t("activity.meeting")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-9 sm:h-10 text-sm bg-white hover:bg-gray-50 border-gray-300 text-gray-600" variant="outline">
              {t("common.search")}
            </Button>
          </form>
        )}

        {/* Search preview removed - we now navigate directly to search results page */}
      </CardContent>
    </Card>
  );
}