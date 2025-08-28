import { useEffect, useRef, useState } from "react";
import { Location } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface MapViewProps {
  locations: Location[];
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export function MapView({ 
  locations,
  className = "", 
  center = { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  zoom = 11 
}: MapViewProps) {
  console.log('MapView component rendered with center:', center, 'zoom:', zoom);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setError('Google Maps API key is missing');
        setIsLoading(false);
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoading(false);
      };

      script.onerror = () => {
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup not needed without callback
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || isLoading) return;

    try {
      if (!mapInstanceRef.current) {
        const mapOptions: google.maps.MapOptions = {
          center: new google.maps.LatLng(center.lat, center.lng),
          zoom: zoom,
          minZoom: 3,  // Allow global zoom
          maxZoom: 18,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          gestureHandling: 'auto'  // Allow normal map interaction
        };

        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
      } else {
        // Update existing map center if center prop changes
        console.log('MapView: Updating map center to:', center);
        mapInstanceRef.current.setCenter(new google.maps.LatLng(center.lat, center.lng));
        mapInstanceRef.current.setZoom(zoom);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoading, center, zoom]);

  // Handle locations and markers
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!locations.length) return;

    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
    let processedLocations = 0;

    locations.forEach(location => {
      if (!location.address) {
        processedLocations++;
        return;
      }

      geocoder.geocode({ address: location.address }, (results, status) => {
        processedLocations++;

        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const position = results[0].geometry.location;

          // Smaller offset for better accuracy
          const offset = {
            lat: (Math.random() - 0.5) * 0.004, // ~200 meters
            lng: (Math.random() - 0.5) * 0.004
          };

          const approximatePosition = new google.maps.LatLng(
            position.lat() + offset.lat,
            position.lng() + offset.lng
          );

          bounds.extend(approximatePosition);

          const marker = new google.maps.Marker({
            position: approximatePosition,
            map: mapInstanceRef.current,
            title: location.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#FF0000",
              fillOpacity: 0.7,
              strokeWeight: 2,
              strokeColor: "#FFFFFF"
            }
          });

          markersRef.current.push(marker);

          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>${location.title}</strong></div>`
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        }

        // Adjust bounds only when all locations are processed and we have markers
        if (processedLocations === locations.length && markersRef.current.length > 0) {
          mapInstanceRef.current?.fitBounds(bounds);
          const currentZoom = mapInstanceRef.current?.getZoom() || 0;
          if (currentZoom > 15) {
            mapInstanceRef.current?.setZoom(15);
          }
        }
      });
    });
  }, [locations, isLoading]);

  if (error) {
    return (
      <div className={`h-full w-full rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`h-full w-full rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <div ref={mapRef} className={`h-full w-full rounded-lg ${className}`} />;
}