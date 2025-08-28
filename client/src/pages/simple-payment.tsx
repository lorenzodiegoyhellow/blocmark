import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  ArrowLeft,
  CreditCard, 
  Calendar, 
  Clock, 
  Users,
  Plus,
  Check,
  CheckCircle,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Form schema for booking details
const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  guestCount: z.number().min(1, "At least 1 guest is required").max(100),
  activityType: z.string().min(1, "Please enter your activity type"),
  projectName: z.string().min(1, "Please enter a project name"),
  renterCompany: z.string().min(1, "Please enter renter or company name"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof formSchema>;

export default function SimplePayment() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      startTime: "10:00",
      endTime: "12:00",
      guestCount: 1,
      activityType: "Photo Shoot",
      projectName: "",
      renterCompany: "",
      notes: "",
    },
  });

  // Watch form values to calculate price
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const guestCount = form.watch("guestCount");

  // Fetch location data on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/locations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch location data');
        const data = await response.json();
        setLocationData(data);
        
        // Fetch addons for this location
        const addonsResponse = await fetch(`/api/locations/${id}/addons`);
        if (addonsResponse.ok) {
          const addonsData = await addonsResponse.json();
          setAddons(addonsData);
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Could not load location data. Please try again.');
      }
    };
    
    fetchLocation();
  }, [id]);

  // Handle add-on selection
  const handleAddonSelect = (addonId: number) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  // Calculate total price whenever form values or selected add-ons change
  useEffect(() => {
    if (!locationData) return;

    // Calculate hours between start and end time
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      
      // If end time is before start time, assume it's the next day
      let hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 0) {
        hoursDiff += 24;
      }
      
      setHours(Math.max(1, hoursDiff)); // Minimum 1 hour
      const basePrice = locationData.price * Math.max(1, hoursDiff);
      
      // Additional cost per guest beyond the first guest
      const guestFee = guestCount > 1 ? (guestCount - 1) * (locationData.incrementalRate || 0) : 0;
      
      // Add cost of selected add-ons
      const addonsTotal = selectedAddons.reduce((sum, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return sum + (addon ? addon.price : 0);
      }, 0);
      
      // Calculate total
      const calculatedTotal = basePrice + guestFee + addonsTotal;
      setTotalAmount(calculatedTotal);
    }
  }, [locationData, startTime, endTime, guestCount, selectedAddons, addons]);

  const onSubmit = async (data: BookingFormValues) => {
    console.log('=== BOOKING FLOW STARTED ===');
    console.log('Form data:', data);
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be signed in to make a booking',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify authentication is active by checking the current user session
      console.log('Verifying user authentication status');
      const authCheckResponse = await fetch('/api/user', {
        credentials: 'include'
      });
      
      // If authentication check fails, attempt to refresh auth state
      if (!authCheckResponse.ok) {
        console.warn('Authentication validation failed. Status:', authCheckResponse.status);
        
        // Try to recover by using locally stored user ID
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('Session expired. Please log in again to continue.');
        }
        
        toast({
          title: 'Session Validation',
          description: 'Refreshing your session before creating booking...',
        });
        
        // Short delay to allow toast to be seen
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Format dates for API
      const startDate = new Date(data.date);
      const endDate = new Date(data.date);
      
      // Set hours from time inputs
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      
      startDate.setHours(startHours, startMinutes, 0);
      endDate.setHours(endHours, endMinutes, 0);
      
      // If end time is earlier than start time, assume it's the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      // Create booking
      console.log('Creating booking record');
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: parseInt(id || '0'),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guestCount: data.guestCount,
          totalPrice: totalAmount,
          // Don't set status here - let server determine based on instant booking
          activityType: data.activityType,
          projectName: data.projectName || 'Booking on ' + format(data.date, 'PPP'),
          renterCompany: data.renterCompany || user.username,
          projectDescription: data.notes || 'No project description provided',
          // Include clientId explicitly as a fallback in case session auth fails
          clientId: user.id,
          addons: selectedAddons
        }),
        credentials: 'include'
      });

      if (!bookingResponse.ok) {
        // Check for specific auth error
        if (bookingResponse.status === 401) {
          throw new Error('Your session has expired. Please log in again to complete your booking.');
        }
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      console.log('Booking created successfully:', bookingData);
      
      // Invalidate booking queries to ensure fresh data on return
      try {
        // Import dynamically to avoid circular dependencies
        const { queryClient } = await import('@/lib/queryClient');
        queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
        console.log('Invalidated booking queries after booking creation');
      } catch (err) {
        console.error('Failed to invalidate queries:', err);
      }

      // Note: Booking status updates are handled by the Stripe webhook
      // The webhook will properly set status based on instant booking settings
      console.log('Booking created successfully. Webhook will handle status updates.');
      
      const isInstantBooking = locationData?.instantBooking || false;
      console.log(`Location instant booking: ${isInstantBooking}`);
      
      // Set the confirmed booking data and show confirmation
      setConfirmedBooking({
        ...bookingData,
        locationTitle: locationData?.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        projectName: data.projectName,
        activityType: data.activityType,
        renterCompany: data.renterCompany
      });
      setShowConfirmation(true);
      
      // Show success toast with appropriate message
      const toastDescription = isInstantBooking 
        ? "Your instant booking has been confirmed!" 
        : "Your booking is pending approval from the host.";
      
      toast({
        title: "Payment Successful!",
        description: toastDescription,
        duration: 5000,
      });
      
      console.log('=== BOOKING FLOW COMPLETED ===');
      console.log('Showing confirmation overlay');
      
      // Start countdown timer for automatic redirect
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        title: 'Payment Error',
        description: err instanceof Error ? err.message : 'Failed to process payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!locationData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading location data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success confirmation overlay
  if (showConfirmation && confirmedBooking) {
    return (
      <div className="container mx-auto py-12 px-4 min-h-screen">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-40" />
        
        {/* Success Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmation(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Success Icon and Title */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <CheckCircle className="text-amber-600 h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-muted-foreground mt-2">
                  {locationData?.instantBooking 
                    ? "Your instant booking has been confirmed!" 
                    : "Your booking is pending approval from the host."}
                </p>
              </div>
              
              {/* Booking Details */}
              <div className="border rounded-lg p-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{confirmedBooking.locationTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{format(confirmedBooking.date, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>{confirmedBooking.startTime} - {confirmedBooking.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Project:</span>
                  <span>{confirmedBooking.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Activity:</span>
                  <span>{confirmedBooking.activityType}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Total Paid:</span>
                  <span className="font-semibold">${totalAmount}</span>
                </div>
              </div>
              
              {/* Next Steps Alert */}
              <Alert className={locationData?.instantBooking ? "border-green-200 bg-green-50 mb-6" : "border-amber-200 bg-amber-50 mb-6"}>
                <AlertCircle className={locationData?.instantBooking ? "h-4 w-4 text-green-600" : "h-4 w-4 text-amber-600"} />
                <AlertDescription>
                  {locationData?.instantBooking ? (
                    <>
                      <strong>Booking Confirmed!</strong> Your instant booking has been automatically confirmed. 
                      You can now contact the host for check-in details and any questions you may have.
                    </>
                  ) : (
                    <>
                      <strong>Next Steps:</strong> The property host will review your booking request. 
                      You'll receive a notification when they approve or decline. This typically happens within 24 hours.
                    </>
                  )}
                  <br /><br />
                  <strong>Redirecting to dashboard in {countdown} seconds...</strong>
                </AlertDescription>
              </Alert>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/dashboard")}
                >
                  View All Bookings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Would navigate to messages for the location owner
                    navigate("/messages");
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Host
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate("/")}
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/locations/${id}`)}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Location
        </Button>
        <h1 className="text-3xl font-bold text-center">Book {locationData.title}</h1>
        <div className="w-[100px]"></div> {/* Empty div for balance */}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left column: Location details */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-xl overflow-hidden shadow-md flex-1">
            <div className="relative h-72 w-full">
              <img 
                src={locationData.images?.[0] || 'https://placehold.co/600x400?text=No+Image'} 
                alt={locationData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-4 h-full flex flex-col">
              <div>
                <h2 className="text-2xl font-bold">{locationData.title}</h2>
                <p className="text-muted-foreground mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <path d="M9 8h6" />
                    <path d="M9 12h3" />
                  </svg>
                  Address hidden until booking is confirmed
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Base Rate</p>
                  <p className="text-xl font-semibold">${locationData.price}/hr</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Max Capacity</p>
                  <p className="text-xl font-semibold">{locationData.maxCapacity || 'Not specified'}</p>
                </div>
              </div>
              
              {locationData.description && (
                <div className="mt-4 flex-1">
                  <h3 className="font-medium mb-2">About this location</h3>
                  <p className="text-sm text-muted-foreground">
                    {locationData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column: Booking form */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex-1 flex flex-col">
            <div className="p-6 bg-primary text-white">
              <h2 className="text-xl font-semibold">Enter Booking Details</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Fill out the information below to book this location
              </p>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="guestCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Guests</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="07:00">7:00 AM</SelectItem>
                                  <SelectItem value="07:30">7:30 AM</SelectItem>
                                  <SelectItem value="08:00">8:00 AM</SelectItem>
                                  <SelectItem value="08:30">8:30 AM</SelectItem>
                                  <SelectItem value="09:00">9:00 AM</SelectItem>
                                  <SelectItem value="09:30">9:30 AM</SelectItem>
                                  <SelectItem value="10:00">10:00 AM</SelectItem>
                                  <SelectItem value="10:30">10:30 AM</SelectItem>
                                  <SelectItem value="11:00">11:00 AM</SelectItem>
                                  <SelectItem value="11:30">11:30 AM</SelectItem>
                                  <SelectItem value="12:00">12:00 PM</SelectItem>
                                  <SelectItem value="12:30">12:30 PM</SelectItem>
                                  <SelectItem value="13:00">1:00 PM</SelectItem>
                                  <SelectItem value="13:30">1:30 PM</SelectItem>
                                  <SelectItem value="14:00">2:00 PM</SelectItem>
                                  <SelectItem value="14:30">2:30 PM</SelectItem>
                                  <SelectItem value="15:00">3:00 PM</SelectItem>
                                  <SelectItem value="15:30">3:30 PM</SelectItem>
                                  <SelectItem value="16:00">4:00 PM</SelectItem>
                                  <SelectItem value="16:30">4:30 PM</SelectItem>
                                  <SelectItem value="17:00">5:00 PM</SelectItem>
                                  <SelectItem value="17:30">5:30 PM</SelectItem>
                                  <SelectItem value="18:00">6:00 PM</SelectItem>
                                  <SelectItem value="18:30">6:30 PM</SelectItem>
                                  <SelectItem value="19:00">7:00 PM</SelectItem>
                                  <SelectItem value="19:30">7:30 PM</SelectItem>
                                  <SelectItem value="20:00">8:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="08:00">8:00 AM</SelectItem>
                                  <SelectItem value="08:30">8:30 AM</SelectItem>
                                  <SelectItem value="09:00">9:00 AM</SelectItem>
                                  <SelectItem value="09:30">9:30 AM</SelectItem>
                                  <SelectItem value="10:00">10:00 AM</SelectItem>
                                  <SelectItem value="10:30">10:30 AM</SelectItem>
                                  <SelectItem value="11:00">11:00 AM</SelectItem>
                                  <SelectItem value="11:30">11:30 AM</SelectItem>
                                  <SelectItem value="12:00">12:00 PM</SelectItem>
                                  <SelectItem value="12:30">12:30 PM</SelectItem>
                                  <SelectItem value="13:00">1:00 PM</SelectItem>
                                  <SelectItem value="13:30">1:30 PM</SelectItem>
                                  <SelectItem value="14:00">2:00 PM</SelectItem>
                                  <SelectItem value="14:30">2:30 PM</SelectItem>
                                  <SelectItem value="15:00">3:00 PM</SelectItem>
                                  <SelectItem value="15:30">3:30 PM</SelectItem>
                                  <SelectItem value="16:00">4:00 PM</SelectItem>
                                  <SelectItem value="16:30">4:30 PM</SelectItem>
                                  <SelectItem value="17:00">5:00 PM</SelectItem>
                                  <SelectItem value="17:30">5:30 PM</SelectItem>
                                  <SelectItem value="18:00">6:00 PM</SelectItem>
                                  <SelectItem value="18:30">6:30 PM</SelectItem>
                                  <SelectItem value="19:00">7:00 PM</SelectItem>
                                  <SelectItem value="19:30">7:30 PM</SelectItem>
                                  <SelectItem value="20:00">8:00 PM</SelectItem>
                                  <SelectItem value="20:30">8:30 PM</SelectItem>
                                  <SelectItem value="21:00">9:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Photo Shoot, Meeting, Event" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter name of your project" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="renterCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renter/Company</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company name or renter name" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Describe your project, requirements or special requests" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {addons.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg">Available Add-ons</h3>
                        <div className="text-sm text-muted-foreground">Select the add-ons you need</div>
                      </div>
                      
                      <div className="space-y-3 border rounded-md p-4 bg-muted/30">
                        {addons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id={`addon-${addon.id}`}
                                checked={selectedAddons.includes(addon.id)}
                                onCheckedChange={() => handleAddonSelect(addon.id)}
                              />
                              <label 
                                htmlFor={`addon-${addon.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {addon.name}
                              </label>
                            </div>
                            <div className="text-sm font-semibold">${addon.price.toFixed(2)}</div>
                          </div>
                        ))}
                        
                        {addons.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            No add-ons available for this location
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!user && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Required</AlertTitle>
                      <AlertDescription>
                        You need to be logged in to make a booking. Please{' '}
                        <a href="/auth" className="underline font-medium">sign in or create an account</a>{' '}
                        before proceeding.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-width booking summary section */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-semibold mb-6 text-center">Booking Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-full p-4 mb-3">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-medium text-lg mb-1">Date</h4>
              <p className="text-muted-foreground">
                {form.watch("date") ? format(form.watch("date"), "PPP") : "Not selected"}
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-full p-4 mb-3">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-medium text-lg mb-1">Time</h4>
              <p className="text-muted-foreground">
                {form.watch("startTime") && form.watch("endTime") 
                  ? `${form.watch("startTime")} to ${form.watch("endTime")}`
                  : "Not selected"}
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-full p-4 mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-medium text-lg mb-1">Guests</h4>
              <p className="text-muted-foreground">{form.watch("guestCount") || 1} people</p>
            </div>
          </div>
          
          <div className="border-t border-b py-6 max-w-xl mx-auto">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price (${locationData.price}/hr × {hours} hrs)</span>
                <span className="font-medium">${locationData.price * hours}</span>
              </div>
              
              {guestCount > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional guests ({guestCount - 1} × ${locationData.incrementalRate || 0})</span>
                  <span className="font-medium">${(guestCount - 1) * (locationData.incrementalRate || 0)}</span>
                </div>
              )}
              
              {/* Show selected add-ons in the summary */}
              {selectedAddons.length > 0 && (
                <div className="pt-3">
                  <div className="font-medium mb-2">Selected Add-ons:</div>
                  {selectedAddons.map(addonId => {
                    const addon = addons.find(a => a.id === addonId);
                    if (!addon) return null;
                    return (
                      <div key={addonId} className="flex justify-between ml-2 mb-1">
                        <span className="text-muted-foreground flex items-center">
                          <Check className="h-3 w-3 mr-1" /> {addon.name}
                        </span>
                        <span className="font-medium">${addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center max-w-xl mx-auto pt-6">
            <span className="text-xl font-semibold">Total amount</span>
            <span className="text-2xl font-bold text-primary">${totalAmount}</span>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="px-8 py-6 h-auto text-lg" 
              size="lg"
              disabled={loading || !user}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M12 7v10" />
              <path d="M12 7H8" />
            </svg>
            Secure payment processed by Stripe
          </div>
        </div>
      </div>
      
      {/* Footer section */}
      <div className="mt-12 border-t pt-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            © 2025 Blocmark. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/terms" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Terms</a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Privacy</a>
            <a href="/sitemap" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Sitemap</a>
            <a href="/accessibility" className="text-sm text-muted-foreground hover:text-primary-foreground transition">Accessibility</a>
          </div>
        </div>
      </div>
    </div>
  );
}