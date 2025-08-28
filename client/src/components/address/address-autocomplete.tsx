import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, MapPin } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onValidated?: (validatedAddress: { 
    isValid: boolean;
    formattedAddress: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => void;
};

type Prediction = google.maps.places.AutocompletePrediction;

export const AddressAutocomplete = forwardRef<HTMLInputElement, Props>(({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  onValidated,
}, ref) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Forward the ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // We'll only use our custom dropdown implementation, not the native Google Maps one
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      // Load Google Maps API if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch predictions when the user types
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places || !value) {
      setPredictions([]);
      return;
    }

    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const service = new google.maps.places.AutocompleteService();
        const results = await new Promise<Prediction[]>((resolve, reject) => {
          service.getPlacePredictions(
            { 
              input: value,
              types: ['address']
              // Removed country restriction to support global addresses
            },
            (predictions, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                resolve([]);
                return;
              }
              resolve(predictions || []);
            }
          );
        });
        
        setPredictions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (value.length > 3) {
        fetchPredictions();
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  // Handle clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePredictionClick = (prediction: Prediction) => {
    onChange(prediction.description);
    setShowDropdown(false);
    setIsValid(true);
    
    // Get detailed place information
    if (window.google && window.google.maps) {
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails(
        { placeId: prediction.place_id, fields: ['formatted_address', 'address_components'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Parse address components
            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zipCode = '';
            
            if (place.address_components) {
              for (const component of place.address_components) {
                const types = component.types;
                
                if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                } else if (types.includes('route')) {
                  route = component.long_name;
                } else if (types.includes('locality')) {
                  city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                } else if (types.includes('postal_code')) {
                  zipCode = component.long_name;
                }
              }
            }
            
            const streetAddress = `${streetNumber} ${route}`.trim();
            
            if (onValidated && place.formatted_address) {
              onValidated({
                isValid: true,
                formattedAddress: place.formatted_address,
                streetAddress,
                city,
                state,
                zipCode
              });
            }
          }
        }
      );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsValid(null);
          }}
          placeholder={placeholder || "Enter an address..."}
          className={cn(className, "pr-10")}
          disabled={disabled}
          autoComplete="off"
          onFocus={() => value.length > 3 && predictions.length > 0 && setShowDropdown(true)}
        />
        {isValid === true && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          </div>
        )}
      </div>
      
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-background rounded-md shadow-lg max-h-72 overflow-y-auto border">
          <ul className="py-1">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                className="px-4 py-2 flex items-start cursor-pointer hover:bg-muted"
                onClick={() => handlePredictionClick(prediction)}
              >
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                  <div className="text-sm text-muted-foreground">{prediction.structured_formatting.secondary_text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

AddressAutocomplete.displayName = "AddressAutocomplete";