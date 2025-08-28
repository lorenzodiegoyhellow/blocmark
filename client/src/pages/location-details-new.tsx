import React, { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Share, Star, Calendar, Users, Clock, ChevronRight, Check, X, Heart, ExternalLink, Plus, Minus, Zap, Camera, Video, PartyPopper, Briefcase, Info, Car, Building } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedAvatar } from "@/components/ui/verified-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { BookingDateTimeSelector } from "@/components/location/booking-date-time-selector";
import { AppLayout } from "../components/layout/app-layout";
import { ShareDialog } from "../components/ui/share-dialog";
import { PhotoGalleryDialog } from "../components/ui/photo-gallery-dialog";
import { LocationMap } from "../components/map/location-map";
import { MessageHostDialog } from "../components/messages/message-host-dialog";
import { ReviewSection } from "../components/reviews/review-section";
import { cn, formatUsername } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { User as AuthUser } from "@shared/schema";

// Define the location interface based on the API response
interface Location {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  videos?: string[];
  propertyType?: string;
  maxCapacity?: number;
  size?: number;
  amenities?: string[];
  cancellationPolicy?: string;
  incrementalRate?: number;
  minHours?: number;
  instantBooking?: boolean;
  bookingBuffer?: number;
  metadata?: string;
  prohibitedItems?: string[];
  locationRules?: string[];
  checkInInstructions?: string;
  equipmentRentalAvailable?: boolean;
  pricingMatrix?: Record<string, Record<string, number>>; // New flat rate pricing matrix
  enabledGroupSizes?: string[]; // Which group sizes are enabled for this location
  groupSizePricing?: {
    mediumGroup?: number;
    largeGroup?: number;
  };
  additionalFees?: any[]; // JSON array with additional fees
  availability?: string; // JSON string with blocked dates
  activityPricing?: Record<string, number>; // Activity-based pricing modifiers (legacy)
  allowedActivities?: string[]; // Allowed activity types
  accessibilityData?: AccessibilityData; // Accessibility information
}

// Accessibility data interface
interface AccessibilityData {
  parking?: {
    onsiteParking?: boolean;
    onsiteSpaces?: number;
    adaAccessible?: boolean;
    evCharging?: boolean;
    coveredGarage?: boolean;
    gatedSecured?: boolean;
    heightClearance?: string;
    valetService?: boolean;
    twentyFourSeven?: boolean;
    nearbyPaidLot?: boolean;
    streetParking?: boolean;
    levelSurface?: boolean;
    loadingZone?: boolean;
    busCoachParking?: boolean;
    pullThrough?: boolean;
    overnightAllowed?: boolean;
    basecampCrewArea?: boolean;
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
    freightElevatorCapacity?: boolean;
    elevatorCapacity?: string;
    elevatorCabSize?: string;
    doubleWideDoors?: boolean;
    doubleWideWidth?: string;
    corridorMinWidth?: boolean;
    corridorWidth?: string;
    stepFreeRamp?: boolean;
    keylessEntry?: boolean;
    rollUpDoor?: boolean;
    rollUpDoorDimensions?: string;
    loadingDock?: boolean;
    driveInAccess?: boolean;
    onSiteSecurity?: boolean;
    dolliesAvailable?: boolean;
  };
}

// Interface for similar location data from API
interface SimilarLocation {
  id: number;
  title: string;
  image: string | null;
  price: number;
  maxCapacity: number;
  propertyType?: string;
  address: string;
}

// Helper functions
function extractCityName(address: string) {
  const parts = address.split(", ");
  return parts.length >= 2 ? parts[1] : address;
}

function formatMetadata(metadataString: string | undefined): Record<string, string[]> {
  if (!metadataString) return {};
  
  try {
    return JSON.parse(metadataString);
  } catch (e) {
    console.error("Error parsing metadata:", e);
    return {};
  }
}

// Calculate hours between two time strings
function calculateHours(startTime: string, endTime: string): number {
  try {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  } catch (e) {
    console.error('Error calculating hours:', e);
    return 0;
  }
}

// Calculate pricing breakdown with all components separated
function calculatePricingBreakdown(location: Location, groupSize: string, hours: number, activityType?: string) {
  let pricePerHour = 0;
  let basePrice = location.price || 0;
  
  // Use pricingMatrix if available (new system)
  if (location.pricingMatrix) {
    const matrix = location.pricingMatrix as Record<string, Record<string, number>>;
    const activity = activityType || 'photo'; // Default to photo if no activity selected
    
    if (matrix[activity] && matrix[activity][groupSize]) {
      pricePerHour = matrix[activity][groupSize];
      basePrice = pricePerHour; // For display purposes
    } else {
      // Matrix exists but doesn't have the data - fall through to old system
      pricePerHour = 0; // Will be set by old system below
    }
  }
  
  // If we didn't get a price from the matrix, use old pricing system
  if (pricePerHour === 0) {
    pricePerHour = basePrice;
    
    if (location.groupSizePricing) {
      if (groupSize === 'medium' && location.groupSizePricing.mediumGroup) {
        pricePerHour = basePrice + location.groupSizePricing.mediumGroup;
      } else if (groupSize === 'large' && location.groupSizePricing.largeGroup) {
        pricePerHour = basePrice + location.groupSizePricing.largeGroup;
      } else if (groupSize === 'extraLarge' && location.groupSizePricing.extraLargeGroup) {
        pricePerHour = basePrice + location.groupSizePricing.extraLargeGroup;
      }
    }
    
    // Apply activity-based pricing as percentage if specified (old system)
    if (activityType && location.activityPricing) {
      const activityPricing = location.activityPricing as Record<string, number>;
      const activityPercentage = activityPricing[activityType];
      if (activityPercentage && activityPercentage > 0) {
        pricePerHour = pricePerHour * (1 + activityPercentage / 100);
      }
    }
  }
  
  const subtotal = pricePerHour * hours;
  
  // Calculate additional fees
  const additionalFeesTotal = (location.additionalFees as any[])?.reduce((total, fee) => {
    if (fee.type === 'percentage') {
      return total + (subtotal * fee.amount / 100);
    } else {
      return total + fee.amount;
    }
  }, 0) || 0;
  
  const subtotalWithFees = subtotal + additionalFeesTotal;
  const serviceFee = subtotalWithFees * 0.05; // 5% service fee
  const total = subtotalWithFees + serviceFee;
  
  return {
    basePrice: subtotal,
    additionalFeesTotal,
    activityFeeTotal: 0, // No longer used in new pricing system
    serviceFee,
    total,
    additionalFees: location.additionalFees as any[] || [],
    activityType,
    activityPercentage: undefined // No longer used in new pricing system
  };
}

