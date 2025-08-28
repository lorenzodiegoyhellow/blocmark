import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Location } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const castSizeOptions = [
  "1-5 people",
  "6-15 people",
  "16-25 people",
  "26-35 people",
  "36-45 people",
  "46-60 people",
];

export function BookingForm({ location }: { location: Location }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("21:00");
  const [castSize, setCastSize] = useState(castSizeOptions[1]);

  // Calculate pricing
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  const basePrice = location.price * hours;
  const siteRepFee = 195;
  const processingFee = Math.round(basePrice * 0.11);
  const totalPrice = basePrice + siteRepFee + processingFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Submit clicked - starting booking process");

      const bookingDetails = {
        dates: [{
          date: format(date, "yyyy-MM-dd"),
          startTime,
          endTime,
        }],
        castSize,
        totalPrice,
      };

      console.log("Created booking details:", bookingDetails);

      // Encode parameters for URL
      const encodedDetails = encodeURIComponent(JSON.stringify(bookingDetails));
      const summaryUrl = `/locations/${location.id}/booking-summary?details=${encodedDetails}`;

      console.log("Navigating to:", summaryUrl);
      navigate(summaryUrl);

    } catch (error) {
      console.error("Error in booking submission:", error);
      toast({
        title: "Error",
        description: "Failed to process booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${location.price}</span>
          <span className="text-muted-foreground">/hr</span>
        </div>
        <div className="text-sm text-muted-foreground">1 hr. minimum</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Date and time</label>

          <Input
            type="date"
            value={format(date, "yyyy-MM-dd")}
            onChange={e => setDate(new Date(e.target.value))}
            min={format(new Date(), "yyyy-MM-dd")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
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
            
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger>
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
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Cast & Crew Size</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={castSize}
            onChange={e => setCastSize(e.target.value)}
          >
            {castSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between text-sm">
            <span>${location.price} × {hours} hours</span>
            <span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Site rep</span>
            <span>${siteRepFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Processing fee</span>
            <span>${processingFee}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total USD</span>
            <span>${totalPrice}</span>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Reserve"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Cancel for free within 24 hours
        </p>
      </form>
    </div>
  );
}