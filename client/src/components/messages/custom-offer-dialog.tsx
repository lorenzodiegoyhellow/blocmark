import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Plus, X, Camera, Video, Calendar as CalendarIcon2, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Define Addon type locally to avoid import issues
type Addon = {
  id: number;
  locationId: number;
  name: string;
  description: string | null;
  price: number;
  priceUnit: string;
  createdAt: Date;
};

type CustomOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  locationTitle: string;
  recipientId: number;
  recipientName: string;
  bookingDetails?: {
    date?: string;
    time?: string;
    attendees?: number | string;
    checkIn?: string;
    checkOut?: string;
  };
};

export function CustomOfferDialog({
  open,
  onOpenChange,
  locationId,
  locationTitle,
  recipientId,
  recipientName,
  bookingDetails
}: CustomOfferDialogProps) {
  // Early return if required props are missing
  if (!locationId || !recipientId) {
    return null;
  }
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(
    bookingDetails?.date ? new Date(bookingDetails.date) : 
    bookingDetails?.checkIn ? new Date(bookingDetails.checkIn) : 
    undefined
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [attendees, setAttendees] = useState(
    bookingDetails?.attendees?.toString() || ""
  );
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [additionalFees, setAdditionalFees] = useState<Array<{
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }>>([]);
  const [activityType, setActivityType] = useState<string>("");
  const [groupSize, setGroupSize] = useState<string>("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  // Fetch add-ons for the location
  const { data: addons } = useQuery<Addon[]>({
    queryKey: [`/api/locations/${locationId}/addons`],
    enabled: !!locationId && locationId > 0 && open,
  });

  // Fetch location details for pricing matrix
  const { data: location } = useQuery<any>({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId && locationId > 0 && open,
  });

  // Extract time from booking details if available
  useEffect(() => {
    if (!open) return;
    
    try {
      if (bookingDetails?.time) {
        const [start, end] = bookingDetails.time.split(' - ');
        if (start) setStartTime(start.trim());
        if (end) setEndTime(end.trim());
      } else if (bookingDetails?.checkIn && bookingDetails?.checkOut) {
        const checkInDate = new Date(bookingDetails.checkIn);
        const checkOutDate = new Date(bookingDetails.checkOut);
        if (!isNaN(checkInDate.getTime())) {
          setStartTime(format(checkInDate, "HH:mm"));
        }
        if (!isNaN(checkOutDate.getTime())) {
          setEndTime(format(checkOutDate, "HH:mm"));
        }
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
    }
  }, [bookingDetails, open]);

  // Calculate price based on activity type and group size
  useEffect(() => {
    if (!location || !activityType || !groupSize || useCustomPrice) return;
    
    const pricingMatrix = location.pricingMatrix || {};
    const activityPricing = pricingMatrix[activityType] || {};
    const calculatedPrice = activityPricing[groupSize] || 0;
    
    if (calculatedPrice > 0) {
      // Calculate hours between start and end time
      let hours = 1;
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        hours = Math.max(1, Math.ceil(diff));
      }
      
      setPrice((calculatedPrice * hours).toString());
    }
  }, [location, activityType, groupSize, startTime, endTime, useCustomPrice]);

  // Group size options
  const groupSizeOptions = [
    { value: 'small', label: '1-5 people', range: [1, 5] },
    { value: 'medium', label: '6-15 people', range: [6, 15] },
    { value: 'large', label: '16-30 people', range: [16, 30] },
    { value: 'extraLarge', label: '31+ people', range: [31, 999] }
  ];

  // Activity type options
  const activityTypeOptions = [
    { value: 'photo', label: 'Photo Shoot', icon: Camera },
    { value: 'video', label: 'Video Production', icon: Video },
    { value: 'event', label: 'Event', icon: CalendarIcon2 },
    { value: 'meeting', label: 'Meeting', icon: Users }
  ];

  // Auto-select group size based on attendees
  useEffect(() => {
    if (!attendees) return;
    const attendeeCount = parseInt(attendees);
    if (isNaN(attendeeCount)) return;
    
    for (const option of groupSizeOptions) {
      if (attendeeCount >= option.range[0] && attendeeCount <= option.range[1]) {
        setGroupSize(option.value);
        break;
      }
    }
  }, [attendees]);

  const sendOfferMutation = useMutation({
    mutationFn: async () => {
      const offerData = {
        locationId,
        recipientId,
        date: date ? format(date, "yyyy-MM-dd") : null,
        startTime,
        endTime,
        attendees: attendees ? parseInt(attendees) : null,
        customPrice: parseFloat(price),
        message,
        selectedAddons,
        additionalFees,
        activityType,
        groupSize
      };

      return apiRequest({
        url: '/api/messages/custom-offer',
        method: 'POST',
        body: offerData
      });
    },
    onSuccess: () => {
      toast({
        title: "Custom offer sent",
        description: `Your custom offer has been sent to ${recipientName}.`
      });
      
      // Invalidate messages to refresh the conversation
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipientId}/${locationId}`] });
      
      // Reset form and close dialog
      setPrice("");
      setMessage("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send custom offer. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price for your custom offer.",
        variant: "destructive"
      });
      return;
    }

    sendOfferMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Custom Offer</DialogTitle>
            <DialogDescription>
              Create a custom offer for {recipientName} for {locationTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Date Selection */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Activity Type Selection */}
            <div className="grid gap-2">
              <Label>Activity Type</Label>
              <RadioGroup value={activityType} onValueChange={setActivityType}>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypeOptions.filter(option => 
                    location?.enabledActivities?.includes(option.value) || 
                    location?.allowedActivities?.includes(option.value)
                  ).map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Attendees and Group Size */}
            <div className="grid gap-2">
              <Label htmlFor="attendees">Number of Attendees</Label>
              <Input
                id="attendees"
                type="number"
                min="1"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Enter number of attendees"
              />
              {attendees && (
                <div className="text-sm text-muted-foreground">
                  Group size: {groupSizeOptions.find(opt => opt.value === groupSize)?.label || 'Select attendees'}
                </div>
              )}
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
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Fees */}
            <div className="grid gap-2">
              <Label>Additional Fees</Label>
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
                      <select
                        value={fee.type}
                        onChange={(e) => {
                          const updated = [...additionalFees];
                          updated[index].type = e.target.value as 'fixed' | 'percentage';
                          setAdditionalFees(updated);
                        }}
                        className="w-24 px-2 py-1 border rounded"
                      >
                        <option value="fixed">$</option>
                        <option value="percentage">%</option>
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAdditionalFees(additionalFees.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAdditionalFees([...additionalFees, { name: '', amount: 0, type: 'fixed' }]);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fee
                </Button>
              </div>
            </div>

            {/* Custom Price */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">Total Price ($)</Label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="customPrice"
                    checked={useCustomPrice}
                    onCheckedChange={(checked) => setUseCustomPrice(!!checked)}
                  />
                  <Label htmlFor="customPrice" className="text-sm font-normal cursor-pointer">
                    Use custom price
                  </Label>
                </div>
              </div>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={useCustomPrice ? "Enter your custom price" : "Price calculated from your rates"}
                disabled={!useCustomPrice && (!activityType || !groupSize)}
                required
              />
              {!useCustomPrice && activityType && groupSize && location && (
                <p className="text-sm text-muted-foreground">
                  Based on your {activityTypeOptions.find(a => a.value === activityType)?.label} rate for {groupSizeOptions.find(g => g.value === groupSize)?.label}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to explain your custom offer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendOfferMutation.isPending}>
              {sendOfferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Offer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}