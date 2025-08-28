import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Camera, Clock, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

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

// Categories for filtering - use translation function for names
const getCategoriesWithTranslations = (t: any) => [
  { id: "abandoned", name: t("secretCorners.abandoned") },
  { id: "urban", name: t("secretCorners.urban") },
  { id: "natural", name: t("secretCorners.natural") },
  { id: "beach", name: t("secretCorners.beach") },
  { id: "forest", name: t("secretCorners.forest") },
  { id: "desert", name: t("secretCorners.desert") },
  { id: "street-art", name: t("secretCorners.streetArt") },
  { id: "sunset", name: t("secretCorners.sunset") },
  { id: "historic", name: t("secretCorners.historic") }
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

export default function SecretCornersSimple() {
  // Translation hook
  const { t } = useTranslation();
  
  // Categories with translated names
  const CATEGORIES = getCategoriesWithTranslations(t);
  
  // Auth and navigation
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // UI state
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
          title: t('secretCorners.errorTitle'),
          description: t('secretCorners.errorMessage'),
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
            <h1 className="text-3xl font-bold tracking-tight">{t("secretCorners.title")}</h1>
            <p className="mt-1 text-muted-foreground">
              {t("secretCorners.subtitle")}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button size="sm" variant="outline" onClick={() => navigate('/secret-corners')}>
              Go to Map View
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("secretCorners.searchLocations")}
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
                  {t("secretCorners.clear")}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs for content filtering */}
        <Tabs defaultValue="featured" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="featured">{t("secretCorners.featured")}</TabsTrigger>
            <TabsTrigger value="all">All Locations</TabsTrigger>
          </TabsList>
          
          {/* Featured Locations Tab */}
          <TabsContent value="featured" className="mt-0">
            {isCurrentTabLoading ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                </div>
                <p className="text-muted-foreground">Loading featured locations...</p>
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLocations.map((location: SecretLocation) => (
                  <div 
                    key={location.id} 
                    onClick={() => {
                      setSelectedLocation(location);
                      setShowLocationDetailsModal(true);
                    }}
                    className="cursor-pointer"
                  >
                    <LocationCard location={location} />
                  </div>
                ))}
              </div>
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
          </TabsContent>
          
          {/* All Locations Tab */}
          <TabsContent value="all" className="mt-0">
            {isCurrentTabLoading ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                </div>
                <p className="text-muted-foreground">Loading all locations...</p>
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLocations.map((location: SecretLocation) => (
                  <div 
                    key={location.id} 
                    onClick={() => {
                      setSelectedLocation(location);
                      setShowLocationDetailsModal(true);
                    }}
                    className="cursor-pointer"
                  >
                    <LocationCard location={location} />
                  </div>
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
          </TabsContent>
        </Tabs>
        
        {/* Location Details Modal */}
        <Dialog open={showLocationDetailsModal} onOpenChange={setShowLocationDetailsModal}>
          <DialogContent className="sm:max-w-3xl">
            {selectedLocation && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedLocation.name}</DialogTitle>
                  <DialogDescription className="flex items-center text-sm">
                    <MapPin className="mr-1 h-4 w-4" />
                    {selectedLocation.location}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4 md:grid-cols-2">
                  <div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {selectedLocation.image ? (
                        <img 
                          src={selectedLocation.image} 
                          alt={selectedLocation.name}
                          className="h-full w-full object-cover"  
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-2 font-medium">About this location</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {selectedLocation.description}
                    </p>
                    
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      {selectedLocation.category && (
                        <div>
                          <h4 className="text-xs font-medium uppercase text-muted-foreground">Category</h4>
                          <p className="text-sm">{selectedLocation.category}</p>
                        </div>
                      )}
                      
                      {selectedLocation.bestTimeOfDay && (
                        <div>
                          <h4 className="text-xs font-medium uppercase text-muted-foreground">Best Time</h4>
                          <p className="text-sm">{selectedLocation.bestTimeOfDay}</p>
                        </div>
                      )}
                      
                      {selectedLocation.recommendedEquipment && (
                        <div>
                          <h4 className="text-xs font-medium uppercase text-muted-foreground">Equipment</h4>
                          <p className="text-sm">{selectedLocation.recommendedEquipment}</p>
                        </div>
                      )}
                      
                      {selectedLocation.compositionTip && (
                        <div>
                          <h4 className="text-xs font-medium uppercase text-muted-foreground">Composition Tip</h4>
                          <p className="text-sm">{selectedLocation.compositionTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">Close</Button>
                </DialogClose>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}