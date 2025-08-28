declare namespace google.maps.places {
  interface AutocompletePrediction {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }

  interface AutocompleteOptions {
    types?: string[];
    fields?: string[];
  }

  interface PlaceResult {
    formatted_address?: string;
  }

  interface Autocomplete {
    addListener(eventName: string, handler: () => void): google.maps.MapsEventListener;
    getPlace(): PlaceResult;
  }
  
  type PlacesServiceStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 
    'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  
  const PlacesServiceStatus: {
    OK: PlacesServiceStatus;
    ZERO_RESULTS: PlacesServiceStatus;
    OVER_QUERY_LIMIT: PlacesServiceStatus;
    REQUEST_DENIED: PlacesServiceStatus;
    INVALID_REQUEST: PlacesServiceStatus;
    UNKNOWN_ERROR: PlacesServiceStatus;
  };
  
  interface AutocompleteRequest {
    input: string;
    types?: string[];
    componentRestrictions?: {
      country: string | string[];
    };
  }
  
  interface AutocompleteService {
    getPlacePredictions(
      request: AutocompleteRequest,
      callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
    ): void;
  }
}

declare namespace google.maps {
  interface MapsEventListener {
    remove(): void;
  }

  namespace event {
    function removeListener(listener: MapsEventListener): void;
    function clearInstanceListeners(instance: any): void;
  }
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesServiceStatus: typeof google.maps.places.PlacesServiceStatus;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
          removeListener: (listener: any) => void;
        };
      };
    };
  }
}

export {};