import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A reliable navigation function that takes user directly to specified URL.
 * This bypasses any React Router issues by directly changing the browser location.
 */
export function navigateTo(url: string, data?: Record<string, any>) {
  console.log(`Direct navigation to: ${url}`);
  
  // If we have data to pass, store it in sessionStorage (cleared when browser is closed)
  if (data) {
    try {
      console.log("Storing navigation data:", data);
      sessionStorage.setItem('navigationData', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to store navigation data:", error);
    }
  }
  
  // Force a hard navigation using browser's native API
  window.location.href = url;
}

/**
 * Formats a date string into a user-friendly format.
 * Example: "2025-03-04T12:00:00Z" becomes "Mar 4, 2025, 12:00 PM"
 */
export function formatDate(dateString: string, includeTime: boolean = true): string {
  if (!dateString) return "N/A";
  
  try {
    // Add noon time to prevent timezone shift if date string doesn't include time
    const adjustedDateString = dateString.includes('T') ? dateString : dateString + 'T12:00:00';
    const date = new Date(adjustedDateString);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
}

/**
 * Formats a username for display with privacy in mind.
 * Shows first name and only first letter of last name with a period.
 * Example: "John Smith" becomes "John S."
 * If no space in the name, or already in the desired format, returns it unchanged.
 */
export function formatUsername(username: string): string {
  if (!username) return '';
  
  // If username already follows the "First L." format, return as is
  if (/^[\w\s]+ [A-Z]\.$/.test(username)) {
    return username;
  }
  
  // If username has no space (single name), return as is
  if (!username.includes(' ')) {
    return username;
  }
  
  // Split by space and get the components
  const parts = username.split(' ');
  
  // If more than 2 parts, combine all but the last as the "first name"
  if (parts.length > 2) {
    const firstName = parts.slice(0, -1).join(' ');
    const lastNameInitial = parts[parts.length - 1].charAt(0);
    return `${firstName} ${lastNameInitial}.`;
  }
  
  // Regular case: two parts
  const [firstName, lastName] = parts;
  const lastNameInitial = lastName.charAt(0);
  
  return `${firstName} ${lastNameInitial}.`;
}

/**
 * Formats a number as a price with currency symbol.
 * Example: 1000 becomes "$1,000"
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Formats a number as currency.
 * This is an alias for formatPrice for use in the analytics dashboard.
 * Example: 1000 becomes "$1,000"
 */
export function formatCurrency(amount: number): string {
  return formatPrice(amount);
}
