import express, { Express } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import session from "express-session";
import { sql } from "drizzle-orm";

export function setupRoutes(app: Express) {
  // Setup session middleware FIRST (before any routes that need it)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport.js
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup auth routes (this sets up Passport.js strategies and routes)
  setupAuth(app).catch(error => {
    console.error("🔍 Failed to setup auth routes:", error);
  });

  // Health check endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: "2fd38f4-deployed" });
  });

  // Enhanced database health check endpoint
  app.get("/api/health/db", async (req, res) => {
    try {
      console.log("🔍 Database health check requested");
      
      // Import storage dynamically to avoid circular dependencies
      const { storage } = await import("./storage");
      
      // Test basic connection
      const testResult = await storage.executeRawQuery("SELECT 1 as test");
      console.log("🔍 Database connection test result:", testResult);
      
      // Test if users table exists
      try {
        const tableCheck = await storage.executeRawQuery("SELECT COUNT(*) as user_count FROM users");
        console.log("🔍 Users table check result:", tableCheck);
        
        res.json({ 
          status: "healthy", 
          database: "connected",
          users_table: "exists",
          result: testResult,
          user_count: tableCheck[0]?.user_count
        });
      } catch (tableError: any) {
        console.error("🔍 Users table check failed:", tableError);
        res.json({ 
          status: "healthy", 
          database: "connected",
          users_table: "missing",
          result: testResult,
          table_error: tableError.message
        });
      }
    } catch (error: any) {
      console.error("🔍 Database health check failed:", error);
      res.status(500).json({ 
        status: "unhealthy", 
        database: "disconnected",
        error: error.message 
      });
    }
  });

  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });

  app.get("/api/protected", ensureAuthenticated, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });



  // Enhanced login endpoint (defined here to ensure it's always registered)
  app.post("/api/login", async (req, res, next) => {
    console.log("🔍 ===== LOGIN START =====");
    console.log("🔍 Login request received:", req.body);
    
    // Check if Passport.js is available
    if (typeof passport === 'undefined') {
      console.error("🔍 Passport.js not available");
      return res.status(500).json({ 
        success: false, 
        message: "Authentication system not available" 
      });
    }

    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        console.error("🔍 Authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("🔍 Authentication failed:", info);
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      console.log("🔍 User authenticated, attempting login...");
      
      req.login(user, async (err: any) => {
        if (err) {
          console.error("🔍 Login error:", err);
          return next(err);
        }
        
        try {
          // Update last login IP and timestamp
          const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
          console.log("🔍 Updating user login info...");
          
          // Import storage dynamically to avoid startup issues
          const { storage } = await import("./storage");
          await storage.updateUser(user.id, {
            lastLoginIp: clientIp,
            lastLoginAt: new Date()
          });
          
          console.log("🔍 User login info updated successfully");
        } catch (updateError: any) {
          console.error("🔍 Failed to update user login info:", updateError);
          // Don't fail the login if this update fails
        }
        
        console.log("🔍 User authenticated successfully:", user.username);
        console.log("🔍 ===== LOGIN SUCCESS =====");
        
        return res.status(200).json({ 
          success: true, 
          user: req.user 
        });
      });
    })(req, res, next);
  });

  // Enhanced registration endpoint (defined AFTER setupAuth so req.login is available)
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("🔍 ===== REGISTRATION START =====");
      console.log("🔍 Request body:", req.body);
      console.log("🔍 Request headers:", req.headers);

      const { username, password, email, phoneNumber, termsAccepted } = req.body;

      console.log("🔍 Registration request received:", {
        username,
        email,
        hasPassword: !!password,
        bodyKeys: Object.keys(req.body)
      });

      // Test database connection first
      console.log("🔍 Testing database connection...");
      try {
        const { storage } = await import("./storage");
        const dbTest = await storage.db.execute("SELECT 1 as test");
        console.log("🔍 Database connection test result:", dbTest);
      } catch (dbError: any) {
        console.error("🔍 Database connection test failed:", dbError);
        return res.status(500).json({ 
          success: false, 
          message: "Database connection failed" 
        });
      }

      // Validate input
      if (!username || !password || !email || !termsAccepted) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Check if username already exists
      console.log("🔍 Checking if username exists...");
      const { storage } = await import("./storage");
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }

      // Hash password
      console.log("🔍 Hashing password...");
      const hashedPassword = await hashPassword(password);
      console.log("🔍 Password hashed successfully");

      // Create user
      console.log("🔍 Creating user in database...");
      const userData = {
        username,
        password: hashedPassword,
        email,
        roles: ['owner', 'client']
      };
      console.log("🔍 User data to insert:", {
        ...userData,
        password: '***HASHED***'
      });

      const user = await storage.createUser(userData);
      console.log("🔍 User created successfully:", user);
      console.log("🔍 User ID:", user.id);

      console.log("🔍 User created successfully, attempting login...");
      // Check if req.login is available (Passport.js should be set up by now)
      if (typeof req.login === 'function') {
        req.login(user, (err: any) => { // Explicitly type err
          if (err) {
            console.error("🔍 Login error after registration:", err);
            return next(err);
          }
          console.log("🔍 Login successful, sending response...");
          const responseData = {
            success: true,
            user: user,
            message: "Account created successfully",
            id: user.id,
            username: user.username
          };
          console.log("🔍 Sending response:", JSON.stringify(responseData, null, 2));
          console.log("🔍 Response status: 201");
          res.status(201).json(responseData);
          console.log("🔍 ===== REGISTRATION SUCCESS =====");
        });
      } else {
        // Fallback if req.login is not available
        console.log("🔍 req.login not available, sending response without login...");
        const responseData = {
          success: true,
          user: user,
          message: "Account created successfully. Please log in.",
          id: user.id,
          username: user.username
        };
        console.log("🔍 Sending response:", JSON.stringify(responseData, null, 2));
        console.log("🔍 Response status: 201");
        res.status(201).json(responseData);
        console.log("🔍 ===== REGISTRATION SUCCESS (NO LOGIN) =====");
      }
    } catch (error: any) { // Explicitly type error
      console.error("🔍 ===== REGISTRATION ERROR =====");
      console.error("🔍 Error details:", error);
      console.error("🔍 Error message:", error.message);
      console.error("🔍 Error stack:", error.stack);

      const errorResponse = {
        success: false,
        message: "Registration failed. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };

      console.log("🔍 Sending error response:", JSON.stringify(errorResponse, null, 2));
      res.status(500).json(errorResponse);
      console.log("🔍 ===== REGISTRATION ERROR END =====");
    }
  });

  // Add missing booking routes to fix dashboard
  app.get("/api/bookings/user", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the new storage function
      const { storage } = await import("./storage");
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings || []);
    } catch (error: any) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch bookings" 
      });
    }
  });

  app.get("/api/bookings/host", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the new storage function
      const { storage } = await import("./storage");
      const bookings = await storage.getBookingsByHostId(userId);
      res.json(bookings || []);
    } catch (error: any) {
      console.error("Error fetching host bookings:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch host bookings" 
      });
    }
  });

  // Add missing messages route
  app.get("/api/messages", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the new storage function
      const { storage } = await import("./storage");
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch messages" 
      });
    }
  });

  // Add missing notifications route
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the new storage function
      const { storage } = await import("./storage");
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch notifications" 
      });
    }
  });

  // Add missing notifications unread count route
  app.get("/api/notifications/unread/count", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the existing storage function
      const { storage } = await import("./storage");
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count: count || 0 });
    } catch (error: any) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch unread count" 
      });
    }
  });

  // Add missing locations owner route
  app.get("/api/locations/owner", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }

      // Use the new storage function
      const { storage } = await import("./storage");
      const locations = await storage.getLocationsByOwnerId(userId);
      res.json(locations || []);
    } catch (error: any) {
      console.error("Error fetching owner locations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch locations" 
      });
    }
  });

  // Add missing pending reviews endpoint for users
  app.get("/api/user/pending-reviews", ensureAuthenticated, async (req, res) => {
    try {
      console.log("🔍 [PENDING-REVIEWS] Starting request for user:", req.user!.id);
      
      const { storage } = await import("./storage");
      console.log("🔍 [PENDING-REVIEWS] Storage imported successfully");
      
      const pendingReviews = await storage.getPendingReviewsForUser(req.user!.id);
      console.log("🔍 [PENDING-REVIEWS] Got pending reviews:", pendingReviews.length);
      
      // Enhance with location info
      const enhancedPendingReviews = await Promise.all(
        pendingReviews.map(async (booking) => {
          const location = await storage.getLocation(booking.locationId);
          return {
            ...booking,
            locationTitle: location?.title || "Unknown Location",
            locationImage: location?.images?.[0] || null
          };
        })
      );
      
      console.log("🔍 [PENDING-REVIEWS] Enhanced reviews:", enhancedPendingReviews.length);
      res.json(enhancedPendingReviews);
    } catch (error: any) {
      console.error("🔍 [PENDING-REVIEWS] Error:", error);
      console.error("🔍 [PENDING-REVIEWS] Error message:", error.message);
      console.error("🔍 [PENDING-REVIEWS] Error stack:", error.stack);
      res.status(500).json({ message: "Failed to get pending reviews", error: error.message });
    }
  });

  // Add missing host pending reviews endpoint
  app.get("/api/reviews/host/pending", ensureAuthenticated, async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const pendingReviews = await storage.getPendingReviewsForHost(req.user!.id);
      
      // Enhance with guest info
      const enhancedPendingReviews = await Promise.all(
        pendingReviews.map(async (booking) => {
          const guest = await storage.getUser(booking.clientId);
          const location = await storage.getLocation(booking.locationId);
          return {
            ...booking,
            guestName: guest?.username || "Unknown Guest",
            guestImage: guest?.profileImage || null,
            locationTitle: location?.title || "Unknown Location",
            locationImage: location?.images?.[0] || null
          };
        })
      );
      
      res.json(enhancedPendingReviews);
    } catch (error: any) {
      console.error("Failed to get host pending reviews:", error);
      res.status(500).json({ message: "Failed to get host pending reviews" });
    }
  });

  // Add missing booking eligibility endpoint
  app.get("/api/user/booking-eligibility", ensureAuthenticated, async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const pendingReviews = await storage.getPendingReviewsForUser(req.user!.id);
      
      if (pendingReviews.length === 0) {
        res.json({ eligible: true, pendingReviews: 0 });
      } else {
        res.json({
          eligible: false,
          pendingReviews: pendingReviews.length,
          message: "You must complete pending reviews before making new bookings",
          nextSteps: "Please complete your pending reviews on the dashboard"
        });
      }
    } catch (error: any) {
      console.error("Failed to check booking eligibility:", error);
      // If we can't check, assume eligible to avoid blocking users
      res.json({ eligible: true, pendingReviews: 0 });
    }
  });

  // Debug endpoint to check database table structure
  app.get("/api/debug/tables", ensureAuthenticated, async (req, res) => {
    try {
      const { db } = await import("./db");
      
      // Check if key tables exist and their structure
      const tableChecks: Record<string, any> = {
        users: null,
        locations: null,
        bookings: null,
        reviews: null,
        notifications: null,
        messages: null
      };

      // Check each table
      for (const tableName of Object.keys(tableChecks)) {
        try {
          const result = await db.execute(sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ${tableName} ORDER BY ordinal_position`);
          tableChecks[tableName] = result.rows;
        } catch (error: any) {
          tableChecks[tableName] = { error: error.message };
        }
      }

      res.json({
        message: "Database table structure check",
        tables: tableChecks,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("🔍 [DEBUG] Error checking tables:", error);
      res.status(500).json({ 
        message: "Failed to check database tables", 
        error: error.message 
      });
    }
  });
}
