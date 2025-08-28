import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatUsername } from "@/lib/utils";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostId: number;
  hostName: string;
  hostImage?: string;
  locationId: number;
  locationTitle: string;
  interestedDate?: Date;
  interestedStartTime?: string;
  interestedEndTime?: string;
};

export function MessageHostDialog({
  open,
  onOpenChange,
  hostId,
  hostName,
  hostImage,
  locationId,
  locationTitle,
  interestedDate,
  interestedStartTime,
  interestedEndTime,
}: Props) {
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [isFlexible, setIsFlexible] = useState(false);
  const [activity, setActivity] = useState("");
  const [attendees, setAttendees] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Navigation and toast
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Use interested date if provided, otherwise use tomorrow
      setDate(interestedDate || new Date());
      setIsFlexible(false);
      setActivity("");
      setAttendees("");
      setMessage("");
      setErrors({});
    }
  }, [open, interestedDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!activity) {
      newErrors.activity = "Please select an activity";
    }
    
    if (!attendees) {
      newErrors.attendees = "Please select number of attendees";
    }
    
    if (!message || message.length < 10) {
      newErrors.message = "Please enter a message (at least 10 characters)";
    }
    
    setErrors(newErrors);
    
    // If we have errors, show a toast to alert the user
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Form validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Sending message with data:", {
          receiverId: hostId,
          locationId,
          content: message,
          bookingDetails: {
            date: format(date, "PPP"),
            time: interestedStartTime && interestedEndTime 
              ? `${interestedStartTime} - ${interestedEndTime}`
              : "11:00am - 9:00pm",
            isFlexible,
            activity,
            attendees,
            locationTitle,
          },
        });
        
        // Use fetch directly with proper JSON serialization
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: hostId,
            locationId,
            content: message,
            bookingDetails: {
              date: format(date, "PPP"),
              time: interestedStartTime && interestedEndTime 
                ? `${interestedStartTime} - ${interestedEndTime}`
                : "11:00am - 9:00pm",
              isFlexible,
              activity,
              attendees,
              locationTitle,
            },
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response error:", errorText);
          throw new Error(`Failed to send message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Message sending error:", error);
        throw error;
      }
    },
    onSuccess: async (messageData) => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the host.",
      });
      onOpenChange(false);
      
      // Save the username in sessionStorage before redirecting
      sessionStorage.setItem(`host-${hostId}`, formatUsername(hostName));
      if (hostImage) {
        sessionStorage.setItem(`host-image-${hostId}`, hostImage);
      }
      
      // Navigate to the messages page with additional query params
      navigate(`/messages?userId=${hostId}&locationId=${locationId}&userName=${encodeURIComponent(formatUsername(hostName))}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", { date, isFlexible, activity, attendees, message });
    
    if (validateForm()) {
      sendMessageMutation.mutate();
    } else {
      console.error("Form validation failed:", errors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {hostImage ? (
                <AvatarImage
                  src={hostImage}
                  alt={hostName}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  {hostName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <span>Message {formatUsername(hostName)}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">
              {interestedStartTime && interestedEndTime 
                ? "Selected Date"
                : "Select Date"}
            </Label>
            <input
              type="date"
              id="date"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                console.log("Date input changed:", e.target.value);
                const selectedDate = new Date(e.target.value);
                setDate(selectedDate);
              }}
              min={new Date().toISOString().split('T')[0]}
            />
            
            {/* Time selection display */}
            {interestedStartTime && interestedEndTime && (
              <div className="mt-3 bg-muted p-3 rounded-md border border-border">
                <h4 className="font-medium mb-1">Selected Time</h4>
                <div className="flex items-center text-primary font-medium text-lg">
                  <div className="flex-1 text-center">
                    {interestedStartTime}
                  </div>
                  <div className="mx-2">-</div>
                  <div className="flex-1 text-center">
                    {interestedEndTime}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This time was selected from your booking request. To change it, go back and adjust your booking times.
                </p>
              </div>
            )}
            
            {errors.date && (
              <p className="text-sm text-destructive flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Is Flexible Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFlexible"
              checked={isFlexible}
              onCheckedChange={(checked) => 
                setIsFlexible(checked === true)
              }
            />
            <Label htmlFor="isFlexible" className="cursor-pointer">
              My dates / times are flexible
            </Label>
          </div>

          {/* Activity Select */}
          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <select
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Select activity type</option>
              <option value="Photo Shoot">Photo Shoot</option>
              <option value="Film Production">Film Production</option>
              <option value="Event">Event</option>
              <option value="Meeting">Meeting</option>
              <option value="Workshop">Workshop</option>
            </select>
            {errors.activity && (
              <p className="text-sm text-destructive flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.activity}
              </p>
            )}
          </div>

          {/* Attendees Select */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <select
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Select number of attendees</option>
              <option value="1-5">1 - 5 people</option>
              <option value="6-15">6 - 15 people</option>
              <option value="16-30">16 - 30 people</option>
              <option value="31-50">31 - 50 people</option>
              <option value="50+">50+ people</option>
            </select>
            {errors.attendees && (
              <p className="text-sm text-destructive flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.attendees}
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <Label htmlFor="message">Message your host</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself, describe your activity and let your host know how you're planning to use the space."
              className="h-32"
            />
            {errors.message && (
              <p className="text-sm text-destructive flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.message}
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? "Sending message..." : "Send a message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}