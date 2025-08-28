import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Clock, MapPin } from "lucide-react";

type BookingDetails = {
  date: string;
  time: string;
  isFlexible: boolean;
  activity: string;
  attendees: string;
  locationTitle: string;
};

type Props = {
  details: BookingDetails;
};

export function BookingRequestCard({ details }: Props) {
  return (
    <Card className="mb-4 bg-secondary/50">
      <CardContent className="pt-4 px-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold mb-1">Booking Request Details</h3>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{details.locationTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              <span>{details.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>
                {details.time}
                {details.isFlexible && (
                  <span className="text-xs text-muted-foreground ml-1">(Flexible)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{details.attendees} attendees</span>
            </div>

            <div className="pt-2 border-t text-xs">
              <span className="font-medium">Activity: </span>
              <span className="text-muted-foreground">{details.activity}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}