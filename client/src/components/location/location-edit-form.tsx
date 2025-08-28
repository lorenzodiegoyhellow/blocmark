import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Location } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, Plus, X, Home, Store, Trophy, Car, Building, Camera, Music2, Film, TreePine, Castle, Hotel, Waves, Warehouse, Plane, Ship, Bus, MapPin, Check, AlertTriangle } from "lucide-react";
import { AddressAutocomplete } from "@/components/address/address-autocomplete";
import { Alert, AlertDescription } from "@/components/ui/alert";

const propertyCategories = {
  Residential: [
    "Apartment",
    "Condo",
    "Farm",
    "House",
    "Loft",
    "Mansion or Estate",
    "Penthouse",
    "Pool",
    "Ranch"
  ],
  Commercial: [
    "Airport", "Bank", "Bar", "Barber Shop", "Brewery",
    "Cafe", "Cemetery", "Church", "Club", "Concert Venue", "Dance Studio",
    "Doctor's Office", "Dormitory", "Entertainment Venue", "Event Space",
    "Farm", "Gallery", "Hangar", "Hospital",
    "Hotel", "Industrial Buildings", "Museum", "Office", "Open Space",
    "Outdoor Venue", "Pool", "Private Dining Room",
    "Private Function Room", "Private Party Room", "Ranch", "Restaurant",
    "Retail", "Salon", "School", "Small Business", "Spa",
    "Temple", "Theater", "University", "Warehouse", "Winery"
  ],
  Sports: [
    "Basketball Court",
    "Fitness Studio",
    "Gym",
    "Pickleball Court",
    "Sports Venue",
    "Tennis Court"
  ],
  Studio: [
    "Film Studio", "Loft Studio", "Photography Studio", "Recording Studio",
    "Stage Studio", "TV Studio"
  ],
  Transportation: [
    "Aviation", "Boat", "Bus", "Car", "Motorcycle", "RV", "Train",
    "Truck", "Van"
  ]
};

const categoryIcons = {
  Residential: {
    icon: Home,
    subcategoryIcons: {
      Apartment: Building,
      Condo: Building,
      Farm: TreePine,
      House: Home,
      Loft: Building,
      "Mansion or Estate": Castle,
      Penthouse: Hotel,
      Pool: Waves,
      Ranch: TreePine,
    }
  },
  Commercial: {
    icon: Store,
    subcategoryIcons: {
      Office: Building,
      Warehouse: Warehouse,
      Retail: Store,
    }
  },
  Sports: {
    icon: Trophy,
    subcategoryIcons: {
      "Basketball Court": Trophy,
      "Fitness Studio": Building,
      "Gym": Building,
      "Pickleball Court": Trophy,
      "Sports Venue": Trophy,
      "Tennis Court": Trophy,
    }
  },
  Studio: {
    icon: Camera,
    subcategoryIcons: {
      "Photography Studio": Camera,
      "Recording Studio": Music2,
      "Film Studio": Film,
    }
  },
  Transportation: {
    icon: Car,
    subcategoryIcons: {
      Aviation: Plane,
      Boat: Ship,
      Bus: Bus,
      Car: Car,
    }
  }
};

const getSubcategories = (mainCategory: keyof typeof propertyCategories) => {
  return propertyCategories[mainCategory] || [];
};



const editLocationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  maxCapacity: z.number().min(5, "Maximum capacity must be at least 5 people"),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"] as const),

  size: z.number().min(1, "Size is required").optional(),
  amenities: z.array(z.string()).optional(),
  prohibitedItems: z.array(z.string()).optional(),
  locationRules: z.array(z.string()).optional(),
  checkInInstructions: z.string().optional(),
  mainCategory: z.enum(["Commercial", "Sports", "Studio", "Transportation", "Residential"] as const).optional(),
  subCategory: z.string().optional(),
  allowedActivities: z.array(z.string()).optional(),
});

type Props = {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
};

