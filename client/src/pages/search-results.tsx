import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { useLocation } from "wouter";
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { UserMenu } from "@/components/user/user-menu";
import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { LanguageDropdown } from "@/components/user/language-dropdown";
import { useTranslation } from "@/hooks/use-translation";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { LocationCard } from "@/components/locations/location-card";
import { CategoryBar } from "@/components/search/category-bar";
import { FilterDialog, SearchFilters } from "@/components/search/filter-dialog";
import { getPropertyFilters } from "@shared/property-categories";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Extract city name from address string
function extractCityNameFromAddress(address: string): string {
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

// Get property categories from shared configuration
const categories = getPropertyFilters();

// Sorting options
type SortOption = 'newest' | 'price-low' | 'price-high';

// Function to sort locations based on sort option
function sortLocations(locations: Location[], sortOption: SortOption): Location[] {
  switch (sortOption) {
    case 'newest':
      // Sort by newest first (using ID as proxy for creation time)
      return [...locations].sort((a, b) => b.id - a.id);
    case 'price-low':
      // Sort by price low to high
      return [...locations].sort((a, b) => a.price - b.price);
    case 'price-high':
      // Sort by price high to low
      return [...locations].sort((a, b) => b.price - a.price);
    default:
      return locations;
  }
}

// Function to calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in miles
  
  return distance;
}

