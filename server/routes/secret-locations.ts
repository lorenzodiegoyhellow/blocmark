import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertSecretLocationSchema } from "@shared/schema";
import { ZodError } from "zod";

export const secretLocationsRouter = Router();

function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Get all public (approved) secret locations
secretLocationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Only return approved locations to the public
    const secretLocations = await storage.getSecretLocationsByStatus("approved");
    res.json(secretLocations);
  } catch (error) {
    console.error("Error fetching secret locations:", error);
    res.status(500).json({ error: "Failed to fetch secret locations" });
  }
});

// Get featured secret locations
secretLocationsRouter.get("/featured", async (req: Request, res: Response) => {
  try {
    // Return a subset of approved locations marked as featured
    // For now, we'll just return the first 3-5 approved locations as featured
    const approvedLocations = await storage.getSecretLocationsByStatus("approved");
    const featuredLocations = approvedLocations.slice(0, 5); // Get first 5 approved locations
    
    res.json(featuredLocations);
  } catch (error) {
    console.error("Error fetching featured secret locations:", error);
    res.status(500).json({ error: "Failed to fetch featured secret locations" });
  }
});

// Get locations by status (for admin selection)
secretLocationsRouter.get("/status/approved", async (req: Request, res: Response) => {
  try {
    const approvedLocations = await storage.getSecretLocationsByStatus("approved");
    res.json(approvedLocations);
  } catch (error) {
    console.error("Error fetching approved secret locations:", error);
    res.status(500).json({ error: "Failed to fetch approved secret locations" });
  }
});

// Get popular secret locations
secretLocationsRouter.get("/popular", async (req: Request, res: Response) => {
  try {
    // Get approved secret locations and sort by popularity
    const locations = await storage.getSecretLocationsByStatus('approved');
    const popularLocations = locations
      .map((loc: any) => ({ 
        ...loc, 
        views: loc.views || Math.floor(Math.random() * 1000),
        likes: loc.likes || Math.floor(Math.random() * 100)
      }))
      .sort((a: any, b: any) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
      .slice(0, 10);
    res.json(popularLocations);
  } catch (error) {
    console.error("Error fetching popular locations:", error);
    res.json([]); // Return empty array as fallback
  }
});

// Get all secret locations submitted by the authenticated user
secretLocationsRouter.get("/user/mine", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const secretLocations = await storage.getSecretLocationsByUser(userId);
    res.json(secretLocations);
  } catch (error) {
    console.error("Error fetching user's secret locations:", error);
    res.status(500).json({ error: "Failed to fetch your secret locations" });
  }
});

// Create a new secret location
secretLocationsRouter.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Process and fix coordinates if necessary
    let requestData = { ...req.body, userId };
    console.log("Received location data:", requestData);
    
    // Ensure coordinates are correctly processed
    if (requestData.coords && Array.isArray(requestData.coords)) {
      // Make sure coordinates exist and are in the correct format
      const [lat, lng] = requestData.coords;
      
      // Validate latitude value (should be between -90 and 90)
      let validLat = parseFloat(lat);
      let validLng = parseFloat(lng);
      
      console.log("Processing coordinates:", validLat, validLng);
      
      // Fix invalid coordinates (swap if necessary)
      if (Math.abs(validLat) > 90 && Math.abs(validLng) <= 90) {
        // Coordinates might be swapped
        console.log("Coordinates appear to be swapped, fixing...");
        requestData.latitude = validLng.toString();
        requestData.longitude = validLat.toString();
      } else {
        // Coordinates are in the right order or at least in valid ranges
        requestData.latitude = validLat.toString();
        requestData.longitude = validLng.toString();
      }
      
      // Ensure the coords field is formatted correctly for client-side use
      requestData.coords = [parseFloat(requestData.latitude), parseFloat(requestData.longitude)];
      console.log("Final processed coordinates:", requestData.coords);
    }
    
    // Validate request data
    const validatedData = insertSecretLocationSchema.parse(requestData);
    
    // Create the secret location
    const secretLocation = await storage.createSecretLocation(validatedData);
    
    res.status(201).json(secretLocation);
  } catch (error) {
    console.error("Error creating secret location:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Failed to create secret location" });
  }
});

