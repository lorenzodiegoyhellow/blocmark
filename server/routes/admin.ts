import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Create the admin router
const adminRouter = Router();

// Middleware to check if user is an admin or editor with permissions
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  console.log('[ADMIN MIDDLEWARE] Checking admin access for:', req.path);
  console.log('[ADMIN MIDDLEWARE] req.user:', req.user);
  console.log('[ADMIN MIDDLEWARE] Session ID:', req.sessionID);
  
  if (!req.user) {
    console.log('[ADMIN MIDDLEWARE] No user in request, returning 401');
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUser(req.user.id);
  if (!user) {
    console.log('[ADMIN MIDDLEWARE] User not found in storage:', req.user.id);
    return res.status(401).json({ error: "User not found" });
  }

  console.log('[ADMIN MIDDLEWARE] User roles:', user.roles);
  
  // Check if user is admin (full access)
  if (user.roles.includes("admin")) {
    console.log('[ADMIN MIDDLEWARE] Admin access granted');
    return next();
  }
  
  // Check if user is editor with permissions for this specific route
  if (user.roles.includes("editor")) {
    // Extract the section from the path (e.g., /users, /locations, etc.)
    const pathSegments = req.path.split('/').filter(Boolean);
    const section = pathSegments[0] || '';
    
    console.log('[ADMIN MIDDLEWARE] Editor checking permissions for section:', section);
    
    // Map route sections to permission keys
    const sectionPermissionMap: Record<string, keyof typeof user.editorPermissions> = {
      'users': 'users',
      'locations': 'locations',
      'bookings': 'bookings',
      'spotlight': 'spotlight',
      'secret-corners': 'secretCorners',
      'blog': 'blog',
      'conversations': 'conversations',
      'concierge': 'concierge',
      'logs': 'logs',
      'analytics': 'analytics',
      'reports': 'reports',
      'check-admin': 'users' // Special case for check-admin endpoint
    };
    
    const permissionKey = sectionPermissionMap[section];
    
    if (permissionKey && user.editorPermissions && user.editorPermissions[permissionKey]) {
      console.log('[ADMIN MIDDLEWARE] Editor has permission for section:', section);
      return next();
    }
    
    console.log('[ADMIN MIDDLEWARE] Editor lacks permission for section:', section);
    return res.status(403).json({ 
      error: "Forbidden: You don't have permission to access this section",
      section,
      permissions: user.editorPermissions
    });
  }
  
  console.log('[ADMIN MIDDLEWARE] User does not have admin or editor role');
  return res.status(403).json({ error: "Forbidden: Admin or editor access required" });
};

// Debug endpoint to check admin status (before admin middleware)
adminRouter.get("/check-admin", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({ isAdmin: false, reason: "Not authenticated", user: null });
  }

  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.json({ isAdmin: false, reason: "User not found", userId: req.user.id });
  }

  const isAdmin = user.roles.includes("admin");
  return res.json({ 
    isAdmin, 
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    sessionUser: req.user
  });
});

// Apply admin middleware to all routes
adminRouter.use(isAdmin);

// User Management
adminRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user with detailed information
adminRouter.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get user's locations
    const userLocations = await storage.getLocationsByOwner(userId);
    
    // Get user's bookings
    const userBookings = await storage.getUserBookings(userId);
    
    // Return detailed user info
    res.json({
      ...user,
      // Add additional user stats
      stats: {
        totalLocations: userLocations.length,
        activeLocations: userLocations.filter(loc => loc.status === "approved").length,
        pendingLocations: userLocations.filter(loc => loc.status === "pending").length,
        totalBookings: userBookings.length,
        activeBookings: userBookings.filter(booking => 
          ["pending", "confirmed", "payment_pending"].includes(booking.status)
        ).length,
        cancelledBookings: userBookings.filter(booking => 
          ["cancelled", "rejected", "refunded"].includes(booking.status)
        ).length
      }
    });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

