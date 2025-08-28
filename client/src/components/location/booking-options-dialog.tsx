import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Location } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookingOptionsDialogProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingOptionsDialog({
  location,
  isOpen,
  onClose,
}: BookingOptionsDialogProps) {
  const { toast } = useToast();
  const [instantBooking, setInstantBooking] = useState(location.instantBooking);
  const [bookingBuffer, setBookingBuffer] = useState(location.bookingBuffer || 0);
  const [bufferEnabled, setBufferEnabled] = useState((location.bookingBuffer || 0) > 0);

  const updateMutation = useMutation({
    mutationFn: async (data: { instantBooking: boolean; bookingBuffer: number }) => {
      const response = await apiRequest({
        url: `/api/locations/${location.id}/booking-options`,
        method: "PATCH",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner`] });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      toast({
        title: "Success",
        description: "Booking options updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking options",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      instantBooking,
      bookingBuffer: bufferEnabled ? bookingBuffer : 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Options</DialogTitle>
          <DialogDescription>
            Configure how guests can book your space
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Instant Book Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="instant-booking" className="text-base font-medium">
                    Instant Book
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow guests to book instantly without waiting for approval
                </p>
              </div>
              <Switch
                id="instant-booking"
                checked={instantBooking}
                onCheckedChange={setInstantBooking}
              />
            </div>
            {instantBooking && (
              <div className="ml-6 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  When enabled, bookings will be automatically confirmed. You won't need to manually approve each request.
                </p>
              </div>
            )}
          </div>

          {/* Booking Buffer Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="booking-buffer" className="text-base font-medium">
                    Booking Buffer
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add time between bookings for cleaning or setup
                </p>
              </div>
              <Switch
                id="booking-buffer"
                checked={bufferEnabled}
                onCheckedChange={setBufferEnabled}
              />
            </div>
            
            {bufferEnabled && (
              <div className="ml-6 space-y-3">
                <RadioGroup
                  value={bookingBuffer.toString()}
                  onValueChange={(value) => setBookingBuffer(parseInt(value))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="buffer-15" />
                    <Label htmlFor="buffer-15">15 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="buffer-30" />
                    <Label htmlFor="buffer-30">30 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45" id="buffer-45" />
                    <Label htmlFor="buffer-45">45 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="buffer-60" />
                    <Label htmlFor="buffer-60">1 hour</Label>
                  </div>
                </RadioGroup>
                
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    A {bookingBuffer}-minute gap will be added between bookings. For example, if a booking ends at 2:00 PM, the next booking can only start at {formatBufferTime(bookingBuffer)}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatBufferTime(minutes: number): string {
  const baseTime = new Date();
  baseTime.setHours(14, 0, 0, 0); // 2:00 PM
  const bufferTime = new Date(baseTime.getTime() + minutes * 60000);
  return bufferTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}