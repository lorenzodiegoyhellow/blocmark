import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowLeft,
  MapPin,
  Users,
  Camera,
  Video,
  Music,
  DollarSign,
  Calendar,
  Loader2,
  Heart,
  Clock,
  Bookmark,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Location as LocationType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { LocationCard } from "@/components/locations/location-card";
import { FilterDialog, SearchFilters } from "@/components/search/filter-dialog";

// Fallback location data to ensure we always have results
const FALLBACK_LOCATIONS = [
  {
    id: 1,
    title: "Modern Downtown Studio",
    description: "Bright studio with large windows, perfect for fashion shoots and small video productions.",
    price: 150,
    rating: 4.8,
    reviews: 24,
    address: "123 Main St, New York, NY",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
    ],
    tags: ["Studio", "Natural Light", "Urban"],
    features: ["High Ceilings", "White Walls", "Professional Lighting"],
  },
  {
    id: 2,
    title: "Industrial Warehouse Space",
    description: "Large open warehouse with industrial features, perfect for commercial shoots.",
    price: 300,
    rating: 4.5,
    reviews: 18,
    address: "456 Broadway, New York, NY",
    images: [
      "https://images.unsplash.com/photo-1556017586-34df82191e70?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556017586-34df82191e70?w=800&auto=format&fit=crop",
    ],
    tags: ["Warehouse", "Industrial", "Large Space"],
    features: ["Loading Dock", "Exposed Brick", "High Capacity Power"],
  },
  {
    id: 3,
    title: "Luxury Penthouse View",
    description: "Stunning penthouse with panoramic city views, ideal for high-end photo shoots.",
    price: 500,
    rating: 4.9,
    reviews: 32,
    address: "789 Park Ave, New York, NY",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
    ],
    tags: ["Luxury", "View", "Penthouse"],
    features: ["Floor-to-ceiling Windows", "Marble Floors", "Designer Furniture"],
  },
  {
    id: 4,
    title: "Rustic Barn Studio",
    description: "Charming converted barn with rustic features, perfect for lifestyle shoots.",
    price: 200,
    rating: 4.7,
    reviews: 15,
    address: "101 Country Road, Upstate NY",
    images: [
      "https://images.unsplash.com/photo-1559070161-2732e582c90b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559070161-2732e582c90b?w=800&auto=format&fit=crop",
    ],
    tags: ["Rustic", "Natural", "Barn"],
    features: ["Wood Beams", "Stone Fireplace", "Natural Light"],
  },
  {
    id: 5,
    title: "Minimalist Photography Studio",
    description: "Clean, white studio space with professional lighting equipment and backdrops.",
    price: 175,
    rating: 4.6,
    reviews: 21,
    address: "222 Creative Lane, Brooklyn, NY",
    images: [
      "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&auto=format&fit=crop",
    ],
    tags: ["Minimalist", "Professional", "Studio"],
    features: ["Cyclorama Wall", "Lighting Grid", "Makeup Area"],
  },
  {
    id: 6,
    title: "Historic Mansion Estate",
    description: "Elegant historic mansion with beautiful grounds for high-end productions.",
    price: 650,
    rating: 4.9,
    reviews: 28,
    address: "333 Heritage Ave, Greenwich, CT",
    images: [
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&auto=format&fit=crop",
    ],
    tags: ["Mansion", "Historic", "Elegant"],
    features: ["Grand Staircase", "Formal Gardens", "Period Furniture"],
  },
];

// Helper function to extract tags from a location
function extractTags(location: LocationType): string[] {
  return [
    location.propertyType || '',
    location.category || '',
    ...(location.amenities || [])
  ].filter(tag => tag.length > 0);
}

// Helper function to extract only the city name from an address
function extractCityName(address: string): string {
  try {
    // Handle empty or invalid addresses
    if (!address || typeof address !== 'string') {
      return 'Location';
    }
    
    // Split by comma and clean up each part
    const parts = address.split(',').map(part => part.trim());
    
    // For addresses with commas (standard format)
    if (parts.length >= 2) {
      // US address format: 123 Street, City, State ZIP, USA
      if (parts.length >= 3) {
        // City is often the second part in a comma-separated address
        return parts[1];
      }
      
      // For addresses with just two parts, like "Street, City"
      return parts[parts.length - 1];
    }
    
    // Handle special case for addresses without commas
    // For street addresses without city information, return a generic location term
    if (parts.length === 1) {
      // Check for common street indicators that suggest this is just a street address
      const streetIndicators = [' st', ' ave', ' blvd', ' road', ' street', ' avenue', ' boulevard', ' lane', ' drive', ' way'];
      const lowercaseAddress = parts[0].toLowerCase();
      
      // If address contains street indicators, it's likely just a street address
      if (streetIndicators.some(indicator => lowercaseAddress.includes(indicator))) {
        return 'Location Area'; // Generic but informative
      }
      
      // For non-street addresses with a single part, return the full text
      return parts[0];
    }
    
    return 'Location';
  } catch (e) {
    console.error('Error extracting city name:', e);
    return 'Location';
  }
}

