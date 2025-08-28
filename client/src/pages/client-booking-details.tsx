import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useHostMode } from "@/hooks/use-host-mode";
import { AppLayout } from "@/components/layout/app-layout";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { BookingHistory } from "@/components/bookings/booking-history";
import { MessageHostDialog } from "@/components/messages/message-host-dialog";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { Loader2, Calendar, Clock, Users, Tag, MessageSquare, AlertCircle, ArrowLeft, X, CheckCircle, Info } from "lucide-react";

export default function ClientBookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setHostMode } = useHostMode();
  const queryClient = useQueryClient();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Silently set to guest mode without toast notifications
  useEffect(() => {
    if (user) {
      // Access the internal state setter directly to avoid toast notifications
      try {
        localStorage.setItem("blocmark_host_mode", "false");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [user]);

  // Log params for debugging
  useEffect(() => {
    console.log("Params:", params);
    console.log("Booking ID from params:", bookingId);
    
    if (!bookingId || isNaN(Number(bookingId))) {
      console.error("Invalid booking ID:", bookingId);
    }
  }, [params, bookingId]);

  // Get booking data with custom error handling
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery({
    queryKey: ["/api/bookings", Number(bookingId)],
    enabled: !!bookingId && !isNaN(Number(bookingId)),
    retry: 1,
    queryFn: async ({ queryKey }) => {
      try {
        const id = queryKey[1];
        const response = await fetch(`/api/bookings/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          try {
            // Try to parse as JSON, but have fallback for parse errors
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Failed to fetch booking details');
          } catch (parseError) {
            // Handle case where response is not valid JSON
            throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`);
          }
        }
        
        // Handle potential JSON parse errors in the response
        let responseText;
        try {
          responseText = await response.text();
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Response text:", responseText ? responseText.substring(0, 100) : "No response text available");
          throw new Error(`Invalid response format: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        throw error;
      }
    }
  });

  // Get location data with custom error handling
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery({
    queryKey: ["/api/locations", booking?.locationId],
    enabled: !!booking?.locationId,
    queryFn: async ({ queryKey }) => {
      try {
        const locationId = queryKey[1];
        const response = await fetch(`/api/locations/${locationId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch location: ${response.status} ${response.statusText}`);
        }
        
        // Safely parse the JSON response
        let responseText;
        try {
          responseText = await response.text();
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error in location data:", parseError, "Response text:", responseText ? responseText.substring(0, 100) : "No response text available");
          throw new Error(`Invalid location data format: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        throw error;
      }
    }
  });

  // Get host data (the location owner) with custom error handling
  const {
    data: hostData,
    isLoading: hostLoading,
    error: hostError,
  } = useQuery({
    queryKey: ["/api/users", locationData?.ownerId],
    enabled: !!locationData?.ownerId,
    queryFn: async ({ queryKey }) => {
      try {
        const ownerId = queryKey[1];
        console.log(`Fetching host data for owner ID: ${ownerId}`);
        const response = await fetch(`/api/users/${ownerId}`);
        
        if (!response.ok) {
          console.error(`Failed host data fetch: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch host data: ${response.status} ${response.statusText}`);
        }
        
        // Safely parse the JSON response
        let responseText = '';
        try {
          responseText = await response.text();
          console.log(`Got host data response: ${responseText.substring(0, 100)}...`);
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error in host data:", parseError, "Response text:", responseText ? responseText.substring(0, 100) : "No response text available");
          throw new Error(`Invalid host data format: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } catch (error) {
        console.error("Error fetching host data:", error);
        throw error;
      }
    }
  });

  // Get booking addons with custom error handling
  const {
    data: addonsData,
    isLoading: addonsLoading,
    error: addonsError,
  } = useQuery({
    queryKey: ["/api/bookings", Number(bookingId), "addons"],
    enabled: !!bookingId && !isNaN(Number(bookingId)),
    queryFn: async ({ queryKey }) => {
      try {
        const id = queryKey[1];
        console.log(`Fetching addons for booking ID: ${id}`);
        const response = await fetch(`/api/bookings/${id}/addons`);
        
        if (!response.ok) {
          console.error(`Failed addons fetch: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch booking addons: ${response.status} ${response.statusText}`);
        }
        
        // Safely parse the JSON response
        let responseText = '';
        try {
          responseText = await response.text();
          console.log(`Got addons response: ${responseText.substring(0, 100)}...`);
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error in addons data:", parseError, "Response text:", responseText ? responseText.substring(0, 100) : "No response text available");
          // Return empty array on parse error instead of failing the whole page
          console.log("Returning empty array for addons due to parse error");
          return [];
        }
      } catch (error) {
        console.error("Error fetching booking addons:", error);
        // Return empty array on any error to prevent page from failing
        return [];
      }
    }
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        method: "PATCH",
        url: `/api/bookings/${bookingId}`,
        body: { status: "cancelled" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      setCancelDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling booking",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    },
  });

  // Navigate back to dashboard if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view booking details.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [user, toast, setLocation]);

  // Handle messaging the host
  const handleMessageHost = () => {
    if (!booking || !locationData || !hostData) return;
    setMessageDialogOpen(true);
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    setCancelDialogOpen(true);
  };

  // Handle go back
  const handleGoBack = () => {
    setLocation("/dashboard");
  };

  // Check for loading or errors
  const isLoading = bookingLoading || locationLoading || hostLoading || addonsLoading;
  const hasError = bookingError || locationError || hostError || addonsError;

  // Calculate booking duration in hours
  const getBookingDuration = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (hasError || !booking || !locationData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Booking</CardTitle>
              <CardDescription>
                We couldn't load your booking details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                <h3 className="font-medium">Error Details</h3>
                <p className="text-sm mt-1">
                  {(bookingError as Error)?.message || 
                   (locationError as Error)?.message || 
                   "Unable to retrieve booking information. This could be due to a data format issue or the booking may no longer exist."}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Booking ID: {bookingId}</p>
                {booking && <p>Location ID: {booking.locationId}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGoBack}>Back to Dashboard</Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
                <p className="text-muted-foreground">
                  At {locationData.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`px-3 py-1 text-sm ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "cancelled" || booking.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {booking.status === "payment_pending" 
                  ? "Payment Pending"
                  : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                }
              </Badge>
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={handleCancelBooking}
                      >
                        Cancel Booking
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel this {booking.status === "pending" ? "pending booking request" : "confirmed booking"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {booking.status === "payment_pending" && (
                <Button 
                  size="sm"
                  onClick={() => setLocation(`/booking-checkout?bookingId=${booking.id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Pay Now
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Booking Details (left 2/3) */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>
                    Information about your booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Message */}
                  {booking.status === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-yellow-800 font-medium">Awaiting Host Confirmation</h3>
                          <p className="text-yellow-700 text-sm mt-1">
                            Your booking request is pending approval from the host. We'll notify you once they respond.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {booking.status === "payment_pending" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-blue-800 font-medium">Payment Required</h3>
                          <p className="text-blue-700 text-sm mt-1">
                            {booking.activity?.includes("Custom offer booking") 
                              ? "This custom offer has been created and is waiting for your payment. Once paid, it will be automatically confirmed."
                              : "Your booking is awaiting payment. Please complete the payment to confirm your reservation."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {booking.status === "confirmed" && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-green-800 font-medium">Booking Confirmed</h3>
                          <p className="text-green-700 text-sm mt-1">
                            Your booking has been confirmed by the host. You're all set for your scheduled time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {booking.status === "cancelled" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <div className="flex items-start">
                        <X className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-red-800 font-medium">Booking Cancelled</h3>
                          <p className="text-red-700 text-sm mt-1">
                            This booking has been cancelled and is no longer active.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {booking.status === "rejected" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <div className="flex items-start">
                        <X className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-red-800 font-medium">Booking Rejected</h3>
                          <p className="text-red-700 text-sm mt-1">
                            Unfortunately, the host was unable to accommodate this booking request.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium">{locationData.title}</h4>
                      <p className="text-sm text-muted-foreground">{locationData.address}</p>
                      {locationData.images && locationData.images.length > 0 && (
                        <img 
                          src={locationData.images[0]} 
                          alt={locationData.title} 
                          className="w-full h-40 object-cover rounded-md mt-3"
                        />
                      )}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Date</div>
                          <div>{format(new Date(booking.startDate), "MMMM d, yyyy")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Time</div>
                          <div>
                            {format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                        <Tag className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div>{getBookingDuration()} hour{getBookingDuration() !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      {booking.guestCount && (
                        <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-sm font-medium">Guests</div>
                            <div>{booking.guestCount} people</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  {(booking.projectName || booking.activityType || booking.projectDescription) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {booking.projectName && (
                          <div className="mb-2">
                            <div className="text-sm font-medium">Project Name</div>
                            <div>{booking.projectName}</div>
                          </div>
                        )}
                        {booking.activityType && (
                          <div className="mb-2">
                            <div className="text-sm font-medium">Activity Type</div>
                            <div>{booking.activityType}</div>
                          </div>
                        )}
                        {booking.renterCompany && (
                          <div className="mb-2">
                            <div className="text-sm font-medium">Company</div>
                            <div>{booking.renterCompany}</div>
                          </div>
                        )}
                        {booking.projectDescription && (
                          <div>
                            <div className="text-sm font-medium">Description</div>
                            <div className="whitespace-pre-wrap">{booking.projectDescription}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Features */}
                  {addonsData && addonsData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Additional Features</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {addonsData.map((addon: any) => (
                            <li key={addon.id} className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{addon.name}</div>
                                <div className="text-sm text-muted-foreground">{addon.description}</div>
                              </div>
                              <div>
                                ${addon.price} {addon.priceUnit !== "flat" ? `/ ${addon.priceUnit}` : ""}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Check-in Instructions - Only show for confirmed bookings */}
                  {booking.status === "confirmed" && locationData.checkInInstructions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Check-in Instructions</h3>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm text-blue-800 whitespace-pre-wrap">{locationData.checkInInstructions}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            
            </div>
            
            {/* Right column with Host Info, Booking History, and Payment Summary */}
            <div className="space-y-6">
              {/* Host Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Host Information</CardTitle>
                  <CardDescription>
                    Details about the host of this location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hostData ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {hostData.profileImage ? (
                            <img 
                              src={hostData.profileImage} 
                              alt={hostData.username} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary">
                              {hostData.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{hostData.username}</h3>
                          <p className="text-muted-foreground text-sm">Host</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Button 
                          onClick={handleMessageHost}
                          className="flex items-center gap-2 w-full"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Host
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Info className="h-12 w-12 mx-auto mb-2 text-muted" />
                      <p>Host information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking History Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>
                    View the history of changes to this booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingHistory bookingId={Number(bookingId)} />
                </CardContent>
              </Card>

              {/* Payment Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>
                    Details of your payment for this booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base price</span>
                      <span>${locationData.price} / hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>{getBookingDuration()} hour{getBookingDuration() !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${locationData.price * getBookingDuration()}</span>
                    </div>
                    
                    {/* Add-ons section */}
                    {addonsData && addonsData.length > 0 && (
                      <>
                        <Separator className="my-2" />
                        <div>
                          <h4 className="font-medium mb-2">Add-ons</h4>
                          <div className="space-y-1 text-sm">
                            {addonsData.map((addon: any) => (
                              <div key={addon.id} className="flex justify-between">
                                <span>{addon.name}</span>
                                <span>${addon.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(booking.totalPrice / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-4 text-sm">
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span>Paid on</span>
                      <span>{booking.createdAt ? format(new Date(booking.createdAt), "MMMM d, yyyy") : "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : 
                                booking.status === "pending" ? "outline" : 
                                "destructive"}
                        className="capitalize"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Message Host Dialog */}
      {hostData && locationData && (
        <MessageHostDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          hostId={hostData.id}
          hostName={hostData.username}
          hostImage={hostData.profileImage}
          locationId={locationData.id}
          locationTitle={locationData.title}
        />
      )}

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {booking?.status === "confirmed" ? (
                <div className="space-y-2">
                  <p>Are you sure you want to cancel this confirmed booking?</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-amber-800">
                        <p className="font-medium">Important Notice:</p>
                        <p className="mt-1">Cancelling a confirmed booking may be subject to the host's cancellation policy. You may be charged a cancellation fee or forfeit your deposit.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
              ) : (
                "Are you sure you want to cancel this booking? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingMutation.mutate()}
              className="bg-red-500 hover:bg-red-600"
            >
              {cancelBookingMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}