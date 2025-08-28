import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarIcon, Camera, MapPin, Loader2, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

// Import the AppLayout component properly
import { AppLayout } from "../components/layout/app-layout";

// Simple loading spinner component
const LoadingSpinner = ({ size = "default", text = "Loading..." }: { size?: "default" | "sm" | "lg", text?: string }) => (
  <div className="flex flex-col items-center justify-center">
    <Loader2 className={`animate-spin ${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"}`} />
    {text && <p className="mt-2 text-muted-foreground">{text}</p>}
  </div>
);

type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  latitude: string;
  longitude: string;
  mainImage: string;
  additionalImages: string[];
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
};

export default function SecretLocationDetails() {
  const { id } = useParams();
  const locationId = parseInt(id || '0');

  // Fetch secret location details
  const { data: location, isLoading, error } = useQuery<SecretLocation>({
    queryKey: ['/api/secret-locations', locationId],
    enabled: !!locationId
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading location details..." />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !location) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Location not found</h2>
            <p className="text-muted-foreground mb-6">
              The secret location you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild>
              <Link href="/secret-corners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Secret Corners
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          asChild
        >
          <Link href="/secret-corners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Secret Corners
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main content */}
          <div>
            {/* Image gallery */}
            <div className="mb-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                <img
                  src={location.mainImage || (location.additionalImages && location.additionalImages.length > 0 ? location.additionalImages[0] : '')}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {location.additionalImages && location.additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {location.additionalImages.map((img, i) => (
                    <div key={i} className="aspect-video rounded-md overflow-hidden bg-muted">
                      <img 
                        src={img} 
                        alt={`${location.name} - ${i+1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Main details */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h1 className="text-3xl font-bold">{location.name}</h1>
                <Badge>{location.category}</Badge>
              </div>
              
              <p className="text-muted-foreground flex items-center mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                {location.location}
              </p>
              
              {location.userName && (
                <p className="text-sm flex items-center mb-4">
                  <User className="h-4 w-4 mr-2" />
                  Submitted by{" "}
                  <a 
                    href={`/users/${location.userId}`} 
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    {location.userName}
                  </a>
                </p>
              )}
              
              <Separator className="my-6" />
              
              <h2 className="text-xl font-semibold mb-3">About this location</h2>
              <p className="mb-6 leading-relaxed whitespace-pre-line">
                {location.description}
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Photography Tips</h3>
              
              {location.bestTimeOfDay && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Best Time of Day
                  </h4>
                  <p className="text-muted-foreground text-sm">{location.bestTimeOfDay}</p>
                </div>
              )}
              
              {location.recommendedEquipment && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1 flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Recommended Equipment
                  </h4>
                  <p className="text-muted-foreground text-sm">{location.recommendedEquipment}</p>
                </div>
              )}
              
              {location.compositionTip && (
                <div>
                  <h4 className="font-medium mb-1">Composition Tips</h4>
                  <p className="text-muted-foreground text-sm">{location.compositionTip}</p>
                </div>
              )}
              
              {!location.bestTimeOfDay && !location.recommendedEquipment && !location.compositionTip && (
                <p className="text-muted-foreground text-sm">No photography tips available for this location.</p>
              )}
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Map</h3>
              <div className="aspect-square rounded-md bg-muted overflow-hidden">
                {/* Process coordinates properly before using them in the map */}
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={(() => {
                    // Parse coordinates and validate them
                    const lat = parseFloat(location.latitude || "0");
                    const lng = parseFloat(location.longitude || "0");
                    
                    // Apply corrections if needed - Google Maps expects [latitude, longitude]
                    // Make sure we have valid earth coordinates
                    const validLat = Math.abs(lat) <= 90 ? lat : lng;
                    const validLng = Math.abs(lng) <= 180 ? lng : lat;
                    
                    console.log("Map coordinates:", validLat, validLng);
                    
                    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBNLrJhOMx6-xG0I3ab7yT09uEhvnw4F5s&q=${validLat},${validLng}&zoom=15`;
                  })()}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4">
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Parse coordinates and validate them the same way as for the iframe
                    const lat = parseFloat(location.latitude || "0");
                    const lng = parseFloat(location.longitude || "0");
                    
                    // Apply corrections if needed
                    const validLat = Math.abs(lat) <= 90 ? lat : lng;
                    const validLng = Math.abs(lng) <= 180 ? lng : lat;
                    
                    // Open Google Maps in a new tab
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${validLat},${validLng}`,
                      '_blank'
                    );
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}