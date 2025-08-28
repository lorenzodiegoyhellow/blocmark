import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingWizardProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

type Step = "datetime" | "details" | "summary";

export function BookingWizard({ location, isOpen, onClose }: BookingWizardProps) {
  const [step, setStep] = useState<Step>("datetime");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // DateTime step state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [guestCount, setGuestCount] = useState(1);

  // Project details step state
  const [activityType, setActivityType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [renterCompany, setRenterCompany] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Calculate pricing
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const basePrice = location.price * hours;
  const serviceFee = Math.round(basePrice * 0.1);
  const totalPrice = basePrice + serviceFee;

  const handleNextStep = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a booking",
        variant: "destructive",
      });
      onClose();
      navigate("/auth");
      return;
    }
    
    // Check if the user is the owner of the location
    if (user.id === location.ownerId) {
      toast({
        title: "Cannot book your own location",
        description: "You cannot make a booking for a location you own",
        variant: "destructive",
      });
      onClose();
      return;
    }

    if (step === "datetime") {
      // Validate datetime step
      if (new Date(`${date}T${endTime}`) <= new Date(`${date}T${startTime}`)) {
        toast({
          title: "Invalid time selection",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      if (guestCount > location.maxCapacity) {
        toast({
          title: "Invalid guest count",
          description: `Maximum capacity is ${location.maxCapacity} guests`,
          variant: "destructive",
        });
        return;
      }

      setStep("details");
    } else if (step === "details") {
      // Validate details step
      if (!activityType || !projectName || !renterCompany || !projectDescription) {
        toast({
          title: "Missing information",
          description: "Please fill in all project details",
          variant: "destructive",
        });
        return;
      }

      setStep("summary");
    } else if (step === "summary") {
      // Navigate to the payment page with all booking details
      const bookingDetails = {
        date,
        startTime,
        endTime,
        guestCount,
        totalPrice,
        basePrice,
        serviceFee,
        activityType,
        projectName,
        renterCompany,
        projectDescription,
      };

      const params = new URLSearchParams();
      params.set('details', JSON.stringify(bookingDetails));
      onClose();
      navigate(`/locations/${location.id}/booking-summary?${params.toString()}`);
    }
  };

  const handlePreviousStep = () => {
    if (step === "details") {
      setStep("datetime");
    } else if (step === "summary") {
      setStep("details");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "datetime":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
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

            <div>
              <label className="block text-sm font-medium mb-2">Number of Guests</label>
              <Input
                type="number"
                min={1}
                max={location.maxCapacity}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Max capacity: {location.maxCapacity} guests
              </p>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Activity Type</label>
              <Select value={activityType} onValueChange={setActivityType}>
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
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Renter/Company</label>
              <Input
                value={renterCompany}
                onChange={(e) => setRenterCompany(e.target.value)}
                placeholder="Enter renter or company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">About Your Project</label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Tell us about your project..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Date & Time</h3>
              <p>{format(new Date(date), "MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">
                {startTime} - {endTime}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Project Details</h3>
              <div className="space-y-2">
                <p><span className="text-muted-foreground">Activity Type:</span> {activityType}</p>
                <p><span className="text-muted-foreground">Project Name:</span> {projectName}</p>
                <p><span className="text-muted-foreground">Renter/Company:</span> {renterCompany}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base price</span>
                  <span>${basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total (USD)</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === "datetime" && "Select Date & Time"}
            {step === "details" && "Project Details"}
            {step === "summary" && "Booking Summary"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {renderStepContent()}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={step === "datetime" ? onClose : handlePreviousStep}
          >
            {step === "datetime" ? "Cancel" : "Back"}
          </Button>
          <Button onClick={handleNextStep}>
            {step === "summary" ? "Proceed to Payment" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}