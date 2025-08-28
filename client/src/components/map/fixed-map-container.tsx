import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { MarkerWithCoordinateFallback } from './marker-with-coordinate-fallback';
import 'leaflet/dist/leaflet.css';

// Create custom icon for markers
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

// Fix Leaflet icons at runtime - this is crucial for Leaflet to display correctly
function FixLeafletIcons() {
  useEffect(() => {
    // Leaflet uses relative paths for its images which don't work well with our setup
    // This function fixes the icon URLs at runtime
    try {
      delete (Icon.Default.prototype as any)._getIconUrl;
      Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    } catch (error) {
      console.error("Error setting up Leaflet icons:", error);
    }
    
    // Ensure that Leaflet CSS is loaded
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    linkEl.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    linkEl.crossOrigin = '';
    
    // Add the link only if it doesn't exist already
    if (!document.querySelector('link[href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"]')) {
      document.head.appendChild(linkEl);
    }
    
    // No need to remove the link on cleanup as it should persist for the page
  }, []);
  
  return null;
}

interface Location {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: [number, number];
  image: string;
  status?: string;
  [key: string]: any;
}

interface LocationPopupProps {
  location: Location;
  onViewDetails?: (location: Location) => void;
}

// Enhanced location popup component with View Details button
const LocationPopup = ({ location, onViewDetails }: LocationPopupProps) => {
  return (
    <div className="p-2 max-w-[250px]">
      <div className="mb-2 aspect-video overflow-hidden rounded-t-md">
        <img 
          src={location.image} 
          alt={location.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-semibold mb-1">{location.name}</h3>
      <p className="text-xs text-muted-foreground mb-1">{location.location}</p>
      <p className="text-xs line-clamp-3 mb-2">{location.description}</p>
      
      <button 
        className="w-full bg-primary text-white rounded-md py-1.5 px-3 text-xs font-medium hover:bg-primary/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails?.(location);
        }}
      >
        View Details
      </button>
    </div>
  );
};

interface FixedMapContainerProps {
  locations: Location[];
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  onViewDetails?: (location: Location) => void;
}

export function FixedMapContainer({ 
  locations, 
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  className = '',
  onViewDetails
}: FixedMapContainerProps) {
  // Add a key to force re-mounting of the component when locations change
  const mapKey = `map-${locations.length}-${Date.now()}`;
  
  // Add a minimal state to trigger re-renders if needed
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Set initialized after component mounts to ensure client-side rendering
    setIsInitialized(true);
  }, []);
  
  // Handler for when "View Details" is clicked in a popup
  const handleViewDetails = (location: Location) => {
    if (onViewDetails) {
      onViewDetails(location);
    } else {
      console.log("View details clicked for location:", location.name);
    }
  };
  
  return (
    <div className={`h-full w-full ${className}`}>
      <FixLeafletIcons />
      
      {isInitialized && (
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          key={mapKey}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locations.map((location) => (
            location && location.coords && (
              <MarkerWithCoordinateFallback 
                key={location.id}
                position={location.coords} 
                icon={customIcon}
              >
                <Popup>
                  <LocationPopup 
                    location={location} 
                    onViewDetails={handleViewDetails}
                  />
                </Popup>
              </MarkerWithCoordinateFallback>
            )
          ))}
        </MapContainer>
      )}
      
      {/* Fallback content if no locations */}
      {(!isInitialized || locations.length === 0) && (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-8">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin mb-4"></div>
            <p className="text-lg font-medium">{locations.length === 0 ? 'No locations found' : 'Loading map...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}