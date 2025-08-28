import express, { Application, Express } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { setupAuth } from "./auth";

export function setupRoutes(app: Express) {
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

  // Setup auth routes
  setupAuth(app).catch(error => {
    console.error("🔍 Failed to setup auth routes:", error);
  });

  // Enhanced registration endpoint (moved here to ensure it always works)
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
      } catch (dbError) {
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
    } catch (error) {
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