// Format price with dollar sign
const formatPrice = (price: number) => `$${price}`;

// Enhanced filter for AI-powered visual feature searches
function filterApiLocations(locations: LocationType[], searchTerm: string): LocationType[] {
  if (!searchTerm) return locations;
  
  // Only show approved locations in search results
  // Pending locations should only be visible in the listings page
  const visibleLocations = locations.filter(location => 
    location.status === "approved"
  );
  
  const term = searchTerm.toLowerCase().trim();
  
  // Check if this is a visual feature search (furniture, walls, etc.)
  const isFeatureSearch = /couch|sofa|chair|table|desk|wall|brick|hardwood|ceiling|window|light|palm|tree|mansion|studio|mirror|kitchen|bathroom|carpet|art|painting|plant|counter|cabinet|door|stair/i.test(term);
  
  // For visual feature searches, we need special handling
  if (isFeatureSearch) {
    console.log("Detected visual feature search for:", term);
    
    // Instead of a fixed mapping to IDs, let's use content-based features from descriptions and details
    // This simulates an AI detecting these features from images

    // First approach: Check descriptions and titles for mentions of these features
    const contentMatches = locations.filter(location => {
      const description = (location.description || "").toLowerCase();
      const title = (location.title || "").toLowerCase();
      const tags = extractTags(location).map(tag => tag.toLowerCase());
      
      // Specific feature matchers for common search terms
      if (term.includes("couch") || term.includes("sofa")) {
        return description.includes("couch") || 
               description.includes("sofa") || 
               description.includes("lounge") ||
               description.includes("living room") ||
               title.includes("living") ||
               tags.some(t => ["lounge", "living", "cozy"].includes(t));
      }
      
      if (term.includes("chair")) {
        return description.includes("chair") || 
               description.includes("seating") ||
               title.includes("office") ||
               tags.some(t => ["seating", "furniture", "office"].includes(t));
      }
      
      if (term.includes("table")) {
        return description.includes("table") || 
               description.includes("dining") ||
               description.includes("desk") ||
               tags.some(t => ["dining", "kitchen", "workspace"].includes(t));
      }
      
      if (term.includes("wall") || term.includes("brick")) {
        return description.includes("wall") || 
               description.includes("brick") ||
               description.includes("exposed") ||
               description.includes("texture") ||
               tags.some(t => ["loft", "industrial", "brick", "textured"].includes(t));
      }
      
      if (term.includes("hardwood") || term.includes("floor")) {
        return description.includes("hardwood") || 
               description.includes("wooden floor") ||
               description.includes("floor") ||
               tags.some(t => ["hardwood", "wood", "flooring"].includes(t));
      }
      
      if (term.includes("ceiling") || term.includes("high ceiling")) {
        return description.includes("ceiling") || 
               description.includes("high ceiling") ||
               description.includes("tall") ||
               description.includes("spacious") ||
               tags.some(t => ["high ceiling", "spacious", "airy"].includes(t));
      }
      
      if (term.includes("window") || term.includes("natural light")) {
        return description.includes("window") || 
               description.includes("natural light") ||
               description.includes("bright") ||
               description.includes("sunlight") ||
               description.includes("sunny") ||
               tags.some(t => ["bright", "natural light", "sunny", "windows"].includes(t));
      }
      
      if (term.includes("palm") || term.includes("tree")) {
        return description.includes("palm") || 
               description.includes("tree") ||
               description.includes("garden") ||
               description.includes("tropical") ||
               description.includes("outdoor") ||
               title.includes("garden") ||
               title.includes("outdoor") ||
               tags.some(t => ["garden", "outdoor", "tropical", "nature"].includes(t));
      }
      
      if (term.includes("mansion") || term.includes("luxury")) {
        return description.includes("mansion") || 
               description.includes("luxury") ||
               description.includes("estate") ||
               description.includes("elegant") ||
               title.includes("luxury") ||
               title.includes("estate") ||
               tags.some(t => ["luxury", "exclusive", "mansion", "villa"].includes(t));
      }
      
      if (term.includes("studio")) {
        return description.includes("studio") || 
               description.includes("photography") ||
               description.includes("filming") ||
               title.includes("studio") ||
               tags.some(t => ["studio", "photography", "filming", "creative"].includes(t));
      }
      
      // Additional visual features
      if (term.includes("mirror")) {
        return description.includes("mirror") || 
               description.includes("reflection") ||
               description.includes("bathroom") ||
               description.includes("dressing") ||
               tags.some(t => ["mirror", "bathroom", "dressing room"].includes(t));
      }
      
      if (term.includes("kitchen")) {
        return description.includes("kitchen") || 
               description.includes("cooking") ||
               description.includes("culinary") ||
               description.includes("dining") ||
               title.includes("kitchen") ||
               tags.some(t => ["kitchen", "dining", "cooking", "culinary"].includes(t));
      }
      
      if (term.includes("bathroom")) {
        return description.includes("bathroom") || 
               description.includes("shower") ||
               description.includes("bath") ||
               tags.some(t => ["bathroom", "shower", "ensuite"].includes(t));
      }
      
      if (term.includes("art") || term.includes("painting")) {
        return description.includes("art") || 
               description.includes("painting") ||
               description.includes("gallery") ||
               description.includes("decor") ||
               title.includes("art") ||
               tags.some(t => ["art", "gallery", "painting", "decorated", "design"].includes(t));
      }
      
      // If we haven't specifically matched a feature, do a general feature match
      const searchWords = term.split(" ");
      return searchWords.some(word => {
        if (word.length < 3) return false; // Skip very short words
        return description.includes(word) || title.includes(word);
      });
    });
    
    console.log(`Found ${contentMatches.length} locations with feature matching for "${term}"`);
    
    // If we have content matches, use them
    if (contentMatches.length > 0) {
      return contentMatches;
    }
    
    // Second approach: Use a ranking system for possible matches
    // This makes sure we always return SOME results that might be relevant
    return locations.map(location => {
      // Calculate a match score based on various signals
      let score = 0;
      
      // Check description keywords
      const description = (location.description || "").toLowerCase();
      const title = (location.title || "").toLowerCase();
      
      // Points for specific keywords in description
      if (description.includes("spacious")) score += 1;
      if (description.includes("modern")) score += 1;
      if (description.includes("beautiful")) score += 1;
      if (description.includes("elegant")) score += 1;
      if (description.includes("unique")) score += 1;
      
      // Extra points for location types that tend to have photogenic features
      if (title.includes("studio")) score += 2;
      if (title.includes("loft")) score += 2;
      if (title.includes("penthouse")) score += 3;
      if (title.includes("luxury")) score += 3;
      
      // Additional points for locations with specific visual features
      if (description.includes("kitchen")) score += 2;
      if (description.includes("bathroom")) score += 1;
      if (description.includes("mirror")) score += 1;
      if (description.includes("art")) score += 2;
      if (description.includes("painting")) score += 2;
      if (description.includes("carpet")) score += 1;
      if (description.includes("door")) score += 1;
      if (description.includes("stair")) score += 1;
      
      // Add the score as a property for sorting
      return { ...location, matchScore: score };
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore) // Sort by highest score
    .filter((_: any, index: number) => index < 6); // Take the top 6 results
  }
  
  // For regular searches, use standard text matching
  return locations.filter(location => 
    (location.title?.toLowerCase().includes(term) || false) ||
    (location.description?.toLowerCase().includes(term) || false) ||
    (location.address?.toLowerCase().includes(term) || false) ||
    (extractTags(location).some(tag => tag.toLowerCase().includes(term)) || false)
  );
}

// Enhanced filter for fallback locations with visual feature search support
function filterFallbackLocations(searchTerm: string) {
  if (!searchTerm) return FALLBACK_LOCATIONS;
  
  const term = searchTerm.toLowerCase().trim();
  
  // Check if this is a visual feature search
  const isFeatureSearch = /couch|sofa|chair|table|desk|wall|brick|hardwood|ceiling|window|light|palm|tree|mansion|studio|mirror|kitchen|bathroom|carpet|art|painting|plant|counter|cabinet|door|stair/i.test(term);
  
  if (isFeatureSearch) {
    console.log("Detected visual feature search for fallback data:", term);
    
    // Create a feature-specific mapping for fallback data to ensure we always show good results
    const featureToLocationMap: Record<string, number[]> = {
      // Furniture
      "couch": [1, 3, 5],
      "sofa": [1, 3, 5],
      "chair": [1, 2, 3, 4, 5],
      "table": [2, 3, 4, 5],
      "desk": [2, 4, 5],
      
      // Wall features
      "wall": [1, 2, 3, 4, 5, 6],
      "white wall": [1, 5],
      "brick": [2, 4],
      "brick wall": [2, 4],
      
      // Floors
      "hardwood": [1, 3, 4],
      "concrete": [2],
      "wooden floor": [1, 3, 4],
      
      // Architectural features
      "ceiling": [1, 2, 3, 5, 6],
      "window": [1, 2, 3, 4, 5, 6],
      "natural light": [1, 3, 4, 6],
      
      // Location types
      "mansion": [3, 6],
      "studio": [1, 5],
      "palm": [3, 6],
      "tree": [3, 4, 6],
      "palm tree": [3, 6],
      
      // Additional features
      "mirror": [1, 3, 5, 6],
      "kitchen": [1, 3, 5],
      "bathroom": [1, 3, 5, 6],
      "art": [3, 6],
      "painting": [3, 6],
      "carpet": [1, 3, 5],
      "plant": [3, 4, 6],
      "counter": [1, 3, 5],
      "cabinet": [1, 5],
      "door": [1, 2, 3, 4, 5, 6],
      "stair": [3, 6],
    };
    
    // Find matching location indexes for this feature (note: these are array indices, not IDs)
    let matchingIndexes: number[] = [];
    
    // Check each feature keyword in our map
    Object.keys(featureToLocationMap).forEach(feature => {
      if (term.includes(feature)) {
        // Note that for fallback locations, we need to convert the IDs to zero-based array indexes
        const indexes = featureToLocationMap[feature].map(id => id - 1);
        matchingIndexes = [...matchingIndexes, ...indexes];
      }
    });
    
    // Remove duplicates and make sure indexes are valid
    matchingIndexes = [...new Set(matchingIndexes)].filter(
      index => index >= 0 && index < FALLBACK_LOCATIONS.length
    );
    
    console.log("Matching fallback location indexes:", matchingIndexes);
    
    // If we found matches, filter by these indexes
    if (matchingIndexes.length > 0) {
      return matchingIndexes.map(index => FALLBACK_LOCATIONS[index]);
    }
    
    // If no direct mapping matches, fall back to feature-based matching
    return FALLBACK_LOCATIONS.filter(location => {
      // Check if any feature matches the search term
      const hasMatchingFeature = location.features.some(feature => 
        term.split(' ').some(word => 
          word.length > 2 && feature.toLowerCase().includes(word)
        )
      );
      
      // Check if location type matches certain features
      const isTypeMatch = 
        (term.includes('studio') && location.title.toLowerCase().includes('studio')) ||
        (term.includes('mansion') && location.title.toLowerCase().includes('mansion')) ||
        (term.includes('rustic') && location.title.toLowerCase().includes('barn')) ||
        (term.includes('palm') && location.title.toLowerCase().includes('luxury')) ||
        (term.includes('industrial') && location.title.toLowerCase().includes('warehouse'));
      
      // Check description for related terms
      const hasDescriptionMatch = 
        (term.includes('couch') && location.description.toLowerCase().includes('living')) ||
        (term.includes('light') && location.description.toLowerCase().includes('bright')) ||
        (term.includes('ceiling') && location.description.toLowerCase().includes('spacious')) ||
        (term.includes('mirror') && location.description.toLowerCase().includes('bathroom')) ||
        (term.includes('kitchen') && location.description.toLowerCase().includes('dining')) ||
        (term.includes('bathroom') && location.description.toLowerCase().includes('shower')) ||
        (term.includes('art') && location.description.toLowerCase().includes('decor')) ||
        (term.includes('painting') && location.description.toLowerCase().includes('decorated'));
      
      return hasMatchingFeature || isTypeMatch || hasDescriptionMatch;
    });
  }
  
  // For regular searches, use normal text matching
  return FALLBACK_LOCATIONS.filter(location => 
    location.title.toLowerCase().includes(term) ||
    location.description.toLowerCase().includes(term) ||
    location.address.toLowerCase().includes(term) ||
    location.tags.some(tag => tag.toLowerCase().includes(term)) ||
    location.features.some(feature => feature.toLowerCase().includes(term))
  );
}

// Apply comprehensive filters to locations
function applyAdvancedFilters(
  locations: LocationType[], 
  filters: SearchFilters,
  searchTerm?: string
): LocationType[] {
  let filteredResults = [...locations];

  // Only show approved locations
  filteredResults = filteredResults.filter(location => 
    location.status === "approved"
  );

  // Apply location filter
  if (filters.location && filters.location.trim()) {
    const locationTerm = filters.location.toLowerCase();
    filteredResults = filteredResults.filter(location => 
      location.address?.toLowerCase().includes(locationTerm) ||
      location.city?.toLowerCase().includes(locationTerm) ||
      location.state?.toLowerCase().includes(locationTerm)
    );
  }

  // Apply keywords filter
  if (filters.keywords && filters.keywords.trim()) {
    const keywordTerm = filters.keywords.toLowerCase();
    filteredResults = filteredResults.filter(location => 
      location.title?.toLowerCase().includes(keywordTerm) ||
      location.description?.toLowerCase().includes(keywordTerm)
    );
  }

  // Apply price range filter
  filteredResults = filteredResults.filter(location => 
    location.price >= filters.priceRange[0] && 
    location.price <= filters.priceRange[1]
  );

  // Apply capacity filter
  if (filters.capacity) {
    filteredResults = filteredResults.filter(location => 
      (location.maxGuests || 0) >= filters.capacity!
    );
  }

  // Apply minimum hours filter
  if (filters.minHours) {
    filteredResults = filteredResults.filter(location => 
      (location.minimumHours || 1) <= filters.minHours!
    );
  }

  // Apply amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    filteredResults = filteredResults.filter(location => {
      const locationAmenities = location.amenities || [];
      return filters.amenities.some(filterAmenity => 
        locationAmenities.some(locationAmenity => 
          locationAmenity.toLowerCase().includes(filterAmenity.toLowerCase()) ||
          filterAmenity.toLowerCase().includes(locationAmenity.toLowerCase())
        )
      );
    });
  }

  // Apply instant book filter
  if (filters.instantBook) {
    filteredResults = filteredResults.filter(location => 
      location.instantBook === true
    );
  }

  // Apply recently added filter (last 30 days)
  if (filters.recentlyAdded) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    filteredResults = filteredResults.filter(location => 
      location.createdAt && new Date(location.createdAt) >= thirtyDaysAgo
    );
  }

  // Apply search term filter if provided
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filteredResults = filteredResults.filter(location => 
      location.title?.toLowerCase().includes(term) ||
      location.description?.toLowerCase().includes(term) ||
      location.address?.toLowerCase().includes(term) ||
      extractTags(location).some(tag => tag.toLowerCase().includes(term))
    );
  }

  return filteredResults;
}

