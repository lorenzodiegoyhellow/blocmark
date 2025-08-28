import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Location } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Car, Building, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const accessibilitySchema = z.object({
  parking: z.object({
    onsiteParking: z.boolean().default(false),
    onsiteSpaces: z.number().min(1).nullable().optional(),
    adaAccessible: z.boolean().default(false),
    evCharging: z.boolean().default(false),
    coveredGarage: z.boolean().default(false),
    gatedSecured: z.boolean().default(false),
    heightClearance: z.number().nullable().optional(),
    valetService: z.boolean().default(false),
    twentyFourSeven: z.boolean().default(false),
    nearbyPaidLot: z.boolean().default(false),
    loadingZone: z.boolean().default(false),
    streetParking: z.boolean().default(false),
    busCoachParking: z.boolean().default(false),
    basecampCrewArea: z.boolean().default(false),
    pullThrough: z.boolean().default(false),
    levelSurface: z.boolean().default(false),
    overnightAllowed: z.boolean().default(false),
    shorePower: z.boolean().default(false),
    waterSewer: z.boolean().default(false),
    trailerStorage: z.boolean().default(false)
  }),
  access: z.object({
    elevator: z.boolean().default(false),
    stairs: z.boolean().default(false),
    streetLevel: z.boolean().default(false),
    wheelchairAccess: z.boolean().default(false),
    freightElevator: z.boolean().default(false),
    stepFreeRamp: z.boolean().default(false),
    loadingDock: z.boolean().default(false),
    rollUpDoor: z.boolean().default(false),
    rollUpDoorDimensions: z.string().nullable().optional(),
    doubleWideDoors: z.boolean().default(false),
    doubleWideWidth: z.number().nullable().optional(),
    driveInAccess: z.boolean().default(false),
    corridorMinWidth: z.boolean().default(false),
    corridorWidth: z.number().nullable().optional(),
    freightElevatorCapacity: z.boolean().default(false),
    elevatorCapacity: z.number().nullable().optional(),
    elevatorCabSize: z.string().nullable().optional(),
    keylessEntry: z.boolean().default(false),
    onSiteSecurity: z.boolean().default(false),
    dolliesAvailable: z.boolean().default(false)
  })
});

type Props = {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
};

