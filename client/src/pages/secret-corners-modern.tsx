import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, MapPin, Camera, Map as MapIcon, Grid3x3, 
  Heart, MessageSquare, Share2, Navigation, Star, 
  TrendingUp, Award, Users, Clock, Filter, X,
  ChevronLeft, ChevronRight, Loader2, Sun, Moon, Trophy,
  User, DollarSign, CheckCircle, XCircle, Home
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AddressAutocompleteSimple } from "@/components/address/address-autocomplete-simple";
import { ModernForum } from "@/components/forum/modern-forum";
import { config } from '../config/env';

// Types
interface SecretLocation {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords?: [number, number]; // Backend format
  coordinates?: { lat: number; lng: number }; // Frontend format
  images: string[];
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
  likes?: number;
  comments?: number;
  rating?: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: number;
  winningLocationId?: number;
  createdAt: string;
  entriesCount: number;
}

// Categories with icons and colors - merged original and new categories
const CATEGORIES = [
  { id: "all", name: "All Places", icon: Grid3x3, color: "bg-gray-500" },
  // Original categories
  { id: "abandoned", name: "Abandoned", icon: Camera, color: "bg-stone-700" },
  { id: "urban", name: "Urban", icon: MapPin, color: "bg-zinc-600" },
  { id: "natural", name: "Natural", icon: Navigation, color: "bg-green-600" },
  { id: "beach", name: "Beach", icon: MapPin, color: "bg-blue-500" },
  { id: "forest", name: "Forest", icon: MapPin, color: "bg-emerald-600" },
  { id: "street-art", name: "Street Art", icon: Camera, color: "bg-purple-600" },
  { id: "sunset", name: "Sunset", icon: Camera, color: "bg-orange-500" },
  { id: "historic", name: "Historic", icon: Clock, color: "bg-amber-700" },
  // New categories
  { id: "mountain", name: "Mountain", icon: MapPin, color: "bg-stone-600" },
  { id: "desert", name: "Desert", icon: MapPin, color: "bg-orange-600" },
  { id: "waterfall", name: "Waterfall / River", icon: MapPin, color: "bg-blue-600" },
  { id: "landmark", name: "Landmark", icon: Camera, color: "bg-purple-700" },
  { id: "rooftop", name: "Rooftop", icon: MapPin, color: "bg-zinc-700" },
  { id: "underground", name: "Underground", icon: MapPin, color: "bg-gray-700" },
  { id: "garden", name: "Garden", icon: MapPin, color: "bg-green-500" },
  { id: "industrial", name: "Industrial", icon: Camera, color: "bg-amber-600" },
  { id: "night_lights", name: "Night Lights", icon: Star, color: "bg-indigo-600" },
  { id: "winter", name: "Winter", icon: MapPin, color: "bg-cyan-500" }
];

// Custom map styles for dark theme
const darkMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a1a" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1a1a1a" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#2a2a2a" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0e1117" }]
  }
];

// Custom map styles for light theme
const lightMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  }
];

