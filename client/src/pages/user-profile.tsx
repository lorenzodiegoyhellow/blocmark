import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VerifiedAvatar } from "@/components/ui/verified-avatar";
import { SimpleProfileImageUpload } from "@/components/profile/SimpleProfileImageUpload";
import { Edit2, MapPin, Loader2, Star, Shield, CheckCircle, Clock, Calendar, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { formatUsername } from "@/lib/utils";
import { GuestReviews } from "@/components/guest-reviews";
import { Badge } from "@/components/ui/badge";
import { IdentityVerification } from "@/components/identity/identity-verification";
import { ShieldCheck } from "lucide-react";

interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  roles: string[];
  identityVerificationStatus?: "not_started" | "pending" | "verified" | "failed" | "expired";
  identityVerifiedAt?: string;
}

interface UserStats {
  hostRating: number | null;
  guestRating: number | null;
  overallRating: number | null;
  hostReviewCount: number;
  guestReviewCount: number;
  totalReviewCount: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  responseTime: string | null;
  listingCount: number;
  joinDate: string;
}

interface HostReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  booking: {
    id: number;
    locationId: number;
    locationTitle: string;
  };
  reviewer: {
    id: number;
    username: string;
    profileImage: string | null;
  };
}

export default function UserProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });

  const { data: userListings, isLoading: listingsLoading, error: listingsError } = useQuery<any[]>({
    queryKey: [`/api/users/${id}/listings`],
    enabled: !!id,
  });

  const { data: userStats, error: statsError } = useQuery<UserStats>({
    queryKey: [`/api/users/${id}/stats`],
    enabled: !!id,
  });

  const { data: hostReviews, error: reviewsError } = useQuery<HostReview[]>({
    queryKey: [`/api/users/${id}/host-reviews`],
    enabled: !!id,
  });

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setLocation(user.location || "");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(`JavaScript error: ${event.error?.message || 'Unknown error'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promise error: ${event.reason?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Check for any errors
  const hasError = error || userError || listingsError || statsError || reviewsError;
  const errorMessage = error || userError?.message || listingsError?.message || statsError?.message || reviewsError?.message;

  // Debug logging
  useEffect(() => {
    console.log('UserProfile render state:', {
      user,
      userListings,
      userStats,
      hostReviews,
      hasError,
      errorMessage,
      isLoading: userLoading || listingsLoading
    });
  }, [user, userListings, userStats, hostReviews, hasError, errorMessage, userLoading, listingsLoading]);

  if (hasError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bio,
          location,
          profileImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}`] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  if (userLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p className="text-muted-foreground mt-2">
              The user you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwnProfile = currentUser?.id === Number(id);

  try {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="mb-8">
            <CardContent className="p-0">
              {isEditing ? (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profileImage">Profile Image</Label>
                      <SimpleProfileImageUpload
                        currentImage={profileImage}
                        username={user.username}
                        onImageUploaded={setProfileImage}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Your location"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to original values
                        setBio(user.bio || "");
                        setLocation(user.location || "");
                        setProfileImage(user.profileImage || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative bg-white">
                  {/* Main profile content */}
                  <div className="px-6 py-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Left side: Avatar and basic info */}
                      <div className="flex flex-col items-center md:items-start shrink-0">
                        <div className="relative mb-6">
                          <VerifiedAvatar
                            src={profileImage}
                            alt={user.username}
                            fallback={user.username.slice(0, 2).toUpperCase()}
                            isVerified={user.identityVerificationStatus === 'verified'}
                            className="h-24 w-24 ring-2 ring-gray-100"
                            badgeSize="lg"
                          />
                        </div>
                        
                        {/* Verification badges */}
                        <div className="flex flex-col gap-2 w-full">
                          {userStats?.isEmailVerified && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                              <span>Email verified</span>
                            </div>
                          )}
                          {userStats?.isPhoneVerified && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span>Phone verified</span>
                            </div>
                          )}
                          {user.identityVerificationStatus === 'verified' && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <ShieldCheck className="h-4 w-4 text-blue-500" />
                              <span>ID Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side: Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Header with name and edit button */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                          <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 truncate">
                              {formatUsername(user.username)}
                            </h1>
                            
                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                              {location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  <span>{location}</span>
                                </div>
                              )}
                              {userStats?.joinDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined {new Date(userStats.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                              {userStats?.responseTime && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  <span>Responds within {userStats.responseTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isOwnProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Profile
                            </Button>
                          )}
                        </div>
                        
                        {/* Bio */}
                        {bio && (
                          <div className="mb-8">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {bio}
                            </p>
                          </div>
                        )}
                        
                        {/* Stats */}
                        {userStats && (userStats.totalReviewCount > 0 || userStats.listingCount > 0) && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {userStats.listingCount > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userStats.listingCount}</div>
                                <div className="text-sm text-gray-600">
                                  Listing{userStats.listingCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                            {userStats.totalReviewCount > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userStats.totalReviewCount}</div>
                                <div className="text-sm text-gray-600">
                                  Review{userStats.totalReviewCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                            {userStats.hostReviewCount > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4 text-center">
                                {userStats.hostRating ? (
                                  <>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Star className="h-5 w-5 text-amber-500 fill-current" />
                                      <span className="text-2xl font-bold text-gray-900">{userStats.hostRating}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Host Rating</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-2xl font-bold text-gray-400 mb-1">New</div>
                                    <div className="text-sm text-gray-600">No ratings yet</div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Identity Verification Section - Only show on own profile */}
          {isOwnProfile && (
            <div className="mb-8">
              <IdentityVerification userId={Number(id)} isOwnProfile={isOwnProfile} />
            </div>
          )}

          {/* User Listings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Published Listings</h2>
              {userStats && userStats.listingCount > 0 && (
                <Badge variant="outline" className="text-sm">
                  {userStats.listingCount}
                </Badge>
              )}
            </div>
            {listingsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : userListings && Array.isArray(userListings) && userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(userListings as any[]).map((listing: any) => (
                  <Link key={listing.id} href={`/locations/${listing.id}`}>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={listing.images?.[0] || "/placeholder.jpg"}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        {/* Title and rating on same line */}
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-base line-clamp-1 flex-1">
                            {listing.title}
                          </h3>
                          <div className="flex items-center ml-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              New
                            </span>
                          </div>
                        </div>
                        
                        {/* City/Location */}
                        <div className="text-sm text-muted-foreground mb-1">
                          {listing.address ? 
                            listing.address.split(',')[1]?.trim() || listing.address.split(',')[0]?.trim() || 'Unknown Location'
                            : 'Unknown Location'
                          }
                        </div>
                        
                        {/* Response time */}
                        <div className="text-sm text-muted-foreground mb-3">
                          Responds within 1 hr
                        </div>
                        
                        {/* Bottom section with instant book and price */}
                        <div className="flex items-center justify-between mt-auto">
                          {/* Instant Book badge */}
                          {listing.instantBooking ? (
                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 py-0.5 px-2">
                              <Zap className="h-3.5 w-3.5 mr-1" />
                              Instant Book
                            </Badge>
                          ) : (
                            <div></div>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-baseline">
                            <span className="font-semibold text-lg">${listing.price}</span>
                            <span className="text-sm text-muted-foreground">/hr</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No listings published yet
              </p>
            )}
          </div>

          {/* Host Reviews */}
          {hostReviews && Array.isArray(hostReviews) && hostReviews.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold">Reviews as Host</h2>
                <Badge variant="outline" className="text-sm">
                  {hostReviews.length}
                </Badge>
              </div>
              <div className="space-y-4">
                {(hostReviews as HostReview[]).slice(0, 6).map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <VerifiedAvatar
                        src={review.reviewer.profileImage}
                        alt={review.reviewer.username}
                        fallback={review.reviewer.username.slice(0, 2).toUpperCase()}
                        isVerified={false}
                        className="h-10 w-10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.reviewer.username}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} • {review.booking.locationTitle}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Guest Reviews */}
          <GuestReviews userId={Number(id)} />
        </div>
      </AppLayout>
    );
  } catch (renderError) {
    console.error('Render error in UserProfile:', renderError);
    setError(`Render error: ${renderError instanceof Error ? renderError.message : 'Unknown render error'}`);
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Render Error</h1>
            <p className="text-gray-600 mb-4">Something went wrong while rendering the profile.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AppLayout>
    );
  }
}