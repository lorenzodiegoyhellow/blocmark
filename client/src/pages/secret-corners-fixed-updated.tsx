import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SimpleSecretLocationForm } from "@/components/map/simple-secret-location-form";
import { Plus, Search, MapPin, Camera, Map as MapIcon, List, User, X, Calendar, ArrowLeft, Send, MessageSquare, Image as ImageIcon } from "lucide-react";
import { LatLngExpression, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FixedMapContainer } from "@/components/map/fixed-map-container";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LocationCard } from "@/components/secret-corners/location-card";
// Import the community components
import { CommunityForum } from "@/components/secret-corners/community-forum";
import { TopContributors } from "@/components/secret-corners/top-contributors";
import { WeeklyChallenge } from "@/components/secret-corners/weekly-challenge";
import { 
  mockContributors, 
  mockForumCategories, 
  mockForumPosts, 
  mockForumComments, 
  mockWeeklyChallenge 
} from "@/components/secret-corners/mock-data";
// import { SavedLists } from "@/components/secret-corners/saved-lists";

// Create custom icon for markers
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

// This is the same as the original except with updated FixedMapContainer components
export default function SecretCornersFixed() {
  // Get authentication and location state
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  // Console logging for debugging
  console.log('User auth data:', user);
  console.log('User is admin:', isAdmin);
  console.log('User roles:', user?.roles);
  
  // Skip access check for admin users
  const skipAccessCheck = isAdmin;
  
  // Show content directly for admin users without checking access
  const [adminHasAccess, setAdminHasAccess] = useState(false);
  // Track if approved user has access
  const [approvedUserHasAccess, setApprovedUserHasAccess] = useState(false);
  // Track if access check has completed
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  
  // State (only initialize these once we know the user has access)
  const [view, setView] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [userLocations, setUserLocations] = useState<SecretLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [activeTab, setActiveTab] = useState("featured"); // "featured", "submitted", "all"
  const [selectedLocation, setSelectedLocation] = useState<SecretLocation | null>(null);
  const [showLocationDetailsModal, setShowLocationDetailsModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Comments state (placeholder until API implementation)
  const [locationComments, setLocationComments] = useState<{
    [locationId: number]: Array<{
      id: number;
      userId: number;
      username: string;
      text: string;
      createdAt: string;
    }>
  }>({});
  
  // Add proper auth redirect for non-logged in users
  useEffect(() => {
    if (!user) {
      console.log('No user detected, redirecting to login page');
      navigate('/auth?redirect=/secret-corners');
    } else {
      console.log('User detected, will check access status in next step');
    }
  }, [user, navigate]);
  
  // Set admin access immediately when we detect admin role
  useEffect(() => {
    if (isAdmin && user) {
      console.log('ADMIN USER DETECTED - Bypassing access check');
      setAdminHasAccess(true);
      setAccessCheckComplete(true);
    }
  }, [isAdmin, user]);
  
  // Check user's access to Secret Corners (only for non-admin users)
  const {
    data: accessData,
    isLoading: isCheckingAccess
  } = useQuery({
    queryKey: ['/api/secret-corners/access'],
    queryFn: async () => {
      try {
        // For admins, we can just return a successful access object without calling the API
        if (isAdmin) {
          console.log('Admin user - returning success without API call');
          return { 
            hasAccess: true, 
            status: 'admin', 
            message: 'Admin access granted' 
          };
        }
        
        // For non-admin users, check with the server
        const response = await fetch('/api/secret-corners/access');
        if (!response.ok) {
          throw new Error('Failed to check Secret Corners access');
        }
        const data = await response.json();
        
        // Debug server response with detailed information
        console.log('SECRET CORNERS ACCESS RESPONSE:', {
          data,
          hasAccess: data.hasAccess,
          status: data.status,
          responseStatus: response.status,
          responseOk: response.ok
        });
        
        // If the user has access, set the state variable
        if (data.hasAccess) {
          console.log('Setting approved user access to TRUE');
          setApprovedUserHasAccess(true);
        }
        
        // Mark access check as complete
        setAccessCheckComplete(true);
        
        // Only redirect if user doesn't have access and isn't an admin
        if (!isAdmin && !data.hasAccess) {
          console.log('No access detected, redirecting to application page');
          navigate('/secret-corners-apply');
        } else {
          console.log('User has access to Secret Corners:', data);
        }
        
        return data;
      } catch (error) {
        console.error('Error checking Secret Corners access:', error);
        // Redirect on error as well for non-admin users
        if (!isAdmin) {
          console.log('Error in access check, redirecting to application page');
          navigate('/secret-corners-apply');
        }
        
        // Mark access check as complete even on error
        setAccessCheckComplete(true);
        
        return { hasAccess: false, status: 'not_applied' };
      }
    },
    enabled: !!user && !skipAccessCheck, // Only run this query for non-admin logged-in users
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache this response (formerly called cacheTime)
  });
  
  // If the user doesn't have approved access, redirect to the appropriate page
  useEffect(() => {
    // If no user is available yet, don't do anything
    if (!user) return;
    
    // Admin bypass - if user is admin, we don't need to do any redirects
    if (isAdmin) {
      console.log('Admin access granted directly to Secret Corners');
      return; // Admin can access, so don't redirect
    }
    
    // For non-admin users, check if we're still loading access data
    if (isCheckingAccess) {
      console.log('Still checking access status...');
      return;
    }
    
    // Now handle the access check for regular users
    if (accessData) {
      console.log('ACCESS CHECK DATA:', accessData);
      
      // For non-admin users, check access status
      if (!accessData.hasAccess) {
        if (accessData.status === 'pending') {
          // If their application is pending, show a toast and redirect
          toast({
            title: "Application In Review",
            description: "Your Secret Corners application is still being reviewed. We'll notify you when it's approved.",
          });
          navigate('/secret-corners-apply');
        } else if (accessData.status === 'rejected') {
          // If their application was rejected, show a toast and redirect
          toast({
            title: "Access Denied",
            description: "Your Secret Corners application was not approved. You can apply again with more details.",
            variant: "destructive"
          });
          navigate('/secret-corners-apply');
        } else {
          // If they haven't applied yet, redirect to the application page
          navigate('/secret-corners-apply');
        }
      }
    } else if (!isCheckingAccess && !isAdmin) {
      // Default redirect for non-admin users if access data is not available
      console.log('No access data available - redirecting non-admin user to application page');
      navigate('/secret-corners-apply');
    }
  }, [accessData, isCheckingAccess, navigate, toast, isAdmin, user]);
  
  // Show a loading state while checking auth or access status
  // Skip loading if user is admin or has approved access
  if ((authLoading || (isCheckingAccess && !skipAccessCheck)) && !adminHasAccess && !approvedUserHasAccess && !accessCheckComplete) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium mb-2">Checking access...</h2>
            <p className="text-muted-foreground">Please wait while we verify your access to Secret Corners.</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // If access check is complete and user has no access (not admin, not approved)
  if (accessCheckComplete && !adminHasAccess && !approvedUserHasAccess && !isAdmin) {
    console.log("Access check complete, but user has no access - redirecting");
    navigate('/secret-corners-apply');
    return null;
  }
  
  // Use React Query to load approved secret locations
  const queryClient = useQueryClient();
  
  // Query for fetching comments for a location
  const fetchComments = (locationId: number) => {
    return useQuery({
      queryKey: [`/api/secret-locations/${locationId}/comments`],
      queryFn: async () => {
        try {
          const response = await fetch(`/api/secret-locations/${locationId}/comments`);
          if (!response.ok) {
            throw new Error('Failed to fetch comments');
          }
          return await response.json();
        } catch (error) {
          console.error('Error fetching comments:', error);
          throw error;
        }
      },
      enabled: false, // Don't run the query automatically
    });
  };
  
  // Effect to fetch comments when a location is selected
  useEffect(() => {
    if (selectedLocation && selectedLocation.id) {
      // This would be a real API call in a complete implementation
      // For now we'll just simulate with local state
      console.log("Would fetch comments for location:", selectedLocation.id);
      
      // In a real implementation:
      // const { refetch } = fetchComments(selectedLocation.id);
      // refetch();
    }
  }, [selectedLocation]);
  
  // Mutation for posting comments
  const commentMutation = useMutation({
    mutationFn: async ({ locationId, text }: { locationId: number, text: string }) => {
      try {
        const response = await fetch(`/api/secret-locations/${locationId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to post comment');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries that might be affected by this mutation
      queryClient.invalidateQueries({ queryKey: ['/api/secret-locations'] });
      
      // Clear comment text
      setCommentText("");
      
      // Show success toast
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Query for user's own submitted pending locations
  const {
    data: submittedLocations = [],
    isLoading: isLoadingSubmitted,
    refetch: refetchSubmitted
  } = useQuery({
    queryKey: ['/api/secret-locations/user/mine'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-locations/user/mine');
        if (!response.ok) {
          throw new Error('Failed to fetch your submitted locations');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching submitted locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your submitted locations',
          variant: 'destructive'
        });
        return [];
      }
    },
    refetchOnWindowFocus: true
  });
  
  // Query for all approved secret locations
  const {
    data: approvedLocations = [],
    isLoading: isLoadingApproved,
    refetch: refetchApproved
  } = useQuery({
    queryKey: ['/api/secret-locations'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-locations');
        if (!response.ok) {
          throw new Error('Failed to fetch approved locations');
        }
        
        const data = await response.json();
        console.log('Successfully fetched approved locations:', data);
        return data;
      } catch (error) {
        console.error('Error fetching approved locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load approved locations',
          variant: 'destructive'
        });
        return [];
      }
    },
    refetchOnWindowFocus: true
  });
  
  // Query for featured locations
  const {
    data: featuredLocations = [],
    isLoading: isLoadingFeatured,
    refetch: refetchFeatured
  } = useQuery({
    queryKey: ['/api/secret-locations/featured'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/secret-locations/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured locations');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching featured locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load featured locations',
          variant: 'destructive'
        });
        return [];
      }
    },
    refetchOnWindowFocus: true
  });
  
  // Calculate all locations and filter them
  const allLocations = [...approvedLocations];
  
  // Set up locations based on the active tab
  const currentTabLocations = 
    activeTab === "featured" ? featuredLocations : 
    activeTab === "submitted" ? submittedLocations : 
    allLocations;
  
  // Set loading state based on current tab
  const isCurrentTabLoading = 
    activeTab === "featured" ? isLoadingFeatured : 
    activeTab === "submitted" ? isLoadingSubmitted : 
    isLoadingApproved;
  
  // Handle filtering based on search query and category
  const filteredLocations = currentTabLocations.filter(location => {
    // Filter by search query
    const matchesQuery = !searchQuery || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = !activeCategory || location.category === activeCategory;
    
    // Return true if passes both filters
    return matchesQuery && matchesCategory;
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
  };
  
  // Button click handlers
  const handleAddLocation = () => {
    setShowAddLocationModal(true);
  };
  
  const handleSuccessfulSubmission = (newLocation: SecretLocation) => {
    // Close the modal
    setShowAddLocationModal(false);
    
    // Show success toast
    toast({
      title: "Location Submitted",
      description: "Your secret location has been submitted for review.",
      variant: "default"
    });
    
    // Refetch the user's submitted locations to show the new one
    refetchSubmitted();
    
    // Switch to the submitted tab to show the user their submission
    setActiveTab("submitted");
  };
  
  const handleLocationSelect = (location: any) => {
    console.log("Selected location:", location);
    
    // Convert Location type to SecretLocation if needed
    const secretLocation: SecretLocation = {
      id: location.id,
      name: location.name,
      description: location.description,
      location: location.location,
      category: location.category,
      coords: location.coords,
      comments: location.comments || 0,
      images: location.images || [location.image],
      image: location.image,
      bestTimeOfDay: location.bestTimeOfDay || "",
      recommendedEquipment: location.recommendedEquipment || "",
      compositionTip: location.compositionTip || "",
      status: location.status || "approved",
      createdAt: location.createdAt || new Date().toISOString(),
      userId: location.userId || 0,
      userName: location.userName || "Unknown User",
    };
    
    setSelectedLocation(secretLocation);
    setShowLocationDetailsModal(true);
  };
  
  // Get centroid of locations for map center, or use default
  const mapCenter: LatLngExpression = 
    filteredLocations.length > 0 && filteredLocations[0].coords ? 
    filteredLocations[0].coords : 
    [34.0522, -118.2437]; // Default to Los Angeles
  
  // Count locations by category
  const locationsByCategory = allLocations.reduce((acc, location) => {
    const category = location.category;
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedCategories = CATEGORIES.map(cat => ({
    ...cat,
    count: locationsByCategory[cat.id] || 0
  })).sort((a, b) => b.count - a.count);
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Secret Corners</h1>
            <p className="text-muted-foreground">
              Discover hidden gems and photography hotspots exclusive to our community.
            </p>
          </div>
          
          <Button onClick={handleAddLocation} className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-3/4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                className="pl-10"
                placeholder="Search secret locations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/4 flex gap-2">
            <Button 
              variant={view === "map" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setView("map")}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
            <Button 
              variant={view === "list" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          <div className="lg:border-r pr-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                <Button
                  variant={activeCategory === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(null)}
                >
                  All Categories
                  <Badge variant="secondary" className="ml-auto">
                    {allLocations.length}
                  </Badge>
                </Button>
                
                {sortedCategories.map((category) => (
                  category.count > 0 && (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  )
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Status</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  Approved
                  <Badge variant="secondary" className="ml-auto">
                    {approvedLocations.length}
                  </Badge>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  Pending
                  <Badge variant="secondary" className="ml-auto">
                    {submittedLocations.filter(loc => loc.status === "pending").length}
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="all">All Locations</TabsTrigger>
                <TabsTrigger value="submitted">My Submissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="featured" className="mt-0">
                {isCurrentTabLoading ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading featured locations...</p>
                  </div>
                ) : filteredLocations.length > 0 ? (
                  view === "map" ? (
                    <div className="aspect-[16/9] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <FixedMapContainer 
                        locations={filteredLocations}
                        center={mapCenter}
                        zoom={13}
                        onViewDetails={handleLocationSelect}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredLocations.map((location) => (
                        <LocationCard 
                          key={location.id} 
                          location={location}
                          onClick={handleLocationSelect}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Featured Locations Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || activeCategory ? 
                        "We couldn't find any featured locations matching your search criteria." :
                        "There are no featured locations available at the moment."}
                    </p>
                    <Button onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="mt-0">
                {view === "map" ? (
                  <div className="aspect-[16/9] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {!isCurrentTabLoading ? (
                      <FixedMapContainer 
                        locations={filteredLocations}
                        center={mapCenter}
                        zoom={13}
                        onViewDetails={handleLocationSelect}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        {isCurrentTabLoading ? (
                          <div className="text-center">
                            <div className="mb-4">
                              <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                            </div>
                            <p className="text-muted-foreground">Loading all locations...</p>
                          </div>
                        ) : (
                          <div className="text-center p-8">
                            <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                              <MapIcon className="h-8 w-8 text-muted-foreground" />
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
                    )}
                  </div>
                ) : (
                  <div>
                    {isCurrentTabLoading ? (
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground">Loading all locations...</p>
                      </div>
                    ) : filteredLocations.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredLocations.map((location) => (
                          <LocationCard 
                            key={location.id} 
                            location={location} 
                            onClick={handleLocationSelect} 
                          />
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
                )}
              </TabsContent>
              
              <TabsContent value="submitted" className="mt-0">
                {isCurrentTabLoading ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading your submitted locations...</p>
                  </div>
                ) : filteredLocations.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredLocations.map((location) => (
                      <LocationCard 
                        key={location.id} 
                        location={location} 
                        onClick={handleLocationSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <div className="mb-4 p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any secret locations yet. Share your favorite photography spots with the community.
                    </p>
                    <Button onClick={() => setShowAddLocationModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Enhanced community section */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Community Forum</CardTitle>
                </CardHeader>
                <CardContent>
                  <CommunityForum 
                    categories={mockForumCategories} 
                    posts={mockForumPosts} 
                  />
                </CardContent>
              </Card>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopContributors 
                      contributors={mockContributors} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Weekly Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeeklyChallenge 
                      title={mockWeeklyChallenge.title}
                      description={mockWeeklyChallenge.description}
                      startDate={mockWeeklyChallenge.startDate}
                      endDate={mockWeeklyChallenge.endDate}
                      previousWinner={mockWeeklyChallenge.previousWinner ? {
                        id: mockWeeklyChallenge.previousWinner.id,
                        locationName: mockWeeklyChallenge.previousWinner.photoTitle,
                        userName: mockWeeklyChallenge.previousWinner.name,
                        image: mockWeeklyChallenge.previousWinner.photoUrl
                      } : undefined}
                      onSubmitClick={() => setShowAddLocationModal(true)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add location form modal */}
        <SimpleSecretLocationForm 
          isOpen={showAddLocationModal}
          onClose={() => setShowAddLocationModal(false)}
          onSuccess={handleSuccessfulSubmission}
        />
        
        {/* Enhanced Location details modal */}
        <Dialog open={showLocationDetailsModal} onOpenChange={setShowLocationDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-xl">
            {selectedLocation && (
              <div>
                {/* Hero image with overlaid title */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-3xl font-bold tracking-tight mb-1">{selectedLocation.name}</h2>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="opacity-90">{selectedLocation.location}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge variant="outline" className="bg-white/80 shadow-md">{selectedLocation.status}</Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                    {/* Main content */}
                    <div>
                      {/* Image gallery thumbnails - only show additional images */}
                      {selectedLocation.images && selectedLocation.images.length > 1 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium mb-3 uppercase tracking-wide text-muted-foreground flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            More Photos
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedLocation.images.slice(1).map((img, i) => (
                              <div 
                                key={i} 
                                className="aspect-video rounded-md overflow-hidden bg-muted border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                onClick={() => {
                                  // This would open a full-screen gallery in production
                                  console.log("Open full screen image:", img);
                                }}
                              >
                                <img 
                                  src={img} 
                                  alt={`${selectedLocation.name} - ${i+1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Main details */}
                      <div className="mb-8">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge>{selectedLocation.category}</Badge>
                          <Badge variant="outline">{selectedLocation.status}</Badge>
                        </div>
                        
                        {selectedLocation.userName && (
                          <p className="text-sm flex items-center mb-4">
                            <User className="h-4 w-4 mr-2" />
                            Submitted by{" "}
                            <a 
                              href={`/users/${selectedLocation.userId}`} 
                              className="ml-1 text-primary hover:underline font-medium"
                            >
                              {selectedLocation.userName}
                            </a>
                          </p>
                        )}
                        
                        <Separator className="my-4" />
                        
                        <h2 className="text-xl font-semibold mb-3">About this location</h2>
                        
                        {/* Location details */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">Address:</span>
                              <span className="ml-2 text-muted-foreground">{selectedLocation.location}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <MapIcon className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">Coordinates:</span>
                              <span className="ml-2 font-mono text-xs text-muted-foreground">
                                {selectedLocation.coords && Array.isArray(selectedLocation.coords) 
                                  ? `${selectedLocation.coords[0].toFixed(6)}, ${selectedLocation.coords[1].toFixed(6)}`
                                  : "Not available"}
                              </span>
                            </div>
                            
                            {selectedLocation.userName && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium">Submitted by:</span>
                                <a 
                                  href={`/users/${selectedLocation.userId}`}
                                  className="ml-2 text-primary hover:underline"
                                >
                                  {selectedLocation.userName}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="mb-4 leading-relaxed whitespace-pre-line">
                          {selectedLocation.description}
                        </p>
                        
                        {/* Photography Tips section - now part of About this location */}
                        {(selectedLocation.bestTimeOfDay || selectedLocation.recommendedEquipment || selectedLocation.compositionTip) && (
                          <Card className="mb-6 border-muted bg-white">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Photography Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedLocation.bestTimeOfDay && (
                                <div className="mb-3">
                                  <h4 className="font-medium mb-1 flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                    Best Time of Day
                                  </h4>
                                  <p className="text-muted-foreground text-sm pl-6">{selectedLocation.bestTimeOfDay}</p>
                                </div>
                              )}
                              
                              {selectedLocation.recommendedEquipment && (
                                <div className="mb-3">
                                  <h4 className="font-medium mb-1 flex items-center text-sm">
                                    <Camera className="h-4 w-4 mr-2 text-primary" />
                                    Recommended Equipment
                                  </h4>
                                  <p className="text-muted-foreground text-sm pl-6">{selectedLocation.recommendedEquipment}</p>
                                </div>
                              )}
                              
                              {selectedLocation.compositionTip && (
                                <div>
                                  <h4 className="font-medium mb-1 flex items-center text-sm">
                                    <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <rect x="2" y="2" width="20" height="20" rx="2" />
                                        <rect x="8" y="8" width="8" height="8" rx="1" />
                                      </svg>
                                    </div>
                                    Composition Tips
                                  </h4>
                                  <p className="text-muted-foreground text-sm pl-6">{selectedLocation.compositionTip}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                    
                    {/* Sidebar content */}
                    <div>
                      {/* Map section */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3 uppercase tracking-wide text-muted-foreground flex items-center">
                          <MapIcon className="h-4 w-4 mr-2" />
                          Location Map
                        </h3>
                        
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          {selectedLocation.coords && (
                            <FixedMapContainer
                              locations={[selectedLocation]}
                              center={selectedLocation.coords}
                              zoom={15}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Tags section */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3 uppercase tracking-wide text-muted-foreground">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{selectedLocation.category}</Badge>
                          <Badge variant="outline">Photography</Badge>
                          <Badge variant="outline">Secret</Badge>
                          {selectedLocation.bestTimeOfDay?.includes("Sunrise") && (
                            <Badge variant="outline">Sunrise</Badge>
                          )}
                          {selectedLocation.bestTimeOfDay?.includes("Sunset") && (
                            <Badge variant="outline">Sunset</Badge>
                          )}
                          {selectedLocation.bestTimeOfDay?.includes("Night") && (
                            <Badge variant="outline">Night</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Nearby locations would be here in a real implementation */}
                      
                      {/* Travel information would be here in a real implementation */}
                    </div>
                  </div>
                  
                  {/* Comments section */}
                  <div className="mt-6 pt-6 border-t">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Comments ({selectedLocation.comments || 0})
                    </h2>
                    
                    {/* Display comments for the current location */}
                    <div className="space-y-4 mb-6">
                      {locationComments[selectedLocation.id]?.length > 0 ? (
                        locationComments[selectedLocation.id].map((comment) => (
                          <div className="flex gap-3" key={comment.id}>
                            <Avatar>
                              <AvatarFallback>
                                {comment.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{comment.username}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 border border-dashed rounded-md">
                          <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No comments yet. Be the first to share your experience!</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Comment form */}
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>ME</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Add a comment..." 
                          className="mb-2 resize-none"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (!commentText.trim()) return;
                              
                              // Use the React Query mutation
                              commentMutation.mutate({ 
                                locationId: selectedLocation.id, 
                                text: commentText 
                              }, {
                                onSuccess: (data) => {
                                  // Success is already handled in the mutation, but we'll also
                                  // update the local state to show the comment immediately
                                  const newComment = {
                                    id: Date.now(), // This will be replaced when we fetch comments
                                    userId: 1, // This would come from authentication context
                                    username: "You", // This would come from authentication context
                                    text: commentText,
                                    createdAt: new Date().toISOString()
                                  };
                                  
                                  // Update local comments state
                                  setLocationComments(prev => ({
                                    ...prev,
                                    [selectedLocation.id]: [
                                      ...(prev[selectedLocation.id] || []),
                                      newComment
                                    ]
                                  }));
                                }
                              });
                            }}
                            disabled={!commentText.trim() || commentMutation.isPending}
                          >
                            {commentMutation.isPending ? (
                              <>Loading...</>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Post
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Secret location types and constants
type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;  // This is the address field
  category: string;
  coords: [number, number];
  comments: number;
  images: string[];  // Now an array of image URLs or data URLs
  image: string;     // Main image (kept for backward compatibility)
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
};

// Empty array for featured locations - these should come from the database
const FEATURED_LOCATIONS: SecretLocation[] = [];

// Categories for filtering
const CATEGORIES = [
  { id: "abandoned", name: "Abandoned" },
  { id: "urban", name: "Urban" },
  { id: "natural", name: "Natural" },
  { id: "beach", name: "Beach" },
  { id: "forest", name: "Forest" },
  { id: "desert", name: "Desert" },
  { id: "street-art", name: "Street Art" },
  { id: "sunset", name: "Sunset" },
  { id: "historic", name: "Historic" }
];