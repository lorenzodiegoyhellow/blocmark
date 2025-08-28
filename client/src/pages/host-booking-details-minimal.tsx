import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Absolute minimal host booking details page with almost no dependencies
 */
export default function HostBookingDetailsMinimal() {
  // Basic state
  const [match, params] = useRoute("/host/bookings/:id");
  const bookingId = params?.id;
  const [, setLocation] = useLocation();
  
  // Manual state management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  // Use a basic useEffect hook to load data
  useEffect(() => {
    // Don't use async in the main useEffect
    if (!bookingId) {
      setError("No booking ID provided");
      setIsLoading(false);
      return;
    }
    
    // Use simple XHR instead of fetch for maximum compatibility
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/user", true);
    xhr.withCredentials = true;
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        // User is authenticated, fetch booking data
        fetchBookingData();
      } else {
        // Not authenticated
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        window.location.href = "/auth"; // Direct redirect
      }
    };
    
    xhr.onerror = function() {
      console.error("XHR error for auth check");
      setError("Network error while checking authentication");
      setIsLoading(false);
    };
    
    xhr.send();
    
    // Function to fetch booking data
    function fetchBookingData() {
      const bookingXhr = new XMLHttpRequest();
      bookingXhr.open("GET", `/api/bookings/${bookingId}`, true);
      bookingXhr.withCredentials = true;
      
      bookingXhr.onload = function() {
        if (bookingXhr.status === 200) {
          try {
            const bookingData = JSON.parse(bookingXhr.responseText);
            console.log("Booking data:", bookingData);
            
            // Now fetch location and client data sequentially for maximum reliability
            fetchLocationData(bookingData);
          } catch (err) {
            console.error("JSON parse error:", err);
            setError("Error parsing booking data");
            setIsLoading(false);
          }
        } else {
          setError(`Failed to load booking: ${bookingXhr.status}`);
          setIsLoading(false);
        }
      };
      
      bookingXhr.onerror = function() {
        console.error("XHR error for booking");
        setError("Network error while fetching booking data");
        setIsLoading(false);
      };
      
      bookingXhr.send();
    }
    
    // Function to fetch location data
    function fetchLocationData(bookingData: any) {
      if (!bookingData.locationId) {
        fetchClientData(bookingData, null);
        return;
      }
      
      const locationXhr = new XMLHttpRequest();
      locationXhr.open("GET", `/api/locations/${bookingData.locationId}`, true);
      locationXhr.withCredentials = true;
      
      locationXhr.onload = function() {
        let locationData = null;
        if (locationXhr.status === 200) {
          try {
            locationData = JSON.parse(locationXhr.responseText);
          } catch (err) {
            console.error("JSON parse error for location:", err);
          }
        }
        
        fetchClientData(bookingData, locationData);
      };
      
      locationXhr.onerror = function() {
        console.error("XHR error for location");
        fetchClientData(bookingData, null);
      };
      
      locationXhr.send();
    }
    
    // Function to fetch client data
    function fetchClientData(bookingData: any, locationData: any) {
      if (!bookingData.clientId) {
        fetchAddonData(bookingData, locationData, null);
        return;
      }
      
      const clientXhr = new XMLHttpRequest();
      clientXhr.open("GET", `/api/users/${bookingData.clientId}`, true);
      clientXhr.withCredentials = true;
      
      clientXhr.onload = function() {
        let clientData = null;
        if (clientXhr.status === 200) {
          try {
            clientData = JSON.parse(clientXhr.responseText);
          } catch (err) {
            console.error("JSON parse error for client:", err);
          }
        }
        
        fetchAddonData(bookingData, locationData, clientData);
      };
      
      clientXhr.onerror = function() {
        console.error("XHR error for client");
        fetchAddonData(bookingData, locationData, null);
      };
      
      clientXhr.send();
    }
    
    // Function to fetch addon data
    function fetchAddonData(bookingData: any, locationData: any, clientData: any) {
      const addonXhr = new XMLHttpRequest();
      addonXhr.open("GET", `/api/bookings/${bookingId}/addons`, true);
      addonXhr.withCredentials = true;
      
      addonXhr.onload = function() {
        let addonData = [];
        if (addonXhr.status === 200) {
          try {
            addonData = JSON.parse(addonXhr.responseText);
            if (!Array.isArray(addonData)) {
              addonData = [];
            }
          } catch (err) {
            console.error("JSON parse error for addons:", err);
          }
        }
        
        // Set all data at once
        setData({
          booking: bookingData,
          location: locationData,
          client: clientData,
          addons: addonData
        });
        
        setIsLoading(false);
      };
      
      addonXhr.onerror = function() {
        console.error("XHR error for addons");
        setData({
          booking: bookingData,
          location: locationData,
          client: clientData,
          addons: []
        });
        
        setIsLoading(false);
      };
      
      addonXhr.send();
    }
  }, [bookingId]);
  
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
            </CardHeader>
            <CardContent>
              <p className="text-center">Please wait while we fetch the booking information...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "Failed to load booking data"}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              <Button className="ml-2" onClick={() => setLocation("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Extract data for easier access
  const { booking, location, client, addons } = data;

  // Success state - show booking details with minimal formatting
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking #{booking.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Client info */}
              <div className="border-b pb-2">
                <h3 className="font-bold text-lg">Client Information</h3>
                <p>Name: {client?.username || "Unknown"}</p>
              </div>
              
              {/* Location info */}
              <div className="border-b pb-2">
                <h3 className="font-bold text-lg">Location</h3>
                <p>Name: {location?.title || "Unknown"}</p>
                <p>Address: {location?.address || "Unknown"}</p>
              </div>
              
              {/* Booking details */}
              <div className="border-b pb-2">
                <h3 className="font-bold text-lg">Booking Details</h3>
                <p>Start: {new Date(booking.startDate).toLocaleString()}</p>
                <p>End: {new Date(booking.endDate).toLocaleString()}</p>
                <p>Status: <span className="font-semibold">{booking.status}</span></p>
                {booking.projectName && <p>Project Name: {booking.projectName}</p>}
                {booking.activityType && <p>Activity Type: {booking.activityType}</p>}
                {booking.projectDescription && (
                  <div>
                    <p className="font-semibold mt-2">Project Description:</p>
                    <p className="text-sm">{booking.projectDescription}</p>
                  </div>
                )}
              </div>
              
              {/* Addons */}
              {addons && addons.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg">Add-ons</h3>
                  <ul className="list-disc pl-5">
                    {addons.map((addon: any) => (
                      <li key={addon.id}>
                        {addon.name} - ${(addon.price / 100).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
            
            {location && (
              <Button variant="outline" className="ml-2" onClick={() => setLocation(`/locations/${location.id}`)}>
                View Location
              </Button>
            )}
            
            {client && (
              <Button variant="outline" className="ml-2" onClick={() => setLocation(`/messages?otherUserId=${client.id}&locationId=${location?.id}`)}>
                Message Client
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}