import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatUsername } from "@/lib/utils";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Check,
  Ban,
  UserCog,
  UserCheck,
  Globe,
  Clock,
  Activity,
  Building,
  Package,
  AlertCircle,
  ExternalLink,
  Home,
} from "lucide-react";

interface UserDetailsDialogProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ userId, open, onOpenChange }: UserDetailsDialogProps) {
  const [, navigate] = useLocation();
  
  const { data: userDetails, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest({
        url: `/api/admin/users/${userId}`,
      });
      return response;
    },
    enabled: !!userId && open,
  });

  const { data: userLocations } = useQuery({
    queryKey: ["/api/locations/owner", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest({
        url: `/api/admin/users/${userId}/locations`,
      });
      return response;
    },
    enabled: !!userId && open,
  });

  if (!open || !userId) return null;

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return (
        <Badge variant="destructive" className="bg-red-100 hover:bg-red-100 text-red-800 border-red-200">
          <Shield className="mr-1 h-3 w-3" /> Admin
        </Badge>
      );
    } else if (roles.includes("owner")) {
      return (
        <Badge variant="secondary" className="bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-200">
          <UserCog className="mr-1 h-3 w-3" /> Owner
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
          <UserCheck className="mr-1 h-3 w-3" /> Client
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case "banned":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Ban className="mr-1 h-3 w-3" /> Banned
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Ban className="mr-1 h-3 w-3" /> Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center p-8 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Error loading user details</p>
          </div>
        )}

        {userDetails && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {formatUsername(userDetails.username)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(userDetails.roles || [])}
                    {getStatusBadge(userDetails.status || "active")}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>User ID: #{userDetails.id}</p>
                <p>Joined: {formatDate(userDetails.createdAt)}</p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userDetails.email || "No email provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userDetails.phoneNumber || userDetails.phone || "No phone number provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userDetails.location || "No location provided"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Login Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Last Login IP</p>
                      <p className="text-muted-foreground">
                        {userDetails.lastLoginIp || "Never logged in"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Last Login</p>
                      <p className="text-muted-foreground">
                        {userDetails.lastLoginAt 
                          ? formatDate(userDetails.lastLoginAt) 
                          : "Never logged in"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Auth Provider</p>
                      <p className="text-muted-foreground capitalize">
                        {userDetails.authProvider || "local"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            {userDetails.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{userDetails.stats.totalLocations}</p>
                        <p className="text-xs text-muted-foreground">Total Locations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{userDetails.stats.activeLocations}</p>
                        <p className="text-xs text-muted-foreground">Active Locations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{userDetails.stats.totalBookings}</p>
                        <p className="text-xs text-muted-foreground">Total Bookings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{userDetails.stats.activeBookings}</p>
                        <p className="text-xs text-muted-foreground">Active Bookings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* User Locations */}
            {userLocations && userLocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Locations</CardTitle>
                  <CardDescription>
                    Click on any location to view details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {userLocations.map((location: any) => (
                        <Card 
                          key={location.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Navigating to location:", location.id);
                            onOpenChange(false);
                            // Navigate to the specific location details page
                            navigate(`/locations/${location.id}`);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-muted-foreground" />
                                  <h4 className="font-medium text-sm">{location.title}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {location.address}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <span className="text-muted-foreground">
                                    ${location.price}/hr
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      location.status === "approved" 
                                        ? "bg-green-50 text-green-700 border-green-200" 
                                        : location.status === "pending"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }
                                  >
                                    {location.status}
                                  </Badge>
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Terms Accepted</p>
                    <p>{userDetails.termsAccepted ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Stripe Customer ID</p>
                    <p className="font-mono text-xs">
                      {userDetails.stripeCustomerId || "Not set"}
                    </p>
                  </div>
                  {userDetails.bio && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground">Bio</p>
                      <p className="mt-1">{userDetails.bio}</p>
                    </div>
                  )}
                  {userDetails.statusReason && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground">Status Reason</p>
                      <p className="mt-1 text-red-600">{userDetails.statusReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}