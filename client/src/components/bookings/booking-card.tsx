import React from "react";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, MapPin, Users, Star, Check, X, Eye, Image } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Extended booking type that includes additional fields from API
interface ExtendedBooking extends Omit<Booking, 'startDate' | 'endDate'> {
  startDate: string; // API returns dates as strings
  endDate: string;
  locationTitle?: string;
  locationImage?: string | null;
  locationAddress?: string;
  clientName?: string;
  startTime?: string;
  endTime?: string;
}

interface BookingCardProps {
  booking: ExtendedBooking;
  isHost?: boolean;
  isPending?: boolean;
  showReviewButton?: boolean;
  showCancelButton?: boolean;
  viewDetailsLink?: string;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReviewClick?: () => void;
}

/**
 * Enhanced BookingCard component that supports both host and client views
 * with consistent UI and type safety
 */
export function BookingCard({
  booking,
  isHost = false,
  isPending = false,
  showReviewButton = false,
  showCancelButton = false,
  viewDetailsLink,
  onViewDetails,
  onEdit,
  onCancel,
  onApprove,
  onReject,
  onReviewClick,
}: BookingCardProps) {
  // Determine status badge appearance
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline" className="text-green-700 border-green-700 bg-white">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-700 border-amber-700 bg-white">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-slate-700 border-slate-700 bg-white">Cancelled</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-rose-700 border-rose-700 bg-white">Rejected</Badge>;
      case "payment_pending":
        return <Badge variant="outline" className="text-blue-700 border-blue-700 bg-white">Payment Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-emerald-700 border-emerald-700 bg-white">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Extract time from date string - use UTC to avoid timezone shifts
  const extractTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Format the date range in a user-friendly way - use UTC dates to avoid timezone shifts
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Compare UTC dates to determine if same day
    const sameDay = start.getUTCFullYear() === end.getUTCFullYear() &&
                    start.getUTCMonth() === end.getUTCMonth() &&
                    start.getUTCDate() === end.getUTCDate();
    
    // If same day booking, only show one date
    if (sameDay) {
      // Format using UTC values to avoid timezone shift
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short',
        day: 'numeric', 
        year: 'numeric',
        timeZone: 'UTC'
      };
      return new Intl.DateTimeFormat('en-US', options).format(start);
    }
    
    // Different days
    return `${formatDate(startDate, false)} - ${formatDate(endDate, false)}`;
  };

  // Determine if the booking is in the past
  const isPastBooking = new Date(booking.endDate) < new Date();

  // Handle view details click
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else if (viewDetailsLink) {
      // Let the parent handle navigation
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Location Image */}
      {booking.locationImage && (
        <div className="h-32 w-full overflow-hidden bg-muted">
          <img 
            src={booking.locationImage} 
            alt={booking.locationTitle || 'Location'}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {!booking.locationImage && (
        <div className="h-32 w-full bg-muted flex items-center justify-center">
          <Image className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {booking.locationTitle || `Booking #${booking.id}`}
          </CardTitle>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
          </div>
          
          {(booking.startTime || booking.startDate) && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {booking.startTime || extractTime(booking.startDate)}{booking.endTime ? ` - ${booking.endTime}` : booking.endDate ? ` - ${extractTime(booking.endDate)}` : ''}
              </span>
            </div>
          )}
          
          {booking.guestCount && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{booking.guestCount} guests</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>${(booking.totalPrice / 100).toFixed(2)}</span>
          </div>
          
          {isHost && booking.clientName && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>Client: {booking.clientName}</span>
            </div>
          )}
          
          {!isHost && booking.locationAddress && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{booking.locationAddress}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 pt-2">
        {viewDetailsLink || onViewDetails ? (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleViewDetails}
            className="flex-1"
            asChild={!!viewDetailsLink}
          >
            {viewDetailsLink ? (
              <a href={viewDetailsLink}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </a>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </>
            )}
          </Button>
        ) : null}
        
        {/* Client-specific actions */}
        {!isHost && (
          <>
            {onEdit && !isPastBooking && booking.status !== "cancelled" && booking.status !== "rejected" && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            
            {onCancel && showCancelButton && !isPastBooking && booking.status !== "cancelled" && booking.status !== "rejected" && (
              <Button size="sm" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            
            {showReviewButton && onReviewClick && (
              <Button size="sm" variant="outline" onClick={onReviewClick}>
                <Star className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}
          </>
        )}
        
        {/* Host-specific actions */}
        {isHost && isPending && (
          <div className="flex gap-2 mt-2 w-full">
            {onApprove && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-green-600 text-green-700 bg-white hover:bg-green-50"
                onClick={onApprove}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            
            {onReject && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-red-600 text-red-700 bg-white hover:bg-red-50"
                onClick={onReject}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}