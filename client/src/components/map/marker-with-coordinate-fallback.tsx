import { LatLngExpression, Icon as LeafletIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

// Import any necessary types from your project
type SecretLocation = {
  id: number;
  name: string;
  description?: string;
  location?: string; 
  category?: string;
  coords?: [number, number];
  latitude?: string | number;
  longitude?: string | number;
  [key: string]: any; // For other properties
};

// Create icon dynamically to avoid issues with Leaflet's icon paths
const getCustomIcon = () => {
  return new LeafletIcon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41]
  });
};

type MarkerWithCoordinateFallbackProps = {
  position?: [number, number];
  icon?: any;
  children?: React.ReactNode;
  location?: SecretLocation;
};

export const MarkerWithCoordinateFallback: React.FC<MarkerWithCoordinateFallbackProps> = ({ 
  position,
  icon,
  location,
  children
}) => {
  // Create icon instance
  const [markerIcon, setMarkerIcon] = useState<any>(null);
  
  // Initialize the icon when component mounts
  useEffect(() => {
    setMarkerIcon(icon || getCustomIcon());
  }, [icon]);
  
  // Handle different coordinate formats that might be returned from the API
  let markerPosition: LatLngExpression = [0, 0]; // Default fallback
  
  try {
    // If direct position is provided, use it
    if (position && Array.isArray(position) && position.length === 2) {
      const [lat, lng] = position;
      if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
        markerPosition = [Number(lat), Number(lng)];
      }
    }
    // Otherwise try to parse from location object if provided
    else if (location) {
      if (location.coords && Array.isArray(location.coords) && location.coords.length === 2) {
        // Use coords field directly (preferred format)
        const [lat, lng] = location.coords;
        if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
          markerPosition = [Number(lat), Number(lng)];
        }
      } else if (location.latitude !== undefined && location.longitude !== undefined) {
        // Fall back to lat/lng parsing if coords not available
        const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
        const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
        
        if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
          // Make sure coordinates are in valid ranges (swap if needed)
          const isLatValid = Math.abs(Number(lat)) <= 90;
          const isLngValid = Math.abs(Number(lng)) <= 180;
          
          if (isLatValid && isLngValid) {
            markerPosition = [Number(lat), Number(lng)];
          } else if (!isLatValid && isLngValid && Math.abs(Number(lng)) <= 90) {
            // Swap coordinates if they appear to be in the wrong order
            markerPosition = [Number(lng), Number(lat)];
          }
        }
      }
    }
    
    // Validation for marker position - ensure valid coordinates
    if (Array.isArray(markerPosition) &&
      (isNaN(Number(markerPosition[0])) || 
       isNaN(Number(markerPosition[1])) ||
       Math.abs(Number(markerPosition[0])) > 90 ||
       Math.abs(Number(markerPosition[1])) > 180)) {
      console.warn('Invalid coordinates detected, using default position', markerPosition);
      markerPosition = [0, 0];
    }
  } catch (error) {
    console.error(`Error parsing coordinates:`, error);
    markerPosition = [0, 0];
  }
  
  // Make sure we have valid coordinates before rendering
  if (!markerIcon) return null;
  
  // Additional validation to prevent rendering markers with invalid positions
  // This helps prevent the map from crashing when invalid coordinates are provided
  const [lat, lng] = Array.isArray(markerPosition) ? markerPosition : [0, 0];
  if (isNaN(Number(lat)) || isNaN(Number(lng))) {
    console.warn('Invalid marker position detected:', markerPosition);
    return null;
  }
  
  try {
    return (
      <Marker 
        position={markerPosition}
        icon={markerIcon}
      >
        {children}
      </Marker>
    );
  } catch (error) {
    console.error('Error rendering marker:', error);
    return null;
  }
};