// Update an existing secret location (only by owner and only if not approved/rejected yet)
secretLocationsRouter.patch("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Get the current secret location
    const existingLocation = await storage.getSecretLocation(id);
    
    if (!existingLocation) {
      return res.status(404).json({ error: "Secret location not found" });
    }
    
    // Check if user is the owner
    if (existingLocation.userId !== userId) {
      return res.status(403).json({ error: "You don't have permission to update this location" });
    }
    
    // Check if location can be updated (must be in pending state)
    if (existingLocation.status !== "pending") {
      return res.status(403).json({ 
        error: `Cannot update location with status: ${existingLocation.status}. Only pending locations can be updated.` 
      });
    }
    
    // Process coordinate data for update
    let updateData = { ...req.body };
    console.log("Update location data:", updateData);
    
    // Ensure coordinates are correctly processed
    if (updateData.coords && Array.isArray(updateData.coords)) {
      // Make sure coordinates exist and are in the correct format
      const [lat, lng] = updateData.coords;
      
      // Validate latitude value (should be between -90 and 90)
      let validLat = parseFloat(lat);
      let validLng = parseFloat(lng);
      
      console.log("Processing update coordinates:", validLat, validLng);
      
      // Fix invalid coordinates (swap if necessary)
      if (Math.abs(validLat) > 90 && Math.abs(validLng) <= 90) {
        // Coordinates might be swapped
        console.log("Update coordinates appear to be swapped, fixing...");
        updateData.latitude = validLng.toString();
        updateData.longitude = validLat.toString();
      } else {
        // Coordinates are in the right order or at least in valid ranges
        updateData.latitude = validLat.toString();
        updateData.longitude = validLng.toString();
      }
      
      // Ensure the coords field is formatted correctly for client-side use
      updateData.coords = [parseFloat(updateData.latitude), parseFloat(updateData.longitude)];
      console.log("Final processed update coordinates:", updateData.coords);
    }
    
    // Update the location
    const updatedLocation = await storage.updateSecretLocation(id, updateData);
    
    res.json(updatedLocation);
  } catch (error) {
    console.error("Error updating secret location:", error);
    res.status(500).json({ error: "Failed to update secret location" });
  }
});

// Delete a secret location (only by owner and only if not approved yet)
secretLocationsRouter.delete("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Get the current secret location
    const existingLocation = await storage.getSecretLocation(id);
    
    if (!existingLocation) {
      return res.status(404).json({ error: "Secret location not found" });
    }
    
    // Check if user is the owner or an admin
    const isAdmin = (req.user as any).roles?.includes("admin");
    if (existingLocation.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "You don't have permission to delete this location" });
    }
    
    // If not admin, check if location can be deleted (must be in pending state)
    if (!isAdmin && existingLocation.status !== "pending") {
      return res.status(403).json({ 
        error: `Cannot delete location with status: ${existingLocation.status}. Only pending locations can be deleted by their owners.` 
      });
    }
    
    // Delete the location
    await storage.deleteSecretLocation(id);
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting secret location:", error);
    res.status(500).json({ error: "Failed to delete secret location" });
  }
});

// Get a specific secret location by id (moved to end to avoid matching other routes)
secretLocationsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const secretLocation = await storage.getSecretLocation(id);
    
    if (!secretLocation) {
      return res.status(404).json({ error: "Secret location not found" });
    }
    
    // If location is not approved and user is not the owner or an admin, don't show it
    if (
      secretLocation.status !== "approved" && 
      (!req.isAuthenticated() || 
        (req.user as any).id !== secretLocation.userId && 
        !(req.user as any).roles?.includes("admin"))
    ) {
      return res.status(403).json({ error: "You don't have permission to view this location" });
    }
    
    res.json(secretLocation);
  } catch (error) {
    console.error("Error fetching secret location:", error);
    res.status(500).json({ error: "Failed to fetch secret location" });
  }
});

// Admin routes with editor permission support
function isAdmin(req: Request, res: Response, next: Function) {
  // Check if user has admin role
  if (req.isAuthenticated() && (req.user as any).roles?.includes("admin")) {
    return next();
  }
  
  // Check if user has editor role with secretCorners permission
  if (req.isAuthenticated() && 
      (req.user as any).roles?.includes("editor") && 
      (req.user as any).editorPermissions?.secretCorners === true) {
    return next();
  }
  
  res.status(403).json({ error: "Unauthorized. Admin access or editor permission required." });
}

// Get secret locations by status (admin only)
secretLocationsRouter.get("/status/:status", isAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.params.status as "pending" | "approved" | "rejected";
    
    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be pending, approved, or rejected." });
    }
    
    const secretLocations = await storage.getSecretLocationsByStatus(status);
    res.json(secretLocations);
  } catch (error) {
    console.error(`Error fetching ${req.params.status} secret locations:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.status} secret locations` });
  }
});

// Update a secret location's status (admin only)
secretLocationsRouter.patch("/:id/status", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, reason } = req.body;
    const adminId = (req.user as any).id;
    
    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be pending, approved, or rejected." });
    }
    
    // Update the status
    const updatedLocation = await storage.updateSecretLocationStatus(id, status, reason || "", adminId);
    
    res.json(updatedLocation);
  } catch (error) {
    console.error("Error updating secret location status:", error);
    res.status(500).json({ error: "Failed to update secret location status" });
  }
});