import { useState, useEffect } from "react";
import { Location } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { VideoUploader } from "@/components/ui/video-uploader";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Trash2, Star, ImageIcon, Video, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import dnd-kit libraries
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PhotoEditFormProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

// Interface for each image item
interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  isCover: boolean;
  onRemove: (index: number) => void;
  onSetAsCover: (index: number) => void;
}

// Interface for each video item
interface SortableVideoItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

// Component for each sortable video
function SortableVideoItem({ 
  id, 
  url, 
  index, 
  onRemove 
}: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    height: '160px',
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-muted rounded-lg overflow-hidden border-2 ${
        isDragging ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/30'
      } transition-all duration-200`}
    >
      <video
        src={url}
        className="w-full h-32 object-cover"
        preload="metadata"
        muted
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"></div>
      
      {/* Video play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 rounded-full p-2">
          <Video className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab p-1 bg-white/90 rounded-full shadow-sm opacity-80 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-700" />
      </div>
      
      {/* Remove button */}
      <div className="absolute top-2 right-2">
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7 border border-white shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Position label */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded px-2 py-1 text-xs">
        Video {index + 1}
      </div>
    </div>
  );
}

// Component for each sortable image
function SortableImageItem({ 
  id, 
  url, 
  index, 
  isCover, 
  onRemove, 
  onSetAsCover 
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    // Prevent shifting when starting to drag
    animateLayoutChanges: () => false
  });

  // Apply transform to prevent shifting to right
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    height: '160px',
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-muted rounded-lg overflow-hidden border-2 ${
        isDragging ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/30'
      } transition-all duration-200`}
    >
      <img
        src={url}
        alt={`Location photo ${index + 1}`}
        className="w-full h-32 object-cover"
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"></div>
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab p-1 bg-white/90 rounded-full shadow-sm opacity-80 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-700" />
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {!isCover && (
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
            onClick={() => onSetAsCover(index)}
            title="Set as cover"
          >
            <Star className="h-3.5 w-3.5" />
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7 border border-white shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Position label */}
      <div className={`absolute bottom-2 left-2 text-white rounded px-2 py-1 text-xs ${
        isCover ? 'bg-primary font-medium' : 'bg-black/50'
      }`}>
        {isCover ? (
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            <span>Cover Photo</span>
          </div>
        ) : (
          `Photo ${index + 1}`
        )}
      </div>
    </div>
  );
}



