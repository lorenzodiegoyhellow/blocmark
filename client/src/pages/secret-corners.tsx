import { useEffect, useState, useRef } from "react";
import { SecretCornersLayout } from "@/components/map/secret-corners-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Filter, Search, List, Map as MapIcon, X, Upload, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup,
  useMap
} from "react-leaflet";
import { LatLngExpression, Icon, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationDetailDialog } from "@/components/map/location-detail-dialog";
import { SimpleSecretLocationForm } from "@/components/map/simple-secret-location-form";
import { AddressAutocompleteSimple } from "@/components/address/address-autocomplete-simple";

// Define marker icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

// Empty array for featured locations - now coming from database
const FEATURED_LOCATIONS: {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: LatLngExpression;
  comments: number;
  image: string;
  status?: string;
  createdAt?: string;
  userId?: number;
  userName?: string;
}[] = [];

const CATEGORIES = [
  { id: "abandoned", name: "Abandoned" },
  { id: "urban", name: "Urban" },
  { id: "natural", name: "Natural" },
  { id: "street-art", name: "Street Art" },
  { id: "sunset", name: "Sunset" },
  { id: "historic", name: "Historic" }
];

// Function to convert image file to data URL for storage
const convertImageToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

// Component to fix Leaflet icon paths at runtime
const FixLeafletIcons = () => {
  useEffect(() => {
    // Leaflet uses relative paths for its images which don't work well with our setup
    // This function fixes the icon URLs at runtime
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  return null;
};

// Component to show location details in a popup
const LocationPopup = ({ location }: { location: typeof FEATURED_LOCATIONS[0] }) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  return (
    <>
      <div className="w-[250px]">
        <div className="w-full h-32 overflow-hidden rounded-t-md">
          <img 
            src={location.image} 
            alt={location.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium">{location.name}</h3>
            <Badge>{location.category}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{location.location}</p>
          <p className="text-xs line-clamp-2 mb-3">{location.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {location.comments} comments
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailsDialog(true);
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Location detail dialog */}
      <LocationDetailDialog 
        location={location} 
        isOpen={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)} 
      />
    </>
  );
};

export default function SecretCornersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([39.8283, -98.5795]); // Center of the US
  const [mapZoom, setMapZoom] = useState(4);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [detailsLocation, setDetailsLocation] = useState<typeof FEATURED_LOCATIONS[0] | null>(null);
  
  // Form state for adding a new location
  const [newLocation, setNewLocation] = useState({
    name: "",
    category: "",
    address: "",
    coordinates: { lat: 0, lng: 0 }, // Store coordinates as object
    description: "",
    image: null as File | null
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [id.replace('location-', '')]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setNewLocation(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleAddressChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setNewLocation(prev => ({
      ...prev,
      address: value,
      coordinates: coordinates || prev.coordinates
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewLocation(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newLocation.name || !newLocation.category || !newLocation.address || !newLocation.description) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Log form submission attempt for debugging
    console.log("Submitting location form with data:", newLocation);
    
    // Use a simpler approach without relying on async/await
    const processSubmission = () => {
      let imageBase64 = "";
      
      // Function to complete the submission process
      const completeSubmission = () => {
        // Create location object
        const secretLocation = {
          id: Date.now(), // Generate a unique ID
          name: newLocation.name,
          description: newLocation.description,
          location: newLocation.address,
          category: CATEGORIES.find(c => c.id === newLocation.category)?.name || newLocation.category,
          coords: [
            newLocation.coordinates.lat, 
            newLocation.coordinates.lng
          ] as LatLngExpression,
          comments: 0,
          image: imageBase64 || "", // Use the base64 image or empty string
          status: "pending",
          createdAt: new Date().toISOString(),
          userId: 12, // Hardcoded user ID for demo purposes
          userName: "Current User" // Would come from authentication in real app
        };
        
        // Get existing locations from localStorage
        let existingLocations = [];
        try {
          const stored = localStorage.getItem('secretLocations');
          existingLocations = stored ? JSON.parse(stored) : [];
        } catch (e) {
          console.error("Error reading from localStorage:", e);
          existingLocations = [];
        }
        
        // Add new location and save back to localStorage
        existingLocations.push(secretLocation);
        localStorage.setItem('secretLocations', JSON.stringify(existingLocations));
        
        // Log successful submission
        console.log("Location saved to localStorage successfully:", secretLocation);
        
        // Show success message
        alert("Location submitted successfully! It will be reviewed by administrators before appearing on the map.");
        
        // Close modal and reset form
        setShowAddLocationModal(false);
        setNewLocation({
          name: "",
          category: "",
          address: "",
          coordinates: { lat: 0, lng: 0 },
          description: "",
          image: null
        });
      };
      
      // Process image if available
      if (newLocation.image) {
        const reader = new FileReader();
        reader.onload = function() {
          imageBase64 = reader.result as string;
          completeSubmission();
        };
        reader.onerror = function() {
          console.error("Error reading file");
          // Still complete the submission, just without the image
          completeSubmission();
        };
        reader.readAsDataURL(newLocation.image);
      } else {
        // No image, just complete the submission
        completeSubmission();
      }
    };
    
    // Execute the submission process
    try {
      processSubmission();
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("There was an error submitting your location. Please try again.");
    }
  };
  
  // When a category is selected, filter locations and adjust map view
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Get approved locations from localStorage
  const [approvedUserLocations, setApprovedUserLocations] = useState<typeof FEATURED_LOCATIONS>([]);
  
  // Load approved user locations from localStorage
  useEffect(() => {
    const loadApprovedLocations = () => {
      const localStorageData = localStorage.getItem('secretLocations');
      
      if (localStorageData) {
        try {
          const secretLocations = JSON.parse(localStorageData);
          // Filter for approved locations only
          const approvedLocations = secretLocations.filter(
            (loc: any) => loc.status === "approved"
          );
          setApprovedUserLocations(approvedLocations);
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
        }
      }
    };
    
    // Load on mount
    loadApprovedLocations();
    
    // Setup event listener to reload when localStorage changes
    const handleStorageChange = () => {
      loadApprovedLocations();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Polling for changes (since we're updating localStorage in the same window)
    const interval = setInterval(loadApprovedLocations, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Combine featured and approved user locations
  const allLocations = [...FEATURED_LOCATIONS, ...approvedUserLocations];
  
  // Filter locations based on search and category
  const filteredLocations = allLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || location.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SecretCornersLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4">
          {/* Header section with improved layout */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Secret Corners</h1>
              <p className="text-muted-foreground mt-1">
                Discover hidden gems for photography, videography, and exploration
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowAddLocationModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>

          {/* Search and filter section with improved layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search locations, cities, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex-shrink-0 flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Map section with improved layout */}
              <div className={`relative rounded-lg overflow-hidden w-full ${isFullScreen ? 'fixed top-0 left-0 w-screen h-screen z-30' : 'h-[600px] z-0'}`}>
                <FixLeafletIcons />
                
                {/* Map controls */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/90 shadow-md hover:bg-white transition-colors"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/90 shadow-md hover:bg-white transition-colors"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                  >
                    {isFullScreen ? <X className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex h-full">
                  {/* Sidebar location list */}
                  {showSidebar && !isFullScreen && (
                    <div className="w-[320px] bg-white/95 backdrop-blur-sm p-4 overflow-y-auto border-r shadow-lg">
                      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-primary rounded-sm"></div>
                        Featured Locations
                      </h3>
                      
                      {filteredLocations.length === 0 ? (
                        <div className="py-6 text-center">
                          <p className="text-muted-foreground">No locations match your search.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredLocations.map(location => (
                            <div 
                              key={location.id}
                              className={`p-3 rounded-md cursor-pointer transition-all ${
                                selectedLocation === location.id 
                                  ? 'ring-2 ring-primary/70 shadow-md scale-[1.02]' 
                                  : 'hover:shadow-md hover:scale-[1.01] ring-1 ring-gray-100'
                              }`}
                              onClick={() => {
                                setSelectedLocation(location.id);
                                setMapCenter(location.coords);
                                setMapZoom(13);
                              }}
                            >
                              <div className="relative overflow-hidden h-[140px] rounded-md group">
                                {/* Background image with overlay gradient */}
                                <div className="absolute inset-0">
                                  <img 
                                    src={location.image} 
                                    alt={location.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                </div>
                                
                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-between p-3">
                                  <div>
                                    <Badge className="bg-white/90 text-black hover:bg-white/100">{location.category}</Badge>
                                  </div>
                                  
                                  <div className="mt-auto">
                                    <h4 className="font-medium text-base text-white truncate">{location.name}</h4>
                                    <p className="text-xs text-white/80 truncate mb-2">{location.location}</p>
                                    
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="w-full h-7 text-xs bg-white/90 hover:bg-white text-black shadow-sm flex items-center justify-center gap-1 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailsLocation(location);
                                      }}
                                    >
                                      <MapPin className="h-3 w-3" /> View Details
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Map area */}
                  <div className={`${showSidebar && !isFullScreen ? 'flex-1' : 'w-full'}`}>
                    <MapContainer 
                      center={mapCenter} 
                      zoom={mapZoom} 
                      style={{height: '100%', width: '100%'}}
                      zoomControl={false}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {filteredLocations.map(location => (
                        <Marker 
                          key={location.id} 
                          position={location.coords}
                          icon={customIcon}
                        >
                          <Popup>
                            <LocationPopup location={location} />
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              </div>
              
              {/* No additional cards section as per user request */}
            </div>
          </div>
        </div>
      </div>

      {/* Add Location Modal using SimpleSecretLocationForm */}
      <SimpleSecretLocationForm 
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        onCancel={() => setShowAddLocationModal(false)}
        onSuccess={() => {
          setShowAddLocationModal(false);
          // Reload the locations after submission
          const loadLocations = () => {
            const stored = localStorage.getItem('secretLocations');
            if (stored) {
              try {
                const secretLocations = JSON.parse(stored);
                const approvedLocations = secretLocations.filter(
                  (loc: any) => loc.status === "approved"
                );
                setApprovedUserLocations(approvedLocations);
              } catch (error) {
                console.error("Error parsing localStorage data:", error);
              }
            }
          };
          
          // Give a moment for the data to be saved to localStorage
          setTimeout(loadLocations, 500);
        }}
      />

      {/* Location details dialog for sidebar selections */}
      {detailsLocation && (
        <LocationDetailDialog 
          location={detailsLocation} 
          isOpen={detailsLocation !== null} 
          onClose={() => setDetailsLocation(null)}
        />
      )}
    </SecretCornersLayout>
  );
}