import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { PaginatedData } from "@/components/ui/data-pagination";

export function usePendingBookings() {
  const { user } = useAuth();
  const { isHostMode } = useHostMode();
  
  // Only fetch bookings when in host mode
  const { data: hostBookings, isLoading } = useQuery<PaginatedData<Booking>>({
    queryKey: ["/api/bookings/host", { page: 1, limit: 100 }], // Get more items to count all pending
    enabled: !!user?.id && isHostMode && user?.roles?.includes("owner"),
  });

  // Count pending bookings that need host's attention
  const pendingCount = hostBookings?.data?.filter(booking => booking.status === "pending")?.length || 0;

  return {
    pendingCount,
    isLoading
  };
}