import { useQuery } from "@tanstack/react-query";
import { Location, Booking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, DollarSign, BarChart2, LineChart, PieChart, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { ViewDetailsButton } from "@/components/bookings/view-details-button";
import { Eye } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations/owner'],
    enabled: !!user,
  });

  if (locationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("owner.dashboard")}</h1>
            <p className="text-muted-foreground">
              {t("owner.subtitle")}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/analytics">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                {t("owner.analytics")}
              </Button>
            </Link>
            <Link href="/add-listing">
              <Button>{t("owner.addNewLocation")}</Button>
            </Link>
          </div>
        </div>

        {/* Analytics Overview Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-primary" />
              {t("owner.performance")}
            </CardTitle>
            <CardDescription>
              {t("owner.quickOverview")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <LineChart className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("owner.totalBookings")}</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-emerald-600">+12% {t("owner.fromLastMonth")}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">$3,842</p>
                  <p className="text-xs text-emerald-600">+8% from last month</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <PieChart className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">18.3%</p>
                  <p className="text-xs text-emerald-600">+2.1% from last month</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link href="/analytics">
                <Button className="w-full">
                  View Detailed Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Your Listings</h2>
        <div className="grid gap-6">
          {locations && locations.length > 0 ? (
            locations.map((location) => (
              <Card key={location.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {location.images && location.images.length > 0 && (
                    <Link href={`/locations/${location.id}`}>
                      <div className="w-full md:w-1/4 h-48 md:h-auto cursor-pointer">
                        <img 
                          src={location.images[0]} 
                          alt={location.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{location.title}</CardTitle>
                        {/* Status badge */}
                        {location.status === "pending" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-2">
                            <Clock className="mr-1 h-3 w-3" /> Pending Approval
                          </Badge>
                        )}
                        {location.status === "approved" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                          </Badge>
                        )}
                        {location.status === "rejected" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-2">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">{location.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Status messages for rejected or pending locations */}
                      {location.status === "rejected" && location.statusReason && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                          <p className="text-sm font-medium text-red-800">Rejection reason:</p>
                          <p className="text-sm text-red-700">{location.statusReason}</p>
                        </div>
                      )}
                      
                      {location.status === "pending" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                          <p className="text-sm text-blue-700">
                            This location is awaiting admin approval. Once approved, it will be visible to potential clients.
                          </p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">{location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {location.status === "approved" ? "Available" : "Unavailable until approved"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${location.price} per day</span>
                        </div>
                      </div>
                      
                      <div className="flex mt-4 space-x-2">
                        <Link href={`/locations/${location.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1.5 text-primary">
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/listings?edit=${location.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={`/location-addons?locationId=${location.id}`}>
                          <Button variant="outline" size="sm">Manage Add-ons</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground mb-4">You don't have any listings yet</p>
                <Link href="/add-listing">
                  <Button>Create Your First Listing</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
