// Property Features Configuration with Categories and Subcategories
export interface PropertyFeatureCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export const PROPERTY_FEATURES: PropertyFeatureCategory[] = [
  {
    id: "bathroom",
    name: "Bathroom",
    subcategories: [
      "Bidet",
      "Clawfoot Bathtub",
      "Double Sink",
      "Freestanding Bathtub",
      "Jack And Jill Bathroom",
      "Japanese Soaking Tub",
      "Jetted Tub",
      "Master Bathroom",
      "Multiple Bathrooms",
      "No Bathtub",
      "Private Bathroom",
      "Rainfall Shower",
      "Shared Bathroom",
      "Single Sink",
      "Steam Shower",
      "Walk-In Shower"
    ]
  },
  {
    id: "ceiling",
    name: "Ceiling",
    subcategories: [
      "Beam",
      "Cathedral",
      "Coffered",
      "Conventional",
      "Cove",
      "Exposed Beam",
      "High",
      "Sloped",
      "Tray",
      "Vaulted",
      "Wood Beam"
    ]
  },
  {
    id: "doors",
    name: "Doors",
    subcategories: [
      "Arch",
      "Barn",
      "Double",
      "Dutch",
      "French",
      "Glass",
      "Panel",
      "Pivot",
      "Pocket",
      "Sliding"
    ]
  },
  {
    id: "driveway",
    name: "Driveway",
    subcategories: [
      "1 Car",
      "2 Car",
      "3+ Car",
      "Attached Garage",
      "Carport",
      "Circular",
      "Concrete",
      "Detached Garage",
      "Dirt/Gravel",
      "Gate",
      "Paved",
      "Shared"
    ]
  },
  {
    id: "elevator",
    name: "Elevator",
    subcategories: [
      "Freight",
      "Glass",
      "Residential",
      "Service"
    ]
  },
  {
    id: "exterior",
    name: "Exterior",
    subcategories: [
      "Balcony",
      "Brick",
      "Concrete",
      "Deck",
      "Metal",
      "Modern",
      "Patio",
      "Roof Deck",
      "Siding",
      "Stone",
      "Stucco",
      "Terrace",
      "Traditional",
      "Tudor",
      "Victorian",
      "Wood"
    ]
  },
  {
    id: "fireplace",
    name: "Fireplace",
    subcategories: [
      "Electric",
      "Gas",
      "Stone",
      "Wood"
    ]
  },
  {
    id: "floor",
    name: "Floor",
    subcategories: [
      "Brick",
      "Carpet",
      "Cement",
      "Concrete",
      "Cork",
      "Epoxy",
      "Hardwood",
      "Laminate",
      "Linoleum",
      "Marble",
      "Mosaic",
      "Parquet",
      "Slate",
      "Stone",
      "Terrazzo",
      "Tile",
      "Travertine",
      "Vinyl",
      "Wood"
    ]
  },
  {
    id: "garden-yard",
    name: "Garden/Yard",
    subcategories: [
      "Backyard",
      "Cactus Garden",
      "Desert Landscaping",
      "English Garden",
      "Flower Garden",
      "Front Yard",
      "Gazebo",
      "Greenhouse",
      "Hedge",
      "Japanese Garden",
      "Large Yard",
      "Lawn",
      "Mediterranean Garden",
      "Native Plants",
      "No Yard",
      "Organic Garden",
      "Orchard",
      "Pergola",
      "Rock Garden",
      "Rose Garden",
      "Secret Garden",
      "Small Yard",
      "Tropical Garden",
      "Vegetable Garden",
      "Vineyard",
      "Water Garden",
      "Wildflower Garden",
      "Zen Garden"
    ]
  },
  {
    id: "interior",
    name: "Interior",
    subcategories: [
      "Atrium",
      "Columns",
      "Loft",
      "Mezzanine",
      "Mudroom",
      "Open Floor Plan",
      "Skylight",
      "Split Level",
      "Sunroom",
      "Vaulted Ceiling",
      "Walk-In Closet"
    ]
  },
  {
    id: "kitchen",
    name: "Kitchen Type/Features",
    subcategories: [
      "Butcher Block",
      "Farmhouse Sink",
      "Granite Countertops",
      "Island",
      "Marble Countertops",
      "Open Kitchen",
      "Pantry",
      "Quartz Countertops",
      "Stainless Steel Appliances",
      "Subway Tile",
      "Updated Kitchen",
      "Vintage Kitchen",
      "Walk-In Pantry",
      "Wine Fridge"
    ]
  },
  {
    id: "porch",
    name: "Porch",
    subcategories: [
      "Back Porch",
      "Covered",
      "Front Porch",
      "Screened",
      "Sleeping Porch",
      "Sun Porch",
      "Veranda",
      "Wrap Around"
    ]
  },
  {
    id: "sports-activity",
    name: "Sports And Activity",
    subcategories: [
      "Baseball Diamond",
      "Basketball Court",
      "Batting Cage",
      "Bocce Ball Court",
      "Bowling Alley",
      "Dance Floor",
      "Driving Range",
      "Golf Course",
      "Gym",
      "Hockey Rink",
      "Horse Stable",
      "Pickleball Court",
      "Putting Green",
      "Racquetball Court",
      "Rock Climbing Wall",
      "Running Track",
      "Shuffleboard",
      "Skate Park",
      "Soccer Field",
      "Squash Court",
      "Tennis Court",
      "Volleyball Court",
      "Yoga Studio"
    ]
  },
  {
    id: "stairs",
    name: "Stairs",
    subcategories: [
      "Curved",
      "Floating",
      "Grand",
      "Spiral",
      "Straight",
      "Winder"
    ]
  },
  {
    id: "view",
    name: "View",
    subcategories: [
      "Canyon",
      "City Lights",
      "City Skyline",
      "Courtyard",
      "Desert",
      "Forest",
      "Garden",
      "Golf Course",
      "Harbor",
      "Hills",
      "Lake",
      "Marina",
      "Mountain",
      "Ocean",
      "Park",
      "Pool",
      "River",
      "Street",
      "Sunrise",
      "Sunset",
      "Valley",
      "Vineyard",
      "Water"
    ]
  },
  {
    id: "walls",
    name: "Walls",
    subcategories: [
      "Brick",
      "Concrete",
      "Glass",
      "Paneling",
      "Plaster",
      "Shiplap",
      "Stone",
      "Tile",
      "Wallpaper",
      "Wainscoting",
      "Wood"
    ]
  },
  {
    id: "water-features",
    name: "Water Features",
    subcategories: [
      "Fountain",
      "Hot Tub/Jacuzzi",
      "Koi Pond",
      "Lap Pool",
      "Natural Pool",
      "Pond",
      "Pool",
      "Reflecting Pool",
      "Sauna",
      "Spa",
      "Stream",
      "Swimming Pool",
      "Waterfall"
    ]
  },
  {
    id: "windows",
    name: "Windows",
    subcategories: [
      "Arched",
      "Bay",
      "Casement",
      "Clerestory",
      "Double Hung",
      "Floor To Ceiling",
      "French",
      "Large",
      "Palladian",
      "Picture",
      "Skylight",
      "Sliding",
      "Stained Glass"
    ]
  }
];

// Helper function to get all available features as a flat array
export function getAllFeatures(): string[] {
  const features: string[] = [];
  PROPERTY_FEATURES.forEach(category => {
    category.subcategories.forEach(subcategory => {
      features.push(`${category.name}: ${subcategory}`);
    });
  });
  return features;
}

// Helper function to get features by category
export function getFeaturesByCategory(categoryId: string): string[] {
  const category = PROPERTY_FEATURES.find(c => c.id === categoryId);
  return category ? category.subcategories : [];
}

// Helper function to format feature for display
export function formatFeature(categoryName: string, subcategory: string): string {
  return `${categoryName}: ${subcategory}`;
}

// Helper function to parse formatted feature back to category and subcategory
export function parseFeature(formattedFeature: string): { category: string; subcategory: string } | null {
  const parts = formattedFeature.split(': ');
  if (parts.length !== 2) return null;
  
  const [categoryName, subcategory] = parts;
  const category = PROPERTY_FEATURES.find(c => c.name === categoryName);
  
  if (!category || !category.subcategories.includes(subcategory)) {
    return null;
  }
  
  return { category: categoryName, subcategory };
}