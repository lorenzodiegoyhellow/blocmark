import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, User, Camera, Star, Share2, Bookmark, Info, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

import { LatLngExpression } from "leaflet";

type LocationDetailProps = {
  location: {
    id: number;
    name: string;
    description: string;
    location: string; // address
    category: string;
    coords: LatLngExpression;
    comments: number;
    image: string;
    images?: string[]; // Additional images
    bestTimeOfDay?: string | null;
    recommendedEquipment?: string | null;
    compositionTip?: string | null;
    userId?: number;
    userName?: string;
  };
  isOpen: boolean;
  onClose: () => void;
};

type Comment = {
  id: number;
  user: string;
  avatar: string;
  date: string;
  content: string;
  rating: number;
};

// Mock comments data - in a real app, this would come from an API
const generateMockComments = (locationId: number): Comment[] => {
  const userNames = ["Alex Johnson", "Sam Smith", "Jordan Lee", "Taylor Morgan", "Casey Kim"];
  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5"
  ];
  
  const comments = [
    "Incredible spot for photography! The lighting in the afternoon is absolutely perfect.",
    "Had some trouble finding this place at first, but it was well worth the effort. Such a hidden gem!",
    "I've visited twice now and got amazing shots both times. Great for portrait photography.",
    "Beautiful location but quite crowded on weekends. Try to go on a weekday if possible.",
    "This place has a special atmosphere that's hard to describe. You have to experience it yourself!"
  ];
  
  return Array(3).fill(null).map((_, i) => ({
    id: i + 1,
    user: userNames[Math.floor(Math.random() * userNames.length)],
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    date: `${Math.floor(Math.random() * 28) + 1} ${['Jan', 'Feb', 'Mar', 'Apr', 'May'][Math.floor(Math.random() * 5)]} 2025`,
    content: comments[Math.floor(Math.random() * comments.length)],
    rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
  }));
};

export function LocationDetailDialog({ location, isOpen, onClose }: LocationDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);
  const { toast } = useToast();

  const formatCoordinates = (coords: LatLngExpression) => {
    // Handle different types of LatLngExpression
    if (Array.isArray(coords)) {
      return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
    } else if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
      return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    } else {
      return 'Coordinates not available';
    }
  };
  
  const handleShare = () => {
    // Generate a shareable location text
    const locationText = `${location.name} - ${location.location} (${formatCoordinates(location.coords)})`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Secret Corner: ${location.name}`,
        text: `Check out this amazing location for photography: ${locationText}`,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Location has been shared",
        });
      })
      .catch(() => {
        // Fallback to clipboard if share fails
        copyToClipboard();
      });
    } else {
      // Fallback to clipboard for browsers that don't support share
      copyToClipboard();
    }
  };
  
  const copyToClipboard = () => {
    // Generate text to copy
    const shareText = `Check out this amazing location on Secret Corners: ${location.name} - ${location.location} (${formatCoordinates(location.coords)})`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Location details have been copied to your clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{location.name}</DialogTitle>
            <Badge>{location.category}</Badge>
          </div>
          <DialogDescription className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {location.location}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main image and image gallery */}
          <div className="space-y-2">
            <div className="aspect-video overflow-hidden rounded-md">
              <img 
                src={location.image} 
                alt={location.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional images if available */}
            {location.images && location.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {location.images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden">
                    <img 
                      src={img} 
                      alt={`${location.name} - additional view ${index + 1}`} 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Location info */}
          <div>
            <h3 className="font-medium text-lg mb-2">Location Details</h3>
            <p className="text-sm text-muted-foreground mb-4">{location.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">Coordinates:</span>
                <span className="text-muted-foreground">{formatCoordinates(location.coords)}</span>
              </div>
              
              {location.userName && (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-2">Submitted by:</span>
                  <a 
                    href={`/users/${location.userId || 1}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {location.userName}
                  </a>
                </div>
              )}
              
              {location.bestTimeOfDay && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-2">Best time to visit:</span>
                  <span className="text-muted-foreground">{location.bestTimeOfDay}</span>
                </div>
              )}
            </div>
            
            <div className="flex mt-8 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Location
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Location
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Photography Tips Section */}
        <div>
          <h3 className="font-medium text-lg mb-4 flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Photography Tips
          </h3>
          
          <div className="space-y-3 text-sm">
            {location.bestTimeOfDay ? (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Best Time of Day</p>
                <p className="text-muted-foreground">{location.bestTimeOfDay}</p>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Best Time of Day</p>
                <p className="text-muted-foreground">Golden hour (shortly after sunrise or before sunset) provides the most flattering light for most locations.</p>
              </div>
            )}
            
            {location.recommendedEquipment ? (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Recommended Equipment</p>
                <p className="text-muted-foreground">{location.recommendedEquipment}</p>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Recommended Equipment</p>
                <p className="text-muted-foreground">Information not provided by submitter. Consider bringing versatile gear for this location.</p>
              </div>
            )}
            
            {location.compositionTip ? (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Composition Tip</p>
                <p className="text-muted-foreground">{location.compositionTip}</p>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 rounded-md">
                <p className="font-medium mb-1">Composition Tip</p>
                <p className="text-muted-foreground">Experiment with different angles and perspectives to find the best composition for this location.</p>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Comments Section */}
        <div>
          <h3 className="font-medium text-lg mb-4 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </h3>
          
          {/* Comment input section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium">Your Rating:</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-5 w-5 cursor-pointer ${
                      star <= userRating 
                        ? "text-yellow-500 fill-yellow-500" 
                        : "text-gray-300"
                    }`}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea 
                placeholder="Share your experience with this location..." 
                className="min-h-24 resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button 
                className="self-end"
                size="sm"
                disabled={!newComment.trim()}
                onClick={() => {
                  // In a real app, this would call an API to save the comment
                  const now = new Date();
                  const formattedDate = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]} ${now.getFullYear()}`;
                  
                  const newCommentObj: Comment = {
                    id: Date.now(), // Using timestamp as ID for demo purposes
                    user: "You", // In a real app, this would be the current user's name
                    avatar: "https://i.pravatar.cc/150?img=8", // Placeholder avatar
                    date: formattedDate,
                    content: newComment.trim(),
                    rating: userRating
                  };
                  
                  setComments([newCommentObj, ...comments]);
                  setNewComment("");
                  toast({
                    title: "Comment posted",
                    description: "Your comment has been added to this location",
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
          
          {/* Display comments */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                        <img 
                          src={comment.avatar} 
                          alt={comment.user} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{comment.user}</p>
                        <p className="text-xs text-muted-foreground">{comment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array(comment.rating).fill(null).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}