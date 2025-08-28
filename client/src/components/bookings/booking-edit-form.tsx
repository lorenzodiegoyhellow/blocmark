import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useHostMode } from "@/hooks/use-host-mode";
import { Loader2, AlertTriangle } from "lucide-react";
import { differenceInHours, format } from "date-fns";
import { Booking } from "@/pages/host-booking-details-new";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema for validation
const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  guestCount: z.number().min(1, "At least 1 guest is required"),
  status: z.enum(["pending", "confirmed", "rejected", "cancelled", "payment_pending"]).optional(),
  additionalPrice: z.number().default(0),
  notifyClient: z.boolean().default(true),
  editReason: z.string().optional(),
  selectedAddons: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

type Addon = {
  id: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
};

interface BookingEditFormProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingEditForm({ booking, isOpen, onClose }: BookingEditFormProps): JSX.Element {
  const { toast } = useToast();
  const { isHostMode } = useHostMode();
  const [originalTotalPrice, setOriginalTotalPrice] = useState(booking.totalPrice);
  const [newTotalPrice, setNewTotalPrice] = useState(booking.totalPrice);
  const [priceDifference, setPriceDifference] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  // Debug log for tracking dialog and component lifecycle
  console.log(`BookingEditForm - render - isOpen: ${isOpen}, bookingId: ${booking?.id}`);

  // Fetch available addons for this location
  const { data: locationAddons, isLoading: loadingLocationAddons } = useQuery({
    queryKey: [`/api/locations/${booking.locationId}/addons`],
    enabled: isOpen && isHostMode,
  });

  // Fetch existing booking addons
  const { data: bookingAddons, isLoading: loadingBookingAddons } = useQuery({
    queryKey: [`/api/bookings/${booking.id}/addons`],
    enabled: isOpen && isHostMode,
  });

