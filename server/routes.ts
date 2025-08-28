import express, { Application, Express } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { setupAuth, hashPassword } from "./auth"; // Import hashPassword
import passport from "passport";
import session from "express-session";

export function setupRoutes(app: Express) {
  // Add essential session middleware FIRST (before any routes that need it)
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

  // Health check endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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

  // Setup auth routes FIRST (this sets up Passport.js and req.login)
  setupAuth(app).catch(error => {
    console.error("🔍 Failed to setup auth routes:", error);
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
      console.log("🔍 Request body:", JSON.stringify(req.body, null, 2));
      console.log("🔍 Request headers:", JSON.stringify(req.headers, null, 2));
      console.log("🔍 Registration request received:", { 
        username: req.body.username, 
        email: req.body.email,
        hasPassword: !!req.body.password,
        bodyKeys: Object.keys(req.body)
      });

      // Ensure we always send JSON responses
      res.setHeader('Content-Type', 'application/json');

      // Import storage dynamically to avoid circular dependencies
      const { storage } = await import("./storage");

      // Test database connection first
      try {
        console.log("🔍 Testing database connection...");
        const testResult = await storage.executeRawQuery("SELECT 1 as test");
        console.log("🔍 Database connection test result:", testResult);
      } catch (dbError: any) {
        console.error("🔍 Database connection test failed:", dbError);
        return res.status(500).json({ 
          success: false, 
          message: "Database connection failed. Please try again later.",
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }

      // Validate required fields
      if (!req.body.username || !req.body.password) {
        console.log("🔍 Missing required fields");
        return res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
      }

      console.log("🔍 Checking if username exists...");
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("🔍 Username already exists:", req.body.username);
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }

      // Hash password
      console.log("🔍 Hashing password...");
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(req.body.password);
      console.log("🔍 Password hashed successfully");

      // Create user
      console.log("🔍 Creating user in database...");
      console.log("🔍 User data to insert:", {
        username: req.body.username,
        password: hashedPassword ? "***HASHED***" : "MISSING",
        email: req.body.email,
        roles: ["owner", "client"]
      });
      
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        roles: ["owner", "client"], // Automatically assign both roles
      });

      console.log("🔍 User created successfully:", user);
      console.log("🔍 User ID:", user.id);

      console.log("🔍 User created successfully, attempting login...");
      
      // Check if req.login is available (Passport.js should be set up by now)
      if (typeof req.login === 'function') {
        req.login(user, (err) => {
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
    } catch (error: any) {
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
}
