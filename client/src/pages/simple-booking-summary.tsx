import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Ultra-simplified booking summary page, using URL parameters
export default function SimpleBookingSummary() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [bookingData, setBookingData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Try to extract data from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const bookingDataStr = searchParams.get('data');

    if (bookingDataStr) {
      try {
        // Try to decode and parse the data
        const decodedStr = decodeURIComponent(bookingDataStr);
        const parsedData = JSON.parse(decodedStr);
        console.log("Loaded booking data from URL parameters:", parsedData);
        setBookingData(parsedData);
      } catch (error) {
        console.error("Error parsing booking data from URL:", error);
      }
    } else {
      // Fallback to localStorage
      try {
        const localData = localStorage.getItem('bookingData');
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log("Loaded booking data from localStorage:", parsedData);
          setBookingData(parsedData);
        } else {
          console.warn("No booking data found in localStorage");
        }
      } catch (error) {
        console.error("Error loading booking data from localStorage:", error);
      }
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading booking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost"
          className="mb-6" 
          onClick={() => setLocation(`/locations/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to location
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Booking Summary</CardTitle>
          </CardHeader>
          
          <CardContent>
            {bookingData ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="font-medium mb-2">Booking Details</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      {bookingData.startDate}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      {bookingData.startTime} - {bookingData.endTime}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Group Size: </span>
                      {bookingData.guestCount} people
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      {bookingData.hours || 'N/A'} hours
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 border-t pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base rate</span>
                    <span>${bookingData.basePrice || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>${bookingData.serviceFee || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${bookingData.totalPrice || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="mb-4">
                <AlertTitle>No booking data found</AlertTitle>
                <AlertDescription>
                  We couldn't find your booking details. Please return to the location page and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/locations/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {bookingData && (
              <Button
                onClick={() => {
                  alert("Booking confirmed!");
                }}
              >
                Complete Booking
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Debug info */}
        <div className="mt-6 text-xs text-muted-foreground">
          <p>Location ID: {id}</p>
          <p>Data Source: {new URLSearchParams(window.location.search).get('data') ? 'URL parameters' : 'localStorage'}</p>
        </div>
      </div>
    </div>
  );
}