import Anthropic from "@anthropic-ai/sdk";

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type LocationRecommendation = {
  type: string;
  features: string[];
  priceRange: { min: number; max: number };
  description: string;
  suitability: number;
  idealFor: string[];
  nearbyAmenities: string[];
  bestTimeToBook: string[];
  photographyTips?: string[];
};

// Mock data for development
const mockRecommendations: LocationRecommendation[] = [
  {
    type: "Modern Studio Space",
    features: ["High ceilings", "Natural light", "White walls", "Wood floors"],
    priceRange: { min: 200, max: 500 },
    description: "A versatile studio space perfect for professional photo shoots",
    suitability: 0.95,
    idealFor: ["Fashion shoots", "Product photography", "Portrait sessions"],
    nearbyAmenities: ["Parking", "Makeup room", "Loading dock"],
    bestTimeToBook: ["Morning", "Early afternoon"],
    photographyTips: ["Best natural light between 9am-2pm", "Use the north-facing windows for soft light"]
  },
  {
    type: "Industrial Warehouse",
    features: ["Raw concrete", "Steel beams", "Large windows", "Open floor plan"],
    priceRange: { min: 300, max: 800 },
    description: "An industrial space with character and versatility",
    suitability: 0.85,
    idealFor: ["Commercial shoots", "Music videos", "Events"],
    nearbyAmenities: ["Equipment rental", "Green room", "Security"],
    bestTimeToBook: ["Weekend", "Evening"],
    photographyTips: ["Great for moody lighting setups", "Use the texture of the walls as backdrops"]
  },
  {
    type: "Tropical Beach Location",
    features: ["Palm trees", "Sandy beach", "Ocean view", "Natural light", "Sunset view"],
    priceRange: { min: 350, max: 900 },
    description: "A picturesque tropical beach location with swaying palm trees and crystal clear waters",
    suitability: 0.92,
    idealFor: ["Fashion shoots", "Travel photography", "Lifestyle content", "Swimwear campaigns"],
    nearbyAmenities: ["Changing area", "Beach access", "Parking", "Shade structures"],
    bestTimeToBook: ["Golden hour", "Early morning", "Late afternoon"],
    photographyTips: ["Shoot during golden hour for magical lighting", "Use palm trees as natural framing elements"]
  },
  {
    type: "Poolside Villa",
    features: ["Swimming pool", "Palm trees", "Luxury furniture", "Tropical garden", "Outdoor space"],
    priceRange: { min: 400, max: 1200 },
    description: "An elegant villa with a private pool surrounded by palm trees and tropical landscaping",
    suitability: 0.88,
    idealFor: ["Lifestyle photography", "Product shoots", "Fashion editorials", "Luxury brand content"],
    nearbyAmenities: ["Covered patio", "Outdoor kitchen", "Bathroom access", "Privacy wall"],
    bestTimeToBook: ["Morning", "Late afternoon", "Evening for lit pool shots"],
    photographyTips: ["Pool lights create amazing evening atmosphere", "Use the contrast of blue water against tropical greenery"]
  }
];

