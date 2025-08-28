import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { useHostMode } from "@/hooks/use-host-mode";
import { Loader2, CheckCircle, XCircle, Clock, User, Users, Calendar, MessageSquare, FileText, Package, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Fixed simple component focused on reliability
export default function HostBookingDetailsSimple() {
  // Routing
  const [match, params] = useRoute("/host/bookings/:id");
  const bookingId = params?.id;
  const [, setLocation] = useLocation();
  
  // State and hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const { setHostMode } = useHostMode();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [location, setLocationData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Enter host mode
  useEffect(() => {
    if (user?.roles?.includes("owner")) {
      setHostMode(true);
    }
  }, [user, setHostMode]);
  
  // First make sure authentication is complete
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    if (user === null) return; // Still loading
    
    if (!user) {
      // Authenticated check completed and user is not logged in
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
      return;
    }
    
    setAuthChecked(true);
  }, [user, toast, setLocation]);
  
  // Fetch booking data only after auth is confirmed
  useEffect(() => {
    if (!bookingId || !authChecked || !user) return;
    
    async function fetchBookingData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // First verify current auth state
        const userCheckRes = await fetch("/api/user", { 
          credentials: "include"
        });
        
        if (!userCheckRes.ok) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          setLocation("/auth");
          return;
        }
        
        // Fetch booking details
        console.log(`Fetching booking data for ID: ${bookingId}`);
        const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
          credentials: "include"
        });
        
        if (!bookingRes.ok) {
          throw new Error(`Failed to fetch booking: ${bookingRes.status}`);
        }
        
        const bookingText = await bookingRes.text();
        let bookingData;
        try {
          bookingData = JSON.parse(bookingText);
        } catch (e) {
          console.error("JSON parse error:", e, bookingText);
          throw new Error("Could not parse booking data");
        }
        
        setBooking(bookingData);
        
        // Fetch location details
        if (bookingData.locationId) {
          const locationRes = await fetch(`/api/locations/${bookingData.locationId}`, {
            credentials: "include"
          });
          
          if (!locationRes.ok) {
            throw new Error(`Failed to fetch location: ${locationRes.status}`);
          }
          
          const locationText = await locationRes.text();
          try {
            const locationData = JSON.parse(locationText);
            setLocationData(locationData);
          } catch (e) {
            console.error("Location parse error:", e);
          }
        }
        
        // Fetch client details
        if (bookingData.clientId) {
          const clientRes = await fetch(`/api/users/${bookingData.clientId}`, {
            credentials: "include"
          });
          
          if (clientRes.ok) {
            const clientText = await clientRes.text();
            try {
              const clientData = JSON.parse(clientText);
              setClient(clientData);
            } catch (e) {
              console.error("Client parse error:", e);
            }
          }
        }
        
        // Fetch addons
        const addonsRes = await fetch(`/api/bookings/${bookingId}/addons`, {
          credentials: "include"
        });
        
        if (addonsRes.ok) {
          const addonsText = await addonsRes.text();
          try {
            const addonsData = JSON.parse(addonsText);
            setAddons(Array.isArray(addonsData) ? addonsData : []);
          } catch (e) {
            console.error("Addons parse error:", e);
            setAddons([]);
          }
        } else {
          setAddons([]);
        }
        
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBookingData();
  }, [bookingId, user, authChecked, toast, setLocation]);
  
  // Handle booking status update
  const updateBookingStatus = async (status: string) => {
    if (!bookingId) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update status: ${res.status}`);
      }
      
      // Refresh page data
      toast({
        title: "Booking updated",
        description: `Booking has been ${status}.`,
      });
      
      // Refresh the page data instead of relying on state mutations
      window.location.reload();
      
    } catch (err) {
      console.error("Error updating booking:", err);
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Failed to update booking status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle message client
  const handleMessageClient = () => {
    if (!booking || !client) return;
    setLocation(`/messages?otherUserId=${booking.clientId}&locationId=${booking.locationId}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading Booking Details
              </CardTitle>
              <CardDescription>Please wait while we fetch the booking information...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Error state
  if (error || !booking) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>{error || "Could not load booking details"}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString || "Not specified";
    }
  };
  
  // Calculate duration
  const getDuration = () => {
    try {
      if (!booking.startDate || !booking.endDate) return "Not specified";
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } catch (e) {
      return "Not specified";
    }
  };
  
  // Success state - show booking details
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Booking #{booking.id}</CardTitle>
              <CardDescription>
                {location?.title || "Location"}
              </CardDescription>
            </div>
            <Badge 
              className={
                booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Client information */}
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={client?.profileImage} />
                <AvatarFallback>{client?.username ? client.username[0] : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{client?.username || "Client"}</p>
                <p className="text-sm text-muted-foreground">Client</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" onClick={handleMessageClient}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Client
              </Button>
            </div>
            
            <Separator />
            
            {/* Booking details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">{formatDate(booking.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{getDuration()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-sm text-muted-foreground">{booking.guestCount || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Total Price</p>
                  <p className="text-sm text-muted-foreground">
                    ${typeof booking.totalPrice === 'number' ? (booking.totalPrice / 100).toFixed(2) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Project details */}
            <div>
              <h3 className="font-medium mb-2">Project Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Activity Type</p>
                  <p className="text-sm text-muted-foreground">{booking.activityType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Project Name</p>
                  <p className="text-sm text-muted-foreground">{booking.projectName || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Renter/Company</p>
                  <p className="text-sm text-muted-foreground">{booking.renterCompany || "Not specified"}</p>
                </div>
              </div>
              {booking.projectDescription && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Project Description</p>
                  <p className="text-sm text-muted-foreground mt-1">{booking.projectDescription}</p>
                </div>
              )}
            </div>
            
            {/* Add-ons */}
            {addons.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Add-ons</h3>
                  <div className="space-y-2">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-start border rounded-md p-2">
                        <div>
                          <p className="text-sm font-medium">{addon.name}</p>
                          <p className="text-xs text-muted-foreground">{addon.description}</p>
                        </div>
                        <p className="text-sm font-medium">
                          ${typeof addon.price === 'number' ? (addon.price / 100).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          {/* Actions */}
          {booking.status === "pending" && (
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                onClick={() => updateBookingStatus("confirmed")}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Accept Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => updateBookingStatus("rejected")}
                disabled={isUpdating}
                className="text-red-500 hover:text-red-600"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Decline Booking
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
          {location && (
            <Button variant="outline" onClick={() => setLocation(`/locations/${location.id}`)}>
              View Location
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}