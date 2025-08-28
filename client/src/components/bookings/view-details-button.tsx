import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "wouter";

interface ViewDetailsButtonProps {
  bookingId?: number;
  locationId?: number;
  className?: string;
  variant?: "link" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  asLink?: boolean;
  isHostView?: boolean;
}

/**
 * Enhanced View Details button component for both bookings and locations
 * Provides consistent styling across the application
 * 
 * @param bookingId - ID of booking to view (if viewing a booking)
 * @param locationId - ID of location to view (if viewing a location)
 * @param className - Additional CSS classes
 * @param variant - Button variant (link, outline, or ghost)
 * @param size - Button size (default, sm, lg, or icon)
 * @param asLink - Whether to render as a Link component (for client-side routing)
 * @param isHostView - Whether the button is for a host view (changes URL path)
 */
export function ViewDetailsButton({ 
  bookingId, 
  locationId, 
  className = "", 
  variant = "link",
  size = "default",
  asLink = false,
  isHostView = false
}: ViewDetailsButtonProps) {
  const [, navigate] = useLocation();
  
  // Determine URL based on what type of resource we're viewing
  let url;
  if (bookingId) {
    url = isHostView ? `/host-booking/${bookingId}` : `/bookings/${bookingId}`;
  } else if (locationId) {
    url = `/locations/${locationId}`;
  } else {
    url = "#";
  }

  const handleClick = () => {
    navigate(url);
  };

  // Default styles based on variant
  const getBaseStyles = () => {
    if (variant === "link") {
      return "p-0 h-auto text-sm text-primary hover:text-primary/80 transition-colors";
    }
    return "text-primary";
  };
  
  // Common styles for all variants
  const commonStyles = "flex items-center gap-1.5";
  
  // Combined styles
  const buttonStyles = `${getBaseStyles()} ${commonStyles} ${className}`;

  // The actual button content
  const buttonContent = (
    <>
      <Eye className="h-3.5 w-3.5" />
      <span>View Details</span>
    </>
  );

  // Return different implementations based on asLink prop
  if (asLink) {
    return (
      <Button 
        variant={variant}
        size={size}
        className={buttonStyles}
        asChild
      >
        <Link href={url}>
          {buttonContent}
        </Link>
      </Button>
    );
  }

  return (
    <Button 
      variant={variant}
      size={size}
      className={buttonStyles}
      onClick={handleClick}
    >
      {buttonContent}
    </Button>
  );
}