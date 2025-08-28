import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Location } from "@shared/schema";
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
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";
import { BookingCard } from "@/components/bookings/booking-card";
import { LocationCard } from "@/components/locations/location-card";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { PendingReviews } from "@/components/pending-reviews";
import { HostPendingReviews } from "@/components/host-pending-reviews";
import { BookingStatusTabs, BookingStatusFilter, filterBookingsByStatus } from "@/components/bookings/booking-status-tabs";
import { useTranslation } from "@/hooks/use-translation";
import { PayoutReminderAlert } from "@/components/dashboard/payout-reminder-alert";
import { DataPagination, PaginatedData, usePagination } from "@/components/ui/data-pagination";

// Define Booking type to match API response
type Booking = {
  id: number;
  locationId: number;
  clientId: number;
  startDate: string; // API returns dates as strings
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "payment_pending" | "refund_pending" | "refunded";
  activityType?: string | null;
  activity?: string | null;
  castAndCrew?: string | null;
  locationImage?: string | null;
  projectName?: string | null;
  renterCompany?: string | null;
  projectDescription?: string | null;
  guestCount?: number | null;
  paymentId?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundRequestedBy?: number | null;
  refundRequestedAt?: string | null;
  refundProcessedBy?: number | null;
  refundProcessedAt?: string | null;
  lastEditedBy?: number | null;
  lastEditedAt?: string | null;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { isHostMode } = useHostMode();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [, navigate] = useLocation();
  const [clientStatusFilter, setClientStatusFilter] = useState<BookingStatusFilter>("all");
  const [hostStatusFilter, setHostStatusFilter] = useState<BookingStatusFilter>("all");
  
  // Pagination state
  const clientPagination = usePagination(1, 12);
  const hostPagination = usePagination(1, 12);
  const locationsPagination = usePagination(1, 12);
  
  // Add error boundary
  useEffect(() => {
    console.log("Dashboard mounted - user:", user, "authLoading:", authLoading);
  }, [user, authLoading]);
  
  // First, fetch locations owned by this user to determine if they can be in host mode
  const { 
    data: userOwnedLocations,
    isLoading: ownedLocationsLoading
  } = useQuery<PaginatedData<Location>>({
    queryKey: ["/api/locations/owner", { page: 1, limit: 100 }],
    enabled: !!user?.id && user?.roles?.includes("owner"),
    queryFn: async ({ queryKey }) => {
      const [path, params] = queryKey as [string, { page: number; limit: number }];
      const clientId = localStorage.getItem('user_id');
      const url = clientId 
        ? `${path}?clientId=${encodeURIComponent(clientId)}&page=${params.page}&limit=${params.limit}` 
        : `${path}?page=${params.page}&limit=${params.limit}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch owned locations: ${res.status}`);
      return res.json();
    }
  });
  
  // Only allow host mode if user actually has locations
  const canBeHost = !!userOwnedLocations && userOwnedLocations.data && userOwnedLocations.data.length > 0;
  
  // Use isHostMode directly to determine the active tab
  // Even if user can't be a host, we should respect their choice to view host mode
  const activeTab = isHostMode ? "host" : "client";
  
  // Debug log to help troubleshoot host/client mode issues and clear cache when switching modes
  useEffect(() => {
    console.log("Dashboard mode state:", { 
      isHostMode, 
      activeTab, 
      hasOwnerRole: user?.roles?.includes("owner"),
      hasLocations: canBeHost,
      locationCount: userOwnedLocations?.data?.length || 0,
      userId: user?.id,
      userRoles: user?.roles,
      userOwnedLocations: userOwnedLocations?.data
    });
    
    // Clear all booking caches when switching modes to prevent any data contamination
    if (isHostMode) {
      // In host mode, clear client bookings cache
      console.log("Clearing client bookings cache in host mode");
      queryClient.removeQueries({ queryKey: ["/api/bookings/user"] });
    } else {
      // In client mode, clear host bookings cache
      console.log("Clearing host bookings cache in client mode");
      queryClient.removeQueries({ queryKey: ["/api/bookings/host"] });
    }
  }, [isHostMode, activeTab, canBeHost, user?.id, user?.roles, userOwnedLocations]);
  
  // Get user bookings (as a client)
  const { 
    data: clientBookings, 
    isLoading: clientBookingsLoading,
    error: clientBookingsError
  } = useQuery<PaginatedData<Booking>>({
    queryKey: ["/api/bookings/user", { page: clientPagination.page, limit: clientPagination.limit }],
    enabled: !!user?.id && activeTab === "client",
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to reduce API calls
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Always refetch to ensure we have the latest data
    queryFn: async ({ queryKey }) => {
      try {
        const [path, params] = queryKey as [string, { page: number; limit: number }];
        // Get clientId from localStorage as fallback
        const clientId = localStorage.getItem('user_id');
        
        // Create request URL with clientId as query parameter for fallback auth
        const url = clientId 
          ? `${path}?clientId=${encodeURIComponent(clientId)}&page=${params.page}&limit=${params.limit}` 
          : `${path}?page=${params.page}&limit=${params.limit}`;
        
        console.log(`Fetching user bookings with URL: ${url}`);
        
        // First try server-side authenticated request with clientId fallback parameter
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          // Cache the successful response
          try {
            localStorage.setItem('cache_api_bookings_user', JSON.stringify(data));
          } catch (e) {
            console.warn("Could not cache bookings in localStorage:", e);
          }
          return data;
        }
        
        // If server request fails with 401, try to get bookings using user ID from localStorage
        if (res.status === 401 && user?.id) {
          console.log("Authentication failed for bookings, using client-side fallback");
          // Try to get cached bookings
          const cachedData = localStorage.getItem('cache_api_bookings_user');
          if (cachedData) {
            console.log("Using cached bookings data");
            return JSON.parse(cachedData);
          }
          
          // If no cached data, return empty paginated result
          return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
        }
        
        // For other errors, throw
        throw new Error(`Failed to fetch bookings: ${res.status}`);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    }
  });

  // Get bookings for the user's locations (as a host)
  const { 
    data: hostBookings, 
    isLoading: hostBookingsLoading,
    error: hostBookingsError
  } = useQuery<PaginatedData<Booking>>({
    queryKey: ["/api/bookings/host", { page: hostPagination.page, limit: hostPagination.limit }],
    enabled: !!user?.id && user?.roles?.includes("owner") && activeTab === "host",
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Always refetch to ensure we have the latest data
    queryFn: async ({ queryKey }) => {
      try {
        const [path, params] = queryKey as [string, { page: number; limit: number }];
        // Get clientId from localStorage as fallback
        const clientId = localStorage.getItem('user_id');
        
        // Create request URL with clientId as query parameter for fallback auth
        const url = clientId 
          ? `${path}?clientId=${encodeURIComponent(clientId)}&page=${params.page}&limit=${params.limit}` 
          : `${path}?page=${params.page}&limit=${params.limit}`;
        
        console.log(`Fetching host bookings with URL: ${url}`);
        
        // First try server-side authenticated request with clientId fallback parameter
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          // Cache the successful response
          try {
            localStorage.setItem('cache_api_bookings_host', JSON.stringify(data));
          } catch (e) {
            console.warn("Could not cache host bookings in localStorage:", e);
          }
          return data;
        }
        
        // If server request fails with 401, clear host cache and return empty paginated result
        if (res.status === 401 && user?.id) {
          console.log("Authentication failed for host bookings, clearing cache and returning empty result");
          // Clear potentially stale cached data
          localStorage.removeItem('cache_api_bookings_host');
          return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
        }
        
        // For other errors, throw
        throw new Error(`Failed to fetch host bookings: ${res.status}`);
      } catch (error) {
        console.error("Error fetching host bookings:", error);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    }
  });

  // Fetch all locations owned by this user
  const { 
    data: userLocations, 
    isLoading: locationsLoading,
    error: locationsError
  } = useQuery<PaginatedData<Location>>({
    queryKey: ["/api/locations/owner", { page: locationsPagination.page, limit: locationsPagination.limit }],
    enabled: !!user?.id && user?.roles?.includes("owner") && activeTab === "host",
    // Performance optimizations
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch to ensure we have the latest data
    queryFn: async ({ queryKey }) => {
      try {
        const [path, params] = queryKey as [string, { page: number; limit: number }];
        // Get clientId from localStorage as fallback
        const clientId = localStorage.getItem('user_id');
        
        // Create request URL with clientId as query parameter for fallback auth
        const url = clientId 
          ? `${path}?clientId=${encodeURIComponent(clientId)}&page=${params.page}&limit=${params.limit}` 
          : `${path}?page=${params.page}&limit=${params.limit}`;
        
        console.log(`Fetching owner locations with URL: ${url}`);
        
        // First try server-side authenticated request with clientId fallback parameter
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          // Cache the successful response
          try {
            localStorage.setItem('cache_api_locations_owner', JSON.stringify(data));
          } catch (e) {
            console.warn("Could not cache locations in localStorage:", e);
          }
          return data;
        }
        
        // If server request fails with 401, try to get locations using user ID from localStorage
        if (res.status === 401 && user?.id) {
          console.log("Authentication failed for locations, using client-side fallback");
          // Try to get cached locations
          const cachedData = localStorage.getItem('cache_api_locations_owner');
          if (cachedData) {
            console.log("Using cached locations data");
            return JSON.parse(cachedData);
          }
          
          // If no cached data, return empty paginated result
          return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
        }
        
        // For other errors, throw
        throw new Error(`Failed to fetch locations: ${res.status}`);
      } catch (error) {
        console.error("Error fetching locations:", error);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    }
  });
  


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

  // Utility function to check if user has left a review for a booking
  const hasLeftReview = (bookingId: number): boolean => {
    // This would need to be implemented based on your reviews state
    // For now, return a placeholder
    return false;
  };

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
                {t("dashboard.error")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("dashboard.error")}</p>
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/locations/owner"] });
                }} 
                className="mt-4"
              >
                {t("common.retry")}
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

  // Organize client bookings by the new categories
  // Upcoming: future confirmed bookings
  const upcomingClientBookings = clientBookings?.data?.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) > new Date()
  ) || [];
  
  // Pending: awaiting approval
  const pendingClientBookings = clientBookings?.data?.filter(booking => 
    booking.status === "pending"
  ) || [];
  
  // Completed: past confirmed bookings
  const completedClientBookings = clientBookings?.data?.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) <= new Date()
  ) || [];
  
  // Canceled: either canceled by client or rejected by host
  const canceledClientBookings = clientBookings?.data?.filter(booking => 
    booking.status === "cancelled" || booking.status === "rejected"
  ) || [];
  
  // For host bookings, organize them by location and status - ONLY if we have valid host bookings
  // Host bookings - ensure we NEVER use client bookings by mistake
  // CRITICAL: Filter to ensure NO bookings where user is the client appear in host mode
  const validHostBookings = (canBeHost && hostBookings?.data) 
    ? hostBookings.data.filter(booking => {
        // Double-check that this is NOT a client booking
        if (booking.clientId === user?.id) {
          console.warn(`WARNING: Filtering out client booking #${booking.id} from host view!`);
          return false;
        }
        return true;
      })
    : [];
  const pendingHostBookings = validHostBookings ? validHostBookings.filter(booking => booking.status === "pending") : [];
  
  // Upcoming: future confirmed bookings - use validHostBookings only
  const upcomingHostBookings = validHostBookings ? validHostBookings.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) > new Date()
  ) : [];
  
  // Completed: past confirmed bookings - use validHostBookings only
  const completedHostBookings = validHostBookings ? validHostBookings.filter(booking => 
    booking.status === "confirmed" && new Date(booking.endDate) <= new Date()
  ) : [];
  
  // Canceled: either rejected by host or cancelled by client - use validHostBookings only
  const canceledHostBookings = validHostBookings ? validHostBookings.filter(booking => 
    booking.status === "cancelled" || booking.status === "rejected"
  ) : [];
  
  // Debug logging to track booking separation
  useEffect(() => {
    console.log("=== BOOKING DASHBOARD DEBUG ===");
    console.log("Active Tab:", activeTab);
    console.log("Is Host Mode:", isHostMode);
    console.log("Can Be Host:", canBeHost);
    console.log("User ID:", user?.id);
    console.log("User Roles:", user?.roles);
    console.log("Client Bookings:", clientBookings?.data?.length || 0);
    if (clientBookings?.data && clientBookings.data.length > 0) {
      console.log("Sample client booking:", clientBookings.data[0]);
    }
    console.log("Host Bookings (raw):", hostBookings?.data?.length || 0);
    if (hostBookings?.data && hostBookings.data.length > 0) {
      console.log("Sample host booking:", hostBookings.data[0]);
    }
    console.log("Valid Host Bookings (filtered):", validHostBookings?.length || 0);
    
    // Check if any client bookings are mistakenly in host bookings
    if (hostBookings?.data && user?.id) {
      const clientBookingsInHost = hostBookings.data.filter(b => b.clientId === user.id);
      if (clientBookingsInHost.length > 0) {
        console.error("ERROR: Client bookings found in host bookings!", clientBookingsInHost);
      }
    }
    
    // Additional debug: Check what's being rendered
    if (activeTab === "host") {
      console.log("HOST TAB ACTIVE - Should show host view");
      console.log("Will render host bookings?", canBeHost && validHostBookings);
      console.log("Will show empty state?", !canBeHost || !validHostBookings);
    } else if (activeTab === "client") {
      console.log("CLIENT TAB ACTIVE - Should show client view");
    }
    
    console.log("==============================");
  }, [activeTab, isHostMode, canBeHost, clientBookings, hostBookings, validHostBookings, user?.id]);

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
                {t("common.login")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.needToListProperty")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>{t("dashboard.listPropertyDesc")}</p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                {t("common.login")}
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("dashboard.yourBookings")}</h1>
            <p className="text-muted-foreground">
              {t("dashboard.manageProperties")}
            </p>
          </div>
        </div>
        
        {/* Payout Reminder Alert for hosts */}
        {isHostMode && canBeHost && (
          <PayoutReminderAlert />
        )}

        {isHostMode && canBeHost && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-6 w-6 mr-2 text-primary" /> 
                  {t("dashboard.analytics")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.manageProperties")}
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
                  <CardTitle>{t("dashboard.hostMode")}</CardTitle>
                  <CardDescription>{t("dashboard.needToListProperty")}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{t("dashboard.listPropertyDesc")}</p>
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
                  {t("dashboard.createFirstListing")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "client" && !isHostMode ? (
          <>
          {/* Pending Reviews for Guest Bookings */}
          <div className="mb-8">
            <PendingReviews />
          </div>
          
          {/* CLIENT VIEW - Using our consistent BookingStatusTabs component */}
          <BookingStatusTabs 
            activeStatus={clientStatusFilter} 
            onStatusChange={setClientStatusFilter} 
            isHost={false}
          />

          {/* Display filtered bookings based on selected status */}
          <div className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientBookings?.data && clientBookings.data.length > 0 ? (
                filterBookingsByStatus(clientBookings.data as any, clientStatusFilter).map((booking: any) => (
                  <BookingCard 
                    key={booking.id}
                    booking={booking}
                    onEdit={() => setSelectedBooking(booking)}
                    onCancel={() => booking.status !== "cancelled" && booking.status !== "rejected" ? setBookingToCancel(booking) : undefined}
                    viewDetailsLink={`/bookings/${booking.id}`}
                    showReviewButton={booking.status === "confirmed" && new Date(booking.endDate) <= new Date() && !hasLeftReview(booking.id)}
                    onReviewClick={() => navigate(`/bookings/${booking.id}/review`)}
                  />
                ))
              ) : (
                <p className="col-span-full text-muted-foreground text-center py-8">
                  {clientStatusFilter === "all" 
                    ? t("dashboard.noBookings") 
                    : `${t("dashboard.noBookings")} (${clientStatusFilter})`}
                </p>
              )}
              
              {clientBookings?.data && clientBookings.data.length > 0 && 
               filterBookingsByStatus(clientBookings.data as any, clientStatusFilter).length === 0 && (
                <p className="col-span-full text-muted-foreground text-center py-8">
                  {t("dashboard.noBookings")} ({clientStatusFilter})
                </p>
              )}
            </div>
            
            {/* Client Bookings Pagination */}
            {clientBookings && clientBookings.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <DataPagination
                  currentPage={clientBookings.page}
                  totalPages={clientBookings.totalPages}
                  onPageChange={clientPagination.onPageChange}
                  total={clientBookings.total}
                  limit={clientBookings.limit}
                />
              </div>
            )}
          </div>
          </>
        ) : activeTab === "host" ? (
          // HOST VIEW - NEVER show client bookings, only show if user can actually be a host
          <>
            {/* Show HostPendingReviews if user has owner role, regardless of current locations */}
            {user?.roles?.includes("owner") && (
              <div className="mb-8">
                <HostPendingReviews />
              </div>
            )}
            
            {canBeHost ? (
              <div className="space-y-8">
                
                {/* Host Booking Status Tabs - Using the consistent component */}
                <BookingStatusTabs 
                  activeStatus={hostStatusFilter} 
                  onStatusChange={setHostStatusFilter} 
                  isHost={true}
                  pendingCount={pendingHostBookings.length}
                />

                {/* Display filtered host bookings based on selected status */}
                <div className="mt-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {validHostBookings && validHostBookings.length > 0 ? (
                      filterBookingsByStatus(validHostBookings as any, hostStatusFilter).map((booking) => (
                        <BookingCard 
                          key={booking.id}
                          booking={booking as any}
                          isHost={true}
                          onViewDetails={() => navigate(`/host-booking/${booking.id}`)}
                          onApprove={booking.status === "pending" ? () => handleApproveBooking(booking.id) : undefined}
                          onReject={booking.status === "pending" ? () => handleRejectBooking(booking.id) : undefined}
                          isPending={booking.status === "pending"}
                        />
                      ))
                    ) : (
                      <p className="col-span-full text-muted-foreground text-center py-8">
                        {hostStatusFilter === "all" 
                          ? "No host bookings found" 
                          : `No ${hostStatusFilter} host bookings found`}
                      </p>
                    )}
                    
                    {validHostBookings.length > 0 && 
                     filterBookingsByStatus(validHostBookings as any, hostStatusFilter).length === 0 && (
                      <p className="col-span-full text-muted-foreground text-center py-8">
                        No {hostStatusFilter} host bookings found
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Host Bookings Pagination */}
                {hostBookings && hostBookings.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <DataPagination
                      currentPage={hostBookings.page}
                      totalPages={hostBookings.totalPages}
                      onPageChange={hostPagination.onPageChange}
                      total={hostBookings.total}
                      limit={hostBookings.limit}
                    />
                  </div>
                )}
                
                {/* Empty div for scrolling targets */}
                <div id="host-pending-bookings" className="hidden"></div>
                <div id="host-upcoming-bookings" className="hidden"></div>
                <div id="host-completed-bookings" className="hidden"></div>
                <div id="host-canceled-bookings" className="hidden"></div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Booking Edit Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Make changes to your booking details.
              </DialogDescription>
            </DialogHeader>
            <BookingEditForm 
              booking={selectedBooking as any} 
              isOpen={!!selectedBooking}
              onClose={() => {
                setSelectedBooking(null);
                queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Booking Confirmation Dialog */}
      {bookingToCancel && (
        <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">Booking details:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(bookingToCancel.startDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: ${(bookingToCancel.totalPrice / 100).toFixed(2)}
              </p>
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
                  "Cancel Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}