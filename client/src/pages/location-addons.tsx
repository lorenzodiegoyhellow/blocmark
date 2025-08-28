import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be a positive number"),
  priceUnit: z.enum(["hour", "day", "item"]),
});

type AddonFormValues = z.infer<typeof addonSchema>;

export default function LocationAddons() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [editingAddon, setEditingAddon] = useState<any | null>(null);

  const { data: addons, isLoading } = useQuery({
    queryKey: [`/api/locations/${id}/addons`],
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

  const createMutation = useMutation({
    mutationFn: async (data: AddonFormValues) => {
      const response = await apiRequest("POST", `/api/locations/${id}/addons`, data);
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
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${id}/addons`] });
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
      const response = await apiRequest("PATCH", `/api/locations/${id}/addons/${addonId}`, addonData);
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
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${id}/addons`] });
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
      const response = await apiRequest("DELETE", `/api/locations/${id}/addons/${addonId}`);
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
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${id}/addons`] });
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Add-ons</h1>
          <p className="text-muted-foreground">
            Create and manage add-ons for your location
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingAddon ? "Edit Add-on" : "Create New Add-on"}
              </CardTitle>
            </CardHeader>
            <CardContent>
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

                  <FormField
                    control={form.control}
                    name="priceUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Unit</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            value={field.value}
                            onChange={(e) => {
                              const priceUnit = e.target.value as "hour" | "day" | "item";
                              field.onChange(priceUnit);
                            }}
                          >
                            <option value="hour">Per Hour</option>
                            <option value="day">Per Day</option>
                            <option value="item">Per Item</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing Add-ons</h2>
            {addons?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No add-ons created yet
                </CardContent>
              </Card>
            ) : (
              addons?.map((addon: any) => (
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
      </div>
    </AppLayout>
  );
}