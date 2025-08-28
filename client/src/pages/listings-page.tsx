import { useQuery, useMutation } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { PaginatedData } from "@/components/ui/data-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Calendar, Edit, Trash2, Plus, DollarSign, Image, Zap, Video, Car } from "lucide-react";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { LocationEditForm } from "@/components/location/location-edit-form";
import { PriceEditForm } from "@/components/location/price-edit-form";
import { PhotoEditForm } from "@/components/location/photo-edit-form";
import { AvailabilityDialog } from "@/components/location/availability-dialog";
import { AddonDialog } from "@/components/location/addon-dialog";
import { BookingOptionsDialog } from "@/components/location/booking-options-dialog";
import { AccessibilityEditForm } from "@/components/location/accessibility-edit-form";

export default function ListingsPage() {
  const { user } = useAuth();
  const { isHostMode } = useHostMode();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [priceEditLocation, setPriceEditLocation] = useState<Location | null>(null);
  const [photoEditLocation, setPhotoEditLocation] = useState<Location | null>(null);
  const [availabilityLocation, setAvailabilityLocation] = useState<Location | null>(null);
  const [addonLocation, setAddonLocation] = useState<Location | null>(null);
  const [bookingOptionsLocation, setBookingOptionsLocation] = useState<Location | null>(null);
  const [accessibilityLocation, setAccessibilityLocation] = useState<Location | null>(null);

  const { data: locationsData, isLoading, error } = useQuery<PaginatedData<Location>>({
    queryKey: [`/api/locations/owner/${user?.id}`],
    enabled: !!user && isHostMode,
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: true,
  });
  
  // Extract the locations array from paginated data
  const locations = locationsData?.data || [];

  // Handle Google Calendar OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const locationId = params.get('locationId');
    
    if (success === 'calendar_connected') {
      toast({
        title: "Success",
        description: "Google Calendar connected successfully. Your calendar events will now sync with your availability.",
      });
      
      // Open the availability dialog for the location
      if (locationId) {
        const location = locations?.find(l => l.id === parseInt(locationId));
        if (location) {
          setAvailabilityLocation(location);
        }
      }
      
      // Clean up URL
      window.history.replaceState({}, '', '/listings');
    } else if (error === 'calendar_connection_failed') {
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, '', '/listings');
    }
  }, [toast, locations]);

  const deleteMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await apiRequest({
        url: `/api/locations/${locationId}`,
        method: "DELETE"
      });
      return locationId;
    },
    onSuccess: (deletedLocationId) => {
      queryClient.setQueryData<Location[]>(
        [`/api/locations/owner/${user?.id}`],
        (oldData) => oldData?.filter((location) => location.id !== deletedLocationId) ?? []
      );
      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (locationId: number) => {
    try {
      await deleteMutation.mutateAsync(locationId);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleEditClose = () => {
    setSelectedLocation(null);
  };

  const handlePriceEdit = (location: Location) => {
    setPriceEditLocation(location);
  };

  const handlePriceEditClose = () => {
    setPriceEditLocation(null);
  };

  const handlePhotoEdit = (location: Location) => {
    setPhotoEditLocation(location);
  };

  const handlePhotoEditClose = () => {
    setPhotoEditLocation(null);
  };
  
  const handleAvailabilityEdit = (location: Location) => {
    setAvailabilityLocation(location);
  };
  
  const handleAvailabilityClose = () => {
    setAvailabilityLocation(null);
  };
  
  const handleAddonEdit = (location: Location) => {
    setAddonLocation(location);
  };
  
  const handleAddonClose = () => {
    setAddonLocation(null);
  };
  
  const handleBookingOptionsEdit = (location: Location) => {
    setBookingOptionsLocation(location);
  };
  
  const handleBookingOptionsClose = () => {
    setBookingOptionsLocation(null);
  };
  
  const handleAccessibilityEdit = (location: Location) => {
    setAccessibilityLocation(location);
  };
  
  const handleAccessibilityClose = () => {
    setAccessibilityLocation(null);
  };

  if (!user || !isHostMode) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need to be in host mode to view this page.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Failed to load listings. Please try again.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Listings</h1>
                <p className="text-muted-foreground">
                  Manage your properties and availability
                </p>
              </div>
              {locations && locations.length > 0 && (
                <Link href="/add-listing">
                  <Button className="bg-white text-primary border border-primary hover:bg-gray-50">Add New Property</Button>
                </Link>
              )}
            </div>

            <div className="grid gap-6">
              {locations?.map((location) => {
                console.log(`Location ${location.id} (${location.title}) videos:`, location.videos);
                return (
                  <Card key={location.id} className="bg-white border border-gray-100 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Image preview - bigger size and clickable */}
                        <Link href={`/locations/${location.id}`}>
                          <div className="h-24 w-32 rounded-md overflow-hidden flex-shrink-0 bg-muted cursor-pointer">
                            {location.images && location.images.length > 0 ? (
                              <img 
                                src={location.images[0]} 
                                alt={location.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <CardTitle>{location.title}</CardTitle>
                            
                            {/* Status badge */}
                            {location.status !== "approved" && (
                              <div className={`rounded-full px-2 py-1 text-xs text-white ${
                                location.status === "pending" 
                                  ? "bg-orange-500" 
                                  : location.status === "rejected" 
                                    ? "bg-red-500" 
                                    : "bg-blue-500"
                              }`}>
                                {location.status === "pending" 
                                  ? "Pending Approval" 
                                  : location.status === "rejected" 
                                    ? "Rejected" 
                                    : location.status
                                }
                              </div>
                            )}
                          </div>
                          
                          {/* Address now under the title */}
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{location.address.split(",").slice(-3, -1).join(", ")}</span>
                          </div>
                          
                          {/* Status message when rejected */}
                          {location.status === "rejected" && location.statusReason && (
                            <div className="mt-2 text-sm text-red-500">
                              Reason: {location.statusReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Manage Add-ons"
                          onClick={() => handleAddonEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Booking Options"
                          onClick={() => handleBookingOptionsEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Photos"
                          onClick={() => handlePhotoEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Accessibility"
                          onClick={() => handleAccessibilityEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <Car className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Price"
                          onClick={() => handlePriceEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Details"
                          onClick={() => handleEdit(location)}
                          className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-200">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Location</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{location.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(location.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => handleAvailabilityEdit(location)}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Manage Availability</span>
                        </Button>
                        <ViewDetailsButton 
                          locationId={location.id}
                          variant="outline"
                          asLink={true}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}

              {(!locations || locations.length === 0) && (
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 mb-4">
                      You haven't listed any properties yet
                    </p>
                    <Link href="/add-listing">
                      <Button className="bg-white text-primary border border-primary hover:bg-gray-50">Add Your First Property</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {selectedLocation && (
          <LocationEditForm
            location={selectedLocation}
            isOpen={true}
            onClose={handleEditClose}
          />
        )}

        {priceEditLocation && (
          <PriceEditForm
            location={priceEditLocation}
            isOpen={true}
            onClose={handlePriceEditClose}
          />
        )}
        {photoEditLocation && (
          <PhotoEditForm
            location={photoEditLocation}
            isOpen={true}
            onClose={handlePhotoEditClose}
          />
        )}
        
        {availabilityLocation && (
          <AvailabilityDialog
            location={availabilityLocation}
            isOpen={true}
            onClose={handleAvailabilityClose}
          />
        )}
        
        {addonLocation && (
          <AddonDialog
            locationId={addonLocation.id}
            isOpen={true}
            onClose={handleAddonClose}
          />
        )}
        
        {bookingOptionsLocation && (
          <BookingOptionsDialog
            location={bookingOptionsLocation}
            isOpen={true}
            onClose={handleBookingOptionsClose}
          />
        )}
        
        {accessibilityLocation && (
          <AccessibilityEditForm
            location={accessibilityLocation}
            isOpen={true}
            onClose={handleAccessibilityClose}
          />
        )}
      </div>
    </AppLayout>
  );
}