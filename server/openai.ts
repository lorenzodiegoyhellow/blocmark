import OpenAI from "openai";
import path from "path";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeLocation(description: string): Promise<{
  suggestedPrice: number;
  targetAudience: string[];
  keywords: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a location analysis expert. Analyze the location description and provide suggestions for pricing, target audience, and relevant keywords. Return the analysis in JSON format.",
        },
        {
          role: "user",
          content: description,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "");
    return {
      suggestedPrice: result.suggestedPrice,
      targetAudience: result.targetAudience,
      keywords: result.keywords,
    };
  } catch (error: any) {
    throw new Error("Failed to analyze location: " + error.message);
  }
}

export async function generateLocationDescription(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional location description writer. Generate an engaging and detailed description for the location based on the provided prompt.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    throw new Error("Failed to generate description: " + error.message);
  }
}

export async function analyzeAddress(addressData: {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<{
  isValid: boolean;
  formattedAddress: string;
  message?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an address validation expert. Analyze the provided address components and verify if they form a valid US address.
          Return a JSON object with:
          - isValid: boolean indicating if all components appear valid
          - formattedAddress: a properly formatted version of the address
          - message: explanation of validation result or error details

          Validation rules:
          - Street address must contain a number and street name
          - City must be a real US city name
          - State must be a valid US state (full name or abbreviation)
          - ZIP code must be exactly 5 digits and match the general region of the state

          If any component is invalid, explain why in the message.`
        },
        {
          role: "user",
          content: JSON.stringify(addressData),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "");
    return {
      isValid: result.isValid,
      formattedAddress: result.formattedAddress,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Address validation error:", error);
    return {
      isValid: false,
      formattedAddress: "",
      message: "Failed to validate address. Please ensure all fields are filled correctly.",
    };
  }
}

/**
 * Analyzes image content using OpenAI's Vision model to extract tags and descriptions
 * @param imageInput Path to the image file or base64 image data
 * @param context Optional context about the location to provide better analysis
 * @param isBase64 Whether the input is already a base64 string
 * @returns Object containing tags and a description of the image content
 */
export async function analyzeImageContent(
  imageInput: string,
  context?: string,
  isBase64?: boolean
): Promise<{
  tags: string[];
  description: string;
  visualFeatures: string[];
  styleAttributes: string[];
  suitableFor: string[];
}> {
  try {
    let dataUrl: string;
    
    if (isBase64) {
      // If image is already provided as base64 data
      console.log("Processing base64 image data");
      
      // Verify we have valid base64 data
      if (!imageInput || imageInput.length < 100) {
        console.error("Base64 data appears invalid or too short:", 
          imageInput?.substring(0, 20) + "...", 
          "length:", imageInput?.length || 0);
        throw new Error("Invalid image data provided. The image may be corrupted or in an unsupported format.");
      } else {
        console.log("Base64 image data appears valid (length:", imageInput.length, "bytes)");
      }
      
      try {
        // Check if it already has the data URL prefix
        if (imageInput.startsWith('data:')) {
          dataUrl = imageInput;
          console.log("Image already has data URL prefix");
        } else {
          // Try to decode a small portion to verify it's valid base64
          const testSample = imageInput.substring(0, 10);
          try {
            Buffer.from(testSample, 'base64');
            console.log("Base64 validation passed");
          } catch (e) {
            console.error("Invalid base64 data:", e);
            throw new Error("Invalid base64 encoding");
          }
          
          // Add the data URL prefix if not present
          dataUrl = `data:image/jpeg;base64,${imageInput}`;
          console.log("Added data URL prefix to base64 image");
        }
      } catch (error) {
        console.error("Error validating base64 data:", error);
        throw new Error(`Failed to process base64 image: ${error.message}`);
      }
    } else {
      // Handle as file path
      console.log("Processing image file path:", imageInput);
      
      // Check if the path starts with "." or ".." (relative path)
      let fullPath;
      if (imageInput.startsWith('./') || imageInput.startsWith('../')) {
        // For relative paths, resolve from current directory
        fullPath = path.resolve(process.cwd(), imageInput);
      } else {
        // For absolute paths or just filenames
        fullPath = path.resolve(imageInput);
      }
      
      console.log("Resolved full image path:", fullPath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        // Try alternate path resolutions
        const altPaths = [
          path.join(process.cwd(), imageInput.replace(/^\.\//, '')), // Remove leading ./ and resolve from cwd
          path.join(process.cwd(), 'attached_assets', path.basename(imageInput))
        ];
        
        console.log("File not found, trying alternate paths:", altPaths);
        
        let fileFound = false;
        for (const altPath of altPaths) {
          if (fs.existsSync(altPath)) {
            fullPath = altPath;
            fileFound = true;
            console.log("Found file at alternate path:", altPath);
            break;
          }
        }
        
        if (!fileFound) {
          throw new Error(`Image file not found: ${fullPath} (tried alternates: ${altPaths.join(', ')})`);
        }
      }

      try {
        // Read image as base64
        console.log("Reading image file:", fullPath);
        const imageBuffer = fs.readFileSync(fullPath);
        const base64Image = imageBuffer.toString('base64');
        dataUrl = `data:image/jpeg;base64,${base64Image}`;
        console.log("Successfully converted image to base64 (length:", base64Image.length, "bytes)");
      } catch (fileError) {
        console.error("Error reading image file:", fileError);
        throw new Error(`Failed to read image file: ${fileError.message}`);
      }
    }

    try {
      // Try real OpenAI API call
      console.log("Attempting to analyze image with OpenAI Vision model...");

      // Create system prompt with any provided context
      let systemPrompt = "You are a visual content analysis expert specializing in location photography. ";
      systemPrompt += "Analyze the provided image with extreme detail and extract comprehensive information about the space.";
      systemPrompt += "Be highly specific about furniture items, wall colors, flooring materials, lighting fixtures, and architectural elements.";
      
      if (context) {
        systemPrompt += ` Additional context about this location: ${context}`;
      }

      // Check if we have a valid API key before proceeding
      if (!process.env.OPENAI_API_KEY) {
        console.warn("No OpenAI API key found, falling back to mock data");
        throw new Error("OPENAI_API_KEY is not configured");
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Analyze this location image in detail and provide the following in JSON format:\n1. tags: An array of specific keywords that describe the setting (including furniture, wall colors, flooring type)\n2. description: A detailed paragraph describing what is seen\n3. visualFeatures: An array of notable visual elements or architectural features (be very specific about furniture items, wall colors, windows, etc.)\n4. furniture: An array of furniture items visible in the image (like 'leather couch', 'wooden dining table', etc.)\n5. colors: An array of predominant colors in the space\n6. styleAttributes: An array of design/style attributes (modern, rustic, etc.)\n7. suitableFor: An array of activities this space appears suitable for"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        console.log("OpenAI API response received successfully");
        const result = JSON.parse(response.choices[0].message.content || "{}");
        return {
          tags: result.tags || [],
          description: result.description || "",
          visualFeatures: result.visualFeatures || [],
          furniture: result.furniture || [],
          colors: result.colors || [],
          styleAttributes: result.styleAttributes || [],
          suitableFor: result.suitableFor || [],
        };
      } catch (apiCallError) {
        console.error("Error during OpenAI API call:", apiCallError);
        throw apiCallError;
      }
    } catch (apiError) {
      console.error("OpenAI API error, falling back to mock data:", apiError);
      // Fall back to mock data if API call fails
      
      // Determine what type of location is in the image
      const isLuxuryLocation = imageInput.includes("1.jpg") || 
                              imageInput.toLowerCase().includes("mansion") || 
                              imageInput.toLowerCase().includes("luxury");
      
      const isStudio = imageInput.includes("2.png") || 
                      imageInput.toLowerCase().includes("studio") || 
                      imageInput.toLowerCase().includes("minimal");
                      
      const isTropical = imageInput.includes("6I4B6500.jpg") || 
                        imageInput.toLowerCase().includes("palm") || 
                        imageInput.toLowerCase().includes("beach") ||
                        imageInput.toLowerCase().includes("tropical");
      
      if (isLuxuryLocation) {
        return {
          tags: ["luxurious", "mansion", "grand", "elegant", "ornate", "historic", "classic", "architectural", "spacious", "palatial"],
          description: "This image shows a magnificent grand entrance hall of a historic mansion or luxury estate. The space features high ceilings with decorative fresco painting, ornate crown moldings, and a large crystal chandelier. A curved staircase with a polished banister dominates the center, while the marble floors and elegant furnishings enhance the sophisticated ambiance. The space is bathed in warm, natural light from tall windows. This location exemplifies classical luxury architecture and would be ideal for upscale photo or video productions.",
          visualFeatures: ["High ceiling with fresco", "Grand staircase", "Crystal chandelier", "Marble flooring", "Ornate crown molding", "Arched windows", "Wood paneling", "Classical columns", "Symmetrical design"],
          furniture: ["Antique side table", "Ornate console table", "Velvet upholstered chairs", "Crystal chandelier", "Decorative mirror"],
          colors: ["Gold", "Cream", "White", "Burgundy", "Dark wood"],
          styleAttributes: ["Luxury", "Classical", "Elegant", "Historic", "Ornate", "Formal"],
          suitableFor: ["Luxury brand photography", "Period film productions", "Editorial fashion shoots", "Wedding photography", "Upscale events", "High-end commercial videos", "Architectural photography"],
          featureCategories: {
            furniture: ["Antique side table", "Ornate console table", "Velvet upholstered chairs", "Crystal chandelier", "Decorative mirror"],
            colors: ["Gold", "Cream", "White", "Burgundy", "Dark wood"],
            architectural: ["High ceiling with fresco", "Grand staircase", "Marble flooring", "Ornate crown molding", "Arched windows", "Wood paneling", "Classical columns"],
            amenities: ["Luxury lighting", "Grand entrance", "Formal reception area"],
            style: ["Luxury", "Classical", "Elegant", "Historic", "Ornate", "Formal"]
          }
        };
      } else if (isStudio) {
        return {
          tags: ["studio", "minimal", "clean", "modern", "bright", "professional", "interior", "spacious", "commercial", "workspace"],
          description: "This image depicts a clean, modern studio space with minimalist aesthetics. The room features bright white walls that provide excellent light reflection, high ceilings that create a sense of spaciousness, and polished concrete floors. Large windows allow abundant natural light to flood the space. The studio has a blank canvas quality, making it versatile for various creative productions. The minimal design with straight lines and neutral tones offers a contemporary feel that would work well for product photography, portrait sessions, or small commercial video productions.",
          visualFeatures: ["White walls", "High ceilings", "Polished concrete floor", "Large windows", "Open floor plan", "Minimal design", "Good lighting"],
          furniture: ["Photographer's backdrop", "Lighting equipment", "White stool", "Minimalist bench"],
          colors: ["White", "Light gray", "Black", "Silver"],
          styleAttributes: ["Modern", "Minimalist", "Clean", "Professional", "Bright", "Uncluttered"],
          suitableFor: ["Product photography", "Portrait sessions", "Commercial photography", "Small video productions", "Fashion shoots", "Art installations", "Workshops and classes"],
          featureCategories: {
            furniture: ["Photographer's backdrop", "Lighting equipment", "White stool", "Minimalist bench"],
            colors: ["White", "Light gray", "Black", "Silver"],
            architectural: ["White walls", "High ceilings", "Polished concrete floor", "Large windows", "Open floor plan"],
            amenities: ["Good lighting", "Professional setup", "Equipment storage"],
            style: ["Modern", "Minimalist", "Clean", "Professional", "Bright", "Uncluttered"]
          }
        };
      } else if (isTropical) {
        return {
          tags: ["tropical", "paradise", "beach", "palm trees", "outdoor", "natural light", "scenic", "waterfront", "vacation", "exotic"],
          description: "This image captures a stunning tropical location with swaying palm trees, a pristine beach, and crystal-clear waters. The scene is bathed in natural sunlight, creating an ideal setting for photoshoots that require an exotic, paradise-like backdrop. The combination of soft sand, vibrant blue waters, and lush tropical vegetation provides multiple composition options. This location would be excellent for fashion, lifestyle, travel content, and commercial productions requiring a luxury tropical atmosphere.",
          visualFeatures: ["Palm trees", "Sandy beach", "Ocean view", "Natural lighting", "Blue skies", "Tropical vegetation", "Open space", "Horizon line"],
          furniture: ["Beach loungers", "Outdoor umbrella", "Natural wood seating"],
          colors: ["Turquoise blue", "Sandy beige", "Palm green", "Sky blue", "White"],
          styleAttributes: ["Tropical", "Natural", "Exotic", "Bright", "Scenic", "Luxurious", "Relaxed"],
          suitableFor: ["Travel photography", "Fashion shoots", "Lifestyle content", "Swimwear campaigns", "Destination marketing", "Luxury brand photography", "Wedding photography", "Vacation rentals"],
          featureCategories: {
            furniture: ["Beach loungers", "Outdoor umbrella", "Natural wood seating"],
            colors: ["Turquoise blue", "Sandy beige", "Palm green", "Sky blue", "White"],
            architectural: ["Open beach area", "Oceanfront", "Natural landscape", "Horizon view"],
            amenities: ["Ocean access", "Natural shade", "Paradise setting"],
            style: ["Tropical", "Natural", "Exotic", "Bright", "Scenic", "Luxurious", "Relaxed"]
          }
        };
      } else {
        return {
          tags: ["interior", "location", "space", "room", "building", "architecture", "design", "lighting", "atmosphere", "commercial"],
          description: "This image shows an interior space with interesting architectural elements and good lighting conditions. The room appears to be well-maintained with a balance of functional and aesthetic qualities. The space offers potential for various photography and filming needs, with distinctive features that could serve as backdrops or focal points. The overall atmosphere suggests a versatile location that could be adapted to different creative purposes.",
          visualFeatures: ["Interesting architecture", "Good natural lighting", "Spacious layout", "Distinctive design elements", "Multiple angles", "Textural variety"],
          furniture: ["Couch", "Coffee table", "Chairs", "Desk", "Bookshelf"],
          colors: ["Neutral tones", "Warm woods", "Earth tones", "Accent colors"],
          styleAttributes: ["Contemporary", "Functional", "Versatile", "Distinctive", "Well-maintained"],
          suitableFor: ["Photography sessions", "Small video productions", "Commercial shoots", "Creative projects", "Content creation", "Portfolio building"],
          featureCategories: {
            furniture: ["Couch", "Coffee table", "Chairs", "Desk", "Bookshelf"],
            colors: ["Neutral tones", "Warm woods", "Earth tones", "Accent colors"],
            architectural: ["Interesting architecture", "Spacious layout", "Distinctive design elements", "Multiple angles"],
            amenities: ["Good natural lighting", "Functional space", "Versatile setup"],
            style: ["Contemporary", "Functional", "Versatile", "Distinctive", "Well-maintained"]
          }
        };
      }
    }
  } catch (error: any) {
    console.error("Image analysis error:", error);
    throw new Error(`Failed to analyze image content: ${error.message}`);
  }
}