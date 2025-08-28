import { Router, Request, Response } from "express";
import { storage } from "../storage";

export const notificationsRouter = Router();

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  console.log("Notification auth check - isAuthenticated:", req.isAuthenticated ? req.isAuthenticated() : 'undefined');
  console.log("Notification auth check - user:", req.user ? (req.user as any).id : 'no user');
  
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

// Get all notifications for the current user
notificationsRouter.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const notifications = await storage.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread notifications count for the current user
notificationsRouter.get("/unread/count", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const count = await storage.getUnreadNotificationsCount(userId);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({ error: "Failed to fetch unread notification count" });
  }
});

// Mark a specific notification as read
notificationsRouter.patch("/:id/read", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    await storage.markNotificationAsRead(notificationId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read for the current user
notificationsRouter.patch("/read-all", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    await storage.markAllNotificationsAsRead(userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Delete a specific notification
notificationsRouter.delete("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    await storage.deleteNotification(notificationId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// Mark message notifications as read for a specific conversation
notificationsRouter.patch("/messages/read/:userId/:locationId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req.user as any).id;
    const otherUserId = parseInt(req.params.userId);
    const locationId = parseInt(req.params.locationId);
    
    console.log("Marking notifications as read - currentUser:", currentUserId, "otherUser:", otherUserId, "location:", locationId);
    
    // Get all notifications for the current user
    const notifications = await storage.getUserNotifications(currentUserId);
    console.log("Found", notifications.length, "total notifications for user", currentUserId);
    
    // Filter message notifications that match the conversation
    const messageNotifications = notifications.filter(n => 
      n.type === "message_received" && 
      n.relatedType === "message" &&
      !n.read
    );
    
    console.log("Found", messageNotifications.length, "unread message notifications");
    
    // For each unread message notification, check if it belongs to this conversation
    let markedCount = 0;
    for (const notification of messageNotifications) {
      // Get the message details to check if it's from this conversation
      if (notification.relatedId) {
        const message = await storage.getMessage(notification.relatedId);
        if (message && 
            message.locationId === locationId && 
            (message.senderId === otherUserId || message.receiverId === otherUserId)) {
          // Mark this notification as read
          await storage.markNotificationAsRead(notification.id);
          markedCount++;
          console.log("Marked notification", notification.id, "as read for message", message.id);
        }
      }
    }
    
    console.log("Marked", markedCount, "notifications as read");
    res.status(200).json({ success: true, markedCount });
  } catch (error) {
    console.error("Error marking message notifications as read:", error);
    res.status(500).json({ error: "Failed to mark message notifications as read" });
  }
});