// Hard-coded test data for additional listings
const testListings: Location[] = [
  {
    id: 101,
    ownerId: 1,
    title: "Luxury Penthouse Studio",
    description: "Stunning rooftop studio with panoramic city views",
    address: "123 Sunset Blvd, Los Angeles, CA 90028",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90028",
    country: "USA",
    latitude: 34.1012,
    longitude: -118.3295,
    price: 450,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "studio",
    amenities: ["wifi", "parking", "kitchen"],
    maxGuests: 4,
    minimumHours: 2,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 102,
    ownerId: 2,
    title: "Modern Creative Workshop",
    description: "Bright and airy workshop space perfect for artists",
    address: "456 Arts District Way, Los Angeles, CA 90013",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90013",
    country: "USA",
    latitude: 34.0407,
    longitude: -118.2468,
    price: 280,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "creative-space",
    amenities: ["wifi", "heating", "lighting-equipment"],
    maxGuests: 10,
    minimumHours: 3,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 103,
    ownerId: 3,
    title: "Cozy Garden Meeting Room",
    description: "Private meeting space with beautiful garden views",
    address: "789 Green Street, Beverly Hills, CA 90210",
    city: "Beverly Hills",
    state: "CA",
    zipCode: "90210",
    country: "USA",
    latitude: 34.0736,
    longitude: -118.4004,
    price: 180,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "meeting-room",
    amenities: ["wifi", "whiteboard", "coffee"],
    maxGuests: 8,
    minimumHours: 1,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 104,
    ownerId: 4,
    title: "Industrial Loft Event Space",
    description: "Spacious industrial loft perfect for events",
    address: "321 Factory Row, Los Angeles, CA 90021",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90021",
    country: "USA",
    latitude: 34.0338,
    longitude: -118.2329,
    price: 650,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "event-space",
    amenities: ["wifi", "parking", "sound-system", "kitchen"],
    maxGuests: 50,
    minimumHours: 4,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 105,
    ownerId: 5,
    title: "Beachfront Yoga Studio",
    description: "Serene studio steps from the ocean",
    address: "567 Ocean Ave, Santa Monica, CA 90401",
    city: "Santa Monica",
    state: "CA",
    zipCode: "90401",
    country: "USA",
    latitude: 34.0195,
    longitude: -118.4912,
    price: 220,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "wellness-space",
    amenities: ["yoga-mats", "changing-room", "shower"],
    maxGuests: 15,
    minimumHours: 2,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 106,
    ownerId: 6,
    title: "Executive Conference Suite",
    description: "Professional conference room with all amenities",
    address: "999 Business Center Dr, Los Angeles, CA 90017",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90017",
    country: "USA",
    latitude: 34.0522,
    longitude: -118.2583,
    price: 380,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "office-space",
    amenities: ["wifi", "projector", "conference-phone", "parking"],
    maxGuests: 20,
    minimumHours: 2,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 107,
    ownerId: 7,
    title: "Boutique Photo Studio",
    description: "Professional photography studio with natural light",
    address: "234 Photography Lane, Culver City, CA 90232",
    city: "Culver City",
    state: "CA",
    zipCode: "90232",
    country: "USA",
    latitude: 34.0211,
    longitude: -118.3965,
    price: 320,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1565953522043-baea26b83b7e?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "photo-studio",
    amenities: ["lighting-equipment", "backdrops", "changing-room"],
    maxGuests: 10,
    minimumHours: 2,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 108,
    ownerId: 8,
    title: "Rustic Barn Venue",
    description: "Charming barn perfect for intimate gatherings",
    address: "876 Country Road, Malibu, CA 90265",
    city: "Malibu",
    state: "CA",
    zipCode: "90265",
    country: "USA",
    latitude: 34.0259,
    longitude: -118.7798,
    price: 750,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "unique-venue",
    amenities: ["parking", "outdoor-space", "kitchen"],
    maxGuests: 80,
    minimumHours: 5,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 109,
    ownerId: 9,
    title: "Downtown Dance Studio",
    description: "Spacious studio with sprung floors and mirrors",
    address: "543 Dance Ave, Los Angeles, CA 90014",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90014",
    country: "USA",
    latitude: 34.0467,
    longitude: -118.2520,
    price: 190,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "fitness-studio",
    amenities: ["sound-system", "changing-room", "parking"],
    maxGuests: 25,
    minimumHours: 1,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 110,
    ownerId: 10,
    title: "Rooftop Terrace Lounge",
    description: "Stunning rooftop with city skyline views",
    address: "100 Sky High Blvd, West Hollywood, CA 90069",
    city: "West Hollywood",
    state: "CA",
    zipCode: "90069",
    country: "USA",
    latitude: 34.0900,
    longitude: -118.3617,
    price: 550,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "rooftop-terrace",
    amenities: ["wifi", "bar", "heating", "sound-system"],
    maxGuests: 40,
    minimumHours: 3,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 111,
    ownerId: 11,
    title: "Minimalist Gallery Space",
    description: "Clean, white-walled gallery for exhibitions",
    address: "678 Art Walk, Los Angeles, CA 90015",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90015",
    country: "USA",
    latitude: 34.0393,
    longitude: -118.2573,
    price: 420,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1565034946487-077786996e27?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "gallery",
    amenities: ["wifi", "lighting-system", "security"],
    maxGuests: 60,
    minimumHours: 4,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 112,
    ownerId: 12,
    title: "Podcast Recording Studio",
    description: "Professional podcast studio with top equipment",
    address: "432 Media Row, Burbank, CA 91505",
    city: "Burbank",
    state: "CA",
    zipCode: "91505",
    country: "USA",
    latitude: 34.1808,
    longitude: -118.3090,
    price: 260,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "recording-studio",
    amenities: ["recording-equipment", "soundproofing", "wifi"],
    maxGuests: 6,
    minimumHours: 2,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 113,
    ownerId: 13,
    title: "Zen Meditation Room",
    description: "Peaceful space for meditation and mindfulness",
    address: "789 Tranquil Path, Pasadena, CA 91101",
    city: "Pasadena",
    state: "CA",
    zipCode: "91101",
    country: "USA",
    latitude: 34.1478,
    longitude: -118.1445,
    price: 150,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: true,
    propertyType: "wellness-space",
    amenities: ["meditation-cushions", "sound-system", "tea-station"],
    maxGuests: 12,
    minimumHours: 1,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 114,
    ownerId: 14,
    title: "Chef's Kitchen Studio",
    description: "Professional kitchen for cooking classes and filming",
    address: "345 Culinary Court, Manhattan Beach, CA 90266",
    city: "Manhattan Beach",
    state: "CA",
    zipCode: "90266",
    country: "USA",
    latitude: 33.8847,
    longitude: -118.4109,
    price: 480,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "kitchen-studio",
    amenities: ["professional-equipment", "filming-lights", "dining-area"],
    maxGuests: 20,
    minimumHours: 3,
    images: [],
    availability: [],
    unavailableDates: []
  },
  {
    id: 115,
    ownerId: 15,
    title: "Vintage Theater Space",
    description: "Historic theater perfect for performances",
    address: "567 Stage Street, Hollywood, CA 90028",
    city: "Hollywood",
    state: "CA",
    zipCode: "90028",
    country: "USA",
    latitude: 34.1016,
    longitude: -118.3267,
    price: 850,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
    status: "approved",
    createdAt: new Date().toISOString(),
    instantBook: false,
    propertyType: "theater",
    amenities: ["stage", "lighting", "sound-system", "dressing-rooms"],
    maxGuests: 100,
    minimumHours: 4,
    images: [],
    availability: [],
    unavailableDates: []
  }
];

