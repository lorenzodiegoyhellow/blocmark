import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Sparkles,
  Lightbulb,
  Camera,
  Filter,
  ArrowRight,
  Clock,
  CircleDollarSign,
  Users,
  Loader2,
  AlertCircle
} from "lucide-react";

// Simple type definitions
type LocationRecommendation = {
  type: string;
  features: string[];
  priceRange: { min: number; max: number };
  description: string;
  suitability: number;
  idealFor: string[];
  nearbyAmenities: string[];
  bestTimeToBook: string[];
  photographyTips?: string[];
};

type AISearchResults = {
  matches: LocationRecommendation[];
  userPreferences: {
    budget: { min: number; max: number };
    style: string[];
    requirements: string[];
  };
};

export default function AISearchResultsNew() {
  // State
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("matches");
  const [showTips, setShowTips] = useState(true);
  const [results, setResults] = useState<AISearchResults | null>(null);
  const { toast } = useToast();
  
  // Debug log
  console.log("AI SEARCH PAGE LOADED");
  console.log("Query:", query);
  
  // Effect to load search results when query changes
  useEffect(() => {
    if (!query) {
      console.log("No query found");
      return;
    }
    
    console.log("Loading search results for:", query);
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      let mockData = generateMockResults(query);
      console.log("Setting results:", mockData);
      setResults(mockData);
      setLoading(false);
    }, 1000);
  }, [query]);
  
  // Generate mock results based on query
  const generateMockResults = (query: string): AISearchResults => {
    const queryLower = query.toLowerCase();
    
    // Different response templates based on query content
    if (queryLower.includes("mansion") || queryLower.includes("luxury")) {
      return {
        matches: [
          {
            type: "Luxury Mansion",
            features: ["Elegant Interior", "Spacious Rooms", "Premium Finishes", "Outdoor Area"],
            priceRange: { min: 500, max: 1200 },
            description: "Luxurious mansion with elegant interiors and premium amenities for upscale productions and events.",
            suitability: 0.96,
            idealFor: ["Luxury Brand Shoots", "High-End Campaigns", "Exclusive Events"],
            nearbyAmenities: ["Garden", "Pool", "Private Parking"],
            bestTimeToBook: ["Morning Golden Hour", "Weekdays"],
            photographyTips: ["The main hall gets beautiful light in the morning"]
          },
          {
            type: "Upscale Villa",
            features: ["Luxury Design", "Pool Area", "Premium Kitchen", "Garden"],
            priceRange: { min: 450, max: 900 },
            description: "Elegant villa with modern amenities and stylish design elements perfect for luxury lifestyle content.",
            suitability: 0.82,
            idealFor: ["Premium Lifestyle Shoots", "Brand Content", "Product Launches"],
            nearbyAmenities: ["Catering Available", "Valet Parking", "Styling Services"],
            bestTimeToBook: ["Golden Hour", "Weekdays"],
            photographyTips: ["Excellent lighting throughout most of the day in main areas"]
          }
        ],
        userPreferences: {
          budget: { min: 450, max: 1200 },
          style: ["Luxury", "Elegant", "High-End"],
          requirements: ["Premium Finishes", "Spacious Rooms", "Privacy"]
        }
      };
    } 
    else if (queryLower.includes("studio") || queryLower.includes("photo")) {
      return {
        matches: [
          {
            type: "Professional Photo Studio",
            features: ["Cyclorama Wall", "Lighting Equipment", "Multiple Backdrops", "Professional Setup"],
            priceRange: { min: 200, max: 450 },
            description: "Professional photo studio with comprehensive equipment and controlled lighting for serious productions.",
            suitability: 0.95,
            idealFor: ["Commercial Photography", "Professional Portraits", "Product Shoots"],
            nearbyAmenities: ["Equipment Rental", "Makeup Area", "Changing Room"],
            bestTimeToBook: ["Anytime - Controlled Environment"],
            photographyTips: ["Book additional time for complex lighting setups"]
          },
          {
            type: "Natural Light Studio",
            features: ["Floor-to-Ceiling Windows", "White Walls", "Wooden Floors", "Minimal Design"],
            priceRange: { min: 150, max: 300 },
            description: "Bright studio space with excellent natural lighting from large windows - perfect for lifestyle and portrait photography.",
            suitability: 0.85,
            idealFor: ["Portrait Photography", "Lifestyle Shoots", "Small Product Photography"],
            nearbyAmenities: ["Restrooms", "Coffee Shop Nearby", "Street Parking"],
            bestTimeToBook: ["Morning to Early Afternoon"],
            photographyTips: ["Best light is typically between 10am-2pm depending on the season"]
          }
        ],
        userPreferences: {
          budget: { min: 150, max: 450 },
          style: ["Professional", "Clean", "Functional"],
          requirements: ["Good Lighting", "Equipment Access", "Privacy"]
        }
      };
    }
    else {
      // Default response
      return {
        matches: [
          {
            type: "Multipurpose Studio",
            features: ["Natural Light", "High Ceilings", "White Walls", "Wooden Floors"],
            priceRange: { min: 150, max: 350 },
            description: "Versatile studio space with excellent natural lighting ideal for photography and small productions.",
            suitability: 0.92,
            idealFor: ["Product Photography", "Portrait Sessions", "Small Brand Shoots"],
            nearbyAmenities: ["Parking", "Cafes", "Equipment Rental"],
            bestTimeToBook: ["Weekday Mornings", "Early Afternoons"],
            photographyTips: ["Use the north-facing windows for consistent soft light throughout the day"]
          },
          {
            type: "Cozy Apartment",
            features: ["Home Setting", "Natural Light", "Modern Decor", "Full Kitchen"],
            priceRange: { min: 120, max: 280 },
            description: "Well-designed apartment with homey atmosphere perfect for lifestyle and product photography.",
            suitability: 0.84,
            idealFor: ["Lifestyle Shoots", "Product Photography", "Influencer Content"],
            nearbyAmenities: ["Public Transit", "Cafes", "Parking"],
            bestTimeToBook: ["Mornings", "Early Afternoons"],
            photographyTips: ["Living room gets great natural light in the morning"]
          }
        ],
        userPreferences: {
          budget: { min: 120, max: 350 },
          style: ["Modern", "Clean", "Versatile"],
          requirements: ["Good Lighting", "Convenient Location", "Flexible Hours"]
        }
      };
    }
  };
  
  // Handle new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    
    // Update URL with new search query
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("mode", "ai");
    setLocation(`/ai-search-new?${params.toString()}`);
  };
  
  // Handle click on recommendation
  const handleRecommendationClick = (type: string) => {
    console.log("User clicked on recommendation:", type);
    // We would link to actual locations here in a real implementation
    toast({
      title: `Exploring "${type}" locations`,
      description: "This would normally take you to matching locations",
    });
  };
  
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Search header */}
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                <h1 className="text-2xl font-bold">AI Enhanced Location Search</h1>
              </div>
              
              {/* Search form */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
                    placeholder="Describe your ideal location in detail..."
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="px-4" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Search
                    </span>
                  )}
                </Button>
              </form>
              
              {/* Search query display */}
              {query && !loading && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Showing results for: 
                  </p>
                  <Badge variant="outline" className="font-normal">
                    {query}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Tips panel */}
          {showTips && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Better Search Tips</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      For better results, include details such as:
                    </p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• Type of space (studio, warehouse, house, etc.)</li>
                      <li>• Specific features you need (natural light, high ceilings)</li>
                      <li>• Purpose (photography, filming, event)</li>
                      <li>• Budget range and location preferences</li>
                    </ul>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTips(false)}
                    className="h-8 text-xs"
                  >
                    Hide
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing your search...</p>
            </div>
          ) : (
            <>
              {/* Results display */}
              {results && (
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="matches">
                          Matches ({results.matches?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="preferences">
                          Your Preferences
                        </TabsTrigger>
                      </TabsList>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => setLocation("/search")}
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Standard Filters
                      </Button>
                    </div>
                    
                    {/* Matches tab */}
                    <TabsContent value="matches" className="mt-0">
                      <div className="space-y-4">
                        {results.matches?.map((match, index) => (
                          <Card 
                            key={index} 
                            className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => handleRecommendationClick(match.type)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{match.type}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {match.suitability > 0.9 
                                      ? "Perfect match for your needs" 
                                      : match.suitability > 0.7 
                                        ? "Great match for your needs" 
                                        : "Good match for your needs"}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">Match</div>
                                  <div className="flex items-center gap-2">
                                    <Progress value={match.suitability * 100} className="h-2 w-16" />
                                    <span className="text-sm">{Math.round(match.suitability * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">{match.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <CircleDollarSign className="h-3 w-3 mr-1" /> Price Range
                                  </span>
                                  <span className="text-sm font-medium">
                                    ${match.priceRange.min} - ${match.priceRange.max}/day
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> Best Time to Book
                                  </span>
                                  <span className="text-sm font-medium">
                                    {match.bestTimeToBook.slice(0, 2).join(", ")}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Users className="h-3 w-3 mr-1" /> Ideal For
                                  </span>
                                  <span className="text-sm font-medium">
                                    {match.idealFor.slice(0, 2).join(", ")}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Features</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {match.features.map((feature, i) => (
                                      <Badge key={i} variant="outline" className="font-normal text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                {match.photographyTips && (
                                  <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                                      <Camera className="h-3 w-3 mr-1" /> Photography Tips
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {match.photographyTips[0]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {/* Preferences tab */}
                    <TabsContent value="preferences" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Search Preferences</CardTitle>
                          <CardDescription>
                            Based on your search, we've identified these preferences
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Budget Range</h3>
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-muted rounded-md flex items-center">
                                <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium">
                                  ${results.userPreferences?.budget.min} - ${results.userPreferences?.budget.max}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">per day</span>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Style Preferences</h3>
                            <div className="flex flex-wrap gap-2">
                              {results.userPreferences?.style.map((style, i) => (
                                <Badge key={i} className="px-3 py-1">
                                  {style}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Requirements</h3>
                            <div className="flex flex-wrap gap-2">
                              {results.userPreferences?.requirements.map((req, i) => (
                                <Badge key={i} variant="outline" className="px-3 py-1">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* No results state */}
              {!results && query && !loading && (
                <div className="text-center py-12 border rounded-lg">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Results Found</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We couldn't find any matches for your search. Try using more specific terms or
                    check out our available locations.
                  </p>
                  <Button onClick={() => setLocation("/search")}>
                    Browse All Locations
                  </Button>
                </div>
              )}
              
              {/* Empty state */}
              {!query && !loading && (
                <div className="text-center py-12 border rounded-lg">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Describe Your Ideal Location</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Use the search bar above to describe what you're looking for in detail.
                    Our AI will analyze your needs and suggest the best matches.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => setSearchQuery("photography studio with natural light")}>
                      Photo Studio
                    </Button>
                    <Button variant="outline" onClick={() => setSearchQuery("luxury mansion for high-end photoshoot")}>
                      Luxury Space
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}