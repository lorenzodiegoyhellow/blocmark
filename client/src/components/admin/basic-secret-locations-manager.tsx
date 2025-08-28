import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Eye, Check, X } from "lucide-react";

// Simple type for secret locations
type SecretLocation = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: [number, number];
  images: string[];
  image: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: number;
  userName?: string;
  bestTimeOfDay?: string;
  recommendedEquipment?: string;
  compositionTip?: string;
};

export default function BasicSecretLocationsManager() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pendingLocations, setPendingLocations] = useState<SecretLocation[]>([]);
  const [approvedLocations, setApprovedLocations] = useState<SecretLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SecretLocation | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
    category: string;
    bestTimeOfDay: string;
    recommendedEquipment: string;
    compositionTip: string;
  }>({
    name: "",
    description: "",
    category: "",
    bestTimeOfDay: "",
    recommendedEquipment: "",
    compositionTip: ""
  });

  // Get pending locations from API endpoint
  const { data: pendingData = [], isLoading: isPendingLoading, error: pendingError, refetch: refetchPending } = useQuery({
    queryKey: ['/api/secret-locations/status/pending'],
    queryFn: async () => {
      console.log("Fetching pending secret locations from API");
      try {
        // Fetch data from API endpoint for pending status
        const response = await fetch(`/api/secret-locations/status/pending`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Parse and return the response data
        const data = await response.json();
        console.log(`Successfully loaded ${data.length} pending locations from API`);
        return data;
      } catch (error) {
        console.error("Error fetching pending secret locations:", error);
        throw error;
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Get approved locations from API endpoint
  const { data: approvedData = [], isLoading: isApprovedLoading, error: approvedError, refetch: refetchApproved } = useQuery({
    queryKey: ['/api/secret-locations/status/approved'],
    queryFn: async () => {
      console.log("Fetching approved secret locations from API");
      try {
        // Fetch data from API endpoint for approved status
        const response = await fetch(`/api/secret-locations/status/approved`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Parse and return the response data
        const data = await response.json();
        console.log(`Successfully loaded ${data.length} approved locations from API`);
        return data;
      } catch (error) {
        console.error("Error fetching approved secret locations:", error);
        throw error;
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Force a refetch when the component mounts
  useEffect(() => {
    refetchPending();
    refetchApproved();
  }, [refetchPending, refetchApproved]);

  // Update locations when data changes
  useEffect(() => {
    if (pendingData && Array.isArray(pendingData)) {
      setPendingLocations(pendingData);
    }
    
    if (approvedData && Array.isArray(approvedData)) {
      setApprovedLocations(approvedData);
    }
  }, [pendingData, approvedData]);

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
      // Close the review dialog
      setShowReviewModal(false);
      setReviewNotes("");
      
      // Show success message
      toast.toast({
        title: `Location ${reviewStatus}d`,
        description: `The location has been ${reviewStatus === "approved" ? "approved and published" : "rejected"}`,
        variant: reviewStatus === "approved" ? "default" : "destructive",
      });
      
      // Refetch the locations to update the UI
      refetchPending();
      refetchApproved();
    },
    onError: (error: Error) => {
      console.error("Error updating location status:", error);
      toast.toast({
        title: "Error updating location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for editing a secret location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ 
      locationId, 
      updateData 
    }: { 
      locationId: number;
      updateData: {
        name: string;
        description: string;
        category: string;
        bestTimeOfDay?: string;
        recommendedEquipment?: string;
        compositionTip?: string;
      }
    }) => {
      console.log(`Updating location ${locationId}`);
      
      try {
        const response = await fetch(`/api/secret-locations/${locationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error updating location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setShowEditModal(false);
      
      toast.toast({
        title: "Location updated",
        description: "The secret location has been updated successfully",
      });
      
      // Refresh both lists
      refetchPending();
      refetchApproved();
    },
    onError: (error: Error) => {
      toast.toast({
        title: "Error updating location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting a secret location
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      console.log(`Deleting location ${locationId}`);
      
      try {
        const response = await fetch(`/api/secret-locations/${locationId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error deleting location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setShowDeleteModal(false);
      
      toast.toast({
        title: "Location deleted",
        description: "The secret location has been permanently deleted",
      });
      
      // Refresh both lists
      refetchPending();
      refetchApproved();
    },
    onError: (error: Error) => {
      toast.toast({
        title: "Error deleting location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function handleReview(location: SecretLocation) {
    setSelectedLocation(location);
    setReviewStatus("approved"); // Default to approval
    setShowReviewModal(true);
  }

  function handleEdit(location: SecretLocation) {
    setSelectedLocation(location);
    setEditFormData({
      name: location.name,
      description: location.description,
      category: location.category,
      bestTimeOfDay: location.bestTimeOfDay || "",
      recommendedEquipment: location.recommendedEquipment || "",
      compositionTip: location.compositionTip || ""
    });
    setShowEditModal(true);
  }

  function handleDelete(location: SecretLocation) {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  }

  function submitReview() {
    if (!selectedLocation) return;
    
    updateLocationStatusMutation.mutate({
      locationId: selectedLocation.id,
      status: reviewStatus,
      notes: reviewNotes
    });
  }

  function submitEdit() {
    if (!selectedLocation) return;
    
    updateLocationMutation.mutate({
      locationId: selectedLocation.id,
      updateData: editFormData
    });
  }

  function submitDelete() {
    if (!selectedLocation) return;
    
    deleteLocationMutation.mutate(selectedLocation.id);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (isPendingLoading || isApprovedLoading) {
    return <div className="p-6 text-center">Loading secret locations...</div>;
  }

  if (pendingError || approvedError) {
    return <div className="p-6 text-center text-red-500">
      Error: {((pendingError || approvedError) as Error).message}
    </div>;
  }

  return (
    <div className="p-4">
      {/* Pending Locations Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Secret Locations</CardTitle>
          <CardDescription>
            Review and approve secret locations submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchPending()}
            className="mb-4"
          >
            Refresh Locations
          </Button>

          {pendingLocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending locations found
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLocations.map(location => (
                <div key={location.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <img 
                        src={location.image} 
                        alt={location.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{location.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <span className="inline-block mr-2">{location.category}</span>
                        •
                        <span className="inline-block mx-2">By {location.userName}</span>
                        •
                        <span className="inline-block ml-2">{formatDate(location.createdAt)}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{location.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReview(location)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Locations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Secret Locations</CardTitle>
          <CardDescription>
            Manage locations that are visible to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchApproved()}
            className="mb-4"
          >
            Refresh Approved Locations
          </Button>

          {approvedLocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approved locations found
            </div>
          ) : (
            <div className="space-y-4">
              {approvedLocations.map(location => (
                <div key={location.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <img 
                        src={location.image} 
                        alt={location.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{location.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <span className="inline-block mr-2">{location.category}</span>
                        •
                        <span className="inline-block mx-2">By {location.userName || 'Anonymous'}</span>
                        •
                        <span className="inline-block ml-2">{formatDate(location.createdAt)}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{location.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleEdit(location)}
                      >
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(location)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {showReviewModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Review Secret Location</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedLocation.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedLocation.location}</p>
              </div>

              <div className="h-40 rounded-md overflow-hidden">
                <img 
                  src={selectedLocation.image} 
                  alt={selectedLocation.name} 
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{selectedLocation.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={reviewStatus === "approved" ? "default" : "outline"}
                    className={reviewStatus === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setReviewStatus("approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant={reviewStatus === "rejected" ? "default" : "outline"}
                    className={reviewStatus === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setReviewStatus("rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full border rounded-md p-2 h-24 text-sm"
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className={reviewStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                  onClick={submitReview}
                  disabled={updateLocationStatusMutation.isPending}
                >
                  {updateLocationStatusMutation.isPending 
                    ? "Processing..." 
                    : `${reviewStatus === "approved" ? "Approve" : "Reject"} Location`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Edit Secret Location</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="h-32 rounded-md overflow-hidden mb-4">
                <img 
                  src={selectedLocation.image} 
                  alt={selectedLocation.name} 
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select 
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({...editFormData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Landscape">Landscape</SelectItem>
                    <SelectItem value="Urban">Urban</SelectItem>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Architecture">Architecture</SelectItem>
                    <SelectItem value="Nature">Nature</SelectItem>
                    <SelectItem value="Street">Street</SelectItem>
                    <SelectItem value="Hidden Gem">Hidden Gem</SelectItem>
                    <SelectItem value="Aerial">Aerial</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Best Time of Day</label>
                <Input
                  value={editFormData.bestTimeOfDay}
                  onChange={(e) => setEditFormData({...editFormData, bestTimeOfDay: e.target.value})}
                  placeholder="e.g. Golden hour, Sunset, Morning"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommended Equipment</label>
                <Input
                  value={editFormData.recommendedEquipment}
                  onChange={(e) => setEditFormData({...editFormData, recommendedEquipment: e.target.value})}
                  placeholder="e.g. Wide-angle lens, Tripod"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Composition Tip</label>
                <Input
                  value={editFormData.compositionTip}
                  onChange={(e) => setEditFormData({...editFormData, compositionTip: e.target.value})}
                  placeholder="e.g. Frame using the trees, Low angle perspective"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={submitEdit}
                  disabled={updateLocationMutation.isPending}
                >
                  {updateLocationMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white w-full max-w-md rounded-lg shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center mb-2">Delete Secret Location</h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{selectedLocation.name}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitDelete}
                disabled={deleteLocationMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLocationMutation.isPending ? "Deleting..." : "Delete Location"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}