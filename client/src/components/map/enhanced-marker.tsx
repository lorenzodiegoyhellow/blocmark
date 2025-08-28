import { Marker, Popup } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import React from "react";

// Define a location type that covers various coordinate formats
type SecretLocation = {
  id: number;
  name: string;
  description?: string;
  location?: string; 
  category?: string;
  coords?: [number, number];
  latitude?: number | string;
  longitude?: number | string;
  [key: string]: any;
};

// Define the marker icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

// Define the properties for our enhanced marker
interface EnhancedMarkerProps {
  location: SecretLocation;
  children?: React.ReactNode;
}

/**
 * Enhanced Marker Component with robust coordinate handling
 * This component safely extracts coordinates from location objects in various formats
 */
export const EnhancedMarker: React.FC<EnhancedMarkerProps> = ({ 
  location,
  children
}) => {
  // Default fallback position (central Paris)
  const defaultPosition: LatLngExpression = [48.8566, 2.3522];
  
  // Extract coordinates with robust error handling
  const extractCoordinates = (): LatLngExpression => {
    try {
      // First try the coords property if it exists and is valid
      if (location.coords && 
          Array.isArray(location.coords) && 
          location.coords.length === 2 &&
          !isNaN(Number(location.coords[0])) && 
          !isNaN(Number(location.coords[1]))) {
        
        return location.coords as LatLngExpression;
      }
      
      // Then try latitude/longitude fields if they exist
      else if (location.latitude !== undefined && location.longitude !== undefined) {
        const lat = typeof location.latitude === 'string' 
          ? parseFloat(location.latitude) 
          : location.latitude;
          
        const lng = typeof location.longitude === 'string' 
          ? parseFloat(location.longitude) 
          : location.longitude;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Make sure coordinates are in valid ranges
          const isLatValid = Math.abs(lat) <= 90;
          const isLngValid = Math.abs(lng) <= 180;
          
          if (isLatValid && isLngValid) {
            return [lat, lng] as LatLngExpression;
          }
          
          // Handle potentially swapped coordinates
          if (!isLatValid && isLngValid && Math.abs(lng) <= 90) {
            console.log(`Swapping possibly reversed coordinates for ${location.name}`);
            return [lng, lat] as LatLngExpression;
          }
        }
      }
      
      // If we still don't have valid coordinates, try location.location
      // as a string that might contain coordinates in some format
      if (location.location && typeof location.location === 'string') {
        // Try to extract coordinates from a string like "48.8566, 2.3522"
        const coordMatch = location.location.match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[3]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng] as LatLngExpression;
          }
        }
      }
      
      console.warn(`Invalid coordinates for location ${location.id || 'unknown'}, using default position`);
      return defaultPosition;
      
    } catch (error) {
      console.error(`Error extracting coordinates for location ${location.id || 'unknown'}:`, error);
      return defaultPosition;
    }
  };
  
  // Get the marker position
  const markerPosition = extractCoordinates();
  
  return (
    <Marker 
      position={markerPosition}
      icon={customIcon}
    >
      {children}
    </Marker>
  );
};