import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";

const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be a positive number"),
  priceUnit: z.enum(["hour", "day", "item"]),
});

type AddonFormValues = z.infer<typeof addonSchema>;

type AddonDialogProps = {
  locationId: number;
  isOpen: boolean;
  onClose: () => void;
};

export function AddonDialog({ locationId, isOpen, onClose }: AddonDialogProps) {
  const { toast } = useToast();
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [selectedPriceUnit, setSelectedPriceUnit] = useState<"hour" | "day" | "item">("hour");

  const { data: addons, isLoading } = useQuery({
    queryKey: [`/api/locations/${locationId}/addons`],
    enabled: isOpen,
  });

  const form = useForm<AddonFormValues>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      priceUnit: "hour",
    },
  });
  
  // Update the Select component's value when editing an add-on
  useEffect(() => {
    if (editingAddon) {
      // Update both the form value and the local state
      form.setValue("priceUnit", editingAddon.priceUnit);
      setSelectedPriceUnit(editingAddon.priceUnit);
    } else {
      // Reset to default when not editing
      setSelectedPriceUnit("hour");
    }
  }, [editingAddon, form]);

  const createMutation = useMutation({
    mutationFn: async (data: AddonFormValues) => {
      const response = await apiRequest("POST", `/api/locations/${locationId}/addons`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create add-on");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on created successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/addons`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AddonFormValues & { addonId: number }) => {
      const { addonId, ...addonData } = data;
      const response = await apiRequest("PATCH", `/api/locations/${locationId}/addons/${addonId}`, addonData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update add-on");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on updated successfully",
      });
      setEditingAddon(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/addons`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (addonId: number) => {
      const response = await apiRequest("DELETE", `/api/locations/${locationId}/addons/${addonId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete add-on");
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/addons`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddonFormValues) => {
    if (editingAddon) {
      updateMutation.mutate({ ...data, addonId: editingAddon.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (addon: any) => {
    setEditingAddon(addon);
    setSelectedPriceUnit(addon.priceUnit);
    
    // Reset the form values
    form.reset({
      name: addon.name,
      description: addon.description,
      price: addon.price,
      priceUnit: addon.priceUnit,
    });
  };

  const handleDelete = async (addonId: number) => {
    if (window.confirm("Are you sure you want to delete this add-on?")) {
      await deleteMutation.mutateAsync(addonId);
    }
  };

  const handleClose = () => {
    setEditingAddon(null);
    setSelectedPriceUnit("hour");
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Add-ons</DialogTitle>
          <DialogDescription>
            Create and manage add-ons for your location
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {editingAddon ? "Edit Add-on" : "Create New Add-on"}
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter add-on name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your add-on"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="font-medium">Price Unit</div>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={selectedPriceUnit}
                    onChange={(e) => {
                      const priceUnit = e.target.value as "hour" | "day" | "item";
                      setSelectedPriceUnit(priceUnit);
                      form.setValue("priceUnit", priceUnit);
                    }}
                  >
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="item">Per Item</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingAddon ? (
                      "Update Add-on"
                    ) : (
                      "Create Add-on"
                    )}
                  </Button>
                  {editingAddon && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingAddon(null);
                        setSelectedPriceUnit("hour");
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Existing Add-ons</h3>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !addons || (Array.isArray(addons) && addons.length === 0) ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No add-ons created yet
                </CardContent>
              </Card>
            ) : (
              Array.isArray(addons) && addons.map((addon: any) => (
                <Card key={addon.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {addon.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {addon.description}
                        </p>
                        <p className="font-medium">
                          ${addon.price} per {addon.priceUnit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(addon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(addon.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}