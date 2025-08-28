import { Calendar, Clock, Users, DollarSign, MessageCircle, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface CustomOfferBookingCardProps {
  offer: {
    id: number;
    locationId: number;
    locationTitle: string;
    locationImage: string | null;
    senderId: number;
    senderName: string;
    senderImage: string | null;
    content: string;
    createdAt: string;
    metadata: {
      type: 'custom_offer';
      status: 'pending';
      date?: string;
      startTime?: string;
      endTime?: string;
      attendees?: number;
      groupSize?: string;
      customPrice: number;
      selectedAddons?: number[];
      additionalFees?: Array<{
        name: string;
        amount: number;
        type: 'fixed' | 'percentage';
      }>;
    };
  };
}

export function CustomOfferBookingCard({ offer }: CustomOfferBookingCardProps) {
  const [, navigate] = useLocation();
  const { metadata } = offer;

  // Format date
  const formatOfferDate = (date?: string) => {
    if (!date) return "Date not specified";
    try {
      return format(new Date(date), "MMMM d, yyyy");
    } catch {
      return date;
    }
  };

  // Format time range
  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return "Time not specified";
    if (!endTime) return startTime;
    return `${startTime} - ${endTime}`;
  };

  // Calculate total with fees
  const calculateTotal = () => {
    let total = metadata.customPrice || 0;
    
    if (metadata.additionalFees) {
      metadata.additionalFees.forEach(fee => {
        if (fee.type === 'fixed') {
          total += fee.amount;
        } else {
          total += (metadata.customPrice * fee.amount) / 100;
        }
      });
    }
    
    return total.toFixed(2);
  };

  const handleViewOffer = () => {
    // Navigate to messages page with the specific conversation
    navigate(`/messages?location=${offer.locationId}&user=${offer.senderId}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {offer.locationTitle || "Custom Offer"}
          </CardTitle>
          <Badge variant="outline" className="text-amber-700 border-amber-700 bg-amber-50">
            💸 Custom Offer
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatOfferDate(metadata.date)}</span>
          </div>
          
          {metadata.startTime && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTimeRange(metadata.startTime, metadata.endTime)}</span>
            </div>
          )}
          
          {metadata.attendees && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{metadata.attendees} guests ({metadata.groupSize || "Standard"})</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="font-medium">${calculateTotal()}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span>From {offer.senderName}</span>
          </div>
          
          {metadata.additionalFees && metadata.additionalFees.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Additional fees included:</p>
              <div className="space-y-1">
                {metadata.additionalFees.map((fee, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {fee.name}: ${fee.type === 'fixed' ? fee.amount.toFixed(2) : `${fee.amount}%`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleViewOffer}
            className="flex-1"
            variant="default"
          >
            View Offer Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}