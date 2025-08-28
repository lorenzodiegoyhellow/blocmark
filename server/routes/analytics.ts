import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval } from "date-fns";

const analyticsRouter = Router();

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Apply authentication to all routes
analyticsRouter.use(ensureAuthenticated);

// Get analytics summary for host's properties
analyticsRouter.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's locations
    const locations = await storage.getLocationsByOwner(userId);
    const locationIds = locations.map(loc => loc.id);
    
    if (locationIds.length === 0) {
      return res.json({
        totalLocations: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        viewsThisMonth: 0,
        bookingsThisMonth: 0,
        revenueThisMonth: 0,
        conversionRate: 0
      });
    }
    
    // Get all bookings for user's locations
    const allBookings = await storage.getAllBookings();
    const userBookings = allBookings.filter(booking => locationIds.includes(booking.locationId));
    
    // Calculate metrics
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get bookings this month
    const startOfThisMonth = startOfMonth(new Date());
    const bookingsThisMonth = userBookings.filter(booking => 
      new Date(booking.createdAt) >= startOfThisMonth
    );
    const revenueThisMonth = bookingsThisMonth
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get reviews for user's locations
    const userReviews = [];
    for (const locationId of locationIds) {
      const locationReviews = await storage.getReviewsByLocation(locationId);
      userReviews.push(...locationReviews);
    }
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
      : 0;
    
    // Calculate views based on bookings with a reasonable multiplier
    const viewsThisMonth = bookingsThisMonth.length * 25; // Assume 25 views per booking
    
    // Calculate conversion rate (bookings / views)
    const conversionRate = viewsThisMonth > 0 ? (bookingsThisMonth.length / viewsThisMonth) * 100 : 0;
    
    res.json({
      totalLocations: locations.length,
      totalBookings: userBookings.length,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      viewsThisMonth,
      bookingsThisMonth: bookingsThisMonth.length,
      revenueThisMonth,
      conversionRate: Math.round(conversionRate * 10) / 10
    });
  } catch (error) {
    console.error("Failed to fetch analytics summary:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// Get booking trends data
analyticsRouter.get("/bookings", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const timeframe = req.query.timeframe as string || 'monthly';
    
    // Get user's locations
    const locations = await storage.getLocationsByOwner(userId);
    const locationIds = locations.map(loc => loc.id);
    
    if (locationIds.length === 0) {
      return res.json({
        chartData: [],
        stats: {
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0
        }
      });
    }
    
    // Get all bookings for user's locations
    const allBookings = await storage.getAllBookings();
    const userBookings = allBookings.filter(booking => locationIds.includes(booking.locationId));
    
    // Generate chart data based on timeframe
    let chartData = [];
    const now = new Date();
    
    if (timeframe === 'daily') {
      // Last 30 days
      const days = eachDayOfInterval({
        start: subDays(now, 29),
        end: now
      });
      
      chartData = days.map(day => {
        const dayBookings = userBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return format(bookingDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        
        const revenue = dayBookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.totalPrice, 0);
        
        return {
          date: format(day, 'MMM dd'),
          bookings: dayBookings.length,
          revenue,
          views: dayBookings.length * 20 // Estimate 20 views per booking
        };
      });
    } else if (timeframe === 'weekly') {
      // Last 7 days with more detail
      const days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now
      });
      
      chartData = days.map(day => {
        const dayBookings = userBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return format(bookingDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        
        const revenue = dayBookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.totalPrice, 0);
        
        return {
          day: format(day, 'EEE'),
          date: format(day, 'MMM dd'),
          bookings: dayBookings.length,
          revenue,
          views: dayBookings.length * 25, // Consistent with monthly calculation
          inquiries: dayBookings.length * 5 // Estimate 5 inquiries per booking
        };
      });
    } else {
      // Monthly view - last 12 months
      const months = eachMonthOfInterval({
        start: subMonths(now, 11),
        end: now
      });
      
      chartData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthBookings = userBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });
        
        const revenue = monthBookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.totalPrice, 0);
        
        return {
          month: format(month, 'MMM'),
          year: format(month, 'yyyy'),
          bookings: monthBookings.length,
          revenue,
          views: monthBookings.length * 25 // Consistent 25 views per booking
        };
      });
    }
    
    // Calculate booking stats
    const stats = {
      total: userBookings.length,
      confirmed: userBookings.filter(b => b.status === 'confirmed').length,
      pending: userBookings.filter(b => b.status === 'pending').length,
      cancelled: userBookings.filter(b => b.status === 'cancelled').length,
      completionRate: userBookings.length > 0 
        ? Math.round((userBookings.filter(b => b.status === 'confirmed').length / userBookings.length) * 100) 
        : 0
    };
    
    res.json({
      chartData,
      stats
    });
  } catch (error) {
    console.error("Failed to fetch booking analytics:", error);
    res.status(500).json({ error: "Failed to fetch booking analytics" });
  }
});

