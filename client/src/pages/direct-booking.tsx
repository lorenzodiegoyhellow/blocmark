import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Info } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Super simplified approach with minimal dependencies
export default function DirectBookingPage() {
  const { id } = useParams<{ id: string }>();
  const [locationPath, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<any>(null);

  console.log("DirectBookingPage mounting with id:", id);

  // Just basic location info without dependencies on state or queries
  useEffect(() => {
    console.log("DirectBookingPage useEffect running");
    
    try {
      // Try to get booking data from localStorage
      const savedData = localStorage.getItem('bookingData');
      if (savedData) {
        console.log("Found booking data in localStorage");
        const parsedData = JSON.parse(savedData);
        setBookingData(parsedData);
      } else {
        console.warn("No booking data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  }, []);

  // Super simple component rendering
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingData ? (
            <div className="space-y-4">
              <p><strong>Location ID:</strong> {id}</p>
              <p><strong>Date:</strong> {bookingData.startDate}</p>
              <p><strong>Time:</strong> {bookingData.startTime} - {bookingData.endTime}</p>
              <p><strong>Guests:</strong> {bookingData.guestCount}</p>
              <p><strong>Total Price:</strong> ${bookingData.totalPrice}</p>
            </div>
          ) : (
            <Alert>
              <AlertTitle>No booking data found</AlertTitle>
              <AlertDescription>
                We couldn't find your booking details. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setLocation(`/locations/${id}`)}
            className="mr-4"
          >
            Back to Location
          </Button>
          
          {bookingData && (
            <Button
              onClick={() => {
                toast({
                  title: "Booking Confirmed",
                  description: "Your booking has been submitted successfully",
                });
              }}
            >
              Confirm Booking
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-8 p-4 bg-muted rounded text-sm">
        <h2 className="font-semibold mb-2">Debug Information</h2>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({
            locationId: id,
            hasBookingData: !!bookingData,
            pathname: window.location.pathname,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}