export default function SecretCornersModern() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [view, setView] = useState<"map" | "grid">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SecretLocation | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  // New location form state
  const [newLocation, setNewLocation] = useState({
    name: "",
    category: "",
    address: "",
    coordinates: { lat: 0, lng: 0 },
    description: "",
    images: [] as File[],
    bestTimeOfDay: "",
    recommendedEquipment: "",
    compositionTip: ""
  });

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/secret-corners');
    }
  }, [user, navigate]);

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York
        zoom: 12,
        styles: isDarkTheme ? darkMapStyles : lightMapStyles,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
      });

      setMap(mapInstance);
      setIsMapLoaded(true);
    };

    if (view === "map") {
      loadGoogleMaps();
    }

    return () => {
      // Clean up markers when component unmounts
      markers.forEach(marker => marker.setMap(null));
    };
  }, [view]);

  // Update map styles when theme changes
  useEffect(() => {
    if (map) {
      map.setOptions({
        styles: isDarkTheme ? darkMapStyles : lightMapStyles
      });
    }
  }, [isDarkTheme, map]);

  // Fetch locations from API
  const { data: featuredLocations = [], isLoading: isLoadingFeatured } = useQuery<SecretLocation[]>({
    queryKey: ['/api/secret-locations/featured'],
    enabled: !!user,
  });

  const { data: userLocations = [], isLoading: isLoadingUser } = useQuery<SecretLocation[]>({
    queryKey: ['/api/secret-locations/user/mine'],
    enabled: !!user,
  });

  // Fetch challenges from API
  const { data: challengesData = [] } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    enabled: !!user,
  });

  // Fetch featured location of the month
  const { data: featuredOfMonth, isLoading: isLoadingFeaturedOfMonth } = useQuery<SecretLocation>({
    queryKey: ['/api/secret-locations/featured-of-month'],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Update markers when locations change
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    filteredLocations.forEach((location) => {
      // Convert coords array to position object
      let position: google.maps.LatLngLiteral;
      if (location.coords) {
        position = { lat: location.coords[0], lng: location.coords[1] };
      } else if (location.coordinates) {
        position = { lat: location.coordinates.lat, lng: location.coordinates.lng };
      } else {
        return; // Skip if no coordinates
      }
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: CATEGORIES.find(c => c.id === location.category)?.color.replace('bg-', '#') || '#6366f1',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        // Ensure location has coordinates in the expected format
        const locationWithCoordinates = {
          ...location,
          coordinates: location.coordinates || (location.coords ? { lat: location.coords[0], lng: location.coords[1] } : undefined)
        };
        setSelectedLocation(locationWithCoordinates);
        setShowLocationDetails(true);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, isMapLoaded, featuredLocations, userLocations, activeCategory, searchQuery]);

  // Submit new location
  const submitLocationMutation = useMutation({
    mutationFn: async (data: typeof newLocation) => {
      // Convert images to base64 data URLs
      const imagesAsDataUrls = await Promise.all(
        data.images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // Prepare data for submission matching the backend schema
      const submitData = {
        name: data.name,
        description: data.description,
        location: data.address,
        category: data.category,
        coords: [data.coordinates.lat, data.coordinates.lng], // Array format for backend
        images: imagesAsDataUrls,
        bestTimeOfDay: data.bestTimeOfDay,
        recommendedEquipment: data.recommendedEquipment,
        compositionTip: data.compositionTip,
        status: 'pending'
      };

      const response = await fetch('/api/secret-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error('Failed to submit location');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location Submitted",
        description: "Your secret location has been submitted for review.",
      });
      setShowAddLocationModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/secret-locations'] });
      // Reset form
      setNewLocation({
        name: "",
        category: "",
        address: "",
        coordinates: { lat: 0, lng: 0 },
        description: "",
        images: [],
        bestTimeOfDay: "",
        recommendedEquipment: "",
        compositionTip: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setNewLocation(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setNewLocation(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Combine all locations
  const allLocations = [...featuredLocations, ...userLocations];
  
  // Filter locations based on category and search
  const filteredLocations = allLocations.filter(location => {
    if (activeCategory !== "all" && location.category !== activeCategory) return false;
    if (searchQuery && !location.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !location.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Debug: Log state when view changes
  useEffect(() => {
    console.log('Current view:', view);
    console.log('Featured locations:', featuredLocations);
    console.log('User locations:', userLocations);
    console.log('All locations:', allLocations);
    console.log('Filtered locations count:', filteredLocations.length);
    console.log('Filtered locations:', filteredLocations);
    console.log('Loading states:', { isLoadingFeatured, isLoadingUser });
    console.log('Active category:', activeCategory);
    console.log('Search query:', searchQuery);
  }, [view, filteredLocations.length, isLoadingFeatured, isLoadingUser]);

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Logo and Back to Homepage Button */}
      <div className={`${isDarkTheme ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkTheme ? 'border-gray-700/50' : 'border-gray-200'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Blocmark Logo */}
            <img 
              src="/blocmark-logo.png" 
              alt="Blocmark" 
              className={`h-5 w-auto cursor-pointer ${isDarkTheme ? '' : 'brightness-0'}`}
              onClick={() => navigate("/")}
            />
            
            {/* Back to Homepage Button */}
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className={`${isDarkTheme ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Homepage
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className={`border-b ${isDarkTheme ? 'border-gray-700/50 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Secret Corners</h1>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Discover hidden photography gems</p>
            </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 w-64 ${isDarkTheme ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
                  />
                </div>

                {/* View Toggle */}
                <div className={`flex rounded-lg p-1 ${isDarkTheme ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                  <Button
                    variant={view === "map" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("map")}
                    className={`${view === "map" 
                      ? isDarkTheme ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      : isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <MapIcon className="h-4 w-4 mr-2" />
                    Map
                  </Button>
                  <Button
                    variant={view === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("grid")}
                    className={`${view === "grid" 
                      ? isDarkTheme ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      : isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                </div>

                {/* Profile Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className={`${isDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                >
                  <User className="h-4 w-4" />
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className={`${isDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                >
                  {isDarkTheme ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-600" />
                  )}
                </Button>

                {/* Add Location */}
                <Button
                  onClick={() => setShowAddLocationModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </div>

            {/* Categories with horizontal scroll */}
            <div className="w-full mt-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 whitespace-nowrap ${
                        activeCategory === category.id 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white' 
                          : isDarkTheme 
                            ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {view === "map" ? (
            <div className="relative h-[calc(100vh-180px)]">
              <div ref={mapRef} className="w-full h-full" />
              
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              )}


            </div>
          ) : (
            <div className={`min-h-[calc(100vh-180px)] ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="container mx-auto px-4 py-8">
                {/* Loading state */}
                {(isLoadingFeatured || isLoadingUser) && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                )}
              
              {/* Empty state */}
              {!isLoadingFeatured && !isLoadingUser && filteredLocations.length === 0 && (
                <Card className={`p-12 text-center ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <MapPin className={`h-16 w-16 mx-auto mb-4 ${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    No locations found
                  </h3>
                  <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {searchQuery 
                      ? `No locations match "${searchQuery}"` 
                      : activeCategory !== "all" 
                        ? `No locations in ${CATEGORIES.find(c => c.id === activeCategory)?.name || activeCategory} category`
                        : "No locations have been added yet"}
                  </p>
                  <Button
                    onClick={() => setShowAddLocationModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Location
                  </Button>
                </Card>
              )}
              
              {/* Grid of locations */}
              {!isLoadingFeatured && !isLoadingUser && filteredLocations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {filteredLocations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`overflow-hidden transition-all cursor-pointer group ${
                          isDarkTheme 
                            ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50' 
                            : 'bg-white border-gray-200 hover:border-purple-400 shadow-sm'
                        }`}
                        onClick={() => {
                          setSelectedLocation(location);
                          setShowLocationDetails(true);
                        }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={location.images[0] || '/api/placeholder/400/300'}
                            alt={location.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${
                          isDarkTheme ? 'from-gray-900' : 'from-gray-800/80'
                        } to-transparent`} />
                          <Badge 
                            className="absolute top-2 right-2"
                            style={{
                              backgroundColor: CATEGORIES.find(c => c.id === location.category)?.color.replace('bg-', '') || '#6366f1'
                            }}
                          >
                            {CATEGORIES.find(c => c.id === location.category)?.name}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className={`text-lg font-semibold mb-1 ${
                            isDarkTheme ? 'text-white' : 'text-gray-900'
                          }`}>{location.name}</h3>
                          <p className={`text-sm mb-3 line-clamp-2 ${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                          }`}>{location.description}</p>
                          
                          <div className={`flex items-center justify-between text-sm ${
                            isDarkTheme ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {location.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {location.comments || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {location.rating || 4.5}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              )}
              </div>
            </div>
          )}
        </div>

        {/* Community Sections - Only show in map view */}
        {view === "map" && (
          <>
            {/* Forum Section */}
            <div className={`${isDarkTheme ? 'bg-gray-900/50' : 'bg-gray-50'} py-12`}>
              <ModernForum />
            </div>

        {/* Location of the Month */}
        <div className={`py-12 ${isDarkTheme ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20' : 'bg-gradient-to-r from-purple-50 to-blue-50'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  Location of the Month
                </h2>
                <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Voted by our community
                </p>
              </div>
              <Award className={`h-12 w-12 ${isDarkTheme ? 'text-yellow-500' : 'text-yellow-600'}`} />
            </div>
            
            <Card className={`overflow-hidden ${isDarkTheme ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-96">
                  <img 
                    src="/api/placeholder/600/400" 
                    alt="Location of the month"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                    <Trophy className="h-4 w-4 mr-1" />
                    Winner
                  </Badge>
                </div>
                <div className="p-8">
                  {isLoadingFeaturedOfMonth ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : featuredOfMonth ? (
                    <>
                      <h3 className={`text-2xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {featuredOfMonth.name}
                      </h3>
                      <p className={`mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        {featuredOfMonth.description}
                      </p>
                      <div className="space-y-3">
                        {featuredOfMonth.bestTimeOfDay && (
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                              Best time: {featuredOfMonth.bestTimeOfDay}
                            </span>
                          </div>
                        )}
                        {featuredOfMonth.recommendedEquipment && (
                          <div className="flex items-center gap-2">
                            <Camera className={`h-4 w-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                              {featuredOfMonth.recommendedEquipment}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className={`h-4 w-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            {featuredOfMonth.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <Avatar>
                          <AvatarFallback className="bg-purple-600 text-white">
                            {(featuredOfMonth.userName || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            Submitted by {featuredOfMonth.userName || 'Anonymous'}
                          </p>
                          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                            Community Contributor
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={`text-center py-8 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>No featured location selected yet</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Photography Challenges */}
        <div className={`py-12 ${isDarkTheme ? 'bg-gray-900/50' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Photography Challenges
              </h2>
              <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                Test your skills and win prizes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {challengesData && challengesData.length > 0 ? challengesData.map((challenge, index) => {
                const endDate = new Date(challenge.endDate);
                const now = new Date();
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                const colors = [
                  "from-orange-500 to-yellow-500",
                  "from-blue-500 to-cyan-500",
                  "from-purple-500 to-pink-500"
                ];
                const prizes = ["$500 Prize", "Featured Gallery", "Pro Equipment"];
                
                return (
                  <Card 
                    key={challenge.id}
                    className={`overflow-hidden ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
                  >
                    <div className={`h-2 bg-gradient-to-r ${colors[index % colors.length]}`} />
                    <CardContent className="p-6">
                      <h3 className={`font-bold text-lg mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.title}
                      </h3>
                      <Badge variant="secondary" className="mb-3">
                        {prizes[index % prizes.length]}
                      </Badge>
                      <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                      <div className={`space-y-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysLeft} days left
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {challenge.entriesCount} joined
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        Join Challenge
                      </Button>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className={`col-span-3 text-center py-8 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>No active challenges at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Most Popular Locations */}
        <div className={`py-12 ${isDarkTheme ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  Most Popular Locations
                </h2>
                <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trending this week
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${isDarkTheme ? 'text-purple-500' : 'text-purple-600'}`} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredLocations.slice(0, 8).map((location, index) => (
                <Card 
                  key={location.id}
                  className={`group cursor-pointer transition-all hover:scale-105 ${
                    isDarkTheme ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedLocation(location);
                    setShowLocationDetails(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${isDarkTheme ? 'text-purple-400' : 'text-purple-600'}`}>
                          #{index + 1}
                        </div>
                      </div>
                      <Badge variant={isDarkTheme ? "secondary" : "outline"} className="text-xs">
                        {CATEGORIES.find(c => c.id === location.category)?.name}
                      </Badge>
                    </div>
                    <h3 className={`font-semibold mb-2 line-clamp-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {location.name}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {location.description}
                    </p>
                    <div className={`flex items-center justify-between text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {location.likes || Math.floor(Math.random() * 100) + 50}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {location.rating || (4.5 + Math.random() * 0.5).toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Top Contributors Section */}
        <div className={`py-12 ${isDarkTheme ? 'bg-gray-900/50' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Top Contributors
              </h2>
              <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                Our most active community members
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Alex Chen", locations: 42, avatar: "AC", rank: 1 },
                { name: "Sarah Johnson", locations: 38, avatar: "SJ", rank: 2 },
                { name: "Mike Williams", locations: 35, avatar: "MW", rank: 3 },
                { name: "Emma Davis", locations: 31, avatar: "ED", rank: 4 },
                { name: "Tom Brown", locations: 28, avatar: "TB", rank: 5 },
                { name: "Lisa Garcia", locations: 24, avatar: "LG", rank: 6 }
              ].map((contributor) => (
                <Card 
                  key={contributor.name}
                  className={`text-center p-4 ${
                    isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } ${contributor.rank <= 3 ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className="relative inline-block mb-3">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={`${
                        contributor.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        contributor.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        contributor.rank === 3 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                        'bg-purple-600'
                      } text-white font-bold`}>
                        {contributor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {contributor.rank <= 3 && (
                      <div className="absolute -top-2 -right-2">
                        <Trophy className={`h-5 w-5 ${
                          contributor.rank === 1 ? 'text-yellow-500' :
                          contributor.rank === 2 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      </div>
                    )}
                  </div>
                  <h4 className={`font-semibold text-sm mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    {contributor.name}
                  </h4>
                  <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {contributor.locations} locations
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className={`py-12 ${isDarkTheme ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {[
                  { user: "Alex Chen", action: "added a new location", location: "Manhattan Bridge Viewpoint", time: "2 hours ago", icon: Plus },
                  { user: "Sarah Johnson", action: "liked", location: "Brooklyn Heights Promenade", time: "4 hours ago", icon: Heart },
                  { user: "Mike Williams", action: "commented on", location: "DUMBO Waterfront", time: "6 hours ago", icon: MessageSquare },
                  { user: "Emma Davis", action: "shared", location: "Central Park Bow Bridge", time: "8 hours ago", icon: Share2 }
                ].map((activity, index) => (
                  <Card 
                    key={index}
                    className={`p-4 ${isDarkTheme ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-purple-600 text-white">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                          <span className="font-semibold">{activity.user}</span>
                          <span className={`mx-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activity.action}
                          </span>
                          <span className="font-medium text-purple-500">{activity.location}</span>
                        </p>
                        <p className={`text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.time}
                        </p>
                      </div>
                      <activity.icon className={`h-5 w-5 ${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className={`w-full mt-6 ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}
              >
                Load More Activity
              </Button>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className={`py-16 ${
          isDarkTheme 
            ? 'bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30' 
            : 'bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100'
        }`}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className={`text-3xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Stay Updated
              </h2>
              <p className={`mb-8 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                Get weekly tips, new location announcements, and exclusive photography guides delivered to your inbox.
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className={`flex-1 ${
                    isDarkTheme 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Subscribe
                </Button>
              </div>
              <p className={`text-sm mt-4 ${isDarkTheme ? 'text-gray-500' : 'text-gray-600'}`}>
                Join 5,000+ photographers in our community
              </p>
            </div>
          </div>
        </div>
        </>
      )}

        {/* Profile Modal */}
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${
            isDarkTheme 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200'
          }`}>
            <DialogHeader>
              <DialogTitle className={`text-2xl ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                My Secret Corners Profile
              </DialogTitle>
              <DialogDescription className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                Your contributions and earnings from the subscription pool
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Earnings Overview */}
              <Card className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      Monthly Pool Earnings
                    </h3>
                    <DollarSign className={`h-6 w-6 ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                      <p className={`text-2xl font-bold ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                        $247.50
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Last Month</p>
                      <p className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        $198.00
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Total Earned</p>
                      <p className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        $1,485.50
                      </p>
                    </div>
                  </div>
                  
                  <div className={`mt-4 p-3 rounded-lg ${isDarkTheme ? 'bg-gray-900/50' : 'bg-white'}`}>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">How it works:</span> Every approved location earns you a share 
                      of the monthly subscription pool. The more popular your locations, the higher your earnings!
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* My Locations */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  My Posted Locations ({userLocations.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userLocations.map((location) => (
                    <Card 
                      key={location.id}
                      className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            {location.name}
                          </h4>
                          <Badge 
                            variant={location.status === 'approved' ? 'default' : location.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {location.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {location.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {location.status}
                          </Badge>
                        </div>
                        
                        <p className={`text-sm mb-3 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                          {location.description}
                        </p>
                        
                        <div className={`flex items-center justify-between text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {location.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {location.comments || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {location.rating || 0}
                            </span>
                          </div>
                          {location.status === 'approved' && (
                            <span className={`text-xs ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                              +${((location.likes || 0) * 0.5 + (location.comments || 0) * 0.3).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {userLocations.length === 0 && (
                  <Card className={`${isDarkTheme ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <CardContent className="p-8 text-center">
                      <MapPin className={`h-12 w-12 mx-auto mb-3 ${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        You haven't posted any locations yet
                      </p>
                      <Button 
                        onClick={() => {
                          setShowProfile(false);
                          setShowAddLocationModal(true);
                        }}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Location
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Stats Summary */}
              <Card className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {userLocations.filter(l => l.status === 'approved').length}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Approved
                      </p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {userLocations.filter(l => l.status === 'pending').length}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pending
                      </p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {userLocations.reduce((sum, l) => sum + (l.likes || 0), 0)}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Likes
                      </p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        #{Math.floor(Math.random() * 50) + 1}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Rank
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Location Details Modal */}
        <Dialog open={showLocationDetails} onOpenChange={setShowLocationDetails}>
          <DialogContent className={`max-w-4xl ${
            isDarkTheme 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200'
          }`}>
            {selectedLocation ? (
              <>
                <DialogHeader>
                  <DialogTitle className={`text-2xl ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    {selectedLocation.name}
                  </DialogTitle>
                  <DialogDescription className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                    {selectedLocation.location}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    {/* Image Gallery */}
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <img
                        src={selectedLocation.images?.[0] || '/api/placeholder/600/400'}
                        alt={selectedLocation.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {selectedLocation.images && selectedLocation.images.length > 1 && (
                      <div className="flex gap-2 mt-2">
                        {selectedLocation.images.slice(1, 5).map((img, index) => (
                          <div key={index} className="w-20 h-20 rounded overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className={`mb-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedLocation.description}
                    </p>
                    
                    <div className="space-y-3">
                      {selectedLocation.bestTimeOfDay && (
                        <div>
                          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Best Time</p>
                          <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>{selectedLocation.bestTimeOfDay}</p>
                        </div>
                      )}
                      
                      {selectedLocation.recommendedEquipment && (
                        <div>
                          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Recommended Equipment</p>
                          <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>{selectedLocation.recommendedEquipment}</p>
                        </div>
                      )}
                      
                      {selectedLocation.compositionTip && (
                        <div>
                          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Composition Tip</p>
                          <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>{selectedLocation.compositionTip}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                      <Button variant="outline" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={() => {
                          // Navigate to location on map
                          if (map && selectedLocation) {
                            let center: google.maps.LatLngLiteral;
                            if (selectedLocation.coordinates) {
                              center = selectedLocation.coordinates;
                            } else if (selectedLocation.coords) {
                              center = { lat: selectedLocation.coords[0], lng: selectedLocation.coords[1] };
                            } else {
                              return;
                            }
                            map.setCenter(center);
                            map.setZoom(15);
                            setView("map");
                            setShowLocationDetails(false);
                          }
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Location Modal */}
        <Dialog open={showAddLocationModal} onOpenChange={setShowAddLocationModal}>
          <DialogContent className={`max-w-2xl ${isDarkTheme ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle>Add Secret Location</DialogTitle>
              <DialogDescription className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                Share a hidden photography gem with the community
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              submitLocationMutation.mutate(newLocation);
            }} className="space-y-4 mt-4">
              <div>
                <Label>Location Name *</Label>
                <Input
                  required
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  placeholder="e.g., Abandoned Train Station"
                />
              </div>
              
              <div>
                <Label>Category *</Label>
                <Select
                  required
                  value={newLocation.category}
                  onValueChange={(value) => setNewLocation(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className={isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}>
                    {CATEGORIES.filter(c => c.id !== "all").map((category) => (
                      <SelectItem key={category.id} value={category.id} className={isDarkTheme ? 'text-white' : 'text-gray-900'}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Address *</Label>
                <AddressAutocompleteSimple
                  value={newLocation.address}
                  onChange={(value, coords) => {
                    setNewLocation(prev => ({
                      ...prev,
                      address: value,
                      coordinates: coords || prev.coordinates
                    }));
                  }}
                  placeholder="Search for address..."
                  className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                />
              </div>
              
              <div>
                <Label>Description *</Label>
                <Textarea
                  required
                  value={newLocation.description}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  className={`${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} min-h-[100px]`}
                  placeholder="Describe what makes this location special..."
                />
              </div>
              
              <div>
                <Label>Best Time of Day</Label>
                <Input
                  value={newLocation.bestTimeOfDay}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, bestTimeOfDay: e.target.value }))}
                  className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  placeholder="e.g., Golden hour, Blue hour"
                />
              </div>
              
              <div>
                <Label>Recommended Equipment</Label>
                <Input
                  value={newLocation.recommendedEquipment}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, recommendedEquipment: e.target.value }))}
                  className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  placeholder="e.g., Wide-angle lens, Tripod"
                />
              </div>
              
              <div>
                <Label>Composition Tip</Label>
                <Textarea
                  value={newLocation.compositionTip}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, compositionTip: e.target.value }))}
                  className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  placeholder="Share a tip for getting the best shot..."
                />
              </div>
              
              <div>
                <Label>Images (Max 5)</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className={isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  />
                  
                  {newLocation.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {newLocation.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt=""
                            className="w-20 h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddLocationModal(false)}
                  className={isDarkTheme 
                    ? 'border-gray-500 !text-white bg-gray-700 hover:bg-gray-600 hover:border-gray-400' 
                    : 'border-gray-300 text-black hover:bg-gray-100'}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitLocationMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {submitLocationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Location'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}