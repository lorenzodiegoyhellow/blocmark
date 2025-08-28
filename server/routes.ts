import express, { Application, Express } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { setupAuth } from "./auth";

export function setupRoutes(app: Express) {
  // Health check endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
