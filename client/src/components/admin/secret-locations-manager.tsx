import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, CheckCircle, XCircle, AlertCircle, Eye, Calendar, MapIcon } from "lucide-react";

// Define secret location type based on what we expect from the API
type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: [number, number];
  comments: number;
  image: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
};

// Mock data for now - in production this would come from the API
const mockSecretLocations: SecretLocation[] = [
  {
    id: 1,
    name: "Hidden Beach Cove",
    description: "A secluded beach area perfect for sunrise photography, accessible only during low tide.",
    location: "North Shore, Maui, Hawaii",
    category: "Beach",
    coords: [20.9175, -156.3825],
    comments: 3,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    status: "pending",
    createdAt: "2025-02-15T14:22:31Z",
    userId: 5,
    userName: "Sarah_Photographer"
  },
  {
    id: 2,
    name: "Industrial Rooftop",
    description: "Abandoned factory rooftop with stunning cityscape views, perfect for urban photography.",
    location: "Downtown District, Chicago, IL",
    category: "Urban",
    coords: [41.8781, -87.6298],
    comments: 7,
    image: "https://images.unsplash.com/photo-1513031300226-c8fb12de9bbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    status: "approved",
    createdAt: "2025-02-10T09:14:55Z",
    userId: 8,
    userName: "UrbanLens"
  },
  {
    id: 3,
    name: "Mountain Pass Vantage Point",
    description: "Secluded overlook providing panoramic mountain views, accessible via a hidden trail.",
    location: "Aspen Wilderness, Colorado",
    category: "Nature",
    coords: [39.1911, -106.8175],
    comments: 12,
    image: "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2344&q=80",
    status: "rejected",
    createdAt: "2025-02-05T16:08:12Z",
    userId: 12,
    userName: "Alex_Wilderness"
  },
  {
    id: 4,
    name: "Desert Rock Formation",
    description: "Unique geological formations creating dramatic shadows during golden hour.",
    location: "Joshua Tree National Park, CA",
    category: "Desert",
    coords: [33.8734, -115.9010],
    comments: 5,
    image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    status: "pending",
    createdAt: "2025-02-18T11:32:47Z",
    userId: 9,
    userName: "DesertDawn"
  },
  {
    id: 5,
    name: "Forest Waterfall",
    description: "Hidden waterfall in an old-growth forest with perfect natural lighting conditions.",
    location: "Olympic National Park, WA",
    category: "Forest",
    coords: [47.8021, -123.6044],
    comments: 9,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80",
    status: "approved",
    createdAt: "2025-02-08T15:45:21Z",
    userId: 17,
    userName: "NatureFrame"
  }
];

