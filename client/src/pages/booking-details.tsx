import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Location } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type BookingDetails = {
  startDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalPrice: number;
  basePrice: number;
  serviceFee: number;
  // Add these fields to fix type issues
  activityType?: string;
  projectName?: string;
  renterCompany?: string;
  projectDescription?: string;
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Project details state
  const [activityType, setActivityType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [renterCompany, setRenterCompany] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Get location data
  const { data: locationData, isLoading } = useQuery<Location>({
    queryKey: [`/api/locations/${id}`],
  });

  // State for tracking booking details and loading state
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Effect to load booking details from localStorage on component mount
  useEffect(() => {
    console.log("Checking for booking data in localStorage");
    
    async function loadBookingDetails() {
      try {
        // First try to get data from localStorage
        const storedData = localStorage.getItem('current_booking_data');
        
        if (storedData) {
          console.log("Found booking data in localStorage!");
          const parsedData = JSON.parse(storedData);
          setBookingDetails(parsedData);
          
          // Pre-fill form fields if the data exists
          if (parsedData.activityType && activityType === "") {
            setActivityType(parsedData.activityType);
          }
          
          if (parsedData.projectName && projectName === "") {
            setProjectName(parsedData.projectName);
          }
          
          if (parsedData.renterCompany && renterCompany === "") {
            setRenterCompany(parsedData.renterCompany);
          }
          
          if (parsedData.projectDescription && projectDescription === "") {
            setProjectDescription(parsedData.projectDescription);
          }
          
          // Clear localStorage to prevent stale data on future visits
          localStorage.removeItem('current_booking_data');
          setLoadingBookingDetails(false);
          return;
        }
        
        // If nothing in localStorage, try URL parameters as fallback
        console.log("No data in localStorage, checking URL parameters");
        let params: URLSearchParams;
        try {
          const queryString = location.includes('?') ? location.split('?')[1] : '';
          console.log("URL query string:", queryString);
          params = new URLSearchParams(queryString);
        } catch (error) {
          console.error("Error parsing URL:", error);
          params = new URLSearchParams();
        }
        
        const bookingDetailsStr = params.get('details');
        console.log("Booking details from URL:", bookingDetailsStr);
        
        if (bookingDetailsStr) {
          const parsedData = JSON.parse(decodeURIComponent(bookingDetailsStr));
          setBookingDetails(parsedData);
          
          // Pre-fill form fields
          if (parsedData.activityType && activityType === "") {
            setActivityType(parsedData.activityType);
          }
          
          if (parsedData.projectName && projectName === "") {
            setProjectName(parsedData.projectName);
          }
          
          if (parsedData.renterCompany && renterCompany === "") {
            setRenterCompany(parsedData.renterCompany);
          }
          
          if (parsedData.projectDescription && projectDescription === "") {
            setProjectDescription(parsedData.projectDescription);
          }
        } else {
          // No booking data found in localStorage or URL
          setLoadingError("No booking information found. Please select a location and date to book.");
        }
      } catch (error) {
        console.error("Error loading booking details:", error);
        setLoadingError("Error loading booking information. Please try again.");
      } finally {
        // Always set loading to false when done, regardless of success or failure
        setLoadingBookingDetails(false);
      }
    }
    
    loadBookingDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!locationData) {
    // Location data couldn't be loaded
    toast({
      title: "Error",
      description: "Could not load location data. Returning to location page.",
      variant: "destructive",
    });
    setLocation(`/locations/${id}`);
    return null;
  }

  if (loadingBookingDetails) {
    // Show loading state while we're checking for booking data
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation(`/locations/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to location
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Loading Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading your booking information...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!bookingDetails) {
    // We've finished loading but didn't find any booking details
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation(`/locations/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to location
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Booking Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-center font-medium">
                  {loadingError || "No booking information found. Please select a date and time on the location page."}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation(`/locations/${id}`)}
                >
                  Return to Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: any) => {
    if (e) e.preventDefault();
    console.log("Button clicked with values:", { activityType, projectName, renterCompany, projectDescription });

    if (!activityType || !projectName || !renterCompany || !projectDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all project details",
        variant: "destructive",
      });
      return;
    }

    // Combine booking details with project details
    const completeBookingDetails = {
      ...bookingDetails,
      activityType,
      projectName,
      renterCompany,
      projectDescription,
    };
    
    console.log("Complete booking details:", completeBookingDetails);
    
    try {
      // Store in localStorage for the booking summary page
      localStorage.setItem('complete_booking_data', JSON.stringify(completeBookingDetails));
      console.log("Booking data saved to localStorage");
      
      // Use direct window.location.href navigation which is most reliable
      console.log("Navigating directly with window.location.href");
      
      // Build the URL with query parameters
      const url = `/locations/${id}/booking-summary?details=${encodeURIComponent(JSON.stringify(completeBookingDetails))}`;
      console.log("Navigation URL:", url);
      
      // Navigate directly
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating to booking summary:", error);
      toast({
        title: "Navigation Error",
        description: "There was an error navigating to the booking summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation(`/locations/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to location
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Activity Type</label>
                  <Select value={activityType} onValueChange={setActivityType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photoshoot">Photoshoot</SelectItem>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <Input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Renter/Company</label>
                  <Input
                    value={renterCompany}
                    onChange={e => setRenterCompany(e.target.value)}
                    placeholder="Enter renter or company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">About Your Project</label>
                  <Textarea
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder="Tell us about your project..."
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base price</span>
                      <span>${bookingDetails.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>${bookingDetails.serviceFee}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total (USD)</span>
                      <span>${bookingDetails.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <a 
                  href={`/locations/${id}/booking-summary`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    // Skip all complex logic and just use basic HTML redirect with localStorage
                    if (!activityType || !projectName || !renterCompany || !projectDescription) {
                      toast({
                        title: "Missing information",
                        description: "Please fill in all project details",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    try {
                      // Store in localStorage
                      const completeData = {
                        ...bookingDetails,
                        activityType,
                        projectName,
                        renterCompany,
                        projectDescription,
                      };
                      
                      localStorage.setItem('complete_booking_data', JSON.stringify(completeData));
                      console.log("Data saved, redirecting to:", `/locations/${id}/booking-summary`);
                      
                      // Direct browser navigation
                      window.location.href = `/locations/${id}/booking-summary`;
                    } catch (err) {
                      console.error("Navigation error:", err);
                      alert("There was an error navigating to the booking summary. Please try again.");
                    }
                  }}
                >
                  <Button 
                    className="w-full" 
                    type="button"
                  >
                    Review Booking
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}