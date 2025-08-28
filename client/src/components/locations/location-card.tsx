import { Location } from "@shared/schema";
import { Link } from "wouter";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart, Share2, Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

// Helper function to extract city name from address
function extractCityFromAddress(address: string): string {
  if (!address) return "Unknown";
  
  // Try to extract city from comma-separated address (e.g., "123 Main St, Los Angeles, CA 90001")
  const parts = address.split(',');
  if (parts.length >= 2) {
    // City is typically the second part in a comma-separated address
    return parts[1].trim();
  }
  
  // Fallback: if we can't identify the city, return the first part
  return parts[0].trim();
}

// Helper function to format category names for display
function formatCategoryName(category: string | undefined): string {
  if (!category) return "Studio";
  
  // Handle composite property types (e.g., "Studio - Photography Studio")
  if (category.includes(' - ')) {
    const parts = category.split(' - ');
    // Return the more specific part (usually the second part)
    return parts[1] || parts[0];
  }
  
  // Map of category IDs to display names
  const categoryMap: Record<string, string> = {
    'photo-studio': 'Photo Studio',
    'film-studio': 'Film Studio',
    'warehouse': 'Warehouse',
    'gallery': 'Gallery',
    'restaurant': 'Restaurant',
    'mansion': 'Mansion',
    'house': 'House',
    'apartment': 'Apartment',
    'hospital': 'Hospital',
    'studio-loft': 'Studio Loft',
    'garden-venue': 'Garden Venue',
    'beach-house': 'Beach House',
    'event-space': 'Event Space',
    'office': 'Office Space',
    // Property types from add listing page
    'Photography Studio': 'Photography Studio',
    'Film Studio': 'Film Studio',
    'Loft Studio': 'Loft Studio',
    'Recording Studio': 'Recording Studio',
    'Stage Studio': 'Stage Studio',
    'TV Studio': 'TV Studio',
    'Warehouse': 'Warehouse',
    'Gallery': 'Gallery',
    'Restaurant': 'Restaurant',
    'Mansion or Estate': 'Mansion or Estate',
    'House': 'House',
    'Apartment': 'Apartment',
    'Loft': 'Loft',
    'Condo': 'Condo',
    'Penthouse': 'Penthouse',
    // Handle composite types
    'Residential - Mansion or Estate': 'Mansion or Estate',
    'Residential - Apartment': 'Apartment',
    'Studio - Photography Studio': 'Photography Studio',
    'Commercial - Warehouse': 'Warehouse',
    'Commercial - Gallery': 'Gallery',
    'Commercial - Restaurant': 'Restaurant'
  };
  
  // Return mapped name or format the category string
  return categoryMap[category] || category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

interface LocationCardProps {
  location: Location;
  onEdit?: () => void;
  onPriceEdit?: () => void;
  onPhotoEdit?: () => void;
  onAvailabilityEdit?: () => void;
  onAddonEdit?: () => void;
  showBookButton?: boolean;
  showManageButton?: boolean;
  showStatus?: boolean;
  horizontalLayout?: boolean;
}

export function LocationCard({
  location,
  onEdit,
  onPriceEdit,
  onPhotoEdit,
  onAvailabilityEdit,
  onAddonEdit,
  showBookButton = false,
  showManageButton = false,
  showStatus = false,
  horizontalLayout = true
}: LocationCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorite, setFavorite] = useState(false);
  
  const thumbnailImage = location.images && location.images.length > 0 
    ? location.images[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  // Check if location is saved
  const { data: isSaved } = useQuery<boolean>({
    queryKey: [`/api/locations/${location.id}/saved`],
    enabled: !!user,
  });

  // Fetch location rating data
  const { data: ratingData } = useQuery<{ averageRating: number | null; reviewCount: number }>({
    queryKey: [`/api/locations/${location.id}/rating`],
  });

  // Update favorite state when saved status changes
  useEffect(() => {
    if (isSaved !== undefined) {
      setFavorite(isSaved);
    }
  }, [isSaved]);

  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: async (shouldSave: boolean) => {
      const method = shouldSave ? "POST" : "DELETE";
      const response = await apiRequest({
        url: `/api/locations/${location.id}/save`,
        method
      });
      return response;
    },
    onSuccess: (_, shouldSave) => {
      // Update local state to match the new saved status
      setFavorite(shouldSave);
      
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}/saved`] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-locations/ids"] });

      toast({
        title: shouldSave ? "Location saved" : "Location removed",
        description: shouldSave
          ? "Location added to your saved list"
          : "Location removed from your saved list",
      });
    },
    onError: (error: Error, shouldSave) => {
      // Revert to the opposite of what we tried to do
      setFavorite(!shouldSave);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update saved status",
        variant: "destructive",
      });
    },
  });

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/locations/${location.id}`);
    alert("Link copied to clipboard!");
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save locations",
        variant: "destructive",
      });
      return;
    }

    // Determine what action to take (save or unsave)
    const shouldSave = !favorite;
    
    // Optimistically update UI
    setFavorite(shouldSave);
    
    // Call the API with the desired action
    saveMutation.mutate(shouldSave);
  };
  
  // We're using the extractCityFromAddress function defined above

  // Generate title with key features
  const generateTitleWithFeatures = () => {
    const features = [];
    
    // Add main title
    if (location.title) {
      features.push(location.title);
    }
    
    // Add property type if available
    if (location.propertyType) {
      features.push(location.propertyType);
    }
    
    // Add a key feature from amenities if available
    if (location.amenities && location.amenities.length > 0) {
      // Prioritize certain features
      const preferredFeatures = ['Fire Escape', 'High Ceiling', 'Natural Light', 'Skyline Views'];
      const foundFeature = location.amenities.find(amenity => preferredFeatures.includes(amenity));
      if (foundFeature) {
        features.push(foundFeature);
      } else {
        features.push(location.amenities[0]);
      }
    }
    
    // Return title with pipes
    return features.map((feature, index) => (
      <span key={index}>
        {index > 0 && <span className="mx-1 text-muted-foreground">|</span>}
        <span>{feature}</span>
      </span>
    ));
  };

  // Render horizontal layout (like in the reference image)
  if (horizontalLayout) {
    return (
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
        <Link href={`/locations/${location.id}`} className="block h-full">
          <div className="h-full flex flex-col">
            <div className="relative">
              <img
                src={location.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"}
                alt={location.title}
                className="w-full h-56 object-cover"
              />
              
              {/* Share and Save buttons - positioned at top right */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare(e);
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                {user && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className={cn(
                      "h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md",
                      isSaved && "text-red-500"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      saveMutation.mutate(!isSaved);
                    }}
                  >
                    <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              {/* Title and rating on same line */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-lg line-clamp-1 flex-1">
                  {location.title}
                </h3>
                <div className="flex items-center ml-2">
                  {ratingData?.averageRating ? (
                    <>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                      <span className="text-base font-medium">
                        {ratingData.averageRating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-medium text-muted-foreground">
                      New
                    </span>
                  )}
                </div>
              </div>
              
              {/* City and Response time */}
              <div className="text-sm text-muted-foreground mb-1">
                {extractCityFromAddress(location.address)}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Responds within 1 hr
              </div>
              
              {/* Bottom section with instant book and price */}
              <div className="flex items-center justify-between mt-auto">
                {/* Instant Book badge */}
                {location.instantBooking ? (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 py-1 px-3">
                    <Zap className="h-4 w-4 mr-1.5" />
                    Instant Book
                  </Badge>
                ) : (
                  <div></div>
                )}
                
                {/* Price */}
                <div className="flex items-baseline">
                  <span className="font-semibold text-xl">${location.price}</span>
                  <span className="text-sm text-muted-foreground">/hr</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }
  
  // Render vertical layout (grid card similar to reference image)
  return (
    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
      <Link href={`/locations/${location.id}`} className="block h-full">
        <div className="h-full flex flex-col">
          <div className="relative">
            <img
              src={location.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"}
              alt={location.title}
              className="w-full h-48 object-cover"
            />
            
            {/* Share and Save buttons - positioned at top right */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  handleShare(e);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md",
                    isSaved && "text-red-500"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    saveMutation.mutate(!isSaved);
                  }}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            {/* Title and rating on same line */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-base line-clamp-1 flex-1">
                {location.title}
              </h3>
              <div className="flex items-center ml-2">
                {ratingData?.averageRating ? (
                  <>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span className="text-sm font-medium">
                      {ratingData.averageRating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    New
                  </span>
                )}
              </div>
            </div>
            
            {/* City and Response time */}
            <div className="text-sm text-muted-foreground mb-1">
              {extractCityFromAddress(location.address)}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Responds within 1 hr
            </div>
            
            {/* Bottom section with instant book and price */}
            <div className="flex items-center justify-between mt-auto">
              {/* Instant Book badge */}
              {location.instantBooking ? (
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 py-0.5 px-2">
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  Instant Book
                </Badge>
              ) : (
                <div></div>
              )}
              
              {/* Price */}
              <div className="flex items-baseline">
                <span className="font-semibold text-lg">${location.price}</span>
                <span className="text-sm text-muted-foreground">/hr</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}