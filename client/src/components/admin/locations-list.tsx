import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  ThumbsDown, 
  Building,
  Eye,
  Trash2,
  Calendar,
  User,
  UserCircle,
  Mail,
  Hash,
  FileText,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatPrice } from "@/lib/utils";
import { LocationHistoryViewer } from "./location-history-viewer";

export function LocationsList() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedCountry, setSelectedCountry] = useState<"all" | "USA" | "Italy">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [reason, setReason] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailedProfile, setShowDetailedProfile] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLocationForHistory, setSelectedLocationForHistory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const ITEMS_PER_PAGE = 50;

  // Fetch all locations
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ["/api/admin/locations", selectedFilter],
    queryFn: async () => {
      const url = selectedFilter === "all" 
        ? "/api/admin/locations" 
        : `/api/admin/locations/status/${selectedFilter}`;
      return apiRequest({ url });
    }
  });
  
  // Fetch user details when needed
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => apiRequest({ url: "/api/admin/users" }),
    enabled: userDialogOpen
  });
  
  // Handle viewing user details
  const handleViewUser = (ownerId: number) => {
    const user = users?.find((user: any) => user.id === ownerId);
    setSelectedUser(user || { id: ownerId });
    setUserDialogOpen(true);
  };

  // Update location status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ locationId, status, reason }: { locationId: number, status: string, reason?: string }) => {
      // Only include reason in the request if it's not empty
      const body = reason?.trim() 
        ? { status, reason } 
        : { status };
        
      return apiRequest({
        url: `/api/admin/locations/${locationId}/status`,
        method: "PATCH",
        body
      });
    },
    onSuccess: (data) => {
      // Access the enhanced response with adminAction data
      const statusMessage = newStatus === "approved" 
        ? "approved and is now visible on the website" 
        : newStatus === "rejected"
        ? "rejected and will not be displayed to users"
        : `marked as ${newStatus}`;
      
      const previousStatus = data.adminAction?.previousStatus || 'unknown';
      
      // Create a more detailed success message
      toast({
        title: "Location status updated",
        description: `Location has been ${statusMessage}. Changed from "${previousStatus}" to "${newStatus}"`,
        variant: "default",
      });
      
      setStatusDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete location mutation
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<any>(null);
  
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      return apiRequest({
        url: `/api/admin/locations/${locationId}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Location deleted",
        description: "The location has been permanently deleted.",
        variant: "default",
      });
      setDeleteConfirmDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete location",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (location: any) => {
    setLocationToDelete(location);
    setDeleteConfirmDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteLocation = () => {
    if (!locationToDelete) return;
    deleteLocationMutation.mutate(locationToDelete.id);
  };

  // Helper function to filter by date
  const filterByDate = (location: any) => {
    if (dateFilter === "all") return true;
    
    const createdAt = new Date(location.createdAt);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case "today":
        return createdAt >= startOfToday;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return createdAt >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return createdAt >= monthAgo;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return createdAt >= yearAgo;
      default:
        return true;
    }
  };

  // Filter locations based on search query, country, date, and sort by publication time
  const filteredLocations = locations ? locations
    .filter((location: any) => 
      // Apply search filter - check title, address, owner name, or owner ID
      (location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (location.ownerName && location.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
       String(location.ownerId).includes(searchQuery)) &&
      // Apply country filter (if a specific country is selected)
      (selectedCountry === "all" || location.country === selectedCountry) &&
      // Apply date filter
      filterByDate(location)
    )
    .sort((a: any, b: any) => {
      // Sort by createdAt date (publication time)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === "newest") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    })
    : [];
    
  // Pagination logic
  const totalPages = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Handle opening the status update dialog
  const handleOpenUpdateDialog = (location: any) => {
    setSelectedLocation(location);
    setNewStatus(location.status);
    setReason("");
    setStatusDialogOpen(true);
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (!selectedLocation) return;
    
    // Require reason when rejecting
    if (newStatus === "rejected" && reason.trim() === "") {
      toast({
        title: "Reason required",
        description: "Please provide a reason when rejecting a location.",
        variant: "destructive",
      });
      return;
    }
    
    updateStatusMutation.mutate({
      locationId: selectedLocation.id,
      status: newStatus,
      reason: reason.trim() || undefined // Only send reason if not empty
    });
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <ThumbsDown className="mr-1 h-3 w-3" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading locations...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading locations: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Label>Status:</Label>
            <Select 
              value={selectedFilter} 
              onValueChange={(value) => {
                setSelectedFilter(value as any);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Country filter */}
          <div className="flex items-center space-x-2">
            <Label>Country:</Label>
            <Select 
              value={selectedCountry} 
              onValueChange={(value) => {
                setSelectedCountry(value as any);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="Italy">Italy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date filter */}
          <div className="flex items-center space-x-2">
            <Label>Added:</Label>
            <Select 
              value={dateFilter} 
              onValueChange={(value) => {
                setDateFilter(value as any);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort order */}
          <div className="flex items-center space-x-2">
            <Label>Sort:</Label>
            <Select 
              value={sortOrder} 
              onValueChange={(value) => {
                setSortOrder(value as any);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Search box */}
        <div className="relative w-full lg:w-auto">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full lg:w-[250px]"
          />
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
          <Building className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No locations found</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableCaption>List of platform locations</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">ID</TableHead>
                <TableHead className="min-w-[180px]">Title</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Owner</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Country</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Address</TableHead>
                <TableHead className="min-w-[80px]">Price</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right min-w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLocations.map((location: any) => (
                <TableRow key={location.id}>
                  <TableCell className="font-mono text-sm">{location.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left text-foreground truncate max-w-[180px] justify-start"
                        onClick={() => {
                          setSelectedLocationForHistory(location);
                          setHistoryDialogOpen(true);
                        }}
                        title="Click to view location history"
                      >
                        {location.title}
                      </Button>
                      <div className="md:hidden text-xs text-muted-foreground truncate">
                        Owner: {location.ownerName || location.ownerId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal text-xs" 
                      onClick={() => handleViewUser(location.ownerId)}
                    >
                      {location.ownerName || location.ownerId}
                      <User className="h-3 w-3 ml-1 inline-block" />
                    </Button>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge 
                      variant="outline" 
                      className={
                        location.country === "Italy" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {location.country || "USA"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="truncate max-w-[200px] text-sm">
                      {location.address}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatPrice(location.price)}</TableCell>
                  <TableCell>{getStatusBadge(location.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(location.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => handleOpenUpdateDialog(location)}
                      >
                        Update Status
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => window.open(`/locations/${location.id}`, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => handleOpenDeleteDialog(location)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLocations.length)} of {filteredLocations.length} locations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Location Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedLocation?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={(value) => setNewStatus(value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason {newStatus === "approved" ? "(Optional)" : "(Required for rejection)"}
              </Label>
              <Textarea 
                id="reason" 
                placeholder={newStatus === "approved" 
                  ? "Optional: Provide feedback about this location..." 
                  : "Please explain why this location is being rejected..."}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {newStatus === "rejected" && reason.trim() === "" && (
                <p className="text-sm text-red-500 mt-1">
                  Please provide a reason when rejecting a location
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{locationToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {locationToDelete && (
              <div className={`border rounded-md p-4 mb-4 ${locationToDelete.country === "Italy" ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex space-x-2">
                  <div className="font-semibold">Location ID:</div>
                  <div>{locationToDelete.id}</div>
                </div>
                <div className="flex space-x-2">
                  <div className="font-semibold">Title:</div>
                  <div>{locationToDelete.title}</div>
                </div>
                <div className="flex space-x-2">
                  <div className="font-semibold">Country:</div>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={
                        locationToDelete.country === "Italy" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {locationToDelete.country || "USA"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="font-semibold">Address:</div>
                  <div>{locationToDelete.address}</div>
                </div>
                <div className="flex space-x-2">
                  <div className="font-semibold">Status:</div>
                  <div>{locationToDelete.status}</div>
                </div>
                <div className="flex space-x-2">
                  <div className="font-semibold">Created:</div>
                  <div>{formatDate(locationToDelete.createdAt)}</div>
                </div>
              </div>
            )}
            
            <p className="text-red-600 font-medium">
              This will permanently remove the location from the database and all associated data.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteLocation} 
              disabled={deleteLocationMutation.isPending}
            >
              {deleteLocationMutation.isPending ? "Deleting..." : "Delete Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={(open) => {
        setUserDialogOpen(open);
        if (!open) {
          // Reset the profile view when closing
          setShowDetailedProfile(false);
        }
      }}>
        <DialogContent className={showDetailedProfile ? "sm:max-w-[640px]" : ""}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" /> 
              {showDetailedProfile ? `User Profile: ${selectedUser?.username || "User"}` : "User Details"}
            </DialogTitle>
            <DialogDescription>
              {showDetailedProfile ? 
                "Complete user profile and activity details" : 
                "View detailed information about this user"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedUser ? (
              showDetailedProfile ? (
                // Detailed User Profile View
                <div className="space-y-6">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="h-24 w-24 bg-primary-50 flex-shrink-0 rounded-full overflow-hidden border-4 border-primary/10 flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-primary/80" />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{selectedUser.username || "Anonymous User"}</h2>
                      <p className="text-muted-foreground mb-2">{selectedUser.email || "No email provided"}</p>

                      <div className="flex flex-wrap gap-1 my-2">
                        {selectedUser.roles ? 
                          selectedUser.roles.map((role: string) => (
                            <Badge key={role} variant="secondary" className="mr-1 mb-1">
                              {role}
                            </Badge>
                          )) : 
                          <Badge variant="secondary">Standard User</Badge>
                        }
                        
                        <Badge variant={selectedUser.status === "active" ? "outline" : "destructive"}>
                          {selectedUser.status || "active"}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground mt-2">
                        Joined: {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : "Unknown"}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-md font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" /> Account Details
                      </h3>
                      
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="font-semibold">User ID:</dt>
                        <dd className="text-muted-foreground">{selectedUser.id}</dd>
                        
                        <dt className="font-semibold">Username:</dt>
                        <dd className="text-muted-foreground">{selectedUser.username || "N/A"}</dd>
                        
                        <dt className="font-semibold">Email:</dt>
                        <dd className="text-muted-foreground">{selectedUser.email || "N/A"}</dd>
                        
                        <dt className="font-semibold">Status:</dt>
                        <dd>
                          <Badge variant={selectedUser.status === "active" ? "outline" : "destructive"} className="text-xs">
                            {selectedUser.status || "active"}
                          </Badge>
                        </dd>
                        
                        <dt className="font-semibold">Account Type:</dt>
                        <dd className="text-muted-foreground capitalize">
                          {selectedUser.accountType || "Standard"}
                        </dd>
                        
                        <dt className="font-semibold">Last Login:</dt>
                        <dd className="text-muted-foreground">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "Unknown"}
                        </dd>
                      </dl>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-md font-medium flex items-center">
                        <Building className="h-4 w-4 mr-2" /> Location Statistics
                      </h3>
                      
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="font-semibold">Total Locations:</dt>
                        <dd className="text-muted-foreground">
                          {filteredLocations.filter(loc => loc.ownerId === selectedUser.id).length}
                        </dd>
                        
                        <dt className="font-semibold">Approved Locations:</dt>
                        <dd className="text-muted-foreground">
                          {filteredLocations.filter(loc => 
                            loc.ownerId === selectedUser.id && loc.status === "approved"
                          ).length}
                        </dd>
                        
                        <dt className="font-semibold">Pending Locations:</dt>
                        <dd className="text-muted-foreground">
                          {filteredLocations.filter(loc => 
                            loc.ownerId === selectedUser.id && loc.status === "pending"
                          ).length}
                        </dd>
                        
                        <dt className="font-semibold">Rejected Locations:</dt>
                        <dd className="text-muted-foreground">
                          {filteredLocations.filter(loc => 
                            loc.ownerId === selectedUser.id && loc.status === "rejected"
                          ).length}
                        </dd>
                        
                        <dt className="font-semibold">Countries:</dt>
                        <dd className="text-muted-foreground">
                          {[...new Set(
                            filteredLocations
                              .filter(loc => loc.ownerId === selectedUser.id)
                              .map(loc => loc.country)
                          )].join(", ") || "None"}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-md font-medium flex items-center">
                      <Building className="h-4 w-4 mr-2" /> User's Locations
                    </h3>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLocations
                            .filter(loc => loc.ownerId === selectedUser.id)
                            .slice(0, 5)
                            .map((location: any) => (
                              <TableRow key={location.id}>
                                <TableCell>{location.id}</TableCell>
                                <TableCell className="font-medium">{location.title}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      location.country === "Italy" 
                                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }
                                  >
                                    {location.country || "USA"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(location.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/locations/${location.id}`, '_blank')}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          {filteredLocations.filter(loc => loc.ownerId === selectedUser.id).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Building className="h-8 w-8 mb-2 opacity-40" />
                                  <p>This user has no locations</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {filteredLocations.filter(loc => loc.ownerId === selectedUser.id).length > 5 && (
                        <div className="flex justify-center py-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Close the dialog and filter the main locations table
                              setUserDialogOpen(false);
                              setShowDetailedProfile(false);
                              setSearchQuery(selectedUser.username || String(selectedUser.id));
                            }}
                          >
                            View all {filteredLocations.filter(loc => loc.ownerId === selectedUser.id).length} locations
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Basic User Details View
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">User ID:</span>
                      </div>
                      <div>{selectedUser.id}</div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Username:</span>
                      </div>
                      <div>{selectedUser.username}</div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Email:</span>
                      </div>
                      <div>{selectedUser.email || "N/A"}</div>
                      
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Roles:</span>
                      </div>
                      <div>
                        {selectedUser.roles ? 
                          selectedUser.roles.map((role: string) => (
                            <Badge key={role} className="mr-1 mb-1">
                              {role}
                            </Badge>
                          )) : 
                          "Standard User"
                        }
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Status:</span>
                      </div>
                      <div>
                        <Badge variant={selectedUser.status === "active" ? "outline" : "destructive"}>
                          {selectedUser.status || "active"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Joined:</span>
                      </div>
                      <div>{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : "Unknown"}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">User Actions</h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Close the dialog and set the country filter to show all
                          setUserDialogOpen(false);
                          
                          // Apply a filter to the existing table to only show locations from this owner
                          // This is a better approach until we have dedicated user profile pages
                          setSearchQuery(selectedUser.username || String(selectedUser.id));
                        }}
                      >
                        Filter Locations by Owner
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Switch to detailed profile view
                          setShowDetailedProfile(true);
                        }}
                      >
                        User Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading user information...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {showDetailedProfile ? (
              <>
                <Button variant="outline" onClick={() => setShowDetailedProfile(false)}>
                  Back to Summary
                </Button>
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                  Close
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location History Dialog */}
      {selectedLocationForHistory && (
        <LocationHistoryViewer 
          locationId={selectedLocationForHistory.id} 
          locationTitle={selectedLocationForHistory.title}
          isOpen={historyDialogOpen}
          onClose={() => {
            setHistoryDialogOpen(false);
            setSelectedLocationForHistory(null);
          }}
        />
      )}
    </div>
  );
}