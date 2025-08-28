import { useQuery, useMutation } from "@tanstack/react-query";
import { Location, Review, User } from "@shared/schema";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, ChevronLeft, ChevronRight, Users, CalendarDays, MapPin, 
  MessageSquare, X, Heart, Share, PenSquare, PartyPopper, Play, Car, Building
} from "lucide-react";
import { Dialog, DialogContent, DialogPortal } from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { LocationMap } from "@/components/map/location-map";
import { BookingSection } from "@/components/bookings/booking-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { formatUsername, formatDate } from "@/lib/utils";
import { MessageHostDialog } from "@/components/messages/message-host-dialog";
import { ShareDialog } from "@/components/ui/share-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

type AccessibilityData = {
  parking?: {
    onsiteParking?: boolean;
    onsiteSpaces?: number;
    adaAccessible?: boolean;
    evCharging?: boolean;
    coveredGarage?: boolean;
    gatedSecured?: boolean;
    heightClearance?: number;
    valetService?: boolean;
    twentyFourSeven?: boolean;
    nearbyPaidLot?: boolean;
    loadingZone?: boolean;
    streetParking?: boolean;
    busCoachParking?: boolean;
    basecampCrewArea?: boolean;
    pullThrough?: boolean;
    levelSurface?: boolean;
    overnightAllowed?: boolean;
    shorePower?: boolean;
    waterSewer?: boolean;
    trailerStorage?: boolean;
  };
  access?: {
    elevator?: boolean;
    stairs?: boolean;
    streetLevel?: boolean;
    wheelchairAccess?: boolean;
    freightElevator?: boolean;
    stepFreeRamp?: boolean;
    loadingDock?: boolean;
    rollUpDoor?: boolean;
    rollUpDoorDimensions?: string;
    doubleWideDoors?: boolean;
    doubleWideWidth?: number;
    driveInAccess?: boolean;
    corridorMinWidth?: boolean;
    corridorWidth?: number;
    freightElevatorCapacity?: boolean;
    elevatorCapacity?: number;
    elevatorCabSize?: string;
    keylessEntry?: boolean;
    onSiteSecurity?: boolean;
    dolliesAvailable?: boolean;
  };
};

