import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly" | "all";

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");

  // Fetch summary data
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/analytics/summary" });
    },
  });

  // Fetch user analytics based on selected timeframe
  const { data: userAnalytics, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/admin/analytics/users", timeframe],
    queryFn: async () => {
      return apiRequest({ url: `/api/admin/analytics/users?timeframe=${timeframe}` });
    },
  });

  // Fetch booking analytics based on selected timeframe
  const { data: bookingAnalytics, isLoading: isBookingLoading } = useQuery({
    queryKey: ["/api/admin/analytics/bookings", timeframe],
    queryFn: async () => {
      return apiRequest({ url: `/api/admin/analytics/bookings?timeframe=${timeframe}` });
    },
  });

  // Fetch location analytics
  const { data: locationAnalytics, isLoading: isLocationLoading } = useQuery({
    queryKey: ["/api/admin/analytics/locations"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/analytics/locations" });
    },
  });

  const isLoading = isSummaryLoading || isUserLoading || isBookingLoading || isLocationLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as TimeFrame)}
            className="border rounded p-1 text-sm"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 days</option>
            <option value="monthly">Last 30 days</option>
            <option value="yearly">Last 12 months</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.newUsersThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.approvedLocations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.pendingLocations || 0} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.newBookingsThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryData?.revenueThisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Stats</CardTitle>
                <CardDescription>User distribution and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Users:</span>
                    <span className="font-bold">{userAnalytics?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Users:</span>
                    <span className="font-bold">{userAnalytics?.activeUsers || 0}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">User Roles</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span>Admin Users:</span>
                        <span>{userAnalytics?.roleDistribution?.admin || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Property Owners:</span>
                        <span>{userAnalytics?.roleDistribution?.owner || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Clients:</span>
                        <span>{userAnalytics?.roleDistribution?.client || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Growth</CardTitle>
                <CardDescription>User acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground ml-4">
                    User growth chart would be displayed here.<br />
                    {Object.keys(userAnalytics?.newUsersByMonth || {}).length} months of data available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Location Stats</CardTitle>
                <CardDescription>Distribution by country and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Locations:</span>
                    <span className="font-bold">{locationAnalytics?.locationStats?.total || 0}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Status Distribution</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span>Approved:</span>
                        <span>{locationAnalytics?.locationStats?.approved || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Pending:</span>
                        <span>{locationAnalytics?.locationStats?.pending || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Rejected:</span>
                        <span>{locationAnalytics?.locationStats?.rejected || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Country Distribution</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span>USA:</span>
                        <span>{locationAnalytics?.locationStats?.byCountry?.USA || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Italy:</span>
                        <span>{locationAnalytics?.locationStats?.byCountry?.Italy || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Other:</span>
                        <span>{locationAnalytics?.locationStats?.byCountry?.Other || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Booked Locations</CardTitle>
                <CardDescription>Most popular locations by booking count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(locationAnalytics?.topBookedLocations || []).slice(0, 5).map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1 flex items-center">
                        <span className="font-bold mr-2">{index + 1}.</span>
                        <span className="truncate">{location.title}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-muted">
                          {location.country}
                        </span>
                      </div>
                      <span className="font-medium">{location.bookingCount} bookings</span>
                    </div>
                  ))}
                  
                  {(locationAnalytics?.topBookedLocations || []).length === 0 && (
                    <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
                      No booking data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Stats</CardTitle>
                <CardDescription>Breakdown of booking status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-[180px]">
                    <PieChart className="h-16 w-16 text-muted-foreground/50" />
                    <div className="ml-4 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Total:</strong> {bookingAnalytics?.bookingStats?.total || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Confirmed:</strong> {bookingAnalytics?.bookingStats?.confirmed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Pending:</strong> {bookingAnalytics?.bookingStats?.pending || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Cancelled:</strong> {bookingAnalytics?.bookingStats?.cancelled || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Trends</CardTitle>
                <CardDescription>Monthly booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground ml-4">
                    Booking trend chart would be displayed here.<br />
                    {Object.keys(bookingAnalytics?.bookingsByMonth || {}).length} months of data available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Financial metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Total Revenue</h4>
                    <div className="text-2xl font-bold">
                      {formatCurrency(bookingAnalytics?.bookingStats?.totalRevenue || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      From {bookingAnalytics?.bookingStats?.confirmed || 0} confirmed bookings
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Average Booking Value</h4>
                    <div className="text-xl font-bold">
                      {bookingAnalytics?.bookingStats?.confirmed ? 
                        formatCurrency((bookingAnalytics?.bookingStats?.totalRevenue || 0) / bookingAnalytics?.bookingStats?.confirmed) : 
                        formatCurrency(0)
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground ml-4">
                    Revenue trend chart would be displayed here.<br />
                    {Object.keys(bookingAnalytics?.revenueByMonth || {}).length} months of data available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}