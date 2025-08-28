import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Props {
  onAvailabilityChange?: (dates: Date[]) => void;
  defaultSelected?: Date[];
}

export function AvailabilityCalendar({ onAvailabilityChange, defaultSelected = [] }: Props) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(defaultSelected);
  const [isGoogleCalendarEnabled, setIsGoogleCalendarEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Add event listener for Google OAuth popup response
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        try {
          await syncCalendar();
          toast({
            title: "Success",
            description: "Successfully connected to Google Calendar",
          });
        } catch (error) {
          console.error('Failed to sync calendar:', error);
          toast({
            title: "Error",
            description: "Failed to sync calendar. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSelect = (days: Date[] | undefined) => {
    if (!days) return;
    setSelectedDates(days);
    onAvailabilityChange?.(days);
  };

  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true);
    try {
      // Get Google OAuth URL
      const response = await apiRequest("GET", "/api/google/auth");
      const { url } = await response.json();

      // Open popup for Google OAuth
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        url,
        "googleAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Failed to start Google sync:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncCalendar = async () => {
    try {
      await apiRequest("POST", "/api/google/sync-calendar", {
        locationId: 1, // TODO: Pass actual location ID
      });
      setIsGoogleCalendarEnabled(true);
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Availability</CardTitle>
        <CardDescription>
          Select dates to block them as unavailable. Click a date again to make it available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleSelect}
            className="rounded-md border"
          />
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Selected Dates</h3>
              <div className="text-sm text-muted-foreground">
                {selectedDates.length === 0 ? (
                  <p>No dates selected</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {selectedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((date) => (
                        <li key={date.toISOString()}>
                          {date.toLocaleDateString()}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="google-calendar"
                  checked={isGoogleCalendarEnabled}
                  onCheckedChange={setIsGoogleCalendarEnabled}
                />
                <Label htmlFor="google-calendar">Sync with Google Calendar</Label>
              </div>
              {isGoogleCalendarEnabled && (
                <Button
                  variant="outline"
                  onClick={handleGoogleCalendarSync}
                  className="w-full"
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Google Calendar"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}