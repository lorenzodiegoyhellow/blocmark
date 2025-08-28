import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera } from "lucide-react";
import { AddressAutocompleteSimple } from "@/components/address/address-autocomplete-simple";

// Simple categories for the select dropdown
const CATEGORIES = [
  { id: "abandoned", name: "Abandoned" },
  { id: "urban", name: "Urban" },
  { id: "natural", name: "Natural" },
  { id: "street-art", name: "Street Art" },
  { id: "sunset", name: "Sunset" },
  { id: "historic", name: "Historic" }
];

export default function SecretSubmissionTest() {
  // Form state
  // Form state with explicit type for imageDataUrl
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    coordinates: { lat: 0, lng: 0 },
    description: "",
    image: null as File | null,
    imageDataUrl: "" // Added for base64 image storage
  });

  // Form input handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  const handleAddressChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setFormData({
      ...formData,
      address: value,
      coordinates: coordinates || { lat: 0, lng: 0 }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    }
  };

  // Simple direct form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.category || !formData.address || !formData.description) {
      alert("Please fill all required fields");
      return;
    }
    
    console.log("Form submitted with data:", formData);
    
    // Save to localStorage in a simple format
    try {
      // Process image if available
      const saveData = () => {
        // Create a location object without the File object (can't be serialized)
        const locationData = {
          id: Date.now(),
          name: formData.name,
          category: CATEGORIES.find(c => c.id === formData.category)?.name || formData.category,
          location: formData.address,
          description: formData.description,
          coords: [formData.coordinates.lat, formData.coordinates.lng],
          status: "pending",
          createdAt: new Date().toISOString(),
          image: formData.imageDataUrl || "", // Use base64 string or empty
          comments: 0,
          userId: 1,
          userName: "Test User"
        };

        // Retrieve existing data or initialize
        const existingData = localStorage.getItem('secretLocations');
        const locations = existingData ? JSON.parse(existingData) : [];
        
        // Add new location
        locations.push(locationData);
        
        // Save back to localStorage
        localStorage.setItem('secretLocations', JSON.stringify(locations));
        
        console.log("Saved location to localStorage:", locationData);
        alert("Location submitted successfully! Check localStorage.");
        
        // Reset form
        setFormData({
          name: "",
          category: "",
          address: "",
          coordinates: { lat: 0, lng: 0 },
          description: "",
          image: null,
          imageDataUrl: ""
        });
      };
      
      // Process image if available
      if (formData.image) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            imageDataUrl: reader.result as string
          }));
          // Now that we have the image data URL, save the location
          saveData();
        };
        reader.onerror = () => {
          console.error("Error reading image file");
          // Still save without image
          saveData();
        };
        reader.readAsDataURL(formData.image);
      } else {
        // No image to process, just save
        saveData();
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Failed to save location: " + error);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Secret Submission Test</h1>
        <p className="text-muted-foreground mb-6">Simple form to test local storage submission only</p>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Submit a Secret Location</CardTitle>
            <CardDescription>
              Add a new photography or filming location to the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Abandoned Factory, Scenic Viewpoint, etc."
                  value={formData.name}
                  onChange={handleTextChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <AddressAutocompleteSimple
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="Enter a location address"
                />
                <p className="text-xs text-muted-foreground">
                  Coordinates will be automatically generated
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what makes this location special, tips for visitors, etc."
                  rows={4}
                  value={formData.description}
                  onChange={handleTextChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors">
                  {formData.image ? (
                    <div className="relative h-40 overflow-hidden rounded">
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Location preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <label htmlFor="image" className="text-sm font-medium cursor-pointer">
                        Click to upload an image
                      </label>
                    </>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or WEBP. Max 5MB.
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Submit Location
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Saved Locations</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const locations = JSON.parse(localStorage.getItem('secretLocations') || '[]');
              console.log("Current saved locations:", locations);
              alert(`You have ${locations.length} saved locations. Check console for details.`);
            }}
          >
            Check localStorage
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}