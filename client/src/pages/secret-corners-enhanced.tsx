import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, MapPin, Camera, Map as MapIcon, List, Clock, X } from "lucide-react";
import { MapContainer, TileLayer, Popup } from "react-leaflet";
import { EnhancedMarker } from "@/components/map/enhanced-marker";
import { LatLngExpression, Icon as LeafletIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LocationCarousel } from "@/components/secret-corners/location-carousel";

// Fix for Leaflet icons at runtime
function useFixLeafletIcons() {
  useEffect(() => {
    // Import Leaflet dynamically within the component
    import('leaflet').then(L => {
      // Delete the _getIconUrl method from Icon.Default.prototype
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      // Merge options to set proper icon URLs
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, []);
}

// Location type definition
type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords?: [number, number];
  latitude?: number | string;
  longitude?: number | string;
  comments?: number;
  images?: string[];
  image?: string;
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  userId?: number;
  userName?: string;
};

// Categories for filtering
const CATEGORIES = [
  { id: "abandoned", name: "Abandoned" },
  { id: "urban", name: "Urban" },
  { id: "natural", name: "Natural" },
  { id: "beach", name: "Beach" },
  { id: "forest", name: "Forest" },
  { id: "desert", name: "Desert" },
  { id: "street-art", name: "Street Art" },
  { id: "sunset", name: "Sunset" },
  { id: "historic", name: "Historic" }
];

// Location Card Component
function LocationCard({ location }: { location: SecretLocation }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {location.image ? (
          <img 
            src={location.image} 
            alt={location.name} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Camera className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="mb-2 bg-primary/80 hover:bg-primary">{location.category}</Badge>
          <h3 className="text-lg font-semibold text-white">{location.name}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="truncate">{location.location}</span>
          </div>
          {location.bestTimeOfDay && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>{location.bestTimeOfDay}</span>
            </div>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {location.description}
        </p>
      </CardContent>
    </Card>
  );
}

// Location Popup Component
function LocationPopup({ location }: { location: SecretLocation }) {
  return (
    <div className="max-w-[250px]">
      <div className="mb-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
        {location.image ? (
          <img src={location.image} alt={location.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="mb-1 font-semibold">{location.name}</h3>
      <div className="mb-2 flex items-center text-xs text-muted-foreground">
        <MapPin className="mr-1 h-3 w-3" />
        <span className="truncate">{location.location}</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground line-clamp-3">
        {location.description}
      </p>
      {location.bestTimeOfDay && (
        <div className="flex items-center text-xs">
          <span className="font-medium">Best time:</span>
          <span className="ml-1 text-muted-foreground">{location.bestTimeOfDay}</span>
        </div>
      )}
      <Badge className="mt-2" variant="outline">{location.category}</Badge>
    </div>
  );
}

export default function SecretCornersEnhanced() {
  // Fix Leaflet icons
  useFixLeafletIcons();
  
  // Auth and navigation
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // UI state
  const [view, setView] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedLocation, setSelectedLocation] = useState<SecretLocation | null>(null);
  const [showLocationDetailsModal, setShowLocationDetailsModal] = useState(false);
  
  // Fetch locations
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations,
    error: locationsError
  } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        return await response.json();
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load locations. Please try again later.',
          variant: 'destructive'
        });
        return [];
      }
    }
  });
  
  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((location: SecretLocation) => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      // Filter by category
      const matchesCategory = !activeCategory || location.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, activeCategory]);
  
  // Calculate map center
  const mapCenter: LatLngExpression = useMemo(() => {
    // If we have locations with coordinates, calculate center
    if (filteredLocations.length > 0) {
      const locationWithCoords = filteredLocations.find((loc: SecretLocation) => 
        loc.coords && Array.isArray(loc.coords) && loc.coords.length === 2);
        
      if (locationWithCoords?.coords) {
        return locationWithCoords.coords;
      }
      
      // Try to find a location with lat/lng
      const locationWithLatLng = filteredLocations.find((loc: SecretLocation) => 
        loc.latitude !== undefined && loc.longitude !== undefined);
        
      if (locationWithLatLng?.latitude && locationWithLatLng?.longitude) {
        const lat = typeof locationWithLatLng.latitude === 'string' 
          ? parseFloat(locationWithLatLng.latitude) 
          : locationWithLatLng.latitude;
          
        const lng = typeof locationWithLatLng.longitude === 'string' 
          ? parseFloat(locationWithLatLng.longitude) 
          : locationWithLatLng.longitude;
          
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
    }
    
    // Default to Paris if no locations with coordinates
    return [48.8566, 2.3522];
  }, [filteredLocations]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
  };
  
  // Check if we have any locations to show
  const isCurrentTabLoading = isLoadingLocations;
  const isCurrentTabEmpty = filteredLocations.length === 0;
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Secret Corners</h1>
            <p className="mt-1 text-muted-foreground">
              Discover hidden photography spots from around the world
            </p>
          </div>
          <div className="mt-4 flex space-x-2 md:mt-0">
            <Button onClick={() => setView("list")} size="sm" variant={view === "list" ? "default" : "outline"}>
              <List className="mr-1 h-4 w-4" />
              List
            </Button>
            <Button onClick={() => setView("map")} size="sm" variant={view === "map" ? "default" : "outline"}>
              <MapIcon className="mr-1 h-4 w-4" />
              Map
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => setActiveCategory(
                    activeCategory === category.id ? null : category.id
                  )}
                >
                  {category.name}
                </Badge>
              ))}
              {(searchQuery || activeCategory) && (
                <Button size="sm" variant="ghost" onClick={resetFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs for content filtering */}
        <Tabs defaultValue="featured" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="all">All Locations</TabsTrigger>
          </TabsList>
          
          {/* Featured Locations Tab */}
          <TabsContent value="featured" className="mt-0">
            {view === "map" ? (
              <div className="aspect-[16/9] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {!isCurrentTabLoading && filteredLocations.length > 0 ? (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredLocations.map((location) => (
                      <EnhancedMarker 
                        key={location.id}
                        location={location}
                      >
                        <Popup>
                          <LocationPopup location={location} />
                        </Popup>
                      </EnhancedMarker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {isCurrentTabLoading ? (
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground">Loading featured locations...</p>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                          <MapIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Featured Locations Found</h3>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find any featured locations matching your search criteria.
                        </p>
                        <Button onClick={resetFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {isCurrentTabLoading ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading featured locations...</p>
                  </div>
                ) : filteredLocations.length > 0 ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredLocations.map((location) => (
                        <LocationCard key={location.id} location={location} />
                      ))}
                    </div>
                    
                    {locations.length > 0 && (
                      <div className="mt-8">
                        <LocationCarousel 
                          title="Trending Secret Corners"
                          locations={locations.slice(0, 10)} 
                          onLocationSelect={(location) => {
                            setSelectedLocation(location);
                            setShowLocationDetailsModal(true);
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Featured Locations Found</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find any featured locations matching your search criteria.
                    </p>
                    <Button onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* All Locations Tab */}
          <TabsContent value="all" className="mt-0">
            {view === "map" ? (
              <div className="aspect-[16/9] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {!isCurrentTabLoading && filteredLocations.length > 0 ? (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredLocations.map((location) => (
                      <EnhancedMarker 
                        key={location.id}
                        location={location}
                      >
                        <Popup>
                          <LocationPopup location={location} />
                        </Popup>
                      </EnhancedMarker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {isCurrentTabLoading ? (
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground">Loading locations...</p>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                          <MapIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Locations Found</h3>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find any locations matching your search criteria.
                        </p>
                        <Button onClick={resetFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {isCurrentTabLoading ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading locations...</p>
                  </div>
                ) : filteredLocations.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredLocations.map((location) => (
                      <LocationCard key={location.id} location={location} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Locations Found</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find any locations matching your search criteria.
                    </p>
                    <Button onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}