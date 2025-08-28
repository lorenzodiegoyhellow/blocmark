import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Location, Booking } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Loader2, 
  Calendar, 
  DollarSign, 
  Pencil, 
  BarChart2, 
  Check, 
  X, 
  PieChart, 
  Info, 
  User,
  Home,
  AlertTriangle,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { BookingStatusTabs, BookingStatusFilter, filterBookingsByStatus } from "@/components/bookings/booking-status-tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { isHostMode } = useHostMode();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [clientStatusFilter, setClientStatusFilter] = useState<BookingStatusFilter>("all");
  const [hostStatusFilter, setHostStatusFilter] = useState<BookingStatusFilter>("all");
  const [, navigate] = useLocation();
  
  // Pagination state - separate for each tab/status combination
  const [clientPagination, setClientPagination] = useState<Record<BookingStatusFilter, number>>({
    all: 1,
    upcoming: 1,
    pending: 1,
    completed: 1,
    canceled: 1
  });
  
  const [hostPagination, setHostPagination] = useState<Record<BookingStatusFilter, number>>({
    all: 1,
    upcoming: 1,
    pending: 1,
    completed: 1,
    canceled: 1
  });
  
  const ITEMS_PER_PAGE = 12;
  
  // First, fetch locations owned by this user to determine if they can be in host mode
  const { 
    data: userOwnedLocations,
    isLoading: ownedLocationsLoading
  } = useQuery<Location[]>({
    queryKey: ["/api/locations/owner"],
    enabled: !!user?.id && user?.roles?.includes("owner"),
  });
  
  // Only allow host mode if user actually has locations
  const canBeHost = !!userOwnedLocations && userOwnedLocations.length > 0;
  
  // Use isHostMode directly to determine the active tab, but only if the user can be a host
  const activeTab = (isHostMode && canBeHost) ? "host" : "client";
  
  // Debug log to help troubleshoot host/client mode issues
  useEffect(() => {
    console.log("Dashboard mode state:", { 
      isHostMode, 
      activeTab, 
      hasOwnerRole: user?.roles?.includes("owner"),
      hasLocations: canBeHost,
      locationCount: userOwnedLocations?.length || 0,
      userId: user?.id,
      userRoles: user?.roles,
    });
  }, [isHostMode, activeTab, canBeHost, user?.id, user?.roles, userOwnedLocations?.length]);
  
  // Get user bookings (as a client)
  const { 
    data: clientBookings, 
    isLoading: clientBookingsLoading,
    error: clientBookingsError
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/user"],
    enabled: !!user?.id,
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to reduce API calls
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });

  // Get bookings for the user's locations (as a host)
  const { 
    data: hostBookings, 
    isLoading: hostBookingsLoading,
    error: hostBookingsError
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/host"],
    enabled: !!user?.id && user?.roles?.includes("owner") && activeTab === "host",
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });

  // Fetch all locations owned by this user
  const { 
    data: userLocations, 
    isLoading: locationsLoading,
    error: locationsError
  } = useQuery<Location[]>({
    queryKey: ["/api/locations/owner"],
    enabled: !!user?.id && user?.roles?.includes("owner") && activeTab === "host",
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  // Only log in development mode for performance
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (clientBookings) {
        console.log("Client bookings loaded:", clientBookings.length);
      }
      if (hostBookings) {
        console.log("Host bookings loaded:", hostBookings.length);
      }
    }
  }, [clientBookings, hostBookings]);
  
  // Reset pagination when filter changes
  useEffect(() => {
    setClientPagination(prev => ({ ...prev, [clientStatusFilter]: 1 }));
  }, [clientStatusFilter]);
  
  useEffect(() => {
    setHostPagination(prev => ({ ...prev, [hostStatusFilter]: 1 }));
  }, [hostStatusFilter]);
  
  // Paginate bookings for display
  const getPaginatedBookings = (bookings: Booking[] | undefined, filter: BookingStatusFilter, currentPage: number) => {
    // Ensure bookings is always an array
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    const filtered = filterBookingsByStatus(bookingsArray, filter);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      bookings: filtered.slice(startIndex, endIndex),
      totalBookings: filtered.length,
      totalPages,
      currentPage: Math.min(currentPage, Math.max(1, totalPages))
    };
  };
  
  // Memoized paginated data
  const clientPaginatedData = useMemo(() => {
    if (!clientBookings) return { bookings: [], totalBookings: 0, totalPages: 0, currentPage: 1 };
    return getPaginatedBookings(clientBookings, clientStatusFilter, clientPagination[clientStatusFilter]);
  }, [clientBookings, clientStatusFilter, clientPagination]);
  
  const hostPaginatedData = useMemo(() => {
    if (!hostBookings) return { bookings: [], totalBookings: 0, totalPages: 0, currentPage: 1 };
    return getPaginatedBookings(hostBookings, hostStatusFilter, hostPagination[hostStatusFilter]);
  }, [hostBookings, hostStatusFilter, hostPagination]);

  // Add the update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number, status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'payment_pending' }) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update booking status to ${status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
      
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update booking status",
        variant: "destructive",
      });
    },
  });
  
  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
      
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      setBookingToCancel(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  // Check if the user is authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                You need to log in to view your bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Please log in to access your bookings and account information.</p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Log In or Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Loading state for active tab
  if (
    (activeTab === "client" && clientBookingsLoading) || 
    (activeTab === "host" && (hostBookingsLoading || locationsLoading))
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Check for errors and show error message
  const hasErrors = (activeTab === "client" && clientBookingsError) ||
    (activeTab === "host" && (hostBookingsError || locationsError));

  if (hasErrors) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Error Loading Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>There was a problem loading your booking data. Please try again later.</p>
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/locations/owner"] });
                }} 
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Handler functions
  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id);
    }
  };

  const handleApproveBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ 
      bookingId, 
      status: 'confirmed' 
    });
  };

  const handleRejectBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ 
      bookingId, 
      status: 'rejected' 
    });
  };

  // Organize bookings by status
  // Ensure bookings are always arrays before filtering
  const clientBookingsArray = Array.isArray(clientBookings) ? clientBookings : [];
  const hostBookingsArray = Array.isArray(hostBookings) ? hostBookings : [];
  
  // Active bookings are only those that are pending or confirmed
  const activeClientBookings = clientBookingsArray.filter(booking => 
    booking.status === "pending" || booking.status === "confirmed"
  );
  
  // Cancelled bookings include both manually cancelled and rejected bookings
  const cancelledClientBookings = clientBookingsArray.filter(booking => 
    booking.status === "cancelled" || booking.status === "rejected"
  );
  
  // For host bookings, organize them by location and status
  const pendingHostBookings = hostBookingsArray.filter(booking => booking.status === "pending");
  const confirmedHostBookings = hostBookingsArray.filter(booking => booking.status === "confirmed");
  const rejectedHostBookings = hostBookingsArray.filter(booking => booking.status && String(booking.status) === "rejected");

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your bookings and view their status
            </p>
          </div>
        </div>
        
        {isHostMode && canBeHost && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-6 w-6 mr-2 text-primary" /> 
                  Host Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Gain valuable insights about your listings, bookings, and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold">$8,342</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                      <p className="text-xl font-bold">164</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                    <PieChart className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                      <p className="text-xl font-bold">18.3%</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/analytics">
                    <Button className="w-full">
                      View Full Analytics Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mode toggle automatically based on isHostMode, no need for manual switching tabs */}
        
        {/* Show warning if user is trying to use host mode but has no properties */}
        {isHostMode && !canBeHost && (
          <div className="mb-8">
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="flex flex-row items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <div>
                  <CardTitle>Host Mode Unavailable</CardTitle>
                  <CardDescription>You need to list a property before using host features</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">To use host mode, you need to create at least one listing first. Once you have a property listed, you'll be able to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Manage bookings for your properties</li>
                  <li>Access the host analytics dashboard</li>
                  <li>Manage your property listings</li>
                </ul>
                <Button 
                  onClick={() => navigate('/add-listing')}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "client" ? (
          // CLIENT VIEW
          <div className="mb-8">
            <BookingStatusTabs
              activeStatus={clientStatusFilter}
              onStatusChange={(status) => setClientStatusFilter(status)}
              pendingCount={clientBookingsArray.filter(b => b.status === "pending").length}
              isHost={false}
            />
            
            <div className="mt-6 space-y-4">
              {clientPaginatedData.bookings.map((booking) => (
                <Card key={booking.id} className={booking.status === "cancelled" || booking.status === "rejected" ? "bg-muted/30" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle>Booking #{booking.id}</CardTitle>
                        <ViewDetailsButton bookingId={booking.id} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            booking.status === "confirmed" ? "success" : 
                            booking.status === "rejected" ? "destructive" : 
                            "outline"
                          } 
                          className="capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Booking Details</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <strong>Date:</strong> {format(new Date(booking.startDate), "MMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Time:</strong> {format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}
                          </p>
                          {booking.guestCount && (
                            <p className="text-muted-foreground">
                              <strong>Guests:</strong> {booking.guestCount}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Price</h4>
                        <p className="text-lg font-bold">${booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      {booking.status === "pending" && (
                        <Button 
                          variant="outline" 
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {clientPaginatedData.totalBookings === 0 && (
                <Card className="py-8">
                  <CardContent className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-medium mb-1">No Bookings Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You don't have any {clientStatusFilter !== "all" ? clientStatusFilter : ""} bookings at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Client Pagination - only show if more than 12 items */}
              {clientPaginatedData.totalBookings > ITEMS_PER_PAGE && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => {
                            const newPage = Math.max(1, clientPaginatedData.currentPage - 1);
                            setClientPagination(prev => ({ ...prev, [clientStatusFilter]: newPage }));
                          }}
                          className={clientPaginatedData.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(clientPaginatedData.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === clientPaginatedData.totalPages ||
                          Math.abs(pageNum - clientPaginatedData.currentPage) <= 1
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setClientPagination(prev => ({ ...prev, [clientStatusFilter]: pageNum }))}
                                isActive={pageNum === clientPaginatedData.currentPage}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        // Show ellipsis
                        if (
                          pageNum === clientPaginatedData.currentPage - 2 ||
                          pageNum === clientPaginatedData.currentPage + 2
                        ) {
                          return <PaginationItem key={pageNum}>...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            const newPage = Math.min(clientPaginatedData.totalPages, clientPaginatedData.currentPage + 1);
                            setClientPagination(prev => ({ ...prev, [clientStatusFilter]: newPage }));
                          }}
                          className={clientPaginatedData.currentPage === clientPaginatedData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        ) : (
          // HOST VIEW
          <div className="mb-8">
            <BookingStatusTabs
              activeStatus={hostStatusFilter}
              onStatusChange={(status) => setHostStatusFilter(status)}
              pendingCount={hostBookingsArray.filter(b => b.status === "pending").length}
              isHost={true}
            />

            <div className="mt-6 space-y-4">
              {hostPaginatedData.bookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className={
                    booking.status === "pending" ? "shadow-sm border-yellow-200" :
                    booking.status === "confirmed" ? "shadow-sm border-green-100" :
                    booking.status === "rejected" || booking.status === "cancelled" ? "bg-muted/30 border-red-100" : ""
                  }
                >
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center">
                          <CardTitle>
                            {booking.status === "pending" ? "Booking Request" : "Booking"} #{booking.id}
                          </CardTitle>
                          <Badge 
                            variant={
                              booking.status === "confirmed" ? "default" : 
                              booking.status === "rejected" ? "destructive" : 
                              booking.status === "pending" ? "outline" : 
                              "outline"
                            } 
                            className={
                              booking.status === "pending" 
                                ? "ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
                                : booking.status === "confirmed"
                                  ? "ml-2 capitalize bg-green-100 text-green-800 hover:bg-green-200" 
                                  : "ml-2 capitalize"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <ViewDetailsButton bookingId={booking.id} />
                      </div>
                      
                      {/* Action buttons based on status */}
                      {booking.status === "pending" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            onClick={() => handleApproveBooking(booking.id)}
                            variant="default"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleRejectBooking(booking.id)}
                            variant="destructive"
                            className="gap-1"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === "confirmed" && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Booking Details</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <strong>Date:</strong> {format(new Date(booking.startDate), "MMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Time:</strong> {format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}
                          </p>
                          {booking.guestCount && (
                            <p className="text-muted-foreground">
                              <strong>Guests:</strong> {booking.guestCount}
                            </p>
                          )}
                          {booking.activityType && (
                            <p className="text-muted-foreground">
                              <strong>Activity:</strong> {booking.activityType}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">
                          {booking.status === "rejected" ? "Potential Revenue" : "Revenue"}
                        </h4>
                        <p className={`text-lg font-bold ${booking.status === "rejected" ? "text-muted-foreground" : ""}`}>
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.status === "rejected" 
                            ? "Not collected due to rejection" 
                            : "After service fees"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {hostPaginatedData.totalBookings === 0 && (
                <Card className="py-8">
                  <CardContent className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-medium mb-1">No Bookings Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You don't have any {hostStatusFilter !== "all" ? hostStatusFilter : ""} bookings at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Host Pagination - only show if more than 12 items */}
              {hostPaginatedData.totalBookings > ITEMS_PER_PAGE && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => {
                            const newPage = Math.max(1, hostPaginatedData.currentPage - 1);
                            setHostPagination(prev => ({ ...prev, [hostStatusFilter]: newPage }));
                          }}
                          className={hostPaginatedData.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(hostPaginatedData.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === hostPaginatedData.totalPages ||
                          Math.abs(pageNum - hostPaginatedData.currentPage) <= 1
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setHostPagination(prev => ({ ...prev, [hostStatusFilter]: pageNum }))}
                                isActive={pageNum === hostPaginatedData.currentPage}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        // Show ellipsis
                        if (
                          pageNum === hostPaginatedData.currentPage - 2 ||
                          pageNum === hostPaginatedData.currentPage + 2
                        ) {
                          return <PaginationItem key={pageNum}>...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            const newPage = Math.min(hostPaginatedData.totalPages, hostPaginatedData.currentPage + 1);
                            setHostPagination(prev => ({ ...prev, [hostStatusFilter]: newPage }));
                          }}
                          className={hostPaginatedData.currentPage === hostPaginatedData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Edit Form Dialog */}
      {selectedBooking && (
        <BookingEditForm 
          booking={selectedBooking} 
          isOpen={!!selectedBooking} 
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Confirmation dialog for cancelling a booking */}
      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {bookingToCancel && (
              <div className="space-y-2 text-sm">
                <p><strong>Booking ID:</strong> {bookingToCancel.id}</p>
                <p><strong>Date:</strong> {format(new Date(bookingToCancel.startDate), "MMMM d, yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(bookingToCancel.startDate), "h:mm a")} - {format(new Date(bookingToCancel.endDate), "h:mm a")}</p>
                <p><strong>Amount:</strong> ${bookingToCancel.totalPrice.toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBookingToCancel(null)}
            >
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelBooking}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}