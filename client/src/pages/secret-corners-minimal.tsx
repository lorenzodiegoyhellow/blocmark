import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Camera, Clock, X } from "lucide-react";
import { useLocation } from "wouter";

// Minimal structure that avoids complex dependencies
export default function SecretCornersMinimal() {
  // Basic navigation
  const [, navigate] = useLocation();
  
  // Dummy data for testing
  const locations = [
    {
      id: 1,
      name: "Hidden Waterfall",
      description: "A beautiful hidden waterfall in the mountains.",
      location: "Mountain Range, California",
      category: "natural",
      image: "/attached_assets/1.jpg",
      bestTimeOfDay: "Morning"
    },
    {
      id: 2, 
      name: "Abandoned Factory",
      description: "An industrial relic from the past century.",
      location: "Old Industrial District, Detroit",
      category: "abandoned",
      image: "/attached_assets/2.png",
      bestTimeOfDay: "Afternoon"
    },
    {
      id: 3,
      name: "Coastal Cave",
      description: "A magnificent sea cave accessible only at low tide.",
      location: "Northern Coast, Oregon",
      category: "beach",
      image: "/attached_assets/3.jpg",
      bestTimeOfDay: "Sunset"
    }
  ];
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Categories for filtering
  const CATEGORIES = [
    { id: "abandoned", name: "Abandoned" },
    { id: "natural", name: "Natural" },
    { id: "beach", name: "Beach" }
  ];
  
  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      // Filter by category
      const matchesCategory = !activeCategory || location.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, activeCategory]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
  };
  
  // Simple card component
  const LocationCard = ({ location }: { location: any }) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {location.image ? (
          <img 
            src={location.image} 
            alt={location.name} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Camera className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="mb-2 bg-primary/80 hover:bg-primary">{location.category}</Badge>
          <h3 className="text-lg font-semibold text-white">{location.name}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="truncate">{location.location}</span>
          </div>
          {location.bestTimeOfDay && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>{location.bestTimeOfDay}</span>
            </div>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {location.description}
        </p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secret Corners Minimal</h1>
          <p className="mt-1 text-muted-foreground">
            Minimal test version with static data
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button size="sm" variant="outline" onClick={() => navigate('/secret-corners')}>
            Go to Full Version
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setActiveCategory(
                  activeCategory === category.id ? null : category.id
                )}
              >
                {category.name}
              </Badge>
            ))}
            {(searchQuery || activeCategory) && (
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Location grid */}
      {filteredLocations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map(location => (
            <div key={location.id}>
              <LocationCard location={location} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No Locations Found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any locations matching your search criteria.
          </p>
          <Button onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}