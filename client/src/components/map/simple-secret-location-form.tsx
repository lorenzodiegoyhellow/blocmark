import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Camera, 
  Upload, 
  CheckCircle,
  Trash,
  Trash2,
  History,
  Inbox
} from "lucide-react";
import { AddressAutocompleteSimple } from "@/components/address/address-autocomplete-simple";
import { useToast } from "@/hooks/use-toast";

// Define the categories (same as in secret-submit.tsx)
const CATEGORIES = [
  { id: "abandoned", name: "Abandoned" },
  { id: "urban", name: "Urban" },
  { id: "natural", name: "Natural" },
  { id: "beach", name: "Beach" },
  { id: "forest", name: "Forest" },
  { id: "desert", name: "Desert" },
  { id: "street-art", name: "Street Art" },
  { id: "sunset", name: "Sunset" },
  { id: "historic", name: "Historic" }
];

type SimpleSecretLocationFormProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  standalone?: boolean;
};

export function SimpleSecretLocationForm({ isOpen = true, onClose, onCancel, onSuccess, standalone = false }: SimpleSecretLocationFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("natural");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [bestTimeOfDay, setBestTimeOfDay] = useState("");
  const [recommendedEquipment, setRecommendedEquipment] = useState("");
  const [compositionTip, setCompositionTip] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handler for address input with coordinates
  const handleAddressChange = (value: string, coords?: { lat: number; lng: number }) => {
    setAddress(value);
    if (coords) {
      setCoordinates(coords);
    }
  };

  // Main image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({...prev, image: "Image must be less than 5MB"}));
        return;
      }
      
      // Clear any previous errors
      setErrors(prev => ({...prev, image: ""}));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Additional images upload handler
  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: string[] = [];
      let oversizedFiles = false;
      const maxFiles = 5 - additionalImages.length; // Allow up to 5 additional images
      
      // Process only the number of files we can accept
      const filesToProcess = Math.min(e.target.files.length, maxFiles);
      
      Array.from(e.target.files).slice(0, filesToProcess).forEach(file => {
        // Check file size (5MB max each)
        if (file.size > 5 * 1024 * 1024) {
          oversizedFiles = true;
          return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          
          // Update state when all files are processed
          if (newImages.length === filesToProcess) {
            setAdditionalImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      if (oversizedFiles) {
        setErrors(prev => ({...prev, additionalImages: "Some images were skipped: must be less than 5MB each"}));
      } else {
        setErrors(prev => ({...prev, additionalImages: ""}));
      }
    }
  };
  
  // Remove an additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Reset the form
  const resetForm = () => {
    setName("");
    setCategory("natural");
    setAddress("");
    setDescription("");
    setBestTimeOfDay("");
    setRecommendedEquipment("");
    setCompositionTip("");
    setCoordinates({ lat: 34.0522, lng: -118.2437 });
    setImagePreview(null);
    setAdditionalImages([]);
    setErrors({});
    setIsSubmitting(false);
    setSubmitted(false);
  };
  
  // These functions are no longer needed since we're using the database now
  // We'll leave them as stubs and display messages about the database implementation
  
  // Function to communicate the move to database storage 
  const clearLocalStorage = (keepPending: boolean = true) => {
    toast({
      title: "Using Database Storage",
      description: "Your locations are now stored in our database. No need to manage storage limits anymore!",
    });
  };
  
  // Function to communicate the move to database storage
  const clearOldLocations = () => {
    toast({
      title: "Using Database Storage",
      description: "Your locations are now stored in our secure database system with unlimited storage capacity.",
    });
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // If closing the dialog
      setTimeout(() => {
        // Reset form after animation completes
        resetForm();
      }, 300);
      if (onClose) onClose();
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "Location name is required";
    if (!category) newErrors.category = "Category is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!description.trim()) newErrors.description = "Description is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission using API instead of localStorage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // FIXED: Create the location data with properly formatted coordinates
      // Make sure coordinates are really numbers and stored as strings correctly
      // For Leaflet compatibility, we need to send [lat, lng] in the correct order
      const validLat = parseFloat(coordinates.lat.toString());
      const validLng = parseFloat(coordinates.lng.toString());
      
      // Debug the coordinates being submitted
      console.log("Original coordinates:", coordinates);
      console.log("Parsed coordinates - lat:", validLat, "lng:", validLng);
      
      const locationData = {
        name: name.trim(),
        description: description.trim(),
        location: address.trim(),
        category: category,
        // Ensure coordinates are in the correct format for the API
        latitude: validLat.toString(),
        longitude: validLng.toString(),
        // Store coordinates array in correct [latitude, longitude] order for Leaflet
        coords: [validLat, validLng],
        mainImage: imagePreview || "https://images.unsplash.com/photo-1538291323976-37dcaafccb12", // Default image
        additionalImages: additionalImages,
        bestTimeOfDay: bestTimeOfDay.trim() || undefined,
        recommendedEquipment: recommendedEquipment.trim() || undefined,
        compositionTip: compositionTip.trim() || undefined,
      };
      
      console.log("Submitting location data:", locationData);
      
      // Send the data to the API endpoint
      const response = await fetch('/api/secret-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        // Handle error response from the API
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }
      
      // Successfully submitted to the database
      const result = await response.json();
      console.log("Location created successfully:", result);
      
      // Show success message
      toast({
        title: "Location submitted successfully!",
        description: "Your secret location has been submitted for review and will appear after approval.",
      });
      
      // Mark as submitted
      setSubmitted(true);
      
      // Trigger success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting location:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a secret location.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error submitting location",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    setIsSubmitting(false);
  };

  // Create the form content
  const formContent = (
    <form onSubmit={handleSubmit} className="py-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location-name">Name</Label>
        <Input 
          id="location-name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Cool photo spot, Abandoned factory, etc."
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location-category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="location-category" className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location-address">Address</Label>
        <AddressAutocompleteSimple
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter an address or location"
          className={errors.address ? "border-red-500" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Coordinates will be automatically generated from the address
        </p>
        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location-description">Description</Label>
        <Textarea 
          id="location-description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what makes this location special..."
          rows={3}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location-image">Main Image (Required)</Label>
        <div 
          className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${errors.image ? "border-red-500" : ""}`}
          onClick={() => document.getElementById("location-image")?.click()}
        >
          {imagePreview ? (
            <div className="relative w-full h-40 overflow-hidden rounded mb-2">
              <img 
                src={imagePreview} 
                alt="Location preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
          )}
          <input
            id="location-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          <p className="text-sm cursor-pointer font-medium hover:text-primary">
            {imagePreview ? "Change image" : "Click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG or WEBP. Max 5MB.
          </p>
          {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="additional-images">Additional Images (Optional, up to 5)</Label>
        {/* Additional images preview grid */}
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {additionalImages.map((img, index) => (
              <div key={index} className="relative w-full aspect-square overflow-hidden rounded">
                <img 
                  src={img} 
                  alt={`Additional image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black/90"
                >
                  <span className="sr-only">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {additionalImages.length < 5 && (
          <div 
            className="border-2 border-dashed rounded-md p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById("additional-images")?.click()}
          >
            <Camera className="h-6 w-6 text-muted-foreground mb-1" />
            <input
              id="additional-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleAdditionalImagesUpload}
            />
            <p className="text-sm cursor-pointer font-medium hover:text-primary">
              Add more images
            </p>
            <p className="text-xs text-muted-foreground">
              {5 - additionalImages.length} more allowed
            </p>
          </div>
        )}
        {errors.additionalImages && (
          <p className="text-xs text-red-500 mt-1">{errors.additionalImages}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bestTimeOfDay">Best Time of Day (Optional)</Label>
        <Input 
          id="bestTimeOfDay" 
          value={bestTimeOfDay}
          onChange={(e) => setBestTimeOfDay(e.target.value)}
          placeholder="Morning, sunset, blue hour, etc."
        />
        <p className="text-xs text-muted-foreground">
          When is the lighting optimal for photography at this location?
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="recommendedEquipment">Recommended Equipment (Optional)</Label>
        <Input 
          id="recommendedEquipment" 
          value={recommendedEquipment}
          onChange={(e) => setRecommendedEquipment(e.target.value)}
          placeholder="Wide angle lens, tripod, etc."
        />
        <p className="text-xs text-muted-foreground">
          What equipment would you recommend bringing to this spot?
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="compositionTip">Composition Tip (Optional)</Label>
        <Textarea 
          id="compositionTip" 
          value={compositionTip}
          onChange={(e) => setCompositionTip(e.target.value)}
          placeholder="Frame with foreground elements, use leading lines, etc."
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Any tips for composing shots at this location?
        </p>
      </div>
      
      <div className="flex flex-col space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Storage Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuLabel>Clear Storage Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => clearOldLocations()}>
                  <History className="h-4 w-4 mr-2" />
                  Keep Only Recent (5)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => clearLocalStorage(true)}>
                  <Inbox className="h-4 w-4 mr-2" />
                  Keep Only Pending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => clearLocalStorage(false)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Locations
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              if (onCancel) onCancel();
              if (onClose) onClose();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );

  // Success message content
  const successContent = (
    <div className="py-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Submission Received!</h2>
      <p className="text-muted-foreground mb-6">
        Your secret location has been submitted for review and will appear 
        on the map once approved.
      </p>
      <div className="flex flex-col space-y-3">
        <div className="flex justify-center space-x-4">
          <Button onClick={() => {
            resetForm();
            if (onClose) onClose();
          }}>
            Close
          </Button>
          <Button variant="outline" onClick={() => {
            resetForm();
            setSubmitted(false);
          }}>
            Submit Another
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground mx-auto"
            >
              <Trash className="h-3 w-3 mr-1" />
              Storage Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuLabel>Clear Storage Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clearOldLocations()}>
              <History className="h-4 w-4 mr-2" />
              Keep Only Recent (5)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => clearLocalStorage(true)}>
              <Inbox className="h-4 w-4 mr-2" />
              Keep Only Pending
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clearLocalStorage(false)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Locations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // If standalone mode, render without dialog wrapper
  if (standalone) {
    return (
      <div className="space-y-6">
        {!submitted && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Add New Location</h2>
            <p className="text-muted-foreground">
              Submit a new secret corner for photography, videography, or exploration.
              All submissions require approval before appearing on the map.
            </p>
          </div>
        )}
        
        {submitted ? successContent : formContent}
      </div>
    );
  }
  
  // Otherwise, render with Dialog wrapper
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Submission Received!</DialogTitle>
            <DialogDescription className="mb-6">
              Your secret location has been submitted for review and will appear 
              on the map once approved.
            </DialogDescription>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-center space-x-4">
                <Button onClick={() => {
                  resetForm();
                  if (onClose) onClose();
                }}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setSubmitted(false);
                }}>
                  Submit Another
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground mx-auto"
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Storage Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuLabel>Clear Storage Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => clearOldLocations()}>
                    <History className="h-4 w-4 mr-2" />
                    Keep Only Recent (5)
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => clearLocalStorage(true)}>
                    <Inbox className="h-4 w-4 mr-2" />
                    Keep Only Pending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => clearLocalStorage(false)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Locations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Submit a new secret corner for photography, videography, or exploration.
                All submissions require approval before appearing on the map.
              </DialogDescription>
            </DialogHeader>
            
            {formContent}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}