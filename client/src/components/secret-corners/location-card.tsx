import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Camera, MessageSquare, Eye } from "lucide-react";

type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: [number, number];
  comments: number;
  images: string[];
  image: string;
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
};

interface LocationCardProps {
  location: SecretLocation;
  onClick?: (location: SecretLocation) => void;
}

export function LocationCard({ location, onClick }: LocationCardProps) {
  console.log("LocationCard rendered with location:", location.id);
  
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Determine which image to display (use first one from images array or fallback to image)
  const displayImage = !imageError
    ? (location.images && location.images.length > 0 ? location.images[0] : location.image)
    : null;
    
  // Format date for display
  const formattedDate = new Date(location.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Status badge style
  const statusVariant = 
    location.status === "approved" ? "default" : 
    location.status === "pending" ? "secondary" : 
    "destructive";
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div 
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => onClick?.(location)}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={location.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        
        {/* Category badge and status */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <Badge className="shadow-sm">
            {location.category}
          </Badge>
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge variant={statusVariant} className="shadow-sm capitalize">
            {location.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 
          className="font-medium text-lg mb-1 cursor-pointer hover:text-primary"
          onClick={() => onClick?.(location)}
        >
          {location.name}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{location.location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateDescription(location.description)}
        </p>
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex justify-between items-center border-t bg-muted/30">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex gap-3">
          {location.comments > 0 && (
            <div className="flex items-center text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              <span>{location.comments}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8"
            onClick={() => {
              console.log("View button clicked for location:", location.id);
              if (onClick) {
                onClick(location);
              } else {
                console.warn("No onClick handler provided for location card");
              }
            }}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span>View</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}