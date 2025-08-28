/**
 * Utility functions for city detection and geolocation
 */

// Extract city from location address
export function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  
  try {
    // Split address by commas and find potential city
    const parts = address.split(',').map(part => part.trim());
    
    // Common address formats:
    // "123 Main St, New York, NY 10001"
    // "456 Oak Ave, Los Angeles, CA"
    // "789 Pine Rd, Chicago, Illinois"
    
    if (parts.length >= 2) {
      // Usually city is the second-to-last part (before state/country)
      const cityCandidate = parts[parts.length - 2];
      
      // Clean up common state/country codes and zip codes
      const cleanCity = cityCandidate
        .replace(/\b[A-Z]{2}\b/g, '') // Remove state codes like CA, NY
        .replace(/\b\d{5}(-\d{4})?\b/g, '') // Remove ZIP codes
        .replace(/\bUSA?\b/gi, '') // Remove USA/US
        .replace(/\bUnited States\b/gi, '') // Remove United States
        .trim();
      
      if (cleanCity && cleanCity.length > 1) {
        return cleanCity;
      }
    }
    
    // Fallback: look for major city names in the address
    const majorCities = [
      // 15 Major US Cities
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
      'Miami', 'Boston', 'Seattle', 'Denver', 'Atlanta',
      // 15 Major Italian Cities  
      'Rome', 'Milan', 'Naples', 'Turin', 'Palermo',
      'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona',
      'Catania', 'Bari', 'Messina', 'Padua', 'Trieste',
      // Keep some additional US cities for better coverage
      'San Francisco', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
      'Charlotte', 'Indianapolis', 'Washington', 'El Paso', 'Nashville',
      'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis'
    ];
    
    for (const city of majorCities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting city from address:', error);
    return null;
  }
}

// Normalize city names for consistent matching
export function normalizeCityName(cityName: string): string {
  if (!cityName) return '';
  
  return cityName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get user's city from IP address (using a free geolocation service)
export async function getUserCityFromIP(ipAddress: string): Promise<string | null> {
  try {
    // Use ipapi.co for free IP geolocation (no API key needed)
    console.log(`[GEOLOCATION] Fetching location data for IP: ${ipAddress}`);
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    
    if (!response.ok) {
      console.error('[GEOLOCATION] Failed to fetch geolocation data:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log(`[GEOLOCATION] Response data:`, {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      ip: data.ip
    });
    
    if (data.city) {
      const normalizedCity = normalizeCityName(data.city);
      console.log(`[GEOLOCATION] Normalized city: ${normalizedCity}`);
      return normalizedCity;
    }
    
    console.log('[GEOLOCATION] No city found in response');
    return null;
  } catch (error) {
    console.error('[GEOLOCATION] Error getting user city from IP:', error);
    return null;
  }
}

// Extract user's real IP address from request headers (considering proxies)
export function extractClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
}