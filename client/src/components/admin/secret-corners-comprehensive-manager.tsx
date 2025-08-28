import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  MapPin,
  Trophy,
  Users,
  Activity,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Pin,
  Award,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Search,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import BasicSecretLocationsManager from "./basic-secret-locations-manager";
import DirectApplicationsViewer from "./direct-applications-viewer";

// Types
interface ForumPost {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  likes: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  categoryName?: string;
  commentsCount?: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: number;
  winningLocationId?: number;
  createdAt: string;
  entriesCount?: number;
}

interface ChallengeEntry {
  id: number;
  challengeId: number;
  locationId: number;
  userId: number;
  description?: string;
  isWinner: boolean;
  createdAt: string;
  userName?: string;
  locationName?: string;
}

interface SecretLocation {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords?: [number, number];
  images: string[];
  status: "pending" | "approved" | "rejected";
  userId: number;
  userName?: string;
  likes?: number;
  views?: number;
  isFeatured?: boolean;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}

interface Contributor {
  userId: number;
  userName: string;
  locationsCount: number;
  totalLikes: number;
  totalViews: number;
}

export default function SecretCornersComprehensiveManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("forum");

  // Forum Management State
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);

  // Challenge Management State
  const [showCreateChallengeDialog, setShowCreateChallengeDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeEntriesDialog, setShowChallengeEntriesDialog] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<number | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // Location of the Month State
  const [selectedLocationOfMonth, setSelectedLocationOfMonth] = useState<SecretLocation | null>(null);
  const [showSelectLocationDialog, setShowSelectLocationDialog] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSortBy, setLocationSortBy] = useState<"popularity" | "name" | "date">("popularity");
  const [locationCategory, setLocationCategory] = useState<"all" | "nature" | "architecture" | "street" | "events" | "restaurants">("all");
  const [locationPage, setLocationPage] = useState(1);
  const locationsPerPage = 12;

  // Activity State
  const [activityPage, setActivityPage] = useState(1);

  // Fetch Forum Posts
  const { data: forumPosts = [], isLoading: isLoadingForum } = useQuery({
    queryKey: ["/api/forum/posts"],
    queryFn: async () => {
      const response = await fetch("/api/forum/posts");
      if (!response.ok) throw new Error("Failed to fetch forum posts");
      const posts = await response.json();
      // Transform posts to include required fields
      return posts.map((post: any) => ({
        ...post,
        userName: post.author?.username || "Unknown",
        categoryName: post.category?.name || "General",
        commentsCount: post.comments?.length || 0
      }));
    },
  });

  // Fetch Challenges
  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ["/api/challenges"],
    queryFn: async () => {
      const response = await fetch("/api/challenges");
      if (!response.ok) throw new Error("Failed to fetch challenges");
      return response.json();
    },
  });

  // Fetch Featured Location
  const { data: featuredLocation, refetch: refetchFeaturedLocation } = useQuery({
    queryKey: ["/api/secret-locations/featured-of-month"],
    queryFn: async () => {
      const response = await fetch("/api/secret-locations/featured-of-month");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Fetch Popular Locations (now all locations for selection)
  const { data: allLocations = [] } = useQuery({
    queryKey: ["/api/secret-locations/status/approved"],
    queryFn: async () => {
      const response = await fetch("/api/secret-locations/status/approved");
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  // Filter and sort locations for selection
  const filteredAndSortedLocations = allLocations
    .filter((location: SecretLocation) => {
      const matchesSearch = 
        locationSearch === "" ||
        location.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        location.location.toLowerCase().includes(locationSearch.toLowerCase()) ||
        location.description.toLowerCase().includes(locationSearch.toLowerCase());
      
      const matchesCategory = 
        locationCategory === "all" || 
        location.category.toLowerCase() === locationCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    })
    .sort((a: SecretLocation, b: SecretLocation) => {
      switch (locationSortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popularity":
        default:
          return ((b.views || 0) + (b.likes || 0) * 10) - ((a.views || 0) + (a.likes || 0) * 10);
      }
    });

  const totalPages = Math.ceil(filteredAndSortedLocations.length / locationsPerPage);
  const paginatedLocations = filteredAndSortedLocations.slice(
    (locationPage - 1) * locationsPerPage,
    locationPage * locationsPerPage
  );

  // Fetch Top Contributors
  const { data: topContributors = [] } = useQuery({
    queryKey: ["/api/secret-locations/top-contributors"],
    queryFn: async () => {
      const response = await fetch("/api/secret-locations/top-contributors");
      if (!response.ok) throw new Error("Failed to fetch top contributors");
      return response.json();
    },
  });

  // Fetch Recent Activity
  const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ["/api/secret-corners/activity", activityPage],
    queryFn: async () => {
      const response = await fetch(`/api/secret-corners/activity?page=${activityPage}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch activity");
      return response.json();
    },
  });

  // Delete Forum Post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setShowDeletePostDialog(false);
      setSelectedPost(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // Toggle Post Pin Status
  const togglePinMutation = useMutation({
    mutationFn: async (post: ForumPost) => {
      const response = await fetch(`/api/forum/posts/${post.id}/pin`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });
      if (!response.ok) throw new Error("Failed to toggle pin status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pin status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  // Toggle Post Lock Status
  const toggleLockMutation = useMutation({
    mutationFn: async (post: ForumPost) => {
      const response = await fetch(`/api/forum/posts/${post.id}/lock`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isLocked: !post.isLocked }),
      });
      if (!response.ok) throw new Error("Failed to toggle lock status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lock status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  // Create Challenge
  const createChallengeMutation = useMutation({
    mutationFn: async (data: typeof newChallenge) => {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create challenge");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Challenge created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setShowCreateChallengeDialog(false);
      setNewChallenge({ title: "", description: "", startDate: "", endDate: "" });
    },
  });

  // Delete Challenge
  const deleteChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to delete challenge");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setChallengeToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive",
      });
    },
  });

  // Set Featured Location
  const setFeaturedLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await fetch("/api/secret-locations/featured-of-month", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ locationId }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to set featured location: ${errorData}`);
      }
      return response.json();
    },
    onError: (error) => {
      console.error('Error setting featured location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set featured location",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Location of the Month updated",
      });
      // Invalidate and refetch the featured location query
      queryClient.invalidateQueries({ queryKey: ["/api/secret-locations/featured-of-month"] });
      queryClient.refetchQueries({ queryKey: ["/api/secret-locations/featured-of-month"] });
      setShowSelectLocationDialog(false);
      // Update local state to immediately reflect the change
      setSelectedLocationOfMonth(data.location);
    },
  });

  // Select Challenge Winner
  const selectWinnerMutation = useMutation({
    mutationFn: async ({ challengeId, entryId }: { challengeId: number; entryId: number }) => {
      const response = await fetch(`/api/challenges/${challengeId}/winner`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ entryId }),
      });
      if (!response.ok) throw new Error("Failed to select winner");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Challenge winner selected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
  });

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="forum">Community Forum</TabsTrigger>
          <TabsTrigger value="location-month">Location of Month</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="popular">Popular Locations</TabsTrigger>
          <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Community Forum Tab */}
        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Forum Moderation
              </CardTitle>
              <CardDescription>
                Moderate and manage community forum posts and discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingForum ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forumPosts.map((post: ForumPost) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>{post.userName || "Unknown"}</TableCell>
                        <TableCell>{post.categoryName || "General"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{post.likes} likes</div>
                            <div>{post.views} views</div>
                            <div>{post.commentsCount || 0} comments</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {post.isPinned && (
                              <Badge variant="secondary" className="w-fit">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            {post.isLocked && (
                              <Badge variant="outline" className="w-fit">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePinMutation.mutate(post)}
                            >
                              <Pin className={`h-4 w-4 ${post.isPinned ? "fill-current" : ""}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleLockMutation.mutate(post)}
                            >
                              {post.isLocked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowDeletePostDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location of the Month Tab */}
        <TabsContent value="location-month">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Location of the Month
              </CardTitle>
              <CardDescription>
                Select and feature a location as the highlight of the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {featuredLocation ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      Current Featured Location
                    </h3>
                    <div className="space-y-2">
                      <p className="font-medium">{featuredLocation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {featuredLocation.location}
                      </p>
                      <p className="text-sm">{featuredLocation.description}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>By: {featuredLocation.userName}</span>
                        <span>Featured since: {format(new Date(featuredLocation.featuredAt || featuredLocation.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => {
                    refetchFeaturedLocation();
                    setShowSelectLocationDialog(true);
                  }}>
                    Change Featured Location
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No featured location selected
                  </p>
                  <Button onClick={() => {
                    refetchFeaturedLocation();
                    setShowSelectLocationDialog(true);
                  }}>
                    Select Featured Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Challenges Management
                </div>
                <Button onClick={() => setShowCreateChallengeDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </CardTitle>
              <CardDescription>
                Create and manage photography challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChallenges ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge: Challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">
                          {challenge.title}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {challenge.description}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(challenge.startDate), "MMM d")}</div>
                            <div>to {format(new Date(challenge.endDate), "MMM d")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {challenge.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Ended</Badge>
                          )}
                        </TableCell>
                        <TableCell>{challenge.entriesCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedChallenge(challenge);
                                setShowChallengeEntriesDialog(true);
                              }}
                            >
                              View Entries
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setChallengeToDelete(challenge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Locations Tab */}
        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Popular Locations
              </CardTitle>
              <CardDescription>
                Automatically tracked based on views and likes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Submitted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLocations.slice(0, 10).map((location: SecretLocation, index: number) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-semibold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.category}</TableCell>
                      <TableCell>{location.views || 0}</TableCell>
                      <TableCell>{location.likes || 0}</TableCell>
                      <TableCell>{location.userName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Contributors Tab */}
        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Users with the most valuable contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Locations Submitted</TableHead>
                    <TableHead>Total Likes</TableHead>
                    <TableHead>Total Views</TableHead>
                    <TableHead>Impact Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topContributors.map((contributor: Contributor, index: number) => (
                    <TableRow key={contributor.userId}>
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-semibold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {contributor.userName}
                      </TableCell>
                      <TableCell>{contributor.locationsCount}</TableCell>
                      <TableCell>{contributor.totalLikes}</TableCell>
                      <TableCell>{contributor.totalViews}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(contributor.totalLikes * 10 + contributor.totalViews).toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Live feed of Secret Corners activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {isLoadingActivity ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {recentActivity.map((activity: ActivityItem) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="mt-1">
                            {activity.type === "location_added" && (
                              <MapPin className="h-4 w-4 text-green-500" />
                            )}
                            {activity.type === "challenge_entry" && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            {activity.type === "forum_post" && (
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                            )}
                            {activity.type === "like" && (
                              <Star className="h-4 w-4 text-pink-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              {activity.userName && <span>By: {activity.userName}</span>}
                              <span>{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActivityPage(activityPage + 1)}
                        >
                          Load More Activity
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Post Dialog */}
      <Dialog open={showDeletePostDialog} onOpenChange={setShowDeletePostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Forum Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="py-4">
              <p className="font-medium">{selectedPost.title}</p>
              <p className="text-sm text-muted-foreground">By: {selectedPost.userName}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePostDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPost && deletePostMutation.mutate(selectedPost.id)}
            >
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog open={showCreateChallengeDialog} onOpenChange={setShowCreateChallengeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Create a new photography challenge for the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="E.g., Golden Hour Challenge"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="Describe the challenge requirements and theme..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newChallenge.startDate}
                  onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newChallenge.endDate}
                  onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChallengeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => createChallengeMutation.mutate(newChallenge)}>
              Create Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Location of Month Dialog */}
      <Dialog open={showSelectLocationDialog} onOpenChange={setShowSelectLocationDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Select Location of the Month</DialogTitle>
            <DialogDescription>
              Choose a location to feature as the highlight of the month ({filteredAndSortedLocations.length} locations available)
            </DialogDescription>
          </DialogHeader>
          
          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations by name, address, or description..."
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setLocationPage(1); // Reset to first page on search
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={locationSortBy} onValueChange={(value) => setLocationSortBy(value as "popularity" | "name" | "date")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="date">Newest First</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locationCategory} onValueChange={(value) => {
                setLocationCategory(value as "all" | "nature" | "architecture" | "street" | "events" | "restaurants");
                setLocationPage(1);
              }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="restaurants">Restaurants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Locations Grid */}
          <ScrollArea className="h-[500px]">
            {paginatedLocations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No locations found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedLocations.map((location: SecretLocation) => (
                  <div
                    key={location.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                    onClick={() => setFeaturedLocationMutation.mutate(location.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate group-hover:text-primary">
                            {location.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {location.location}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {location.category}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {location.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {location.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {location.views || 0}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(location.createdAt), "MMM d")}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center pt-2">
                        {setFeaturedLocationMutation.isPending ? (
                          <Button size="sm" variant="ghost" className="text-xs" disabled>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Selecting...
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Select as Featured
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((locationPage - 1) * locationsPerPage) + 1} to {Math.min(locationPage * locationsPerPage, filteredAndSortedLocations.length)} of {filteredAndSortedLocations.length} locations
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={locationPage === 1}
                  onClick={() => setLocationPage(locationPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, locationPage - 2)) + i;
                    if (page > totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={locationPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocationPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={locationPage === totalPages}
                  onClick={() => setLocationPage(locationPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Challenge Confirmation Dialog */}
      <AlertDialog open={!!challengeToDelete} onOpenChange={(open) => !open && setChallengeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
              All associated entries will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChallengeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (challengeToDelete) {
                  deleteChallengeMutation.mutate(challengeToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}