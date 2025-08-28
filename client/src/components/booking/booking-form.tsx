
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { DateRangePicker } from "@/components/date-range-picker";
import { PaymentForm } from "./payment-form";

const bookingFormSchema = z.object({
  projectName: z.string().min(2, { message: "Project name is required" }),
  activityType: z.string().min(1, { message: "Activity type is required" }),
  activity: z.string().min(2, { message: "Activity description is required" }),
  castAndCrew: z.string().min(1, { message: "Cast & crew information is required" }),
  renterCompany: z.string().min(2, { message: "Renter name/company is required" }),
  guestCount: z.coerce.number().min(1, { message: "Guest count must be at least 1" }),
  projectDescription: z.string().min(10, { message: "Please provide a brief description of your project" }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

interface BookingFormProps {
  location: any;
  addons?: any[];
}

export function BookingForm({ location, addons = [] }: BookingFormProps) {
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      projectName: "",
      activityType: "",
      activity: "",
      castAndCrew: "",
      renterCompany: "",
      guestCount: 1,
      projectDescription: "",
      dateRange: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
    },
  });

  const getAddonById = (id: number) => {
    return addons.find(addon => addon.id === id);
  };

  const calculateTotalPrice = () => {
    if (!location || !form.getValues().dateRange.from || !form.getValues().dateRange.to) {
      return 0;
    }

    const days = Math.max(1, Math.ceil(
      (form.getValues().dateRange.to.getTime() - form.getValues().dateRange.from.getTime()) / 
      (1000 * 60 * 60 * 24)
    ));

    let basePrice = location.price * days;
    
    // Add addon prices
    let addonTotal = 0;
    selectedAddons.forEach(addonId => {
      const addon = getAddonById(addonId);
      if (addon) {
        if (addon.priceUnit === 'total') {
          addonTotal += addon.price;
        } else if (addon.priceUnit === 'hour') {
          addonTotal += addon.price * days * 8; // Assuming 8 hours per day
        } else {
          addonTotal += addon.price * days;
        }
      }
    });

    return basePrice + addonTotal;
  };

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const handleNextStep = () => {
    form.trigger().then((isValid) => {
      if (isValid) {
        setStep(2);
      }
    });
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const getSelectedAddonsDetails = () => {
    return selectedAddons.map(id => {
      const addon = getAddonById(id);
      if (!addon) return null;
      return addon; // We're returning the full object here, 
      // but the PaymentForm component is now set up to extract just the IDs
    }).filter(Boolean);
  };

  if (step === 1) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Booking Dates</FormLabel>
                    <DateRangePicker 
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
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
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity (be as specific as possible)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Filming, Photography, Event" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="castAndCrew"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cast & Crew</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-5 people">1 - 5 people</SelectItem>
                          <SelectItem value="6-10 people">6 - 10 people</SelectItem>
                          <SelectItem value="11-20 people">11 - 20 people</SelectItem>
                          <SelectItem value="21-50 people">21 - 50 people</SelectItem>
                          <SelectItem value="50+ people">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="photoshoot">Photography</SelectItem>
                        <SelectItem value="videoshoot">Video Production</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                      <Input placeholder="Enter your name or company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of People</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe your project and needs"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Booking Summary</h3>
            <p className="text-muted-foreground text-sm">
              {location.title} • {form.getValues().dateRange.from.toLocaleDateString()} to {form.getValues().dateRange.to.toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Project Details</h4>
            <p className="text-sm">{form.getValues().projectName}</p>
            <p className="text-sm"><strong>Activity Type:</strong> {form.getValues().activityType}</p>
            <p className="text-sm"><strong>Activity:</strong> {form.getValues().activity}</p>
            <p className="text-sm"><strong>Cast & Crew:</strong> {form.getValues().castAndCrew}</p>
            <p className="text-sm">{form.getValues().renterCompany} • {form.getValues().guestCount} people</p>
          </div>

          {addons.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Add-ons</h4>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                      selectedAddons.includes(addon.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div>
                      <p className="font-medium">{addon.name}</p>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatPrice(addon.price)}
                        <span className="text-xs text-muted-foreground">
                          {addon.priceUnit === "hour" ? "/hour" : addon.priceUnit === "day" ? "/day" : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <p>Base Price</p>
              <p>{formatPrice(location.price)} × {Math.max(1, Math.ceil(
                (form.getValues().dateRange.to.getTime() - form.getValues().dateRange.from.getTime()) / 
                (1000 * 60 * 60 * 24)
              ))} days</p>
            </div>
            {selectedAddons.length > 0 && (
              <>
                {selectedAddons.map((addonId) => {
                  const addon = getAddonById(addonId);
                  return addon ? (
                    <div key={addonId} className="flex justify-between">
                      <p>{addon.name}</p>
                      <p>{formatPrice(addon.price)}
                        <span className="text-xs text-muted-foreground">
                          {addon.priceUnit === "hour" ? "/hour" : addon.priceUnit === "day" ? "/day" : ""}
                        </span>
                      </p>
                    </div>
                  ) : null;
                })}
              </>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <p>Total</p>
              <p>{formatPrice(calculateTotalPrice())}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md"
            >
              Back
            </button>
            
            <div className="flex-1">
              <PaymentForm
                locationId={location.id}
                locationTitle={location.title}
                startDate={form.getValues().dateRange.from}
                endDate={form.getValues().dateRange.to}
                guestCount={form.getValues().guestCount}
                totalPrice={calculateTotalPrice()}
                activityType={form.getValues().activityType}
                activity={form.getValues().activity}
                castAndCrew={form.getValues().castAndCrew}
                projectName={form.getValues().projectName}
                renterCompany={form.getValues().renterCompany}
                projectDescription={form.getValues().projectDescription}
                addons={getSelectedAddonsDetails()}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
