import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { 
  FolderPlus, 
  FolderOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus, 
  ArrowRight, 
  FolderIcon, 
  HeartIcon, 
  Bookmark, 
  Check, 
  ArrowUpDown
} from "lucide-react";

// Types
type Location = {
  id: number;
  title: string;
  address: string;
  description: string;
  price: number;
  images: string[];
  propertyType: string;
  category?: string;
  status: string;
};

// Helper function to format category names for display
function formatCategoryName(category: string | undefined): string {
  if (!category) return "Studio";
  
  // Handle composite property types (e.g., "Studio - Photography Studio")
  if (category.includes(' - ')) {
    const parts = category.split(' - ');
    // Return the more specific part (usually the second part)
    return parts[1] || parts[0];
  }
  
  // Map of category IDs to display names
  const categoryMap: Record<string, string> = {
    'photo-studio': 'Photo Studio',
    'film-studio': 'Film Studio',
    'warehouse': 'Warehouse',
    'gallery': 'Gallery',
    'restaurant': 'Restaurant',
    'mansion': 'Mansion',
    'house': 'House',
    'apartment': 'Apartment',
    'hospital': 'Hospital',
    'studio-loft': 'Studio Loft',
    'garden-venue': 'Garden Venue',
    'beach-house': 'Beach House',
    'event-space': 'Event Space',
    'office': 'Office Space',
    // Property types from add listing page
    'Photography Studio': 'Photography Studio',
    'Film Studio': 'Film Studio',
    'Loft Studio': 'Loft Studio',
    'Recording Studio': 'Recording Studio',
    'Stage Studio': 'Stage Studio',
    'TV Studio': 'TV Studio',
    'Warehouse': 'Warehouse',
    'Gallery': 'Gallery',
    'Restaurant': 'Restaurant',
    'Mansion or Estate': 'Mansion or Estate',
    'House': 'House',
    'Apartment': 'Apartment',
    'Loft': 'Loft',
    'Condo': 'Condo',
    'Penthouse': 'Penthouse',
    // Handle composite types
    'Residential - Mansion or Estate': 'Mansion or Estate',
    'Residential - Apartment': 'Apartment',
    'Studio - Photography Studio': 'Photography Studio',
    'Commercial - Warehouse': 'Warehouse',
    'Commercial - Gallery': 'Gallery',
    'Commercial - Restaurant': 'Restaurant'
  };
  
  // Return mapped name or format the category string
  return categoryMap[category] || category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

type Folder = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

type SavedLocation = {
  userId: number;
  locationId: number;
  folderId: number | null;
  savedAt: string;
  location: Location;
  folder?: Folder;
};

export default function SavedLocationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderId, setEditFolderId] = useState<number | null>(null);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isEditFolderDialogOpen, setIsEditFolderDialogOpen] = useState(false);
  const [isMovingLocation, setIsMovingLocation] = useState<number | null>(null);

  // Fetch all folders
  const foldersQuery = useQuery({
    queryKey: ['/api/folders'],
    enabled: !!user,
  });

  // Fetch saved locations
  const savedLocationsQuery = useQuery({
    queryKey: ['/api/saved-locations'],
    enabled: !!user,
  });

  // Create new folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest({
        url: '/api/folders',
        method: 'POST',
        body: { name }
      });
    },
    onSuccess: () => {
      toast({
        title: "Folder created",
        description: "Your new folder has been created successfully.",
      });
      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating folder",
        description: error.message || "There was a problem creating your folder.",
        variant: "destructive",
      });
    }
  });

  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number, name: string }) => {
      return apiRequest({
        url: `/api/folders/${id}`,
        method: 'PATCH',
        body: { name }
      });
    },
    onSuccess: () => {
      toast({
        title: "Folder updated",
        description: "Your folder has been renamed successfully.",
      });
      setEditFolderName("");
      setEditFolderId(null);
      setIsEditFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating folder",
        description: error.message || "There was a problem updating your folder.",
        variant: "destructive",
      });
    }
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/folders/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Folder deleted",
        description: "Your folder has been deleted successfully.",
      });
      setActiveFolder(null);
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting folder",
        description: error.message || "There was a problem deleting your folder.",
        variant: "destructive",
      });
    }
  });

  // Move location to folder mutation
  const moveLocationMutation = useMutation({
    mutationFn: async ({ locationId, folderId }: { locationId: number, folderId: number | null }) => {
      return apiRequest({
        url: `/api/saved-locations/${locationId}/move`,
        method: 'PATCH',
        body: { folderId }
      });
    },
    onSuccess: () => {
      toast({
        title: "Location moved",
        description: "Your location has been moved successfully.",
      });
      setIsMovingLocation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error moving location",
        description: error.message || "There was a problem moving your location.",
        variant: "destructive",
      });
    }
  });

  // Unsave location mutation
  const unsaveLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      return apiRequest({
        url: `/api/locations/${locationId}/save`,
        method: 'DELETE'
      });
    },
    onSuccess: (_, locationId) => {
      toast({
        title: "Location removed",
        description: "The location has been removed from your saved locations.",
      });
      // Invalidate both the saved locations list and the individual location saved status
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/saved`] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations/ids'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing location",
        description: error.message || "There was a problem removing the location.",
        variant: "destructive",
      });
    }
  });

  // Handle folder creation
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder.",
        variant: "destructive",
      });
      return;
    }
    createFolderMutation.mutate(newFolderName);
  };

  // Handle folder update
  const handleUpdateFolder = () => {
    if (!editFolderName.trim() || !editFolderId) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder.",
        variant: "destructive",
      });
      return;
    }
    updateFolderMutation.mutate({ id: editFolderId, name: editFolderName });
  };

  // Open edit folder dialog
  const openEditFolderDialog = (folder: Folder) => {
    setEditFolderId(folder.id);
    setEditFolderName(folder.name);
    setIsEditFolderDialogOpen(true);
  };

  // Filter saved locations by active folder
  const getFilteredLocations = () => {
    if (!savedLocationsQuery.data) return [];
    
    if (activeFolder === null) {
      // Show all saved locations
      return savedLocationsQuery.data;
    } else {
      // Filter by folder
      return (savedLocationsQuery.data as SavedLocation[]).filter(
        savedLocation => savedLocation.folderId === activeFolder
      );
    }
  };

  // Get folders from query data
  const getFolders = (): Folder[] => {
    return foldersQuery.data || [];
  };

  // Loading state
  if (foldersQuery.isLoading || savedLocationsQuery.isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-8">Saved Locations</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (foldersQuery.isError || savedLocationsQuery.isError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Saved Locations</h1>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          <p className="text-red-600 mt-2">
            There was a problem loading your saved locations. Please try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
              queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
            }}
          >
            Retry
          </Button>
        </div>
      </div>
      </AppLayout>
    );
  }

  // Empty state - no saved locations
  if (savedLocationsQuery.data && (savedLocationsQuery.data as SavedLocation[]).length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Saved Locations</h1>
        <div className="bg-gray-50 border border-gray-200 p-10 rounded-lg text-center">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Saved Locations</h3>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            You haven't saved any locations yet. Browse locations and click the bookmark icon to save them here.
          </p>
          <Button 
            variant="default" 
            className="mt-6"
            asChild
          >
            <Link href="/">Browse Locations</Link>
          </Button>
        </div>
      </div>
      </AppLayout>
    );
  }

  // Calculate the count of locations in each folder
  const getLocationCountByFolder = (folderId: number | null) => {
    if (!savedLocationsQuery.data) return 0;
    
    if (folderId === null) {
      // Count all saved locations
      return (savedLocationsQuery.data as SavedLocation[]).length;
    } else {
      // Count locations in this folder
      return (savedLocationsQuery.data as SavedLocation[]).filter(
        savedLocation => savedLocation.folderId === folderId
      ).length;
    }
  };

  const filteredLocations = getFilteredLocations();
  const folders = getFolders();

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Saved Locations</h1>
        <Button 
          onClick={() => setIsNewFolderDialogOpen(true)}
          className="mt-4 sm:mt-0"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar with folders */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Folders</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveFolder(null)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-md text-left",
                  activeFolder === null 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>All Saved Locations</span>
                </div>
                <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                  {getLocationCountByFolder(null)}
                </span>
              </button>

              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center justify-between">
                  <button 
                    onClick={() => setActiveFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-left group",
                      activeFolder === folder.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center">
                      <FolderIcon className="mr-2 h-4 w-4" />
                      <span>{folder.name}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      activeFolder === folder.id 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-gray-200 text-gray-800"
                    )}>
                      {getLocationCountByFolder(folder.id)}
                    </span>
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 ml-1",
                          activeFolder === folder.id 
                            ? "text-primary-foreground hover:bg-primary-foreground/20" 
                            : "text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditFolderDialog(folder)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(event) => {
                          event.preventDefault();
                          if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? The locations will be moved to All Saved Locations.`)) {
                            deleteFolderMutation.mutate(folder.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="md:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {activeFolder === null 
                ? "All Saved Locations" 
                : folders.find(f => f.id === activeFolder)?.name || "Locations"}
            </h2>
            <div className="text-sm text-gray-500">
              {filteredLocations.length} {filteredLocations.length === 1 ? "location" : "locations"}
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">No locations in this folder</h3>
              <p className="text-gray-600 mt-2">
                {activeFolder === null 
                  ? "You have no saved locations yet." 
                  : "You can move saved locations to this folder."}
              </p>
              {activeFolder !== null && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveFolder(null)}
                >
                  View All Saved Locations
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((savedLocation: SavedLocation) => (
                <Card key={savedLocation.locationId} className="overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={savedLocation.location.images[0] || 'https://placehold.co/400x300?text=No+Image'} 
                      alt={savedLocation.location.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">
                        {formatCategoryName(savedLocation.location.propertyType || savedLocation.location.category)}
                      </p>
                      <h3 className="text-white font-bold truncate">
                        {savedLocation.location.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 truncate">
                      {savedLocation.location.address}
                    </p>
                    <p className="mt-2 font-semibold">
                      ${savedLocation.location.price}/hour
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <Link href={`/locations/${savedLocation.locationId}`}>
                        View Details
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={savedLocation.folderId === null}
                            onClick={() => moveLocationMutation.mutate({ 
                              locationId: savedLocation.locationId, 
                              folderId: null 
                            })}
                          >
                            {savedLocation.folderId === null && (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Move to All Saved Locations
                          </DropdownMenuItem>
                          <Separator className="my-1" />
                          {folders.map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              disabled={savedLocation.folderId === folder.id}
                              onClick={() => moveLocationMutation.mutate({ 
                                locationId: savedLocation.locationId, 
                                folderId: folder.id 
                              })}
                            >
                              {savedLocation.folderId === folder.id && (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Move to {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          if (window.confirm("Remove this location from your saved locations?")) {
                            unsaveLocationMutation.mutate(savedLocation.locationId);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your saved locations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderDialogOpen} onOpenChange={setIsEditFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateFolder}
              disabled={updateFolderMutation.isPending}
            >
              {updateFolderMutation.isPending ? "Updating..." : "Update Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  );
}