import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

// Type for Nominatim API response
type NominatimResult = {
  place_id: number;
  display_name: string; 
  lat: string;
  lon: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

// Enhanced version using Nominatim (OpenStreetMap) API
export const AddressAutocompleteSimple = forwardRef<HTMLInputElement, Props>(({
  value,
  onChange,
  placeholder = "Enter an address...",
  className = "",
  disabled = false,
}, ref) => {
  const [suggestions, setSuggestions] = useState<Array<{text: string, coords: {lat: number, lng: number}}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch suggestions from Nominatim API
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }
    
    // Debounce the API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Use Nominatim API (no API key needed)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          {
            headers: {
              // Add a referrer policy and user agent as per Nominatim usage policy
              'Referrer-Policy': 'no-referrer-when-downgrade',
              'User-Agent': 'BlocmarkWebApp/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch address suggestions');
        }
        
        const results = await response.json() as NominatimResult[];
        
        // Format the results
        const formattedSuggestions = results.map(result => ({
          text: result.display_name,
          coords: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          }
        }));
        
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        // Fallback to some reasonable coordinates if the service fails
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow for clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-slate-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onChange(suggestion.text, suggestion.coords);
                setShowSuggestions(false);
              }}
            >
              <div className="text-sm font-medium">{suggestion.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AddressAutocompleteSimple.displayName = "AddressAutocompleteSimple";