import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertWeeklyChallengeSchema, insertChallengeEntrySchema } from "@shared/schema";
import { z } from "zod";

export const challengesRouter = Router();

// Middleware to check if user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "You must be logged in to perform this action" });
}

// Get all challenges
challengesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const challenges = await storage.getWeeklyChallenges();
    
    // Add entries count for each challenge
    const challengesWithCounts = await Promise.all(
      challenges.map(async (challenge) => {
        const entries = await storage.getChallengeEntries(challenge.id);
        return {
          ...challenge,
          entriesCount: entries.length
        };
      })
    );
    
    res.json(challengesWithCounts);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Create a new challenge (admin only)
challengesRouter.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can create challenges" });
    }
    
    // Validate the input
    const challengeData = insertWeeklyChallengeSchema.parse({
      ...req.body,
      createdBy: user.id,
      isActive: true,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    });
    
    const newChallenge = await storage.createWeeklyChallenge(challengeData);
    
    res.status(201).json({
      ...newChallenge,
      entriesCount: 0
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid challenge data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

// Get entries for a specific challenge
challengesRouter.get("/:id/entries", async (req: Request, res: Response) => {
  try {
    const challengeId = parseInt(req.params.id);
    const entries = await storage.getChallengeEntries(challengeId);
    
    // Add user and location info to entries
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const user = await storage.getUser(entry.userId);
        const location = await storage.getSecretLocation(entry.locationId);
        return {
          ...entry,
          userName: user?.username || "Unknown User",
          locationName: location?.name || "Unknown Location"
        };
      })
    );
    
    res.json(enrichedEntries);
  } catch (error) {
    console.error("Error fetching challenge entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Submit an entry to a challenge
challengesRouter.post("/:id/entries", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const challengeId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Validate the input
    const entryData = insertChallengeEntrySchema.parse({
      challengeId,
      locationId: req.body.locationId,
      userId,
      description: req.body.description
    });
    
    const newEntry = await storage.createChallengeEntry(entryData);
    
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error submitting challenge entry:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid entry data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to submit entry" });
  }
});

// Select a winner for a challenge (admin only)
challengesRouter.post("/:id/winner", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can select winners" });
    }
    
    const challengeId = parseInt(req.params.id);
    const { entryId } = req.body;
    
    await storage.selectChallengeWinner(challengeId, entryId);
    
    res.json({ message: "Winner selected successfully" });
  } catch (error) {
    console.error("Error selecting winner:", error);
    res.status(500).json({ error: "Failed to select winner" });
  }
});

// Delete a challenge (admin only)
challengesRouter.delete("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can delete challenges" });
    }
    
    const challengeId = parseInt(req.params.id);
    
    // Delete associated entries first, then the challenge
    await storage.deleteChallengeEntries(challengeId);
    await storage.deleteWeeklyChallenge(challengeId);
    
    res.json({ message: "Challenge deleted successfully" });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({ error: "Failed to delete challenge" });
  }
});

// Get active challenges
challengesRouter.get("/active", async (req: Request, res: Response) => {
  try {
    const activeChallenges = await storage.getActiveChallenges();
    res.json(activeChallenges);
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    res.status(500).json({ error: "Failed to fetch active challenges" });
  }
});