adminRouter.get("/users/status/:status", async (req: Request, res: Response) => {
  try {
    const status = req.params.status as "active" | "banned" | "suspended";
    if (!["active", "banned", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const users = await storage.getUsersByStatus(status);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users by status" });
  }
});

adminRouter.patch("/users/:userId/status", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    const schema = z.object({
      status: z.enum(["active", "banned", "suspended"]),
      reason: z.string().min(1).max(500),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { status, reason } = result.data;
    const adminId = req.user!.id;
    
    const updatedUser = await storage.updateUserStatus(userId, status, reason, adminId);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Get user locations
adminRouter.get("/users/:userId/locations", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const userLocations = await storage.getLocationsByOwner(userId);
    res.json(userLocations);
  } catch (error) {
    console.error("Failed to fetch user locations:", error);
    res.status(500).json({ error: "Failed to fetch user locations" });
  }
});

// Add endpoint for updating user roles
adminRouter.patch("/users/:userId/roles", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    const schema = z.object({
      roles: z.array(z.string().min(1))
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { roles } = result.data;
    
    // Validate roles to ensure they are valid
    for (const role of roles) {
      if (!["admin", "owner", "client", "editor"].includes(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` });
      }
    }
    
    // Get the user to update
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Prevent changes to the primary admin (user ID 1)
    if (userId === 1) {
      return res.status(403).json({ error: "Cannot modify primary admin user roles" });
    }
    
    // Update user with new roles
    const updatedUser = await storage.updateUser(userId, { roles });
    
    // Create admin log
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "user_roles_update",
      targetType: "user",
      targetId: userId,
      details: { 
        previousRoles: user.roles,
        newRoles: roles
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user roles:", error);
    res.status(500).json({ error: "Failed to update user roles" });
  }
});

// Add endpoint for updating editor permissions
adminRouter.patch("/users/:userId/editor-permissions", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    const schema = z.object({
      permissions: z.object({
        users: z.boolean(),
        locations: z.boolean(),
        bookings: z.boolean(),
        spotlight: z.boolean(),
        secretCorners: z.boolean(),
        blog: z.boolean(),
        conversations: z.boolean(),
        concierge: z.boolean(),
        logs: z.boolean(),
        analytics: z.boolean(),
        reports: z.boolean()
      })
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { permissions } = result.data;
    
    // Get the user to update
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Only allow updating permissions for users with editor role
    if (!user.roles.includes("editor")) {
      return res.status(400).json({ error: "User must have editor role to set permissions" });
    }
    
    // Update user with new permissions
    const updatedUser = await storage.updateUserEditorPermissions(userId, permissions);
    
    // Create admin log
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "editor_permissions_update",
      targetType: "user",
      targetId: userId,
      details: { 
        previousPermissions: user.editorPermissions,
        newPermissions: permissions
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating editor permissions:", error);
    res.status(500).json({ error: "Failed to update editor permissions" });
  }
});

// Delete user endpoint
adminRouter.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Prevent deletion of primary admin (user ID 1)
    if (userId === 1) {
      return res.status(403).json({ error: "Cannot delete primary admin user" });
    }
    
    // Prevent self-deletion
    if (userId === req.user!.id) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }
    
    // Delete the user
    await storage.deleteUser(userId);
    
    // Create admin log
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "user_delete",
      targetType: "user",
      targetId: userId,
      details: { 
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    });
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ 
      error: "Failed to delete user",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Location Management
adminRouter.get("/locations", async (req: Request, res: Response) => {
  try {
    const locations = await storage.getLocations();
    
    // Fetch owner information for each location
    const locationsWithOwners = await Promise.all(
      locations.map(async (location) => {
        if (location.ownerId) {
          const owner = await storage.getUser(location.ownerId);
          return {
            ...location,
            ownerName: owner ? owner.username : undefined
          };
        }
        return location;
      })
    );
    
    res.json(locationsWithOwners);
  } catch (error) {
    console.error("Failed to fetch locations with owners:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Delete location endpoint
adminRouter.delete("/locations/:locationId", async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.locationId, 10);
    
    // Check if location exists
    const location = await storage.getLocation(locationId);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    // Delete the location
    await storage.deleteLocation(locationId);
    
    // Create admin log
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "location_delete",
      targetType: "location",
      targetId: locationId,
      details: { 
        locationTitle: location.title,
        locationStatus: location.status
      }
    });
    
    res.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.error("Failed to delete location:", error);
    res.status(500).json({ 
      error: "Failed to delete location",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

adminRouter.get("/locations/status/:status", async (req: Request, res: Response) => {
  try {
    const status = req.params.status as "pending" | "approved" | "rejected";
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const locations = await storage.getLocationsByStatus(status);
    
    // Fetch owner information for each location
    const locationsWithOwners = await Promise.all(
      locations.map(async (location) => {
        if (location.ownerId) {
          const owner = await storage.getUser(location.ownerId);
          return {
            ...location,
            ownerName: owner ? owner.username : undefined
          };
        }
        return location;
      })
    );
    
    res.json(locationsWithOwners);
  } catch (error) {
    console.error("Failed to fetch locations by status with owners:", error);
    res.status(500).json({ error: "Failed to fetch locations by status" });
  }
});

adminRouter.patch("/locations/:locationId/status", async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.locationId, 10);
    
    const schema = z.object({
      status: z.enum(["pending", "approved", "rejected"]),
      reason: z.union([
        z.string().min(1).max(500),  // Non-empty string
        z.string().length(0),        // Empty string
        z.undefined()                // Undefined
      ]).optional(),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { status } = result.data;
    // Handle empty or undefined reason, especially for approved locations
    let reason = result.data.reason || "";
    const adminId = req.user!.id;
    
    // Get the current location to know its previous status
    const location = await storage.getLocation(locationId);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    // Update the location status
    const updatedLocation = await storage.updateLocationStatus(locationId, status, reason, adminId);
    
    // Send enhanced response with information about the update
    res.json({
      ...updatedLocation,
      adminAction: {
        previousStatus: location.status,
        newStatus: status,
        timestamp: new Date().toISOString(),
        reason
      }
    });
  } catch (error) {
    console.error("Failed to update location status:", error);
    res.status(500).json({ 
      error: "Failed to update location status",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get location edit history
adminRouter.get("/locations/:locationId/history", async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.locationId, 10);
    
    // Check if location exists
    const location = await storage.getLocation(locationId);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    // Get location edit history
    const history = await storage.getLocationEditHistory(locationId);
    
    res.json({
      location: {
        id: location.id,
        title: location.title,
        ownerId: location.ownerId
      },
      history
    });
  } catch (error) {
    console.error("Failed to fetch location history:", error);
    res.status(500).json({ error: "Failed to fetch location history" });
  }
});

// Booking Management
adminRouter.get("/bookings", async (req: Request, res: Response) => {
  try {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

adminRouter.patch("/bookings/:bookingId", async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    
    // We use a dynamic schema since we want to allow partial updates
    const schema = z.object({
      status: z.enum(["pending", "confirmed", "cancelled", "rejected", "payment_pending", "refund_pending", "refunded"]).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      totalPrice: z.number().int().positive().optional(),
      activityType: z.string().optional(),
      projectName: z.string().optional(),
      renterCompany: z.string().optional(),
      projectDescription: z.string().optional(),
      guestCount: z.number().int().positive().optional(),
      reason: z.string().min(1).max(500).optional(),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const data = result.data;
    const adminId = req.user!.id;
    
    // Get the current booking to create a history record
    const currentBooking = await storage.getBooking(bookingId);
    if (!currentBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Update the booking
    const updateData: any = { ...data };
    delete updateData.reason; // Remove reason from update data
    
    // Set the admin tracking fields
    updateData.lastEditedBy = adminId;
    updateData.lastEditedAt = new Date();
    
    // Update the booking
    const updatedBooking = await storage.updateBooking(bookingId, updateData);
    
    // Create a history record
    await storage.createBookingEditHistory({
      bookingId,
      editorId: adminId,
      previousData: currentBooking,
      newData: updatedBooking,
      reason: data.reason || "Admin update",
      notifiedClient: true,
    });
    
    // Create an admin log
    await storage.createAdminLog({
      adminId,
      action: "booking_update",
      targetType: "booking",
      targetId: bookingId,
      details: { 
        changes: updateData,
        reason: data.reason || "Admin update"
      }
    });
    
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

adminRouter.post("/bookings/:bookingId/refund", async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    
    const schema = z.object({
      amount: z.number().int().positive(),
      reason: z.string().min(1).max(500),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { amount, reason } = result.data;
    const adminId = req.user!.id;
    
    const updatedBooking = await storage.processRefund(bookingId, amount, reason, adminId);
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to process refund" });
  }
});

// Message Monitoring
adminRouter.get("/conversations", async (req: Request, res: Response) => {
  try {
    const conversations = await storage.getAllUserConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

adminRouter.get("/messages", async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string, 10) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    
    const messages = await storage.getAdminFilteredMessages({
      userId,
      locationId,
      dateFrom,
      dateTo,
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Admin Logs
adminRouter.get("/logs", async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const adminId = req.query.adminId ? parseInt(req.query.adminId as string, 10) : undefined;
    const targetType = req.query.targetType as string | undefined;
    const targetId = req.query.targetId ? parseInt(req.query.targetId as string, 10) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    
    const logs = await storage.getAdminLogs({
      adminId,
      targetType,
      targetId,
      dateFrom,
      dateTo,
    });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin logs" });
  }
});

// Content Moderation Alerts
adminRouter.get("/moderation-alerts", async (req: Request, res: Response) => {
  try {
    const { resolved, violationType, locationId } = req.query;
    
    const filter: any = {};
    if (resolved !== undefined) {
      filter.resolved = resolved === 'true';
    }
    if (violationType) {
      filter.violationType = violationType as string;
    }
    if (locationId) {
      filter.locationId = parseInt(locationId as string);
    }
    
    const alerts = await storage.getContentModerationAlerts(filter);
    res.json(alerts);
  } catch (error) {
    console.error("Failed to fetch moderation alerts:", error);
    res.status(500).json({ 
      message: "Failed to fetch moderation alerts",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Resolve moderation alert
adminRouter.post("/moderation-alerts/:id/resolve", async (req: Request, res: Response) => {
  try {
    const alertId = parseInt(req.params.id);
    const adminId = req.user!.id;
    
    const resolved = await storage.resolveContentModerationAlert(alertId, adminId);
    
    // Log the admin action
    await storage.createAdminLog({
      adminId,
      action: 'resolve_moderation_alert',
      targetType: 'moderation_alert',
      targetId: alertId,
      details: {
        violationType: resolved.violationType,
        messageId: resolved.messageId
      },
      ipAddress: req.ip || 'unknown'
    });
    
    res.json(resolved);
  } catch (error) {
    console.error("Failed to resolve moderation alert:", error);
    res.status(500).json({ 
      message: "Failed to resolve moderation alert",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Analytics Endpoints
adminRouter.get("/analytics/users", async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe as string || 'all';
    const users = await storage.getAllUsers();
    
    // Get recently active users based on timeframe
    const now = new Date();
    let activeUsers = [];
    
    if (timeframe === 'daily') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      activeUsers = users.filter(user => user.lastLogin && new Date(user.lastLogin) >= yesterday);
    } else if (timeframe === 'weekly') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      activeUsers = users.filter(user => user.lastLogin && new Date(user.lastLogin) >= lastWeek);
    } else if (timeframe === 'monthly') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      activeUsers = users.filter(user => user.lastLogin && new Date(user.lastLogin) >= lastMonth);
    } else if (timeframe === 'yearly') {
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      activeUsers = users.filter(user => user.lastLogin && new Date(user.lastLogin) >= lastYear);
    } else {
      // Default to all users with at least one login
      activeUsers = users.filter(user => user.lastLogin);
    }
    
    // Calculate user growth over time
    const today = new Date();
    const usersByMonth = {};
    
    // Start from 12 months ago
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(month.getMonth() - i);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      
      // Count users created up to this month
      const usersUntilMonth = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt <= month;
      }).length;
      
      usersByMonth[monthKey] = usersUntilMonth;
    }
    
    // Get user roles distribution
    const roleDistribution = {
      admin: users.filter(user => user.roles.includes('admin')).length,
      owner: users.filter(user => user.roles.includes('owner')).length,
      client: users.filter(user => user.roles.includes('client')).length
    };
    
    res.json({
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      newUsersByMonth: usersByMonth,
      roleDistribution
    });
  } catch (error) {
    console.error("Failed to fetch user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

adminRouter.get("/analytics/bookings", async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe as string || 'all';
    const bookings = await storage.getAllBookings();
    
    // Filter bookings based on timeframe
    const now = new Date();
    let filteredBookings = [...bookings];
    
    if (timeframe === 'daily') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      filteredBookings = bookings.filter(booking => new Date(booking.createdAt) >= yesterday);
    } else if (timeframe === 'weekly') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      filteredBookings = bookings.filter(booking => new Date(booking.createdAt) >= lastWeek);
    } else if (timeframe === 'monthly') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filteredBookings = bookings.filter(booking => new Date(booking.createdAt) >= lastMonth);
    } else if (timeframe === 'yearly') {
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      filteredBookings = bookings.filter(booking => new Date(booking.createdAt) >= lastYear);
    }
    
    // Calculate booking stats
    const bookingStats = {
      total: filteredBookings.length,
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
      rejected: filteredBookings.filter(b => b.status === 'rejected').length,
      totalRevenue: filteredBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.totalPrice, 0)
    };
    
    // Get bookings by month (for the last 12 months)
    const bookingsByMonth = {};
    const revenueByMonth = {};
    
    // Start from 12 months ago
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now);
      month.setMonth(month.getMonth() - i);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      bookingsByMonth[monthKey] = monthBookings.length;
      
      // Calculate revenue for confirmed bookings this month
      const monthRevenue = monthBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      revenueByMonth[monthKey] = monthRevenue;
    }
    
    res.json({
      bookingStats,
      bookingsByMonth,
      revenueByMonth
    });
  } catch (error) {
    console.error("Failed to fetch booking analytics:", error);
    res.status(500).json({ error: "Failed to fetch booking analytics" });
  }
});

adminRouter.get("/analytics/locations", async (req: Request, res: Response) => {
  try {
    const locations = await storage.getLocations();
    const bookings = await storage.getAllBookings();
    
    // Get top booked locations
    const locationBookingCounts = {};
    
    bookings.forEach(booking => {
      if (!locationBookingCounts[booking.locationId]) {
        locationBookingCounts[booking.locationId] = 0;
      }
      locationBookingCounts[booking.locationId]++;
    });
    
    // Sort locations by booking count
    const topBookedLocations = Object.entries(locationBookingCounts)
      .map(([locationId, count]) => ({
        locationId: parseInt(locationId),
        bookingCount: count
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);
    
    // Enhance with location details
    const enhancedTopLocations = await Promise.all(
      topBookedLocations.map(async (item) => {
        const location = locations.find(loc => loc.id === item.locationId);
        return {
          ...item,
          title: location ? location.title : `Location #${item.locationId}`,
          status: location ? location.status : 'unknown',
          country: location ? location.country : 'unknown'
        };
      })
    );
    
    // Location stats
    const locationStats = {
      total: locations.length,
      approved: locations.filter(loc => loc.status === 'approved').length,
      pending: locations.filter(loc => loc.status === 'pending').length,
      rejected: locations.filter(loc => loc.status === 'rejected').length,
      byCountry: {
        'USA': locations.filter(loc => loc.country === 'USA').length,
        'Italy': locations.filter(loc => loc.country === 'Italy').length,
        'Other': locations.filter(loc => loc.country !== 'USA' && loc.country !== 'Italy').length
      }
    };
    
    // Get locations by month (for the last 12 months)
    const now = new Date();
    const locationsByMonth = {};
    
    // Start from 12 months ago
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now);
      month.setMonth(month.getMonth() - i);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthLocations = locations.filter(location => {
        const createdAt = new Date(location.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });
      
      locationsByMonth[monthKey] = monthLocations.length;
    }
    
    res.json({
      topBookedLocations: enhancedTopLocations,
      locationStats,
      locationsByMonth
    });
  } catch (error) {
    console.error("Failed to fetch location analytics:", error);
    res.status(500).json({ error: "Failed to fetch location analytics" });
  }
});

adminRouter.get("/analytics/summary", async (req: Request, res: Response) => {
  try {
    // Get high-level metrics for dashboard
    const users = await storage.getAllUsers();
    const locations = await storage.getLocations();
    const bookings = await storage.getAllBookings();
    const messages = await storage.getAdminFilteredMessages({});
    
    // Calculate active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(user => 
      user.lastLogin && new Date(user.lastLogin) >= thirtyDaysAgo
    );
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = users.filter(user => 
      new Date(user.createdAt) >= startOfMonth
    );
    
    // Calculate revenue from confirmed bookings
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Calculate revenue for this month
    const revenueThisMonth = bookings
      .filter(b => 
        b.status === 'confirmed' && 
        new Date(b.createdAt) >= startOfMonth
      )
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get new bookings this month
    const newBookingsThisMonth = bookings.filter(booking => 
      new Date(booking.createdAt) >= startOfMonth
    );
    
    // Get new locations this month
    const newLocationsThisMonth = locations.filter(location => 
      new Date(location.createdAt) >= startOfMonth
    );
    
    res.json({
      // User stats
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      newUsersThisMonth: newUsersThisMonth.length,
      
      // Location stats
      totalLocations: locations.length,
      approvedLocations: locations.filter(loc => loc.status === 'approved').length,
      pendingLocations: locations.filter(loc => loc.status === 'pending').length,
      newLocationsThisMonth: newLocationsThisMonth.length,
      
      // Booking stats
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      newBookingsThisMonth: newBookingsThisMonth.length,
      
      // Financial stats
      totalRevenue,
      revenueThisMonth,
      
      // Message stats
      totalMessages: messages.length,
      
      // Last updated timestamp
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Failed to fetch analytics summary:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// Site Settings Management
adminRouter.get("/settings", async (req: Request, res: Response) => {
  try {
    const settings = await storage.getAllSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    res.status(500).json({ error: "Failed to fetch site settings" });
  }
});

adminRouter.get("/settings/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const setting = await storage.getSiteSetting(key);
    
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    res.json(setting);
  } catch (error) {
    console.error("Failed to fetch site setting:", error);
    res.status(500).json({ error: "Failed to fetch site setting" });
  }
});

adminRouter.post("/settings", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      key: z.string().min(1),
      value: z.string(),
      description: z.string().optional(),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { key, value, description } = result.data;
    const adminId = req.user!.id;
    
    const setting = await storage.setSiteSetting(key, value, description, adminId);
    
    // Create an admin log for this action
    await storage.createAdminLog({
      adminId,
      action: "site_setting_update",
      targetType: "site_setting",
      targetId: setting.id,
      details: { 
        key,
        value,
        description,
        action: "updated"
      }
    });
    
    res.json(setting);
  } catch (error) {
    console.error("Failed to update site setting:", error);
    res.status(500).json({ error: "Failed to update site setting" });
  }
});

// Get maintenance mode status
adminRouter.get("/maintenance", async (req: Request, res: Response) => {
  try {
    const maintenanceSetting = await storage.getSiteSetting('maintenance_mode');
    const isEnabled = maintenanceSetting?.value === 'true';
    
    res.json({
      enabled: isEnabled,
      updatedAt: maintenanceSetting?.updatedAt || null,
      updatedBy: maintenanceSetting?.updatedBy || null
    });
  } catch (error) {
    console.error("Failed to get maintenance mode status:", error);
    res.status(500).json({ error: "Failed to get maintenance mode status" });
  }
});

// Convenience endpoint specifically for maintenance mode toggle
adminRouter.put("/maintenance", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      enabled: z.boolean(),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid input", details: result.error.format() });
    }
    
    const { enabled } = result.data;
    const adminId = req.user!.id;
    
    const setting = await storage.setSiteSetting(
      'maintenance_mode', 
      enabled.toString(), 
      'Controls whether the site is in maintenance mode',
      adminId
    );
    
    // Create an admin log for this action
    await storage.createAdminLog({
      adminId,
      action: enabled ? "maintenance_enabled" : "maintenance_disabled",
      targetType: "site_setting",
      targetId: setting.id,
      details: { 
        maintenanceEnabled: enabled,
        action: enabled ? "enabled" : "disabled"
      }
    });
    
    res.json({ 
      success: true, 
      maintenanceMode: enabled,
      message: enabled ? "Maintenance mode enabled" : "Maintenance mode disabled"
    });
  } catch (error) {
    console.error("Failed to toggle maintenance mode:", error);
    res.status(500).json({ error: "Failed to toggle maintenance mode" });
  }
});

export default adminRouter;