// Helper function to get price per hour based on pricing matrix
function getPricePerHour(location: Location, groupSize: string, activityType?: string): number {
  if (location.pricingMatrix) {
    const matrix = location.pricingMatrix as Record<string, Record<string, number>>;
    const activity = activityType || 'photo';
    
    if (matrix[activity] && matrix[activity][groupSize]) {
      return matrix[activity][groupSize];
    }
    // Don't return 0 here - fall through to old system if matrix doesn't have the data
  }
  
  // Fallback to old system
  const basePrice = location.price || 0;
  let pricePerHour = basePrice;
  
  if (location.groupSizePricing) {
    if (groupSize === 'medium' && location.groupSizePricing.mediumGroup) {
      pricePerHour = basePrice + location.groupSizePricing.mediumGroup;
    } else if (groupSize === 'large' && location.groupSizePricing.largeGroup) {
      pricePerHour = basePrice + location.groupSizePricing.largeGroup;
    } else if (groupSize === 'extraLarge' && location.groupSizePricing.extraLargeGroup) {
      pricePerHour = basePrice + location.groupSizePricing.extraLargeGroup;
    }
  }
  
  if (activityType && location.activityPricing) {
    const activityPercentage = (location.activityPricing as Record<string, number>)[activityType];
    if (activityPercentage && activityPercentage > 0) {
      pricePerHour = pricePerHour * (1 + activityPercentage / 100);
    }
  }
  
  return pricePerHour;
}

// Legacy function for compatibility - returns total price
function calculatePriceByGroupSize(location: Location, groupSize: string, hours: number, activityType?: string) {
  return calculatePricingBreakdown(location, groupSize, hours, activityType).total;
}

// Helper function to format time from HH:MM to 12-hour format
function formatTimeDisplay(time: string) {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  
  if (hour === 0) {
    return `12:${minuteStr} AM`;
  } else if (hour < 12) {
    return `${hour}:${minuteStr} AM`;
  } else if (hour === 12) {
    return `12:${minuteStr} PM`;
  } else {
    return `${hour - 12}:${minuteStr} PM`;
  }
}