// Custom layout component without footer for search results page
function SearchResultsLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [location] = useWouterLocation();
  const isHomePage = location === "/";
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col bg-white m-0 p-0 h-screen overflow-hidden">
      <header 
        className={cn(
          "z-50 transition-all duration-300 w-full m-0 p-0 border-b bg-white flex-shrink-0"
        )}
      >
        <div className="w-full py-2 sm:py-3 flex items-center">
          <div className="w-1/4 flex justify-start">
            <Link 
              href="/" 
              className="pl-4 flex items-center"
            >
              <div className="relative h-14 sm:h-16 flex-shrink-0">
                <img 
                  src="/assets/blocmark-logo.png" 
                  alt="Blocmark Logo" 
                  className="h-full w-auto object-contain transition-opacity hover:opacity-90"
                  style={{ maxWidth: 'none' }}
                />
              </div>
            </Link>
          </div>
          <div className="w-2/4 flex justify-center items-center">
            {user && <MainNav scrolled={scrolled} />}
          </div>
          <div className="w-1/4 flex justify-end items-center gap-2 sm:gap-4 pr-4">
            <LanguageDropdown scrolled={scrolled} isHomePage={isHomePage} />
            
            {user ? (
              <>
                <NotificationDropdown />
                <UserMenu scrolled={scrolled} />
              </>
            ) : (
              <>
                <Link href="/host">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="sm:mr-2 hidden sm:flex"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> {t("listing.addListing")}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="sm:hidden"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm" 
                    className="p-2 rounded-full aspect-square transition-all duration-200 hover:scale-110 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                    variant="outline"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white overflow-hidden">{children}</main>
      
      <MobileNav />
    </div>
  );
}

