import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  address: string;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export function LocationMap({ address, className = "" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;

    const loadGoogleMaps = () => {
      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google) {
          setIsLoading(false);
        }
        return;
      }

      // Create and append script
      scriptElement = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setError('Google Maps API key is missing');
        setIsLoading(false);
        return;
      }

      scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      scriptElement.async = true;
      scriptElement.defer = true;

      // Add error handling
      scriptElement.onerror = () => {
        console.error('Failed to load Google Maps script');
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };

      window.initMap = () => {
        console.log('Google Maps initialized');
        setIsLoading(false);
      };

      document.head.appendChild(scriptElement);
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      if (scriptElement && document.head.contains(scriptElement)) {
        document.head.removeChild(scriptElement);
      }
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google || isLoading) return;

    try {
      const geocoder = new window.google.maps.Geocoder();

      console.log('Geocoding address:', address);

      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
          console.log('Geocoding successful:', results[0]);
          const location = results[0].geometry.location;

          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
              center: location,
              zoom: 14,
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
            });
          } else {
            mapInstanceRef.current.setCenter(location);
          }

          // Create a circle instead of a marker to show approximate area
          new window.google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.15,
            map: mapInstanceRef.current,
            center: location,
            radius: 500 // 500 meters radius
          });
        } else {
          console.error('Geocoding failed:', status);
          let errorMessage = 'Failed to locate address';

          switch (status) {
            case window.google.maps.GeocoderStatus.ERROR:
              errorMessage = 'There was a problem contacting the Google servers';
              break;
            case window.google.maps.GeocoderStatus.INVALID_REQUEST:
              errorMessage = 'Invalid address format';
              break;
            case window.google.maps.GeocoderStatus.ZERO_RESULTS:
              errorMessage = 'No results found for this address';
              break;
            case window.google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
              errorMessage = 'Too many requests, please try again later';
              break;
            case window.google.maps.GeocoderStatus.REQUEST_DENIED:
              errorMessage = 'Location services are not enabled for this application';
              break;
          }

          setError(errorMessage);
        }
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [address, isLoading]);

  if (error) {
    return (
      <div className={`h-[300px] w-full rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`h-[300px] w-full rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <div ref={mapRef} className={`h-[300px] w-full rounded-lg ${className}`} />;
}