  // Fetch location details for price calculation
  const { data: location } = useQuery({
    queryKey: [`/api/locations/${booking.locationId}`],
    enabled: isOpen && isHostMode,
  });

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(booking.startDate), "yyyy-MM-dd"),
      startTime: format(new Date(booking.startDate), "HH:mm"),
      endTime: format(new Date(booking.endDate), "HH:mm"),
      status: booking.status as 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'payment_pending',
      guestCount: booking.guestCount || 1,
      additionalPrice: 0,
      notifyClient: true,
      editReason: "",
      selectedAddons: [],
    },
  });

  // When booking addons load, set them as selected
  useEffect(() => {
    if (bookingAddons && Array.isArray(bookingAddons) && bookingAddons.length > 0) {
      const addonIds = bookingAddons.map((addon: any) => addon.id);
      setSelectedAddons(addonIds);
      form.setValue('selectedAddons', addonIds);
    }
  }, [bookingAddons, form]);

  // Watch form fields to calculate price in real-time
  const watchedStartTime = form.watch('startTime');
  const watchedEndTime = form.watch('endTime');
  const watchedDate = form.watch('date');
  const watchedGuestCount = form.watch('guestCount');
  const watchedSelectedAddons = form.watch('selectedAddons');
  const watchedAdditionalPrice = form.watch('additionalPrice');

  // Calculate new total price based on changes
  useEffect(() => {
    if (!location || typeof location !== 'object') return;

    try {
      // Calculate duration in hours
      const startDate = new Date(`${watchedDate}T${watchedStartTime}:00`);
      const endDate = new Date(`${watchedDate}T${watchedEndTime}:00`);

      let durationHours = differenceInHours(endDate, startDate);
      if (durationHours <= 0) {
        // If end time is earlier than start time, assume it spans to next day
        durationHours += 24;
      }

      // Calculate base price
      const basePrice = (location && typeof location === 'object' && 'price' in location ? Number(location.price) : 0) * Math.max(1, durationHours);

      // Calculate guest fee
      const guestFee = watchedGuestCount > 1 
        ? (watchedGuestCount - 1) * (location && typeof location === 'object' && 'incrementalRate' in location ? Number(location.incrementalRate) : 0) 
        : 0;

      // Calculate addons price
      const addonPrice = watchedSelectedAddons.reduce((sum, addonId) => {
        if (locationAddons && Array.isArray(locationAddons)) {
          const addon = locationAddons.find((a: any) => a.id === addonId);
          if (addon) {
            return sum + addon.price;
          }
        }
        return sum;
      }, 0) || 0;

      // Add any additional price set by the host
      const additionalCost = watchedAdditionalPrice || 0;

      // Calculate total
      const calculatedNewTotal = basePrice + guestFee + addonPrice + additionalCost;
      setNewTotalPrice(calculatedNewTotal);
      setPriceDifference(calculatedNewTotal - originalTotalPrice);
    } catch (error) {
      console.error("Price calculation error:", error);
    }
  }, [watchedStartTime, watchedEndTime, watchedDate, watchedGuestCount, watchedSelectedAddons, watchedAdditionalPrice, location, originalTotalPrice, locationAddons]);

  // Toggle addon selection
  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        const newSelection = prev.filter(id => id !== addonId);
        form.setValue('selectedAddons', newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, addonId];
        form.setValue('selectedAddons', newSelection);
        return newSelection;
      }
    });
  };

  // Mutation to update the booking
  const updateBooking = useMutation({
    mutationFn: async (values: FormValues) => {
      const startDate = new Date(`${values.date}T${values.startTime}:00`);
      const endDate = new Date(`${values.date}T${values.endTime}:00`);

      // Create the update data object
      const updateData: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        guestCount: values.guestCount,
        totalPrice: newTotalPrice,
        addons: values.selectedAddons,
        notifyClient: values.notifyClient,
        editReason: values.editReason,
        editHistory: true, // Flag to indicate this should be recorded in history
      };

      // Include status if in host mode
      if (isHostMode && values.status) {
        updateData.status = values.status;
      }

      console.log("Sending booking update:", updateData);

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error("Could not update booking");
      }

      const updatedBooking = await response.json();
      console.log("Received updated booking:", updatedBooking);
      return updatedBooking;
    },
    onSuccess: (updatedBooking: Booking) => {
      // Update the cache with the new booking data
      queryClient.setQueryData(["/api/bookings/user"], (oldData: Booking[] | undefined) => {
        if (!oldData) return [updatedBooking];
        return oldData.map(b => b.id === booking.id ? updatedBooking : b);
      });

      queryClient.setQueryData(["/api/bookings/host"], (oldData: Booking[] | undefined) => {
        if (!oldData) return [updatedBooking];
        return oldData.map(b => b.id === booking.id ? updatedBooking : b);
      });

      // Invalidate relevant queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/host"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${booking.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${booking.id}/addons`] });

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Could not update booking",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    updateBooking.mutate(values);
  };

  // Enhanced early return - If dialog is not open or booking is missing, don't render anything
  if (!isOpen || !booking) {
    console.log(`BookingEditForm - early return - isOpen: ${isOpen}, booking: ${booking ? 'exists' : 'missing'}`);
    return null;
  }

  // Rendered dialog with form content
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log(`Dialog onOpenChange triggered with: ${open}`);
        if (!open) {
          console.log("Dialog closing, calling onClose()");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Booking</DialogTitle>
          <DialogDescription>
            Make changes to the booking details. The client will be notified of any changes.
          </DialogDescription>
        </DialogHeader>

        {loadingLocationAddons || loadingBookingAddons ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p>Loading booking details...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Time and date section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Date and Time</h3>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={format(new Date(), "yyyy-MM-dd")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Guest count and status section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isHostMode && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="payment_pending">Payment Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Add-ons section */}
              {isHostMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Add-ons</h3>
                  {locationAddons && Array.isArray(locationAddons) && locationAddons.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {locationAddons.map((addon: Addon) => (
                        <div key={addon.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`addon-${addon.id}`}
                              checked={selectedAddons.includes(addon.id)}
                              onCheckedChange={() => toggleAddon(addon.id)}
                            />
                            <label 
                              htmlFor={`addon-${addon.id}`} 
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {addon.name}
                            </label>
                          </div>
                          <div className="text-sm font-medium">
                            ${(addon.price / 100).toFixed(2)}
                            <span className="text-xs text-muted-foreground block">
                              per {addon.priceUnit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No add-ons available for this location</p>
                  )}
                </div>
              )}

              <Separator />

              {/* Additional price section */}
              {isHostMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Price Adjustment</h3>
                  <FormField
                    control={form.control}
                    name="additionalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Price (cents)</FormLabel>
                        <FormDescription>
                          Add any additional charges (overtime, extra services, etc.)
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price summary */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Price Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Original Total:</span>
                          <span>${(originalTotalPrice / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Total:</span>
                          <span>${(newTotalPrice / 100).toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Difference:</span>
                          <span className={priceDifference > 0 ? "text-green-600" : priceDifference < 0 ? "text-red-600" : ""}>
                            {priceDifference > 0 ? "+" : ""}{(priceDifference / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price difference notification */}
                  {priceDifference > 0 && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle>Additional Payment Required</AlertTitle>
                      <AlertDescription>
                        The client will need to pay an additional ${(priceDifference / 100).toFixed(2)} for these changes.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Separator />

              {/* Notification and reason section */}
              {isHostMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification</h3>
                  
                  <FormField
                    control={form.control}
                    name="notifyClient"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Notify Client</FormLabel>
                          <FormDescription>
                            Send an automated notification to the client about these changes.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="editReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Changes</FormLabel>
                        <FormDescription>
                          Provide a brief explanation for these changes that will be included in the client notification.
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Adjusting time based on your request, adding equipment as discussed..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Form actions */}
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    console.log("Cancel button clicked");
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateBooking.isPending}
                >
                  {updateBooking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {updateBooking.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}