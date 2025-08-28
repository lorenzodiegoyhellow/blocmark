import { Calendar, Clock, Users, MapPin, DollarSign, Activity, Flag, Archive, Headphones, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { formatUsername } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CustomOfferDialogSimple } from "./custom-offer-dialog-simple";
import { useQuery } from "@tanstack/react-query";

type BookingDetails = {
  checkIn?: string;
  checkOut?: string;
  date?: string;
  time?: string;
  attendees: number | string;
  eventSize?: number;
  locationTitle: string;
  totalCost?: number;
  pricePerHour?: number;
  activity?: string;
  isFlexible?: boolean;
};

type Props = {
  details: BookingDetails;
  location?: any;
  locationId: number;
  otherUserId: number;
  username: string;
  userImage?: string;
  isArchived?: boolean;
};

export function BookingDetailsPanel({ details, location, locationId, otherUserId, username, userImage, isArchived = false }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  const [showCustomOfferDialog, setShowCustomOfferDialog] = useState(false);
  
  // Fetch location data if not provided
  const { data: fetchedLocation } = useQuery({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId && !location,
  });
  
  // Use provided location or fetched location
  const locationData = location || fetchedLocation;
  
  // Determine if current user is the renter (client) or host
  const isRenter = user && locationData && user.id !== locationData.ownerId;
  
  // Show loading state while determining user role
  const isLoadingUserRole = !user || !locationData;
  
  // Check for pending custom offers
  const { data: pendingOfferCheck, isLoading: checkingPendingOffer } = useQuery({
    queryKey: [`/api/messages/custom-offer/check-pending`, { recipientId: otherUserId, locationId }],
    queryFn: async () => {
      const response = await fetch(`/api/messages/custom-offer/check-pending?recipientId=${otherUserId}&locationId=${locationId}`);
      if (!response.ok) throw new Error('Failed to check pending offers');
      return response.json();
    },
    enabled: !isRenter && !!user && !!locationData && !!otherUserId && !!locationId,
  });
  
  // Handle archive/unarchive chat
  const handleArchiveChat = async () => {
    console.log(isArchived ? 'Unarchive button clicked' : 'Archive button clicked');
    console.log('User:', user);
    console.log('Other user ID:', otherUserId);
    console.log('Location ID:', locationId);
    console.log('Is archived:', isArchived);
    
    if (!user) {
      console.log('No user, returning');
      return;
    }
    
    console.log(isArchived ? 'Unarchiving chat:' : 'Archiving chat:', { otherUserId, locationId });
    
    setIsArchiving(true);
    try {
      // Archive or unarchive messages with this user and location
      const url = `/api/messages/conversation/${otherUserId}/${locationId}/${isArchived ? 'unarchive' : 'archive'}`;
      console.log('Making request to:', url);
      console.log('Request details:', { otherUserId, locationId, user: user?.id, isArchived });
      
      const response = await apiRequest({
        url,
        method: 'POST'
      });
      
      console.log(isArchived ? 'Unarchive response received:' : 'Archive response received:', response);
      
      toast({
        title: isArchived ? "Chat unarchived" : "Chat archived",
        description: isArchived ? "This conversation has been moved back to your inbox." : "This conversation has been archived successfully."
      });
      
      // Invalidate and refetch messages query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      await queryClient.refetchQueries({ queryKey: ["/api/messages"] });
      
      // Small delay to ensure cache is updated before navigation
      setTimeout(() => {
        // Navigate back to messages list (show active messages if unarchiving)
        navigate(isArchived ? '/messages' : '/messages?archived=true');
      }, 100);
    } catch (error) {
      console.error(isArchived ? 'Unarchive error:' : 'Archive error:', error);
      toast({
        title: "Error",
        description: isArchived ? "Failed to unarchive chat. Please try again." : "Failed to archive chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };
  
  // Handle contact support
  const handleContactSupport = () => {
    // Navigate to help support page
    navigate('/help-support');
  };
  
  // Handle different date formats from booking details
  let dateDisplay = details.date || '';
  let timeDisplay = details.time || '';
  let duration = 0;
  
  if (details.checkIn && details.checkOut) {
    const checkInDate = new Date(details.checkIn);
    const checkOutDate = new Date(details.checkOut);
    if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
      dateDisplay = format(checkInDate, "MMMM d, yyyy");
      timeDisplay = `${format(checkInDate, "h:mm a")} - ${format(checkOutDate, "h:mm a")}`;
      duration = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60));
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold mb-1">Details</h2>
        <p className="text-sm text-gray-500">Booking Request</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Location Image and Title */}
        <div className="mb-6">
          {location?.images?.[0] && (
            <img 
              src={location.images[0]} 
              alt={location?.title || details.locationTitle}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="text-lg font-semibold mb-2">
            <Link href={`/locations/${location?.id || locationId}`} className="hover:text-primary transition-colors">
              {location?.title || details.locationTitle}
            </Link>
          </h3>
        </div>

        {/* Booking Details Card */}
        <Card className="p-6 mb-6">
          <h4 className="font-semibold mb-4">Booking Details</h4>
          
          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{dateDisplay}</p>
                <p className="text-sm text-gray-500">{timeDisplay}</p>
                {duration > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{duration} {duration === 1 ? 'hour' : 'hours'}</p>
                )}
                {details.isFlexible && (
                  <p className="text-xs text-blue-600 mt-1">Flexible dates</p>
                )}
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{details.attendees} attendees</p>
                {details.eventSize && (
                  <p className="text-sm text-gray-500">Event size: {details.eventSize}</p>
                )}
              </div>
            </div>

            {/* Activity */}
            {details.activity && (
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Activity</p>
                  <p className="text-sm text-gray-500">{details.activity}</p>
                </div>
              </div>
            )}

            {/* Price */}
            {(details.totalCost || details.pricePerHour) && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  {details.pricePerHour && (
                    <p className="text-sm text-gray-500">${details.pricePerHour}/hour</p>
                  )}
                  {details.totalCost && (
                    <p className="text-sm font-medium">Total: ${details.totalCost}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Button - Request Booking for Renters, Send Custom Rate for Hosts */}
        {isLoadingUserRole ? (
          <Button 
            className="w-full mb-6" 
            variant="default" 
            size="lg"
            disabled
          >
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        ) : isRenter ? (
          <Button 
            className="w-full mb-6" 
            variant="default" 
            size="lg"
            onClick={() => {
              const targetLocationId = locationData?.id || locationId;
              
              if (targetLocationId && details) {
                // Build URL with booking parameters
                const params = new URLSearchParams();
                
                // Handle date parameters - ensure proper format
                if (details.date) {
                  // If date is in human-readable format, convert to yyyy-MM-dd
                  if (details.date.includes(',')) {
                    try {
                      const parsed = new Date(details.date.replace(/(\d+)(st|nd|rd|th)/, '$1'));
                      if (!isNaN(parsed.getTime())) {
                        params.set('date', format(parsed, 'yyyy-MM-dd'));
                      } else {
                        params.set('date', format(new Date(), 'yyyy-MM-dd'));
                      }
                    } catch {
                      params.set('date', format(new Date(), 'yyyy-MM-dd'));
                    }
                  } else {
                    params.set('date', details.date);
                  }
                } else if (details.checkIn) {
                  // Extract date portion from ISO string
                  params.set('date', details.checkIn.split('T')[0]);
                } else {
                  // Default to today
                  params.set('date', format(new Date(), 'yyyy-MM-dd'));
                }
                
                // Handle time parameters - Convert 12-hour to 24-hour format
                console.log('=== Processing booking details ===');
                console.log('Details object:', JSON.stringify(details, null, 2));
                
                // Helper to convert 12-hour to 24-hour
                const convertTo24Hour = (time12h: string): string => {
                  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
                  if (!match) return time12h; // Return as-is if not 12-hour format
                  
                  let [, hours, minutes, ampm] = match;
                  let hour24 = parseInt(hours);
                  
                  if (ampm.toUpperCase() === 'AM') {
                    if (hour24 === 12) hour24 = 0;
                  } else {
                    if (hour24 !== 12) hour24 += 12;
                  }
                  
                  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
                };
                
                if (details.time) {
                  console.log('Using details.time:', details.time);
                  const [start, end] = details.time.split(' - ');
                  if (start) {
                    const start24 = convertTo24Hour(start.trim());
                    console.log('Converted start time:', start, '->', start24);
                    params.set('startTime', start24);
                  }
                  if (end) {
                    const end24 = convertTo24Hour(end.trim());
                    console.log('Converted end time:', end, '->', end24);
                    params.set('endTime', end24);
                  }
                } else {
                  // Skip complex date parsing entirely - just use safe defaults
                  console.log('No time details found, using safe defaults');
                  params.set('startTime', '09:00');
                  params.set('endTime', '17:00');
                }
                
                // Add other parameters
                if (details.attendees) params.set('groupSize', details.attendees.toString());
                if (details.eventSize) params.set('eventSize', details.eventSize.toString());
                
                navigate(`/locations/${targetLocationId}/booking-checkout?${params.toString()}`);
              } else {
                console.error('No location ID available:', { location, locationId });
              }
            }}
          >
            Request booking
          </Button>
        ) : (
          <Button 
            className="w-full mb-6" 
            variant="default" 
            size="lg"
            disabled={checkingPendingOffer || pendingOfferCheck?.hasPendingOffer}
            onClick={() => {
              console.log('Send custom offer clicked');
              console.log('locationId:', locationId);
              console.log('otherUserId:', otherUserId);
              console.log('locationData:', locationData);
              
              if (!locationId || !otherUserId || locationId <= 0 || otherUserId <= 0) {
                toast({
                  title: "Error",
                  description: "Unable to open custom offer dialog. Missing required information.",
                  variant: "destructive"
                });
                return;
              }
              
              if (pendingOfferCheck?.hasPendingOffer) {
                toast({
                  title: "Pending Offer Exists",
                  description: "You already have a pending custom offer for this location. Please wait for the recipient to respond or cancel the existing offer before sending a new one.",
                  variant: "destructive"
                });
                return;
              }
              
              setShowCustomOfferDialog(true);
            }}
          >
            {checkingPendingOffer ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Checking...
              </>
            ) : pendingOfferCheck?.hasPendingOffer ? (
              "Pending offer exists"
            ) : (
              "Send custom offer"
            )}
          </Button>
        )}

        {/* Host Profile */}
        <div className="border-t pt-6">
          <Link href={`/users/${otherUserId}`} className="flex items-center gap-3 hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors">
            <Avatar className="h-12 w-12">
              {userImage ? (
                <AvatarImage src={userImage} alt={username} className="object-cover" />
              ) : (
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{formatUsername(username)}</p>
              <p className="text-sm text-gray-500">View profile</p>
            </div>
          </Link>
        </div>

        {/* Safety Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Always communicate through Blocmark.
          </p>
          <p className="text-xs text-blue-700">
            All transactions must be made through blocmark.com. If you are asked to book or transact payment outside of Blocmark, please let us know. Any transactions through an off-platform method are not protected by Blocmark and will not be eligible to receive refunds.
          </p>
        </div>
        
        {/* Action Links */}
        <div className="mt-6 pt-6 border-t space-y-3">
          <button 
            onClick={() => navigate(`/report-user/${otherUserId}`)}
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full text-left"
          >
            <Flag className="h-4 w-4" />
            Report User
          </button>
          <button 
            onClick={handleArchiveChat}
            disabled={isArchiving}
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full text-left disabled:opacity-50"
          >
            {isArchiving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchiving ? (isArchived ? 'Unarchiving...' : 'Archiving...') : (isArchived ? 'Unarchive Chat' : 'Archive Chat')}
          </button>
          <button 
            onClick={handleContactSupport}
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full text-left"
          >
            <Headphones className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
      
      {/* Custom Offer Dialog */}
      {showCustomOfferDialog && locationId && otherUserId && locationData && (
        <CustomOfferDialogSimple
          open={showCustomOfferDialog}
          onOpenChange={setShowCustomOfferDialog}
          locationId={locationId}
          locationTitle={locationData.title || details?.locationTitle || 'Location'}
          recipientId={otherUserId}
          recipientName={username || 'User'}
        />
      )}
    </div>
  );
}