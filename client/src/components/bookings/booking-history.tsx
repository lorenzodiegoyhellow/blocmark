import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatUsername } from "@/lib/utils";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Loader2, Clock, User, Edit, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extended BookingEditHistory with additional fields
type EnhancedBookingEditHistory = {
  id: number;
  bookingId: number;
  editorId: number;
  editorName?: string; // Optional field for display purposes
  editedAt: Date;
  previousData: any;
  newData: any;
  reason: string | null;
  notifiedClient: boolean;
};

interface BookingHistoryProps {
  bookingId: number;
}

export function BookingHistory({ bookingId }: BookingHistoryProps) {
  // Add useEffect for debugging
  useEffect(() => {
    console.log(`BookingHistory component mounted for booking ID: ${bookingId}`);
    
    // Fetch the history data directly for debugging
    fetch(`/api/bookings/${bookingId}/history`)
      .then(res => {
        console.log(`History endpoint response status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`History data:`, data);
      })
      .catch(err => {
        console.error(`Error fetching history:`, err);
      });
  }, [bookingId]);
  
  // Fetch booking edit history
  const { data: history, isLoading, error } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/history`],
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <p>Loading edit history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>Error loading booking history: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  if (!history || !Array.isArray(history) || history.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        <p>No edit history available for this booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Edit className="h-5 w-5 mr-2" />
        Edit History
      </h3>
      
      <Accordion type="single" collapsible className="w-full">
        {history.map((entry: EnhancedBookingEditHistory, index: number) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="hover:bg-gray-50 px-3 rounded-md">
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {format(new Date(entry.editedAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">
                    Edited by {entry.editorName || `User ${entry.editorId}`}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                {entry.reason && (
                  <div className="flex items-start">
                    <MessageCircle className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Reason for change:</p>
                      <p className="text-sm text-gray-600">{entry.reason}</p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Previous</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <BookingChangeDetails data={entry.previousData} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Updated</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <BookingChangeDetails data={entry.newData} />
                    </CardContent>
                  </Card>
                </div>
                
                <Badge 
                  variant="secondary"
                  className={`text-xs ${entry.notifiedClient ? "bg-green-100 text-green-800" : ""}`}
                >
                  {entry.notifiedClient ? "Client notified" : "Client not notified"}
                </Badge>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function BookingChangeDetails({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-1">
        <span className="text-gray-500">Date:</span>
        <span>{format(new Date(data.startDate), "MMM d, yyyy")}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <span className="text-gray-500">Time:</span>
        <span>
          {format(new Date(data.startDate), "h:mm a")} - {format(new Date(data.endDate), "h:mm a")}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <span className="text-gray-500">Guests:</span>
        <span>{data.guestCount || 1}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <span className="text-gray-500">Status:</span>
        <span className="capitalize">{data.status}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <span className="text-gray-500">Price:</span>
        <span>${(data.totalPrice / 100).toFixed(2)}</span>
      </div>
    </div>
  );
}