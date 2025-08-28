import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingEditForm } from "@/components/bookings/booking-edit-form";

export default function ClientDashboard() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your bookings</p>
      </div>

      <div className="space-y-4">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking #{booking.id}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                  {booking.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p>
                    {format(new Date(booking.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(booking.endDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p>${(booking.totalPrice / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!bookings || bookings.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              You don't have any bookings yet
            </CardContent>
          </Card>
        )}
      </div>

      {selectedBooking && (
        <BookingEditForm
          booking={selectedBooking}
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}