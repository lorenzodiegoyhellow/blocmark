import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertSpotlightLocationSchema } from "@shared/schema";
import { z } from "zod";
import { getUserCityFromIP, extractClientIP, extractCityFromAddress, normalizeCityName } from "../utils/city-utils";

const spotlightRouter = Router();

// Middleware to ensure user is an admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.roles.includes("admin")) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

// Get all spotlight locations
spotlightRouter.get("/", async (req: Request, res: Response) => {
  try {
    const spotlightLocations = await storage.getSpotlightLocations();
    res.status(200).json(spotlightLocations);
  } catch (error) {
    console.error("Error fetching spotlight locations:", error);
    res.status(500).json({ error: "Failed to fetch spotlight locations" });
  }
});

// Get currently active spotlight locations (with optional city detection)
spotlightRouter.get("/current", async (req: Request, res: Response) => {
  try {
    let userCity: string | null = null;
    
    // Check if city is provided in query parameter
    if (req.query.city && typeof req.query.city === 'string') {
      userCity = normalizeCityName(req.query.city);
    } else {
      // Try to detect user's city from IP address
      const clientIP = extractClientIP(req);
      console.log(`[SPOTLIGHT] Detecting city for IP: ${clientIP}`);
      console.log(`[SPOTLIGHT] Request headers:`, {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'remoteAddress': req.connection?.remoteAddress,
        'socketRemoteAddress': req.socket?.remoteAddress,
        'ip': req.ip
      });
      
      try {
        userCity = await getUserCityFromIP(clientIP);
        if (userCity) {
          console.log(`[SPOTLIGHT] Detected user city: ${userCity} for IP: ${clientIP}`);
        } else {
          console.log(`[SPOTLIGHT] No city detected for IP: ${clientIP}`);
        }
      } catch (error) {
        console.error("[SPOTLIGHT] Failed to detect user city from IP:", error);
        // Continue without city - will show global spotlights
      }
      
      // If no city detected from IP, try to infer from Accept-Language header
      if (!userCity) {
        const acceptLanguage = req.headers['accept-language'];
        console.log(`[SPOTLIGHT] No city from IP, checking Accept-Language: ${acceptLanguage}`);
        
        if (acceptLanguage) {
          // Simple heuristic: if Italian language is preferred, default to Milan
          if (acceptLanguage.toLowerCase().includes('it')) {
            userCity = 'Milan';
            console.log('[SPOTLIGHT] Defaulting to Milan based on Italian language preference');
          } else {
            // For all other languages, default to Los Angeles
            userCity = 'Los Angeles';
            console.log('[SPOTLIGHT] Defaulting to Los Angeles for non-Italian language');
          }
        }
      }
    }
    
    console.log(`[SPOTLIGHT] Calling getCurrentSpotlightLocations with userCity: ${userCity}`);
    const currentSpotlights = await storage.getCurrentSpotlightLocations(userCity);
    console.log(`[SPOTLIGHT] Returning ${currentSpotlights.length} spotlight locations to frontend`);
    
    res.status(200).json(currentSpotlights);
  } catch (error) {
    console.error("Error fetching current spotlight locations:", error);
    res.status(500).json({ error: "Failed to fetch current spotlight locations" });
  }
});

// Get spotlight locations for a specific city
spotlightRouter.get("/city/:city", async (req: Request, res: Response) => {
  try {
    const city = normalizeCityName(req.params.city);
    const citySpotlights = await storage.getCurrentSpotlightLocationsByCity(city);
    res.status(200).json(citySpotlights);
  } catch (error) {
    console.error("Error fetching city spotlight locations:", error);
    res.status(500).json({ error: "Failed to fetch city spotlight locations" });
  }
});

// Get all available cities that have spotlight locations
spotlightRouter.get("/cities", async (req: Request, res: Response) => {
  try {
    const cities = await storage.getAvailableCitiesForSpotlight();
    res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching available cities:", error);
    res.status(500).json({ error: "Failed to fetch available cities" });
  }
});

// Utility endpoint to extract city from location address (admin only)
spotlightRouter.post("/extract-city", isAdmin, async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }
    
    const extractedCity = extractCityFromAddress(address);
    res.status(200).json({ 
      city: extractedCity,
      normalized: extractedCity ? normalizeCityName(extractedCity) : null
    });
  } catch (error) {
    console.error("Error extracting city from address:", error);
    res.status(500).json({ error: "Failed to extract city from address" });
  }
});

// Create a new spotlight location (admin only)
spotlightRouter.post("/", isAdmin, async (req: Request, res: Response) => {
  try {
    // Log the request body for debugging
    console.log("Spotlight creation request body:", JSON.stringify(req.body));
    
    // Prepare the request data, ensuring that dates are handled correctly
    const requestData = {
      ...req.body,
      locationId: Number(req.body.locationId),
      spotlightOrder: Number(req.body.spotlightOrder || 0),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createdBy: req.user!.id,
    };
    
    // Validate request body
    try {
      const validatedData = insertSpotlightLocationSchema.parse(requestData);
      console.log("Validated data:", JSON.stringify(validatedData));
      
      // Create spotlight location
      const newSpotlight = await storage.createSpotlightLocation(validatedData);
      
      // Create admin log entry
      await storage.createAdminLog({
        adminId: req.user!.id,
        action: "create_spotlight",
        targetType: "spotlight_location",
        targetId: newSpotlight.id,
        details: {
          locationId: newSpotlight.locationId,
          startDate: newSpotlight.startDate,
          endDate: newSpotlight.endDate,
        },
      });
      
      res.status(201).json(newSpotlight);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error("Zod validation error:", JSON.stringify(validationError.errors));
        return res.status(400).json({ error: validationError.errors });
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Error creating spotlight location:", error);
    res.status(500).json({ error: "Failed to create spotlight location" });
  }
});

// Update a spotlight location (admin only)
spotlightRouter.patch("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // Update spotlight location
    const updatedSpotlight = await storage.updateSpotlightLocation(id, req.body);

    // Create admin log entry
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "update_spotlight",
      targetType: "spotlight_location",
      targetId: updatedSpotlight.id,
      details: {
        changes: req.body,
      },
    });

    res.status(200).json(updatedSpotlight);
  } catch (error) {
    console.error("Error updating spotlight location:", error);
    res.status(500).json({ error: "Failed to update spotlight location" });
  }
});

// Delete a spotlight location (admin only)
spotlightRouter.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // Delete spotlight location
    await storage.deleteSpotlightLocation(id);

    // Create admin log entry
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "delete_spotlight",
      targetType: "spotlight_location",
      targetId: id,
      details: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting spotlight location:", error);
    res.status(500).json({ error: "Failed to delete spotlight location" });
  }
});

export default spotlightRouter;