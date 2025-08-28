import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { format, subDays } from "date-fns";
import { ArrowUpRight, Users, DollarSign, Calendar as CalendarIcon, ArrowDownRight, Building, Clock, Bookmark, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Location } from "@shared/schema";
import { useTranslation } from "@/hooks/use-translation";

// Mock data for demonstration
const mockBookingData = [
  { month: 'Jan', bookings: 5, revenue: 1200 },
  { month: 'Feb', bookings: 8, revenue: 2100 },
  { month: 'Mar', bookings: 12, revenue: 3400 },
  { month: 'Apr', bookings: 10, revenue: 2800 },
  { month: 'May', bookings: 15, revenue: 4200 },
  { month: 'Jun', bookings: 20, revenue: 5500 },
  { month: 'Jul', bookings: 18, revenue: 4800 },
  { month: 'Aug', bookings: 22, revenue: 6200 },
  { month: 'Sep', bookings: 25, revenue: 7000 },
  { month: 'Oct', bookings: 18, revenue: 5100 },
  { month: 'Nov', bookings: 15, revenue: 4300 },
  { month: 'Dec', bookings: 12, revenue: 3600 },
];

const activityTypeData = [
  { name: 'Photo Shoots', value: 35, color: '#0088FE' },
  { name: 'Filming', value: 25, color: '#00C49F' },
  { name: 'Events', value: 20, color: '#FFBB28' },
  { name: 'Meetings', value: 15, color: '#FF8042' },
  { name: 'Other', value: 5, color: '#8884d8' },
];

const weeklyTrends = [
  { day: 'Mon', views: 120, inquiries: 8 },
  { day: 'Tue', views: 132, inquiries: 10 },
  { day: 'Wed', views: 145, inquiries: 12 },
  { day: 'Thu', views: 155, inquiries: 15 },
  { day: 'Fri', views: 180, inquiries: 20 },
  { day: 'Sat', views: 210, inquiries: 25 },
  { day: 'Sun', views: 190, inquiries: 22 },
];

// Generate daily performance data for the last 30 days
const generateDailyData = () => {
  const result = [];
  for (let i = 30; i > 0; i--) {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'MMM dd');
    
    const views = Math.floor(Math.random() * 50) + 80;
    const bookings = Math.floor(Math.random() * 3);
    
    result.push({
      date: formattedDate,
      views,
      bookings,
      revenue: bookings * (Math.floor(Math.random() * 200) + 200),
    });
  }
  return result;
};

const dailyData = generateDailyData();

