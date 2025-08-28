import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Location, LocationCalendarIntegration } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Link, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AvailabilityDialogProps = {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
};

export function AvailabilityDialog({ location, isOpen, onClose }: AvailabilityDialogProps) {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Set<string>>(new Set());
  const [showGoogleCalendarSetup, setShowGoogleCalendarSetup] = useState(false);
  const [blockingMode, setBlockingMode] = useState<'full-day' | 'time-slots'>('full-day');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set());

  // Fetch calendar integration status
  const { data: calendarIntegration, isLoading: calendarLoading } = useQuery<LocationCalendarIntegration | null>({
    queryKey: [`/api/locations/${location.id}/calendar-integration`],
    enabled: isOpen && !!location.id,
  });

  // Parse the stored availability from the location object
  useEffect(() => {
    if (location && location.availability) {
      try {
        const availabilityData = typeof location.availability === 'string' 
          ? JSON.parse(location.availability) 
          : location.availability;
          
        if (availabilityData.blockedDates) {
          const parsedDates = availabilityData.blockedDates.map((dateStr: string) => new Date(dateStr));
          setBlockedDates(parsedDates);
        }
        
        if (availabilityData.blockedTimeSlots) {
          setBlockedTimeSlots(new Set(availabilityData.blockedTimeSlots));
        }
      } catch (error) {
        console.error("Error parsing availability data:", error);
        setBlockedDates([]);
        setBlockedTimeSlots(new Set());
      }
    }
  }, [location]);

  // Function to check if a date is already blocked
  const isDateBlocked = (date: Date): boolean => {
    return blockedDates.some(
      (blockedDate) => 
        blockedDate.getFullYear() === date.getFullYear() &&
        blockedDate.getMonth() === date.getMonth() &&
        blockedDate.getDate() === date.getDate()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If date is already selected, remove it
    if (selectedDates.some(
      (selectedDate) => 
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate()
    )) {
      setSelectedDates(selectedDates.filter(
        (selectedDate) => 
          !(selectedDate.getFullYear() === date.getFullYear() &&
          selectedDate.getMonth() === date.getMonth() &&
          selectedDate.getDate() === date.getDate())
      ));
    } else {
      // Otherwise add it
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Save availability settings - handles both blocking and unblocking dates/time slots
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (action: 'block' | 'unblock') => {
      let updatedBlockedDates: Date[] = [...blockedDates];
      let updatedBlockedTimeSlots: Set<string> = new Set(blockedTimeSlots);
      
      if (blockingMode === 'full-day') {
        if (action === 'block') {
          // Combine existing blocked dates with newly selected dates
          updatedBlockedDates = [
            ...blockedDates,
            ...selectedDates.filter(date => !isDateBlocked(date))
          ];
        } else {
          // Remove selected dates from blocked dates
          updatedBlockedDates = blockedDates.filter(blockedDate => 
            !selectedDates.some(selectedDate =>
              selectedDate.getFullYear() === blockedDate.getFullYear() &&
              selectedDate.getMonth() === blockedDate.getMonth() &&
              selectedDate.getDate() === blockedDate.getDate()
            )
          );
        }
      } else {
        // Handle time slots
        if (action === 'block') {
          selectedTimeSlots.forEach(slot => updatedBlockedTimeSlots.add(slot));
        } else {
          selectedTimeSlots.forEach(slot => updatedBlockedTimeSlots.delete(slot));
        }
      }
      
      // Format dates to ISO strings for storage
      const formattedDates = updatedBlockedDates.map(date => date.toISOString());
      
      // Update the availability object
      const updatedAvailability = JSON.stringify({
        blockedDates: formattedDates,
        blockedTimeSlots: Array.from(updatedBlockedTimeSlots)
      });
      
      const response = await apiRequest({
        method: "PATCH",
        url: `/api/locations/${location.id}`,
        body: {
          availability: updatedAvailability
        }
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${location.ownerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
      setSelectedDates([]);
      setSelectedTimeSlots(new Set());
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Availability</DialogTitle>
          <DialogDescription>
            Block specific dates or time slots from your calendar. These will not be available for booking.
          </DialogDescription>
        </DialogHeader>
        
        {/* Blocking Mode Selector */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={blockingMode === 'full-day' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => {
              setBlockingMode('full-day');
              setSelectedTimeSlots(new Set());
            }}
          >
            Full Days
          </Button>
          <Button
            variant={blockingMode === 'time-slots' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => {
              setBlockingMode('time-slots');
              setSelectedDates([]);
            }}
          >
            Time Slots
          </Button>
        </div>
        
        {/* Google Calendar Integration Section */}
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Google Calendar Sync</h3>
            </div>
            {calendarIntegration?.syncEnabled && (
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            )}
          </div>
          
          {!calendarIntegration ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect your Google Calendar to automatically sync bookings and prevent double bookings across platforms.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/auth/google-calendar?locationId=${location.id}`);
                    const data = await response.json();
                    if (data.authUrl) {
                      window.location.href = data.authUrl;
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to connect Google Calendar",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Link className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Google Calendar is connected. Events from your calendar will automatically block those dates.
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between">
                <Label htmlFor="calendar-sync">Enable sync</Label>
                <Switch 
                  id="calendar-sync"
                  checked={calendarIntegration.syncEnabled}
                  disabled={true} // For now, we'll implement the toggle functionality later
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex justify-center items-start">
            <div className="w-full max-w-sm">
              {blockingMode === 'full-day' ? (
                <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => {
                  if (!dates) {
                    setSelectedDates([]);
                  } else if (Array.isArray(dates)) {
                    setSelectedDates(dates);
                  } else {
                    setSelectedDates([dates]);
                  }
                }}
                disabled={(date) => {
                  // Disable past dates
                  return date < new Date(new Date().setHours(0, 0, 0, 0));
                }}
                modifiers={{
                  blocked: blockedDates
                }}
                modifiersStyles={{
                  blocked: {
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 'bold'
                  }
                }}
                className="rounded-md border w-full"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible"
                }}
              />
              ) : (
                // Time Slots Mode
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Select Date</h4>
                    <Calendar
                      mode="single"
                      selected={selectedDates[0]}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates([date]);
                          setSelectedTimeSlots(new Set());
                        }
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        return date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
                      className="rounded-md border"
                    />
                  </div>
                  
                  {selectedDates[0] && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Select Time Slots for {selectedDates[0].toLocaleDateString()}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const timeSlotKey = `${selectedDates[0].toISOString().split('T')[0]}-${hour}`;
                          const isBlocked = blockedTimeSlots.has(timeSlotKey);
                          const isSelected = selectedTimeSlots.has(timeSlotKey);
                          
                          return (
                            <button
                              key={hour}
                              onClick={() => {
                                const newSet = new Set(selectedTimeSlots);
                                if (isSelected) {
                                  newSet.delete(timeSlotKey);
                                } else {
                                  newSet.add(timeSlotKey);
                                }
                                setSelectedTimeSlots(newSet);
                              }}
                              disabled={isBlocked && !isSelected}
                              className={cn(
                                "p-2 text-xs rounded border transition-colors",
                                isBlocked && !isSelected && "bg-red-100 text-red-600 cursor-not-allowed",
                                isSelected && "bg-primary text-white",
                                !isBlocked && !isSelected && "hover:bg-gray-100"
                              )}
                            >
                              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Legend:</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                <span className="text-sm">Blocked {blockingMode === 'full-day' ? 'dates' : 'time slots'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-sm">Selected {blockingMode === 'full-day' ? 'dates' : 'time slots'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
          {blockingMode === 'full-day' ? (
            <>
              {blockedDates.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Currently blocked dates:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {blockedDates.map((date, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        {date.toLocaleDateString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDates.length > 0 && (
                <div>
                  <span className="text-sm font-medium">New dates to block:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDates.map((date, index) => (
                      <Badge key={index} variant="outline" className="bg-primary-50 border-primary-200">
                        {date.toLocaleDateString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {blockedTimeSlots.size > 0 && (
                <div>
                  <span className="text-sm font-medium">Currently blocked time slots:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(blockedTimeSlots).map((slot, index) => {
                      const [date, hour] = slot.split('-');
                      const hourNum = parseInt(hour);
                      const timeStr = hourNum === 0 ? '12 AM' : hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
                      return (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          {new Date(date).toLocaleDateString()} - {timeStr}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {selectedTimeSlots.size > 0 && (
                <div>
                  <span className="text-sm font-medium">New time slots to block:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(selectedTimeSlots).map((slot, index) => {
                      const [date, hour] = slot.split('-');
                      const hourNum = parseInt(hour);
                      const timeStr = hourNum === 0 ? '12 AM' : hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
                      return (
                        <Badge key={index} variant="outline" className="bg-primary-50 border-primary-200">
                          {new Date(date).toLocaleDateString()} - {timeStr}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="secondary"
            onClick={() => updateAvailabilityMutation.mutate('unblock')}
            disabled={updateAvailabilityMutation.isPending || (blockingMode === 'full-day' ? selectedDates.length === 0 : selectedTimeSlots.size === 0)}
          >
            {updateAvailabilityMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Unblock {blockingMode === 'full-day' ? 'Dates' : 'Time Slots'}
          </Button>
          <Button 
            onClick={() => updateAvailabilityMutation.mutate('block')}
            disabled={updateAvailabilityMutation.isPending || (blockingMode === 'full-day' ? selectedDates.length === 0 : selectedTimeSlots.size === 0)}
          >
            {updateAvailabilityMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Block {blockingMode === 'full-day' ? 'Dates' : 'Time Slots'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}