export function AccessibilityEditForm({ location, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof accessibilitySchema>>({
    resolver: zodResolver(accessibilitySchema),
    defaultValues: {
      parking: location.accessibilityData?.parking || {
        onsiteParking: false,
        onsiteSpaces: null,
        adaAccessible: false,
        evCharging: false,
        coveredGarage: false,
        gatedSecured: false,
        heightClearance: null,
        valetService: false,
        twentyFourSeven: false,
        nearbyPaidLot: false,
        loadingZone: false,
        streetParking: false,
        busCoachParking: false,
        basecampCrewArea: false,
        pullThrough: false,
        levelSurface: false,
        overnightAllowed: false,
        shorePower: false,
        waterSewer: false,
        trailerStorage: false
      },
      access: location.accessibilityData?.access || {
        elevator: false,
        stairs: false,
        streetLevel: false,
        wheelchairAccess: false,
        freightElevator: false,
        stepFreeRamp: false,
        loadingDock: false,
        rollUpDoor: false,
        rollUpDoorDimensions: null,
        doubleWideDoors: false,
        doubleWideWidth: null,
        driveInAccess: false,
        corridorMinWidth: false,
        corridorWidth: null,
        freightElevatorCapacity: false,
        elevatorCapacity: null,
        elevatorCabSize: null,
        keylessEntry: false,
        onSiteSecurity: false,
        dolliesAvailable: false
      }
    },
  });

  const onSubmit = async (data: z.infer<typeof accessibilitySchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest({
        url: `/api/locations/${location.id}`,
        method: "PATCH",
        body: {
          accessibilityData: data
        },
      });

      queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });

      toast({
        title: "Success",
        description: "Accessibility information updated successfully",
      });

      onClose();
    } catch (error) {
      console.error("Failed to update accessibility:", error);
      toast({
        title: "Error",
        description: "Failed to update accessibility information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Accessibility Information</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Introduction */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                Parking and access information is essential for events and productions involving equipment, furniture, props, or sizeable groups. 
                Including these details helps producers, organizers, and guests plan effectively.
              </AlertDescription>
            </Alert>

            {/* Parking Section */}
            <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Parking Availability
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Onsite Parking with Number Input */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="parking.onsiteParking"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Onsite parking
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {form.watch("parking.onsiteParking") && (
                    <FormField
                      control={form.control}
                      name="parking.onsiteSpaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Number of spaces"
                              className="mt-2"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Other Parking Options */}
                {[
                  { name: "adaAccessible", label: "ADA/Accessible spaces" },
                  { name: "evCharging", label: "EV charging" },
                  { name: "coveredGarage", label: "Covered/garage parking" },
                  { name: "gatedSecured", label: "Gated/secured parking" },
                  { name: "valetService", label: "Valet service available" },
                  { name: "twentyFourSeven", label: "24/7 parking availability" },
                  { name: "nearbyPaidLot", label: "Nearby paid lot/garage" },
                  { name: "loadingZone", label: "Loading/temporary parking zone" },
                  { name: "streetParking", label: "Street parking" },
                  { name: "busCoachParking", label: "Bus/coach parking" },
                  { name: "basecampCrewArea", label: "Basecamp/crew parking area" }
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={`parking.${item.name}` as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}

                {/* Height Clearance */}
                <FormField
                  control={form.control}
                  name="parking.heightClearance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height clearance (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Height in feet"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Truck/Motorhome Parking */}
              <div className="border-t pt-6">
                <h5 className="text-base font-semibold text-slate-800 mb-4">Truck / Motorhome Parking</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "pullThrough", label: "Pull-through access" },
                    { name: "levelSurface", label: "Level surface" },
                    { name: "overnightAllowed", label: "Overnight allowed" },
                    { name: "shorePower", label: "Shore-power hookups" },
                    { name: "waterSewer", label: "Water/sewer hookups" },
                    { name: "trailerStorage", label: "Trailer storage area" }
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`parking.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Access Section */}
            <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Access Availability
              </h4>
              
              <div>
                <h5 className="text-base font-semibold text-slate-800 mb-4">Basic / Load-in</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Access Options */}
                  {[
                    { name: "elevator", label: "Elevator" },
                    { name: "stairs", label: "Stairs" },
                    { name: "streetLevel", label: "Street Level" },
                    { name: "wheelchairAccess", label: "Wheelchair / Handicap Access" },
                    { name: "freightElevator", label: "Freight Elevator" },
                    { name: "stepFreeRamp", label: "Step-free entrance / ramp" },
                    { name: "loadingDock", label: "Loading dock" }
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`access.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* Roll-up Door with Dimensions */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="access.rollUpDoor"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Roll-up door
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("access.rollUpDoor") && (
                      <FormField
                        control={form.control}
                        name="access.rollUpDoorDimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="WxH dimensions"
                                className="mt-2"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Double-wide Doors with Width */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="access.doubleWideDoors"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Double-wide doors
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("access.doubleWideDoors") && (
                      <FormField
                        control={form.control}
                        name="access.doubleWideWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Min width (inches)"
                                className="mt-2"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Drive-in Access */}
                  <FormField
                    control={form.control}
                    name="access.driveInAccess"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Drive-in access to interior
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {/* Corridor/Door Width */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="access.corridorMinWidth"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Corridor/door minimum width
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("access.corridorMinWidth") && (
                      <FormField
                        control={form.control}
                        name="access.corridorWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Width (inches)"
                                className="mt-2"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Freight Elevator Capacity */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="access.freightElevatorCapacity"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Freight elevator capacity
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("access.freightElevatorCapacity") && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="access.elevatorCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Capacity (lbs)"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="access.elevatorCabSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Cab size"
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Other Access Options */}
                  {[
                    { name: "keylessEntry", label: "Keyless/lockbox entry" },
                    { name: "onSiteSecurity", label: "On-site security / gate guard" },
                    { name: "dolliesAvailable", label: "Dollies/carts available" }
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`access.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}