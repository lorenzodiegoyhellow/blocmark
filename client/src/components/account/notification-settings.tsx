import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NotificationPreferences {
  email: {
    bookingRequests: boolean;
    messages: boolean;
    marketing: boolean;
  };
  text: {
    bookingRequests: boolean;
    messages: boolean;
    marketing: boolean;
  };
}

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      bookingRequests: true,
      messages: true,
      marketing: false,
    },
    text: {
      bookingRequests: true,
      messages: true,
      marketing: false,
    },
  });

  // Initialize preferences from user data if available
  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user]);

  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: NotificationPreferences) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Updating preferences:", newPreferences);
      
      // apiRequest already handles the response parsing and error checking
      const data = await apiRequest({
        url: `/api/users/${user.id}`,
        method: "PATCH",
        body: {
          notificationPreferences: newPreferences,
        },
      });
      
      console.log("Update response:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      console.error("Failed to update notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (
    type: "email" | "text",
    category: "bookingRequests" | "messages" | "marketing"
  ) => {
    const newPreferences = {
      ...preferences,
      [type]: {
        ...preferences[type],
        [category]: !preferences[type][category],
      },
    };
    setPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Please log in to manage notification preferences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage your notification preferences for different types of activities.
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-booking">Booking Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when you get new booking requests
                </p>
              </div>
              <Switch
                id="email-booking"
                checked={preferences.email.bookingRequests}
                onCheckedChange={() => handleToggle("email", "bookingRequests")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-messages">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when you get new messages
                </p>
              </div>
              <Switch
                id="email-messages"
                checked={preferences.email.messages}
                onCheckedChange={() => handleToggle("email", "messages")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-marketing">Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and updates
                </p>
              </div>
              <Switch
                id="email-marketing"
                checked={preferences.email.marketing}
                onCheckedChange={() => handleToggle("email", "marketing")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Text Notifications */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Text Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="text-booking">Booking Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages when you get new booking requests
                </p>
              </div>
              <Switch
                id="text-booking"
                checked={preferences.text.bookingRequests}
                onCheckedChange={() => handleToggle("text", "bookingRequests")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="text-messages">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages when you get new messages
                </p>
              </div>
              <Switch
                id="text-messages"
                checked={preferences.text.messages}
                onCheckedChange={() => handleToggle("text", "messages")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="text-marketing">Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional text messages and updates
                </p>
              </div>
              <Switch
                id="text-marketing"
                checked={preferences.text.marketing}
                onCheckedChange={() => handleToggle("text", "marketing")}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}