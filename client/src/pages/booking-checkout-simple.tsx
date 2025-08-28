import { useParams, useLocation } from "wouter";
import { useRouter } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/app-layout";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ArrowLeft } from "lucide-react";

export default function BookingCheckoutSimple() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    activityType: "",
    projectName: "",
    guestCount: 1
  });

  // Fetch location data
  const { data: location, isLoading: locationLoading, error: locationError } = useQuery({
    queryKey: [`/api/locations/${id}`],
    enabled: !!id,
  });

  // Simple booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      console.log("Making booking API request...");
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Booking created successfully:", data);
      toast({
        title: "Success",
        description: "Booking created successfully!",
      });
      router.push("/");
    },
    onError: (error) => {
      console.error("Booking creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Simple form submit triggered");
    
    const bookingData = {
      locationId: Number(id),
      clientId: user?.id || 8,
      startDate: new Date(`${formData.date}T${formData.startTime}`),
      endDate: new Date(`${formData.date}T${formData.endTime}`),
      totalPrice: 10000, // $100 in cents
      status: "payment_pending",
      activityType: formData.activityType,
      projectName: formData.projectName,
      guestCount: formData.guestCount,
      addons: []
    };

    createBookingMutation.mutate(bookingData);
  };

  if (locationLoading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (locationError) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Error loading location</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/locations/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Simple Booking Test</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book {location?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guestCount">Guest Count</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activityType">Activity Type</Label>
                <Input
                  id="activityType"
                  value={formData.activityType}
                  onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  placeholder="e.g., Photography, Film shoot"
                  required
                />
              </div>

              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}