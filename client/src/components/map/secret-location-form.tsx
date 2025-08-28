import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/address/address-autocomplete";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Camera, Upload } from "lucide-react";

interface SecretLocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SecretLocationForm({ isOpen, onClose, onSuccess }: SecretLocationFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nature");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Coordinates could come from address validation or manual input
  const handleAddressValidated = (validatedAddress: { 
    isValid: boolean;
    formattedAddress: string;
    // We'd need a real geocoding service to get these in production
    coords?: [number, number];
  }) => {
    if (validatedAddress.isValid) {
      setLocation(validatedAddress.formattedAddress);
      // In a real app, we'd get coordinates from geocoding
      // For now, use random coordinates for demo purposes
      if (!coords) {
        // Generate random coordinates within reasonable bounds
        const lat = 35 + Math.random() * 10; // Roughly US latitudes
        const lng = -120 + Math.random() * 40; // Roughly US longitudes
        setCoords([lat, lng]);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Location name is required";
    if (!description.trim()) errors.description = "Description is required";
    if (!location.trim()) errors.location = "Address is required";
    if (images.length === 0) errors.images = "At least one image is required";
    if (!coords) errors.coords = "Valid coordinates are required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // This would be a real API call in production
  const submitLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      // For demo purposes, just simulate an API call
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("Submitting location data:", locationData);
          resolve({ success: true, id: Math.floor(Math.random() * 1000) });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Location submitted",
        description: "Your secret corner has been submitted for review and will appear on the map once approved.",
      });
      
      // Reset form
      setName("");
      setDescription("");
      setCategory("Nature");
      setLocation("");
      setCoords(null);
      setImages([]);
      
      // Close dialog
      onClose();
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your location. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!validateForm()) return;

    submitLocationMutation.mutate({
      name,
      description,
      category,
      location,
      coords,
      images,
      status: "pending" // All new submissions start as pending
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Secret Corner</DialogTitle>
          <DialogDescription>
            Share your favorite hidden photography location with the community.
            Submitted locations will be reviewed before being added to the map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Give your secret corner a memorable name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={validationErrors.name ? "border-red-500" : ""}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Forest">Forest</SelectItem>
                <SelectItem value="Urban">Urban</SelectItem>
                <SelectItem value="Desert">Desert</SelectItem>
                <SelectItem value="Waterfall">Waterfall</SelectItem>
                <SelectItem value="Lake">Lake</SelectItem>
                <SelectItem value="Cave">Cave</SelectItem>
                <SelectItem value="River">River</SelectItem>
                <SelectItem value="Nature">Nature</SelectItem>
                <SelectItem value="Historical">Historical</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Address <span className="text-red-500">*</span></Label>
            <div className="relative">
              <AddressAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Enter the exact address or location name"
                onValidated={handleAddressValidated}
                className={validationErrors.location ? "border-red-500" : ""}
              />
              <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {validationErrors.location && (
              <p className="text-sm text-red-500">{validationErrors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Describe what makes this location special for photography"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`min-h-24 ${validationErrors.description ? "border-red-500" : ""}`}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photos <span className="text-red-500">*</span></Label>
            <ImageUploader onImageSelected={setImages} multiple />
            {validationErrors.images && (
              <p className="text-sm text-red-500">{validationErrors.images}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload photos of this location. The first photo will be used as the cover image.
            </p>
          </div>

          <div className="bg-muted/40 p-3 rounded-md mt-4">
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm font-medium">Photography Guidelines</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Before submitting, please ensure this location is publicly accessible and doesn't require trespassing.
              Respect nature and the privacy of others. Locations that violate these guidelines will not be approved.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={submitLocationMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitLocationMutation.isPending}
            className="gap-2"
          >
            {submitLocationMutation.isPending ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Submit Location
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}