export default function AnalyticsDashboard() {

  const [timeframe, setTimeframe] = useState("monthly");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch the user's locations
  const { data: userLocations, isLoading: isLocationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations/owner'],
    enabled: true,
  });

  // Fetch analytics summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['/api/analytics/summary'],
    enabled: true,
  });

  // Fetch booking analytics
  const { data: bookingData, isLoading: isBookingLoading } = useQuery({
    queryKey: ['/api/analytics/bookings', timeframe],
    enabled: true,
  });

  // Fetch activity type analytics
  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ['/api/analytics/activity-types'],
    enabled: true,
  });

  // Fetch location performance
  const { data: locationPerformance, isLoading: isLocationPerfLoading } = useQuery({
    queryKey: ['/api/analytics/locations'],
    enabled: true,
  });

  const isLoading = isLocationsLoading || isSummaryLoading || isBookingLoading || isActivityLoading || isLocationPerfLoading;

  // Use real data from API
  const getChartData = () => {
    return bookingData?.chartData || [];
  };

  // Use real data from API for summary cards
  const getTotalBookings = () => {
    return summaryData?.totalBookings || 0;
  };

  const getTotalRevenue = () => {
    return summaryData?.totalRevenue || 0;
  };

  const getBookingCompletionRate = () => {
    return bookingData?.stats?.completionRate ? `${bookingData.stats.completionRate}%` : "0%";
  };

  const getBookingConversionRate = () => {
    return summaryData?.conversionRate ? `${summaryData.conversionRate}%` : "0%";
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
            <p className="text-muted-foreground">{t("analytics.subtitle")}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("analytics.timeframe")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t("analytics.daily") || "Daily"}</SelectItem>
                <SelectItem value="weekly">{t("analytics.weekly")}</SelectItem>
                <SelectItem value="monthly">{t("analytics.monthly")}</SelectItem>
                <SelectItem value="yearly">{t("analytics.yearly")}</SelectItem>
              </SelectContent>
            </Select>
            
            {!isLoading && userLocations && userLocations.length > 0 && (
              <Select defaultValue={userLocations[0].id.toString()}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {userLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("analytics.totalBookings")}</p>
                  <h3 className="text-3xl font-bold mt-1">{getTotalBookings()}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="flex items-center text-emerald-600 bg-emerald-50">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+12%</span>
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("analytics.totalRevenue")}</p>
                  <h3 className="text-3xl font-bold mt-1">${(getTotalRevenue() || 0).toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="flex items-center text-emerald-600 bg-emerald-50">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+18%</span>
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("analytics.bookings")}</p>
                  <h3 className="text-3xl font-bold mt-1">96%</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="flex items-center text-emerald-600 bg-emerald-50">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+3%</span>
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("analytics.conversions")}</p>
                  <h3 className="text-3xl font-bold mt-1">{getBookingConversionRate()}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <ArrowUpRight className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="flex items-center text-rose-600 bg-rose-50">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  <span>-2%</span>
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("analytics.performance")}</TabsTrigger>
            <TabsTrigger value="bookings">{t("analytics.bookings")}</TabsTrigger>
            <TabsTrigger value="revenue">{t("analytics.revenue")}</TabsTrigger>
            <TabsTrigger value="insights">{t("analytics.views")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.performance")}</CardTitle>
                <CardDescription>
                  Bookings and revenue for {timeframe === "yearly" ? "the past year" : timeframe === "monthly" ? "the past month" : "the past week"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeframe === "weekly" ? "day" : timeframe === "daily" ? "date" : "month"} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="bookings" fill="#8884d8" name="Bookings" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Types</CardTitle>
                  <CardDescription>
                    Distribution of bookings by activity type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(activityData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trends</CardTitle>
                  <CardDescription>
                    Views and inquiries over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeframe === "weekly" ? (bookingData?.chartData || []) : weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" name="Profile Views" />
                      <Line type="monotone" dataKey={timeframe === "weekly" ? "inquiries" : "inquiries"} stroke="#82ca9d" name="Inquiries" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>
                  Daily bookings for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeframe === "daily" ? (bookingData?.chartData || []) : dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Types</CardTitle>
                  <CardDescription>Most common booking purposes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Photography
                      </span>
                      <Badge>42%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Events
                      </span>
                      <Badge>28%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Filming
                      </span>
                      <Badge>18%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Meetings
                      </span>
                      <Badge>12%</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Popular Times</CardTitle>
                  <CardDescription>Most requested booking times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Weekday Mornings
                      </span>
                      <Badge>32%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Weekend Afternoons
                      </span>
                      <Badge>28%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Weekday Evenings
                      </span>
                      <Badge>22%</Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Weekend Mornings
                      </span>
                      <Badge>18%</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              

            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Revenue breakdown for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>By booking type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Base Price', value: 75, color: '#0088FE' },
                          { name: 'Add-ons', value: 15, color: '#00C49F' },
                          { name: 'Extended Hours', value: 10, color: '#FFBB28' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Base Price', value: 75, color: '#0088FE' },
                          { name: 'Add-ons', value: 15, color: '#00C49F' },
                          { name: 'Extended Hours', value: 10, color: '#FFBB28' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Sources</CardTitle>
                  <CardDescription>By activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Photo Shoots
                        </span>
                        <span className="font-medium">$3,500</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '75%' }} />
                      </div>
                      <div className="text-xs text-muted-foreground">42% of total revenue</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Events
                        </span>
                        <span className="font-medium">$2,340</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '65%' }} />
                      </div>
                      <div className="text-xs text-muted-foreground">28% of total revenue</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Filming
                        </span>
                        <span className="font-medium">$1,500</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '45%' }} />
                      </div>
                      <div className="text-xs text-muted-foreground">18% of total revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key metrics and actionable insights for your listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-primary" />
                      Location Performance
                    </h3>
                    <p className="text-sm mt-2">
                      Your location is performing well with regular bookings.
                      Guests frequently mention your responsive communication and clean space.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-500" />
                      Optimal Pricing
                    </h3>
                    <p className="text-sm mt-2">
                      Analysis suggests you could increase your weekday morning rates by 10-15% without affecting
                      booking frequency. Weekend rates are optimally priced based on market demand.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Bookmark className="h-5 w-5 mr-2 text-green-500" />
                      Listing Visibility
                    </h3>
                    <p className="text-sm mt-2">
                      Your listings appear in search results 42% more often than last month.
                      Adding more details about lighting equipment and parking options could
                      further improve visibility for photography bookings.
                    </p>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-lg flex items-center text-emerald-700">
                      <ArrowUpRight className="h-5 w-5 mr-2" />
                      Growth Opportunity
                    </h3>
                    <p className="text-sm mt-2 text-emerald-800">
                      Based on your booking patterns, offering early morning (6-9am) availability
                      could attract an additional segment of clients looking for sunrise shoots.
                      This could increase your monthly bookings by approximately 15%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Analysis</CardTitle>
                  <CardDescription>How your listings compare to similar spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Price Competitiveness</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '85%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your pricing is competitive while remaining 15% more profitable than average
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Amenities</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '92%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your offerings exceed most competitors with premium amenities
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Booking Flexibility</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '68%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consider offering more flexible cancellation options to improve this score
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '75%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You respond faster than 75% of hosts, but there's room for improvement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable steps to improve performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="flex-none mt-0.5 bg-blue-50 rounded-full p-1">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Adjust weekday pricing</p>
                        <p className="text-sm text-muted-foreground">
                          Increase morning rates by 10-15% to optimize revenue without affecting booking volume
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3">
                      <div className="flex-none mt-0.5 bg-green-50 rounded-full p-1">
                        <CalendarIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Expand availability</p>
                        <p className="text-sm text-muted-foreground">
                          Add early morning slots (6-9am) to attract sunrise photo shoot bookings
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3">
                      <div className="flex-none mt-0.5 bg-purple-50 rounded-full p-1">
                        <Building className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Enhance listing details</p>
                        <p className="text-sm text-muted-foreground">
                          Add more information about lighting equipment and parking options to improve searchability
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3">
                      <div className="flex-none mt-0.5 bg-amber-50 rounded-full p-1">
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Improve response time</p>
                        <p className="text-sm text-muted-foreground">
                          Enable mobile notifications to respond to inquiries faster and increase booking conversion
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Location Performance Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
            <CardDescription>
              Detailed metrics for all your locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-right py-3 px-4">Bookings</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Avg. Rating</th>
                    <th className="text-right py-3 px-4">Occupancy</th>
                    <th className="text-right py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locationPerformance && locationPerformance.length > 0 ? (
                    locationPerformance.map((location: any) => (
                      <tr key={location.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{location.title}</div>
                          <div className="text-sm text-muted-foreground">{location.city}</div>
                        </td>
                        <td className="text-right py-3 px-4">{location.totalBookings}</td>
                        <td className="text-right py-3 px-4">${(location.revenue || 0).toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end">
                            <span>{location.averageRating || 'N/A'}</span>
                            {location.averageRating && (
                              <span className="text-yellow-500 ml-1">★</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end">
                            <span>{location.occupancyRate}%</span>
                            <div className="ml-2 w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full" 
                                style={{ width: `${location.occupancyRate}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                            {location.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No location performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}