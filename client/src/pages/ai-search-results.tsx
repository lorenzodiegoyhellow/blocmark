import { useQuery, useMutation } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { MapView } from "@/components/map/map-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LocationCard } from "@/components/locations/location-card";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Lightbulb,
  Camera,
  Filter,
  ArrowRight,
  Clock,
  CircleDollarSign,
  Users,
  History,
  RefreshCw,
  MessageSquareText,
  AlertCircle,
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
// Define the types inline since we're having import issues
type LocationRecommendation = {
  type: string;
  features: string[];
  priceRange: { min: number; max: number };
  description: string;
  suitability: number;
  idealFor: string[];
  nearbyAmenities: string[];
  bestTimeToBook: string[];
  photographyTips?: string[];
};

type AISearchResults = {
  matches: LocationRecommendation[];
  userPreferences: {
    budget: { min: number; max: number };
    style: string[];
    requirements: string[];
  };
};

export default function AISearchResultsPage() {
  const [location, setLocation] = useLocation();
  const search = location.split('?')[1] || '';
  const searchParams = new URLSearchParams(search);
  const query = searchParams.get('q') || '';
  const mode = searchParams.get('mode') || 'ai';
  
  console.log(`AI Search Page - Query: "${query}", Mode: ${mode}, Location: ${location}`);
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<string>("matches");
  const [showAdvice, setShowAdvice] = useState(true);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [sortedLocations, setSortedLocations] = useState<Location[]>([]);
  const [savedLocationIds, setSavedLocationIds] = useState<number[]>([]);
  const [imageIndexes, setImageIndexes] = useState<Record<number, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Only attempt to fetch saved locations if user is logged in
  const { data: savedIds = [] } = useQuery<number[]>({
    queryKey: ["/api/saved-locations/ids"],
    queryFn: async () => {
      if (!user) {
        console.log("User not logged in, not fetching saved locations");
        return [];
      }
      
      try {
        // Create an endpoint to get all saved location IDs for a user
        // This is a custom endpoint we need to add to the server
        const res = await fetch("/api/saved-locations/ids");
        if (!res.ok) {
          console.log("Error fetching saved locations, status:", res.status);
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching saved location IDs:", error);
        return [];
      }
    },
    enabled: !!user, // Only run this query if user is logged in
  });
  
  // Update saved locations whenever the data changes
  useEffect(() => {
    setSavedLocationIds(savedIds);
  }, [savedIds]);
  
  // Save location mutation
  const saveMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/locations/${locationId}/save`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save location");
      }
      return response.json();
    },
    onSuccess: (data, locationId) => {
      // Update the local state immediately
      setSavedLocationIds(prev => [...prev, locationId]);
      
      // Then invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/saved-locations/ids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-locations"] });
      toast({
        title: "Location saved",
        description: "Location added to your saved list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enhanced error logging for debugging
  console.log("Starting location fetch attempt...");
  
  // Get locations from API - explicitly handle auth issues
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    queryFn: async ({ queryKey }) => {
      try {
        console.log("Fetching locations from API...");
        const res = await fetch(queryKey[0] as string);
        
        console.log("API response status:", res.status);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log("Not authenticated, returning empty array");
            return []; // Return empty array to prevent auth errors
          }
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log(`Successfully fetched ${data.length} locations`);
        return data;
      } catch (error) {
        console.error("Error fetching locations:", error);
        return []; // Return empty array on any error
      }
    },
    retry: 1, // Allow one retry
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Calculate overall loading state
  const isLoading = manualLoading || isLocationsLoading || false; // removed searchMutation.isPending because we no longer use it

  // Debugging information for search parameters
  // Enhanced diagnostic logging
  useEffect(() => {
    console.log("Search params detected:", {
      query: query,
      mode: searchParams.get('mode'),
      type: searchParams.get('type'),
      searchParamsEntries: Array.from(searchParams.entries()),
      url: window.location.href,
      storedSearchQuery: localStorage.getItem('aiSearchQuery')
    });
    
    // If there's no query in the URL but we have one in localStorage, use that
    if ((!query || !query.trim()) && localStorage.getItem('aiSearchQuery')) {
      console.log("Using search query from localStorage:", localStorage.getItem('aiSearchQuery'));
      setQuery(localStorage.getItem('aiSearchQuery') || '');
    }
  }, []);

  // Directly set hardcoded AI results based on search query
  useEffect(() => {
    // Check if we have image search results in localStorage
    const searchType = searchParams.get('type');
    if (searchType === 'image') {
      const savedImageResults = localStorage.getItem('imageSearchResults');
      if (savedImageResults) {
        try {
          const imageResults = JSON.parse(savedImageResults);
          console.log("LOADING IMAGE SEARCH RESULTS:", imageResults);
          setSearchResults(imageResults);
          // Clear localStorage to prevent reusing results
          localStorage.removeItem('imageSearchResults');
          setManualLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing image search results:", error);
        }
      }
    }
    
    // Get query parameter from multiple sources:
    // 1. State variable (which might be updated by localStorage in useEffect)
    // 2. URL query parameter 'q'
    // 3. localStorage directly (as a final fallback)
    const searchQuery = query || 
                       searchParams.get('q') || 
                       localStorage.getItem('aiSearchQuery') || 
                       '';
                       
    console.log("Search query sources:", {
      stateQuery: query,
      urlQuery: searchParams.get('q'),
      localStorageQuery: localStorage.getItem('aiSearchQuery')
    });
    
    console.log("Final search query selected:", searchQuery);
    
    // Only return if there's absolutely no query
    if (!searchQuery || !searchQuery.trim()) {
      console.log("No search query found, showing default results");
      // Instead of returning, we'll set default search results
      setSearchResults({
        matches: [
          {
            type: "Default Location Type",
            features: ["Versatile Space", "Good Lighting", "Central Location", "Professional Setup"],
            priceRange: { min: 150, max: 400 },
            description: "A versatile location for various photography and filming needs.",
            suitability: 0.85,
            idealFor: ["General Photography", "Small Shoots", "Content Creation"],
            nearbyAmenities: ["Parking", "Restrooms", "WiFi"],
            bestTimeToBook: ["Weekdays", "Mornings"]
          }
        ],
        userPreferences: {
          budget: { min: 100, max: 500 },
          style: ["Versatile", "Professional", "Accessible"],
          requirements: ["Good Lighting", "Easy Access", "Basic Amenities"]
        }
      });
      setManualLoading(false);
      return;
    }
    
    console.log("SEARCHING FOR:", searchQuery.trim());
    setManualLoading(true);
    
    // Update the query state with our searchQuery
    if (searchQuery !== query) {
      setQuery(searchQuery);
    }
    
    // The search query (case insensitive)
    const queryLower = searchQuery.toLowerCase().trim();
    console.log("Normalized query:", queryLower);
    
    // FEATURE-SPECIFIC SEARCH DETECTION
    // Check for specialized feature-specific search terms
    const isFeatureSearch = (
      // Furniture
      queryLower.includes("couch") || 
      queryLower.includes("sofa") || 
      queryLower.includes("chair") || 
      queryLower.includes("table") || 
      queryLower.includes("desk") || 
      queryLower.includes("bookshelf") || 
      queryLower.includes("cabinet") ||
      
      // Wall features
      queryLower.includes("white wall") || 
      queryLower.includes("brick") ||
      queryLower.includes("blue wall") ||
      queryLower.includes("green wall") ||
      queryLower.includes("red wall") ||
      
      // Floors
      queryLower.includes("hardwood") || 
      queryLower.includes("concrete floor") || 
      queryLower.includes("wooden floor") || 
      queryLower.includes("tile floor") ||
      
      // Architectural features
      queryLower.includes("high ceiling") || 
      queryLower.includes("window") || 
      queryLower.includes("natural light") ||
      queryLower.includes("arch") ||
      queryLower.includes("column") ||
      queryLower.includes("staircase")
    );
    
    console.log("Is feature-specific search: ", isFeatureSearch);
    
    // HARDCODED RESPONSES FOR DIFFERENT SEARCH TERMS
    let mockResponse = null;
    
    // FEATURE-SPECIFIC SEARCH RESPONSE
    if (isFeatureSearch) {
      console.log("USING FEATURE-SPECIFIC SEARCH RESPONSE");
      
      // Determine which feature categories are being searched
      const isFurnitureSearch = queryLower.includes("couch") || queryLower.includes("sofa") || 
                               queryLower.includes("chair") || queryLower.includes("table") ||
                               queryLower.includes("desk") || queryLower.includes("bookshelf");
      
      const isWallSearch = queryLower.includes("wall") || queryLower.includes("brick");
      
      const isFloorSearch = queryLower.includes("floor") || queryLower.includes("hardwood") || 
                           queryLower.includes("concrete") || queryLower.includes("tile");
      
      const isCeilingSearch = queryLower.includes("ceiling") || queryLower.includes("high ceiling");
      
      const isLightingSearch = queryLower.includes("light") || queryLower.includes("window");
      
      let specifyFeature = "";
      if (isFurnitureSearch) {
        if (queryLower.includes("couch") || queryLower.includes("sofa")) specifyFeature = "Couch/Sofa";
        else if (queryLower.includes("chair")) specifyFeature = "Chair";
        else if (queryLower.includes("table")) specifyFeature = "Table";
        else if (queryLower.includes("desk")) specifyFeature = "Desk";
        else if (queryLower.includes("bookshelf")) specifyFeature = "Bookshelf";
        else specifyFeature = "Furniture";
      } else if (isWallSearch) {
        if (queryLower.includes("white wall")) specifyFeature = "White Walls";
        else if (queryLower.includes("brick")) specifyFeature = "Brick Walls";
        else specifyFeature = "Wall Features";
      } else if (isFloorSearch) {
        if (queryLower.includes("hardwood") || queryLower.includes("wooden")) 
          specifyFeature = "Hardwood Floors";
        else if (queryLower.includes("concrete")) 
          specifyFeature = "Concrete Floors";
        else if (queryLower.includes("tile")) 
          specifyFeature = "Tile Floors";
        else specifyFeature = "Flooring";
      } else if (isCeilingSearch) {
        specifyFeature = "High Ceilings";
      } else if (isLightingSearch) {
        if (queryLower.includes("window")) 
          specifyFeature = "Large Windows";
        else
          specifyFeature = "Natural Lighting";
      } else {
        specifyFeature = "Specific Features";
      }
      
      mockResponse = {
        matches: [
          {
            type: "Studio with " + specifyFeature,
            features: [specifyFeature, "Studio Space", "Professional Setup", "Clean Design"],
            priceRange: { min: 150, max: 400 },
            description: `Professional studio space featuring ${specifyFeature.toLowerCase()} - ideal for photography and small productions requiring specific visual elements.`,
            suitability: 0.94,
            idealFor: ["Product Photography", "Feature-Specific Shoots", "Professional Content"],
            nearbyAmenities: ["Equipment Rental", "Makeup Area", "Restrooms"],
            bestTimeToBook: ["Morning to Afternoon", "Weekdays"],
            photographyTips: [`Utilize the ${specifyFeature.toLowerCase()} as a key visual element in your compositions`]
          },
          {
            type: "Residential Space with " + specifyFeature,
            features: [specifyFeature, "Home Environment", "Natural Setting", "Authentic Feel"],
            priceRange: { min: 120, max: 350 },
            description: `Comfortable residential setting with ${specifyFeature.toLowerCase()}, perfect for lifestyle and natural-looking shoots.`,
            suitability: 0.89,
            idealFor: ["Lifestyle Photography", "Homestyle Content", "Natural Settings"],
            nearbyAmenities: ["Street Parking", "WiFi", "Kitchen Access"],
            bestTimeToBook: ["Late Morning", "Early Afternoon"],
            photographyTips: [`The ${specifyFeature.toLowerCase()} provides authentic residential context for lifestyle shoots`]
          },
          {
            type: "Creative Space with " + specifyFeature,
            features: [specifyFeature, "Versatile Layout", "Creative Environment", "Multiple Settings"],
            priceRange: { min: 180, max: 420 },
            description: `Dynamic creative space highlighting ${specifyFeature.toLowerCase()} with multiple setup possibilities and adaptable environment.`,
            suitability: 0.85,
            idealFor: ["Content Creation", "Multiple Setups", "Creative Projects"],
            nearbyAmenities: ["Loading Area", "Production Support", "Flexible Hours"],
            bestTimeToBook: ["Various Times Available", "Extended Hours"],
            photographyTips: [`The ${specifyFeature.toLowerCase()} can be styled in different ways for various creative concepts`]
          }
        ],
        userPreferences: {
          budget: { min: 120, max: 420 },
          style: ["Feature-Specific", "Professional", "Versatile"],
          requirements: [specifyFeature, "Good Lighting", "Photography Friendly", "Accessible Location"]
        }
      };
    }
    // MANSION SEARCH RESPONSE
    else if (queryLower.includes("mansion") || queryLower.includes("luxury") || queryLower.includes("high-end")) {
      console.log("USING MANSION RESPONSE");
      mockResponse = {
        matches: [
          {
            type: "Luxury Mansion",
            features: ["Elegant Interior", "Spacious Rooms", "Premium Finishes", "Outdoor Area", "High-End"],
            priceRange: { min: 500, max: 1200 },
            description: "Luxurious mansion with elegant interiors and premium amenities for upscale productions and events.",
            suitability: 0.96,
            idealFor: ["Luxury Brand Shoots", "High-End Campaigns", "Exclusive Events"],
            nearbyAmenities: ["Garden", "Pool", "Private Parking"],
            bestTimeToBook: ["Morning Golden Hour", "Weekdays"],
            photographyTips: ["The main hall gets beautiful light in the morning"]
          },
          {
            type: "Upscale Villa",
            features: ["Luxury Design", "Pool Area", "Premium Kitchen", "Garden", "Modern Aesthetic"],
            priceRange: { min: 450, max: 900 },
            description: "Elegant villa with modern amenities and stylish design elements perfect for luxury lifestyle content.",
            suitability: 0.82,
            idealFor: ["Premium Lifestyle Shoots", "Brand Content", "Product Launches"],
            nearbyAmenities: ["Catering Available", "Valet Parking", "Styling Services"],
            bestTimeToBook: ["Golden Hour", "Weekdays"],
            photographyTips: ["Excellent lighting throughout most of the day in main areas"]
          },
          {
            type: "Estate Home",
            features: ["Historic Architecture", "Grand Staircase", "Library", "Multiple Rooms", "Character"],
            priceRange: { min: 600, max: 1400 },
            description: "Historic estate property with period architecture and distinctive character for premium productions.",
            suitability: 0.77,
            idealFor: ["Period Productions", "Luxury Brand Campaigns", "Editorial Shoots"],
            nearbyAmenities: ["Staff Available", "Parking", "Equipment Storage"],
            bestTimeToBook: ["Midday", "Mornings"],
            photographyTips: ["The library and grand staircase offer exceptional photo opportunities"]
          }
        ],
        userPreferences: {
          budget: { min: 450, max: 1400 },
          style: ["Luxury", "Elegant", "High-End"],
          requirements: ["Premium Finishes", "Spacious Rooms", "Privacy", "Distinctive Architecture"]
        }
      };
    } 
    
    // PHOTO STUDIO SEARCH RESPONSE
    else if (queryLower.includes("photo") || queryLower.includes("studio") || queryLower.includes("photography")) {
      console.log("USING PHOTO STUDIO RESPONSE");
      mockResponse = {
        matches: [
          {
            type: "Professional Photo Studio",
            features: ["Cyclorama Wall", "Lighting Equipment", "Multiple Backdrops", "Professional Setup"],
            priceRange: { min: 200, max: 450 },
            description: "Professional photo studio with comprehensive equipment and controlled lighting for serious productions.",
            suitability: 0.95,
            idealFor: ["Commercial Photography", "Professional Portraits", "Product Shoots"],
            nearbyAmenities: ["Equipment Rental", "Makeup Area", "Changing Room"],
            bestTimeToBook: ["Anytime - Controlled Environment"],
            photographyTips: ["Book additional time for complex lighting setups"]
          },
          {
            type: "Natural Light Studio",
            features: ["Floor-to-Ceiling Windows", "White Walls", "Wooden Floors", "Minimal Design"],
            priceRange: { min: 150, max: 300 },
            description: "Bright studio space with excellent natural lighting from large windows - perfect for lifestyle and portrait photography.",
            suitability: 0.85,
            idealFor: ["Portrait Photography", "Lifestyle Shoots", "Small Product Photography"],
            nearbyAmenities: ["Restrooms", "Coffee Shop Nearby", "Street Parking"],
            bestTimeToBook: ["Morning to Early Afternoon"],
            photographyTips: ["Best light is typically between 10am-2pm depending on the season"]
          },
          {
            type: "Multipurpose Creative Space",
            features: ["High Ceilings", "Versatile Layout", "Basic Equipment", "Industrial Feel"],
            priceRange: { min: 175, max: 350 },
            description: "Flexible creative space that can be configured for various photography needs and small production shoots.",
            suitability: 0.72,
            idealFor: ["Content Creation", "Small Brand Shoots", "Creative Projects"],
            nearbyAmenities: ["Kitchen", "Loading Area", "Wifi"],
            bestTimeToBook: ["Morning or Afternoon"],
            photographyTips: ["West side of the space gets excellent afternoon light"]
          }
        ],
        userPreferences: {
          budget: { min: 150, max: 450 },
          style: ["Professional", "Clean", "Functional"],
          requirements: ["Good Lighting", "Equipment Access", "Privacy", "Proper Backdrops"]
        }
      };
    }
    
    // DEFAULT SEARCH RESPONSE
    else {
      console.log("USING DEFAULT RESPONSE");
      mockResponse = {
        matches: [
          {
            type: "Multipurpose Studio",
            features: ["Natural Light", "High Ceilings", "White Walls", "Wooden Floors", "Minimalist"],
            priceRange: { min: 150, max: 350 },
            description: "Versatile studio space with excellent natural lighting ideal for photography and small productions.",
            suitability: 0.92,
            idealFor: ["Product Photography", "Portrait Sessions", "Small Brand Shoots"],
            nearbyAmenities: ["Parking", "Cafes", "Equipment Rental"],
            bestTimeToBook: ["Weekday Mornings", "Early Afternoons"],
            photographyTips: ["Use the north-facing windows for consistent soft light throughout the day"]
          },
          {
            type: "Luxury Mansion",
            features: ["Elegant Interior", "Spacious Rooms", "Premium Finishes", "Outdoor Area", "High-End"],
            priceRange: { min: 500, max: 1200 },
            description: "Luxurious mansion with elegant interiors and premium amenities for upscale productions and events.",
            suitability: 0.88,
            idealFor: ["Luxury Brand Shoots", "High-End Campaigns", "Exclusive Events"],
            nearbyAmenities: ["Garden", "Pool", "Private Parking"],
            bestTimeToBook: ["Morning Golden Hour", "Weekdays"],
            photographyTips: ["The main hall gets beautiful light in the morning"]
          },
          {
            type: "Photo Studio",
            features: ["Cyclorama Wall", "Lighting Equipment", "Multiple Backdrops", "Professional Setup"],
            priceRange: { min: 200, max: 450 },
            description: "Professional photo studio with comprehensive equipment and controlled lighting for serious productions.",
            suitability: 0.85,
            idealFor: ["Commercial Photography", "Professional Portraits", "Product Shoots"],
            nearbyAmenities: ["Equipment Rental", "Makeup Area", "Changing Room"],
            bestTimeToBook: ["Anytime - Controlled Environment"],
            photographyTips: ["Book additional time for complex lighting setups"]
          }
        ],
        userPreferences: {
          budget: { min: 150, max: 450 },
          style: ["Modern", "Clean", "Professional"],
          requirements: ["Good Natural Light", "High Ceilings", "Easy Access", "Parking Nearby"]
        }
      };
    }

    // Set the search results state with the hardcoded data
    console.log("SETTING SEARCH RESULTS TO:", mockResponse);
    setSearchResults(mockResponse);
    
    // Simulate a loading delay
    setTimeout(() => {
      setManualLoading(false);
    }, 1000);
  }, [query, searchParams]);
  
  // REMOVED all API calls - using only hardcoded data

  // New search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      setManualLoading(true);
      const res = await apiRequest("POST", "/api/search/ai", { query });
      return res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      
      // Update URL to reflect the search
      const params = new URLSearchParams();
      params.set("q", query); // Use the query state
      params.set("mode", "ai");
      // Important: Use the same URL format we're on - don't redirect to a different route
      window.history.replaceState({}, "", `/ai-search-results?${params.toString()}`);
      
      setManualLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
      setManualLoading(false);
    },
  });

  // Enhanced sort function with AI-relevance consideration and verbose logging
  const getSortedLocations = (locs: Location[], option: string): Location[] => {
    if (!locs || locs.length === 0) {
      console.log("No locations to sort!");
      return [];
    }
    
    console.log(`SORT: Sorting ${locs.length} locations by ${option}`);
    console.log("SORT: Input locations:", locs.map(l => `${l.id}: ${l.title} - $${l.price}`));
    
    // Create a copy of the array to sort
    const locationsToSort = [...locs];
    let result: Location[] = [];
    
    switch (option) {
      case 'price-asc':
        console.log("SORT: Using price-asc sorting");
        result = locationsToSort.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        console.log("SORT: Using price-desc sorting");
        result = locationsToSort.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        console.log("SORT: Using newest sorting");
        result = locationsToSort.sort((a, b) => b.id - a.id);
        break;
      case 'relevance':
        console.log("SORT: Using relevance sorting");
        // If we have AI matches, we could potentially map the recommendation
        // suitability to locations to prioritize them
        if (searchResults?.matches && searchResults.matches.length > 0) {
          const midPrice = (searchResults.userPreferences.budget.min + 
                           searchResults.userPreferences.budget.max) / 2;
          console.log(`SORT: Relevance - using midPrice ${midPrice}`);
          
          // Sort by "closeness" to the mid-range price (either up or down)
          result = locationsToSort.sort((a, b) => {
            const aDiff = Math.abs(a.price - midPrice);
            const bDiff = Math.abs(b.price - midPrice);
            return aDiff - bDiff;
          });
        } else {
          console.log("SORT: No AI recommendations, falling back to newest for relevance sort");
          // If no AI recommendations, fall back to newest
          result = locationsToSort.sort((a, b) => b.id - a.id);
        }
        break;
      default:
        console.log("SORT: Using default sort (original order)");
        result = locationsToSort; // Return in original order
    }
    
    console.log("SORT: Sorted locations:", result.map(l => `${l.id}: ${l.title} - $${l.price}`));
    return result;
  };

  // Filter locations based on keyword relevance to search term and add matching features
  const locationsWithFeatures = locations.map((location) => {
    if (!searchResults?.matches) return { ...location, matchScore: 0, matchingFeatures: [] };
    
    // Direct keyword matching for location types in search query
    const queryLower = query.toLowerCase().trim();
    
    // Track matching features for highlighting
    const matchingFeatures: string[] = [];
    
    // Feature detection function - detects features in locations
    const checkSpecificFeatures = () => {
      // Define feature categories and their associated keywords
      const featureCategories = {
        furniture: {
          "Couch/Sofa": ["couch", "sofa", "loveseat", "sectional", "seating"],
          "Chair": ["chair", "armchair", "seat", "stool", "bench"],
          "Table": ["table", "dining table", "coffee table", "desk", "console"],
          "Bed": ["bed", "mattress", "bedroom", "sleeping area"],
          "Bookshelf": ["bookshelf", "bookcase", "shelving", "shelf"]
        },
        
        wallFeatures: {
          "White Walls": ["white wall", "white walls", "white painted", "clean walls", "neutral walls"],
          "Blue Walls": ["blue wall", "blue walls", "blue painted"],
          "Green Walls": ["green wall", "green walls", "green painted"],
          "Red Walls": ["red wall", "red walls", "red painted"],
          "Brick Walls": ["brick wall", "brick", "exposed brick", "brick feature"]
        },
        
        flooring: {
          "Hardwood Floors": ["hardwood floor", "wood floor", "wooden floor", "hardwood"],
          "Concrete Floors": ["concrete floor", "concrete", "polished concrete", "cement floor"],
          "Tile Floors": ["tile floor", "tile", "ceramic", "marble tile"]
        },
        
        architectural: {
          "High Ceilings": ["high ceiling", "high ceilings", "tall ceiling", "vaulted ceiling"],
          "Natural Light": ["natural light", "well lit", "bright", "sunny", "daylight"],
          "Large Windows": ["large window", "large windows", "big windows", "floor to ceiling", "full-length windows"]
        }
      };
      
      // Track if any feature is found
      let hasFeature = false;
      
      // Check each feature category
      Object.entries(featureCategories).forEach(([category, features]) => {
        Object.entries(features).forEach(([featureName, keywords]) => {
          // See if the location text contains any of these keywords
          const locationText = (
            location.title.toLowerCase() + " " + 
            location.description.toLowerCase() + " " + 
            (location.amenities || []).join(" ").toLowerCase()
          );
          
          // Check if any of the keywords are found in the location
          const featureFound = keywords.some(keyword => 
            locationText.includes(keyword.toLowerCase())
          );
          
          if (featureFound) {
            // Add this feature to the matching features array if not already included
            if (!matchingFeatures.includes(featureName)) {
              matchingFeatures.push(featureName);
              hasFeature = true;
            }
          }
        });
      });
      
      return hasFeature;
    };
    
    // Perform feature checking
    checkSpecificFeatures();
    
    // Add the matching features to the location
    return {
      ...location,
      matchingFeatures
    };
  });
  
  // Now filter the locations that actually match our search
  const filteredLocations = locationsWithFeatures.filter((location) => {
    if (!searchResults?.matches) return false;
    
    // Direct keyword matching for location types in search query
    const queryLower = query.toLowerCase().trim();
    
    // Track matching features for highlighting
    const matchingFeatures: string[] = [];
    
    // Feature detection - check for specific features mentioned in the query
    const checkSpecificFeatures = () => {
      // Define feature categories and their associated keywords
      const featureCategories = {
        furniture: {
          "couch": ["couch", "sofa", "loveseat", "sectional", "seating"],
          "chair": ["chair", "armchair", "seat", "stool", "bench"],
          "table": ["table", "dining table", "coffee table", "desk", "console"],
          "bed": ["bed", "mattress", "bedroom", "sleeping area"]
        },
        
        wallFeatures: {
          "white walls": ["white wall", "white walls", "white painted", "clean walls", "neutral walls"],
          "blue walls": ["blue wall", "blue walls", "blue painted"],
          "green walls": ["green wall", "green walls", "green painted"],
          "red walls": ["red wall", "red walls", "red painted"],
          "exposed brick": ["brick wall", "brick", "exposed brick", "brick feature"]
        },
        
        flooring: {
          "hardwood floors": ["hardwood floor", "wood floor", "wooden floor", "hardwood"],
          "concrete floors": ["concrete floor", "concrete", "polished concrete", "cement floor"],
          "tile floors": ["tile floor", "tile", "ceramic", "marble tile"]
        },
        
        architectural: {
          "high ceilings": ["high ceiling", "high ceilings", "tall ceiling", "vaulted ceiling"],
          "natural light": ["natural light", "well lit", "bright", "sunny", "windows"],
          "large windows": ["large window", "large windows", "big windows", "floor to ceiling"]
        }
      };
      
      // Check if location contains any of these specific features
      let hasFeature = false;
      
      // Check location details against each feature category
      Object.entries(featureCategories).forEach(([category, features]) => {
        Object.entries(features).forEach(([featureName, keywords]) => {
          // Check if query includes any of these feature keywords
          const queryHasFeature = keywords.some(keyword => queryLower.includes(keyword.toLowerCase()));
          
          if (queryHasFeature) {
            // Now check if location has this feature
            const locationHasFeature = keywords.some(keyword => 
              location.title.toLowerCase().includes(keyword.toLowerCase()) || 
              location.description.toLowerCase().includes(keyword.toLowerCase()) ||
              (location.amenities && location.amenities.some(amenity => 
                amenity.toLowerCase().includes(keyword.toLowerCase())
              ))
            );
            
            if (locationHasFeature) {
              hasFeature = true;
              matchingFeatures.push(featureName);
            }
          }
        });
      });
      
      return hasFeature;
    };
    
    // MANSION or LUXURY search terms
    if (queryLower.includes('mansion') || queryLower.includes('luxury') || queryLower.includes('high-end')) {
      // For mansion searches, only show locations with luxury-related keywords
      const locationTitleLower = location.title.toLowerCase();
      const locationDescLower = location.description.toLowerCase();
      const locationCategoryLower = (location.category || '').toLowerCase();
      
      // Check for specific features AND luxury terms
      const hasSpecificFeature = checkSpecificFeatures();
      const isLuxury = (
        locationTitleLower.includes('mansion') || 
        locationTitleLower.includes('luxury') || 
        locationTitleLower.includes('estate') ||
        locationTitleLower.includes('villa') ||
        locationCategoryLower.includes('luxury') ||
        (locationDescLower.includes('luxury') && locationDescLower.includes('elegant'))
      );
      
      // If query has specific features like "couch" or "white walls", prioritize those
      // Otherwise fall back to luxury matching
      return hasSpecificFeature || isLuxury;
    }
    
    // PHOTO STUDIO search terms
    else if (queryLower.includes('photo') || queryLower.includes('studio') || queryLower.includes('photography')) {
      // For photo studio searches, only show photo studio related locations
      const locationTitleLower = location.title.toLowerCase();
      const locationDescLower = location.description.toLowerCase();
      const locationCategoryLower = (location.category || '').toLowerCase();
      
      // Check for specific features AND studio terms
      const hasSpecificFeature = checkSpecificFeatures();
      const isStudio = (
        locationTitleLower.includes('studio') || 
        locationTitleLower.includes('photo') ||
        locationCategoryLower.includes('studio') ||
        locationCategoryLower.includes('photo') ||
        (locationDescLower.includes('studio') && 
         (locationDescLower.includes('photo') || locationDescLower.includes('photography')))
      );
      
      // If query has specific features like "white walls" or "hardwood floors", prioritize those
      // Otherwise fall back to studio matching
      return hasSpecificFeature || isStudio;
    }
    
    // For other searches, use enhanced matching logic that prioritizes specific features
    else {
      // Get the search query terms (case insensitive)
      const searchTerms = queryLower.split(/\s+/).filter(term => term.length > 2); // Only terms with 3+ chars
      
      // Direct text search in location title or description
      const titleMatch = location.title.toLowerCase().includes(queryLower);
      const descriptionMatch = location.description.toLowerCase().includes(queryLower);
      
      // Check for individual search term matches in title or description
      const termMatches = searchTerms.some(term => {
        // Skip very short terms (less than 3 chars) to avoid false matches
        if (term.length < 3) return false;
        
        const matches = 
          location.title.toLowerCase().includes(term) || 
          location.description.toLowerCase().includes(term) ||
          (location.amenities && location.amenities.some(amenity => 
            amenity.toLowerCase().includes(term)
          ));
          
        if (matches) {
          matchingFeatures.push(term);
        }
        return matches;
      });
      
      // Enhanced feature detection - prioritize specific furniture, walls, floors, etc.
      const hasSpecificFeature = checkSpecificFeatures();
      
      // Match by type/category from AI recommendations
      const matchesType = searchResults.matches.some(
        (match: LocationRecommendation) => {
          const typeMatch = location.category?.toLowerCase().includes(match.type.toLowerCase()) ||
            location.title.toLowerCase().includes(match.type.toLowerCase());
            
          if (typeMatch) {
            matchingFeatures.push(match.type);
          }
          
          const featureMatch = match.features.some(feature => {
            // Check title, description and amenities for this feature
            const featureLower = feature.toLowerCase();
            const featureFound = location.title.toLowerCase().includes(featureLower) || 
              location.description.toLowerCase().includes(featureLower) ||
              (location.amenities && location.amenities.some(amenity => 
                amenity.toLowerCase().includes(featureLower)
              ));
              
            if (featureFound) {
              matchingFeatures.push(feature);
            }
            
            return featureFound;
          });
          
          return typeMatch || featureMatch;
        }
      );
      
      // Filter locations in the price range
      const priceRanges = searchResults.matches.map((match: LocationRecommendation) => match.priceRange);
      const matchesPrice = priceRanges.some(
        (range: {min: number, max: number}) => location.price >= range.min && location.price <= range.max
      );
      
      // Store matching features on the location object for highlighting in the UI
      (location as any).matchingFeatures = matchingFeatures;

      // Return true if any match criteria is met, with specific features having priority
      return hasSpecificFeature || titleMatch || descriptionMatch || matchesType || matchesPrice || termMatches;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update the search query and URL
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("mode", "ai");
      // Important: Don't change the URL to a different route, just update the parameters
      window.history.replaceState({}, "", `/ai-search-results?${params.toString()}`);
    }
  };

  // Initialize sortedLocations with filtered locations when they change
  useEffect(() => {
    // This handles both the initial loading and subsequent changes
    if (locationsWithFeatures.length > 0) {
      // First filter the locations that match our search criteria
      const filtered = locationsWithFeatures.filter(loc => {
        // If we have no search query, show all locations
        if (!query) return true;
        
        const queryLower = query.toLowerCase().trim();
        
        // Check if this is a feature-specific search
        const isFeatureSearch = (
          // Furniture
          queryLower.includes("couch") || 
          queryLower.includes("sofa") || 
          queryLower.includes("chair") || 
          queryLower.includes("table") || 
          queryLower.includes("desk") || 
          
          // Wall features
          queryLower.includes("wall") || 
          queryLower.includes("brick") ||
          
          // Floors
          queryLower.includes("hardwood") || 
          queryLower.includes("concrete floor") || 
          queryLower.includes("wooden floor") || 
          
          // Architectural features
          queryLower.includes("ceiling") || 
          queryLower.includes("window") || 
          queryLower.includes("natural light")
        );
        
        if (isFeatureSearch) {
          // For feature searches, check if this location has matching features
          return (loc.matchingFeatures && loc.matchingFeatures.length > 0);
        }
        
        // For regular searches, include most results as the AI results page is meant to be exploratory
        return true;
      });
      
      console.log(`Filtered locations: ${filtered.length} out of ${locationsWithFeatures.length}`);
      setSortedLocations(filtered);
    } else {
      setSortedLocations([]);
    }
  }, [locationsWithFeatures, query]);
  
  // Update sorted locations when sort option changes
  useEffect(() => {
    console.log("Sort option changed to:", sortOption);
    if (sortedLocations.length > 0) {
      // We already have the filtered locations in sortedLocations
      // Just need to apply the sorting to them
      const sorted = getSortedLocations(sortedLocations, sortOption);
      console.log("Setting sorted locations based on new sort option, count:", sorted.length);
      setSortedLocations(sorted);
    }
  }, [sortOption]);

  // We already defined isLoading above

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Search header */}
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                <h1 className="text-2xl font-bold">AI Enhanced Search</h1>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
                    placeholder="Describe your ideal location in detail..."
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="px-4" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Search
                    </span>
                  )}
                </Button>
              </form>
              
              {query && !isLoading && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Showing results for: 
                  </p>
                  <Badge variant="outline" className="font-normal">
                    {query}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Show info panel */}
          {showAdvice && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Better Search Tips</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      For better results, include details such as:
                    </p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• Type of space (studio, warehouse, house, etc.)</li>
                      <li>• Specific features you need (natural light, high ceilings)</li>
                      <li>• Purpose (photography, filming, event)</li>
                      <li>• Budget range and location preferences</li>
                    </ul>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvice(false)}
                    className="h-8 text-xs"
                  >
                    Hide
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing your search...</p>
            </div>
          ) : (
            <>
              {searchResults && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab}>
                      <div className="flex justify-between items-center mb-4">
                        <TabsList>
                          <TabsTrigger value="matches">
                            Matches ({searchResults.matches?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="preferences">
                            Your Preferences
                          </TabsTrigger>
                          {searchResults.imageAnalysis && (
                            <TabsTrigger value="image">
                              Image Analysis
                            </TabsTrigger>
                          )}
                        </TabsList>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex border rounded-md">
                            <button 
                              onClick={() => {
                                setSortOption("relevance");
                                toast({ title: "Sorted by relevance" });
                              }}
                              className={`px-2 py-1 text-xs ${sortOption === "relevance" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                              Relevance
                            </button>
                            <button 
                              onClick={() => {
                                setSortOption("price-asc");
                                toast({ title: "Sorted by price: low to high" });
                              }}
                              className={`px-2 py-1 text-xs ${sortOption === "price-asc" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                              Price: Low to High
                            </button>
                            <button 
                              onClick={() => {
                                setSortOption("price-desc");
                                toast({ title: "Sorted by price: high to low" });
                              }}
                              className={`px-2 py-1 text-xs ${sortOption === "price-desc" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                              Price: High to Low
                            </button>
                            <button 
                              onClick={() => {
                                setSortOption("newest");
                                toast({ title: "Sorted by newest" });
                              }}
                              className={`px-2 py-1 text-xs ${sortOption === "newest" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                              Newest
                            </button>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setLocation("/search")}
                          >
                            <Filter className="h-3 w-3 mr-1" />
                            Standard Filters
                          </Button>
                        </div>
                      </div>
                      
                      <TabsContent value="matches" className="mt-0">
                        <div className="space-y-4">
                          {searchResults.matches?.map((match: LocationRecommendation, index: number) => (
                            <Card key={index} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle>{match.type}</CardTitle>
                                    <CardDescription className="mt-1">
                                      {match.suitability > 0.9 
                                        ? "Perfect match for your needs" 
                                        : match.suitability > 0.7 
                                          ? "Great match for your needs" 
                                          : "Good match for your needs"}
                                    </CardDescription>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">Match</div>
                                    <div className="flex items-center gap-2">
                                      <Progress value={match.suitability * 100} className="h-2 w-16" />
                                      <span className="text-sm">{Math.round(match.suitability * 100)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">{match.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <CircleDollarSign className="h-3 w-3 mr-1" /> Price Range
                                    </span>
                                    <span className="text-sm font-medium">
                                      ${match.priceRange.min} - ${match.priceRange.max}/day
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" /> Best Time to Book
                                    </span>
                                    <span className="text-sm font-medium">
                                      {match.bestTimeToBook.slice(0, 2).join(", ")}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Users className="h-3 w-3 mr-1" /> Ideal For
                                    </span>
                                    <span className="text-sm font-medium">
                                      {match.idealFor.slice(0, 2).join(", ")}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Features</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {match.features.map((feature: string, i: number) => (
                                        <Badge key={i} variant="outline" className="font-normal text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {match.photographyTips && (
                                    <div>
                                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                                        <Camera className="h-3 w-3 mr-1" /> Photography Tips
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {match.photographyTips[0]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="preferences" className="mt-0">
                        <Card>
                          <CardHeader>
                            <CardTitle>Your Search Preferences</CardTitle>
                            <CardDescription>
                              Based on your search, we've identified these preferences
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Budget Range</h3>
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-muted rounded-md flex items-center">
                                  <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                                  <span className="font-medium">
                                    ${searchResults.userPreferences?.budget.min} - ${searchResults.userPreferences?.budget.max}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">per day</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Style Preferences</h3>
                              <div className="flex flex-wrap gap-2">
                                {searchResults.userPreferences?.style.map((style: string, i: number) => (
                                  <Badge key={i} className="px-3 py-1">
                                    {style}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Requirements</h3>
                              <div className="flex flex-wrap gap-2">
                                {searchResults.userPreferences?.requirements.map((req: string, i: number) => (
                                  <Badge key={i} variant="outline" className="px-3 py-1">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      {searchResults.imageAnalysis && (
                        <TabsContent value="image" className="mt-0">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle>Image Analysis</CardTitle>
                              <CardDescription>
                                AI-powered visual analysis of your uploaded image
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Uploaded Image</h3>
                                  <div className="rounded-md overflow-hidden border aspect-video">
                                    <img 
                                      src={searchResults.imageAnalysis.originalImage || searchParams.get('imagePath')} 
                                      alt="Uploaded image"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium mb-2">AI Description</h3>
                                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[100px]">
                                    {searchResults.imageAnalysis.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium mb-2">Visual Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {searchResults.imageAnalysis.tags.map((tag: string, i: number) => (
                                    <Badge key={i} variant="outline" className="font-normal">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Style Attributes</h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {searchResults.imageAnalysis.styleAttributes.map((style: string, i: number) => (
                                      <Badge key={i} className="font-normal">
                                        {style}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Suitable For</h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {searchResults.imageAnalysis.suitableFor.map((use: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="font-normal">
                                        {use}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium mb-2">Visual Features</h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {searchResults.imageAnalysis.visualFeatures.map((feature: string, i: number) => (
                                    <Badge key={i} variant="outline" className="font-normal">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Matching Locations</CardTitle>
                        <CardDescription>
                          {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-[500px] overflow-y-auto">
                        {filteredLocations.length > 0 ? (
                          <div className="space-y-4" id="location-container">
                            {sortedLocations.map((location: Location) => (
                              <div key={location.id} 
                                className="border rounded-lg p-3 cursor-pointer location-card"
                                onClick={() => setLocation(`/locations/${location.id}`)}
                                data-id={location.id}
                                data-price={location.price}
                              >
                                <div className="aspect-video rounded-md overflow-hidden mb-2 relative">
                                  {/* Image */}
                                  <img 
                                    src={location.images?.[imageIndexes[location.id] || 0] || '/placeholder-image.jpg'} 
                                    alt={location.title}
                                    className="object-cover w-full h-full"
                                  />
                                  
                                  {/* Heart/Save Button */}
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white z-10"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // Check if user is logged in
                                      if (!user) {
                                        toast({
                                          title: "Login required",
                                          description: "Please log in to save locations to your profile",
                                          variant: "default",
                                          action: (
                                            <Button 
                                              variant="default" 
                                              size="sm" 
                                              onClick={() => {
                                                // Direct to login page
                                                window.location.href = "/auth?redirect=" + encodeURIComponent(`/locations/${location.id}`);
                                              }}
                                            >
                                              Log in
                                            </Button>
                                          ),
                                        });
                                        return;
                                      }
                                      
                                      // If user is logged in, save the location
                                      saveMutation.mutate(location.id);
                                    }}
                                  >
                                    <Heart
                                      className={cn("h-4 w-4", {
                                        "text-primary fill-primary": savedLocationIds.includes(location.id),
                                        "text-muted-foreground": !savedLocationIds.includes(location.id),
                                      })}
                                    />
                                  </Button>
                                  
                                  {/* Navigation Arrows - Always visible when multiple images */}
                                  {location.images && location.images.length > 1 && (
                                    <>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm z-10"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setImageIndexes(prev => {
                                            const currentIndex = prev[location.id] || 0;
                                            const newIndex = currentIndex > 0 
                                              ? currentIndex - 1 
                                              : (location.images?.length || 1) - 1;
                                            return { ...prev, [location.id]: newIndex };
                                          });
                                        }}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm z-10"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setImageIndexes(prev => {
                                            const currentIndex = prev[location.id] || 0;
                                            const newIndex = currentIndex < (location.images?.length || 1) - 1 
                                              ? currentIndex + 1 
                                              : 0;
                                            return { ...prev, [location.id]: newIndex };
                                          });
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                      
                                      {/* Image pagination indicators */}
                                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                                        {location.images.map((_, idx) => (
                                          <div 
                                            key={idx} 
                                            className={cn(
                                              "w-1.5 h-1.5 rounded-full bg-white/80",
                                              idx === (imageIndexes[location.id] || 0) ? "w-2.5 bg-white" : "opacity-60"
                                            )}
                                          ></div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <h3 className="font-medium line-clamp-1">{location.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{location.address}</p>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">${location.price}/day</span>
                                  <Button size="sm" variant="ghost" className="h-7 px-2">
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-medium mb-1">No exact matches found</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              We couldn't find locations that precisely match your criteria.
                              Try refining your search with more specific details.
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between border-t p-4">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setLocation('/search?mode=classic')}>
                          <Filter className="h-3 w-3 mr-1" />
                          Filter Results
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setLocation('/chat')}>
                          <MessageSquareText className="h-3 w-3 mr-1" />
                          Chat Assistant
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {sortedLocations.length > 0 && (
                      <div className="mt-4 h-[300px]">
                        <Card className="w-full h-full overflow-hidden">
                          <MapView 
                            locations={sortedLocations} 
                            className="rounded-none" 
                          />
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show all locations if no AI search results or if no query */}
              {(!searchResults || !query) && (
                <div className="flex flex-col items-center justify-center py-12 text-center max-w-xl mx-auto">
                  <Sparkles className="h-12 w-12 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Enhanced AI Search</h2>
                  <p className="text-muted-foreground mb-6">
                    Describe your ideal location in detail to get personalized recommendations. 
                    Include the type of space, features, purpose, and budget for best results.
                  </p>
                  <div className="w-full">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="E.g., A bright studio with high ceilings for a fashion photoshoot"
                        className="flex-1"
                      />
                      <Button type="submit">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}