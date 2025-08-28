import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { InsertLocationFolder } from "../../shared/schema";

export const foldersRouter = Router();

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Get all folders for the authenticated user
foldersRouter.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const folders = await storage.getLocationFolders(userId);
    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Failed to fetch folders", details: error });
  }
});

// Get a specific folder by ID
foldersRouter.get("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const folderId = parseInt(req.params.id);
    const folder = await storage.getLocationFolder(folderId);
    
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    
    // Check if the folder belongs to the authenticated user
    if (folder.userId !== (req.user as any).id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({ message: "Failed to fetch folder", details: error });
  }
});

// Create a new folder
foldersRouter.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: "Folder name is required" });
    }
    
    const folderData: InsertLocationFolder = {
      userId,
      name: name.trim(),
    };
    
    const newFolder = await storage.createLocationFolder(folderData);
    res.status(201).json(newFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder", details: error });
  }
});

// Update a folder
foldersRouter.patch("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const folderId = parseInt(req.params.id);
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: "Folder name is required" });
    }
    
    // Check if the folder exists
    const folder = await storage.getLocationFolder(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    
    // Check if the folder belongs to the authenticated user
    if (folder.userId !== (req.user as any).id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const updatedFolder = await storage.updateLocationFolder(folderId, { name: name.trim() });
    res.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Failed to update folder", details: error });
  }
});

// Delete a folder
foldersRouter.delete("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const folderId = parseInt(req.params.id);
    
    // Check if the folder exists
    const folder = await storage.getLocationFolder(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    
    // Check if the folder belongs to the authenticated user
    if (folder.userId !== (req.user as any).id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await storage.deleteLocationFolder(folderId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Failed to delete folder", details: error });
  }
});

// Get locations in a specific folder
foldersRouter.get("/:id/locations", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const folderId = parseInt(req.params.id);
    
    // Check if the folder exists and belongs to the user
    const folder = await storage.getLocationFolder(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    
    if (folder.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get saved locations in this folder
    const locations = await storage.getSavedLocations(userId, folderId);
    res.json(locations);
  } catch (error) {
    console.error("Error fetching folder locations:", error);
    res.status(500).json({ message: "Failed to fetch folder locations", details: error });
  }
});

// Get uncategorized (no folder) saved locations
foldersRouter.get("/uncategorized/locations", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Use NULL as folderId to get locations without a folder
    const locations = await storage.getSavedLocations(userId, null);
    res.json(locations);
  } catch (error) {
    console.error("Error fetching uncategorized locations:", error);
    res.status(500).json({ message: "Failed to fetch uncategorized locations", details: error });
  }
});