export default function SearchResultsPage() {
  const [location] = useLocation();
  
  // Use window.location.search directly to get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const typeParam = searchParams.get('type');
  const activityParam = searchParams.get('activity');
  const queryParam = searchParams.get('q') || '';
  
  // Extract search parameters from URL
  
  // Set initial city filter based on query parameter if it exists
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    typeParam || undefined
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 12;
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    priceRange: [0, 1000],
    capacity: undefined, // Remove default capacity filter
    amenities: [],
    activity: activityParam || typeParam || undefined, // Use either activity or type parameter
    city: queryParam || undefined,
    location: '',
    minHours: undefined, // Remove default minHours filter
    recentlyAdded: false,
    instantBook: false,
    keywords: '',
  });
  
  // Log initial filter state
  console.log('=== SEARCH RESULTS PAGE INITIALIZED ===');
  console.log('URL Parameters:', {
    typeParam,
    activityParam,
    queryParam
  });
  console.log('Initial filters:', {
    activity: activityParam || typeParam || undefined,
    city: queryParam || undefined
  });

  // State for map center based on searched city
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 34.0522, lng: -118.2437 // Default to Los Angeles
  });

  // State for displaying the searched location name - initialize with search query if present
  const [locationDisplayName, setLocationDisplayName] = useState<string>(
    queryParam || "Los Angeles, CA, USA"
  );
  
  console.log('SearchResultsPage - Initial render:', {
    queryParam,
    locationDisplayName,
    mapCenter,
    currentUrl: location
  });
  
  // State to track if geocoding is complete - start as true if no query to avoid double loading
  const [isGeocodingComplete, setIsGeocodingComplete] = useState(!queryParam);

  // Geocode searched city and update map center
  useEffect(() => {
    console.log('=== GEOCODING EFFECT TRIGGERED ===');
    console.log('queryParam:', queryParam);
    console.log('activeFilters.city:', activeFilters.city);
    console.log('activeFilters.location:', activeFilters.location);
    
    const geocodeCity = async () => {
      const searchedCity = queryParam || activeFilters.city || activeFilters.location;
      
      console.log('Geocoding city:', searchedCity, 'Query param:', queryParam);
      
      if (!searchedCity || searchedCity.trim() === '') {
        // No search query, use default location
        console.log('No city to geocode, keeping default location');
        setIsGeocodingComplete(true);
        return;
      }

      // Update display name immediately with search term
      console.log('Setting initial display name to:', searchedCity);
      setLocationDisplayName(searchedCity);

      // Wait for Google Maps to load
      const waitForGoogleMaps = () => {
        // Check if Google Maps is already loaded
        if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
          console.log('Google Maps not loaded yet, retrying...');
          
          // Check if script is already added
          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
          if (!existingScript) {
            // Add Google Maps script if not present
            const script = document.createElement('script');
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
            script.async = true;
            script.onload = () => {
              console.log('Google Maps loaded successfully');
              performGeocoding();
            };
            document.head.appendChild(script);
          } else {
            // Script exists, wait for it to load
            setTimeout(waitForGoogleMaps, 200);
          }
          return;
        }

        // Google Maps is loaded, perform geocoding
        console.log('Google Maps already loaded, performing geocoding...');
        performGeocoding();
      };

      const performGeocoding = () => {
        console.log('performGeocoding called for:', searchedCity);
        
        try {
          const geocoder = new window.google.maps.Geocoder();
          
          console.log('Starting geocoding for:', searchedCity);
          
          geocoder.geocode({ address: searchedCity }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();
              
              console.log(`Geocoded ${searchedCity} to:`, { lat, lng });
              console.log('Setting map center to:', { lat, lng });
              setMapCenter({ lat, lng });
              
              // Update display name with formatted address
              const formattedAddress = results[0].formatted_address || searchedCity;
              console.log('Geocoding successful. Setting location display name to:', formattedAddress);
              setLocationDisplayName(formattedAddress);
            } else {
              console.warn(`Geocoding failed for ${searchedCity}:`, status);
              // Keep search term as display name even if geocoding fails
              setLocationDisplayName(searchedCity);
            }
            
            // Mark geocoding as complete regardless of success
            setIsGeocodingComplete(true);
          });
        } catch (error) {
          console.error('Error geocoding city:', error);
          // Keep search term as display name
          setLocationDisplayName(searchedCity);
          setIsGeocodingComplete(true);
        }
      };

      waitForGoogleMaps();
    };

    // Reset geocoding state when search changes
    setIsGeocodingComplete(false);
    
    // Start geocoding immediately
    geocodeCity();
  }, [queryParam, activeFilters.city, activeFilters.location]);

  // Update location display name when location filter changes
  useEffect(() => {
    if (activeFilters.location && activeFilters.location.trim() !== '') {
      setLocationDisplayName(activeFilters.location);
      
      // Also trigger geocoding for the new location
      console.log('Location filter changed, triggering geocoding for:', activeFilters.location);
      
      // Mark geocoding as incomplete to trigger new search
      setIsGeocodingComplete(false);
      
      // Geocode the new location
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: activeFilters.location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newCenter = {
              lat: location.lat(),
              lng: location.lng()
            };
            console.log('Geocoded location filter:', activeFilters.location, 'to:', newCenter);
            setMapCenter(newCenter);
            
            // Update display name with the formatted address from geocoding
            if (results[0].formatted_address) {
              setLocationDisplayName(results[0].formatted_address);
            }
            
            // Mark geocoding as complete to trigger search with new coordinates
            setIsGeocodingComplete(true);
          } else {
            console.error('Geocoding failed for location filter:', activeFilters.location, status);
            setIsGeocodingComplete(true);
          }
        });
      }
    } else if (!queryParam && !activeFilters.city) {
      // Reset to default when no location filters are active
      setLocationDisplayName("Los Angeles, CA, USA");
      setMapCenter({ lat: 34.0522, lng: -118.2437 });
    }
  }, [activeFilters.location, queryParam, activeFilters.city]);
  
  // State for scroll arrow visibility - make right arrow always visible by default
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true); // Always show right arrow initially
  
  // Effect to check scroll position on mount and after scroll
  useEffect(() => {
    // Ensure DOM is fully loaded before checking dimensions
    const checkScrollPosition = () => {
      const container = document.getElementById('categories-container');
      if (container) {
        // Show left arrow if scrolled right
        const hasScrolled = container.scrollLeft > 20;
        setShowLeftArrow(hasScrolled);
        
        // Check if there's more content to scroll to
        const hasMoreContent = container.scrollWidth > container.clientWidth + 20;
        const isAtEnd = Math.abs(
          (container.scrollWidth - container.scrollLeft - container.clientWidth)
        ) < 10;
        
        // Only hide right arrow when at the end
        if (isAtEnd) {
          setShowRightArrow(false);
        } else {
          setShowRightArrow(true);
        }
        
        // Force right arrow to always be visible initially
        if (container.scrollLeft === 0) {
          setShowRightArrow(true);
        }
      }
    };
    
    // Force right arrow to be visible at the beginning
    setShowRightArrow(true);
    
    // Initial check with multiple retries to ensure DOM is fully loaded
    setTimeout(checkScrollPosition, 50);
    setTimeout(checkScrollPosition, 200);
    setTimeout(checkScrollPosition, 500);
    setTimeout(checkScrollPosition, 1000);
    
    // Add resize listener for window size changes
    window.addEventListener('resize', checkScrollPosition);
    
    // Add scroll event listener
    const container = document.getElementById('categories-container');
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScrollPosition);
      const container = document.getElementById('categories-container');
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, []);

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations/search", queryParam, activeFilters, isGeocodingComplete ? mapCenter : null],
    enabled: true, // Always enabled to avoid loading delays
    cacheTime: 0, // Don't cache the results
    queryFn: async ({ queryKey }) => {
      try {
        // Build search parameters
        const params = new URLSearchParams();
        
        // Use location filter if present, otherwise use original query
        const searchLocation = activeFilters.location || queryParam;
        
        // Add search query
        if (searchLocation) {
          params.append("q", searchLocation);
          // Also pass as city for text-based filtering fallback
          params.append("city", searchLocation);
        }
        
        // Add filters
        if (activeFilters.priceRange) {
          const [min, max] = activeFilters.priceRange;
          if (min > 0) params.append("priceMin", min.toString());
          if (max < 1000) params.append("priceMax", max.toString());
        }
        // Don't duplicate city if it's the same as query
        if (activeFilters.city && activeFilters.city !== queryParam) {
          params.append("city", activeFilters.city);
        }
        if (activeFilters.capacity) params.append("capacity", activeFilters.capacity.toString());
        if (activeFilters.activity) params.append("activity", activeFilters.activity);
        if (activeFilters.amenities?.length > 0) {
          params.append("amenities", activeFilters.amenities.join(","));
        }
        if (activeFilters.houseStyles && activeFilters.houseStyles.length > 0) {
          activeFilters.houseStyles.forEach(style => params.append("houseStyle", style));
        }
        if (activeFilters.propertyFeatures && activeFilters.propertyFeatures.length > 0) {
          activeFilters.propertyFeatures.forEach(feature => {
            params.append("propertyFeatures", feature);
          });
        }
        
        // Add proximity filtering only if we have geocoded coordinates
        // Use location filter or original query for proximity search
        const locationForProximity = activeFilters.location || queryParam;
        if (locationForProximity && isGeocodingComplete && mapCenter.lat && mapCenter.lng) {
          params.append('lat', mapCenter.lat.toString());
          params.append('lng', mapCenter.lng.toString());
          params.append('radius', '50'); // 50 miles radius
        }
        
        const url = `/api/locations/search?${params.toString()}`;
        
        console.log('Fetching locations with URL:', url);
        
        const res = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (!res.ok) {
          if (res.status === 401) {
            console.log("Not authenticated, returning empty array");
            return []; // Return empty array to prevent auth errors
          }
          const errorText = await res.text();
          console.error('Location search failed:', res.status, errorText);
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Received locations:', data.length, 'items');
        return data;
      } catch (error) {
        console.error("Error fetching locations:", error);
        return []; // Return empty array on any error
      }
    },
    retry: false,
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId);
  };

  const handleFiltersChange = (filters: SearchFilters) => {
    console.log('Applying filters:', filters);
    console.log('Location filter being applied:', filters.location);
    
    // If location filter is set, clear the city filter to avoid confusion
    const updatedFilters = {...filters};
    if (filters.location && filters.location.trim() !== '') {
      updatedFilters.city = undefined;
    }
    
    // Apply the filters with a small delay to ensure the UI updates
    setActiveFilters(updatedFilters);
    setShowFilters(false);
  };

  // Combine API locations with test listings
  const allLocations = [...locations, ...testListings];

  // Filter locations based on selected category, approval status, and active filters
  const filteredLocations = allLocations.filter(location => {
    // Only show approved locations in search results
    // Pending locations should only be visible in the listings page
    if (location.status !== "approved") {
      console.log(`Location ${location.id} "${location.title}" filtered out due to status: ${location.status}`);
      return false;
    }
    
    // Category/Type filter - match against propertyType field
    if (selectedCategory) {
      // Find the selected category from our filters
      const selectedFilter = categories.find(cat => cat.id === selectedCategory);
      if (selectedFilter) {
        // Match against the propertyType field which contains the subcategory
        // The propertyType is stored as "MainCategory - SubCategory" format
        const expectedPropertyType = `${selectedFilter.mainCategory} - ${selectedFilter.subCategory}`;
        
        // Check if location.propertyType matches either the full format or just the subcategory
        if (location.propertyType !== expectedPropertyType && 
            location.propertyType !== selectedFilter.subCategory) {
          return false;
        }
      }
    }

    // Price filter
    if (location.price < activeFilters.priceRange[0] || location.price > activeFilters.priceRange[1]) {
      return false;
    }

    // Capacity filter
    if (activeFilters.capacity && location.maxCapacity < activeFilters.capacity) {
      return false;
    }
    
    // Minimum Hours filter
    if (activeFilters.minHours && location.minHours < activeFilters.minHours) {
      return false;
    }

    // Activity filter - Check if location supports the selected activity type
    // Only filter by activity if one is specifically selected
    if (activeFilters.activity) {
      const activityName = activeFilters.activity.toLowerCase();
      
      // Map common activity search terms to activity pricing keys
      const activityKey = activityName.includes('photo') ? 'photo' :
                         activityName.includes('video') || activityName.includes('film') ? 'video' :
                         activityName.includes('event') ? 'event' :
                         activityName.includes('meeting') ? 'meeting' :
                         activityName.includes('production') ? 'video' :
                         activityName;
      
      // Check if location has activity pricing configured for this activity type
      const hasActivitySupport = location.activityPricing && 
        typeof location.activityPricing === 'object' &&
        location.activityPricing[activityKey] !== undefined &&
        location.activityPricing[activityKey] > 0;
      
      // Only filter out if activity is selected AND location doesn't support it
      if (!hasActivitySupport) {
        console.log(`Location ${location.id} filtered out - no support for activity: ${activityKey}`);
        return false;
      }
    }
    // If no activity filter is selected, show all locations regardless of activity pricing

    // City filter
    if (activeFilters.city && location.address) {
      // Extract city from address
      const cityFromAddress = extractCityNameFromAddress(location.address);
      if (!cityFromAddress.toLowerCase().includes(activeFilters.city.toLowerCase())) {
        return false;
      }
    }

    // Location filter - search in full address
    if (activeFilters.location && activeFilters.location.trim() !== '' && location.address) {
      const locationQuery = activeFilters.location.toLowerCase().trim();
      const address = location.address.toLowerCase();
      if (!address.includes(locationQuery)) {
        return false;
      }
    }

    // Amenities filter
    if (activeFilters.amenities.length > 0) {
      const locationAmenities = location.amenities || [];
      if (!activeFilters.amenities.every(amenity => locationAmenities.includes(amenity))) {
        return false;
      }
    }

    // House Styles filter (multiple selection)
    if (activeFilters.houseStyles && activeFilters.houseStyles.length > 0) {
      const locationHouseStyle = location.houseStyle;
      if (!locationHouseStyle || !activeFilters.houseStyles.includes(locationHouseStyle)) {
        return false;
      }
    }

    // Property Features filter
    if (activeFilters.propertyFeatures && activeFilters.propertyFeatures.length > 0) {
      const locationFeatures = location.propertyFeatures || [];
      if (!activeFilters.propertyFeatures.every(feature => locationFeatures.includes(feature))) {
        return false;
      }
    }



    // ZIP code filter - Removed as requested

    // Keywords filter - match title and description
    if (activeFilters.keywords && activeFilters.keywords.trim() !== '') {
      const keywords = activeFilters.keywords.toLowerCase().trim();
      const matchesTitle = location.title && location.title.toLowerCase().includes(keywords);
      const matchesDescription = location.description && location.description.toLowerCase().includes(keywords);
      
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Recently Added filter (within last 30 days)
    if (activeFilters.recentlyAdded) {
      // Use statusUpdatedAt since createdAt is not available in the location schema
      const dateField = location.statusUpdatedAt;
      
      if (dateField) {
        const createdDate = new Date(dateField);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (createdDate < thirtyDaysAgo) {
          return false;
        }
      }
    }

    // Instant Book filter
    if (activeFilters.instantBook) {
      if (!location.instantBooking) {
        return false;
      }
    }

    // Parking Features filter
    if (activeFilters.parkingFeatures && activeFilters.parkingFeatures.length > 0) {
      const locationParkingFeatures = location.accessibility_data?.parking || [];
      if (!activeFilters.parkingFeatures.every(feature => locationParkingFeatures.includes(feature))) {
        return false;
      }
    }

    // Access Features filter
    if (activeFilters.accessFeatures && activeFilters.accessFeatures.length > 0) {
      const locationAccessFeatures = location.accessibility_data?.access || [];
      if (!activeFilters.accessFeatures.every(feature => locationAccessFeatures.includes(feature))) {
        return false;
      }
    }

    return true;
  });

  // Log filtering results
  console.log(`=== LOCATION FILTERING RESULTS ===`);
  console.log(`Total locations from API: ${locations.length}`);
  console.log(`Locations after filtering: ${filteredLocations.length}`);
  console.log('Active filters:', {
    category: selectedCategory,
    activity: activeFilters.activity,
    city: activeFilters.city,
    location: activeFilters.location
  });
  
  // Sort locations first, then paginate
  const sortedLocations = sortLocations(filteredLocations, sortOption);
  
  // Calculate pagination
  const totalListings = sortedLocations.length;
  const totalPages = Math.ceil(totalListings / listingsPerPage);
  const startIndex = (currentPage - 1) * listingsPerPage;
  const endIndex = startIndex + listingsPerPage;
  const currentListings = sortedLocations.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, activeFilters, sortOption]);

  // Scroll to top of listings when page changes
  useEffect(() => {
    const listingsContainer = document.querySelector('.xl\\:overflow-y-auto');
    if (listingsContainer) {
      listingsContainer.scrollTop = 0;
    }
  }, [currentPage]);

  // Additional warning when all locations are filtered out
  if (locations.length > 0 && filteredLocations.length === 0) {
    console.log('WARNING: All locations were filtered out!');
    console.log('First location details:', locations[0]);
  }

  if (isLoading) {
    return (
      <SearchResultsLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        </div>
      </SearchResultsLayout>
    );
  }

  return (
    <SearchResultsLayout>
      <div className="h-full overflow-hidden bg-background flex flex-col">
        {/* Category filters - horizontal scrollable with arrow controls */}
        <div className="z-40 py-4 border-b bg-white w-full relative overflow-hidden flex-shrink-0">
          {/* Category scrollable container with strict overflow control */}
          <div className="max-w-[1600px] mx-auto relative px-8 md:px-10">
            {/* Solid mask for right side - ensures complete hiding of content */}
            <div className="absolute right-0 top-0 bottom-0 w-[170px] z-20 pointer-events-none bg-white"></div>
            {/* Gradient mask for smooth transition on right side */}
            <div className="absolute right-[170px] top-0 bottom-0 w-[80px] z-20 pointer-events-none bg-gradient-to-r from-transparent to-white"></div>
            {/* Solid mask for left side - ensures complete hiding of content */}
            <div className="absolute left-0 top-0 bottom-0 w-[35px] z-20 pointer-events-none bg-white"></div>
            {/* Gradient mask for smooth transition on left side */}
            <div className="absolute left-[35px] top-0 bottom-0 w-[30px] z-20 pointer-events-none bg-gradient-to-l from-transparent to-white"></div>
            {/* Left scroll arrow with additional white circular background for better masking */}
            <div className="absolute left-2 top-[45%] -translate-y-1/2 z-50 transition-opacity duration-200 opacity-100">
              <button 
                className="flex items-center justify-center h-10 w-10 bg-white rounded-full shadow-lg border border-gray-300 hover:shadow-xl transition-shadow before:absolute before:inset-0 before:rounded-full before:bg-white before:-z-10 before:scale-110"
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Right scroll arrow with additional white circular background for better masking */}
            <div className="absolute right-[160px] top-[45%] -translate-y-1/2 z-50 transition-opacity duration-200 opacity-100">
              <button 
                className="flex items-center justify-center h-10 w-10 bg-white rounded-full shadow-lg border border-gray-300 hover:shadow-xl transition-shadow before:absolute before:inset-0 before:rounded-full before:bg-white before:-z-10 before:scale-110"
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Category items container with padding to prevent overlap with arrows and filter */}
            <div 
              id="categories-container" 
              className="flex items-center gap-6 overflow-x-auto flex-nowrap scrollbar-hide pb-1 pr-[180px] pl-[40px]"
            >
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer flex-shrink-0 transition-colors
                  ${selectedCategory ? 'bg-white border border-gray-300 hover:border-gray-400 text-gray-900' : 'bg-gray-900 text-white'}`}
                onClick={() => setSelectedCategory(undefined)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 8.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 8.5C20 12.5 16.5 12.5 12 12.5C7.5 12.5 4 12.5 4 8.5C4 4.5 7.5 2 12 2C16.5 2 20 4.5 20 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium whitespace-nowrap">All Spaces</span>
              </button>

              {categories.map((category) => (
                <button 
                  key={category.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer flex-shrink-0 transition-colors
                    ${selectedCategory === category.id 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white border border-gray-300 hover:border-gray-400 text-gray-900'
                    }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <span className="text-current">{<category.icon />}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                </button>
              ))}
            </div>
            
            {/* Filters button with white background for additional masking */}
            <div className="absolute right-10 top-[45%] -translate-y-1/2 z-30 ml-6 pl-6 before:absolute before:inset-0 before:-left-10 before:-right-6 before:bg-white before:-z-10">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 rounded-full h-auto bg-white border border-gray-300 hover:border-gray-400"
                onClick={() => setShowFilters(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.52 4.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12.5H8.52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.48 21V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.48 12.5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium">Filters</span>
              </Button>
            </div>
          </div>
        </div>

        <FilterDialog
          open={showFilters}
          onOpenChange={setShowFilters}
          initialFilters={activeFilters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 gap-6 p-6 xl:pt-4 overflow-hidden">
          {/* Locations Grid - 3 column layout with scrollable content */}
          <div className="col-span-1 xl:col-span-3 lg:col-span-2 xl:border-r pr-0 xl:pr-4 h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {/* Active filters display */}
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.activity && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>Activity: {activeFilters.activity.replace(/-/g, ' ')}</span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, activity: undefined }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              {activeFilters.city && (!activeFilters.location || activeFilters.location.trim() === '') && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>City: {activeFilters.city.replace(/-/g, ' ')}</span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, city: undefined }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>Type: {selectedCategory.replace(/-/g, ' ')}</span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(undefined);
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              {activeFilters.minHours && activeFilters.minHours > 1 && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>Min. Hours: {activeFilters.minHours}</span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, minHours: 1 }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              {activeFilters.location && activeFilters.location.trim() !== '' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>
                    Location: {activeFilters.location.length > 12 
                      ? `${activeFilters.location.substring(0, 12)}...` 
                      : activeFilters.location}
                  </span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, location: '' }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Distance and zip code filter chips removed */}
              {activeFilters.keywords && activeFilters.keywords.trim() !== '' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>
                    Keywords: {activeFilters.keywords.length > 12 
                      ? `${activeFilters.keywords.substring(0, 12)}...` 
                      : activeFilters.keywords}
                  </span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, keywords: '' }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              {activeFilters.recentlyAdded && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
                  <span>Recently Added</span>
                  <button 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilters(prev => ({ ...prev, recentlyAdded: false }));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-medium">
                Showing {startIndex + 1}-{Math.min(endIndex, totalListings)} of {totalListings} locations near {locationDisplayName}
              </h2>
              
              {/* Sort dropdown */}
              <div className="w-full sm:w-auto">
                <Select 
                  value={sortOption} 
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid layout with 3 columns for cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
              {currentListings.map((location, index) => (
                <LocationCard 
                  key={location.id} 
                  location={{
                    ...location,
                    featured: index % 3 === 0 // Add SUPERHOST badge to every third item
                  } as any} 
                  horizontalLayout={false} // Use vertical layout for grid view
                />
              ))}
              {filteredLocations.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No locations found with the selected filters.
                </div>
              )}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        className="w-10 h-10 rounded-full p-0"
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
                    </>
                  )}
                  
                  {/* Show pages around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return false;
                      return Math.abs(page - currentPage) <= 2;
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 rounded-full p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  
                  {/* Show last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-full p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            )}
          </div>

          {/* Map - takes 2 columns on desktop */}
          <div className="hidden xl:block xl:col-span-2 lg:col-span-1 h-full">
            <div className="rounded-xl overflow-hidden h-full w-full">
              <MapView 
                locations={sortedLocations} 
                className="w-full h-full" 
                center={mapCenter}
                zoom={12}
              />
            </div>
          </div>
        </div>
      </div>
    </SearchResultsLayout>
  );
}