// Rating stars component
function RatingStars({ rating = 4.8 }: { rating: number }) {
  return (
    <div className="flex items-center">
      <div className="flex items-center mr-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

// Define AddOn interface
interface AddOn {
  id: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
}

// Similar Listings component to fetch and display dynamic similar listings
function SimilarListingsSection({ locationId }: { locationId: number }) {
  const { data: similarListings, error, isLoading } = useQuery<SimilarLocation[]>({
    queryKey: [`/api/locations/${locationId}/similar`],
    enabled: !!locationId,
  });

  const { toast } = useToast();

  // Helper to extract city from address
  const extractCityFromAddress = (address: string): string => {
    if (!address) return "Unknown";
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return parts[0].trim();
  };

  const handleShare = (e: React.MouseEvent, listingId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/locations/${listingId}`);
    toast({
      title: "Link copied",
      description: "Location link copied to clipboard",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Similar Listings in the Area</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
              <div className="bg-gray-200 rounded h-3 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Similar Listings in the Area</h2>
        <div className="p-4 border rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">Unable to load similar listings. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!similarListings || similarListings.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Similar Listings in the Area</h2>
        <div className="p-6 border rounded-lg bg-muted">
          <p className="text-center text-muted-foreground">No similar listings available in this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Similar Listings in the Area</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
            <Link href={`/locations/${listing.id}`} className="block h-full">
              <div className="h-full flex flex-col">
                <div className="relative">
                  <img 
                    src={listing.image || '/attached_assets/placeholder.jpg'} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Share button at top right */}
                  <div className="absolute top-3 right-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => handleShare(e, listing.id)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="font-medium text-base line-clamp-1 mb-1">
                    {listing.title}
                  </h3>
                  
                  {/* City and property type */}
                  <div className="text-sm text-muted-foreground mb-1">
                    {extractCityFromAddress(listing.address)}
                  </div>
                  
                  {/* Property type if available */}
                  {listing.propertyType && (
                    <div className="text-sm text-muted-foreground mb-3">
                      {listing.propertyType}
                    </div>
                  )}
                  
                  {/* Bottom section with capacity and price */}
                  <div className="flex items-center justify-between mt-auto">
                    {/* Capacity info */}
                    <div className="text-sm text-muted-foreground">
                      Up to {listing.maxCapacity} people
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-baseline">
                      <span className="font-semibold text-lg">${listing.price}</span>
                      <span className="text-sm text-muted-foreground">/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Add-ons component to fetch and display available add-ons
function AddOnsSection({ locationId }: { locationId: number }) {
  const { data: addOns, error, isLoading } = useQuery<AddOn[]>({
    queryKey: [`/api/locations/${locationId}/addons`],
    enabled: !!locationId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading add-ons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Unable to load add-ons. Please try again later.</p>
      </div>
    );
  }

  if (!addOns || addOns.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-muted">
        <p className="text-center text-muted-foreground">This location doesn't have any add-ons available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {addOns.map((addon) => (
          <div key={addon.id} className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium">{addon.name}</span>
                  <span className="font-medium">
                    ${addon.price}/{addon.priceUnit}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {addon.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        You can select add-ons during the booking process.
      </p>
    </div>
  );
}

// Define the User interface to include response metrics
interface User {
  id: number;
  username: string;
  profileImage?: string;
  responseRating?: string; // 'Excellent', 'Good', 'Average', etc.
  responseTime?: string; // 'A few hours', 'Within a day', etc.
  identityVerificationStatus?: "not_started" | "pending" | "verified" | "failed" | "expired";
}

function EnhancedLocationDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [favorited, setFavorited] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [groupSize, setGroupSize] = useState("small");
  const [activityType, setActivityType] = useState("");
  
  // Calculate hours based on start and end time with half-hour support
  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const parseTime = (time: string) => {
      // Handle both "9" and "09:00" formats for backward compatibility
      if (time.includes(':')) {
        const [hourStr, minuteStr] = time.split(':');
        return parseInt(hourStr) * 60 + parseInt(minuteStr);
      } else {
        return parseInt(time) * 60; // Legacy hour-only format
      }
    };
    
    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);
    
    // Handle case where end time is on the next day
    const minutesDiff = endMinutes >= startMinutes 
      ? endMinutes - startMinutes 
      : (24 * 60 - startMinutes) + endMinutes;
      
    // Convert minutes to hours, supporting half-hour increments
    return minutesDiff / 60 || 0.5; // Minimum 0.5 hours
  };
  
  // Fetch location data
  const { data, error, isLoading } = useQuery<Location>({
    queryKey: [`/api/locations/${id}`],
    enabled: !!id,
  });
  
  // Initialize hours state with default value
  const [hours, setHours] = useState(0); // Start with 0 until times are selected
  
  // Fetch current user data
  const { data: currentUser } = useQuery<AuthUser>({
    queryKey: ['/api/user'],
  });

  // Fetch host information including response metrics
  const { data: hostData } = useQuery<User>({
    queryKey: [`/api/users/${data?.ownerId}`],
    enabled: !!data?.ownerId,
  });

  // Fetch real review data for this location
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: [`/api/reviews/location/${id}`],
    enabled: !!id,
  });

  // Fetch bookings for this location to show on calendar
  const { data: locationBookings } = useQuery<any[]>({
    queryKey: [`/api/bookings/location/${id}`],
    enabled: !!id,
  });
  
  // Fetch pending bookings for this location
  const { data: pendingBookings } = useQuery<any[]>({
    queryKey: [`/api/locations/${id}/pending-bookings`],
    enabled: !!id,
  });

  // Check if current user is the owner of this location
  const isOwner = currentUser && data && currentUser.id === data.ownerId;
  
  // Calculate the actual price based on group size (after data is available)
  // For display purposes, always use at least 1 hour if hours is 0
  const displayHours = hours > 0 ? hours : 1;
  const pricingBreakdown = data ? calculatePricingBreakdown(data, groupSize, displayHours, activityType) : {
    basePrice: 0,
    additionalFeesTotal: 0,
    serviceFee: 0,
    total: 0,
    additionalFees: []
  };
  const { basePrice, additionalFeesTotal, activityFeeTotal, serviceFee, total: totalPrice, additionalFees, activityPercentage } = pricingBreakdown;
  
  // Set default activity type when location data loads
  React.useEffect(() => {
    if (data && data.activityPricing && !activityType) {
      // Set the first available activity type as default
      const availableActivities = Object.keys(data.activityPricing);
      if (availableActivities.length > 0) {
        setActivityType(availableActivities[0]);
      }
    }
  }, [data, activityType]);

  // Update hours when location data loads or times change
  React.useEffect(() => {
    // Only calculate hours if both times are selected
    if (startTime && endTime) {
      const calculatedHours = calculateHours(startTime, endTime);
      setHours(calculatedHours);
    } else {
      setHours(0); // Reset to 0 when no times selected
    }
  }, [startTime, endTime]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[70vh]">
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh]">
          <h2 className="text-2xl font-bold mb-2">Error Loading Location</h2>
          <p className="text-muted-foreground">
            There was a problem loading this location. Please try again later.
          </p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Location data is loaded
  const location = data;
  const images = Array.isArray(location.images) && location.images.length > 0 
    ? location.images 
    : ['https://placehold.co/600x400?text=No+Image'];
  
  const mainImage = images[galleryIndex];
  const metadata = formatMetadata(location.metadata);
  
  // Debug availability data
  console.log('Location availability data:', location.availability);
  if (location.availability) {
    try {
      const parsed = JSON.parse(location.availability);
      console.log('Parsed availability:', parsed);
    } catch (e) {
      console.error('Failed to parse availability:', e);
    }
  }

  // Calculate real rating and review count from actual guest reviews only
  const guestReviews = reviewsData?.filter((review: any) => review.reviewType === 'guest_to_host') || [];
  const reviewCount = guestReviews.length;
  const rating = reviewCount > 0
    ? guestReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount 
    : 0;
  
  // Use real host data from API if available
  const hostName = hostData?.username || "Host"; 
  const hostImage = hostData?.profileImage || "/attached_assets/6I4B5772.jpg";
  const responseRating = hostData?.responseRating;
  const responseTime = hostData?.responseTime;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{location.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <p>{extractCityName(location.address)}</p>
                  </div>
                  <RatingStars rating={rating} />
                  <span className="text-sm text-muted-foreground">
                    {reviewCount > 0 ? `${reviewCount} review${reviewCount === 1 ? '' : 's'}` : 'No reviews yet'}
                  </span>
                  
                  {location.maxCapacity > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Up to {location.maxCapacity} people</span>
                    </div>
                  )}
                  
                  {location.minHours > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Min {location.minHours} hour booking</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setFavorited(!favorited)}
                >
                  <Heart className={cn("h-4 w-4", favorited && "fill-red-500 text-red-500")} />
                  <span>{favorited ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 rounded-lg overflow-hidden h-[400px] cursor-pointer">
              <img 
                src={mainImage} 
                alt={`${location.title} - Main`} 
                className="w-full h-full object-cover transition-transform hover:scale-105" 
                onClick={() => {
                  setGalleryIndex(0);
                  setShowGalleryDialog(true);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-2 relative">
              {images.slice(1, 5).map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden h-[190px] cursor-pointer">
                  <img 
                    src={image} 
                    alt={`${location.title} - ${index + 2}`} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onClick={() => {
                      setGalleryIndex(index + 1);
                      setShowGalleryDialog(true);
                    }}
                  />
                </div>
              ))}
              {images.length > 5 && (
                <Button 
                  variant="secondary" 
                  className="absolute bottom-4 right-4 z-10"
                  onClick={() => {
                    setGalleryIndex(0);
                    setShowGalleryDialog(true);
                  }}
                >
                  Show all photos
                </Button>
              )}
            </div>
          </div>
          
          {/* About this space - moved outside tabs directly below gallery */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">About this space</h2>
            <div className="relative">
              <p className="text-muted-foreground line-clamp-2">{location.description}</p>
              {location.description && location.description.length > 150 && (
                <div className="flex justify-end mt-1">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary hover:underline"
                    onClick={() => setShowDescriptionDialog(true)}
                  >
                    Read more
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Host info and main content columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main content - left side */}
            <div className="lg:col-span-2 space-y-8">

              
              <Separator />
              
              {/* Action Tabs */}
              <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="description">Details</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="addons">Add-ons</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="space-y-6">
                  {/* Quick Facts Grid */}
                  {(location.propertyType || location.size) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Quick Facts</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {location.propertyType && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-medium">{location.propertyType}</p>
                          </div>
                        )}
                        {location.size > 0 && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Size</p>
                            <p className="font-medium">{location.size} sq ft</p>
                          </div>
                        )}

                        {location.cancellationPolicy && (
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">Cancellation</p>
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger type="button" className="focus:outline-none">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs" side="top">
                                    <div className="space-y-2">
                                      {location.cancellationPolicy === 'flexible' && (
                                        <>
                                          <p className="font-semibold">Flexible Policy</p>
                                          <p className="text-sm">Free cancellation up to 24 hours before booking. Full refund if cancelled at least 24 hours in advance. 50% refund for cancellations between 12-24 hours. No refund for cancellations less than 12 hours.</p>
                                        </>
                                      )}
                                      {location.cancellationPolicy === 'moderate' && (
                                        <>
                                          <p className="font-semibold">Moderate Policy</p>
                                          <p className="text-sm">Free cancellation up to 5 days before booking. Full refund if cancelled at least 5 days in advance. 50% refund for cancellations between 1-5 days. No refund for cancellations less than 24 hours.</p>
                                        </>
                                      )}
                                      {location.cancellationPolicy === 'strict' && (
                                        <>
                                          <p className="font-semibold">Strict Policy</p>
                                          <p className="text-sm">Free cancellation up to 7 days before booking. Full refund if cancelled at least 7 days in advance. 50% refund for cancellations between 2-7 days. No refund for cancellations less than 48 hours.</p>
                                        </>
                                      )}
                                      {location.cancellationPolicy === 'non-refundable' && (
                                        <>
                                          <p className="font-semibold">Non-Refundable Policy</p>
                                          <p className="text-sm">This booking is non-refundable. No cancellations or refunds are allowed once the booking is confirmed.</p>
                                        </>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="font-medium capitalize">{location.cancellationPolicy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Visual Features - From Metadata */}
                  {metadata.visualFeatures && metadata.visualFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Visual Features</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {metadata.visualFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Prohibited Items Section */}
                  {location.prohibitedItems && location.prohibitedItems.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Prohibited Items</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {location.prohibitedItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Rules Section */}
                  {location.locationRules && location.locationRules.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Location Rules</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {location.locationRules.map((rule, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="amenities" className="space-y-6">
                  {location.amenities && location.amenities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {location.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Accessibility Information */}
                  {location.accessibilityData && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Accessibility & Access</h3>
                        
                        {/* Parking Section */}
                        {location.accessibilityData.parking && Object.entries(location.accessibilityData.parking).some(([_, value]) => 
                          value === true || 
                          (typeof value === 'string' && value.trim() !== '') ||
                          (typeof value === 'number' && value > 0)
                        ) && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-medium flex items-center gap-2">
                              <Car className="h-5 w-5 text-blue-600" />
                              Parking
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {location.accessibilityData.parking.onsiteParking && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Onsite parking {location.accessibilityData.parking.onsiteSpaces ? `(${location.accessibilityData.parking.onsiteSpaces} spaces)` : ''}</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.adaAccessible && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>ADA accessible spaces</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.evCharging && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>EV charging</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.coveredGarage && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Covered/garage parking</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.gatedSecured && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Gated/secured parking</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.heightClearance && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Height clearance: {location.accessibilityData.parking.heightClearance} ft</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.valetService && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Valet service</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.twentyFourSeven && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>24/7 parking</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.nearbyPaidLot && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Nearby paid parking lot</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.streetParking && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Street parking available</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.levelSurface && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Level surface</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.loadingZone && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Loading zone</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.busCoachParking && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Bus/coach parking</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.pullThrough && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Pull-through parking</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.overnightAllowed && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Overnight allowed</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.basecampCrewArea && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Base camp/crew area</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.shorePower && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Shore-power hookups</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.waterSewer && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Water/sewer hookups</span>
                                </div>
                              )}
                              {location.accessibilityData.parking.trailerStorage && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                                  <span>Trailer storage</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Access Section */}
                        {location.accessibilityData.access && Object.entries(location.accessibilityData.access).some(([_, value]) => 
                          value === true || 
                          (typeof value === 'string' && value.trim() !== '') ||
                          (typeof value === 'number' && value > 0)
                        ) && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-medium flex items-center gap-2">
                              <Building className="h-5 w-5 text-green-600" />
                              Access & Load-in
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {location.accessibilityData.access.elevator && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Elevator</span>
                                </div>
                              )}
                              {location.accessibilityData.access.stairs && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Stairs</span>
                                </div>
                              )}
                              {location.accessibilityData.access.streetLevel && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Street level</span>
                                </div>
                              )}
                              {location.accessibilityData.access.wheelchairAccess && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Wheelchair accessible</span>
                                </div>
                              )}
                              {location.accessibilityData.access.freightElevator && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Freight elevator</span>
                                </div>
                              )}
                              {location.accessibilityData.access.elevatorCapacity && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Elevator capacity: {location.accessibilityData.access.elevatorCapacity} lbs</span>
                                </div>
                              )}
                              {location.accessibilityData.access.elevatorCabSize && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Elevator cab size: {location.accessibilityData.access.elevatorCabSize}</span>
                                </div>
                              )}
                              {location.accessibilityData.access.doubleWideDoors && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Double-wide doors {location.accessibilityData.access.doubleWideWidth ? `(${location.accessibilityData.access.doubleWideWidth})` : ''}</span>
                                </div>
                              )}
                              {location.accessibilityData.access.corridorMinWidth && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Wide corridors {location.accessibilityData.access.corridorWidth ? `(${location.accessibilityData.access.corridorWidth})` : ''}</span>
                                </div>
                              )}
                              {location.accessibilityData.access.stepFreeRamp && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Step-free/ramp access</span>
                                </div>
                              )}
                              {location.accessibilityData.access.keylessEntry && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Keyless entry</span>
                                </div>
                              )}
                              {location.accessibilityData.access.rollUpDoor && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Roll-up door {location.accessibilityData.access.rollUpDoorDimensions ? `(${location.accessibilityData.access.rollUpDoorDimensions})` : ''}</span>
                                </div>
                              )}
                              {location.accessibilityData.access.loadingDock && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Loading dock</span>
                                </div>
                              )}
                              {location.accessibilityData.access.driveInAccess && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>Drive-in access</span>
                                </div>
                              )}
                              {location.accessibilityData.access.onSiteSecurity && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-600" />
                                  <span>On-site security</span>
                                </div>
                              )}
                              {location.accessibilityData.access.dolliesAvailable && (
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
                </TabsContent>
                
                <TabsContent value="addons" className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Available Add-ons</h3>
                  
                  {/* Add-ons component */}
                  <AddOnsSection locationId={Number(id)} />
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-6">
                  <ReviewSection 
                    locationId={data.id}
                    currentUser={currentUser}
                    isOwner={currentUser?.id === data.ownerId}
                  />
                </TabsContent>
              </Tabs>
              
              {/* Videos Section */}
              {location.videos && location.videos.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-6">Videos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {location.videos.map((video, index) => (
                      <div key={index} className="rounded-lg overflow-hidden bg-black">
                        <video
                          src={video}
                          controls
                          className="w-full aspect-video"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Map Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <LocationMap address={location.address} className="h-[400px] w-full rounded-lg shadow-md" />
                <p className="text-muted-foreground text-sm mt-2">
                  Located in {extractCityName(location.address)}. Exact location will be provided after booking.
                </p>
              </div>
              
              {/* Similar Listings in the Area - Dynamic component */}
              <SimilarListingsSection locationId={location.id} />
            </div>
            
            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <Card className="rounded-xl shadow-md">
                <CardContent className="p-5 space-y-5">
                  {/* Activity Type Selector */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Activity Type *</label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { key: 'photo', label: 'Photo', icon: Camera },
                        { key: 'video', label: 'Video', icon: Video },
                        { key: 'event', label: 'Event', icon: PartyPopper },
                        { key: 'meeting', label: 'Meeting', icon: Briefcase }
                      ].map((activity) => {
                        // Check if activity has prices in the pricing matrix
                        let isSupported = false;
                        if (data?.pricingMatrix) {
                          const matrix = data.pricingMatrix as Record<string, Record<string, number>>;
                          const activityPrices = matrix[activity.key];
                          if (activityPrices) {
                            // Check if any enabled group size has a price > 0 for this activity
                            const enabledSizes = (data.enabledGroupSizes as string[]) || ['small'];
                            isSupported = enabledSizes.some(size => activityPrices[size] > 0);
                          }
                        } else {
                          // Fallback to old system for backward compatibility
                          isSupported = (data?.allowedActivities?.includes(activity.key) || (data?.activityPricing && data.activityPricing[activity.key] !== undefined)) && 
                                       (data?.enabledActivities ? data.enabledActivities.includes(activity.key) : true);
                        }
                        const IconComponent = activity.icon;
                        
                        return (
                          <button
                            key={activity.key}
                            onClick={() => isSupported && setActivityType(activity.key)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all flex-1 justify-center",
                              isSupported 
                                ? activityType === activity.key
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border hover:border-primary/50 hover:bg-accent/50"
                                : "border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                            )}
                            disabled={!isSupported}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{activity.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {!!location.instantBooking && (
                        <Zap className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="text-xl font-bold">${data ? getPricePerHour(data, groupSize, activityType) : location.price}</span>
                      <span className="text-sm text-muted-foreground"> / hour</span>
                    </div>
                    {location.minHours > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Min: {location.minHours}h
                      </div>
                    )}
                  </div>
                  
                  {/* Booking Buffer indicator */}
                  {location.bookingBuffer && location.bookingBuffer > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{location.bookingBuffer} minute buffer between bookings</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-4">
                    {/* New Split Date and Time Selectors */}
                    <BookingDateTimeSelector
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      startTime={startTime}
                      endTime={endTime}
                      hours={hours}
                      onStartTimeChange={setStartTime}
                      onEndTimeChange={setEndTime}
                      onHoursChange={setHours}
                      blockedDates={(() => {
                        if (!location.availability) return [];
                        try {
                          const availability = typeof location.availability === 'string' 
                            ? JSON.parse(location.availability) 
                            : location.availability;
                          return availability.blockedDates || [];
                        } catch (e) {
                          console.error('Error parsing availability for blocked dates:', e);
                          return [];
                        }
                      })()}
                      bookedDates={(() => {
                        // Only pass dates that are COMPLETELY booked (24 hours)
                        // Partial bookings will be shown via blockedTimeSlots
                        const fullyBookedDates: string[] = [];
                        
                        // We'll track hours booked per date
                        const dateBookings = new Map<string, Set<number>>();
                        
                        // Process confirmed bookings
                        if (locationBookings && locationBookings.length > 0) {
                          locationBookings.forEach(booking => {
                            if (booking.status === 'confirmed' || booking.status === 'completed') {
                              const startDate = new Date(booking.startDate);
                              const endDate = new Date(booking.endDate);
                              
                              // Track hours for each day
                              const bookingStartDate = new Date(startDate);
                              bookingStartDate.setHours(0, 0, 0, 0);
                              
                              while (bookingStartDate <= endDate) {
                                const dateStr = bookingStartDate.toISOString().split('T')[0];
                                
                                if (!dateBookings.has(dateStr)) {
                                  dateBookings.set(dateStr, new Set());
                                }
                                
                                // Add booked hours for this date
                                if (bookingStartDate.toDateString() === startDate.toDateString()) {
                                  const startHour = startDate.getHours();
                                  const endHour = bookingStartDate.toDateString() === endDate.toDateString() 
                                    ? endDate.getHours() 
                                    : 24;
                                  for (let h = startHour; h < endHour; h++) {
                                    dateBookings.get(dateStr)!.add(h);
                                  }
                                } else if (bookingStartDate.toDateString() === endDate.toDateString()) {
                                  const endHour = endDate.getHours();
                                  for (let h = 0; h < endHour; h++) {
                                    dateBookings.get(dateStr)!.add(h);
                                  }
                                } else if (bookingStartDate > startDate && bookingStartDate < endDate) {
                                  // Full day in between
                                  for (let h = 0; h < 24; h++) {
                                    dateBookings.get(dateStr)!.add(h);
                                  }
                                }
                                
                                bookingStartDate.setDate(bookingStartDate.getDate() + 1);
                              }
                            }
                          });
                        }
                        
                        // Process pending bookings
                        if (pendingBookings && pendingBookings.length > 0) {
                          pendingBookings.forEach(booking => {
                            const startDate = new Date(booking.startDate);
                            const endDate = new Date(booking.endDate);
                            
                            // Track hours for each day
                            const bookingStartDate = new Date(startDate);
                            bookingStartDate.setHours(0, 0, 0, 0);
                            
                            while (bookingStartDate <= endDate) {
                              const dateStr = bookingStartDate.toISOString().split('T')[0];
                              
                              if (!dateBookings.has(dateStr)) {
                                dateBookings.set(dateStr, new Set());
                              }
                              
                              // Add booked hours for this date
                              if (bookingStartDate.toDateString() === startDate.toDateString()) {
                                const startHour = startDate.getHours();
                                const endHour = bookingStartDate.toDateString() === endDate.toDateString() 
                                  ? endDate.getHours() 
                                  : 24;
                                for (let h = startHour; h < endHour; h++) {
                                  dateBookings.get(dateStr)!.add(h);
                                }
                              } else if (bookingStartDate.toDateString() === endDate.toDateString()) {
                                const endHour = endDate.getHours();
                                for (let h = 0; h < endHour; h++) {
                                  dateBookings.get(dateStr)!.add(h);
                                }
                              } else if (bookingStartDate > startDate && bookingStartDate < endDate) {
                                // Full day in between
                                for (let h = 0; h < 24; h++) {
                                  dateBookings.get(dateStr)!.add(h);
                                }
                              }
                              
                              bookingStartDate.setDate(bookingStartDate.getDate() + 1);
                            }
                          });
                        }
                        
                        // Now determine which dates are FULLY booked (all 24 hours)
                        dateBookings.forEach((hours, dateStr) => {
                          // Check if all 24 hours are booked
                          if (hours.size >= 24) {
                            fullyBookedDates.push(dateStr);
                          }
                        });
                        
                        console.log('Fully booked dates (no availability):', fullyBookedDates);
                        return fullyBookedDates;
                      })()}
                      blockedTimeSlots={(() => {
                        let slots = new Set<string>();
                        
                        // Add owner-blocked time slots
                        if (location.availability) {
                          try {
                            const availability = typeof location.availability === 'string' 
                              ? JSON.parse(location.availability) 
                              : location.availability;
                            const ownerBlockedSlots = availability.blockedTimeSlots || [];
                            ownerBlockedSlots.forEach((slot: string) => slots.add(slot));
                          } catch (e) {
                            console.error('Error parsing availability:', e);
                          }
                        }
                        
                        // Add booked time slots from confirmed bookings
                        if (locationBookings && locationBookings.length > 0) {
                          locationBookings.forEach(booking => {
                            // Only include confirmed bookings
                            if (booking.status === 'confirmed' || booking.status === 'completed') {
                              const startDate = new Date(booking.startDate);
                              const endDate = new Date(booking.endDate);
                              
                              // Calculate hours for each day of the booking
                              const bookingStartDate = new Date(startDate);
                              bookingStartDate.setHours(0, 0, 0, 0);
                              
                              while (bookingStartDate <= endDate) {
                                const dateStr = bookingStartDate.toISOString().split('T')[0];
                                
                                // For the start day
                                if (bookingStartDate.toDateString() === startDate.toDateString()) {
                                  const startHour = startDate.getHours();
                                  const endHour = bookingStartDate.toDateString() === endDate.toDateString() 
                                    ? endDate.getHours() 
                                    : 24;
                                  
                                  for (let hour = startHour; hour < endHour; hour++) {
                                    slots.add(`${dateStr}-${hour}`);
                                  }
                                }
                                // For the end day (if different from start)
                                else if (bookingStartDate.toDateString() === endDate.toDateString()) {
                                  const endHour = endDate.getHours();
                                  for (let hour = 0; hour < endHour; hour++) {
                                    slots.add(`${dateStr}-${hour}`);
                                  }
                                }
                                // For days in between
                                else if (bookingStartDate > startDate && bookingStartDate < endDate) {
                                  // Block all hours for full days in between
                                  for (let hour = 0; hour < 24; hour++) {
                                    slots.add(`${dateStr}-${hour}`);
                                  }
                                }
                                
                                bookingStartDate.setDate(bookingStartDate.getDate() + 1);
                              }
                            }
                          });
                        }
                        
                        
                        // Also add time slots from pending bookings
                        if (pendingBookings && pendingBookings.length > 0) {
                          pendingBookings.forEach(booking => {
                            const startDate = new Date(booking.startDate);
                            const endDate = new Date(booking.endDate);
                            
                            // Calculate hours for each day of the booking
                            const bookingStartDate = new Date(startDate);
                            bookingStartDate.setHours(0, 0, 0, 0);
                            
                            while (bookingStartDate <= endDate) {
                              const dateStr = bookingStartDate.toISOString().split('T')[0];
                              
                              // For the start day
                              if (bookingStartDate.toDateString() === startDate.toDateString()) {
                                const startHour = startDate.getHours();
                                const endHour = bookingStartDate.toDateString() === endDate.toDateString() 
                                  ? endDate.getHours() 
                                  : 24;
                                
                                for (let hour = startHour; hour < endHour; hour++) {
                                  slots.add(`${dateStr}-${hour}`);
                                }
                              }
                              // For the end day (if different from start)
                              else if (bookingStartDate.toDateString() === endDate.toDateString()) {
                                const endHour = endDate.getHours();
                                for (let hour = 0; hour < endHour; hour++) {
                                  slots.add(`${dateStr}-${hour}`);
                                }
                              }
                              // For days in between
                              else if (bookingStartDate > startDate && bookingStartDate < endDate) {
                                // Block all hours for full days in between
                                for (let hour = 0; hour < 24; hour++) {
                                  slots.add(`${dateStr}-${hour}`);
                                }
                              }
                              
                              bookingStartDate.setDate(bookingStartDate.getDate() + 1);
                            }
                          });
                        }
                        
                        console.log('Total blocked time slots (including pending):', Array.from(slots));
                        return slots;
                      })()}
                      className="w-full"
                    />
                    
                    {/* Group Size Selection */}
                    <div>
                      <label className="text-xs text-muted-foreground">Group Size</label>
                      <select 
                        className="w-full border rounded-md p-2 mt-1 text-sm"
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                      >
                        {/* Filter options based on enabled group sizes - default to all if not specified */}
                        {(!data.enabledGroupSizes || data.enabledGroupSizes.length === 0 || data.enabledGroupSizes.includes('small')) && (
                          <option value="small">Small Group (1-5 people) - ${getPricePerHour(data, 'small', activityType)}/hr</option>
                        )}
                        {(!data.enabledGroupSizes || data.enabledGroupSizes.length === 0 || data.enabledGroupSizes.includes('medium')) && (
                          <option value="medium">
                            Medium Group (6-15 people) - ${getPricePerHour(data, 'medium', activityType)}/hr
                          </option>
                        )}
                        {(!data.enabledGroupSizes || data.enabledGroupSizes.length === 0 || data.enabledGroupSizes.includes('large')) && (
                          <option value="large">
                            Large Group (16-30 people) - ${getPricePerHour(data, 'large', activityType)}/hr
                          </option>
                        )}
                        {(!data.enabledGroupSizes || data.enabledGroupSizes.length === 0 || data.enabledGroupSizes.includes('extraLarge')) && (
                          <option value="extraLarge">
                            Extra Large Group (31+ people) - ${getPricePerHour(data, 'extraLarge', activityType)}/hr
                          </option>
                        )}
                      </select>
                    </div>
                    {!isOwner && (
                      <Button 
                        className="w-full" 
                        size="default" 
                        onClick={(e) => {
                          // Prevent normal button behavior
                          e.preventDefault();
                          console.log("Reserve button clicked!");
                          
                          if (!selectedDate || !startTime || !endTime) {
                            toast({
                              title: "Select Date and Time",
                              description: "Please select a date and time for your booking",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          if (!activityType) {
                            toast({
                              title: "Select Activity Type",
                              description: "Please select an activity type for your booking",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          // Calculate guest count based on group size
                          const guestCount = groupSize === 'small' ? 5 : groupSize === 'medium' ? 15 : 30;
                          
                          // Calculate the hours for the booking
                          const bookingHours = calculateHours(startTime, endTime);
                          
                          // Calculate prices with the actual booking hours using pricing breakdown
                          const bookingPricingBreakdown = data ? calculatePricingBreakdown(data, groupSize, bookingHours, activityType) : {
                            basePrice: 0,
                            additionalFeesTotal: 0,
                            serviceFee: 0,
                            total: 0
                          };
                          const bookingBasePrice = bookingPricingBreakdown.basePrice;
                          const bookingAdditionalFees = bookingPricingBreakdown.additionalFeesTotal;
                          const bookingServiceFee = bookingPricingBreakdown.serviceFee;
                          const bookingTotalPrice = bookingPricingBreakdown.total;
                          
                          
                          // Create booking details with price information
                          const bookingDetails = {
                            startDate: selectedDate.toISOString().split('T')[0],
                            startTime: startTime,
                            endTime: endTime,
                            guestCount: guestCount,
                            totalPrice: bookingTotalPrice,
                            basePrice: bookingBasePrice,
                            additionalFeesTotal: bookingAdditionalFees,
                            serviceFee: bookingServiceFee,
                            activityType: activityType,
                            castAndCrew: groupSize === 'small' ? '1 - 5 people' : 
                              groupSize === 'medium' ? '6 - 15 people' : 
                              groupSize === 'large' ? '16 - 30 people' :
                              '31+ people',
                            projectName: `Booking at ${data.title}`,
                            renterCompany: 'Individual Booking',
                            projectDescription: `Group size: ${groupSize === 'small' ? 'Small (1-5 people)' : 
                              groupSize === 'medium' ? 'Medium (6-15 people)' : 
                              groupSize === 'large' ? 'Large (16-30 people)' :
                              'Extra Large (31+ people)'}`
                          };
                          
                          
                          // Save to localStorage
                          localStorage.setItem('current_booking_data', JSON.stringify(bookingDetails));
                          localStorage.setItem('complete_booking_data', JSON.stringify(bookingDetails));
                          
                          // Prepare URL parameters with price info
                          const bookingParams = new URLSearchParams({
                            date: selectedDate.toISOString().split('T')[0],
                            startTime: startTime,
                            endTime: endTime,
                            groupSize: groupSize,
                            guestCount: guestCount.toString(),
                            totalPrice: bookingTotalPrice.toString(),
                            basePrice: bookingBasePrice.toString(),
                            additionalFeesTotal: bookingAdditionalFees.toString(),
                            serviceFee: bookingServiceFee.toString()
                          });
                          
                          
                          // Navigate to booking checkout with the selected data
                          setLocation(`/locations/${id}/booking-checkout?${bookingParams.toString()}`);
                        }}
                      >
                        Reserve
                      </Button>
                    )}
                    {isOwner && (
                      <div className="w-full p-3 bg-muted rounded-md text-center">
                        <p className="text-sm text-muted-foreground">This is your listing</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Show warning if booking below 8 hours */}
                  {selectedDate && hours > 0 && hours < 8 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-3">
                      <p className="text-xs text-yellow-800">
                        ⚠️ The host prefers a minimum booking of 8 hours, but you can send an inquiry for {hours % 1 === 0 ? hours : hours.toFixed(1)} hour{hours > 1 ? 's' : ''} to see if they'll make an exception.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {hours > 0 
                          ? `Base rate (${hours % 1 === 0 ? hours : hours.toFixed(1)} hour${hours > 1 ? 's' : ''})`
                          : 'Select dates and times to see pricing'
                        }
                      </span>
                      <span>{hours > 0 ? `$${basePrice}` : ''}</span>
                    </div>
                    {hours > 0 && additionalFeesTotal > 0 && (
                      <div className="space-y-1">
                        {additionalFees.map((fee, index) => {
                          const amount = fee.type === 'percentage' 
                            ? (basePrice * fee.amount / 100) 
                            : fee.amount;
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground" title={fee.description}>{fee.name}</span>
                              <span>${amount.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {hours > 0 && activityFeeTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Activity fee ({activityPercentage}%)
                        </span>
                        <span>${activityFeeTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {hours > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service fee</span>
                          <span>${serviceFee}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t text-sm">
                          <span>Total</span>
                          <span>${totalPrice}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                </Card>
                
                {/* Separate Host Information Card */}
                <Card className="rounded-xl shadow-md">
                <CardContent className="p-5">
                  {/* Host information with real response metrics */}
                  <div className="flex items-center gap-3 mb-3">
                    <VerifiedAvatar
                      src={hostImage}
                      alt={hostName}
                      fallback={hostName.slice(0, 2).toUpperCase()}
                      isVerified={hostData?.identityVerificationStatus === 'verified'}
                      className="h-10 w-10"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm">Space hosted by {hostName}</h3>
                      {(responseRating || responseTime) && (
                        <div className="flex flex-col gap-1 mt-1">
                          {responseRating && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="flex items-center mr-2">
                                <Star className="h-3 w-3 text-primary fill-primary mr-1" />
                                <span className="font-medium">Response rating:</span>
                              </div>
                              <span>{responseRating}</span>
                            </div>
                          )}
                          {responseTime && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="flex items-center mr-2">
                                <Clock className="h-3 w-3 text-primary mr-1" />
                                <span className="font-medium">Response time:</span>
                              </div>
                              <span>{responseTime}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isOwner && (
                    <div className="space-y-2 w-full pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Have questions about this location?
                      </p>
                      <Button variant="outline" className="w-full" size="sm" onClick={() => setShowMessageDialog(true)}>
                        Message Host
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={`Check out ${location.title}`}
        url={window.location.href}
        text={`Check out this amazing location: `}
      />
      
      {/* Photo Gallery Dialog */}
      <PhotoGalleryDialog
        open={showGalleryDialog}
        onOpenChange={setShowGalleryDialog}
        images={images}
        initialImageIndex={galleryIndex}
        title={location.title}
      />
      

      
      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete your booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-medium">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">{hours % 1 === 0 ? hours : hours.toFixed(1)} hour{hours > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                <p className="font-medium">
                  {formatTimeDisplay(startTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Time</p>
                <p className="font-medium">
                  {formatTimeDisplay(endTime)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Group Size</p>
                <p className="font-medium">
                  {groupSize === 'small' ? 'Small Group (1-5 people)' : 
                   groupSize === 'medium' ? 'Medium Group (6-15 people)' : 
                   groupSize === 'large' ? 'Large Group (16-30 people)' :
                   'Extra Large Group (31+ people)'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base rate ({hours % 1 === 0 ? hours : hours.toFixed(1)} hours)</span>
                <span>${basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                try {
                  console.log("Prepare booking details");
                  // Add the required project details directly
                  const bookingDetails = {
                    startDate: selectedDate?.toISOString().split('T')[0] || '',
                    startTime: startTime,
                    endTime: endTime,
                    guestCount: groupSize === 'small' ? 5 : groupSize === 'medium' ? 15 : 30,
                    totalPrice: totalPrice,
                    basePrice: basePrice,
                    serviceFee: serviceFee,
                    // Include these required fields for booking-summary to bypass booking-details
                    activityType: 'event',
                    projectName: `Booking at ${data.title}`,
                    renterCompany: 'Individual Booking',
                    // Include new required fields
                    activity: '', // This will be filled in the HTML booking form
                    castAndCrew: '', // This will be filled in the HTML booking form
                    projectDescription: `Group size: ${groupSize === 'small' ? 'Small (1-5 people)' : 
                      groupSize === 'medium' ? 'Medium (6-15 people)' : 
                      groupSize === 'large' ? 'Large (16-30 people)' :
                      'Extra Large (31+ people)'}`
                  };
                  
                  console.log("Booking details (dialog):", bookingDetails);
                  
                  // STATIC HTML APPROACH: Use our static HTML page for dialog too
                  console.log("Using static HTML approach from dialog");
                  
                  // Save to localStorage as backup
                  localStorage.setItem('current_booking_data', JSON.stringify(bookingDetails));
                  console.log("Booking data saved to localStorage with key 'current_booking_data'");
                  
                  // Use React routing with URL parameters
                  const params = new URLSearchParams();
                  params.set('details', JSON.stringify(bookingDetails));
                  
                  // Navigate to our React booking details page
                  console.log("Navigating to React booking page from dialog");
                  console.log("Booking details (dialog):", bookingDetails);
                  console.log("ID (dialog):", id);
                  console.log("URL params (dialog):", params.toString());
                  console.log("Full URL (dialog):", `/locations/${id}/booking-details?${params.toString()}`);
                  
                  // Skip React routing and use direct navigation which is more reliable
                  console.log("Using direct navigation with window.location.href from dialog");
                  window.location.href = `/locations/${id}/booking-details?${params.toString()}`;
                  
                } catch (error) {
                  console.error("Error preparing booking:", error);
                  alert("There was an error preparing your booking. Please try again.");
                }
              }}
              className="w-full sm:w-auto"
            >
              Complete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Host Dialog */}
      <MessageHostDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        hostId={location.ownerId}
        hostName={hostName}
        hostImage={hostImage}
        locationId={location.id}
        locationTitle={location.title}
        interestedDate={selectedDate}
        interestedStartTime={startTime}
        interestedEndTime={endTime}
      />

      {/* Description Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>About this space</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground whitespace-pre-wrap">{location.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default EnhancedLocationDetails;