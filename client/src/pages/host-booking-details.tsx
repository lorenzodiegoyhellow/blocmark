import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useHostMode } from "@/hooks/use-host-mode";
import { Booking, Location, User, Addon } from "@shared/schema";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Clock, User as UserIcon, MessageSquare, Edit, CreditCard, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";
import { BookingHistory } from "@/components/bookings/booking-history";
import { format } from "date-fns";
import { formatUsername } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export default function HostBookingDetailsPage() {
  const params = useParams<{ id: string }>();
  // Extract the booking ID from the URL path parameters and ensure it's a valid number
  const bookingId = params.id;
  
  useEffect(() => {
    console.log("Params:", params);
    console.log("Booking ID from params:", bookingId);
    
    // Check if we have a valid booking ID
    if (!bookingId || isNaN(Number(bookingId))) {
      console.error("Invalid booking ID:", bookingId);
    }
  }, [params, bookingId]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isHostMode, setHostMode } = useHostMode();
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState("history"); // Set default to history tab for testing
  
  // Force host mode on for this page
  useEffect(() => {
    if (!isHostMode) {
      console.log("Forcing host mode on for booking details page");
      setHostMode(true);
    }
  }, [isHostMode, setHostMode]);

  // Ensure authentication
  useEffect(() => {
    if (user) {
      setHostMode(true, user.roles.includes("owner"), true, true);
    }
  }, [setHostMode, user]);

  // Get wouter navigation hook
  const [, setLocation] = useLocation();
  
  // Fetch booking details with additional debugging and authentication awareness
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery({
    queryKey: ["/api/bookings", Number(bookingId)],
    enabled: !!bookingId && !!user, // Only fetch if user is authenticated
    refetchOnWindowFocus: false, // Disable automatic refetching to prevent issues
    refetchOnMount: true, // Re-fetch when component mounts
    retry: 1, // Retry failed requests once
    queryFn: async ({ queryKey }) => {
      const [endpoint, id] = queryKey;
      console.log(`Authenticated fetching: ${endpoint}/${id}, User:`, user);
      
      if (!user || !user.id) {
        console.error("No authenticated user found or user ID missing");
        toast({
          title: "Authentication required",
          description: "You need to log in to view booking details.",
          variant: "destructive",
        });
        setLocation("/auth");
        throw new Error("Authentication required");
      }
      
      try {
        console.log(`Making authenticated request to ${endpoint}/${id}`);
        const res = await fetch(`${endpoint}/${id}`, {
          credentials: "include", // Include cookies for authentication
          headers: {
            "Accept": "application/json"
          }
        });
        
        console.log(`Booking API response status: ${res.status}`);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.error("401 Unauthorized response from booking API");
            toast({
              title: "Authentication required",
              description: "You need to log in to view booking details.",
              variant: "destructive",
            });
            setLocation("/auth");
            throw new Error("Authentication required");
          } else if (res.status === 403) {
            console.error("403 Forbidden response from booking API");
            toast({
              title: "Access denied",
              description: "You don't have permission to view this booking.",
              variant: "destructive",
            });
            setLocation("/dashboard");
            throw new Error("Access denied");
          } else if (res.status === 404) {
            console.error("404 Not Found response from booking API");
            toast({
              title: "Booking not found",
              description: "The requested booking could not be found.",
              variant: "destructive",
            });
            setLocation("/dashboard");
            throw new Error("Booking not found");
          }
          
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        
        const bookingData = await res.json();
        console.log("Booking data received:", bookingData);
        
        // Validate booking data
        if (!bookingData || !bookingData.id || !bookingData.locationId) {
          console.error("Invalid booking data received:", bookingData);
          throw new Error("Invalid booking data");
        }
        
        return bookingData;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Fetch location details with custom query function
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery({
    queryKey: ["/api/locations", booking?.locationId],
    enabled: !!booking?.locationId && !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async ({ queryKey }) => {
      const [endpoint, id] = queryKey;
      console.log(`Fetching location: ${endpoint}/${id}`);
      
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            toast({
              title: "Authentication required",
              description: "You need to log in to view location details.",
              variant: "destructive",
            });
            throw new Error("Authentication required");
          } else if (res.status === 403) {
            toast({
              title: "Access denied",
              description: "You don't have permission to view this location.",
              variant: "destructive",
            });
            throw new Error("Access denied");
          }
          
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        
        return res.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Fetch client details with custom query function
  const {
    data: clientData,
    isLoading: clientLoading,
    error: clientError,
  } = useQuery({
    queryKey: ["/api/users", booking?.clientId],
    enabled: !!booking?.clientId && !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async ({ queryKey }) => {
      const [endpoint, id] = queryKey;
      console.log(`Fetching client: ${endpoint}/${id}`);
      
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            toast({
              title: "Authentication required",
              description: "You need to log in to view client details.",
              variant: "destructive",
            });
            throw new Error("Authentication required");
          } else if (res.status === 403) {
            toast({
              title: "Access denied",
              description: "You don't have permission to view this client's details.",
              variant: "destructive",
            });
            throw new Error("Access denied");
          }
          
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        
        return res.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });
  
  // Fetch booking addons with custom query function
  const {
    data: addonsData,
    isLoading: addonsLoading,
    error: addonsError,
  } = useQuery({
    queryKey: ["/api/bookings", Number(bookingId), "addons"],
    enabled: !!bookingId && !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async ({ queryKey }) => {
      const [endpoint, id, subpath] = queryKey;
      console.log(`Fetching addons: ${endpoint}/${id}/${subpath}`);
      
      try {
        const res = await fetch(`${endpoint}/${id}/${subpath}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            toast({
              title: "Authentication required",
              description: "You need to log in to view booking addons.",
              variant: "destructive",
            });
            throw new Error("Authentication required");
          } else if (res.status === 403) {
            toast({
              title: "Access denied",
              description: "You don't have permission to view these booking addons.",
              variant: "destructive",
            });
            throw new Error("Access denied");
          }
          
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        
        return res.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  const updateBookingStatus = useMutation({
    mutationFn: async (status: "confirmed" | "rejected" | "cancelled") => {
      return apiRequest(
        "PATCH",
        `/api/bookings/${bookingId}`,
        { status }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating booking",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Navigate back to dashboard if not in host mode or not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view booking details.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    if (!user?.roles?.includes("owner")) {
      toast({
        title: "Access denied",
        description: "You need to be a host to view booking details.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [user, toast, setLocation]);

  const handleMessageClient = () => {
    if (!booking || !clientData) return;

    // Navigate to the messages page with the appropriate query parameters
    setLocation(`/messages?otherUserId=${booking.clientId}&locationId=${booking.locationId}`);
    // Using setLocation from wouter handles query parameters properly
  };

  const handleViewClientProfile = () => {
    if (!clientData) return;
    // Navigate to the user profile (you may need to create this page)
    setLocation(`/user/${booking?.clientId}`);
  };

  const isLoading = bookingLoading || locationLoading || clientLoading || addonsLoading;
  const hasError = bookingError || locationError || clientError || addonsError;

  // Calculate booking duration in hours
  const getBookingDuration = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  // Calculate payout amount (90% of total price)
  const getPayoutAmount = () => {
    if (!booking) return 0;
    return booking.totalPrice * 0.9; // Assuming 10% service fee
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading Booking Details</span>
              </CardTitle>
              <CardDescription>
                Please wait while we fetch the booking information...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {bookingLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-200 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Loading booking information</span>
                </div>
              )}
              {locationLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-200 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Loading location details</span>
                </div>
              )}
              {clientLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-200 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Loading client information</span>
                </div>
              )}
              {addonsLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-200 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Loading booking add-ons</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (hasError || !booking || !locationData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription className="flex flex-col space-y-2">
                <span className="text-red-500 font-medium">
                  {bookingError ? 
                    (bookingError as Error).message : 
                    "Could not load booking details."}
                </span>
                {locationError && (
                  <span className="text-sm text-muted-foreground">
                    Location error: {(locationError as Error).message}
                  </span>
                )}
                {clientError && (
                  <span className="text-sm text-muted-foreground">
                    Client error: {(clientError as Error).message}
                  </span>
                )}
                {addonsError && (
                  <span className="text-sm text-muted-foreground">
                    Add-ons error: {(addonsError as Error).message}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId)] });
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId), "addons"] });
                  if (booking?.locationId) {
                    queryClient.invalidateQueries({ queryKey: ["/api/locations", booking.locationId] });
                  }
                  if (booking?.clientId) {
                    queryClient.invalidateQueries({ queryKey: ["/api/users", booking.clientId] });
                  }
                }}
                className="w-full sm:w-auto"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
                className="w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Wrap render in error boundary
  try {
    console.log("Rendering booking details with data:", {
      booking,
      locationData,
      clientData,
      addonsData,
      booking_types: typeof booking.projectName,
      booking_keys: Object.keys(booking)
    });
    
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col gap-6">
            {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
              <p className="text-muted-foreground">
                For {locationData.title}
              </p>
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
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => {
                  console.log("Edit button clicked, setting showEditForm to true");
                  setShowEditForm(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Button>
              <Button variant="outline" size="sm" onClick={handleMessageClient}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side - Booking Details */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="details">Booking Details</TabsTrigger>
                      <TabsTrigger value="payment">Payment & Payout</TabsTrigger>
                      <TabsTrigger value="history">Edit History</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {/* Debug information */}
                  <div className="text-xs text-muted-foreground mt-2">
                    Active Tab: {activeTab} | Booking ID: {bookingId}
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="details" className="space-y-6 mt-0">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Date</h3>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.startDate), "EEEE, MMMM do, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Time</h3>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.startDate), "h:mm a")} - 
                            {format(new Date(booking.endDate), "h:mm a")} 
                            ({getBookingDuration()} hours)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Project Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Project Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Activity Type</h4>
                          <p className="text-muted-foreground">
                            {typeof booking.activityType !== 'undefined' ? booking.activityType : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Project Name</h4>
                          <p className="text-muted-foreground">
                            {typeof booking.projectName !== 'undefined' ? booking.projectName : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Renter/Company</h4>
                          <p className="text-muted-foreground">
                            {typeof booking.renterCompany !== 'undefined' ? booking.renterCompany : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Guests</h4>
                          <p className="text-muted-foreground">
                            {typeof booking.guestCount !== 'undefined' ? booking.guestCount : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Project Description */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Project Description</h3>
                      <p className="text-muted-foreground">
                        {typeof booking.projectDescription !== 'undefined' ? 
                          booking.projectDescription : "No description provided"}
                      </p>
                    </div>

                    <Separator />
                    
                    {/* Addons Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Requested Add-ons</h3>
                      {addonsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                          <span>Loading add-ons...</span>
                        </div>
                      ) : addonsError ? (
                        <div className="text-red-500">
                          Error loading add-ons: {(addonsError as Error).message}
                        </div>
                      ) : addonsData?.length === 0 ? (
                        <p className="text-muted-foreground">No add-ons requested for this booking</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addonsData?.map((addon: { id: number; name: string; description: string; price: number; priceUnit: string }) => (
                            <div key={addon.id} className="border rounded-md p-3 flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{addon.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {addon.description}
                                </p>
                              </div>
                              <div className="font-medium text-right">
                                ${(addon.price / 100).toFixed(2)}
                                <span className="text-xs text-muted-foreground block">
                                  per {addon.priceUnit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      {/* Edit Button - Always visible regardless of booking status */}
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={() => {
                          console.log("Edit button clicked in booking details tab");
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Booking Details
                      </Button>

                      {/* Accept/Decline buttons only visible for pending bookings */}
                      {booking.status === "pending" && (
                        <>
                          <Button 
                            className="w-full" 
                            onClick={() => updateBookingStatus.mutate("confirmed")}
                            disabled={updateBookingStatus.isPending}
                          >
                            {updateBookingStatus.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Accept Booking
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => updateBookingStatus.mutate("rejected")}
                            disabled={updateBookingStatus.isPending}
                          >
                            {updateBookingStatus.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Decline Booking
                          </Button>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Payment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Total Price</h4>
                          <p className="text-xl font-semibold">${(booking.totalPrice / 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Paid by client</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Your Payout</h4>
                          <p className="text-xl font-semibold">${(getPayoutAmount() / 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">After service fee</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Service Fee</h4>
                          <p className="text-muted-foreground">${((booking.totalPrice * 0.1) / 100).toFixed(2)} (10%)</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Payment Status</h4>
                          <Badge
                            className={`px-2 py-1 text-xs ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status === "confirmed" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Payout Information</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          Payouts for confirmed bookings are processed within 24 hours after the booking end time. Funds typically appear in your bank account within 5-7 business days.
                        </p>
                      </div>
                      {booking.status === "confirmed" && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-green-800 font-medium">Payout has been initiated</p>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Expected deposit by {format(new Date(new Date(booking.endDate).getTime() + 7 * 24 * 60 * 60 * 1000), "MMMM do, yyyy")}
                          </p>
                        </div>
                      )}
                      
                      {/* Edit button for the payment tab */}
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
                        onClick={() => {
                          console.log("Edit button clicked in payment tab");
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Booking & Adjust Payment
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg flex items-center">
                          <Edit className="h-5 w-5 mr-2 text-muted-foreground" />
                          Booking Edit History
                        </h3>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log(`Manually refreshing history for booking ${bookingId}`);
                            queryClient.invalidateQueries({ 
                              queryKey: [`/api/bookings/${bookingId}/history`] 
                            });
                            
                            // Direct fetch for debugging
                            console.log(`Making direct fetch to /api/bookings/${bookingId}/history`);
                            fetch(`/api/bookings/${bookingId}/history`, {
                              credentials: 'include'
                            })
                              .then(res => {
                                console.log(`History refresh status: ${res.status}`);
                                return res.json();
                              })
                              .then(data => {
                                console.log(`Refreshed history data:`, data);
                              })
                              .catch(err => {
                                console.error(`Error refreshing history:`, err);
                              });
                            
                            toast({
                              title: "History refreshed",
                              description: "The edit history has been refreshed.",
                            });
                          }}
                        >
                          Refresh
                        </Button>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          This tab shows all changes made to this booking. Each edit records the previous and updated values, reason for the change, and whether the client was notified.
                        </p>
                      </div>
                      
                      {/* Booking ID Debug */}
                      <div className="text-xs text-muted-foreground mb-4">
                        Current Booking ID: {bookingId} (type: {typeof bookingId})
                      </div>
                      
                      {/* Booking History Component */}
                      <div className="border border-dashed border-gray-200 p-4 rounded-lg">
                        <BookingHistory bookingId={Number(bookingId)} />
                      </div>

                      {/* Edit button for the history tab */}
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
                        onClick={() => {
                          console.log("Edit button clicked in history tab");
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Make New Edit to This Booking
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Client Information */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={clientData?.profileImage || ""} 
                        alt={clientData?.username || "Client"} 
                      />
                      <AvatarFallback>
                        {clientData?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{formatUsername(clientData?.username || "")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Member since {format(
                          new Date(), // Use current date as we don't have user creation date
                          "MMMM yyyy"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleViewClientProfile}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleMessageClient}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Client
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{locationData.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {locationData.address}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation(`/locations/${locationData.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Location
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Booking Dialog */}
      <BookingEditForm
        booking={booking}
        isOpen={showEditForm}
        onClose={() => {
          console.log("onClose called from HostBookingDetailsPage");
          setShowEditForm(false);
        }}
      />
    </AppLayout>
  );
  } catch (error) {
    console.error("Render error:", error);
    
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Error Rendering Booking Details</CardTitle>
              <CardDescription>
                An error occurred while trying to display the booking details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                <h3 className="font-medium">Error Details</h3>
                <p className="text-sm mt-1">{(error as Error).message || "Unknown error"}</p>
                <pre className="text-xs bg-red-100 p-2 mt-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(booking, null, 2)}
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId)] });
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings", Number(bookingId), "addons"] });
                  if (booking?.locationId) {
                    queryClient.invalidateQueries({ queryKey: ["/api/locations", booking.locationId] });
                  }
                  if (booking?.clientId) {
                    queryClient.invalidateQueries({ queryKey: ["/api/users", booking.clientId] });
                  }
                }}
                className="w-full sm:w-auto"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
                className="w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
}