import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@shared/schema";

export type BookingStatusFilter = "all" | "upcoming" | "pending" | "completed" | "canceled";

interface BookingStatusTabsProps {
  activeStatus: BookingStatusFilter;
  onStatusChange: (status: BookingStatusFilter) => void;
  isHost?: boolean;
  pendingCount?: number;
}

/**
 * Filters bookings based on the selected status filter
 */
export function filterBookingsByStatus(bookings: Booking[], status: BookingStatusFilter): Booking[] {
  if (status === "all") {
    return bookings;
  }
  
  const now = new Date();
  
  return bookings.filter(booking => {
    const endDate = new Date(booking.endDate);
    
    switch (status) {
      case "upcoming":
        return booking.status === "confirmed" && endDate > now;
      case "pending":
        return booking.status === "pending" || booking.status === "payment_pending";
      case "completed":
        return booking.status === "completed" || (booking.status === "confirmed" && endDate <= now);
      case "canceled":
        return booking.status === "cancelled" || booking.status === "rejected";
      default:
        return true;
    }
  });
}

/**
 * A consistent booking status tabs component that can be used across host and client views
 * Shows a set of tabs for filtering bookings by status
 */
export function BookingStatusTabs({
  activeStatus,
  onStatusChange,
  isHost = false,
  pendingCount = 0
}: BookingStatusTabsProps) {
  return (
    <Tabs value={activeStatus} className="w-full" onValueChange={(value) => onStatusChange(value as BookingStatusFilter)}>
      <TabsList className="grid grid-cols-5 w-full bg-white border border-gray-100 shadow-sm rounded-md">
        <TabsTrigger 
          value="all" 
          className="text-sm text-gray-600 data-[state=active]:text-cyan-700 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
        >
          All
        </TabsTrigger>
        
        <TabsTrigger 
          value="upcoming" 
          className="text-sm text-gray-600 data-[state=active]:text-cyan-700 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
        >
          Upcoming
        </TabsTrigger>
        
        <TabsTrigger 
          value="pending" 
          className="text-sm text-gray-600 data-[state=active]:text-cyan-700 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
        >
          Pending
          {pendingCount > 0 && (
            <Badge 
              variant="outline" 
              className="ml-1.5 h-5 px-1.5 bg-white text-amber-700 hover:bg-amber-50 border border-amber-300"
            >
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger 
          value="completed" 
          className="text-sm text-gray-600 data-[state=active]:text-cyan-700 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
        >
          Completed
        </TabsTrigger>
        
        <TabsTrigger 
          value="canceled" 
          className="text-sm text-gray-600 data-[state=active]:text-cyan-700 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
        >
          Canceled
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}