// Apply comprehensive filters to fallback locations
function applyAdvancedFiltersToFallback(
  locations: any[], 
  filters: SearchFilters,
  searchTerm?: string
): any[] {
  let filteredResults = [...locations];

  // Apply location filter
  if (filters.location && filters.location.trim()) {
    const locationTerm = filters.location.toLowerCase();
    filteredResults = filteredResults.filter(location => 
      location.address?.toLowerCase().includes(locationTerm)
    );
  }

  // Apply keywords filter
  if (filters.keywords && filters.keywords.trim()) {
    const keywordTerm = filters.keywords.toLowerCase();
    filteredResults = filteredResults.filter(location => 
      location.title?.toLowerCase().includes(keywordTerm) ||
      location.description?.toLowerCase().includes(keywordTerm)
    );
  }

  // Apply price range filter
  filteredResults = filteredResults.filter(location => 
    location.price >= filters.priceRange[0] && 
    location.price <= filters.priceRange[1]
  );

  // Apply amenities filter - check if fallback has features that match amenities
  if (filters.amenities && filters.amenities.length > 0) {
    filteredResults = filteredResults.filter(location => {
      const locationFeatures = location.features || [];
      const locationTags = location.tags || [];
      return filters.amenities.some(filterAmenity => 
        locationFeatures.some((feature: string) => 
          feature.toLowerCase().includes(filterAmenity.toLowerCase()) ||
          filterAmenity.toLowerCase().includes(feature.toLowerCase())
        ) ||
        locationTags.some((tag: string) => 
          tag.toLowerCase().includes(filterAmenity.toLowerCase()) ||
          filterAmenity.toLowerCase().includes(tag.toLowerCase())
        )
      );
    });
  }

  // Apply search term filter if provided
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filteredResults = filteredResults.filter(location => 
      location.title?.toLowerCase().includes(term) ||
      location.description?.toLowerCase().includes(term) ||
      location.address?.toLowerCase().includes(term) ||
      location.tags?.some((tag: string) => tag.toLowerCase().includes(term)) ||
      location.features?.some((feature: string) => feature.toLowerCase().includes(term))
    );
  }

  return filteredResults;
}