export function PhotoEditForm({ location, isOpen, onClose }: PhotoEditFormProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(location.images || []);
  const [videos, setVideos] = useState<string[]>(location.videos || []);

  // Reset images and videos state when location or dialog open state changes
  useEffect(() => {
    if (isOpen) {
      setImages(location.images || []);
      setVideos(location.videos || []);
    }
  }, [isOpen, location.images, location.videos]);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { 
        distance: 8, // Minimum drag distance before activation (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateMutation = useMutation({
    mutationFn: async ({ newImages, newVideos }: { newImages: string[]; newVideos: string[] }) => {
      const locationUpdate = {
        ...location,
        images: newImages,
        videos: newVideos,
      };

      return await apiRequest({
        method: "PATCH",
        url: `/api/locations/${location.id}`,
        body: locationUpdate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${location.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/locations/owner/${location.ownerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });

      toast({
        title: "Success",
        description: "Photos updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update photos",
        variant: "destructive",
      });
    },
  });

  const handleImageSelected = (imageUrls: string[]) => {
    if (imageUrls.length === 0) return;
    
    setImages((prev) => [...prev, ...imageUrls]);
    
    // Show feedback toast for the new images
    toast({
      title: imageUrls.length === 1 ? "Photo Added" : `${imageUrls.length} Photos Added`,
      description: images.length === 0 
        ? "First photo will be used as the cover image." 
        : "New photos have been added to your collection.",
      duration: 2000,
    });
  };

  const handleVideoSelected = (videoUrl: string) => {
    setVideos((prev) => [...prev, videoUrl]);
    
    // Show feedback toast for the new video
    toast({
      title: "Video Added",
      description: "Video has been added to your location.",
      duration: 2000,
    });
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1 && videos.length === 0) {
      toast({
        title: "Warning",
        description: "You need at least one photo or video for your listing.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    
    // Show feedback toast for the removal action
    toast({
      title: "Photo Removed",
      description: index === 0 
        ? "Cover photo has been removed. The next photo will become the cover." 
        : `Photo ${index + 1} has been removed.`,
      duration: 2000,
    });
  };

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    
    // Show feedback toast for the removal action
    toast({
      title: "Video Removed",
      description: `Video ${index + 1} has been removed.`,
      duration: 2000,
    });
  };
  
  const handleSetAsCover = (index: number) => {
    if (index === 0) return; // Already the cover
    
    const newImages = [...images];
    // Remove the image from its current position
    const [image] = newImages.splice(index, 1);
    // Insert it at the beginning
    newImages.unshift(image);
    setImages(newImages);
    
    toast({
      title: "New Cover Photo Set",
      description: "This photo is now the cover image for your location",
      duration: 2000,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = parseInt((active.id as string).split('-')[1]);
        const newIndex = parseInt((over.id as string).split('-')[1]);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Show appropriate toast message based on the operation
        if (oldIndex === 0) {
          toast({
            title: "Cover Photo Changed",
            description: `Photo ${newIndex + 1} is now the cover image.`,
            duration: 2000,
          });
        } else if (newIndex === 0) {
          toast({
            title: "New Cover Photo Set",
            description: `Photo ${oldIndex + 1} is now the cover image.`,
            duration: 2000,
          });
        } else {
          toast({
            title: "Photos Reordered",
            description: `Photo ${oldIndex + 1} moved to position ${newIndex + 1}.`,
            duration: 2000,
          });
        }
        
        return newOrder;
      });
    }
  };

  const handleSave = () => {
    if (images.length === 0 && videos.length === 0) {
      toast({
        title: "Warning",
        description: "Please add at least one photo or video",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({ newImages: images, newVideos: videos });
  };
  
  const handleVideosDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setVideos((items) => {
        const oldIndex = parseInt((active.id as string).split('-')[1]);
        const newIndex = parseInt((over.id as string).split('-')[1]);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        toast({
          title: "Videos Reordered",
          description: `Video ${oldIndex + 1} moved to position ${newIndex + 1}.`,
          duration: 2000,
        });
        
        return newOrder;
      });
    }
  };

  // Generate items for the sortable contexts
  const items = images.map((image, index) => `image-${index}`);
  const videoItems = videos.map((video, index) => `video-${index}`);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Photos & Videos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6 p-2">
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Photos ({images.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="space-y-6">
              <ImageUploader onImageSelected={handleImageSelected} />

              <div className="relative">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {images.length > 0 
                      ? `Grab the handle icon (☰) on any photo to drag and reorder. The first photo will be used as the cover image.` 
                      : `Upload photos to get started. The first photo will be used as the cover photo.`}
                  </p>
                  {images.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      You can also use the star button to set any photo as the cover image.
                    </p>
                  )}
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={items} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 group">
                      {images.length > 0 ? (
                        images.map((image, index) => (
                          <SortableImageItem
                            key={`image-${index}`}
                            id={`image-${index}`}
                            url={image}
                            index={index}
                            isCover={index === 0}
                            onRemove={handleRemoveImage}
                            onSetAsCover={handleSetAsCover}
                          />
                        ))
                      ) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/50">
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No photos yet</h3>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Upload photos to showcase your location. The first photo will be used as the cover image.
                          </p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <VideoUploader onVideoSelected={handleVideoSelected} maxSizeMB={500} />

              <div className="relative">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {videos.length > 0 
                      ? `Grab the handle icon (☰) on any video to drag and reorder.` 
                      : `Upload videos to showcase your location in action.`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 500MB per video. Supported formats: MP4, WebM, OGG, AVI, MOV
                  </p>
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVideosDragEnd}
                >
                  <SortableContext items={videoItems} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 group">
                      {videos.length > 0 ? (
                        videos.map((video, index) => (
                          <SortableVideoItem
                            key={`video-${index}`}
                            id={`video-${index}`}
                            url={video}
                            index={index}
                            onRemove={handleRemoveVideo}
                          />
                        ))
                      ) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/50">
                          <Video className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No videos yet</h3>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Upload videos to give potential clients a better sense of your location.
                          </p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}