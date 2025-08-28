import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Location } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { AddressAutocomplete } from "@/components/address/address-autocomplete";

const addressEditSchema = z.object({
  address: z.string().min(1, "Address is required"),
});

type Props = {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
};

export function AddressEditForm({ location, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof addressEditSchema>>({
    resolver: zodResolver(addressEditSchema),
    defaultValues: {
      address: location.address,
    },
  });

  const onSubmit = async (values: z.infer<typeof addressEditSchema>) => {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("PATCH", `/api/locations/${location.id}`, values);

      if (!response.ok) {
        throw new Error("Failed to update location address");
      }

      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });

      toast({
        title: "Success",
        description: "Location address updated successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update location address",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Location Address</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <AddressAutocomplete
                      ref={inputRef}
                      value={field.value || ""}
                      onChange={(newAddress) => {
                        form.setValue('address', newAddress, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                      placeholder="Search for a new address..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Address"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}