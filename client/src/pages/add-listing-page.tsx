import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/app-layout";
import { insertLocationSchema } from "@shared/schema";
import { useHostMode } from "@/hooks/use-host-mode";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  MapPin,
  Building2,
  ClipboardList,
  DollarSign,
  ImagePlus,
  CheckCircle2,
  Building,
  Car,
  Store,
  Warehouse,
  Camera as StudioIcon,
  Music2,
  Film,
  Car as TransportIcon,
  Plane,
  Ship,
  Bus,
  Home,
  Building as ApartmentIcon,
  Trophy,
  Waves,
  Castle,
  TreePine,
  Hotel,
  X,
  Check,
  Shield,
  Users,
  Clock,
  Plus,
  Camera,
  Calendar,
  Calculator,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { AddressAutocomplete } from "@/components/address/address-autocomplete";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { validateAddress } from "@/lib/address-validator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropertyFeaturesSelector } from "@/components/property/property-features-selector";
import { PricingMatrixGrid } from "@/components/PricingMatrixGrid";
import { SimplifiedPricingSection } from "@/components/SimplifiedPricingSection";

const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Balanced dimensions for good quality while maintaining reasonable file size
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 768;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Better quality for images (0.8)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const addressSchema = z.object({
  fullAddress: z.string().min(1, "Address is required"),
});

const propertyTypeSchema = z.object({
  // Use a union of literal types to match the keys of propertyCategories
  mainCategory: z.enum(["Commercial", "Sports", "Studio", "Transportation", "Residential"] as const),
  subCategory: z.string().min(1, "Please select a subcategory"),
  houseStyle: z.string().optional(), // House style for residential properties
  propertyFeatures: z.array(z.string()).optional(), // Property features array
});

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


const propertyDetailsSchema = insertLocationSchema.pick({
  title: true,
  description: true,
}).extend({
  size: z.number().min(1, "Size must be greater than 0"),
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  cancellationPolicy: z.enum(["very_flexible", "flexible", "standard_30", "standard_90"]),
  checkInInstructions: z.string().optional(),

  prohibitedItems: z.array(z.string()).default([]),
  locationRules: z.array(z.string()).default([]),
});

const pricingSchema = z.object({
  minHours: z.number().min(1, "Minimum hours must be at least 1"),
  // Simple pricing matrix: activity -> group size -> hourly rate
  pricingMatrix: z.record(z.string(), z.record(z.string(), z.number().min(1))).optional(),
  // Enabled group sizes for this location
  enabledGroupSizes: z.array(z.string()).min(1, "At least one group size must be enabled").optional(),
});

const imageSchema = z.object({
  images: z.array(z.union([z.instanceof(File), z.string()]))
    .min(5, "Please upload at least 5 images")
    .max(30, "Maximum 30 images allowed")
    .refine((files) => {
      return files.every(file => 
        typeof file === 'string' || file.size <= 5 * 1024 * 1024 // 5MB limit
      );
    }, "Each image must be smaller than 5MB"),
});

const availabilitySchema = z.object({
  blockedDates: z.array(z.date()),
});

const confirmationSchema = z.object({
  confirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm the listing details before proceeding",
  }),
});

const houseStyles = [
  "Americana",
  "Art Deco",
  "Asian",
  "Baroque",
  "Beach House",
  "Beachfront",
  "Bohemian",
  "Brutalist",
  "Bungalow",
  "Cabin",
  "Cape Cod",
  "Castle/Chateau",
  "Colonial",
  "Contemporary Modern",
  "Craftsman",
  "Creole",
  "Dated",
  "Desert",
  "Dilapidated",
  "Dutch Colonial",
  "Exotic",
  "French",
  "Georgian",
  "Gothic",
  "Greek",
  "High Tech",
  "Industrial",
  "Lake House",
  "Maximalist",
  "Mediterranean",
  "Mid-century Modern",
  "Minimalist",
  "Moroccan",
  "Old Hollywood",
  "Postmodern",
  "Ranch Style",
  "Rustic",
  "Spanish",
  "Trailer Park",
  "Tudor",
  "Victorian",
  "Zen"
];

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

const AMENITIES = [
  // Basic Amenities
  "WiFi",
  "Parking",
  "Air Conditioning", 
  "Heating",
  "Natural Light",
  "Blackout Curtains",
  "Sound System",
  "Changing Room",
  "Restroom",
  "Elevator",
  "Loading Dock",
  
  // Kitchen & Visual Features  
  "Kitchen",
  "Modern Kitchen",
  "Cabinet",
  "Counter",
  "Sink",
  "Cooking Space",
  "Refrigerator",
  "Microwave",
  "Dishwasher",
  "Stove/Oven",
  
  // Lighting & Technical
  "Professional Lighting",
  "Studio Lights",
  "LED Lighting",
  "Ambient Lighting",
  "Dimmable Lights",
  "Green Screen",
  "White Backdrop",
  "Colored Backdrops",
  
  // Furniture & Decor
  "Furniture Included",
  "Modern Furniture",
  "Vintage Furniture",
  "Props Available",
  "Wardrobe/Costumes",
  "Mirrors",
  "Seating Area",
  "Dining Area",
  "Bedroom Setup",
  "Living Room Setup",
  
  // Outdoor Features
  "Garden/Yard",
  "Balcony/Patio",
  "Pool",
  "Hot Tub",
  "BBQ/Grill",
  "Outdoor Seating",
  "Scenic Views",
  "Water View",
  "City View",
  "Mountain View",
  
  // Technical Equipment
  "Audio Equipment",
  "Video Equipment",
  "Cameras Available",
  "Tripods",
  "Extension Cords",
  "Power Outlets",
  "High-Speed Internet",
  "Streaming Setup",
  
  // Accessibility & Comfort
  "Wheelchair Accessible",
  "Ground Floor Access",
  "Climate Control",
  "Security System",
  "Private Entrance",
  "Separate Entrance",
  
  // Special Features
  "Unique Architecture",
  "Historic Character",
  "Industrial Style",
  "Modern Design",
  "Rustic Character",
  "Urban Setting",
  "Quiet Environment",
  "High Ceilings",
  "Large Windows",
  "Fireplace"
];

const PROHIBITED_ITEMS = [
  "No smoking or open flames",
  "No pets allowed",
  "No unauthorized guests",
  "No permanent modifications to the space",
  "No food or drinks in certain areas",
  "No loud music after hours",
  "No adhesives on walls",
  "No excessive decorations",
  "No parties or large gatherings"
];

const LOCATION_RULES = [
  "Respect quiet hours",
  "Clean up after use",
  "Report any damages immediately",
  "Follow building security protocols",
  "Maximum occupancy limits enforced",
  "Check-in and check-out times must be respected",
  "Parking restrictions apply",
  "No overnight stays without permission",
  "Equipment must be returned in original condition",
  "Emergency contact information required",
  "Insurance requirements may apply",
  "Professional conduct expected at all times"
];