// Common amenities list
const COMMON_AMENITIES = [
  "WiFi", "Parking", "Kitchen", "Bathroom", "Air Conditioning", "Heating",
  "Natural Light", "Sound System", "Lighting Equipment", "Electrical Outlets",
  "Furniture", "Green Screen", "Backdrop", "Hair & Makeup Area", "Changing Room",
  "Storage Space", "Loading Dock", "Elevator Access", "Wheelchair Accessible"
];

export function LocationEditForm({ location, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [newProhibitedItem, setNewProhibitedItem] = useState("");
  const [newRule, setNewRule] = useState("");
  const [addressValidated, setAddressValidated] = useState(true); // Initially true since editing existing address
  const [addressChanged, setAddressChanged] = useState(false);
  const [propertyTypeChanged, setPropertyTypeChanged] = useState(false);

  // Parse property type from "Category - Subcategory" format
  const parsePropertyType = (propertyType: string) => {
    if (!propertyType || !propertyType.includes(' - ')) {
      return { mainCategory: undefined, subCategory: '' };
    }
    const [mainCategory, subCategory] = propertyType.split(' - ');
    return { 
      mainCategory: mainCategory as keyof typeof propertyCategories,
      subCategory 
    };
  };

  const { mainCategory, subCategory } = parsePropertyType(location.propertyType);

  const form = useForm<z.infer<typeof editLocationSchema>>({
    resolver: zodResolver(editLocationSchema),
    defaultValues: {
      title: location.title,
      description: location.description,
      address: location.address,
      maxCapacity: location.maxCapacity,
      cancellationPolicy: location.cancellationPolicy as "flexible" | "moderate" | "strict",

      size: location.size || undefined,
      amenities: location.amenities || [],
      prohibitedItems: location.prohibitedItems || [],
      locationRules: location.locationRules || [],
      checkInInstructions: location.checkInInstructions || "",
      mainCategory: mainCategory,
      subCategory: subCategory,
      allowedActivities: location.allowedActivities || [],
    },
  });

  // AI Enhancement Functions
  const generateEnhancedDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const response = await apiRequest({
        url: "/api/ai/enhance-description",
        method: "POST",
        body: {
          currentDescription: form.getValues("description"),
          title: form.getValues("title"),

          amenities: form.getValues("amenities"),
        }
      });

      const data = await response;
      form.setValue("description", data.enhancedDescription);
      toast({
        title: "Description Enhanced",
        description: "AI has improved your property description with professional copywriting.",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance description. Please try again.",
        variant: "destructive",
      });
    }
    setIsGeneratingDescription(false);
  };

  const generateCheckInInstructions = async () => {
    setIsGeneratingInstructions(true);
    try {
      const response = await apiRequest({
        url: "/api/ai/organize-instructions",
        method: "POST",
        body: {
          rawInstructions: form.getValues("checkInInstructions"),
          propertyType: `${form.getValues("mainCategory")} - ${form.getValues("subCategory")}`,
          title: form.getValues("title"),
        }
      });

      const data = await response;
      form.setValue("checkInInstructions", data.organizedInstructions);
      toast({
        title: "Instructions Organized",
        description: "AI has structured your check-in instructions for clarity.",
      });
    } catch (error) {
      toast({
        title: "Organization Failed",
        description: "Could not organize instructions. Please try again.",
        variant: "destructive",
      });
    }
    setIsGeneratingInstructions(false);
  };

  // Helper functions for managing arrays
  const addItem = (fieldName: "amenities" | "prohibitedItems" | "locationRules", item: string) => {
    if (!item.trim()) return;
    const currentItems = form.getValues(fieldName) || [];
    if (!currentItems.includes(item.trim())) {
      form.setValue(fieldName, [...currentItems, item.trim()]);
    }
  };

  const removeItem = (fieldName: "amenities" | "prohibitedItems" | "locationRules", index: number) => {
    const currentItems = form.getValues(fieldName) || [];
    form.setValue(fieldName, currentItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof editLocationSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form with values:", values);

      // Construct property type from mainCategory and subCategory
      const propertyType = values.mainCategory && values.subCategory 
        ? `${values.mainCategory} - ${values.subCategory}`
        : location.propertyType; // Keep existing if not changed

      // Convert location rules from array to string for backend
      const submitData = {
        ...values,
        propertyType,
        locationRules: Array.isArray(values.locationRules) ? values.locationRules : [values.locationRules].filter(Boolean),
        // Remove the temporary fields
        mainCategory: undefined,
        subCategory: undefined
      };

      await apiRequest({
        url: `/api/locations/${location.id}`,
        method: "PATCH",
        body: submitData
      });

      // Invalidate all location-related caches
      await queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      
      // Force refetch the owner's locations
      await queryClient.refetchQueries({ queryKey: [`/api/locations/owner/${user?.id}`] });

      toast({
        title: "Success",
        description: addressChanged || propertyTypeChanged 
          ? "Location updated. Your listing is now under review and will be re-approved soon."
          : "Location updated successfully",
      });

      onClose();
    } catch (error: any) {
      console.error("Failed to update location:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Location Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Warning Alert for Address/Property Type Changes */}
            {(addressChanged || propertyTypeChanged) && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Important:</strong> Changing the {addressChanged && propertyTypeChanged ? 'address and property type' : addressChanged ? 'address' : 'property type'} will require admin re-approval. Your listing will be set to pending status until approved.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Amazing Downtown Loft" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Type Selection */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mainCategory"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Property Category</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(propertyCategories).map(([category]) => {
                            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]?.icon;
                            const isSelected = field.value === category;
                            return (
                              <div
                                key={category}
                                onClick={() => {
                                  field.onChange(category);
                                  // Reset subcategory when main category changes
                                  form.setValue('subCategory', '');
                                  // Check if property type has changed
                                  const newPropertyType = `${category} - `;
                                  if (!location.propertyType.startsWith(newPropertyType)) {
                                    setPropertyTypeChanged(true);
                                  }
                                }}
                                className={`
                                  relative p-4 rounded-lg border-2 cursor-pointer
                                  transition-all duration-200
                                  ${isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <CategoryIcon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {category}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("mainCategory") && (
                    <FormField
                      control={form.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specific type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("mainCategory") &&
                                getSubcategories(form.watch("mainCategory") as keyof typeof propertyCategories).map((subCategory) => {
                                  const mainCategory = form.watch("mainCategory") as keyof typeof categoryIcons;
                                  const iconCategory = categoryIcons[mainCategory] || { subcategoryIcons: {} };
                                  const subcategoryIconMap = iconCategory.subcategoryIcons || {};
                                  const SubCategoryIcon = (subcategoryIconMap[subCategory as keyof typeof subcategoryIconMap] as any) || Store;
                                  
                                  return (
                                    <SelectItem key={subCategory} value={subCategory}>
                                      <div className="flex items-center gap-2">
                                        <SubCategoryIcon className="w-4 h-4" />
                                        <span>{subCategory}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Location Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          {...field}
                          onValidated={(validated) => {
                            setAddressValidated(validated.isValid);
                          }}
                          placeholder="Type to search for verified addresses"
                          onChange={(value) => {
                            field.onChange(value);
                            // Check if address has changed from original
                            if (value !== location.address) {
                              setAddressChanged(true);
                            } else {
                              setAddressChanged(false);
                            }
                          }}
                        />
                      </FormControl>
                      {!addressValidated && field.value && field.value.length > 2 && (
                        <div className="absolute right-2 top-8 flex items-center space-x-2">
                          <span className="text-xs text-yellow-600">Select from dropdown</span>
                          <MapPin className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                      {addressValidated && field.value && (
                        <div className="absolute right-2 top-8 flex items-center space-x-2">
                          <span className="text-xs text-green-600">Verified</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      <FormMessage />
                      <p className="text-sm text-muted-foreground mt-1">
                        Start typing and select from the verified address suggestions
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Description</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-full"
                          onClick={generateEnhancedDescription}
                          disabled={isGeneratingDescription}
                        >
                          {isGeneratingDescription ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Enhance with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]" placeholder="Describe your space in detail..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (sq ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="2000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cancellationPolicy"
                  render={({ field }) => {
                    const getPolicyExplanation = (policy: string) => {
                      switch (policy) {
                        case "flexible":
                          return (
                            <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                              <h5 className="font-semibold text-green-800 mb-2">Flexible Policy Details</h5>
                              <div className="space-y-2 text-sm text-green-700">
                                <p>• Free cancellation up to 24 hours before booking</p>
                                <p>• Full refund if cancelled at least 24 hours in advance</p>
                                <p>• 50% refund for cancellations between 12-24 hours</p>
                                <p>• No refund for cancellations less than 12 hours</p>
                              </div>
                            </div>
                          );
                        case "moderate":
                          return (
                            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <h5 className="font-semibold text-amber-800 mb-2">Moderate Policy Details</h5>
                              <div className="space-y-2 text-sm text-amber-700">
                                <p>• Free cancellation up to 5 days before booking</p>
                                <p>• Full refund if cancelled at least 5 days in advance</p>
                                <p>• 50% refund for cancellations between 1-5 days</p>
                                <p>• No refund for cancellations less than 24 hours</p>
                              </div>
                            </div>
                          );
                        case "strict":
                          return (
                            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                              <h5 className="font-semibold text-red-800 mb-2">Strict Policy Details</h5>
                              <div className="space-y-2 text-sm text-red-700">
                                <p>• Free cancellation up to 7 days before booking</p>
                                <p>• Full refund if cancelled at least 7 days in advance</p>
                                <p>• 50% refund for cancellations between 2-7 days</p>
                                <p>• No refund for cancellations less than 48 hours</p>
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    };

                    return (
                      <FormItem>
                        <FormLabel>Cancellation Policy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="flexible">Flexible</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {field.value && getPolicyExplanation(field.value)}
                      </FormItem>
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {COMMON_AMENITIES.map((amenity) => (
                            <Button
                              key={amenity}
                              type="button"
                              variant={(field.value || []).includes(amenity) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const current = field.value || [];
                                if (current.includes(amenity)) {
                                  field.onChange(current.filter(a => a !== amenity));
                                } else {
                                  field.onChange([...current, amenity]);
                                }
                              }}
                            >
                              {amenity}
                            </Button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Add custom amenity"
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newAmenity.trim() && !(field.value || []).includes(newAmenity.trim())) {
                                  field.onChange([...(field.value || []), newAmenity.trim()]);
                                  setNewAmenity("");
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (newAmenity.trim() && !(field.value || []).includes(newAmenity.trim())) {
                                field.onChange([...(field.value || []), newAmenity.trim()]);
                                setNewAmenity("");
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(field.value || []).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {amenity}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => {
                                  const current = field.value || [];
                                  field.onChange(current.filter((_, i) => i !== index));
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Activity Types removed - now integrated into pricing */}

            {/* Prohibited Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prohibited Items & Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FormLabel>Prohibited Items</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add prohibited item"
                      value={newProhibitedItem}
                      onChange={(e) => setNewProhibitedItem(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem("prohibitedItems", newProhibitedItem);
                          setNewProhibitedItem("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addItem("prohibitedItems", newProhibitedItem);
                        setNewProhibitedItem("");
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.getValues("prohibitedItems")?.map((item, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {item}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeItem("prohibitedItems", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <FormLabel>Location Rules</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add location rule"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem("locationRules", newRule);
                          setNewRule("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addItem("locationRules", newRule);
                        setNewRule("");
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.getValues("locationRules")?.map((rule, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {rule}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeItem("locationRules", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-in Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Check-in Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="checkInInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Instructions for Guests</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-full"
                          onClick={generateCheckInInstructions}
                          disabled={isGeneratingInstructions}
                        >
                          {isGeneratingInstructions ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Organizing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Organize with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[100px]" 
                          placeholder="Provide detailed check-in instructions for your guests..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Location"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}