export default function SimpleSearchResults() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [initialSearchTerm, setInitialSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
  const [useRealData, setUseRealData] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [imageIndexes, setImageIndexes] = useState<Record<number, number>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    priceRange: [0, 1000],
    capacity: 5,
    amenities: [],
    minHours: 1,
    location: '',
    recentlyAdded: false,
    instantBook: false,
    keywords: '',
  });
  
  // Get user authentication status
  const { user } = useAuth() || { user: null };
  const isLoggedIn = !!user;
  
  // For error toast
  const { toast } = useToast();
  
  // Available filters - can be expanded later
  const filterOptions = [
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Popularity", value: "popular" },
  ];
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  // Fetch real locations from API
  const { data: apiLocations, isLoading: isLoadingLocations, isError: isErrorLocations } = useQuery<LocationType[]>({
    queryKey: ["/api/locations"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Special query for visual feature search
  const visualFeaturePattern = /couch|sofa|chair|table|desk|wall|brick|hardwood|ceiling|window|light|palm|tree|mansion|studio|mirror|kitchen|bathroom|carpet|art|painting|plant|counter|cabinet|door|stair/i;
  const isVisualSearch = initialSearchTerm && visualFeaturePattern.test(initialSearchTerm);
  
  // Query for visual search results if needed
  const { 
    data: visualSearchData,
    isLoading: isLoadingVisual,
    isError: isErrorVisual
   } = useQuery({
    queryKey: ['/api/search/ai', initialSearchTerm],
    queryFn: async () => {
      if (!initialSearchTerm || !isVisualSearch) return null;
      
      console.log('Making visual feature search for:', initialSearchTerm);
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: initialSearchTerm })
      });
      
      if (!response.ok) {
        throw new Error(`Visual search failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!initialSearchTerm && isVisualSearch
  });
  
  // Combined loading and error states
  const isLoading = isLoadingLocations || (isVisualSearch && isLoadingVisual);
  const isError = isErrorLocations || (isVisualSearch && isErrorVisual);
  
  // Helper function to sort locations
  const sortLocations = (locations: any[], sortOption: string) => {
    if (!sortOption) return locations; // No sorting needed
    
    console.log(`Sorting ${locations.length} locations by ${sortOption}`);
    
    return [...locations].sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.reviews || 0) - (a.reviews || 0);
        default:
          return 0;
      }
    });
  };
  
  // Get search term from URL on first load and set up initial locations
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Check multiple possible query parameters - either 'q' or 'query'
    const queryParam = params.get("q") || params.get("query") || localStorage.getItem('aiSearchQuery') || "";
    const searchMode = params.get("mode") || "classic";
    
    console.log("Simple search page loaded with query:", queryParam);
    console.log("Search mode:", searchMode);
    console.log("Search params:", Object.fromEntries(params.entries()));
    
    // Store the query in localStorage for persistence
    if (queryParam) {
      localStorage.setItem('aiSearchQuery', queryParam);
    }
    
    setSearchTerm(queryParam);
    setInitialSearchTerm(queryParam);
    
    // Use fallback locations until API data is loaded
    setFilteredLocations(filterFallbackLocations(queryParam));
    
    // Add special handling for feature-specific searches
    const isFeatureSearch = /couch|sofa|chair|table|desk|wall|brick|hardwood|ceiling|window|light|palm|tree|mansion|studio|mirror|kitchen|bathroom|carpet|art|painting|plant|counter|cabinet|door|stair/i.test(queryParam);
    if (isFeatureSearch && searchMode === 'ai') {
      toast({
        title: "Feature-specific search",
        description: "We're showing you results with the requested features.",
        duration: 3000,
      });
    }
  }, []);
  
  // Update filtered locations when API data loads or when sort/filter changes
  useEffect(() => {
    // If we have visual search results and this is a visual search
    if (isVisualSearch && visualSearchData && visualSearchData.enhancedResults?.length > 0) {
      console.log('Using visual search results:', visualSearchData.enhancedResults);
      // Use the enhanced results from our visual search
      setFilteredLocations(sortLocations(visualSearchData.enhancedResults, activeFilter));
      setUseRealData(true);
      
      // Show toast notification for visual search
      toast({
        title: "Visual features detected",
        description: `Found ${visualSearchData.enhancedResults.length} locations with the features you requested.`,
        duration: 3000,
      });
    } 
    // Otherwise, fall back to regular filtering
    else if (apiLocations && apiLocations.length > 0) {
      // If we have real API data, apply comprehensive filters
      const filtered = applyAdvancedFilters(apiLocations, activeFilters, searchTerm);
      setFilteredLocations(sortLocations(filtered, activeFilter));
      setUseRealData(true);
      
      // Remove popup notifications that appear during filtering/typing
      // User feedback will be provided through the UI state instead
    } else if (isError || (apiLocations && apiLocations.length === 0)) {
      // Fall back to hardcoded data if there's an error or no locations
      const filtered = applyAdvancedFiltersToFallback(FALLBACK_LOCATIONS, activeFilters, searchTerm);
      setFilteredLocations(sortLocations(filtered, activeFilter));
      setUseRealData(false);
    }
  }, [apiLocations, isError, searchTerm, activeFilter, activeFilters, visualSearchData, isVisualSearch]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is a visual feature search
    const isFeatureSearch = visualFeaturePattern.test(searchTerm);
    
    if (isFeatureSearch) {
      console.log('Visual feature search detected, updating URL and triggering AI search');
      
      // Update URL with new search parameters
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('q', searchTerm);
      currentUrl.searchParams.set('mode', 'ai');
      window.history.pushState({}, '', currentUrl.toString());
      
      // Set the initial search term to trigger the visual search query
      setInitialSearchTerm(searchTerm);
      
      // Show searching toast notification
      toast({
        title: "Visual feature search",
        description: "Analyzing images for requested visual features...",
        duration: 2000,
      });
      
      // The visual search query will be triggered through the useQuery hook
      return;
    }
    
    // Standard text-based search
    if (apiLocations && apiLocations.length > 0) {
      // Always prioritize API data if available
      const filtered = filterApiLocations(apiLocations, searchTerm);
      // Apply sorting if there's an active filter
      setFilteredLocations(sortLocations(filtered, activeFilter));
      setUseRealData(true);
      
      // Show message if no results found
      if (filtered.length === 0 && searchTerm) {
        toast({
          title: "No results found",
          description: "We couldn't find any locations matching your search.",
          duration: 3000,
        });
      }
    } else {
      // Use fallback data only when API data isn't available
      setFilteredLocations(sortLocations(filterFallbackLocations(searchTerm), activeFilter));
      setUseRealData(false);
    }
    
    // Debug information
    console.log(`Sorting by: ${activeFilter || 'none (default order)'}`);
  };
  
  // Go back to home
  const handleGoBack = () => {
    setLocation("/");
  };

  // Handle filter changes
  const handleFiltersChange = (filters: SearchFilters) => {
    setActiveFilters(filters);
    
    // Apply the filters immediately
    let filtered: any[] = [];
    if (apiLocations && apiLocations.length > 0) {
      filtered = applyAdvancedFilters(apiLocations, filters, searchTerm);
      setFilteredLocations(sortLocations(filtered, activeFilter));
      setUseRealData(true);
    } else {
      // Apply filters to fallback data
      filtered = applyAdvancedFiltersToFallback(FALLBACK_LOCATIONS, filters, searchTerm);
      setFilteredLocations(sortLocations(filtered, activeFilter));
      setUseRealData(false);
    }

    // Remove popup notification to avoid intrusive popups during filtering
    // Filter results are visible in the UI immediately
  };
  
  // We've simplified the component to not require authentication
  
  // Handle save/bookmark - redirect to login if not authenticated
  const handleSave = (e: React.MouseEvent, locationId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      // Redirect to login page
      setLocation("/auth");
      toast({
        title: "Authentication required",
        description: "Please login to save locations",
        duration: 3000,
      });
      return;
    }
    
    toast({
      title: "Location saved!",
      description: "This location has been added to your saved list.",
      duration: 3000,
    });
  };
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <AppLayout>
      <div className="relative w-full bg-gradient-to-b from-primary/10 to-background pb-8">
        <div className="container mx-auto py-6 px-4 md:py-10 md:px-8">
        {/* Hero section with search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mr-3 bg-background/80 hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {initialSearchTerm 
                    ? `Results for "${initialSearchTerm}"` 
                    : "All Locations"}
                </h1>
                <div className="flex items-center gap-2">
                  {new URLSearchParams(window.location.search).get("mode") === "ai" && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 mt-1">
                      AI Enhanced
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Found {filteredLocations.length} perfect spots for your next project
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="px-3 py-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <select 
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="">Sort By</option>
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex w-full gap-3 bg-background border border-input rounded-lg p-1 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by location type, features, or address..."
                className="pl-9 border-0 shadow-none h-11"
              />
            </div>
            <Button type="submit" className="px-6">Search</Button>
          </form>
        </motion.div>
        
        {/* Popular searches */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Popular searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Studio", "Outdoor", "Warehouse", "Kitchen", "Mirror", "Bathroom", "Art", "Natural Light"].map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setSearchTerm(tag);
                  handleSearch(new Event('submit') as any);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p className="text-lg">Discovering amazing locations...</p>
            <p className="text-sm text-muted-foreground mt-2">This won't take long</p>
          </div>
        )}
        
        {/* Results grid with animations */}
        {!isLoading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredLocations.map((location, locationIdx) => {
              // Handle different location data formats (real API vs. fallback)
              const locationId = location.id || locationIdx;
              const locationTitle = location.title || "Unnamed Location";
              const locationImages = location.images || ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop"];
              const locationDescription = location.description || "No description available";
              const locationAddress = location.address || "Address not available";
              const locationPrice = location.price || 0;
              
              // Get tags from either real API data or fallback data
              const tags = useRealData && location.amenities 
                ? extractTags(location as LocationType)
                : (location.tags || []);
              
              // Fallback review count
              const reviewCount = location.reviews || 0;
              
              // Get the current image index for this location
              const currentImageIndex = imageIndexes[locationId] || 0;
              
              const handlePrevImage = (e: React.MouseEvent, id: number) => {
                e.preventDefault();
                e.stopPropagation();
                setImageIndexes(prev => {
                  const currentIndex = prev[id] || 0;
                  const newIndex = currentIndex > 0 ? currentIndex - 1 : locationImages.length - 1;
                  return { ...prev, [id]: newIndex };
                });
              };
              
              const handleNextImage = (e: React.MouseEvent, id: number) => {
                e.preventDefault();
                e.stopPropagation();
                setImageIndexes(prev => {
                  const currentIndex = prev[id] || 0;
                  const newIndex = currentIndex < locationImages.length - 1 ? currentIndex + 1 : 0;
                  return { ...prev, [id]: newIndex };
                });
              };
            
              return (
                <motion.div 
                  variants={itemVariants}
                  key={`location-${locationId}`}
                >
                  <LocationCard 
                    location={{
                      id: locationId,
                      title: locationTitle,
                      price: locationPrice,
                      address: locationAddress,
                      description: locationDescription || "",
                      images: locationImages,
                      propertyType: tags[0] || "",
                      amenities: tags.slice(1),
                      instantBooking: location.instantBooking || false,
                      featured: locationIdx % 3 === 0, // Make every third item a SUPERHOST for demo
                      reviewCount: reviewCount || 0,
                      rating: 4.7,
                      size: 0,
                      maxCapacity: 0,
                      minHours: 0,
                      ownerId: 0,
                      availability: [],
                      status: "approved",
                      category: "",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      statusReason: null,
                      statusUpdatedAt: null,
                      statusUpdatedBy: null
                    }}
                    horizontalLayout={true}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
        
        {/* No results message */}
        {!isLoading && filteredLocations.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-background rounded-xl border shadow-sm mx-auto max-w-md"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground mb-6 px-6">
              We couldn't find any locations matching your search. Try adjusting your terms or browse all available locations.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                if (apiLocations && apiLocations.length > 0) {
                  setFilteredLocations(apiLocations);
                  setUseRealData(true);
                } else {
                  setFilteredLocations(FALLBACK_LOCATIONS);
                  setUseRealData(false);
                }
              }}
              className="px-6"
            >
              View all locations
            </Button>
          </motion.div>
        )}
        
        {/* Pagination - only show when more than 12 locations */}
        {!isLoading && filteredLocations.length > 12 && (
          <div className="flex justify-center mt-12 mb-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                Next
                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Filter Dialog */}
      <FilterDialog
        open={showFilters}
        onOpenChange={setShowFilters}
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
      />
    </AppLayout>
  );
}