const steps = [
  {
    id: 1,
    title: "Location",
    description: "Enter your property's address",
    icon: MapPin
  },
  {
    id: 2,
    title: "Space Type",
    description: "Choose your property category and type",
    icon: Building2
  },
  {
    id: 3,
    title: "Accessibility",
    description: "Parking and access information",
    icon: Car
  },
  {
    id: 4,
    title: "Details",
    description: "Add property details and amenities",
    icon: ClipboardList
  },
  {
    id: 5,
    title: "Pricing",
    description: "Set your rates & select activities",
    icon: DollarSign
  },
  {
    id: 6,
    title: "Photos",
    description: "Upload property images",
    icon: ImagePlus
  },
  {
    id: 7,
    title: "Schedule",
    description: "Set your availability",
    icon: Calendar
  },
  {
    id: 8,
    title: "Review",
    description: "Review and publish your listing",
    icon: CheckCircle2
  },
];

const categoryIcons = {
  Residential: {
    icon: Home,
    subcategoryIcons: {
      Apartment: ApartmentIcon,
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
    icon: StudioIcon,
    subcategoryIcons: {
      "Photography Studio": Camera,
      "Recording Studio": Music2,
      "Film Studio": Film,
    }
  },
  Transportation: {
    icon: TransportIcon,
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

export default function AddListingPage() {
  const { user } = useAuth();
  const { isHostMode } = useHostMode();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  
  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [step]);
  
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newCustomAmenity, setNewCustomAmenity] = useState("");
  const [showAllProhibitedItems, setShowAllProhibitedItems] = useState(false);
  const [customProhibitedItems, setCustomProhibitedItems] = useState<string[]>([]);
  const [newCustomProhibitedItem, setNewCustomProhibitedItem] = useState("");
  const [showAllLocationRules, setShowAllLocationRules] = useState(false);
  const [customLocationRules, setCustomLocationRules] = useState<string[]>([]);
  const [newCustomLocationRule, setNewCustomLocationRule] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingInstructions, setGeneratingInstructions] = useState(false);
  const { toast } = useToast();

  const addCustomAmenity = () => {
    if (newCustomAmenity.trim() && !customAmenities.includes(newCustomAmenity.trim())) {
      const newAmenity = newCustomAmenity.trim();
      setCustomAmenities([...customAmenities, newAmenity]);
      
      // Also add it to the form's amenities array
      const currentAmenities = propertyForm.getValues('amenities');
      propertyForm.setValue('amenities', [...currentAmenities, newAmenity]);
      
      setNewCustomAmenity("");
    }
  };

  const removeCustomAmenity = (amenityToRemove: string) => {
    setCustomAmenities(customAmenities.filter(amenity => amenity !== amenityToRemove));
    
    // Also remove it from the form's amenities array
    const currentAmenities = propertyForm.getValues('amenities');
    propertyForm.setValue('amenities', currentAmenities.filter(amenity => amenity !== amenityToRemove));
  };

  // Prohibited Items helpers
  const addCustomProhibitedItem = () => {
    if (newCustomProhibitedItem.trim() && !customProhibitedItems.includes(newCustomProhibitedItem.trim())) {
      const newItem = newCustomProhibitedItem.trim();
      setCustomProhibitedItems([...customProhibitedItems, newItem]);
      
      const currentItems = propertyForm.getValues('prohibitedItems');
      propertyForm.setValue('prohibitedItems', [...currentItems, newItem]);
      
      setNewCustomProhibitedItem("");
    }
  };

  const removeCustomProhibitedItem = (itemToRemove: string) => {
    setCustomProhibitedItems(customProhibitedItems.filter(item => item !== itemToRemove));
    
    const currentItems = propertyForm.getValues('prohibitedItems');
    propertyForm.setValue('prohibitedItems', currentItems.filter(item => item !== itemToRemove));
  };

  // Location Rules helpers
  const addCustomLocationRule = () => {
    if (newCustomLocationRule.trim() && !customLocationRules.includes(newCustomLocationRule.trim())) {
      const newRule = newCustomLocationRule.trim();
      setCustomLocationRules([...customLocationRules, newRule]);
      
      const currentRules = propertyForm.getValues('locationRules');
      propertyForm.setValue('locationRules', [...currentRules, newRule]);
      
      setNewCustomLocationRule("");
    }
  };

  const removeCustomLocationRule = (ruleToRemove: string) => {
    setCustomLocationRules(customLocationRules.filter(rule => rule !== ruleToRemove));
    
    const currentRules = propertyForm.getValues('locationRules');
    propertyForm.setValue('locationRules', currentRules.filter(rule => rule !== ruleToRemove));
  };

  // Get items to display based on show more state
  const visibleAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 20);
  const visibleProhibitedItems = showAllProhibitedItems ? PROHIBITED_ITEMS : PROHIBITED_ITEMS.slice(0, 8);
  const visibleLocationRules = showAllLocationRules ? LOCATION_RULES : LOCATION_RULES.slice(0, 8);



  if (!user) {
    navigate("/auth?redirect=/add-listing");
    return null;
  }
  
  if (!isHostMode) {
    navigate("/");
    return null;
  }

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullAddress: "",
    },
  });

  const propertyTypeForm = useForm<z.infer<typeof propertyTypeSchema>>({
    resolver: zodResolver(propertyTypeSchema),
    defaultValues: {
      mainCategory: undefined,
      subCategory: "",
      houseStyle: "",
      propertyFeatures: [],
    },
  });

  const accessibilityForm = useForm<z.infer<typeof accessibilitySchema>>({
    resolver: zodResolver(accessibilitySchema),
    defaultValues: {
      parking: {
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
      access: {
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


  const propertyForm = useForm<z.infer<typeof propertyDetailsSchema>>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      title: "",
      description: "",
      size: 0,
      amenities: [],
      cancellationPolicy: "very_flexible",
      checkInInstructions: "",

      prohibitedItems: [],
      locationRules: [],
    },
  });

  const pricingForm = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      minHours: 1,
      pricingMatrix: {},
    },
  });

  const imageForm = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      images: [],
    },
  });

  const availabilityForm = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      blockedDates: [],
    },
  });

  const confirmationForm = useForm<z.infer<typeof confirmationSchema>>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      confirmed: false,
    },
  });

  const onAddressSubmit = async (data: z.infer<typeof addressSchema>) => {
    try {
      setIsValidatingAddress(true);
      console.log("Validating address data:", data);

      if (!data.fullAddress) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid address.",
          variant: "destructive",
        });
        return;
      }

      // Check if the address has been validated through Google Places
      if (!addressValidated) {
        toast({
          title: "Address Not Verified",
          description: "Please select a valid address from the dropdown suggestions. This ensures accurate location data for your listing.",
          variant: "destructive",
        });
        return;
      }

      console.log("Address validated successfully");
      toast({
        title: "Address Verified",
        description: "Address validated successfully.",
      });

      setStep(2);
    } catch (error: any) {
      console.error("Address validation error:", error);
      toast({
        title: "Error",
        description: "Failed to validate address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const onPropertyTypeSubmit = (data: z.infer<typeof propertyTypeSchema>) => {
    console.log("Property type:", data);
    setStep(3);
  };

  const onAccessibilitySubmit = (data: z.infer<typeof accessibilitySchema>) => {
    console.log("Accessibility data:", data);
    setStep(4); // Now goes to Details step
  };


  const onPropertySubmit = () => {
    console.log("Validating property details form...");
    
    // Get current form values
    const values = propertyForm.getValues();
    console.log("Current form values:", values);

    // Manual validation
    if (!values.title || values.title.trim() === '') {
      toast({
        title: "Form Error",
        description: "Please enter a property name",
        variant: "destructive",
      });
      return;
    }

    if (!values.description || values.description.trim() === '') {
      toast({
        title: "Form Error",
        description: "Please enter a property description",
        variant: "destructive",
      });
      return;
    }

    if (!values.size || values.size <= 0) {
      toast({
        title: "Form Error",
        description: "Please enter the property size",
        variant: "destructive",
      });
      return;
    }

    if (!values.cancellationPolicy) {
      toast({
        title: "Form Error",
        description: "Please select a cancellation policy",
        variant: "destructive",
      });
      return;
    }

    if (!values.amenities || values.amenities.length === 0) {
      toast({
        title: "Form Error",
        description: "Please select at least one amenity for your property",
        variant: "destructive",
      });
      return;
    }

    console.log("Property details validation passed, proceeding to pricing (step 5)");
    // Go to step 5 (Pricing)
    setStep(5);
  };

  const onPricingSubmit = (data: z.infer<typeof pricingSchema>) => {
    console.log("Pricing form submitted:", data);
    setStep(6); // Go to Photos step
  };

  const onImageSubmit = async (data: z.infer<typeof imageSchema>) => {
    try {
      const imageUrls = await Promise.all(
        data.images.map(async (file) => {
          if (typeof file === 'string') return file;
          try {
            const compressedImage = await compressImage(file);
            return compressedImage;
          } catch (error) {
            console.error("Error compressing image:", error);
            throw new Error("Failed to process image");
          }
        })
      );

      imageForm.setValue('images', imageUrls);
      console.log("Processed and compressed image URLs:", imageUrls);
      setStep(7); // Go to Schedule step
    } catch (error) {
      console.error("Error processing images:", error);
      toast({
        title: "Error",
        description: "Failed to process images. Please ensure your images are valid and try again.",
        variant: "destructive",
      });
    }
  };

  const onAvailabilitySubmit = (data: z.infer<typeof availabilitySchema>) => {
    console.log("Availability form submitted:", data);
    setStep(8); // Go to Review step
  };

  const onConfirmationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submission started");

    try {
      // Verify authentication first
      if (!user) {
        console.error("User not authenticated");
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a listing",
          variant: "destructive",
        });
        navigate("/auth?redirect=/add-listing");
        return;
      }

      const formData = confirmationForm.getValues();

      if (!formData.confirmed) {
        toast({
          title: "Error",
          description: "Please confirm the listing details before proceeding",
          variant: "destructive",
        });
        return;
      }

      // Validate all required fields
      const requiredFields = {
        title: propertyForm.getValues().title,
        description: propertyForm.getValues().description,
        address: addressForm.getValues().fullAddress,
        images: imageForm.getValues().images,
        propertyType: `${propertyTypeForm.getValues().mainCategory} - ${propertyTypeForm.getValues().subCategory}`,
      };

      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast({
            title: "Missing Information",
            description: `Please provide ${field}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Process images first
      try {
        // Log status for debugging
        console.log("Processing images...");
        
        const imageUrls = await Promise.all(
          imageForm.getValues().images.map(async (file, index) => {
            if (typeof file === 'string') {
              console.log(`Image ${index + 1} is already a string URL`);
              return file;
            }
            try {
              console.log(`Compressing image ${index + 1}...`);
              const compressedImage = await compressImage(file);
              console.log(`Image ${index + 1} compressed successfully`);
              return compressedImage;
            } catch (error) {
              console.error(`Error compressing image ${index + 1}:`, error);
              throw new Error(`Failed to process image ${index + 1}`);
            }
          })
        );

        console.log("All images processed successfully:", imageUrls.length);

        // Derive allowedActivities from pricing matrix - activities with prices are allowed
        const pricingMatrix = pricingForm.getValues().pricingMatrix || {};
        const derivedAllowedActivities = ['photo', 'video', 'event', 'meeting'].filter(activity => {
          const activityPrices = pricingMatrix[activity];
          if (!activityPrices) return false;
          return Object.values(activityPrices).some((price: any) => price > 0);
        });

        // Calculate maxCapacity based on enabled group sizes
        const enabledGroupSizes = pricingForm.getValues().enabledGroupSizes || ['small'];
        const groupSizeCapacities: Record<string, number> = {
          small: 5,
          medium: 10,
          large: 20,
          xlarge: 50
        };
        const maxCapacity = Math.max(...enabledGroupSizes.map(size => groupSizeCapacities[size] || 5));

        const listingData = {
          title: propertyForm.getValues().title,
          description: propertyForm.getValues().description,
          address: addressForm.getValues().fullAddress,
          price: 100, // Default base price, actual pricing is in pricingMatrix
          images: imageUrls, // Include processed images
          propertyType: `${propertyTypeForm.getValues().mainCategory} - ${propertyTypeForm.getValues().subCategory}`,
          amenities: propertyForm.getValues().amenities,
          size: propertyForm.getValues().size,
          maxCapacity: maxCapacity, // Required field for backward compatibility
          incrementalRate: 0, // Deprecated - using pricingMatrix instead
          minHours: pricingForm.getValues().minHours,
          // Use pricingMatrix instead of groupSizePricing
          pricingMatrix: pricingForm.getValues().pricingMatrix || {},
          enabledGroupSizes: enabledGroupSizes, // Include enabled group sizes
          cancellationPolicy: propertyForm.getValues().cancellationPolicy,
          availability: JSON.stringify(availabilityForm.getValues().blockedDates.map(date => date.toISOString())),
          prohibitedItems: propertyForm.getValues().prohibitedItems,
          locationRules: propertyForm.getValues().locationRules,
          checkInInstructions: propertyForm.getValues().checkInInstructions,
          allowedActivities: derivedAllowedActivities,
          // Include house style for residential properties
          ...(propertyTypeForm.getValues().mainCategory === "Residential" && propertyTypeForm.getValues().houseStyle ? {
            houseStyle: propertyTypeForm.getValues().houseStyle
          } : {}),
          // Include property features if any are selected
          ...(() => {
            const features = propertyTypeForm.getValues().propertyFeatures;
            return features && features.length > 0 ? { propertyFeatures: features } : {};
          })(),
        };

        console.log("Preparing to submit listing data...");
        console.log("Data size: approximately", JSON.stringify(listingData).length, "bytes");
        
        // For debugging, log a redacted version of the data without the full image content
        console.log("Submitting listing with images:", {
          ...listingData,
          images: `${listingData.images.length} images processed`
        });

        toast({
          title: "Submitting...",
          description: "Creating your listing, please wait...",
        });

        const response = await apiRequest({
          url: "/api/locations",
          method: "POST", 
          body: listingData
        });

        // The apiRequest function already handles error parsing and throwing
        // It will return a parsed JSON response

        const createdListing = response;
        console.log("Created listing successfully:", createdListing);

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${user.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/locations'] });

        toast({
          title: "Success!",
          description: "Your location has been listed successfully.",
        });

        navigate("/listings");
      } catch (error: any) {
        console.error("Error processing images or submitting listing:", error);
        
        // Provide more specific error message based on the error
        let errorMessage = "Failed to create listing. Please try again.";
        
        if (error.message.includes("Network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("image")) {
          errorMessage = "Failed to process images. Please try with different images or reduce their size.";
        } else if (error.message.includes("auth") || error.message.includes("unauthorized")) {
          errorMessage = "Authentication error. Please sign in again and try once more.";
          navigate("/auth?redirect=/add-listing");
          return;
        }
        
        toast({
          title: "Error",
          description: error.message || errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      {/* Modern gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
        {/* Hero section with progress */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-6">

            
            {/* Enhanced progress bar */}
            <div className="relative">
              <Progress 
                value={(step / 9) * 100} 
                className="h-3 bg-slate-200/60 rounded-full overflow-hidden shadow-inner"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
            </div>
            
            {/* Modern step indicators */}
            <div className="flex items-center mt-6 relative">
              {/* Connection line */}
              <div className="absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200" />
              
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isActive = s.id === step;
                const isPast = s.id < step;
                const isFuture = s.id > step;
                
                return (
                  <div key={s.id} className="relative z-10 flex-1 flex justify-center">
                    <div
                      className={`group flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer
                        ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                    >
                      {/* Enhanced step circle */}
                      <div className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100' 
                          : isPast 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-md'
                            : 'bg-white border-2 border-slate-300 shadow-sm hover:border-blue-300'
                        }
                      `}>
                        {isPast ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className={`w-5 h-5 transition-colors duration-300 ${
                            isActive ? 'text-white animate-pulse' : isFuture ? 'text-slate-400' : 'text-slate-600'
                          }`} />
                        )}
                        
                        {/* Active indicator pulse */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                        )}
                      </div>
                      
                      {/* Step label */}
                      <div className="text-center">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          isActive ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-slate-500'
                        }`}>
                          {s.title}
                        </span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                        <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                          {s.description}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Enhanced main card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            {/* Card header with gradient */}
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  {React.createElement(steps[step - 1].icon, { 
                    className: "w-6 h-6 text-white" 
                  })}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-1">
                    {steps[step - 1].title}
                  </CardTitle>
                  <p className="text-slate-600 text-base">
                    {steps[step - 1].description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 font-medium">Step {step} of 9</div>
                  <div className="text-2xl font-bold text-blue-600">{Math.round((step / 9) * 100)}%</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-8">

                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-8">
                    <FormField
                      control={addressForm.control}
                      name="fullAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-slate-900">Property Address</FormLabel>
                          <p className="text-sm text-slate-600 mb-2">
                            Start typing and select from the verified address suggestions
                          </p>
                          <FormControl>
                            <div className="relative">
                              <AddressAutocomplete
                                value={field.value || ""}
                                onChange={(value) => {
                                  field.onChange(value);
                                  // Reset validation when user types
                                  setAddressValidated(false);
                                }}
                                placeholder="Start typing your property address..."
                                disabled={isValidatingAddress}
                                onValidated={(validatedAddress) => {
                                  if (validatedAddress.isValid) {
                                    setAddressValidated(true);
                                  }
                                }}
                                className="pl-12 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                              />
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <MapPin className="w-5 h-5 text-slate-400" />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                          {addressValidated && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-3">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-sm text-green-700 font-medium">Address verified successfully!</p>
                            </div>
                          )}
                          {!addressValidated && field.value && field.value.length > 3 && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-3">
                              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-amber-800 font-medium">Please select an address from the dropdown</p>
                                <p className="text-xs text-amber-700 mt-1">
                                  To ensure accurate location data, you must select a verified address from the suggestions that appear as you type.
                                </p>
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isValidatingAddress}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isValidatingAddress ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Validating Address...
                          </>
                        ) : (
                          <>
                            Next: Property Type
                            <Building2 className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">

                <Form {...propertyTypeForm}>
                  <form onSubmit={propertyTypeForm.handleSubmit(onPropertyTypeSubmit)} className="space-y-8">
                    <FormField
                      control={propertyTypeForm.control}
                      name="mainCategory"
                      render={({ field }) => (
                        <FormItem className="space-y-6">
                          <FormLabel className="text-lg font-medium text-slate-900">Property Category</FormLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(propertyCategories).map(([category]) => {
                              const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]?.icon;
                              const isSelected = field.value === category;
                              return (
                                <div
                                  key={category}
                                  onClick={() => field.onChange(category)}
                                  className={`
                                    group relative p-6 rounded-2xl border-2 cursor-pointer
                                    transition-all duration-300 ease-out hover:scale-105
                                    ${isSelected
                                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white shadow-sm hover:shadow-md'}
                                  `}
                                >
                                  <div className="flex flex-col items-center gap-4 text-center">
                                    {CategoryIcon && (
                                      <div className={`
                                        p-4 rounded-2xl transition-all duration-300
                                        ${isSelected ? 'bg-blue-500 shadow-lg' : 'bg-slate-100 group-hover:bg-blue-100'}
                                      `}>
                                        <CategoryIcon className={`
                                          w-8 h-8 transition-colors duration-300
                                          ${isSelected ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}
                                        `} />
                                      </div>
                                    )}
                                    <h3 className={`
                                      font-semibold text-lg transition-colors duration-300
                                      ${isSelected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'}
                                    `}>
                                      {category}
                                    </h3>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-3 right-3">
                                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                        <Check className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {propertyTypeForm.watch("mainCategory") && (
                      <FormField
                        control={propertyTypeForm.control}
                        name="subCategory"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-lg font-medium text-slate-900">Specific Type</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {propertyTypeForm.watch("mainCategory") &&
                                getSubcategories(propertyTypeForm.watch("mainCategory")).map((subCategory) => {
                                  const isSelected = field.value === subCategory;
                                  const mainCategory = propertyTypeForm.watch("mainCategory") as keyof typeof categoryIcons;
                                  const iconCategory = categoryIcons[mainCategory] || { subcategoryIcons: {} };
                                  const subcategoryIconMap = iconCategory.subcategoryIcons || {};
                                  const SubCategoryIcon = (subcategoryIconMap[subCategory as keyof typeof subcategoryIconMap] as React.ComponentType<any>) || Store;

                                  return (
                                    <div
                                      key={subCategory}
                                      onClick={() => field.onChange(subCategory)}
                                      className={`
                                        group relative p-4 rounded-xl border-2 cursor-pointer
                                        transition-all duration-200 hover:scale-105
                                        ${isSelected
                                          ? 'border-blue-500 bg-blue-50 shadow-md'
                                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'}
                                      `}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`
                                          p-2 rounded-lg transition-all duration-200
                                          ${isSelected ? 'bg-blue-500' : 'bg-slate-100 group-hover:bg-blue-100'}
                                        `}>
                                          <SubCategoryIcon className={`w-5 h-5 transition-colors duration-200 ${
                                            isSelected ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                                          }`} />
                                        </div>
                                        <span className={`
                                          text-sm font-medium transition-colors duration-200
                                          ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}
                                        `}>
                                          {subCategory}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <div className="absolute top-2 right-2">
                                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* House Style Selection for Residential Properties */}
                    {propertyTypeForm.watch("mainCategory") === "Residential" && propertyTypeForm.watch("subCategory") && (
                      <FormField
                        control={propertyTypeForm.control}
                        name="houseStyle"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-lg font-medium text-slate-900">House Style</FormLabel>
                            <FormDescription className="text-base text-slate-600">
                              Select the architectural or design style that best describes your property
                            </FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {houseStyles.map((style) => {
                                const isSelected = field.value === style;
                                
                                return (
                                  <div
                                    key={style}
                                    onClick={() => field.onChange(style)}
                                    className={`
                                      group relative p-4 rounded-xl border-2 cursor-pointer
                                      transition-all duration-200 hover:scale-105
                                      ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'}
                                    `}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`
                                        text-sm font-medium transition-colors duration-200
                                        ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}
                                      `}>
                                        {style}
                                      </span>
                                      {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                          <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Property Features Selection - Only for Residential Properties */}
                    {propertyTypeForm.watch("mainCategory") === "Residential" && propertyTypeForm.watch("subCategory") && (
                      <FormField
                        control={propertyTypeForm.control}
                        name="propertyFeatures"
                        render={({ field }) => (
                          <FormItem>
                            <PropertyFeaturesSelector
                              selectedFeatures={field.value || []}
                              onFeaturesChange={(features) => field.onChange(features)}
                              className="mt-6"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl font-medium transition-all duration-200"
                      >
                        <MapPin className="mr-2 h-5 w-5" />
                        Back to Address
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Next: Accessibility
                        <Car className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <Form {...accessibilityForm}>
                  <form onSubmit={accessibilityForm.handleSubmit(onAccessibilitySubmit)} className="space-y-8">
                    {/* Introduction */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Parking and Access Information</h3>
                      <p className="text-blue-700">
                        Parking and access information is essential for events and productions involving equipment, furniture, props, or sizeable groups. 
                        Including these details helps producers, organizers, and guests plan effectively.
                      </p>
                    </div>

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
                            control={accessibilityForm.control}
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
                          {accessibilityForm.watch("parking.onsiteParking") && (
                            <FormField
                              control={accessibilityForm.control}
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
                            control={accessibilityForm.control}
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
                          control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                            {accessibilityForm.watch("access.rollUpDoor") && (
                              <FormField
                                control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                            {accessibilityForm.watch("access.doubleWideDoors") && (
                              <FormField
                                control={accessibilityForm.control}
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
                            control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                            {accessibilityForm.watch("access.corridorMinWidth") && (
                              <FormField
                                control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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
                            {accessibilityForm.watch("access.freightElevatorCapacity") && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField
                                  control={accessibilityForm.control}
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
                                  control={accessibilityForm.control}
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
                              control={accessibilityForm.control}
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

                    <div className="pt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl font-medium transition-all duration-200"
                      >
                        <Building2 className="mr-2 h-5 w-5" />
                        Back to Space Type
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Next: Details
                        <ClipboardList className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {/* Activities step removed - now integrated into pricing */}

            {step === 4 && (
              <div className="space-y-8">
                <div 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                >
                <Form {...propertyForm}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}>
                  <div className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
                      <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                          control={propertyForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-slate-900">Property Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Give your property a catchy name..." 
                                  className="py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              
                              {/* AI Button for Property Name */}
                              <Button
                                type="button"
                                onClick={() => {
                                  if (!field.value?.trim()) {
                                    toast({
                                      title: "Input Required",
                                      description: "Please enter a basic property name first.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  setGeneratingInstructions(true);
                                  apiRequest({
                                    url: "/api/ai/generate-property-name",
                                    method: "POST",
                                    body: { brief: field.value }
                                  }).then((response) => {
                                    field.onChange(response.name);
                                    toast({
                                      title: "Name Enhanced!",
                                      description: "AI has improved your property name.",
                                    });
                                  }).catch((error) => {
                                    console.error("Error generating name:", error);
                                    toast({
                                      title: "Generation Failed",
                                      description: error.message || "Failed to enhance name. Please try again.",
                                      variant: "destructive",
                                    });
                                  }).finally(() => {
                                    setGeneratingInstructions(false);
                                  });
                                }}
                                disabled={generatingInstructions}
                                variant="outline"
                                size="sm"
                                className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-purple-800"
                              >
                                {generatingInstructions ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Enhancing...
                                  </>
                                ) : (
                                  <>
                                    <span className="mr-2">🤖</span>
                                    Enhance with AI
                                  </>
                                )}
                              </Button>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={propertyForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-slate-900">Size (sq ft)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 1500"
                                  className="py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty string or convert to number if valid
                                    field.onChange(value === '' ? 0 : Number(value));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={propertyForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-slate-900">Property Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your space, its unique features, and what makes it perfect for events or shoots..."
                                className="min-h-[120px] py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            
                            {/* AI Enhance Button for Description */}
                            <Button
                              type="button"
                              onClick={() => {
                                if (!field.value?.trim()) {
                                  toast({
                                    title: "Input Required",
                                    description: "Please enter a basic description first.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                setGeneratingDescription(true);
                                apiRequest({
                                  url: "/api/ai/generate-description",
                                  method: "POST",
                                  body: { brief: field.value }
                                }).then((response) => {
                                  field.onChange(response.description);
                                  toast({
                                    title: "Description Enhanced!",
                                    description: "AI has improved your property description.",
                                  });
                                }).catch((error) => {
                                  console.error("Error generating description:", error);
                                  toast({
                                    title: "Generation Failed",
                                    description: error.message || "Failed to enhance description. Please try again.",
                                    variant: "destructive",
                                  });
                                }).finally(() => {
                                  setGeneratingDescription(false);
                                });
                              }}
                              disabled={generatingDescription}
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800"
                            >
                              {generatingDescription ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Enhancing...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">🤖</span>
                                  Enhance with AI
                                </>
                              )}
                            </Button>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Amenities Section */}
                    <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
                      <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Amenities & Features
                      </h4>
                      
                      <FormField
                        control={propertyForm.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-slate-900">Available Amenities</FormLabel>
                            <div className="space-y-6">
                              {/* Standard Amenities Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {visibleAmenities.map((amenity) => (
                                  <div 
                                    key={amenity} 
                                    className={`
                                      flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200
                                      ${field.value.includes(amenity) 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-slate-200 hover:border-blue-300 bg-white'
                                      }
                                    `}
                                  >
                                    <Checkbox
                                      checked={field.value.includes(amenity)}
                                      onCheckedChange={(checked) => {
                                        const updatedAmenities = checked
                                          ? [...field.value, amenity]
                                          : field.value.filter((a) => a !== amenity);
                                        field.onChange(updatedAmenities);
                                      }}
                                    />
                                    <label 
                                      className="text-sm font-medium cursor-pointer flex-1"
                                      onClick={() => {
                                        const isChecked = field.value.includes(amenity);
                                        const updatedAmenities = isChecked
                                          ? field.value.filter((a) => a !== amenity)
                                          : [...field.value, amenity];
                                        field.onChange(updatedAmenities);
                                      }}
                                    >
                                      {amenity}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              {/* Show More/Less Button */}
                              {AMENITIES.length > 20 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                                  className="border-2 border-slate-300 hover:border-blue-400"
                                >
                                  {showAllAmenities ? "Show Less" : `Show More (${AMENITIES.length - 20} more)`}
                                </Button>
                              )}

                              {/* Custom Amenities Section */}
                              <div className="space-y-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-slate-900">Custom Amenities</h5>
                                </div>
                                
                                {/* Add Custom Amenity */}
                                <div className="flex gap-3">
                                  <Input
                                    placeholder="Add a unique feature of your space..."
                                    value={newCustomAmenity}
                                    onChange={(e) => setNewCustomAmenity(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCustomAmenity();
                                      }
                                    }}
                                    className="flex-1 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                  />
                                  <Button
                                    type="button"
                                    onClick={addCustomAmenity}
                                    size="sm"
                                    disabled={!newCustomAmenity.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-xl"
                                  >
                                    Add
                                  </Button>
                                </div>

                                {/* Display Custom Amenities */}
                                {customAmenities.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {customAmenities.map((amenity) => (
                                      <div key={amenity} className="flex items-center space-x-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                        <Checkbox
                                          checked={field.value.includes(amenity)}
                                          onCheckedChange={(checked) => {
                                            const updatedAmenities = checked
                                              ? [...field.value, amenity]
                                              : field.value.filter((a) => a !== amenity);
                                            field.onChange(updatedAmenities);
                                          }}
                                        />
                                        <label className="text-sm flex-1 font-medium">{amenity}</label>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeCustomAmenity(amenity)}
                                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Policies & Rules Section */}
                    <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
                      <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Policies & Rules
                      </h4>
                      
                      <FormField
                        control={propertyForm.control}
                        name="cancellationPolicy"
                        render={({ field }) => {
                          const getPolicyExplanation = (policy: string) => {
                            switch (policy) {
                              case "very_flexible":
                                return (
                                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <h5 className="font-semibold text-green-800 mb-2">Very Flexible Policy Details</h5>
                                    <div className="space-y-2 text-sm text-green-700">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="font-medium">Guest Cancellation Timeline</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Guest Refund</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Host Payout</p>
                                        </div>
                                      </div>
                                      <div className="border-t border-green-200 pt-2">
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation up to 24 hours prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>100%</p>
                                          </div>
                                          <div>
                                            <p>0%</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <p>Cancellation less than 24 hours prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>Non-refundable</p>
                                          </div>
                                          <div>
                                            <p>100%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              case "flexible":
                                return (
                                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <h5 className="font-semibold text-blue-800 mb-2">Flexible Policy Details</h5>
                                    <div className="space-y-2 text-sm text-blue-700">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="font-medium">Guest Cancellation Timeline</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Guest Refund</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Host Payout</p>
                                        </div>
                                      </div>
                                      <div className="border-t border-blue-200 pt-2">
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation up to 7 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>100%</p>
                                          </div>
                                          <div>
                                            <p>0%</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation within 7 calendar days and 24 hours prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>50%, minus processing fee</p>
                                          </div>
                                          <div>
                                            <p>50%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <p>Cancellation less than 24 hours prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>Non-refundable</p>
                                          </div>
                                          <div>
                                            <p>100%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              case "standard_30":
                                return (
                                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <h5 className="font-semibold text-amber-800 mb-2">Standard 30 Day Policy Details</h5>
                                    <div className="space-y-2 text-sm text-amber-700">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="font-medium">Guest Cancellation Timeline</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Guest Refund</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Host Payout</p>
                                        </div>
                                      </div>
                                      <div className="border-t border-amber-200 pt-2">
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation up to 30 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>100%</p>
                                          </div>
                                          <div>
                                            <p>0%</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation within 30 - 7 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>50%, minus processing fee</p>
                                          </div>
                                          <div>
                                            <p>50%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <p>Cancellation less than 7 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>Non-refundable</p>
                                          </div>
                                          <div>
                                            <p>100%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              case "standard_90":
                                return (
                                  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <h5 className="font-semibold text-red-800 mb-2">Standard 90 Day Policy Details</h5>
                                    <div className="space-y-2 text-sm text-red-700">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="font-medium">Guest Cancellation Timeline</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Guest Refund</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">Host Payout</p>
                                        </div>
                                      </div>
                                      <div className="border-t border-red-200 pt-2">
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation up to 90 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>100%</p>
                                          </div>
                                          <div>
                                            <p>0%</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-2">
                                          <div>
                                            <p>Cancellation within 90 - 14 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>50%</p>
                                          </div>
                                          <div>
                                            <p>50%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <p>Cancellation less than 14 calendar days prior to booking start time</p>
                                          </div>
                                          <div>
                                            <p>Non-refundable</p>
                                          </div>
                                          <div>
                                            <p>100%, minus Blocmark service fee</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              default:
                                return null;
                            }
                          };

                          return (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-slate-900">Cancellation Policy</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500">
                                    <SelectValue placeholder="Select cancellation policy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="very_flexible">Very Flexible</SelectItem>
                                  <SelectItem value="flexible">Flexible</SelectItem>
                                  <SelectItem value="standard_30">Standard 30 Day</SelectItem>
                                  <SelectItem value="standard_90">Standard 90 Day</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                              {field.value && getPolicyExplanation(field.value)}
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={propertyForm.control}
                        name="checkInInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-slate-900">
                              Check-in Instructions 
                              <span className="text-sm font-normal text-slate-500 ml-1">
                                (shared with renters only after booking confirmation)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How should guests access your property? Include any special instructions..."
                                className="min-h-[100px] py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            
                            {/* Simple AI Button */}
                            <Button
                              type="button"
                              onClick={() => {
                                if (!field.value?.trim()) {
                                  toast({
                                    title: "Input Required",
                                    description: "Please enter some basic check-in information first.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                setGeneratingInstructions(true);
                                apiRequest({
                                  url: "/api/ai/generate-checkin-instructions",
                                  method: "POST",
                                  body: { brief: field.value }
                                }).then((response) => {
                                  field.onChange(response.instructions);
                                  toast({
                                    title: "Instructions Organized!",
                                    description: "AI has reorganized your check-in instructions.",
                                  });
                                }).catch((error) => {
                                  console.error("Error generating instructions:", error);
                                  toast({
                                    title: "Generation Failed",
                                    description: error.message || "Failed to organize instructions. Please try again.",
                                    variant: "destructive",
                                  });
                                }).finally(() => {
                                  setGeneratingInstructions(false);
                                });
                              }}
                              disabled={generatingInstructions}
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 text-green-700 hover:text-green-800"
                            >
                              {generatingInstructions ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Organizing...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">🤖</span>
                                  Organize with AI
                                </>
                              )}
                            </Button>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={propertyForm.control}
                        name="locationRules"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-slate-900">Location Rules</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What rules should guests follow? e.g., No smoking, No loud music after 10pm, Clean up after use..."
                                className="min-h-[100px] py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                                value={Array.isArray(field.value) ? field.value.join('\n') : (field.value || '')}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                                  field.onChange(lines);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            
                            {/* AI Button for Location Rules */}
                            <Button
                              type="button"
                              onClick={() => {
                                const currentRules = Array.isArray(field.value) ? field.value.join('\n') : (field.value || "");
                                if (!currentRules.trim()) {
                                  toast({
                                    title: "Input Required",
                                    description: "Please enter some basic location rules first.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                setGeneratingInstructions(true);
                                apiRequest({
                                  url: "/api/ai/generate-location-rules",
                                  method: "POST",
                                  body: { brief: currentRules }
                                }).then((response) => {
                                  // Convert AI response to array format
                                  const rulesArray = response.rules.split('\n').filter((rule: string) => rule.trim() !== '');
                                  field.onChange(rulesArray);
                                  toast({
                                    title: "Rules Organized!",
                                    description: "AI has reorganized your location rules.",
                                  });
                                }).catch((error) => {
                                  console.error("Error generating rules:", error);
                                  toast({
                                    title: "Generation Failed",
                                    description: error.message || "Failed to organize rules. Please try again.",
                                    variant: "destructive",
                                  });
                                }).finally(() => {
                                  setGeneratingInstructions(false);
                                });
                              }}
                              disabled={generatingInstructions}
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800"
                            >
                              {generatingInstructions ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Organizing...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">🤖</span>
                                  Organize with AI
                                </>
                              )}
                            </Button>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={propertyForm.control}
                        name="prohibitedItems"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-slate-900">Prohibited Items</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List any items that are not allowed on the property... e.g., No weapons, No pets, No outside food/drinks..."
                                className="min-h-[100px] py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Navigation */}
                    <div className="pt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(4)}
                        className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl font-medium transition-all duration-200"
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Back to Activities
                      </Button>
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Continue button clicked on step 5");
                          onPropertySubmit();
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  </form>
                </Form>
                </div>
              </div>
            )}

            {/* Step 6 removed - was just a placeholder that caused issues */}

            {step === 5 && (
              <SimplifiedPricingSection
                pricingForm={pricingForm}
                propertyTypeForm={propertyTypeForm}
                onPricingSubmit={onPricingSubmit}
                setStep={setStep}
              />
            )}
            {step === 6 && (
              <div className="w-full max-w-4xl mx-auto">
                <Form {...imageForm}>
                  <form onSubmit={imageForm.handleSubmit(onImageSubmit)} className="space-y-8">

                    {/* Upload Section */}
                    <div className="bg-slate-50/50 rounded-2xl p-6 space-y-6">
                      <FormField
                        control={imageForm.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-purple-600" />
                                Property Images
                              </FormLabel>
                              {field.value && field.value.length > 0 && (
                                <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                                  {field.value.length} of 30 uploaded (min: 5)
                                </div>
                              )}
                            </div>
                            
                            <FormControl>
                              <div className="space-y-6">
                                {/* Upload Drop Zone */}
                                <div className="flex items-center justify-center w-full">
                                  <label
                                    htmlFor="images"
                                    className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-purple-300 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 hover:border-purple-400 group"
                                  >
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                      <div className="p-4 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <ImagePlus className="w-12 h-12 text-purple-600" />
                                      </div>
                                      <div className="text-center space-y-2">
                                        <p className="text-lg font-semibold text-slate-700">
                                          Drag & drop your best photos here
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          or click to browse your files
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mt-4">
                                        <div className="flex items-center gap-1">
                                          <Check className="w-3 h-3 text-green-500" />
                                          5-30 photos required
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Check className="w-3 h-3 text-green-500" />
                                          Max 5MB per image
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Check className="w-3 h-3 text-green-500" />
                                          JPG, PNG, GIF
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Check className="w-3 h-3 text-green-500" />
                                          High resolution
                                        </div>
                                      </div>
                                    </div>
                                    <input
                                      id="images"
                                      type="file"
                                      className="hidden"
                                      multiple
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files) {
                                          const files = Array.from(e.target.files);
                                          
                                          // Check file size limit (5MB)
                                          const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
                                          if (oversizedFiles.length > 0) {
                                            toast({
                                              title: "File too large",
                                              description: `${oversizedFiles.length} file(s) exceed the 5MB limit and were not uploaded.`,
                                              variant: "destructive"
                                            });
                                            return;
                                          }
                                          
                                          // Check total count with existing images
                                          const currentImages = field.value || [];
                                          const totalCount = currentImages.length + files.length;
                                          if (totalCount > 30) {
                                            toast({
                                              title: "Too many images",
                                              description: `Maximum 30 images allowed. You can add ${30 - currentImages.length} more image(s).`,
                                              variant: "destructive"
                                            });
                                            return;
                                          }
                                          
                                          field.onChange([...currentImages, ...files]);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>

                                {/* Image Preview Grid */}
                                {field.value && field.value.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-slate-900">Preview</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                      {field.value?.map((file, index) => (
                                        <div key={index} className="relative group aspect-square bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                                          <img
                                            src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              const currentImages = imageForm.getValues().images;
                                              currentImages.splice(index, 1);
                                              imageForm.setValue('images', [...currentImages]);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                          {index === 0 && (
                                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                                              Cover Photo
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Navigation */}
                    <div className="pt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(5)}
                        className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl font-medium transition-all duration-200"
                      >
                        <DollarSign className="mr-2 h-5 w-5" />
                        Back to Pricing
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Next: Availability
                        <Calendar className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 7 && (
              <Form {...availabilityForm}>
                <form onSubmit={availabilityForm.handleSubmit(onAvailabilitySubmit)} className="space-y-6">
                  <FormField
                    control={availabilityForm.control}
                    name="blockedDates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blocked Dates</FormLabel>
                        <FormControl>
                          <AvailabilityCalendar
                            defaultSelected={field.value}
                            onAvailabilityChange={(dates) => field.onChange(dates)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(7)}
                      className="bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-white text-primary border border-primary hover:bg-gray-50"
                    >
                      Next: Review & Submit
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {step === 8 && (
              <Form {...confirmationForm}>
                <form onSubmit={onConfirmationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Review Your Listing</h3>
                    <div className="space-y-2">
                      <p><strong>Title:</strong> {propertyForm.getValues().title}</p>
                      <p><strong>Address:</strong> {addressForm.getValues().fullAddress}</p>
                      <p><strong>Property Type:</strong> {propertyTypeForm.getValues().mainCategory} - {propertyTypeForm.getValues().subCategory}</p>
                      {propertyTypeForm.getValues().mainCategory === "Residential" && propertyTypeForm.getValues().houseStyle && (
                        <p><strong>House Style:</strong> {propertyTypeForm.getValues().houseStyle}</p>
                      )}
                      {(() => {
                        const features = propertyTypeForm.getValues().propertyFeatures;
                        return features && features.length > 0 && (
                          <div>
                            <p><strong>Property Features:</strong></p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {features.map((feature, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      <p><strong>Minimum Booking:</strong> {pricingForm.getValues().minHours} hours</p>
                      <p><strong>Size:</strong> {propertyForm.getValues().size} sq ft</p>
                      <p><strong>Amenities:</strong> {propertyForm.getValues().amenities.join(', ')}</p>
                      <p><strong>Cancellation Policy:</strong> {propertyForm.getValues().cancellationPolicy}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirmed"
                      checked={confirmationForm.watch("confirmed")}
                      onCheckedChange={(checked) => {
                        confirmationForm.setValue("confirmed", checked as boolean);
                      }}
                    />
                    <label
                      htmlFor="confirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that all the information provided is accurate and I agree to the{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            type="button"
                            className="text-primary underline hover:text-primary/80"
                            onClick={() => setShowTermsModal(true)}
                          >
                            Terms and Conditions
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                              Blocmark Host Terms of Agreement
                            </DialogTitle>
                            <DialogDescription>
                              Please read the full terms and conditions below.
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6 text-sm">
                              <div>
                                <h3 className="font-semibold text-base mb-2">BLOCMARK HOST TERMS OF AGREEMENT</h3>
                                <p className="text-muted-foreground">
                                  This Host Terms of Agreement ("Agreement") is entered into between you ("Host") and We Are Yhellow LLC, doing business as Blocmark ("Blocmark," "we," "our," "us"). By listing your location on the Blocmark platform, you agree to the terms outlined below.
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">1. Blocmark's Role</h4>
                                <p className="mb-2">
                                  Blocmark is a digital platform that allows Hosts to list and offer their properties for rent to third parties ("Renters") for photography, video production, events, or other permitted activities.
                                </p>
                                <p>
                                  Blocmark is not a party to any rental or usage agreement between you and the Renter. We only facilitate the booking process and do not control, manage, or supervise any property or interaction between Host and Renter.
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">2. Ownership Requirement</h4>
                                <p className="mb-2">You may only list a property on Blocmark if you are the legal owner of the property.</p>
                                <p className="mb-2">By listing a location, you certify that you have full legal ownership and the authority to rent it out.</p>
                                <p className="mb-2">It is strictly prohibited to list any property as a broker, agent, manager, tenant, or third party unless you can provide legal documentation proving full ownership rights and Blocmark has given prior written consent.</p>
                                <p>Violation of this clause may result in immediate account suspension, removal of listings, and potential legal action.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">3. Host Responsibilities</h4>
                                <p className="mb-2">You are solely responsible for the safety, condition, legality, and compliance of your listed property.</p>
                                <p className="mb-2">You must provide accurate, complete, and truthful information in your listing.</p>
                                <p className="mb-2">You are responsible for obtaining all permits, licenses, and insurance necessary to rent your space.</p>
                                <p className="mb-2">You must follow all applicable laws, including zoning, occupancy limits, and safety regulations.</p>
                                <p>You agree to maintain your property in a clean and usable condition for each confirmed booking.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">4. Booking and Renter Conduct</h4>
                                <p className="mb-2">You may accept or decline booking requests at your discretion.</p>
                                <p className="mb-2">You are responsible for setting and enforcing your own property rules (e.g., hours of use, noise limits, guest maximums).</p>
                                <p>Blocmark does not guarantee the behavior of Renters or their guests.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">5. Liability and Damages</h4>
                                <p className="mb-2">Blocmark is not liable for any damage, theft, personal injury, loss, or illegal activity occurring at your property during a booking.</p>
                                <p className="mb-2">You agree to release and hold Blocmark harmless from any claims or disputes arising from use of your property by Renters or third parties.</p>
                                <p className="mb-2">We strongly recommend that you request a security deposit or Certificate of Insurance (COI) from Renters to cover potential damage or liability.</p>
                                <p>It is your responsibility to inspect your property before and after each booking.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">6. Payments and Fees</h4>
                                <p className="mb-2">Blocmark charges a commission on each completed booking (typically 10%).</p>
                                <p className="mb-2">All payments are processed via Stripe. Blocmark is not responsible for delays, holds, or processing errors caused by Stripe or the banking system.</p>
                                <p>Blocmark may withhold or delay Host payouts in the case of suspected fraud, unresolved disputes, or violations of this Agreement.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">7. Cancellations and Disputes</h4>
                                <p className="mb-2">You may define your own cancellation policy, which must be clearly stated in your listing.</p>
                                <p>Blocmark may assist in mediating disputes but does not guarantee resolution, refunds, or enforcement of any agreement between you and a Renter.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">8. Content and Licensing</h4>
                                <p className="mb-2">By submitting photos, videos, or written descriptions to Blocmark, you grant Blocmark a worldwide, royalty-free, non-exclusive license to use, reproduce, and display your content for the purpose of marketing and promoting your listing and the platform.</p>
                                <p>You certify that any content you upload (photos, videos, descriptions) accurately represents the property and that you have the full legal right to use and share this content.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">9. Account Suspension and Removal</h4>
                                <p className="mb-2">Blocmark reserves the right to remove listings or suspend accounts at its sole discretion, including but not limited to:</p>
                                <ul className="list-disc pl-6 mb-2">
                                  <li>Listing a property you do not own</li>
                                  <li>False or misleading information</li>
                                  <li>Unsafe or illegal conditions</li>
                                  <li>Customer complaints</li>
                                  <li>Repeated booking violations</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">10. Indemnification</h4>
                                <p className="mb-2">You agree to indemnify and defend Blocmark, its employees, partners, and affiliates from any claim, loss, liability, damage, or cost (including attorney's fees) related to:</p>
                                <ul className="list-disc pl-6 mb-2">
                                  <li>The use of your property by Renters or guests</li>
                                  <li>Your violation of this Agreement or any law</li>
                                  <li>Any injury or incident occurring at your property</li>
                                  <li>Misrepresentation of ownership or authorization to list the property</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">11. Modifications</h4>
                                <p>Blocmark may modify these terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated Agreement.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">12. Governing Law</h4>
                                <p>This Agreement shall be governed by the laws of the State of California. Any disputes will be resolved in the courts of Los Angeles County, California.</p>
                              </div>

                              <div className="border-t pt-4 mt-6">
                                <p className="text-muted-foreground">
                                  By listing your property on Blocmark, you acknowledge that you have read, understood, and agreed to these terms.
                                </p>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(7)}
                      className="bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!confirmationForm.watch("confirmed")}
                      className="bg-white text-primary border border-primary hover:bg-gray-50"
                    >
                      List Property
                    </Button>
                  </div>
                </form>
              </Form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  );
}