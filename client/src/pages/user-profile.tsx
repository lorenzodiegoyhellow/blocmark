import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Location, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Edit2 } from "lucide-react";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { VerifiedAvatar } from "@/components/ui/verified-avatar";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatUsername } from "@/lib/utils";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";
import { IdentityVerification } from "@/components/identity/identity-verification";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: userListings, isLoading: listingsLoading } = useQuery<Location[]>({
    queryKey: [`/api/users/${id}/listings`],
    enabled: !!id,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        bio: user.bio || "",
        location: user.location || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user, form, isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const changedFields = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== user?.[key as keyof User]) {
          acc[key] = value;
        }
        return acc;
      }, {} as ProfileFormData);

      if (Object.keys(changedFields).length === 0) {
        return user;
      }

      console.log('Updating profile with changed fields:', changedFields);

      // Use the apiRequest function with the correct signature
      const response = await apiRequest({
        url: `/api/users/${id}`,
        method: "PATCH",
        body: changedFields
      });
      
      return response;
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
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  if (userLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
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

  const onSubmit = (data: ProfileFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Current user data:', user);
    updateProfileMutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Username is no longer editable */}
                  <div className="mb-4">
                    <h3 className="mb-1 font-medium">Username</h3>
                    <p className="text-muted-foreground">{formatUsername(user.username)}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us about yourself..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-center mb-6">
                    <ProfileImageUploader
                      currentImage={form.watch('profileImage')}
                      username={user.username}
                      onImageChange={(url) => {
                        console.log('Profile image changed:', url);
                        form.setValue('profileImage', url, { 
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true 
                        });
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
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
                </form>
              </Form>
            ) : (
              <div className="flex items-start gap-6">
                <VerifiedAvatar
                  src={user?.profileImage}
                  alt={user.username}
                  fallback={user?.username.slice(0, 2).toUpperCase()}
                  isVerified={user?.identityVerificationStatus === 'verified'}
                  className="h-24 w-24"
                  badgeSize="lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold mb-2">{formatUsername(user?.username || '')}</h1>
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  {user?.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.bio && (
                    <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                      {user.bio}
                    </p>
                  )}
                  {user?.identityVerificationStatus === 'verified' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      <span>ID Verified</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isOwnProfile && (
          <div className="mb-8">
            <IdentityVerification userId={Number(id)} isOwnProfile={isOwnProfile} />
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Published Listings</h2>
          {listingsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          ) : userListings && userListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <Link href={`/locations/${listing.id}`}>
                    <div className="aspect-video relative cursor-pointer">
                      <img
                        src={listing.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                        alt={listing.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium">${listing.price}/day</span>
                      <ViewDetailsButton
                        locationId={listing.id}
                        variant="outline"
                        size="sm"
                        asLink={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No listings published yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}