import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useHostMode } from "@/hooks/use-host-mode";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Calendar, Clock, User as UserIcon, MessageSquare, 
  Edit, CheckCircle, XCircle, ExternalLink 
} from "lucide-react";
import { format } from "date-fns";
import { formatUsername } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BookingHistory } from "@/components/bookings/booking-history";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";

// Define types based on database schema
export type Booking = {
  id: number;
  locationId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "payment_pending";
  // Optional fields
  activityType?: string | null;
  projectName?: string | null;
  renterCompany?: string | null;
  projectDescription?: string | null;
  guestCount?: number | null;
  paymentId?: string | null;
};

type Location = {
  id: number;
  ownerId: number;
  title: string;
  address: string;
  description: string;
  price: number;
  images: string[];
};

type User = {
  id: number;
  username: string;
  profileImage: string | null;
  roles: string[];
};

type Addon = {
  id: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
};

export default function HostBookingDetailsNew() {
  // Get params and state
  const { id: bookingId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setHostMode } = useHostMode();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [showEditForm, setShowEditForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"upcoming" | "pending" | "completed" | "canceled">("upcoming");

  // Set host mode on page load
  useEffect(() => {
    if (user && user.roles) {
      setHostMode(true, user.roles.includes("owner"), true, true);
    }
  }, [setHostMode, user]);

  // Fetch booking details
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery<Booking>({
    queryKey: ["/api/bookings", Number(bookingId)],
    enabled: !!bookingId && !!user,
    refetchOnWindowFocus: false,
    queryFn: async ({ queryKey }) => {
      const [endpoint, id] = queryKey;
      console.log(`Fetching booking: ${endpoint}/${id}`);
      
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Server error: ${res.status}`);
        }
        
        const text = await res.text();
        try {
          // First try to parse as JSON
          return JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Raw text:", text);
          throw new Error("Failed to parse booking data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Fetch location details
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery<Location>({
    queryKey: ["/api/locations", booking?.locationId],
    enabled: !!booking?.locationId && !!user,
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
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Server error: ${res.status}`);
        }
        
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Raw text:", text);
          throw new Error("Failed to parse location data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Fetch client details
  const {
    data: clientData,
    isLoading: clientLoading,
    error: clientError,
  } = useQuery<User>({
    queryKey: ["/api/users", booking?.clientId],
    enabled: !!booking?.clientId && !!user,
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
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Server error: ${res.status}`);
        }
        
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Raw text:", text);
          throw new Error("Failed to parse user data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Fetch booking addons
  const {
    data: addonsData,
    isLoading: addonsLoading,
    error: addonsError,
  } = useQuery<Addon[]>({
    queryKey: ["/api/bookings", Number(bookingId), "addons"],
    enabled: !!bookingId && !!user,
    queryFn: async ({ queryKey }) => {
      const [endpoint, id, subResource] = queryKey;
      console.log(`Fetching addons: ${endpoint}/${id}/${subResource}`);
      
      try {
        const res = await fetch(`${endpoint}/${id}/${subResource}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Server error: ${res.status}`);
        }
        
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Raw text:", text);
          throw new Error("Failed to parse addon data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }
  });

  // Update booking status mutation
  const updateBookingStatus = useMutation({
    mutationFn: async (status: "confirmed" | "rejected" | "cancelled") => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ status })
        });
          
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`Failed to update booking: ${res.status}`);
        }
        
        const text = await res.text();
        try {
          // Handle empty response
          if (!text.trim()) return { success: true };
          // Try to parse as JSON
          return JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError, "Raw text:", text);
          // If it's not valid JSON but request was successful, return a success object
          return { success: true };
        }
      } catch (error) {
        console.error("Update error:", error);
        throw error;
      }
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
      console.error("Mutation error:", error);
      toast({
        title: "Error updating booking",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated or not a host
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

  // Handle message client
  const handleMessageClient = () => {
    if (!booking || !clientData) return;
    setLocation(`/messages?otherUserId=${booking.clientId}&locationId=${booking.locationId}`);
  };

  // Handle view client profile
  const handleViewClientProfile = () => {
    if (!clientData) return;
    setLocation(`/user/${booking?.clientId}`);
  };

  // Check for loading or errors
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

  // Show loading UI
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

  // Show error UI
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

  // Show booking details
  // Let's prepare the host bookings for each status filter
  // Fetch all bookings for this host
  const {
    data: hostBookings,
    isLoading: hostBookingsLoading
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/host"],
    enabled: !!user?.roles?.includes("owner"),
  });

  // Process bookings by status
  const pendingBookings = hostBookings?.filter(booking => booking.status === "pending") || [];
  const upcomingBookings = hostBookings?.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) > new Date()
  ) || [];
  const completedBookings = hostBookings?.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) <= new Date()
  ) || [];
  const canceledBookings = hostBookings?.filter(booking => 
    booking.status === "cancelled" || booking.status === "rejected"
  ) || [];
  
  // Navigate to another booking when clicking on a status tab
  useEffect(() => {
    // If no bookings or we're loading, don't navigate
    if (hostBookingsLoading || !hostBookings || hostBookings.length === 0) {
      return;
    }
    
    // Get the current booking
    const currentBooking = hostBookings.find(b => b.id === Number(bookingId));
    
    // If the current booking is already in the selected status filter, keep showing it
    if (
      (statusFilter === "upcoming" && currentBooking?.status === "confirmed" && new Date(currentBooking.endDate) > new Date()) ||
      (statusFilter === "pending" && currentBooking?.status === "pending") ||
      (statusFilter === "completed" && currentBooking?.status === "confirmed" && new Date(currentBooking.endDate) <= new Date()) ||
      (statusFilter === "canceled" && (currentBooking?.status === "cancelled" || currentBooking?.status === "rejected"))
    ) {
      return;
    }
    
    // Otherwise, navigate to the first booking in the selected filter
    let bookingsToShow: Booking[] = [];
    switch (statusFilter) {
      case "upcoming":
        bookingsToShow = upcomingBookings;
        break;
      case "pending":
        bookingsToShow = pendingBookings;
        break;
      case "completed":
        bookingsToShow = completedBookings;
        break;
      case "canceled":
        bookingsToShow = canceledBookings;
        break;
    }
    
    // If there are bookings in this filter, navigate to the first one
    if (bookingsToShow.length > 0) {
      setLocation(`/host/bookings/${bookingsToShow[0].id}`);
    }
  }, [statusFilter, hostBookings, bookingId, hostBookingsLoading, pendingBookings, upcomingBookings, completedBookings, canceledBookings, setLocation]);

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          {/* Booking Status Tabs exactly as shown in screenshot */}
          <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden mb-4">
            <div className="flex bg-gray-50 rounded-lg">
              <button 
                onClick={() => setStatusFilter("upcoming")}
                className={`py-4 px-6 text-gray-700 font-medium flex-1 transition-colors ${
                  statusFilter === "upcoming" 
                    ? "bg-white shadow-sm" 
                    : "hover:bg-gray-100"
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setStatusFilter("pending")}
                className={`py-4 px-6 text-gray-700 font-medium flex-1 transition-colors relative ${
                  statusFilter === "pending" 
                    ? "bg-white shadow-sm" 
                    : "hover:bg-gray-100"
                }`}
              >
                Pending
                {pendingBookings.length > 0 && (
                  <span className="absolute top-3 right-4 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    {pendingBookings.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setStatusFilter("completed")}
                className={`py-4 px-6 text-gray-700 font-medium flex-1 transition-colors ${
                  statusFilter === "completed" 
                    ? "bg-white shadow-sm" 
                    : "hover:bg-gray-100"
                }`}
              >
                Completed
              </button>
              <button 
                onClick={() => setStatusFilter("canceled")}
                className={`py-4 px-6 text-gray-700 font-medium flex-1 transition-colors ${
                  statusFilter === "canceled" 
                    ? "bg-white shadow-sm" 
                    : "hover:bg-gray-100"
                }`}
              >
                Canceled
              </button>
            </div>
          </div>

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
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setLocation(`/locations/${locationData.id}`);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Location
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMessageClient}
              >
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
                            {booking.activityType || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Project Name</h4>
                          <p className="text-muted-foreground">
                            {booking.projectName || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Renter/Company</h4>
                          <p className="text-muted-foreground">
                            {booking.renterCompany || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Guests</h4>
                          <p className="text-muted-foreground">
                            {booking.guestCount || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Project Description */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Project Description</h3>
                      <p className="text-muted-foreground">
                        {booking.projectDescription || "No description provided"}
                      </p>
                    </div>

                    <Separator />
                    
                    {/* Addons Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Requested Add-ons</h3>
                      {addonsData && addonsData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addonsData.map((addon) => (
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
                      ) : (
                        <p className="text-muted-foreground">No add-ons requested for this booking</p>
                      )}
                    </div>

                    {/* Actions */}
                    {booking.status === "pending" && (
                      <div className="flex gap-3 mt-6">
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
                      </div>
                    )}
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
                          setActiveTab("history");
                          toast({
                            title: "Edit mode activated",
                            description: "You can now modify the booking details.",
                          });
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

        {/* Booking Edit Form Dialog */}
        {booking && showEditForm && (
          <BookingEditForm 
            booking={booking}
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              // Refresh booking history when edit form is closed
              queryClient.invalidateQueries({ 
                queryKey: [`/api/bookings/${bookingId}/history`] 
              });
              toast({
                title: "Edit form closed",
                description: "Booking history has been refreshed with any changes.",
              });
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}