// Get activity type breakdown
analyticsRouter.get("/activity-types", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's locations
    const locations = await storage.getLocationsByOwner(userId);
    const locationIds = locations.map(loc => loc.id);
    
    if (locationIds.length === 0) {
      return res.json([]);
    }
    
    // Get all bookings for user's locations
    const allBookings = await storage.getAllBookings();
    const userBookings = allBookings.filter(booking => 
      locationIds.includes(booking.locationId) && 
      booking.status === 'confirmed'
    );
    
    // Count bookings by activity type
    const activityCounts: { [key: string]: number } = {};
    userBookings.forEach(booking => {
      const type = booking.activityType || 'Other';
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });
    
    // Convert to array format for pie chart
    const data = Object.entries(activityCounts).map(([name, value]) => ({
      name,
      value,
      color: getColorForActivityType(name)
    }));
    
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch activity type analytics:", error);
    res.status(500).json({ error: "Failed to fetch activity type analytics" });
  }
});

// Get location performance data
analyticsRouter.get("/locations", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's locations
    const locations = await storage.getLocationsByOwner(userId);
    
    if (locations.length === 0) {
      return res.json([]);
    }
    
    // Get all bookings
    const allBookings = await storage.getAllBookings();
    
    // Calculate performance metrics for each location
    const locationPerformance = await Promise.all(locations.map(async location => {
      const locationBookings = allBookings.filter(b => b.locationId === location.id);
      const locationReviews = await storage.getReviewsByLocation(location.id);
      
      const confirmedBookings = locationBookings.filter(b => b.status === 'confirmed');
      const revenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const averageRating = locationReviews.length > 0
        ? locationReviews.reduce((sum, review) => sum + review.rating, 0) / locationReviews.length
        : 0;
      
      // Calculate bookings this month
      const startOfThisMonth = startOfMonth(new Date());
      const bookingsThisMonth = locationBookings.filter(booking => 
        new Date(booking.createdAt) >= startOfThisMonth
      ).length;
      
      return {
        id: location.id,
        title: location.title,
        status: location.status,
        totalBookings: locationBookings.length,
        confirmedBookings: confirmedBookings.length,
        revenue,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: locationReviews.length,
        bookingsThisMonth,
        views: 0, // TODO: Implement view tracking
        conversionRate: confirmedBookings.length > 0 && locationBookings.length > 0
          ? Math.round((confirmedBookings.length / locationBookings.length) * 100)
          : 0,
        city: location.city || '',
        occupancyRate: 0 // TODO: Implement based on booking calendar
      };
    }));
    
    // Sort by revenue (best performing first)
    locationPerformance.sort((a, b) => b.revenue - a.revenue);
    
    res.json(locationPerformance);
  } catch (error) {
    console.error("Failed to fetch location analytics:", error);
    res.status(500).json({ error: "Failed to fetch location analytics" });
  }
});

// Helper function to get color for activity types
function getColorForActivityType(type: string): string {
  const colors: { [key: string]: string } = {
    'Photo Shoots': '#0088FE',
    'Filming': '#00C49F',
    'Events': '#FFBB28',
    'Meetings': '#FF8042',
    'Other': '#8884d8'
  };
  return colors[type] || '#8884d8';
}

export default analyticsRouter;