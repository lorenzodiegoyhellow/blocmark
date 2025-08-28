import express, { Application } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { setupAuth } from "./auth";

export function setupRoutes(app: Application) {
  // Health check endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/health/db", async (req, res) => {
    try {
      console.log("🔍 Database health check requested");
      // Import storage dynamically to avoid circular dependencies
      const { storage } = await import("./storage");
      const testResult = await storage.executeRawQuery("SELECT 1 as test");
      console.log("🔍 Database health check result:", testResult);
      res.json({ 
        status: "healthy", 
        database: "connected",
        result: testResult 
      });
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
}
