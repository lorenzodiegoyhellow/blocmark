import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, MapPin, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// Local type definitions
type Location = {
  id: number;
  title: string;
  description: string;
  images: string[];
  address: string;
  city?: string;
  price: number;
  status: string;
};

type SpotlightLocation = {
  id: number;
  locationId: number;
  startDate: string;
  endDate: string;
  spotlightOrder: number;
  city: string | null;
  priority: number;
  createdAt: string;
  createdBy: number;
  location: Location;
};

export function SpotlightManagerSimple() {
  const { toast } = useToast();
  const [selectedCityView, setSelectedCityView] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priority, setPriority] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch approved locations
  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/admin/locations/status/approved'],
  });

  // Fetch current spotlight locations
  const { data: spotlightLocations, isLoading, refetch } = useQuery<SpotlightLocation[]>({
    queryKey: ['/api/spotlight'],
  });

  // Fetch available cities
  const { data: cities } = useQuery<string[]>({
    queryKey: ['/api/spotlight/cities'],
  });

  const handleAddSpotlight = async () => {
    if (!selectedLocationId || !selectedCity) {
      toast({
        title: "Missing information",
        description: "Please select both a location and a city",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest({
        url: "/api/spotlight",
        method: "POST",
        body: {
          locationId: parseInt(selectedLocationId),
          city: selectedCity,
          priority: parseInt(priority),
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      });

      toast({
        title: "Success",
        description: "Location added to spotlight for " + selectedCity,
      });

      setShowAddForm(false);
      setSelectedLocationId("");
      setSelectedCity("");
      setPriority("1");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add spotlight",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSpotlight = async (spotlightId: number) => {
    try {
      await apiRequest({
        url: `/api/spotlight/${spotlightId}`,
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Location removed from spotlight",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove spotlight",
        variant: "destructive",
      });
    }
  };

  // Group spotlights by city
  const spotlightsByCity = spotlightLocations?.reduce((acc, spotlight) => {
    const city = spotlight.city || 'Global';
    if (!acc[city]) acc[city] = [];
    acc[city].push(spotlight);
    return acc;
  }, {} as Record<string, typeof spotlightLocations>);

  // Get all available cities with their spotlight counts
  const allCities = [
    ...new Set([
      ...(cities || []),
      ...(spotlightLocations?.map(s => s.city).filter(Boolean) || [])
    ])
  ].sort();

  const usCities = allCities.filter(city => [
    'Atlanta', 'Boston', 'Chicago', 'Dallas', 'Denver',
    'Houston', 'Los Angeles', 'Miami', 'New York', 'Philadelphia',
    'Phoenix', 'San Antonio', 'San Diego', 'San Jose', 'Seattle'
  ].includes(city));

  const italianCities = allCities.filter(city => [
    'Bari', 'Bologna', 'Catania', 'Florence', 'Genoa',
    'Messina', 'Milan', 'Naples', 'Padua', 'Palermo',
    'Rome', 'Trieste', 'Turin', 'Venice', 'Verona'
  ].includes(city));

  // If a city is selected, show only that city's spotlights
  if (selectedCityView) {
    const citySpotlights = spotlightsByCity?.[selectedCityView] || [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCityView(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cities
            </Button>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {usCities.includes(selectedCityView) ? '🇺🇸' : '🇮🇹'} {selectedCityView} Spotlights
            </h2>
          </div>
          <Button onClick={() => {
            setSelectedCity(selectedCityView);
            setShowAddForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Add Form for specific city */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Location to {selectedCityView} Spotlight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Select Location</Label>
                <select
                  id="location"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                >
                  <option value="">Choose a location...</option>
                  {locations?.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.title} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority (higher number = higher priority)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddSpotlight} 
                  disabled={isSubmitting || !selectedLocationId}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Spotlight"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* City's spotlight locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {citySpotlights.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-gray-500">
                No spotlight locations set for {selectedCityView} yet.
              </CardContent>
            </Card>
          ) : (
            citySpotlights.map((spotlight) => (
              <Card key={spotlight.id}>
                {spotlight.location.images?.[0] && (
                  <img
                    src={spotlight.location.images[0]}
                    alt={spotlight.location.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{spotlight.location.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{spotlight.location.address}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">
                      Priority: {spotlight.priority}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Active until {format(new Date(spotlight.endDate), "MMM d, yyyy")}
                  </p>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => handleRemoveSpotlight(spotlight.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main city grid view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">City-Based Spotlight Locations</h2>
      </div>

      {/* City Grid View */}
      {isLoading ? (
        <div className="flex justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* US Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🇺🇸 United States Cities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {usCities.map((city) => {
                const count = spotlightsByCity?.[city]?.length || 0;
                return (
                  <Card 
                    key={city} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCityView(city)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg">{city}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {count} spotlight{count !== 1 ? 's' : ''}
                        </span>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Italian Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🇮🇹 Italian Cities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {italianCities.map((city) => {
                const count = spotlightsByCity?.[city]?.length || 0;
                return (
                  <Card 
                    key={city} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCityView(city)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg">{city}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {count} spotlight{count !== 1 ? 's' : ''}
                        </span>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}