function extractCityName(address: string) {
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

function LocationDetails() {
  const { id } = useParams<{ id: string }>();
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMessageHost, setShowMessageHost] = useState(false);

  const { data: location, isLoading: locationLoading } = useQuery<Location>({
    queryKey: [`/api/locations/${id}`],
    staleTime: 0, // Don't use cached data
    refetchOnMount: true, // Refetch data when component mounts
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/reviews/${id}`],
  });

  const { data: addOns = [], isLoading: addOnsLoading } = useQuery<any[]>({
    queryKey: [`/api/locations/${id}/addons`],
  });

  const { data: hostUser, isLoading: hostLoading } = useQuery<User>({
    queryKey: [`/api/users/${location?.ownerId}`],
    enabled: !!location?.ownerId,
  });

  const { data: isSaved } = useQuery<boolean>({
    queryKey: [`/api/locations/${id}/saved`],
    enabled: !!user,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      const method = isSaved ? "DELETE" : "POST";
      const response = await apiRequest({
        url: `/api/locations/${id}/save`,
        method
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${id}/saved`] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-locations"] });

      toast({
        title: isSaved ? "Location removed" : "Location saved",
        description: isSaved
          ? "Location removed from your saved list"
          : "Location added to your saved list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved status",
        variant: "destructive",
      });
    },
  });

  if (locationLoading || reviewsLoading || addOnsLoading || hostLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </AppLayout>
    );
  }

  if (!location) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          Location not found
        </div>
      </AppLayout>
    );
  }

  // Cast accessibility data to proper type
  const accessibilityData = location.accessibilityData as AccessibilityData | null;
  
  // Debug: Log what we're receiving
  if (location.id === 28) {
    console.log('Location 28 data:', {
      hasAmenities: location.amenities && location.amenities.length > 0,
      amenitiesCount: location.amenities?.length,
      hasAccessibilityData: !!accessibilityData,
      accessibilityData: accessibilityData
    });
  }

  // Combine images and videos into a single media array for gallery display
  // Each video counts as 2 entries in the gallery as requested
  const mediaItems: Array<{ type: 'image' | 'video'; url: string }> = [];
  

  
  // Add images first
  if (location.images && Array.isArray(location.images) && location.images.length > 0) {
    location.images.forEach(image => {
      mediaItems.push({ type: 'image', url: image });
    });
  }
  
  // Add videos (each video counts as 2 gallery items)
  if (location.videos && Array.isArray(location.videos) && location.videos.length > 0) {
    location.videos.forEach(video => {
      // Add each video twice to make it count as "2 photos"
      mediaItems.push({ type: 'video', url: video });
      mediaItems.push({ type: 'video', url: video });
    });
  }
  
  // Fallback to placeholder if no media
  const images = mediaItems.length > 0 
    ? mediaItems.map(item => item.url) 
    : ['https://placehold.co/600x400?text=No+Image'];
  
  // Keep track of media types for rendering
  const mediaTypes: Array<'image' | 'video'> = mediaItems.length > 0 
    ? mediaItems.map(item => item.type) 
    : ['image'];

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleImageClick = (index: number) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const [selectedTab, setSelectedTab] = useState('create');

  return (
    <AppLayout>
      <div className="w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="relative">
            <div className="grid grid-cols-3 gap-2 h-[500px]">
              <div
                className="col-span-2 relative overflow-hidden cursor-pointer rounded-l-xl"
                onClick={() => handleImageClick(mainImageIndex)}
              >
                {mediaTypes[mainImageIndex] === 'video' ? (
                  <>
                    <video
                      src={images[mainImageIndex]}
                      className="object-cover w-full h-full"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-12 w-12 text-white fill-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={images[mainImageIndex]}
                      alt={`${location.title} - Main Image`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {images.slice(1, 4).map((image, index) => {
                  const actualIndex = index + 1;
                  const isVideo = mediaTypes[actualIndex] === 'video';
                  
                  return (
                    <div
                      key={index}
                      className="relative h-[164px] overflow-hidden cursor-pointer rounded-r-xl"
                      onClick={() => handleImageClick(actualIndex)}
                    >
                      {isVideo ? (
                        <>
                          <video
                            src={image}
                            className="object-cover w-full h-full"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={image}
                            alt={`${location.title} - Image ${actualIndex + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/90 hover:bg-white text-black font-medium rounded-lg"
                size="sm"
                onClick={() => handleImageClick(mainImageIndex)}
              >
                Show all photos ({images.length})
              </Button>
            </div>
          </div>

          {/* Action Tabs - temporary inline replacement */}
          <div className="mt-6 mb-2 max-w-3xl mx-auto">
            <div className="bg-card rounded-full shadow-md flex">
              <Button
                variant={selectedTab === 'create' ? "default" : "ghost"}
                className={`flex-1 gap-2 rounded-full transition-all ${
                  selectedTab === 'create' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => setSelectedTab('create')}
              >
                <PenSquare className="h-5 w-5" />
                <span className="hidden sm:inline">Create</span>
              </Button>
              <Button
                variant={selectedTab === 'celebrate' ? "default" : "ghost"}
                className={`flex-1 gap-2 rounded-full transition-all ${
                  selectedTab === 'celebrate' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => setSelectedTab('celebrate')}
              >
                <PartyPopper className="h-5 w-5" />
                <span className="hidden sm:inline">Celebrate</span>
              </Button>
              <Button
                variant={selectedTab === 'play' ? "default" : "ghost"}
                className={`flex-1 gap-2 rounded-full transition-all ${
                  selectedTab === 'play' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => setSelectedTab('play')}
              >
                <Play className="h-5 w-5" />
                <span className="hidden sm:inline">Play</span>
              </Button>
              <Button
                variant={selectedTab === 'meet' ? "default" : "ghost"}
                className={`flex-1 gap-2 rounded-full transition-all ${
                  selectedTab === 'meet' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => setSelectedTab('meet')}
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">Meet</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Gallery Modal without automatic close button */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogPortal>
          {/* Custom overlay without animations */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-[10000] bg-black/80"
          />
          <DialogPrimitive.Content 
            className="fixed left-[50%] top-[50%] z-[10001] max-w-[90vw] max-h-[90vh] h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 p-0 border-none bg-white shadow-xl"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white shadow-sm z-50 rounded-full"
                onClick={() => setShowGallery(false)}
              >
                <X className="h-5 w-5 text-gray-700" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm z-50 h-10 w-10 rounded-full"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </Button>

              <div className="w-full h-full flex items-center justify-center p-8">
                {mediaTypes[galleryIndex] === 'video' ? (
                  <video
                    src={images[galleryIndex]}
                    controls
                    autoPlay
                    muted
                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: 'calc(90vw - 8rem)',
                      maxHeight: 'calc(90vh - 8rem)'
                    }}
                  />
                ) : (
                  <img
                    src={images[galleryIndex]}
                    alt={`${location.title} - Gallery Image ${galleryIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: 'calc(90vw - 8rem)',
                      maxHeight: 'calc(90vh - 8rem)'
                    }}
                  />
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm z-50 h-10 w-10 rounded-full"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </Button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-1.5 rounded-full shadow-sm text-gray-700 text-sm font-medium">
                {galleryIndex + 1} / {images.length}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{location.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <p>Approximate Location: {extractCityName(location.address)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share className="h-6 w-6 text-muted-foreground" />
                  </Button>
                  
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => toggleSaveMutation.mutate()}
                      disabled={toggleSaveMutation.isPending}
                    >
                      <Heart
                        className={cn("h-6 w-6 transition-colors", {
                          "fill-destructive text-destructive": isSaved,
                          "text-muted-foreground": !isSaved,
                        })}
                      />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>Up to {location.maxCapacity} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span>{location.cancellationPolicy.charAt(0).toUpperCase() + location.cancellationPolicy.slice(1)} cancellation</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Facts Section - temporary replacement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min booking length</p>
                  <p className="font-semibold">{location.minHours || 1} hr minimum</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cast & Crew</p>
                  <p className="font-semibold">{location.maxCapacity} people</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Square footage</p>
                  <p className="font-semibold">{location.size} sq/ft</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">About this location</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{location.description}</p>
            </div>

            <Separator />

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility Information */}
            {accessibilityData && (
              <>
                <Separator />
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Accessibility & Access</h2>
                  
                  {/* Parking Section */}
                  {accessibilityData.parking && Object.entries(accessibilityData.parking).some(([_, value]) => 
                    value === true || 
                    (typeof value === 'string' && value.trim() !== '') ||
                    (typeof value === 'number' && value > 0)
                  ) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        Parking
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {accessibilityData.parking.onsiteParking && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Onsite parking {accessibilityData.parking.onsiteSpaces ? `(${accessibilityData.parking.onsiteSpaces} spaces)` : ''}</span>
                          </div>
                        )}
                        {accessibilityData.parking.adaAccessible && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>ADA accessible spaces</span>
                          </div>
                        )}
                        {accessibilityData.parking.evCharging && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>EV charging</span>
                          </div>
                        )}
                        {accessibilityData.parking.coveredGarage && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Covered/garage parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.gatedSecured && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Gated/secured parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.heightClearance && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Height clearance: {accessibilityData.parking.heightClearance} ft</span>
                          </div>
                        )}
                        {accessibilityData.parking.valetService && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Valet service</span>
                          </div>
                        )}
                        {accessibilityData.parking.twentyFourSeven && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>24/7 parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.nearbyPaidLot && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Nearby paid lot</span>
                          </div>
                        )}
                        {accessibilityData.parking.loadingZone && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Loading zone</span>
                          </div>
                        )}
                        {accessibilityData.parking.streetParking && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Street parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.busCoachParking && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Bus/coach parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.basecampCrewArea && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Basecamp/crew parking</span>
                          </div>
                        )}
                        {accessibilityData.parking.pullThrough && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Pull-through access</span>
                          </div>
                        )}
                        {accessibilityData.parking.levelSurface && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Level surface</span>
                          </div>
                        )}
                        {accessibilityData.parking.overnightAllowed && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Overnight allowed</span>
                          </div>
                        )}
                        {accessibilityData.parking.shorePower && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Shore-power hookups</span>
                          </div>
                        )}
                        {accessibilityData.parking.waterSewer && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Water/sewer hookups</span>
                          </div>
                        )}
                        {accessibilityData.parking.trailerStorage && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Trailer storage</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Access Section */}
                  {accessibilityData.access && Object.entries(accessibilityData.access).some(([_, value]) => 
                    value === true || 
                    (typeof value === 'string' && value.trim() !== '') ||
                    (typeof value === 'number' && value > 0)
                  ) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Building className="h-5 w-5 text-green-600" />
                        Access & Load-in
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {accessibilityData.access.elevator && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Elevator</span>
                          </div>
                        )}
                        {accessibilityData.access.stairs && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Stairs</span>
                          </div>
                        )}
                        {accessibilityData.access.streetLevel && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Street level</span>
                          </div>
                        )}
                        {accessibilityData.access.wheelchairAccess && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Wheelchair access</span>
                          </div>
                        )}
                        {accessibilityData.access.freightElevator && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Freight elevator</span>
                          </div>
                        )}
                        {accessibilityData.access.stepFreeRamp && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Step-free entrance/ramp</span>
                          </div>
                        )}
                        {accessibilityData.access.loadingDock && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Loading dock</span>
                          </div>
                        )}
                        {accessibilityData.access.rollUpDoor && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Roll-up door {accessibilityData.access.rollUpDoorDimensions ? `(${accessibilityData.access.rollUpDoorDimensions})` : ''}</span>
                          </div>
                        )}
                        {accessibilityData.access.doubleWideDoors && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Double-wide doors {accessibilityData.access.doubleWideWidth ? `(${accessibilityData.access.doubleWideWidth}" min)` : ''}</span>
                          </div>
                        )}
                        {accessibilityData.access.driveInAccess && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Drive-in access</span>
                          </div>
                        )}
                        {accessibilityData.access.corridorMinWidth && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Min corridor width {accessibilityData.access.corridorWidth ? `(${accessibilityData.access.corridorWidth}")` : ''}</span>
                          </div>
                        )}
                        {accessibilityData.access.freightElevatorCapacity && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Freight elevator {accessibilityData.access.elevatorCapacity ? `(${accessibilityData.access.elevatorCapacity} lbs)` : ''} {accessibilityData.access.elevatorCabSize ? `- ${accessibilityData.access.elevatorCabSize}` : ''}</span>
                          </div>
                        )}
                        {accessibilityData.access.keylessEntry && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Keyless/lockbox entry</span>
                          </div>
                        )}
                        {accessibilityData.access.onSiteSecurity && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>On-site security</span>
                          </div>
                        )}
                        {accessibilityData.access.dolliesAvailable && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Dollies/carts available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {addOns && addOns.length > 0 && (
              <>
                <Separator />
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Additional Services</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <span className="font-medium">{addon.name}</span>
                        <span className="text-muted-foreground">${addon.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Location</h2>
              <LocationMap address={location.address} className="mb-4" />
              <p className="text-muted-foreground">
                The exact address will be shared after your booking is confirmed.
              </p>
            </div>


            {location.videos && Array.isArray(location.videos) && location.videos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Video Tour</h2>
                  <div className="grid gap-6">
                    {location.videos.map((video, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-black">
                        <video
                          controls
                          className="w-full h-full object-contain"
                          preload="metadata"
                        >
                          <source src={video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <Separator />
            {/* TODO: Add ReviewsList component */}
            {/* <ReviewsList locationId={parseInt(id)} locationOwnerId={location.ownerId} /> */}
          </div>

          <div>
            <div id="booking" className="sticky top-24 space-y-4">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <BookingSection location={location} />
                </CardContent>
              </Card>

              {hostUser && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Link href={`/users/${hostUser.id}`}>
                        <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                          <Avatar className="h-12 w-12">
                            {hostUser.profileImage ? (
                              <AvatarImage
                                src={hostUser.profileImage}
                                alt={hostUser.username}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {hostUser.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{formatUsername(hostUser.username)}</p>
                            <p className="text-sm text-muted-foreground">Host</p>
                          </div>
                        </div>
                      </Link>

                      {user && user.id !== hostUser.id && (
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => setShowMessageHost(true)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Host
                        </Button>
                      )}

                      <MessageHostDialog 
                        open={showMessageHost}
                        onOpenChange={setShowMessageHost}
                        hostId={hostUser.id}
                        hostName={formatUsername(hostUser.username)}
                        hostImage={hostUser.profileImage as string | undefined}
                        locationId={location.id}
                        locationTitle={location.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={location.title}
        url={window.location.href}
        text={`Check out this amazing location: `}
      />
    </AppLayout>
  );
}

export default LocationDetails;