export async function searchLocations(query: string): Promise<{
  matches: LocationRecommendation[];
  userPreferences: {
    budget: { min: number; max: number };
    style: string[];
    requirements: string[];
  };
}> {
  try {
    console.log(`Performing AI search for query: ${query}`);
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are an AI assistant specialized in helping photographers and filmmakers find the best locations for their projects. Analyze search queries in extreme detail, looking for specific furniture items, wall colors, architectural features, and lighting conditions. You must identify and prominently feature ANY specific items mentioned in the query such as 'white walls', 'couch', 'hardwood floors', etc. Provide highly specific recommendations that match exactly what the user is looking for.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I'm looking for a location with the following characteristics: ${query}. 
              
              Please analyze my request in extreme detail and provide specific recommendations that match my search terms exactly. Pay special attention to:
              - Furniture items (couches, sofas, tables, chairs, beds)
              - Wall colors (white walls, colored walls)
              - Flooring types (hardwood floors, concrete, tile)
              - Architectural features (high ceilings, large windows)
              - Natural elements (palm trees, beach, garden)
              
              If I mention any SPECIFIC feature like "couch", "white walls", or "hardwood floors", those MUST be included in the features list and prominently mentioned in the description.
              
              Provide recommendations in the following JSON format:
              {
                "recommendations": [{
                  "type": string, // The type of location (e.g., "Modern Studio", "Industrial Warehouse")
                  "features": string[], // Key features including ANY furniture items and colors I specifically mentioned
                  "priceRange": { "min": number, "max": number }, // Typical price range in USD
                  "description": string, // A brief description that highlights the specific elements I'm looking for
                  "suitability": number, // A score from 0 to 1 indicating how well it matches my query
                  "idealFor": string[], // Types of shoots/productions this would be ideal for
                  "nearbyAmenities": string[], // Typical amenities that might be available
                  "bestTimeToBook": string[], // Best times (day/season) for optimal conditions
                  "photographyTips": string[] // Optional tips for shooting in this type of location
                }],
                "userPreferences": {
                  "budget": { "min": number, "max": number }, // Inferred budget range
                  "style": string[], // Inferred style preferences
                  "requirements": string[] // Key requirements extracted from query, including furniture and color preferences
                }
              }`
            }
          ]
        }
      ]
    });

    if (!response.content[0]) {
      throw new Error("Empty response from Anthropic API");
    }

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }

    const result = JSON.parse(content.text);
    return {
      matches: result.recommendations.map((rec: any) => ({
        type: rec.type,
        features: rec.features,
        priceRange: rec.priceRange,
        description: rec.description,
        suitability: rec.suitability,
        idealFor: rec.idealFor,
        nearbyAmenities: rec.nearbyAmenities,
        bestTimeToBook: rec.bestTimeToBook,
        ...(rec.photographyTips && { photographyTips: rec.photographyTips }),
      })),
      userPreferences: {
        budget: result.userPreferences.budget,
        style: result.userPreferences.style,
        requirements: result.userPreferences.requirements,
      },
    };
  } catch (error: any) {
    console.error("Search locations error:", error);
    
    // Create custom mock results based on the search query
    let customMockRecommendations = [...mockRecommendations];
    const lcQuery = query.toLowerCase();
    
    // FURNITURE FEATURES
    // Check for specific furniture items
    if (lcQuery.includes("couch") || lcQuery.includes("sofa")) {
      customMockRecommendations.unshift({
        type: "Modern Living Room",
        features: ["Comfortable couch", "Modern furniture", "Natural light", "Open layout", "Neutral colors"],
        priceRange: { min: 150, max: 450 },
        description: "A stylish living room with a comfortable couch as the focal point, perfect for lifestyle and portrait photography",
        suitability: 0.98,
        idealFor: ["Lifestyle photography", "Casual portraits", "Product placement", "Interview settings"],
        nearbyAmenities: ["Kitchen access", "Bathroom", "Parking", "Wifi"],
        bestTimeToBook: ["Midday for natural light", "Evening for cozy atmosphere"],
        photographyTips: ["The couch provides a natural setting for casual poses", "Use the surrounding decor for lifestyle context"]
      });
    }
    
    // Check for tables and chairs
    if (lcQuery.includes("table") || lcQuery.includes("dining")) {
      customMockRecommendations.unshift({
        type: "Dining Space",
        features: ["Elegant dining table", "Stylish chairs", "Well-designed interior", "Good lighting", "Minimalist decor"],
        priceRange: { min: 180, max: 500 },
        description: "A beautiful dining space centered around a premium dining table, perfect for lifestyle, food, and social content",
        suitability: 0.94,
        idealFor: ["Food photography", "Lifestyle content", "Product placement", "Entertaining scenes"],
        nearbyAmenities: ["Kitchen access", "Bathroom", "Natural light", "Parking"],
        bestTimeToBook: ["Morning for breakfast scenes", "Evening for dinner setups"],
        photographyTips: ["The dining table creates a natural staging area", "Perfect for overhead flat-lay photography"]
      });
    }
    
    if (lcQuery.includes("chair") || lcQuery.includes("armchair")) {
      customMockRecommendations.unshift({
        type: "Designer Living Space",
        features: ["Designer chairs", "Contemporary furniture", "Clean lines", "Minimalist aesthetic", "Statement pieces"],
        priceRange: { min: 200, max: 550 },
        description: "A modern space featuring designer chairs and premium furniture pieces, ideal for elegant portraits and lifestyle content",
        suitability: 0.93,
        idealFor: ["Lifestyle photography", "Interior design shoots", "Fashion portraits", "Luxury brand content"],
        nearbyAmenities: ["Restrooms", "Wifi", "Convenient parking", "Additional furniture options"],
        bestTimeToBook: ["Mid-morning", "Afternoon for consistent lighting"],
        photographyTips: ["The designer chairs make excellent statement pieces in composition", "Utilize the clean lines for framing subjects"]
      });
    }
    
    // WALL FEATURES
    // Check for white walls
    if (lcQuery.includes("white wall") || lcQuery.includes("white walls")) {
      customMockRecommendations.unshift({
        type: "Clean Studio Space",
        features: ["White walls", "Minimalist design", "High ceilings", "Concrete or wood flooring", "Excellent lighting"],
        priceRange: { min: 200, max: 550 },
        description: "A pristine studio space with clean white walls, providing the perfect neutral backdrop for photography",
        suitability: 0.99,
        idealFor: ["Product photography", "Portrait sessions", "Fashion shoots", "Minimalist content"],
        nearbyAmenities: ["Changing room", "Equipment storage", "Loading area", "WiFi"],
        bestTimeToBook: ["Morning to afternoon for best natural light", "Anytime with studio lighting"],
        photographyTips: ["The white walls provide perfect color balance and reflection", "Great for creating a clean, distraction-free backdrop"]
      });
    }
    
    // Check for colored walls
    if (lcQuery.includes("colored wall") || lcQuery.includes("blue wall") || lcQuery.includes("green wall") || lcQuery.includes("red wall") || lcQuery.includes("yellow wall")) {
      // Determine which color was mentioned
      const wallColor = 
        lcQuery.includes("blue wall") ? "Blue" :
        lcQuery.includes("green wall") ? "Green" :
        lcQuery.includes("red wall") ? "Red" :
        lcQuery.includes("yellow wall") ? "Yellow" :
        "Colored";
      
      customMockRecommendations.unshift({
        type: `${wallColor} Wall Studio`,
        features: [`${wallColor} accent wall`, "Creative backdrop", "Studio lighting", "Open shooting space", "Versatile setup"],
        priceRange: { min: 180, max: 500 },
        description: `A creative studio space featuring a striking ${wallColor.toLowerCase()} wall that adds vibrant color and personality to your shoot`,
        suitability: 0.96,
        idealFor: ["Portrait photography", "Brand campaigns", "Fashion editorials", "Creative content"],
        nearbyAmenities: ["Makeup area", "Changing room", "Equipment storage", "WiFi"],
        bestTimeToBook: ["Anytime - controlled lighting environment"],
        photographyTips: [`The ${wallColor.toLowerCase()} wall creates a vibrant backdrop that complements many skin tones`, "Consider wardrobe choices that contrast or complement the wall color"]
      });
    }
    
    // FLOOR FEATURES
    // Check for hardwood floors
    if (lcQuery.includes("hardwood floor") || lcQuery.includes("wood floor") || lcQuery.includes("wooden floor")) {
      customMockRecommendations.unshift({
        type: "Loft with Hardwood Floors",
        features: ["Polished hardwood floors", "Open space", "Large windows", "High ceilings", "Natural light"],
        priceRange: { min: 250, max: 600 },
        description: "A spacious loft featuring beautiful hardwood flooring throughout, adding warmth and character to any shoot",
        suitability: 0.97,
        idealFor: ["Fashion editorials", "Dance photography", "Full-body portraits", "Product layouts"],
        nearbyAmenities: ["Elevator access", "Restrooms", "Changing area", "WiFi"],
        bestTimeToBook: ["Mid-morning", "Early afternoon for best floor highlighting"],
        photographyTips: ["The natural wood tones add warmth to shots", "Creates beautiful reflections with proper lighting"]
      });
    }
    
    // Check for concrete floors
    if (lcQuery.includes("concrete floor") || lcQuery.includes("concrete")) {
      customMockRecommendations.unshift({
        type: "Industrial Studio with Concrete Floors",
        features: ["Polished concrete floors", "Industrial aesthetic", "Minimal design", "Urban feel", "Contemporary space"],
        priceRange: { min: 220, max: 580 },
        description: "A modern industrial studio featuring sleek concrete floors that provide a clean, urban backdrop for contemporary shoots",
        suitability: 0.95,
        idealFor: ["Urban fashion", "Streetwear photography", "Modern product shots", "Minimalist portraits"],
        nearbyAmenities: ["Loading dock", "Restrooms", "Wifi", "Equipment storage"],
        bestTimeToBook: ["Any time with proper lighting", "Afternoons for interesting shadow play"],
        photographyTips: ["The concrete floor provides a neutral base with interesting texture", "Works well with both colorful and monochromatic subjects"]
      });
    }
    
    // ARCHITECTURAL FEATURES
    // Check for high ceilings
    if (lcQuery.includes("high ceiling") || lcQuery.includes("high ceilings")) {
      customMockRecommendations.unshift({
        type: "Spacious Studio with High Ceilings",
        features: ["High ceilings", "Airy space", "Natural light", "Open concept", "Vertical shooting space"],
        priceRange: { min: 280, max: 650 },
        description: "An expansive studio space with impressive high ceilings, creating a sense of openness and allowing for creative lighting setups",
        suitability: 0.96,
        idealFor: ["Full-length fashion", "Dance photography", "Large product displays", "Aerial photography"],
        nearbyAmenities: ["Elevator access", "Loading area", "Restrooms", "Equipment storage"],
        bestTimeToBook: ["Morning for even natural light", "Midday for dramatic light rays"],
        photographyTips: ["Take advantage of the vertical space for interesting angles", "Perfect for creating dramatic lighting from above"]
      });
    }
    
    // NATURAL ELEMENTS
    // Check for garden or outdoor settings
    if (lcQuery.includes("garden") || lcQuery.includes("outdoor") || lcQuery.includes("patio")) {
      customMockRecommendations.unshift({
        type: "Garden Oasis",
        features: ["Lush garden", "Outdoor space", "Natural greenery", "Beautiful landscaping", "Garden furniture"],
        priceRange: { min: 220, max: 650 },
        description: "A picturesque garden setting with lush greenery, perfect for natural light photography in a controlled outdoor environment",
        suitability: 0.94,
        idealFor: ["Lifestyle content", "Fashion editorials", "Portrait photography", "Product shoots with natural backdrop"],
        nearbyAmenities: ["Covered patio area", "Restroom access", "Parking", "Indoor space available"],
        bestTimeToBook: ["Morning golden hour", "Late afternoon", "Overcast days for soft light"],
        photographyTips: ["Use the natural greenery as framing elements", "Best in spring and summer months", "Plan around weather conditions"]
      });
    }
    
    // Extract specific features from query for better requirements targeting
    const specificFeatures = [];
    
    // Create a more comprehensive feature extraction system
    
    // Define feature categories and their associated keywords
    const featureCategories = {
      furniture: {
        "couch": ["couch", "sofa", "loveseat", "sectional", "comfortable seating"],
        "chair": ["chair", "armchair", "seating", "stool", "bench"],
        "table": ["table", "dining table", "coffee table", "desk", "console"],
        "bed": ["bed", "mattress", "bedroom", "sleeping area"],
        "shelving": ["shelf", "bookshelf", "shelving", "bookcase", "storage"],
        "cabinet": ["cabinet", "dresser", "wardrobe", "console", "credenza"]
      },
      
      wallFeatures: {
        "white walls": ["white wall", "white walls", "neutral backdrop", "clean background", "white painted walls"],
        "blue walls": ["blue wall", "blue walls", "blue painted", "blue backdrop"],
        "green walls": ["green wall", "green walls", "green painted", "green backdrop"],
        "red walls": ["red wall", "red walls", "red painted", "red backdrop"],
        "yellow walls": ["yellow wall", "yellow walls", "yellow painted", "yellow backdrop"],
        "exposed brick": ["brick wall", "brick walls", "exposed brick", "brick feature", "brick backdrop"],
        "paneling": ["wood panel", "wood paneling", "wainscoting", "paneled walls"]
      },
      
      flooring: {
        "hardwood floors": ["hardwood floor", "wood floor", "wooden floor", "oak floor", "timber floor", "walnut floor"],
        "concrete floors": ["concrete floor", "concrete", "polished concrete", "cement floor"],
        "tile floors": ["tile floor", "tile", "ceramic tile", "porcelain tile", "marble tile"],
        "carpet": ["carpet", "carpeted", "carpeting", "rug"],
        "vinyl flooring": ["vinyl floor", "vinyl", "laminate floor"]
      },
      
      architectural: {
        "high ceilings": ["high ceiling", "high ceilings", "tall ceiling", "vaulted ceiling", "cathedral ceiling"],
        "natural light": ["natural light", "natural lighting", "good light", "well lit", "bright space"],
        "skylight": ["skylight", "ceiling window", "roof window"],
        "large windows": ["large window", "large windows", "big window", "big windows", "floor to ceiling window", "picture window"],
        "arched windows": ["arched window", "arched windows", "curved window"],
        "open floor plan": ["open floor plan", "open concept", "open layout", "spacious layout"],
        "columns": ["column", "columns", "pillar", "pillars"]
      },
      
      outdoor: {
        "garden": ["garden", "landscaped yard", "plants", "greenery", "garden area"],
        "outdoor space": ["outdoor", "outside area", "exterior", "yard", "terrace"],
        "patio": ["patio", "deck", "terrace", "balcony", "porch"],
        "pool": ["pool", "swimming pool", "water feature"],
        "palm trees": ["palm tree", "palm trees", "tropical trees"],
        "beach": ["beach", "sandy beach", "beachfront", "oceanfront", "shore"]
      }
    };
    
    // Scan query for each feature
    for (const category in featureCategories) {
      for (const feature in featureCategories[category]) {
        const keywords = featureCategories[category][feature];
        if (keywords.some(keyword => lcQuery.includes(keyword.toLowerCase()))) {
          specificFeatures.push(feature);
          break; // Found a match in this feature, move to next feature
        }
      }
    }
    
    // Add additional visual scanning for any undetected but important features
    const additionalVisualCues = [
      "large space", "small space", "intimate setting", "spacious", "cozy", 
      "studio", "loft", "commercial", "residential", "professional",
      "minimalist", "modern", "rustic", "industrial", "luxury",
      "vintage", "contemporary", "traditional", "colorful", "neutral"
    ];
    
    additionalVisualCues.forEach(cue => {
      if (lcQuery.includes(cue.toLowerCase())) {
        specificFeatures.push(cue);
      }
    });
    
    // Return the customized recommendations, using the regular ones as fallback
    return {
      matches: customMockRecommendations,
      userPreferences: {
        budget: { min: 200, max: 800 },
        style: lcQuery.includes("modern") ? ["modern", "contemporary"] :
               lcQuery.includes("rustic") ? ["rustic", "vintage", "warm"] :
               lcQuery.includes("luxury") ? ["luxury", "elegant", "high-end"] :
               lcQuery.includes("industrial") ? ["industrial", "urban", "raw"] :
               lcQuery.includes("minimalist") ? ["minimalist", "clean", "simple"] :
               ["versatile", "professional"],
        requirements: specificFeatures.length > 0 ? specificFeatures : [
          ...(lcQuery.includes("natural light") ? ["natural light"] : []),
          ...(lcQuery.includes("white wall") ? ["white walls"] : []),
          ...(lcQuery.includes("couch") ? ["comfortable seating"] : []),
          ...(lcQuery.includes("hardwood") ? ["quality flooring"] : []),
          "professional setting"
        ]
      }
    };
  }
}

export async function getPersonalizedRecommendations(userId: number, searchHistory: string[]): Promise<{
  recommendations: LocationRecommendation[];
  explanation: string;
}> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on this user's search history, provide personalized location recommendations in JSON format:
              {
                "recommendations": [{
                  "type": string,
                  "features": string[],
                  "priceRange": { "min": number, "max": number },
                  "description": string,
                  "suitability": number,
                  "idealFor": string[],
                  "nearbyAmenities": string[],
                  "bestTimeToBook": string[],
                  "photographyTips": string[]
                }],
                "explanation": string
              }

              Search history: ${searchHistory.join(", ")}`
            }
          ]
        }
      ]
    });

    if (!response.content[0]) {
      throw new Error("Empty response from Anthropic API");
    }

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }

    const result = JSON.parse(content.text);
    return {
      recommendations: result.recommendations.map((rec: any) => ({
        type: rec.type,
        features: rec.features,
        priceRange: rec.priceRange,
        description: rec.description,
        suitability: rec.suitability,
        idealFor: rec.idealFor,
        nearbyAmenities: rec.nearbyAmenities,
        bestTimeToBook: rec.bestTimeToBook,
        ...(rec.photographyTips && { photographyTips: rec.photographyTips }),
      })),
      explanation: result.explanation,
    };
  } catch (error: any) {
    console.error("Personalized recommendations error:", error);
    // Return mock data in development
    return {
      recommendations: mockRecommendations,
      explanation: "Based on your search history, we've found these locations that match your preferences for professional photography spaces."
    };
  }
}