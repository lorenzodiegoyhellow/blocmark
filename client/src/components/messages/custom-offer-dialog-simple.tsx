import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Loader2, CalendarIcon, Plus, X, Camera, Video, Calendar as CalendarIcon2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Addon = {
  id: number;
  name: string;
  price: number;
  priceUnit: string;
  description: string | null;
};

type AdditionalFee = {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
};

type CustomOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  locationTitle: string;
  recipientId: number;
  recipientName: string;
};

export function CustomOfferDialogSimple({
  open,
  onOpenChange,
  locationId,
  locationTitle,
  recipientId,
  recipientName
}: CustomOfferDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [customPriceMode, setCustomPriceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("small");
  const [activityType, setActivityType] = useState<string>("");
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [additionalFees, setAdditionalFees] = useState<AdditionalFee[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [locationAdditionalFees, setLocationAdditionalFees] = useState<any[]>([]);
  const [includeLocationFees, setIncludeLocationFees] = useState(true);

  // Fetch location data, addons, and bookings
  useEffect(() => {
    if (!open || !locationId) return;
    
    // Only proceed if we have valid props
    if (locationId > 0) {
      // Fetch location details for base price and additional fees
      fetch(`/api/locations/${locationId}`)
        .then(res => res.json())
        .then(data => {
          console.log('Location data fetched:', data);
          console.log('Pricing matrix:', data.pricingMatrix);
          console.log('Enabled activities:', data.enabledActivities);
          
          // Parse pricingMatrix if it's a string
          if (data.pricingMatrix && typeof data.pricingMatrix === 'string') {
            try {
              data.pricingMatrix = JSON.parse(data.pricingMatrix);
              console.log('Parsed pricing matrix:', data.pricingMatrix);
            } catch (e) {
              console.error('Error parsing pricingMatrix:', e);
            }
          }
          
          // Parse enabledActivities if it's a string
          if (data.enabledActivities && typeof data.enabledActivities === 'string') {
            try {
              data.enabledActivities = JSON.parse(data.enabledActivities);
            } catch (e) {
              console.error('Error parsing enabledActivities:', e);
            }
          }
          
          // Set default activity type to first enabled activity
          if (data.enabledActivities && data.enabledActivities.length > 0) {
            setActivityType(data.enabledActivities[0]);
          }
          
          setLocationData(data);
          
          // Set default hourly rate based on first activity and small group
          if (data.pricingMatrix && data.enabledActivities?.length > 0) {
            const firstActivity = data.enabledActivities[0];
            const smallGroupPrice = data.pricingMatrix[firstActivity]?.small || data.price || 0;
            setHourlyRate(smallGroupPrice.toString());
          } else if (data.price) {
            setHourlyRate(data.price.toString());
          }
          
          // Parse and set additional fees from location
          if (data.additionalFees) {
            try {
              const fees = typeof data.additionalFees === 'string' 
                ? JSON.parse(data.additionalFees) 
                : data.additionalFees;
              if (Array.isArray(fees)) {
                setLocationAdditionalFees(fees);
              }
            } catch (e) {
              console.error('Error parsing additional fees:', e);
            }
          }
          // Parse blocked dates from availability
          if (data.availability) {
            try {
              const availability = typeof data.availability === 'string' 
                ? JSON.parse(data.availability) 
                : data.availability;
              if (availability.blockedDates && Array.isArray(availability.blockedDates)) {
                setBlockedDates(availability.blockedDates.map((d: string) => new Date(d)));
              }
            } catch (e) {
              console.error('Error parsing availability:', e);
            }
          }
        })
        .catch(err => console.error('Error fetching location:', err));

      // Fetch addons
      fetch(`/api/locations/${locationId}/addons`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAddons(data);
          }
        })
        .catch(err => console.error('Error fetching addons:', err));

      // Fetch existing bookings for the location
      fetch(`/api/bookings/location/${locationId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log('All bookings:', data);
            const filteredBookings = data.filter(b => 
              b.status === 'confirmed' || b.status === 'pending'
            );
            console.log('Filtered bookings (confirmed/pending):', filteredBookings);
            setExistingBookings(filteredBookings);
          }
        })
        .catch(err => console.error('Error fetching bookings:', err));
    }
  }, [open, locationId]);

  // Update hourly rate when group size or activity changes
  useEffect(() => {
    if (locationData && !customPriceMode && activityType) {
      let newRate = locationData.price || 0; // Default fallback
      
      // Use pricing matrix if available
      if (locationData.pricingMatrix && locationData.pricingMatrix[activityType]) {
        const activityPricing = locationData.pricingMatrix[activityType];
        
        if (attendees === 'small') {
          newRate = activityPricing.small || locationData.price || 0;
        } else if (attendees === 'medium') {
          newRate = activityPricing.medium || locationData.price || 0;
        } else if (attendees === 'large') {
          newRate = activityPricing.large || locationData.price || 0;
        } else if (attendees === 'extraLarge') {
          newRate = activityPricing.extraLarge || locationData.price || 0;
        }
      }
      
      console.log('Setting hourly rate for', activityType, attendees, 'group:', newRate);
      setHourlyRate(newRate.toString());
    }
  }, [attendees, activityType, locationData, customPriceMode]);

  // Calculate total price when hours, group size, or fees change
  useEffect(() => {
    if (startTime && endTime && hourlyRate && !customPriceMode) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      const hours = end > start ? end - start : 0;
      
      // Calculate base price
      let calculatedTotal = hours * parseFloat(hourlyRate);
      
      // Add selected addons
      if (selectedAddons.length > 0 && addons.length > 0) {
        selectedAddons.forEach(addonId => {
          const addon = addons.find(a => a.id === addonId);
          if (addon) {
            calculatedTotal += addon.price;
          }
        });
      }
      
      // Add location fees if included
      if (includeLocationFees && locationAdditionalFees.length > 0) {
        locationAdditionalFees.forEach(fee => {
          if (fee.type === 'percentage') {
            calculatedTotal += (calculatedTotal * fee.amount / 100);
          } else {
            calculatedTotal += fee.amount;
          }
        });
      }
      
      // Add custom additional fees
      additionalFees.forEach(fee => {
        if (fee.name && fee.amount > 0) {
          if (fee.type === 'percentage') {
            calculatedTotal += (calculatedTotal * fee.amount / 100);
          } else {
            calculatedTotal += fee.amount;
          }
        }
      });
      
      setTotalPrice(calculatedTotal.toFixed(2));
    }
  }, [startTime, endTime, hourlyRate, customPriceMode, selectedAddons, addons, includeLocationFees, locationAdditionalFees, additionalFees]);

  // Get booked hours for a specific date
  const getBookedHoursForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate || !existingBookings) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const bookedHours: number[] = [];
    
    existingBookings.forEach(booking => {
      // Only consider confirmed bookings, not cancelled or rejected ones
      if (booking.status !== 'confirmed' && booking.status !== 'pending') return;
      
      const bookingStartDate = new Date(booking.startDate);
      const bookingEndDate = new Date(booking.endDate);
      const bookingDateStr = bookingStartDate.toISOString().split('T')[0];
      
      if (bookingDateStr === dateStr) {
        const startHour = bookingStartDate.getUTCHours();
        const endHour = bookingEndDate.getUTCHours();
        
        // If end hour is 0 (midnight), it means it goes until midnight (24)
        const actualEndHour = endHour === 0 ? 24 : endHour;
        
        console.log('Booking on', dateStr, '- Start:', startHour, 'End:', actualEndHour, 'Status:', booking.status);
        
        for (let hour = startHour; hour < actualEndHour; hour++) {
          bookedHours.push(hour);
        }
      }
    });
    
    console.log('Booked hours for', dateStr, ':', bookedHours);
    return bookedHours;
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (hour: number, selectedDate: Date | undefined) => {
    const bookedHours = getBookedHoursForDate(selectedDate);
    return !bookedHours.includes(hour);
  };

  const addAdditionalFee = () => {
    setAdditionalFees([...additionalFees, { name: '', amount: 0, type: 'fixed' }]);
  };

  const removeAdditionalFee = (index: number) => {
    setAdditionalFees(additionalFees.filter((_, i) => i !== index));
  };

  const handleSendOffer = async () => {
    const finalPrice = customPriceMode ? hourlyRate : totalPrice;
    
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    if (!date || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description: "Please select date and time",
        variant: "destructive"
      });
      return;
    }

    if (locationData?.enabledActivities?.length > 0 && !activityType) {
      toast({
        title: "Missing activity type",
        description: "Please select an activity type",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/messages/custom-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          locationId,
          recipientId,
          customPrice: parseFloat(customPriceMode ? hourlyRate : (totalPrice || hourlyRate)),
          message: message || `Custom offer for ${locationTitle}`,
          date: date ? format(date, 'yyyy-MM-dd') : null,
          startTime: startTime || null,
          endTime: endTime || null,
          attendees: attendees, // Keep as string for group size (small/medium/large/extraLarge)
          groupSize: attendees, // Also send as groupSize for clarity
          activityType: activityType || null, // Include activity type
          selectedAddons,
          additionalFees: [
            ...(includeLocationFees ? locationAdditionalFees : []),
            ...additionalFees.filter(fee => fee.name && fee.amount > 0)
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send custom offer');
      }

      toast({
        title: "Custom offer sent",
        description: `Your custom offer has been sent to ${recipientName}.`
      });
      
      onOpenChange(false);
      
      // Refresh messages
      window.location.reload();
    } catch (error) {
      console.error('Error sending custom offer:', error);
      toast({
        title: "Failed to send offer",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate hours between start and end time
  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour > startHour ? endHour - startHour : 0;
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const displayTime = hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
    timeOptions.push({ value: time, label: displayTime });
  }

  // Early return if required props are missing (after all hooks)
  if (!locationId || !recipientId || locationId <= 0 || recipientId <= 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Custom Offer</DialogTitle>
          <DialogDescription>
            Create a custom offer for {recipientName} for {locationTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Date and Time Selection */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select a date"}
              </Button>
              {showCalendar && (
                <div className="border rounded-lg p-2 flex justify-center custom-offer-calendar">
                  <Calendar
                    className="rounded-md border"
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setShowCalendar(false);
                    }}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      // Check if date is in the past
                      if (date < today) return true;
                      
                      // Check if date is blocked
                      const dateStr = date.toISOString().split('T')[0];
                      return blockedDates.some(blocked => 
                        blocked.toISOString().split('T')[0] === dateStr
                      );
                    }}
                    modifiers={{
                      booked: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return existingBookings.some(booking => {
                          // Only show confirmed and pending bookings as booked
                          if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
                          
                          const bookingStartDate = new Date(booking.startDate);
                          const bookingDateStr = bookingStartDate.toISOString().split('T')[0];
                          console.log('Checking date:', dateStr, 'Booking date:', bookingDateStr, 'Status:', booking.status);
                          return bookingDateStr === dateStr;
                        });
                      },
                      blocked: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return blockedDates.some(blocked => 
                          blocked.toISOString().split('T')[0] === dateStr
                        );
                      }
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        fontWeight: 'bold'
                      },
                      blocked: {
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 'bold',
                        opacity: 0.8
                      }
                    }}
                    modifiersClassNames={{
                      booked: 'booked-date',
                      blocked: 'blocked-date'
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500 space-y-1 flex justify-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-100 rounded border border-red-300"></span>
                        <span>Blocked dates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-100 rounded border border-yellow-300"></span>
                        <span>Existing bookings</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => {
                    const hour = parseInt(option.value.split(':')[0]);
                    const isAvailable = isTimeSlotAvailable(hour, date);
                    return (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={!isAvailable}
                      >
                        {option.label} {!isAvailable && "(Booked)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => {
                    const hour = parseInt(option.value.split(':')[0]);
                    // Check if any hour in the range from startTime to this option is booked
                    let isAvailable = true;
                    if (startTime && date) {
                      const startHour = parseInt(startTime.split(':')[0]);
                      for (let h = startHour; h < hour; h++) {
                        if (!isTimeSlotAvailable(h, date)) {
                          isAvailable = false;
                          break;
                        }
                      }
                    }
                    return (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={!isAvailable || !startTime || hour <= parseInt(startTime?.split(':')[0] || '0')}
                      >
                        {option.label} {!isAvailable && "(Includes booked hours)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

            {/* Show booked hours for selected date */}
            {date && getBookedHoursForDate(date).length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xs text-yellow-800">
                  <span className="font-medium">⚠️ Booked hours on this date:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getBookedHoursForDate(date).map(hour => {
                      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                      const ampm = hour < 12 ? 'AM' : 'PM';
                      return (
                        <span key={hour} className="px-2 py-0.5 bg-yellow-200 rounded text-xs">
                          {displayHour}:00 {ampm}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Duration and Pricing */}
            {startTime && endTime && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {(() => {
                      const start = parseInt(startTime.split(':')[0]);
                      const end = parseInt(endTime.split(':')[0]);
                      const hours = end > start ? end - start : 0;
                      return `${hours} hour${hours !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label>Pricing</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-price-toggle" className="text-sm font-normal">
                  Custom price
                </Label>
                <Checkbox
                  id="custom-price-toggle"
                  checked={customPriceMode}
                  onCheckedChange={(checked) => setCustomPriceMode(checked as boolean)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hourly-rate">
                {customPriceMode ? "Custom Hourly Rate ($)" : "Hourly Rate ($)"}
              </Label>
              <Input
                id="hourly-rate"
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="Enter hourly rate"
                disabled={!customPriceMode && locationData}
              />
            </div>

            {!customPriceMode && startTime && endTime && hourlyRate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Price:</span>
                  <span className="text-lg font-bold">${totalPrice || '0.00'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Type */}
          {locationData?.enabledActivities?.length > 0 && (
            <div className="grid gap-2">
              <Label>Activity Type</Label>
              <Select 
                value={activityType} 
                onValueChange={setActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.enabledActivities.includes('photo') && (
                    <SelectItem value="photo">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Photo Shoot
                      </div>
                    </SelectItem>
                  )}
                  {locationData.enabledActivities.includes('video') && (
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Production
                      </div>
                    </SelectItem>
                  )}
                  {locationData.enabledActivities.includes('event') && (
                    <SelectItem value="event">
                      <div className="flex items-center gap-2">
                        <CalendarIcon2 className="w-4 h-4" />
                        Event
                      </div>
                    </SelectItem>
                  )}
                  {locationData.enabledActivities.includes('meeting') && (
                    <SelectItem value="meeting">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Meeting
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Group Size */}
          <div className="grid gap-2">
            <Label>Group Size</Label>
            <Select 
              value={attendees} 
              onValueChange={setAttendees}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  Small Group (1-5 people) - {
                    activityType && locationData?.pricingMatrix?.[activityType]?.small
                      ? `$${locationData.pricingMatrix[activityType].small}/hr`
                      : 'Price not set'
                  }
                </SelectItem>
                
                <SelectItem value="medium">
                  Medium Group (6-15 people) - {
                    activityType && locationData?.pricingMatrix?.[activityType]?.medium
                      ? `$${locationData.pricingMatrix[activityType].medium}/hr`
                      : 'Price not set'
                  }
                </SelectItem>
                
                <SelectItem value="large">
                  Large Group (16-30 people) - {
                    activityType && locationData?.pricingMatrix?.[activityType]?.large
                      ? `$${locationData.pricingMatrix[activityType].large}/hr`
                      : 'Price not set'
                  }
                </SelectItem>
                
                <SelectItem value="extraLarge">
                  31+ people - {
                    activityType && locationData?.pricingMatrix?.[activityType]?.extraLarge
                      ? `$${locationData.pricingMatrix[activityType].extraLarge}/hr`
                      : 'Price not set'
                  }
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add-ons */}
          {addons && addons.length > 0 && (
            <div className="grid gap-2">
              <Label>Add-ons</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`addon-${addon.id}`}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAddons([...selectedAddons, addon.id]);
                        } else {
                          setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`addon-${addon.id}`} className="font-normal cursor-pointer">
                        {addon.name} - ${addon.price}/{addon.priceUnit}
                      </Label>
                      {addon.description && (
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Location Fees */}
          {locationAdditionalFees && locationAdditionalFees.length > 0 && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Existing Location Fees</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 font-normal">Include</Label>
                  <input
                    type="checkbox"
                    checked={includeLocationFees}
                    onChange={(e) => setIncludeLocationFees(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className={cn(
                "space-y-2 p-3 bg-blue-50 rounded-lg transition-opacity",
                !includeLocationFees && "opacity-50"
              )}>
                {locationAdditionalFees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{fee.name}</span>
                    <span>
                      {fee.type === 'percentage' 
                        ? `${fee.amount}%` 
                        : `$${fee.amount}`}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-gray-600 mt-2">
                  {includeLocationFees 
                    ? "These fees will be automatically included in the offer"
                    : "These fees will not be included in the offer"}
                </div>
              </div>
            </div>
          )}

          {/* Additional Custom Fees */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Additional Custom Fees</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditionalFee}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Fee
              </Button>
            </div>
            <div className="space-y-2">
              {additionalFees.map((fee, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Fee name"
                      value={fee.name}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[index].name = e.target.value;
                        setAdditionalFees(updated);
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={fee.amount}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[index].amount = parseFloat(e.target.value) || 0;
                        setAdditionalFees(updated);
                      }}
                      className="w-24"
                    />
                    <Select
                      value={fee.type}
                      onValueChange={(value: 'fixed' | 'percentage') => {
                        const updated = [...additionalFees];
                        updated[index].type = value;
                        setAdditionalFees(updated);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">$</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdditionalFee(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message with your custom offer..."
              rows={3}
            />
          </div>

          {/* Total Summary */}
          {date && startTime && endTime && hourlyRate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Offer Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{format(date, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{startTime} - {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{calculateHours(startTime, endTime)} hours</span>
                </div>
                {activityType && (
                  <div className="flex justify-between">
                    <span>Activity Type:</span>
                    <span className="font-medium">
                      {activityType === 'photo' ? 'Photo Shoot' :
                       activityType === 'video' ? 'Video Production' :
                       activityType === 'event' ? 'Event' :
                       activityType === 'meeting' ? 'Meeting' : activityType}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Group Size:</span>
                  <span className="font-medium">
                    {attendees === 'small' ? 'Small (1-5 people)' :
                     attendees === 'medium' ? 'Medium (6-15 people)' :
                     attendees === 'large' ? 'Large (16-30 people)' :
                     attendees === 'extraLarge' ? '31+ people' : attendees}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">${hourlyRate}/hour</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="font-medium">Add-ons:</div>
                    {addons.filter(addon => selectedAddons.includes(addon.id)).map((addon) => (
                      <div key={addon.id} className="flex justify-between pl-4">
                        <span>{addon.name}</span>
                        <span>${addon.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(includeLocationFees && locationAdditionalFees.length > 0) && (
                  <div className="pt-2 border-t">
                    <div className="font-medium">Location Fees:</div>
                    {locationAdditionalFees.map((fee, index) => (
                      <div key={index} className="flex justify-between pl-4">
                        <span>{fee.name}</span>
                        <span>
                          {fee.type === 'percentage' ? `${fee.amount}%` : `$${fee.amount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {additionalFees.filter(fee => fee.name && fee.amount > 0).length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="font-medium">Additional Custom Fees:</div>
                    {additionalFees.filter(fee => fee.name && fee.amount > 0).map((fee, index) => (
                      <div key={index} className="flex justify-between pl-4">
                        <span>{fee.name}</span>
                        <span>
                          {fee.type === 'percentage' ? `${fee.amount}%` : `$${fee.amount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 mt-2 border-t font-semibold">
                  <div className="flex justify-between text-base">
                    <span>Total Price:</span>
                    <span className="text-green-600">
                      ${(() => {
                        if (customPriceMode) {
                          // In custom price mode, calculate total with custom hourly rate
                          const hours = calculateHours(startTime, endTime);
                          const baseTotal = hours * parseFloat(hourlyRate || '0');
                          let finalTotal = baseTotal;
                          
                          // Add selected addons
                          if (selectedAddons.length > 0) {
                            selectedAddons.forEach(addonId => {
                              const addon = addons.find(a => a.id === addonId);
                              if (addon) finalTotal += addon.price;
                            });
                          }
                          
                          // Add location fees if included
                          if (includeLocationFees && locationAdditionalFees.length > 0) {
                            locationAdditionalFees.forEach(fee => {
                              if (fee.type === 'percentage') {
                                finalTotal += (baseTotal * fee.amount / 100);
                              } else {
                                finalTotal += fee.amount;
                              }
                            });
                          }
                          
                          // Add custom fees
                          additionalFees.forEach(fee => {
                            if (fee.name && fee.amount > 0) {
                              if (fee.type === 'percentage') {
                                finalTotal += (baseTotal * fee.amount / 100);
                              } else {
                                finalTotal += fee.amount;
                              }
                            }
                          });
                          
                          return finalTotal.toFixed(2);
                        } else {
                          // In auto price mode, use the calculated total price
                          return totalPrice || '0.00';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={isLoading || !hourlyRate || !date || !startTime || !endTime}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Offer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}