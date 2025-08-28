import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { InsertSavedLocation } from "../../shared/schema";

export const savedLocationsRouter = Router();

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Get all saved locations for the authenticated user
savedLocationsRouter.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const savedLocations = await storage.getSavedLocationDetails(userId);
    res.json(savedLocations);
  } catch (error) {
    console.error("Error fetching saved locations:", error);
    res.status(500).json({ message: "Failed to fetch saved locations", details: error });
  }
});

// Get just the IDs of all saved locations for the authenticated user
savedLocationsRouter.get("/ids", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const savedLocations = await storage.getSavedLocationIds(userId);
    res.json(savedLocations);
  } catch (error) {
    console.error("Error fetching saved location IDs:", error);
    res.status(500).json({ message: "Failed to fetch saved location IDs", details: error });
  }
});

// Check if a location is saved by the authenticated user
savedLocationsRouter.get("/check/:locationId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }
    
    const isSaved = await storage.isLocationSaved(userId, locationId);
    res.json(isSaved);
  } catch (error) {
    console.error("Error checking saved status:", error);
    res.status(500).json({ message: "Failed to check saved status", details: error });
  }
});

// Save a location
savedLocationsRouter.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { locationId, folderId } = req.body;
    
    if (!locationId || isNaN(parseInt(locationId))) {
      return res.status(400).json({ message: "Valid location ID is required" });
    }
    
    // Check if the location is already saved
    const isSaved = await storage.isLocationSaved(userId, parseInt(locationId));
    if (isSaved) {
      return res.status(409).json({ message: "Location is already saved" });
    }
    
    // If folderId is provided, check if the folder exists and belongs to the user
    if (folderId && !isNaN(parseInt(folderId))) {
      const folder = await storage.getLocationFolder(parseInt(folderId));
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      if (folder.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this folder" });
      }
    }
    
    const savedLocationData: InsertSavedLocation = {
      userId,
      locationId: parseInt(locationId),
      folderId: folderId ? parseInt(folderId) : null,
    };
    
    const savedLocation = await storage.saveLocation(savedLocationData);
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).json({ message: "Failed to save location", details: error });
  }
});

// Move a saved location to a different folder
savedLocationsRouter.patch("/:locationId/move", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const locationId = parseInt(req.params.locationId);
    const { folderId } = req.body;
    
    if (isNaN(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }
    
    // Check if the location is saved by the user
    const isSaved = await storage.isLocationSaved(userId, locationId);
    if (!isSaved) {
      return res.status(404).json({ message: "Saved location not found" });
    }
    
    // If folderId is provided and not null, check if the folder exists and belongs to the user
    if (folderId !== null && !isNaN(parseInt(folderId as unknown as string))) {
      const folderIdNum = parseInt(folderId as unknown as string);
      const folder = await storage.getLocationFolder(folderIdNum);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      if (folder.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this folder" });
      }
      
      const updatedSavedLocation = await storage.updateSavedLocation(userId, locationId, folderIdNum);
      return res.json(updatedSavedLocation);
    }
    
    // If folderId is null, move to uncategorized
    const updatedSavedLocation = await storage.updateSavedLocation(userId, locationId, null);
    res.json(updatedSavedLocation);
  } catch (error) {
    console.error("Error moving saved location:", error);
    res.status(500).json({ message: "Failed to move saved location", details: error });
  }
});

// Unsave a location
savedLocationsRouter.delete("/:locationId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }
    
    // Check if the location is saved by the user
    const isSaved = await storage.isLocationSaved(userId, locationId);
    if (!isSaved) {
      return res.status(404).json({ message: "Saved location not found" });
    }
    
    await storage.unsaveLocation(userId, locationId);
    res.status(204).send();
  } catch (error) {
    console.error("Error unsaving location:", error);
    res.status(500).json({ message: "Failed to unsave location", details: error });
  }
});