export function SecretLocationsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [selectedLocation, setSelectedLocation] = useState<SecretLocation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  // Used for debugging dialog issues
  useEffect(() => {
    console.log("Review dialog state changed:", reviewDialogOpen);
  }, [reviewDialogOpen]);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewNotes, setReviewNotes] = useState("");

  // Get data from API endpoint using proper admin routes
  const { data: locations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/secret-locations/status', activeTab],
    queryFn: async () => {
      console.log(`Fetching ${activeTab} secret locations from API`);
      try {
        // Fetch data from API endpoint for the specific status
        const response = await fetch(`/api/secret-locations/status/${activeTab}`);
        
        if (!response.ok) {
          // If response is not OK, throw an error
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        
        // Parse and return the response data
        const data = await response.json();
        console.log(`Successfully loaded ${data.length} ${activeTab} locations from API`);
        return data;
      } catch (error) {
        console.error(`Error fetching ${activeTab} secret locations:`, error);
        // If there's an API error, fall back to mock data for demo purposes only
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Using mock data for demonstration purposes');
          return mockSecretLocations.filter(loc => loc.status === activeTab);
        }
        throw error;
      }
    },
    // Refetch data when component mounts or when activeTab changes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  // Force a refetch when the component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter locations based on active tab
  const filteredLocations = locations.filter(
    location => location.status === activeTab
  );

  // Mutation for updating a location's status through the API
  const updateLocationStatusMutation = useMutation({
    mutationFn: async ({ 
      locationId, 
      status, 
      notes 
    }: { 
      locationId: number; 
      status: "approved" | "rejected"; 
      notes: string;
    }) => {
      console.log(`Updating location ${locationId} to status: ${status}`);
      
      try {
        // Call the API to update the location status
        const response = await fetch(`/api/secret-locations/${locationId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status,
            reason: notes || ''
          }),
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          // Handle error response from the API
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        
        // Return the successful response
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the query for the current tab to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/secret-locations/status', activeTab] });
      
      // Also invalidate other status tabs since the counts might change
      queryClient.invalidateQueries({ queryKey: ['/api/secret-locations/status'] });
      
      // Close the review dialog
      setReviewDialogOpen(false);
      setReviewNotes("");
      
      // Show success message
      toast({
        title: `Location ${reviewStatus}d`,
        description: `The location has been ${reviewStatus === "approved" ? "approved and published" : "rejected"}`,
        variant: reviewStatus === "approved" ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating location status:", error);
      toast({
        title: "Error updating location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleReviewLocation = (location: SecretLocation, event?: React.MouseEvent) => {
    // Prevent default to avoid navigation/redirection on button click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log("Opening review dialog for location:", location);
    
    // First ensure the dialog state is reset
    setReviewDialogOpen(false);
    
    // Then set the location and update status in the next event loop cycle
    setTimeout(() => {
      setSelectedLocation(location);
      setReviewStatus(location.status === "pending" ? "approved" : location.status);
      setReviewDialogOpen(true);
    }, 10); 
  };

  const handleViewDetails = (location: SecretLocation) => {
    setSelectedLocation(location);
    setDetailsOpen(true);
  };

  const submitReview = (e?: React.MouseEvent) => {
    // Prevent default behavior to avoid page reloads or redirects
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!selectedLocation) {
      console.error("Cannot submit review - no location selected");
      return;
    }
    
    console.log(`Submitting review for location ${selectedLocation.id} with status: ${reviewStatus}`);
    
    updateLocationStatusMutation.mutate({
      locationId: selectedLocation.id,
      status: reviewStatus,
      notes: reviewNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse">Loading secret locations...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-2" />
        <p>Error loading locations: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add top section with refresh button and add new location button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
          Refresh Locations
        </Button>
        <Button 
          size="sm" 
          className="flex items-center"
          onClick={() => window.open('/secret-submit', '_blank')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
          Add Location
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pending" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Pending ({locations.filter(l => l.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved ({locations.filter(l => l.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            Rejected ({locations.filter(l => l.status === "rejected").length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          <Card>
            <CardContent className="p-4">
              {filteredLocations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded overflow-hidden mr-2">
                              <img 
                                src={location.image} 
                                alt={location.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {location.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{location.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>{location.category}</TableCell>
                        <TableCell>{location.userName}</TableCell>
                        <TableCell>{formatDate(location.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(location.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(location)}
                            className="mr-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {location.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={(e) => handleReviewLocation(location, e)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {location.status !== "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => handleReviewLocation(location, e)}
                            >
                              Change Status
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <MapIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No {activeTab} locations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Location details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedLocation && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLocation.name}</DialogTitle>
              <DialogDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {selectedLocation.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-video rounded-md overflow-hidden">
                <img 
                  src={selectedLocation.image} 
                  alt={selectedLocation.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedLocation.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm flex items-center">
                    <MapIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">Coordinates:</span>
                    <span className="text-muted-foreground">
                      {selectedLocation.coords[0].toFixed(6)}, {selectedLocation.coords[1].toFixed(6)}
                    </span>
                  </div>
                  
                  <div className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">Submitted on:</span>
                    <span className="text-muted-foreground">{formatDate(selectedLocation.createdAt)}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Current Status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedLocation.status)}
                    
                    {selectedLocation.status !== "pending" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          setDetailsOpen(false);
                          handleReviewLocation(selectedLocation, e);
                        }}
                      >
                        Change Status
                      </Button>
                    )}
                    
                    {selectedLocation.status === "pending" && (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          onClick={(e) => {
                            setDetailsOpen(false);
                            setReviewStatus("approved");
                            handleReviewLocation(selectedLocation, e);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          onClick={(e) => {
                            setDetailsOpen(false);
                            setReviewStatus("rejected");
                            handleReviewLocation(selectedLocation, e);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Simplified Review Dialog */}
      {reviewDialogOpen && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setReviewDialogOpen(false)}>
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal itself
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold">Review Secret Location</h2>
              <p className="text-sm text-gray-500">
                Change the status for "{selectedLocation.name}"
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`px-4 py-2 rounded-md text-center flex items-center justify-center ${
                      reviewStatus === "approved" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setReviewStatus("approved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-center flex items-center justify-center ${
                      reviewStatus === "rejected" 
                        ? "bg-red-600 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setReviewStatus("rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add notes about your decision..." 
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  reviewStatus === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } ${updateLocationStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={submitReview}
                disabled={updateLocationStatusMutation.isPending}
              >
                {updateLocationStatusMutation.isPending 
                  ? "Processing..." 
                  : `${reviewStatus === "approved" ? "Approve" : "Reject"} Location`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}