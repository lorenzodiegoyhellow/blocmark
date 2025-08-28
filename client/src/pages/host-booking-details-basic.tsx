import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  Loader2, Calendar, User, MapPin, DollarSign, MessageSquare, FileText, 
  CheckCircle, XCircle, Clock, ArrowLeft, Image, Users, Tag, Edit, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";
import { BookingHistory } from "@/components/bookings/booking-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Super basic host booking details page with minimal dependencies
 */
export default function HostBookingDetailsBasic() {
  // Route params
  const params = useParams();
  const [, navigate] = useLocation();
  
  // Simple state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  const [location, setLocation] = useState<any | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Extract ID from params
  const bookingId = params?.id;
  
  // Load all data on mount
  useEffect(() => {
    async function fetchData() {
      if (!bookingId) {
        setError("No booking ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        // Check authentication first
        const authCheckRes = await fetch("/api/user", { 
          credentials: "include" 
        });
        
        if (!authCheckRes.ok) {
          console.error("Authentication required");
          setError("Authentication required. Please login.");
          setIsLoading(false);
          // Redirect to login
          navigate("/auth");
          return;
        }
        
        // Fetch booking data
        const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
          credentials: "include"
        });
        
        if (!bookingRes.ok) {
          if (bookingRes.status === 404) {
            setError("Booking not found");
          } else if (bookingRes.status === 403) {
            setError("You don't have permission to view this booking");
          } else {
            setError(`Error loading booking: ${bookingRes.statusText}`);
          }
          setIsLoading(false);
          return;
        }
        
        const bookingData = await bookingRes.json();
        setBooking(bookingData);
        
        // Fetch location data
        if (bookingData.locationId) {
          const locationRes = await fetch(`/api/locations/${bookingData.locationId}`, {
            credentials: "include"
          });
          
          if (locationRes.ok) {
            const locationData = await locationRes.json();
            setLocation(locationData);
          }
        }
        
        // Fetch client data
        if (bookingData.clientId) {
          const clientRes = await fetch(`/api/users/${bookingData.clientId}`, {
            credentials: "include"
          });
          
          if (clientRes.ok) {
            const clientData = await clientRes.json();
            setClient(clientData);
          }
        }
        
        // Fetch addons if available
        try {
          const addonsRes = await fetch(`/api/bookings/${bookingId}/addons`, {
            credentials: "include"
          });
          
          if (addonsRes.ok) {
            const addonsData = await addonsRes.json();
            setAddons(Array.isArray(addonsData) ? addonsData : []);
          }
        } catch (addonError) {
          console.error("Failed to load addons:", addonError);
          // Non-critical, so continue without setting error state
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading booking data:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [bookingId, navigate]);

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!booking || !bookingId) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Update local state
        setBooking({ ...booking, status: 'cancelled' });
        setShowCancelConfirm(false);
        
        // Show success message (you could also use a toast here)
        alert('Booking cancelled successfully. The client has been notified by email.');
      } else {
        const error = await response.json();
        alert(`Failed to cancel booking: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Render loading state
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
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Please wait while we fetch the booking information...
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button className="ml-2" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Render empty state
  if (!booking) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Could not find booking information.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Format dates
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  // Get status badge styling
  const getStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "rejected":
        return <Badge className="bg-gray-100 text-gray-800">Declined</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
      default:
        return <Badge>{booking.status}</Badge>;
    }
  };
  
  // Main render - success state
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        {/* Navigation bar with back button */}
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          
          <Separator orientation="vertical" className="mx-4 h-6" />
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <p className="text-muted-foreground">View and manage reservation #{booking.id}</p>
          </div>
          
          {getStatusBadge()}
        </div>
        
        {/* Main content in two-column layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* Tabs for organizing content */}
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
            {/* Booking status card */}
            <Card className="bg-gradient-to-b from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Booking Schedule
                    </CardTitle>
                    <CardDescription>
                      Reservation times and details
                    </CardDescription>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Booking Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-md shadow-sm border">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-medium">{format(startDate, "MMM d, yyyy")}</p>
                    <p className="text-sm">{format(startDate, "h:mm a")}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md shadow-sm border">
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="font-medium">{format(endDate, "MMM d, yyyy")}</p>
                    <p className="text-sm">{format(endDate, "h:mm a")}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md shadow-sm border">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hrs
                    </p>
                  </div>
                  
                  {booking.guestCount && (
                    <div className="bg-white p-3 rounded-md shadow-sm border">
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {booking.guestCount} people
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Status timeline */}
                <div className="relative pl-6 border-l border-primary/30 space-y-3 mt-6">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0">
                      <div className="bg-primary/20 border border-primary/40 rounded-full w-5 h-5 flex items-center justify-center">
                        <div className="bg-primary rounded-full w-2 h-2" />
                      </div>
                    </div>
                    <p className="text-sm font-medium flex items-center">
                      Booking Created
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(booking.createdAt || startDate), "MMM d, yyyy")}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Client submitted reservation request
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0">
                      <div className={`border rounded-full w-5 h-5 flex items-center justify-center ${
                        booking.status === "confirmed" || booking.status === "rejected" || booking.status === "cancelled" 
                          ? "bg-primary/20 border-primary/40" 
                          : "bg-gray-100 border-gray-300"
                      }`}>
                        {(booking.status === "confirmed" || booking.status === "rejected" || booking.status === "cancelled") && (
                          <div className="bg-primary rounded-full w-2 h-2" />
                        )}
                      </div>
                    </div>
                    <p className={`text-sm font-medium flex items-center ${
                      booking.status === "pending" ? "text-muted-foreground" : ""
                    }`}>
                      {booking.status === "confirmed" ? "Booking Confirmed" : 
                       booking.status === "rejected" ? "Booking Declined" : 
                       booking.status === "cancelled" ? "Booking Cancelled" : 
                       "Awaiting Response"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.status === "confirmed" ? "You approved this reservation" : 
                       booking.status === "rejected" ? "You declined this reservation" : 
                       booking.status === "cancelled" ? "This booking was cancelled" : 
                       "Your action is required"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Project details card */}
            {(booking.projectName || booking.activityType || booking.projectDescription) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Project Information
                  </CardTitle>
                  <CardDescription>
                    Details about the client's planned activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {booking.projectName && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-muted-foreground">Project Name</p>
                          <p className="font-medium">{booking.projectName}</p>
                        </div>
                      )}
                      
                      {booking.activityType && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-muted-foreground">Activity Type</p>
                          <p className="font-medium flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {booking.activityType}
                          </p>
                        </div>
                      )}
                      
                      {booking.renterCompany && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="font-medium">{booking.renterCompany}</p>
                        </div>
                      )}
                    </div>
                    
                    {booking.projectDescription && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Project Description</p>
                        <p className="whitespace-pre-line text-sm">{booking.projectDescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Location card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Location Details
                </CardTitle>
                <CardDescription>
                  Information about the booked space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Location image */}
                  <div className="md:w-1/3 bg-gray-100 rounded-md flex items-center justify-center h-40 overflow-hidden">
                    {location?.images && location.images.length > 0 ? (
                      <img 
                        src={location.images[0]} 
                        alt={location.title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Location info */}
                  <div className="md:w-2/3">
                    <h3 className="text-lg font-semibold mb-1">
                      {location?.title || "Unknown Location"}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {location?.address || "Address not available"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Price per hour</p>
                        <p className="font-medium">${location?.price || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">
                          {location?.type || "Standard space"}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => location && navigate(`/locations/${location.id}`)}
                    >
                      View Complete Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-6 mt-6">
                {/* Pricing breakdown card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-primary" />
                          Pricing Details
                        </CardTitle>
                        <CardDescription>
                          Breakdown of costs and payment information
                        </CardDescription>
                      </div>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex items-center gap-1" 
                        onClick={() => setShowEditForm(true)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit & Adjust Payment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Rate</span>
                        <span>${(booking.totalPrice * 0.85).toFixed(2)}</span>
                      </div>
                      
                      {addons.length > 0 && (
                        <>
                          <Separator />
                          <div className="pt-1">
                            <p className="text-sm font-medium mb-2">Add-ons:</p>
                            {addons.map(addon => (
                              <div key={addon.id} className="flex justify-between text-sm mb-1">
                                <span>{addon.name}</span>
                                <span>${addon.price}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span>${(booking.totalPrice * 0.15).toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${booking.totalPrice}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md mt-4">
                        <h4 className="text-sm font-medium mb-2">Payment Status</h4>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            booking.paymentId ? "bg-green-500" : "bg-amber-500"
                          }`}></div>
                          <p className="text-sm">
                            {booking.paymentId 
                              ? "Payment completed" 
                              : "Payment pending"}
                          </p>
                        </div>
                        {booking.paymentId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Payment ID: {booking.paymentId}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Booking Edit History
                    </CardTitle>
                    <CardDescription>
                      Record of all changes to this booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {booking && (
                      <BookingHistory bookingId={booking.id} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column: 1/3 width */}
          <div className="space-y-6">
            {/* Client info card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Client
                </CardTitle>
                <CardDescription>
                  Details about the customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 mr-4">
                    {client?.profileImage ? (
                      <AvatarImage src={client.profileImage} alt={client?.username || "Client"} />
                    ) : (
                      <AvatarFallback className="bg-primary-foreground text-primary">
                        {client?.username?.charAt(0).toUpperCase() || "C"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{client?.username || "Unknown Client"}</h3>
                    {client?.email && <p className="text-muted-foreground text-sm">{client.email}</p>}
                  </div>
                </div>
                
                {client && location && (
                  <Button 
                    variant="default"
                    className="w-full"
                    onClick={() => 
                      navigate(`/messages?otherUserId=${client.id}&locationId=${location.id}`)
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Client
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Quick action card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common booking management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => setActiveTab("payment")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Payment Details
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => setActiveTab("history")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    View Edit History
                  </Button>
                  
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center"
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Booking
                  </Button>
                  
                  {booking.status !== 'cancelled' && 
                   booking.status !== 'completed' && 
                   booking.status !== 'rejected' && 
                   new Date(booking.endDate) > new Date() && (
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center justify-center"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Action buttons card for pending bookings */}
            {booking.status === "pending" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-600" />
                    Action Required
                  </CardTitle>
                  <CardDescription>
                    This booking needs your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="default" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // This is just a placeholder - in a real impl we'd call an API
                        alert("This would confirm the booking in a complete implementation");
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Booking
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        // This is just a placeholder - in a real impl we'd call an API
                        alert("This would reject the booking in a complete implementation");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Edit Booking Dialog - Direct mount without redundant Dialog wrapper */}
      {booking && (
        <BookingEditForm 
          booking={booking} 
          isOpen={showEditForm} 
          onClose={() => setShowEditForm(false)} 
        />
      )}
      
      {/* Cancel booking confirmation dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md my-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> The client will be notified by email and will see this booking as cancelled in their dashboard.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Booking Details:</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Client:</strong> {client?.username || 'Unknown'}<br />
              <strong>Location:</strong> {location?.title || 'Unknown'}<br />
              <strong>Dates:</strong> {booking && format(new Date(booking.startDate), "MMM d, yyyy")} - {booking && format(new Date(booking.endDate), "MMM d, yyyy")}<br />
              <strong>Total Price:</strong> ${booking?.totalPrice || 0}
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}